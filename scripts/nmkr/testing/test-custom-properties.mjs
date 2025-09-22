import { buildCustomProps, parseCustomProps } from './dist/application/domain/nmkr/customProps.js';

const testProps = {
  nftMintId: 'mint_123',
  nftWalletId: 'wallet_456', 
  userRef: 'user_789',
  orderId: 'order_abc'
};

const built = buildCustomProps(testProps);
console.log('Built customProperty:', built);

const parsed = parseCustomProps(built);
console.log('Parsed result:', parsed);

console.log('CustomProperties integration test completed');
