export interface CustomPropsV1 {
  propsVersion: 1;
  nftMintId?: string;
  nftWalletId?: string;
  userRef?: string;
  orderId?: string;
  orderItemId?: string;
  nftInstanceId?: string;
  receiverAddress?: string;
}

function isValidCustomPropsV1(obj: any): obj is CustomPropsV1 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    obj.propsVersion === 1 &&
    (obj.nftMintId === undefined || typeof obj.nftMintId === 'string') &&
    (obj.nftWalletId === undefined || typeof obj.nftWalletId === 'string') &&
    (obj.userRef === undefined || typeof obj.userRef === 'string') &&
    (obj.orderId === undefined || typeof obj.orderId === 'string') &&
    (obj.orderItemId === undefined || typeof obj.orderItemId === 'string') &&
    (obj.nftInstanceId === undefined || typeof obj.nftInstanceId === 'string') &&
    (obj.receiverAddress === undefined || typeof obj.receiverAddress === 'string')
  );
}


export function buildCustomProps(input: Partial<CustomPropsV1>): string {
  const props: CustomPropsV1 = {
    propsVersion: 1,
    ...input,
  };
  return JSON.stringify(props);
}

export function parseCustomProps(raw: string): { success: true; data: CustomPropsV1 } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(raw);
    if (isValidCustomPropsV1(parsed)) {
      return { success: true, data: parsed };
    }
    return { success: false, error: 'Invalid CustomPropsV1 structure' };
  } catch (error) {
    return { success: false, error: 'Invalid JSON' };
  }
}
