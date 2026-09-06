/**
 * Additive demo content for a non-production deployment.
 *
 * Creates places, opportunities and future-dated slots so a reviewer opening
 * the application finds something to search for and something to book.
 *
 * It never truncates and never deletes anything it did not create: every row
 * carries a deterministic id prefixed `demo-`, written with upsert, so running
 * it twice is the same as running it once. `--remove` deletes exactly those
 * rows and nothing else.
 *
 *   pnpm tsx scripts/seed-demo-content.ts --dry-run
 *   pnpm tsx scripts/seed-demo-content.ts
 *   pnpm tsx scripts/seed-demo-content.ts --remove
 *
 * Slot dates are relative to the run: each session repeats fortnightly out to
 * `--days` (default 90), so a run in September still has dates to book in
 * November. Running it again moves the whole schedule forward.
 *
 * Against the dev database:
 *
 *   dotenvx run -f .env.dev -- pnpm tsx scripts/seed-demo-content.ts
 *
 * The ENV gate below is fail-closed: production sets no ENV, so an unset or
 * unrecognised value refuses to run. `--force` overrides it deliberately.
 */
import "reflect-metadata";
import { prismaClient } from "@/infrastructure/prisma/client";
import {
  OpportunityCategory,
  PublishStatus,
  Role,
  MembershipStatus,
  WalletType,
  TicketStatus,
  TicketStatusReason,
  ReservationStatus,
  ParticipationStatus,
  ParticipationStatusReason,
  EvaluationStatus,
  CurrentPrefecture,
  MembershipStatusReason,
} from "@prisma/client";

const PREFIX = "demo-";


const NON_PRODUCTION_ENVS = ["LOCAL", "local", "dev", "development", "staging"];

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const optionValue = (name: string, fallback: string) => {
  const given = args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  return given && given.length > 0 ? given : fallback;
};

const DRY_RUN = hasFlag("--dry-run");
const REMOVE = hasFlag("--remove");
const FORCE = hasFlag("--force");
const COMMUNITY_ID = optionValue("community", "neo88");
/**
 * Every id this script writes, scoped to the community it belongs to.
 *
 * The prefix alone is not enough. `upsert` matches on the id, so seeding a
 * second community with unscoped ids would not create its own rows — it would
 * update the first community's and carry them across, and removing either
 * would take the other's with it.
 */
const idFor = (suffix: string) => `${PREFIX}${COMMUNITY_ID}-${suffix}`;

/**
 * How far ahead sessions are scheduled, and how often each one repeats. A
 * reviewer opening the application weeks after this ran still needs something
 * bookable, so each session below is a fortnightly series rather than a single
 * date, running to the horizon.
 */
const HORIZON_DAYS = Number(optionValue("days", "90"));
const REPEAT_EVERY_DAYS = 14;

if (!Number.isFinite(HORIZON_DAYS) || HORIZON_DAYS < 1) {
  console.error(`--days must be a positive number of days; got "${optionValue("days", "90")}".`);
  process.exit(1);
}

const day = 24 * 60 * 60 * 1000;
const at = (daysFromNow: number, hour: number) => {
  const d = new Date(Date.now() + daysFromNow * day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

type PlaceSeed = {
  key: string;
  name: string;
  address: string;
  cityCode: string;
  latitude: number;
  longitude: number;
};

const PLACES: PlaceSeed[] = [
  {
    key: "tokushima",
    name: "Indigo Workshop, Tokushima",
    address: "Tokushima-cho Jonai, Tokushima City, Tokushima",
    cityCode: "362018",
    latitude: 34.0703,
    longitude: 134.5549,
  },
  {
    key: "yoshinogawa",
    name: "Yoshino River Base",
    address: "Yamakawa-cho, Yoshinogawa City, Tokushima",
    cityCode: "362051",
    latitude: 34.0533,
    longitude: 134.3167,
  },
  {
    key: "takamatsu",
    name: "Takamatsu Community Kitchen",
    address: "Bancho, Takamatsu City, Kagawa",
    cityCode: "372013",
    latitude: 34.3428,
    longitude: 134.0466,
  },
  {
    key: "mitoyo",
    name: "Mitoyo Satoyama Field",
    address: "Yamamoto-cho, Mitoyo City, Kagawa",
    cityCode: "372081",
    latitude: 34.1836,
    longitude: 133.7139,
  },
  {
    key: "matsuyama",
    name: "Matsuyama Citrus Orchard",
    address: "Nakajima Oura, Matsuyama City, Ehime",
    cityCode: "382019",
    latitude: 33.9906,
    longitude: 132.8419,
  },
];

type OpportunitySeed = {
  key: string;
  placeKey: string;
  title: string;
  category: OpportunityCategory;
  description: string;
  body: string;
  feeRequired?: number;
  pointsToEarn?: number;
  requireApproval: boolean;
  slots: { inDays: number; startHour: number; endHour: number; capacity: number }[];
  /**
   * One session already held, so the member state below has something to hang a
   * completed participation on. Excluded from the fortnightly series.
   */
  pastSession?: { daysAgo: number; startHour: number; endHour: number; capacity: number };
};

/**
 * Every session repeats every REPEAT_EVERY_DAYS until HORIZON_DAYS. Base
 * offsets that differ by a multiple of the interval would otherwise land on
 * the same hour of the same day, so identical occurrences are dropped.
 */
function occurrencesOf(o: OpportunitySeed) {
  const seen = new Set<string>();
  const out: { inDays: number; startHour: number; endHour: number; capacity: number }[] = [];
  if (o.pastSession) {
    const { daysAgo, ...rest } = o.pastSession;
    out.push({ ...rest, inDays: -daysAgo });
    seen.add(`${-daysAgo}-${rest.startHour}-${rest.endHour}`);
  }
  for (const s of o.slots) {
    for (let d = s.inDays; d <= HORIZON_DAYS; d += REPEAT_EVERY_DAYS) {
      const key = `${d}-${s.startHour}-${s.endHour}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...s, inDays: d });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays || a.startHour - b.startHour);
}

const OPPORTUNITIES: OpportunitySeed[] = [
  {
    key: "aizome",
    placeKey: "tokushima",
    title: "Dye a handkerchief with Tokushima indigo",
    category: OpportunityCategory.ACTIVITY,
    description:
      "Two hours dyeing a piece of your own with the indigo Tokushima has grown for centuries. Nothing to bring.",
    body: "We start with how the indigo vat is prepared and fermented, then you choose a tie-dye pattern and dye a handkerchief. You take your piece home the same day. Wear clothes you do not mind staining.",
    feeRequired: 3500,
    requireApproval: false,
    pastSession: { daysAgo: 14, startHour: 10, endHour: 12, capacity: 8 },
    slots: [
      { inDays: 7, startHour: 10, endHour: 12, capacity: 8 },
      { inDays: 14, startHour: 10, endHour: 12, capacity: 8 },
      { inDays: 21, startHour: 14, endHour: 16, capacity: 6 },
    ],
  },
  {
    key: "udon",
    placeKey: "takamatsu",
    title: "Make Sanuki udon by hand, and hear about the town",
    category: OpportunityCategory.ACTIVITY,
    description:
      "Mix it, knead it, cut it, eat it. Udon is the way in; the conversation is about Takamatsu.",
    body: "You make the dough from flour, knead it underfoot, rest it and cut the noodles yourself, then eat what you made straight from the pot. Aprons are provided.",
    feeRequired: 2800,
    requireApproval: false,
    slots: [
      { inDays: 5, startHour: 11, endHour: 13, capacity: 10 },
      { inDays: 12, startHour: 11, endHour: 13, capacity: 10 },
    ],
  },
  {
    key: "mikan",
    placeKey: "matsuyama",
    title: "Help a citrus grower through the harvest",
    category: OpportunityCategory.ACTIVITY,
    description:
      "Half a morning of the busiest weeks of the grower's year. Eat as much as you like in the grove afterwards.",
    body: "The grove is on a slope. You will cut fruit with shears and carry crates. Wear clothes you can move in and shoes that grip. Gloves and shears are lent to you.",
    pointsToEarn: 500,
    requireApproval: true,
    slots: [
      { inDays: 10, startHour: 9, endHour: 12, capacity: 5 },
      { inDays: 17, startHour: 9, endHour: 12, capacity: 5 },
    ],
  },
  {
    key: "sup",
    placeKey: "yoshinogawa",
    title: "Stand-up paddleboarding on the Yoshino River",
    category: OpportunityCategory.ACTIVITY,
    description:
      "A slow stretch of the river, and enough time to get you standing on your first try. Life jacket included.",
    body: "We practise on land before going out on the water. You do not need to be able to swim, but bring clothes you can get wet in and a change afterwards. If the river is high we cancel and let you know.",
    feeRequired: 5000,
    requireApproval: false,
    slots: [
      { inDays: 9, startHour: 9, endHour: 11, capacity: 6 },
      { inDays: 16, startHour: 13, endHour: 15, capacity: 6 },
    ],
  },
  {
    key: "satoyama",
    placeKey: "mitoyo",
    title: "Clear a mountain path back into use",
    category: OpportunityCategory.QUEST,
    description:
      "A path through the hills has grown over. Cutting it back makes it walkable again, and earns points.",
    body: "If you can handle a brush cutter, bringing one helps. First-timers work with a sickle. Long sleeves, long trousers and a hat.",
    pointsToEarn: 800,
    requireApproval: true,
    slots: [
      { inDays: 8, startHour: 9, endHour: 12, capacity: 12 },
      { inDays: 22, startHour: 9, endHour: 12, capacity: 12 },
    ],
  },
];

/**
 * `src/messages/` carries `en` and `ja` catalogues, but neither has an
 * `opportunities.json`: the opportunity and reservation screens are hardcoded
 * Japanese. The body text is the one thing on those screens this script
 * controls, so each one ends with a short English guide that names the
 * Japanese labels the reader is looking at. The section clamps to six lines
 * behind a "read more", so this stays brief.
 */
function reviewerGuide(o: OpportunitySeed) {
  const lines = [
    "— Booking this —",
    "The buttons here are in Japanese. Choose a date under 日時 (date and time), set 参加人数 (how many people), then tap 申し込む (Apply).",
    o.requireApproval
      ? "案内人が承認すると、予約が確定します — the host has to approve before this booking is confirmed."
      : "No host approval is needed; applying confirms it.",
  ];
  if (o.feeRequired) {
    lines.push(
      "料金は現地でお支払いください — the fee is paid on the day. Nothing is charged in the app.",
    );
  }
  if (o.pointsToEarn) {
    lines.push(`獲得予定ポイント数 — taking part earns ${o.pointsToEarn} community points.`);
  }
  lines.push(
    "— Managing it —",
    "You are signed in with owner rights on this community, so this listing is yours to operate even though a demonstration host created it.",
    "/admin/opportunities edits the listing and its dates. /admin/reservations is where 申込を承認する approves an application; declining and cancelling a session are there too.",
  );
  return lines.join("\n");
}

function assertNonProduction() {
  const env = process.env.ENV;
  if (FORCE) {
    console.warn(`! --force given; running against ENV=${env ?? "(unset)"}`);
    return;
  }
  if (!env || !NON_PRODUCTION_ENVS.includes(env)) {
    console.error(
      `Refusing to run: ENV is ${env ?? "unset"}, which is not one of ${NON_PRODUCTION_ENVS.join(", ")}.\n` +
        `Production sets no ENV, so this gate is fail-closed. Pass --force to override deliberately.`,
    );
    process.exit(1);
  }
  console.info(`ENV=${env}`);
}

/**
 * The `demo-` prefix alone is not enough to scope a delete: the same script run
 * against two communities writes the same ids under each, so every query here
 * is also constrained to COMMUNITY_ID. Slots carry no community of their own
 * and are reached through their opportunity.
 */
const demoRowsOfThisCommunity = { id: { startsWith: PREFIX }, communityId: COMMUNITY_ID };
const demoSlotsOfThisCommunity = {
  id: { startsWith: PREFIX },
  opportunity: { communityId: COMMUNITY_ID },
};

async function remove() {
  // Tickets reference a utility with Restrict, so they go first. Deleting a
  // reservation cascades to its participation, and that to its evaluation.
  const tickets = await prismaClient.ticket.deleteMany({
    where: { id: { startsWith: PREFIX }, utility: { communityId: COMMUNITY_ID } },
  });
  const utilities = await prismaClient.utility.deleteMany({ where: demoRowsOfThisCommunity });
  const reservations = await prismaClient.reservation.deleteMany({
    where: {
      id: { startsWith: PREFIX },
      opportunitySlot: { opportunity: { communityId: COMMUNITY_ID } },
    },
  });
  const slots = await prismaClient.opportunitySlot.deleteMany({
    where: demoSlotsOfThisCommunity,
  });
  const opportunities = await prismaClient.opportunity.deleteMany({
    where: demoRowsOfThisCommunity,
  });
  const places = await prismaClient.place.deleteMany({ where: demoRowsOfThisCommunity });
  // Last: the opportunities and evaluations naming this user as their host are
  // gone by now, and the membership goes with the user.
  const hosts = await prismaClient.user.deleteMany({
    where: { id: idFor("host") },
  });
  console.info(
    `Removed ${tickets.count} tickets, ${utilities.count} utilities, ` +
      `${reservations.count} bookings, ${slots.count} slots, ` +
      `${opportunities.count} opportunities, ${places.count} places, ` +
      `${hosts.count} host user from "${COMMUNITY_ID}".`,
  );
}

async function resolveCommunity() {
  const community = await prismaClient.community.findUnique({ where: { id: COMMUNITY_ID } });
  if (community) return community;

  console.error(
    `Community "${COMMUNITY_ID}" not found. Pass --community=<id>; the communities present are:`,
  );
  const all = await prismaClient.community.findMany({ select: { id: true, name: true } });
  all.forEach((c) => console.error(`  ${c.id}  ${c.name}`));
  process.exit(1);
}

/**
 * The opportunities need an owning user, and neither obvious candidate works.
 * A real community member would have their name shown as the host of five
 * invented experiences. The shared demo account would make the reviewer the
 * host of everything they are looking at: "look at another resident's profile"
 * would open their own, and every evaluation would be self-awarded.
 *
 * So the host is a third party seeded here — a member of this community who is
 * nobody real, and who is not the account the reviewer signs in as. It carries
 * no identity row, so it cannot sign in.
 */
async function resolveHostUserId() {
  // Community-scoped, for the same reason the deletes above are: seeding two
  // communities would otherwise share one User row, and removing either would
  // cascade the other's host membership away with it.
  const id = idFor("host");
  const user = {
    name: "Demo Host",
    slug: idFor("host"),
    bio: "Runs the demonstration experiences on this development deployment.",
    currentPrefecture: CurrentPrefecture.TOKUSHIMA,
  };
  await prismaClient.user.upsert({ where: { id }, update: user, create: { id, ...user } });

  const membership = {
    status: MembershipStatus.JOINED,
    reason: MembershipStatusReason.ASSIGNED,
    role: Role.MANAGER,
    headline: "Demonstration host",
  };
  await prismaClient.membership.upsert({
    where: { userId_communityId: { userId: id, communityId: COMMUNITY_ID } },
    update: membership,
    create: { userId: id, communityId: COMMUNITY_ID, ...membership },
  });

  console.info(`Host user: ${user.name} (${id})`);
  return id;
}

/**
 * Image URLs must be on a host the portal's next.config allow-list admits, so
 * inventing new ones would render as broken images. Reuse rows that exist.
 */
async function pickImageIds() {
  const images = await prismaClient.image.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: OPPORTUNITIES.length,
    select: { id: true },
  });
  if (images.length === 0) {
    console.warn("! No public image rows found — opportunities will be created without images.");
  } else if (images.length < OPPORTUNITIES.length) {
    console.warn(`! Only ${images.length} image rows available; some will be shared or omitted.`);
  }
  return images.map((i) => i.id);
}

/**
 * The shared demo account only exists once someone has opened the development
 * deployment: `devProvisionAnonymousUser` creates the identity, the membership
 * and the wallet on first sign-in. Reproducing that here would duplicate logic
 * that has to stay in step with the login path, so this looks the account up
 * and says what to do when it is not there yet.
 */
async function resolveDemoMember() {
  const identity = await prismaClient.identity.findUnique({
    where: { uid_communityId: { uid: `dev-anon-shared-${COMMUNITY_ID}`, communityId: COMMUNITY_ID } },
    select: { userId: true },
  });
  if (!identity) return null;

  const wallet = await prismaClient.wallet.findFirst({
    where: { userId: identity.userId, communityId: COMMUNITY_ID, type: WalletType.MEMBER },
    select: { id: true },
  });
  return { userId: identity.userId, walletId: wallet?.id ?? null };
}

/** The two aizome sessions the member state hangs on: the one already held, and the next one. */
async function resolveAizomeSlots() {
  const slots = await prismaClient.opportunitySlot.findMany({
    where: { opportunityId: idFor("opp-aizome") },
    orderBy: { startsAt: "asc" },
    select: { id: true, startsAt: true },
  });
  const now = new Date();
  return {
    past: slots.find((s) => s.startsAt < now)?.id ?? null,
    upcoming: slots.find((s) => s.startsAt >= now)?.id ?? null,
  };
}

/**
 * State that belongs to the demo account rather than to the community: a ticket
 * to spend, a booking waiting for the host to approve, and a session already
 * attended and passed.
 *
 * The evaluation is written as PASSED with no issuance request, which is what
 * /admin/credentials lists as awaiting issuance — the credential itself is
 * issued through that screen, by the pipeline that anchors and signs it.
 * Points are not written here: a balance is a view over the ledger, and the
 * ledger is the application's to write.
 */
async function writeMemberState(hostUserId: string) {
  const member = await resolveDemoMember();
  if (!member) {
    console.warn(
      `! No shared demo account in "${COMMUNITY_ID}" yet — open the development ` +
        `deployment once so it is created, then run this again to add the ticket, ` +
        `the booking and the completed session.`,
    );
    return;
  }

  const utilityId = idFor("utility-daypass");
  const utility = {
    name: "Day pass",
    description: "Covers one session at any of the demo experiences.",
    pointsRequired: 500,
    communityId: COMMUNITY_ID,
    ownerId: hostUserId,
  };
  await prismaClient.utility.upsert({
    where: { id: utilityId },
    update: utility,
    create: { id: utilityId, ...utility },
  });

  if (member.walletId) {
    const ticketId = idFor("ticket-daypass");
    const ticket = {
      status: TicketStatus.AVAILABLE,
      reason: TicketStatusReason.GIFTED,
      walletId: member.walletId,
      utilityId,
    };
    await prismaClient.ticket.upsert({
      where: { id: ticketId },
      update: ticket,
      create: { id: ticketId, ...ticket },
    });
  } else {
    console.warn("! The demo account has no member wallet; skipping the ticket.");
  }

  const { past, upcoming } = await resolveAizomeSlots();

  if (upcoming) {
    await writeBooking({
      key: "applied",
      slotId: upcoming,
      userId: member.userId,
      reservationStatus: ReservationStatus.APPLIED,
      participationStatus: ParticipationStatus.PENDING,
      reason: ParticipationStatusReason.RESERVATION_APPLIED,
    });
  }

  if (past) {
    const { participationId } = await writeBooking({
      key: "attended",
      slotId: past,
      userId: member.userId,
      reservationStatus: ReservationStatus.ACCEPTED,
      participationStatus: ParticipationStatus.PARTICIPATED,
      reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
    });
    const evaluationId = idFor("eval-attended");
    const evaluation = {
      status: EvaluationStatus.PASSED,
      comment: "Attended and completed the session.",
      participationId,
      evaluatorId: hostUserId,
    };
    await prismaClient.evaluation.upsert({
      where: { id: evaluationId },
      update: evaluation,
      create: { id: evaluationId, ...evaluation },
    });
  }

  console.info("Member state: 1 utility, 1 ticket, 2 bookings, 1 passed evaluation.");
}

async function writeBooking(b: {
  key: string;
  slotId: string;
  userId: string;
  reservationStatus: ReservationStatus;
  participationStatus: ParticipationStatus;
  reason: ParticipationStatusReason;
}) {
  const reservationId = idFor(`resv-${b.key}`);
  const reservation = {
    opportunitySlotId: b.slotId,
    status: b.reservationStatus,
    // Nobody paid with points here, and this count is what a cancellation
    // multiplies by pointsRequired to work out the refund.
    participantCountWithPoint: 0,
    createdBy: b.userId,
  };
  await prismaClient.reservation.upsert({
    where: { id: reservationId },
    update: reservation,
    create: { id: reservationId, ...reservation },
  });

  const historyId = idFor(`resv-hist-${b.key}`);
  const history = { reservationId, status: b.reservationStatus, createdBy: b.userId };
  await prismaClient.reservationHistory.upsert({
    where: { id: historyId },
    update: history,
    create: { id: historyId, ...history },
  });

  const participationId = idFor(`part-${b.key}`);
  const participation = {
    status: b.participationStatus,
    reason: b.reason,
    userId: b.userId,
    opportunitySlotId: b.slotId,
    reservationId,
    communityId: COMMUNITY_ID,
  };
  await prismaClient.participation.upsert({
    where: { id: participationId },
    update: participation,
    create: { id: participationId, ...participation },
  });

  const partHistoryId = idFor(`part-hist-${b.key}`);
  const partHistory = {
    participationId,
    status: b.participationStatus,
    reason: b.reason,
    createdBy: b.userId,
  };
  await prismaClient.participationStatusHistory.upsert({
    where: { id: partHistoryId },
    update: partHistory,
    create: { id: partHistoryId, ...partHistory },
  });

  return { reservationId, participationId };
}

function printPlan() {
  console.info(
    `\nWould write ${PLACES.length} places and ${OPPORTUNITIES.length} opportunities, ` +
      `plus a utility, a ticket, two bookings and one passed evaluation for the ` +
      `shared demo account:`,
  );
  for (const o of OPPORTUNITIES) {
    const occurrences = occurrencesOf(o);
    const id = idFor(`opp-${o.key}`);
    console.info(`  ${id}  ${o.title}  (${occurrences.length} sessions)`);
    for (const s of occurrences) {
      const starts = at(s.inDays, s.startHour).toISOString();
      const ends = at(s.inDays, s.endHour).toISOString();
      console.info(`    ${starts} → ${ends}  capacity ${s.capacity}`);
    }
  }
}

async function writePlaces() {
  for (const p of PLACES) {
    const id = idFor(`place-${p.key}`);
    const data = {
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      isManual: true,
      cityCode: p.cityCode,
      communityId: COMMUNITY_ID,
    };
    await prismaClient.place.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.info(`Places: ${PLACES.length} written.`);
}

async function writeSlots(opportunityId: string, o: OpportunitySeed) {
  const written: string[] = [];
  for (const [slotIndex, s] of occurrencesOf(o).entries()) {
    const id = idFor(`slot-${o.key}-${slotIndex}`);
    const data = {
      opportunityId,
      startsAt: at(s.inDays, s.startHour),
      endsAt: at(s.inDays, s.endHour),
      capacity: s.capacity,
    };
    await prismaClient.opportunitySlot.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    written.push(id);
  }
  // A shorter horizon than a previous run would leave its extra sessions
  // behind, dated in the past. Only this opportunity's demo slots are touched.
  await prismaClient.opportunitySlot.deleteMany({
    where: { opportunityId, id: { startsWith: PREFIX }, NOT: { id: { in: written } } },
  });
  return written.length;
}

async function writeOpportunities(hostUserId: string, imageIds: string[]) {
  let slotCount = 0;
  for (const [index, o] of OPPORTUNITIES.entries()) {
    const id = idFor(`opp-${o.key}`);
    const imageId = imageIds.length > 0 ? imageIds[index % imageIds.length] : undefined;
    const data = {
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: o.requireApproval,
      // Marked in the title so a reviewer can tell seeded content from the
      // community's own at a glance, in lists and in search results alike.
      title: `[Demo] ${o.title}`,
      category: o.category,
      description: o.description,
      body: `${o.body}\n\n${reviewerGuide(o)}`,
      feeRequired: o.feeRequired ?? null,
      pointsToEarn: o.pointsToEarn ?? null,
      communityId: COMMUNITY_ID,
      placeId: idFor(`place-${o.placeKey}`),
      createdBy: hostUserId,
    };
    await prismaClient.opportunity.upsert({
      where: { id },
      update: { ...data, ...(imageId ? { images: { set: [{ id: imageId }] } } : {}) },
      create: { id, ...data, ...(imageId ? { images: { connect: [{ id: imageId }] } } : {}) },
    });
    slotCount += await writeSlots(id, o);
  }
  console.info(`Opportunities: ${OPPORTUNITIES.length} written, ${slotCount} slots.`);
}

async function removeWithDryRun() {
  if (!DRY_RUN) {
    await remove();
    return;
  }
  const n = await prismaClient.opportunity.count({ where: demoRowsOfThisCommunity });
  console.info(
    `Would remove ${n} opportunities and their places and slots from "${COMMUNITY_ID}".`,
  );
}

async function main() {
  assertNonProduction();

  if (REMOVE) {
    await removeWithDryRun();
    return;
  }

  const community = await resolveCommunity();
  console.info(`Community: ${community.name} (${community.id})`);
  const hostUserId = await resolveHostUserId();
  const imageIds = await pickImageIds();

  if (DRY_RUN) {
    printPlan();
    return;
  }

  await writePlaces();
  await writeOpportunities(hostUserId, imageIds);
  await writeMemberState(hostUserId);
}

main()
  .then(() => console.info("Done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
