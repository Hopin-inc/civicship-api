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
 * Against the dev database:
 *
 *   dotenvx run -f .env.dev -- pnpm tsx scripts/seed-demo-content.ts
 *
 * The ENV gate below is fail-closed: production sets no ENV, so an unset or
 * unrecognised value refuses to run. `--force` overrides it deliberately.
 */
import "reflect-metadata";
import { prismaClient } from "@/infrastructure/prisma/client";
import { OpportunityCategory, PublishStatus, Role, MembershipStatus } from "@prisma/client";

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
};

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
    "The host's side is under /admin/reservations: 申込を承認する approves an application, and declining and cancelling a session are there too.",
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
  const slots = await prismaClient.opportunitySlot.deleteMany({
    where: demoSlotsOfThisCommunity,
  });
  const opportunities = await prismaClient.opportunity.deleteMany({
    where: demoRowsOfThisCommunity,
  });
  const places = await prismaClient.place.deleteMany({ where: demoRowsOfThisCommunity });
  console.info(
    `Removed ${slots.count} slots, ${opportunities.count} opportunities, ${places.count} places from "${COMMUNITY_ID}".`,
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

async function resolveHostUserId() {
  const host = await prismaClient.membership.findFirst({
    where: {
      communityId: COMMUNITY_ID,
      status: MembershipStatus.JOINED,
      role: { in: [Role.OWNER, Role.MANAGER] },
      NOT: { user: { identities: { some: { uid: { startsWith: "dev-anon-" } } } } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { userId: true, user: { select: { name: true } } },
  });
  if (!host) {
    console.error(
      `No OWNER or MANAGER membership found in "${COMMUNITY_ID}". ` +
        `The opportunities need an owning user; create one first.`,
    );
    process.exit(1);
  }
  console.info(`Host user: ${host.user?.name ?? host.userId}`);
  return host.userId;
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

function printPlan() {
  console.info(`\nWould write ${PLACES.length} places and ${OPPORTUNITIES.length} opportunities:`);
  for (const o of OPPORTUNITIES) {
    console.info(`  ${PREFIX}opp-${o.key}  ${o.title}`);
    for (const s of o.slots) {
      const starts = at(s.inDays, s.startHour).toISOString();
      const ends = at(s.inDays, s.endHour).toISOString();
      console.info(`    ${starts} → ${ends}  capacity ${s.capacity}`);
    }
  }
}

async function writePlaces() {
  for (const p of PLACES) {
    const id = `${PREFIX}place-${p.key}`;
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
  for (const [slotIndex, s] of o.slots.entries()) {
    const id = `${PREFIX}slot-${o.key}-${slotIndex}`;
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
  }
}

async function writeOpportunities(hostUserId: string, imageIds: string[]) {
  for (const [index, o] of OPPORTUNITIES.entries()) {
    const id = `${PREFIX}opp-${o.key}`;
    const imageId = imageIds.length > 0 ? imageIds[index % imageIds.length] : undefined;
    const data = {
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: o.requireApproval,
      title: o.title,
      category: o.category,
      description: o.description,
      body: `${o.body}\n\n${reviewerGuide(o)}`,
      feeRequired: o.feeRequired ?? null,
      pointsToEarn: o.pointsToEarn ?? null,
      communityId: COMMUNITY_ID,
      placeId: `${PREFIX}place-${o.placeKey}`,
      createdBy: hostUserId,
    };
    await prismaClient.opportunity.upsert({
      where: { id },
      update: { ...data, ...(imageId ? { images: { set: [{ id: imageId }] } } : {}) },
      create: { id, ...data, ...(imageId ? { images: { connect: [{ id: imageId }] } } : {}) },
    });
    await writeSlots(id, o);
  }
  const slotCount = OPPORTUNITIES.reduce((n, o) => n + o.slots.length, 0);
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
}

main()
  .then(() => console.info("Done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
