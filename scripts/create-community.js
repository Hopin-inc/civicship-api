import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// ES Modules では __dirname が使えないので代替手段を使用
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
dotenv.config({ path: join(__dirname, "../.env") });

// コミュニティ作成のためのクラス
class CommunityCreator {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // メイン処理
  async createCommunity(communityId, adminName = null, adminEmail = null) {
    console.info(`🚀 ${communityId} コミュニティの作成を開始します...`);

    try {
      // コミュニティの作成
      const community = await this.createCommunityEntity(communityId);
      console.info(`✅ コミュニティを作成しました: ${community.id}`);

      // ユーザーとウォレット、メンバーシップの作成
      const { users, wallets } = await this.createUsersWithWallets(
        community,
        adminName,
        adminEmail,
      );
      console.info(`✅ ユーザー、ウォレット、メンバーシップを作成しました`);

      console.info(`🎉 ${communityId} コミュニティの作成が完了しました！`);
      return { community, users, wallets };
    } catch (error) {
      console.error(`❌ エラーが発生しました: ${error.message}`);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  // コミュニティエンティティの作成
  async createCommunityEntity(id) {
    return await this.prisma.community.create({
      data: {
        id,
        name: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // ユーザーとウォレット、メンバーシップの作成
  async createUsersWithWallets(community, adminName = null, adminEmail = null) {
    // 管理者ユーザーを1人作成
    const adminUser = await this.prisma.user.create({
      data: {
        name: adminName || `Admin for ${community.id}`,
        email: adminEmail || `admin@${community.id}.example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 管理者ウォレットの作成
    const adminWallet = await this.prisma.wallet.create({
      data: {
        userId: adminUser.id,
        communityId: community.id,
        type: "Personal",
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 管理者メンバーシップの作成
    await this.prisma.membership.create({
      data: {
        userId: adminUser.id,
        communityId: community.id,
        status: "Active",
        role: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      users: [adminUser],
      wallets: [adminWallet],
    };
  }
}

// コマンドライン引数の処理
async function main() {
  const args = process.argv.slice(2);
  const communityCreator = new CommunityCreator();

  if (args.length === 0) {
    console.error(
      "コミュニティIDを指定してください。例: node create-community.js kibotcha [adminName] [adminEmail]",
    );
    process.exit(1);
  }

  const communityId = args[0];
  const adminName = args[1] || null; // 管理者名（オプション）
  const adminEmail = args[2] || null; // 管理者メールアドレス（オプション）

  // メールアドレスの形式を検証
  if (adminEmail && !isValidEmail(adminEmail)) {
    console.error("無効なメールアドレス形式です。正しいメールアドレスを入力してください。");
    process.exit(1);
  }

  try {
    await communityCreator.createCommunity(communityId, adminName, adminEmail);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// メールアドレスの形式を検証する関数
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

main();
