import { messagingApi } from "@line/bot-sdk";

export interface CertificateIssuedParams {
  title: string;
  year: string;
  issueDate: string;
  issuerName: string;
  redirectUrl: string;
}

export function buildCertificateIssuedMessage(
  params: CertificateIssuedParams,
): messagingApi.FlexMessage {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: buildBody(params),
    footer: buildFooter(params.redirectUrl),
  };

  return {
    type: "flex",
    altText: `「${params.title}」の証明書が付与されました🎓`,
    contents: bubble,
  };
}

function buildBody(params: CertificateIssuedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    paddingStart: "xl",
    paddingEnd: "xl",
    spacing: "sm",
    contents: [
      buildTitle(),
      buildCertificateInfo(params),
      buildCertificateDetailTable(params),
      buildExplainMessage(),
    ],
  };
}

function buildTitle(): messagingApi.FlexText {
  return {
    type: "text",
    text: "新規証明書の付与",
    size: "xs",
    color: "#1DB446",
    weight: "bold",
  };
}

function buildCertificateInfo(params: CertificateIssuedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "md",
    contents: [
      {
        type: "text",
        text: params.title,
        size: "lg",
        weight: "bold",
        wrap: true,
        color: "#333333",
      },
    ],
  };
}

function buildCertificateDetailTable(params: CertificateIssuedParams): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "lg",
    spacing: "md",
    backgroundColor: "#F7F7F7",
    cornerRadius: "md",
    paddingAll: "xl",
    contents: [
      {
        type: "box",
        layout: "baseline",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "発行日",
            color: "#555555",
            size: "sm",
            flex: 2,
          },
          {
            type: "text",
            text: params.issueDate,
            wrap: true,
            color: "#111111",
            size: "sm",
            flex: 5,
          },
        ],
      },
      {
        type: "box",
        layout: "baseline",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: "主催者",
            color: "#555555",
            size: "sm",
            flex: 2,
          },
          {
            type: "text",
            text: params.issuerName,
            wrap: true,
            color: "#111111",
            size: "sm",
            flex: 5,
          },
        ],
      },
    ],
  };
}

function buildExplainMessage(): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    paddingTop: "xl",
    paddingBottom: "xl",
    contents: [
      {
        type: "text",
        contents: [
          {
            type: "span",
            text: "あなたの活動に対して新しく証明書が発行されました",
            color: "#111111",
          },
        ],
        size: "sm",
        wrap: true,
      },
      {
        type: "text",
        text: "※「証明書を見る」ボタンから内容を確認できます。",
        size: "xs",
        color: "#999999",
        wrap: true,
      },
    ],
  };
}

function buildFooter(redirectUrl: string): messagingApi.FlexBox {
  return {
    type: "box",
    layout: "vertical",
    margin: "xxl",
    contents: [
      {
        type: "button",
        style: "link",
        action: {
          type: "uri",
          label: "証明書を見る",
          uri: redirectUrl,
        },
      },
    ],
  };
}
