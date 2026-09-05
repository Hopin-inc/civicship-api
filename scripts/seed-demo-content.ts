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
const has = (flag: string) => args.includes(flag);
const valueOf = (name: string, fallback: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

const DRY_RUN = has("--dry-run");
const REMOVE = has("--remove");
const FORCE = has("--force");
const COMMUNITY_ID = valueOf("community", "neo88");

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
    name: "藍の里 工房",
    address: "徳島県徳島市徳島町城内",
    cityCode: "362018",
    latitude: 34.0703,
    longitude: 134.5549,
  },
  {
    key: "yoshinogawa",
    name: "吉野川リバーベース",
    address: "徳島県吉野川市山川町",
    cityCode: "362051",
    latitude: 34.0533,
    longitude: 134.3167,
  },
  {
    key: "takamatsu",
    name: "高松 まちなか交流スペース",
    address: "香川県高松市番町",
    cityCode: "372013",
    latitude: 34.3428,
    longitude: 134.0466,
  },
  {
    key: "mitoyo",
    name: "三豊 里山フィールド",
    address: "香川県三豊市山本町",
    cityCode: "372081",
    latitude: 34.1836,
    longitude: 133.7139,
  },
  {
    key: "matsuyama",
    name: "松山 みかん農園",
    address: "愛媛県松山市中島大浦",
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
    title: "藍染めのハンカチをつくる",
    category: OpportunityCategory.ACTIVITY,
    description: "徳島の藍で、自分だけの一枚を染め上げる2時間。手ぶらで参加できます。",
    body: "藍甕（あいがめ）の仕込みの話を聞いてから、絞り方を選んでハンカチを染めます。染めた作品はその日に持ち帰れます。汚れてもよい服装でお越しください。",
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
    title: "手打ちうどん体験と、まちの話",
    category: OpportunityCategory.ACTIVITY,
    description: "粉から打って、茹でて、食べる。うどんを入口に高松のまちの話も聞けます。",
    body: "小麦粉から生地をつくり、足踏み、寝かせ、切りまで一通り体験します。打ったうどんはその場で釜あげにして食べます。エプロンはこちらで用意します。",
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
    title: "みかん農家の収穫を手伝う",
    category: OpportunityCategory.ACTIVITY,
    description: "収穫期の忙しい半日を一緒に。作業のあとは畑でみかんを食べて帰れます。",
    body: "傾斜地の畑で、はさみを使った収穫とコンテナ運びをお願いします。動きやすい服装と滑りにくい靴でお越しください。軍手とはさみは貸し出します。",
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
    title: "吉野川でSUPに乗る",
    category: OpportunityCategory.ACTIVITY,
    description: "流れのゆるい区間で、はじめてでも立てるところまで。ライフジャケット付き。",
    body: "陸上での練習のあと、川に出ます。泳げなくても参加できますが、濡れてもよい服装と着替えをお持ちください。増水時は中止の連絡をします。",
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
    title: "里山の道を刈りひらく",
    category: OpportunityCategory.QUEST,
    description: "使われなくなった山道を歩けるように戻す作業。ポイントが付きます。",
    body: "草刈り機の使える方は持参いただけると助かります。はじめての方には鎌での作業をお願いします。長袖・長ズボン・帽子でお越しください。",
    pointsToEarn: 800,
    requireApproval: true,
    slots: [
      { inDays: 8, startHour: 9, endHour: 12, capacity: 12 },
      { inDays: 22, startHour: 9, endHour: 12, capacity: 12 },
    ],
  },
];

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

async function remove() {
  const slots = await prismaClient.opportunitySlot.deleteMany({
    where: { id: { startsWith: PREFIX } },
  });
  const opportunities = await prismaClient.opportunity.deleteMany({
    where: { id: { startsWith: PREFIX } },
  });
  const places = await prismaClient.place.deleteMany({ where: { id: { startsWith: PREFIX } } });
  console.info(
    `Removed ${slots.count} slots, ${opportunities.count} opportunities, ${places.count} places.`,
  );
}

async function main() {
  assertNonProduction();

  if (REMOVE) {
    if (DRY_RUN) {
      const n = await prismaClient.opportunity.count({ where: { id: { startsWith: PREFIX } } });
      console.info(`Would remove ${n} opportunities and their places and slots.`);
      return;
    }
    await remove();
    return;
  }

  const community = await prismaClient.community.findUnique({ where: { id: COMMUNITY_ID } });
  if (!community) {
    console.error(
      `Community "${COMMUNITY_ID}" not found. Pass --community=<id>; the communities present are:`,
    );
    const all = await prismaClient.community.findMany({ select: { id: true, name: true } });
    all.forEach((c) => console.error(`  ${c.id}  ${c.name}`));
    process.exit(1);
  }

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
  console.info(`Community: ${community.name} (${community.id})`);
  console.info(`Host user: ${host.user?.name ?? host.userId}`);

  // Reuse image rows that already exist. Image URLs must be on a host the
  // portal's next.config allow-list admits, so inventing new ones would
  // render as broken images.
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

  if (DRY_RUN) {
    console.info(`\nWould write ${PLACES.length} places and ${OPPORTUNITIES.length} opportunities:`);
    OPPORTUNITIES.forEach((o) => {
      console.info(`  ${PREFIX}opp-${o.key}  ${o.title}`);
      o.slots.forEach((s) =>
        console.info(
          `    ${at(s.inDays, s.startHour).toISOString()} → ${at(s.inDays, s.endHour).toISOString()}  capacity ${s.capacity}`,
        ),
      );
    });
    return;
  }

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

  for (const [index, o] of OPPORTUNITIES.entries()) {
    const id = `${PREFIX}opp-${o.key}`;
    const imageId = images[index % Math.max(images.length, 1)]?.id;
    const data = {
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: o.requireApproval,
      title: o.title,
      category: o.category,
      description: o.description,
      body: o.body,
      feeRequired: o.feeRequired ?? null,
      pointsToEarn: o.pointsToEarn ?? null,
      communityId: COMMUNITY_ID,
      placeId: `${PREFIX}place-${o.placeKey}`,
      createdBy: host.userId,
    };
    await prismaClient.opportunity.upsert({
      where: { id },
      update: { ...data, ...(imageId ? { images: { set: [{ id: imageId }] } } : {}) },
      create: { id, ...data, ...(imageId ? { images: { connect: [{ id: imageId }] } } : {}) },
    });

    for (const [slotIndex, s] of o.slots.entries()) {
      const slotId = `${PREFIX}slot-${o.key}-${slotIndex}`;
      const slotData = {
        opportunityId: id,
        startsAt: at(s.inDays, s.startHour),
        endsAt: at(s.inDays, s.endHour),
        capacity: s.capacity,
      };
      await prismaClient.opportunitySlot.upsert({
        where: { id: slotId },
        update: slotData,
        create: { id: slotId, ...slotData },
      });
    }
  }
  const slotCount = OPPORTUNITIES.reduce((n, o) => n + o.slots.length, 0);
  console.info(`Opportunities: ${OPPORTUNITIES.length} written, ${slotCount} slots.`);
}

main()
  .then(() => console.info("Done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
