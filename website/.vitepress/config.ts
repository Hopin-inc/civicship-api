import { defineConfig } from "vitepress";

// 公開サイト: https://hopin-inc.github.io/civicship-api/
//
// このサイトのソースは website/ 配下の Markdown のみ。
// 社内向けの docs/（handbook, runbooks, report など）は対象外なので、
// 内部資料が誤って公開されることはない。
export default defineConfig({
  lang: "ja-JP",
  title: "civicship ドキュメント",
  description: "civicship を導入する団体向けのガイド",

  // GitHub Pages のプロジェクトサイト（/<repo>/ 配下）で配信するため base を指定。
  base: "/civicship-api/",

  // 内部資料が website/ に混ざってもビルド対象に含めない保険。
  srcExclude: ["**/README.md"],

  themeConfig: {
    nav: [
      { text: "ホーム", link: "/" },
      { text: "コミュニティ立ち上げ", link: "/guides/community-onboarding" },
    ],
    sidebar: [
      {
        text: "ガイド",
        items: [
          { text: "コミュニティを立ち上げる", link: "/guides/community-onboarding" },
        ],
      },
    ],
    outline: { label: "このページの内容", level: [2, 3] },
    docFooter: { prev: false, next: false },
  },
});
