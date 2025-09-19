import fs from 'node:fs';
import path from 'node:path';

const opsPath = path.resolve('src/infrastructure/libs/nmkr/types.operations.d.ts');
const outPath = path.resolve('src/infrastructure/libs/nmkr/types.aliases.d.ts');

if (!fs.existsSync(opsPath)) {
  console.error(`Operations file not found: ${opsPath}`);
  process.exit(1);
}

const src = fs.readFileSync(opsPath, 'utf8');

// Mapping rules: [aliasName, regex to find the concrete name]
const pairs = [
  // Project management types (found in search results)
  ['CreateProjectRequest', /PostCreateProjectApikey_[a-z0-9]{6}RequestBody/],
  ['CreateProjectResponse', /PostCreateProjectApikey_[a-z0-9]{6}Response(?!\d)/],
  
  // Project and NFT types (found in search results)
  ['GetCountsResponse', /GetGetCountsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['GetNftDetailsByIdResponse', /GetGetNftDetailsByIdApikeyNftuid_[a-z0-9]{6}Response(?!\d)/],
  ['GetNftsResponse', /GetGetNftsApikeyProjectuidStateCountPage_[a-z0-9]{6}Response(?!\d)/],
  
  // Payment address types (found in search results)
  ['GetPaymentAddressForRandomNftSaleResponse', /GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_[a-z0-9]{6}Response(?!\d)/],
  ['GetPaymentAddressForSpecificNftSaleRequestBody', /PostGetAddressForSpecificNftSaleApikeyNftprojectid_[a-z0-9]{6}RequestBody/],
  ['GetPaymentAddressForSpecificNftSaleResponse', /PostGetAddressForSpecificNftSaleApikeyNftprojectid_[a-z0-9]{6}Response(?!\d)/],
  
  // Minting types (found in search results)
  ['MintAndSendRandomResponse', /GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_[a-z0-9]{6}Response(?!\d)/],
  
  // Upload and metadata types (found in search results)
  ['UploadNftRequest', /PostUploadNftApikeyNftprojectid_[a-z0-9]{6}RequestBody/],
  ['UploadNftResponse', /PostUploadNftApikeyNftprojectid_[a-z0-9]{6}Response(?!\d)/],
  ['UpdateMetadataRequest', /PostUpdateMetadataApikeyNftprojectidNftid_[a-z0-9]{6}RequestBody/],
  ['UpdateMetadataResponse', /PostUpdateMetadataApikeyNftprojectidNftid_[a-z0-9]{6}Response(?!\d)/],
  
  // Address and reservation types (found in search results)
  ['CheckAddressResponse', /GetCheckAddressApikeyProjectuidAddress_[a-z0-9]{6}Response(?!\d)/],
  ['CancelAddressReservationResponse', /GetCancelAddressReservationApikeyProjectuidPaymentaddress_[a-z0-9]{6}Response(?!\d)/],
  
  // Types that may not exist in current operations but needed for endpoints
  ['CreatePaymentTransactionRequestBody', /PostCreatePaymentTransactionApikey_[a-z0-9]{6}RequestBody/],
  ['CreatePaymentTransactionResponse', /PostCreatePaymentTransactionApikey_[a-z0-9]{6}Response(?!\d)/],
  ['CheckUtxoResponse', /GetCheckUtxoApikeyAddress_[a-z0-9]{6}Response(?!\d)/],
  ['PayoutWalletsResponse', /GetGetPayoutWalletsApikey_[a-z0-9]{6}Response(?!\d)/],
  ['RatesResponse', /GetGetRatesApikey_[a-z0-9]{6}Response(?!\d)/],
  ['AdaRatesResponse', /GetGetAdaRatesApikey_[a-z0-9]{6}Response(?!\d)/],
  ['ServerStateResponse', /GetGetServerStateApikey_[a-z0-9]{6}Response(?!\d)/],
  ['PublicMintsResponse', /GetGetPublicMintsApikey_[a-z0-9]{6}Response(?!\d)/],
  ['GetProjectTransactionsResponse', /GetGetProjectTransactionsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['GetAdditionalPayoutWalletsResponse', /GetGetAdditionalPayoutWalletsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['AllAssetsInWalletResponse', /GetGetAllAssetsInWalletApikeyAddress_[a-z0-9]{6}Response(?!\d)/],
  ['WalletUtxoResponse', /GetGetWalletUtxoApikeyAddress_[a-z0-9]{6}Response(?!\d)/],
  ['GetNmkrPayStatusResponse', /GetGetNmkrPayStatusApikeyPaymenttransactionuid_[a-z0-9]{6}Response(?!\d)/],
  ['MintAndSendSpecificResponse', /GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_[a-z0-9]{6}Response(?!\d)/],
  ['MintAndSendMultipleSpecificRequestBody', /PostMintAndSendSpecificApikeyProjectuidReceiveraddress_[a-z0-9]{6}RequestBody/],
  ['MintAndSendMultipleSpecificResponse', /PostMintAndSendSpecificApikeyProjectuidReceiveraddress_[a-z0-9]{6}Response(?!\d)/],
  ['ProceedReserveRequestBody', /PostProceedPaymentTransactionReservePaymentgatewayMintAndSendNftApikeyPaymenttransactionuid_[a-z0-9]{6}RequestBody/],
  ['ProceedReserveResponse', /PostProceedPaymentTransactionReservePaymentgatewayMintAndSendNftApikeyPaymenttransactionuid_[a-z0-9]{6}Response(?!\d)/],
  ['ProceedMintRequestBody', /PostProceedPaymentTransactionMintAndSendPaymentgatewayNftApikeyPaymenttransactionuid_[a-z0-9]{6}RequestBody/],
  ['ProceedMintResponse', /PostProceedPaymentTransactionMintAndSendPaymentgatewayNftApikeyPaymenttransactionuid_[a-z0-9]{6}Response(?!\d)/],
  ['ProceedCancelResponse', /PostProceedPaymentTransactionCancelTransactionApikeyPaymenttransactionuid_[a-z0-9]{6}Response(?!\d)/],
  ['ProjectDetailsResponse', /GetGetProjectDetailsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['UploadToIpfsRequestBody', /PostUploadToIpfsApikeyCustomerid_[a-z0-9]{6}RequestBody/],
  ['UploadToIpfsResponse', /PostUploadToIpfsApikeyCustomerid_[a-z0-9]{6}Response(?!\d)/],
  ['WhitelistGetResponse', /GetManageWhitelistApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['WhitelistPostResponse', /PostManageWhitelistApikeyProjectuidAddressCountofnfts_[a-z0-9]{6}Response(?!\d)/],
  ['WhitelistDeleteResponse', /DeleteManageWhitelistApikeyProjectuidAddress_[a-z0-9]{6}Response(?!\d)/],
  ['ListProjectsResponse', /GetListProjectsApikey_[a-z0-9]{6}Response(?!\d)/],
  ['ListProjectsPaginatedResponse', /GetListProjectsApikeyCountPage_[a-z0-9]{6}Response(?!\d)/],
  ['SaleConditionsGetResponse', /GetGetSaleConditionsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
  ['SaleConditionsPutRequestBody', /PutUpdateSaleConditionsApikeyProjectuid_[a-z0-9]{6}RequestBody/],
  ['SaleConditionsPutResponse', /PutUpdateSaleConditionsApikeyProjectuid_[a-z0-9]{6}Response(?!\d)/],
];

const lines = [];
lines.push('/* eslint-disable */');
lines.push('// @generated - DO NOT EDIT');
lines.push('// Auto-generated stable type aliases for NMKR API operations');
lines.push('');
lines.push("import type { components } from './openapi';");
lines.push('');

// Import all the concrete types we'll be aliasing
const imports = [];
for (const [alias, re] of pairs) {
  const match = src.match(re);
  if (match) {
    imports.push(match[0]);
  }
}

if (imports.length > 0) {
  lines.push('import type {');
  imports.forEach((imp, i) => {
    lines.push(`  ${imp}${i < imports.length - 1 ? ',' : ''}`);
  });
  lines.push("} from './types.operations';");
  lines.push('');
}

// Generate the aliases
for (const [alias, re] of pairs) {
  const match = src.match(re);
  if (match) {
    const real = match[0];
    lines.push(`export type ${alias} = ${real};`);
  } else {
    // Fallback to Record<string, unknown> for missing types
    console.warn(`Warning: Alias "${alias}" not found by ${re}, using Record<string, unknown>`);
    lines.push(`export type ${alias} = Record<string, unknown>;`);
  }
}

lines.push('');
lines.push("// Re-export components for convenience");
lines.push("export type { components } from './openapi';");

fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`✔ Generated ${outPath} with ${pairs.length} type aliases`);
