import fs from 'node:fs';
import path from 'node:path';

const opsPath = path.resolve('src/infrastructure/libs/nmkr/types.operations.d.ts');
const outPath = path.resolve('src/infrastructure/libs/nmkr/types.aliases.d.ts');

if (!fs.existsSync(opsPath)) {
  console.error(`Operations file not found: ${opsPath}`);
  process.exit(1);
}

const ops = fs.readFileSync(opsPath, 'utf8');

// Helper function to find operation type names with improved regex
function findName(re) {
  const match = ops.match(re);
  return match?.[0];
}

// Helper to create case-insensitive regex with flexible hash length and word boundaries
const R = (pattern) => new RegExp(`${pattern}(?![\\w$])`, 'i');

// Try to find operation types first (with improved regex patterns)
const tryOps = {
  // Payment transactions (using CreateProject since CreatePaymentTransaction doesn't exist)
  CreatePaymentTransactionRequestBody: findName(R('PostCreateProjectApi[Kk]ey_[a-z0-9]{6,}RequestBody')),
  CreatePaymentTransactionResponse: findName(R('PostCreateProjectApi[Kk]ey_[a-z0-9]{6,}Response(?![\\w$])')),
  
  // Basic API endpoints
  CheckUtxoResponse: findName(R('GetCheckAddressApi[Kk]eyProjectuidAddress_[a-z0-9]{6,}Response(?![\\w$])')),
  PayoutWalletsResponse: findName(R('GetGetPayoutWalletsApi[Kk]ey_[a-z0-9]{6,}Response')),
  RatesResponse: findName(R('GetGetPricelistApi[Kk]ey.*_[a-z0-9]{6,}Response')),
  AdaRatesResponse: findName(R('GetGetPricelistApi[Kk]ey.*_[a-z0-9]{6,}Response')),
  ServerStateResponse: findName(R('GetGetServerStateApi[Kk]ey_[a-z0-9]{6,}Response')),
  PublicMintsResponse: findName(R('GetGetPublicMintsApi[Kk]ey_[a-z0-9]{6,}Response')),
  
  // Project and NFT operations
  GetCountsResponse: findName(R('GetGetCountsApikey.*Projectuid_[a-z0-9]{6,}Response')),
  GetNftDetailsByIdResponse: findName(R('GetGetNftDetailsByIdApikey.*Nftuid_[a-z0-9]{6,}Response')),
  GetNftsResponse: findName(R('GetGetNftsApikey.*Projectuid.*State.*Count.*Page_[a-z0-9]{6,}Response')),
  GetProjectTransactionsResponse: findName(R('GetGetProjectTransactionsApikey.*Projectuid_[a-z0-9]{6,}Response')),
  GetAdditionalPayoutWalletsResponse: findName(R('GetGetAdditionalPayoutWalletsApikey.*Projectuid_[a-z0-9]{6,}Response')),
  
  // Payment address operations (corrected to match actual operation names)
  GetPaymentAddressForRandomNftSaleResponse: findName(R('GetGetAddressForRandomNftSaleApi[Kk]eyProjectuidCountnft_[a-z0-9]{6,}Response(?![\\w$])')),
  GetPaymentAddressForSpecificNftSaleResponse: findName(R('GetGetAddressForSpecificNftSaleApi[Kk]eyNftprojectidNftidTokencount_[a-z0-9]{6,}Response(?![\\w$])')),
  
  // Wallet operations
  AllAssetsInWalletResponse: findName(R('GetGetAllAssetsInWalletApikey.*Address_[a-z0-9]{6,}Response')),
  WalletUtxoResponse: findName(R('GetGetWalletUtxoApikey.*Address_[a-z0-9]{6,}Response')),
  
  // Upload and metadata operations
  UploadNftRequest: findName(R('PostUploadNftApi[Kk]eyNftprojectid_[a-z0-9]{6,}RequestBody')),
  UploadNftResponse: findName(R('PostUploadNftApi[Kk]eyNftprojectid_[a-z0-9]{6,}Response(?!\\d)')),
  UpdateMetadataRequest: findName(R('PostUpdateMetadataApi[Kk]eyNftprojectidNftid_[a-z0-9]{6,}RequestBody')),
  UpdateMetadataResponse: findName(R('PostUpdateMetadataApi[Kk]eyNftprojectidNftid_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Payment status
  GetNmkrPayStatusResponse: findName(R('GetGetNmkrPayStatusApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Minting operations
  MintAndSendRandomResponse: findName(R('GetMintAndSendRandomApikey.*Nftprojectid.*Countnft.*Receiveraddress_[a-z0-9]{6,}Response')),
  MintAndSendSpecificResponse: findName(R('GetMintAndSendSpecificApikey.*Nftprojectid.*Nftid.*Tokencount.*Receiveraddress_[a-z0-9]{6,}Response')),
  MintAndSendMultipleSpecificRequestBody: findName(R('PostMintAndSendSpecificApikey.*Projectuid.*Receiveraddress_[a-z0-9]{6,}RequestBody')),
  MintAndSendMultipleSpecificResponse: findName(R('PostMintAndSendSpecificApikey.*Projectuid.*Receiveraddress_[a-z0-9]{6,}Response')),
  
  // Payment gateway operations
  ProceedReserveRequestBody: findName(R('PostProceedPaymentTransactionReservePaymentgatewayMintAndSendNftApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}RequestBody')),
  ProceedReserveResponse: findName(R('PostProceedPaymentTransactionReservePaymentgatewayMintAndSendNftApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}Response(?!\\d)')),
  ProceedMintRequestBody: findName(R('PostProceedPaymentTransactionMintAndSendPaymentgatewayNftApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}RequestBody')),
  ProceedMintResponse: findName(R('PostProceedPaymentTransactionMintAndSendPaymentgatewayNftApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}Response(?!\\d)')),
  ProceedCancelResponse: findName(R('PostProceedPaymentTransactionCancelTransactionApi[Kk]eyPaymenttransactionuid_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Project management
  ProjectDetailsResponse: findName(R('GetGetProjectDetailsApi[Kk]eyProjectuid_[a-z0-9]{6,}Response(?!\\d)')),
  CreateProjectRequest: findName(R('PostCreateProjectApi[Kk]ey_[a-z0-9]{6,}RequestBody')),
  CreateProjectResponse: findName(R('PostCreateProjectApi[Kk]ey_[a-z0-9]{6,}Response(?!\\d)')),
  
  // IPFS operations
  UploadToIpfsRequestBody: findName(R('PostUploadToIpfsApi[Kk]eyCustomerid_[a-z0-9]{6,}RequestBody')),
  UploadToIpfsResponse: findName(R('PostUploadToIpfsApi[Kk]eyCustomerid_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Address operations
  CheckAddressResponse: findName(R('GetCheckAddressApi[Kk]eyProjectuidAddress_[a-z0-9]{6,}Response(?!\\d)')),
  CancelAddressReservationResponse: findName(R('GetCancelAddressReservationApi[Kk]eyProjectuidPaymentaddress_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Whitelist operations
  WhitelistGetResponse: findName(R('GetManageWhitelistApi[Kk]eyProjectuid_[a-z0-9]{6,}Response(?!\\d)')),
  WhitelistPostResponse: findName(R('PostManageWhitelistApi[Kk]eyProjectuidAddressCountofnfts_[a-z0-9]{6,}Response(?!\\d)')),
  WhitelistDeleteResponse: findName(R('DeleteManageWhitelistApi[Kk]eyProjectuidAddress_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Project listing
  ListProjectsResponse: findName(R('GetListProjectsApi[Kk]ey_[a-z0-9]{6,}Response(?!\\d)')),
  ListProjectsPaginatedResponse: findName(R('GetListProjectsApi[Kk]eyCountPage_[a-z0-9]{6,}Response(?!\\d)')),
  
  // Sale conditions
  SaleConditionsGetResponse: findName(R('GetGetSaleConditionsApi[Kk]eyProjectuid_[a-z0-9]{6,}Response(?!\\d)')),
  SaleConditionsPutRequestBody: findName(R('PutUpdateSaleConditionsApi[Kk]eyProjectuid_[a-z0-9]{6,}RequestBody')),
  SaleConditionsPutResponse: findName(R('PutUpdateSaleConditionsApi[Kk]eyProjectuid_[a-z0-9]{6,}Response(?!\\d)')),
};

// Helper function to add alias or paths fallback
function aliasOrPaths(alias, opsName, pathsType) {
  if (opsName) {
    return `export type ${alias} = ${opsName};`;
  } else {
    console.warn(`Warning: ${alias} not found in operations, using paths fallback`);
    return `export type ${alias} = ${pathsType};`;
  }
}

// Build output
const out = [];
out.push('/* eslint-disable */');
out.push('// @generated - DO NOT EDIT');
out.push('// Auto-generated stable type aliases for NMKR API operations');
out.push('');
out.push("import type { paths, components } from './openapi';");
out.push('');

// Collect imports for found operation types
const foundOpsTypes = Object.values(tryOps).filter(Boolean);
if (foundOpsTypes.length > 0) {
  out.push('import type {');
  foundOpsTypes.forEach((type, i) => {
    out.push(`  ${type}${i < foundOpsTypes.length - 1 ? ',' : ''}`);
  });
  out.push("} from './types.operations';");
  out.push('');
}

// Generate aliases with paths fallback
out.push('// Payment transactions');
out.push(aliasOrPaths(
  'CreatePaymentTransactionRequestBody',
  tryOps.CreatePaymentTransactionRequestBody,
  'paths["/CreateProject/{apikey}"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'CreatePaymentTransactionResponse',
  tryOps.CreatePaymentTransactionResponse,
  'paths["/CreateProject/{apikey}"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Basic API endpoints');
out.push(aliasOrPaths(
  'CheckUtxoResponse',
  tryOps.CheckUtxoResponse,
  'paths["/CheckAddress/{apikey}/{projectuid}/{address}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'PayoutWalletsResponse',
  tryOps.PayoutWalletsResponse,
  'paths["/v2/GetPayoutWallets"]["get"]["responses"]["200"]["content"]["application/json"]'
));
// Use components direct reference for Rates (more stable)
out.push('export type RatesResponse = components["schemas"]["PricelistClass"];');
out.push('export type AdaRatesResponse = components["schemas"]["PricelistClass"];');
out.push(aliasOrPaths(
  'ServerStateResponse',
  tryOps.ServerStateResponse,
  'paths["/v2/GetServerState"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'PublicMintsResponse',
  tryOps.PublicMintsResponse,
  'paths["/v2/GetPublicMints"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Project and NFT operations');
out.push(aliasOrPaths(
  'GetCountsResponse',
  tryOps.GetCountsResponse,
  'paths["/v2/GetCounts/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetNftDetailsByIdResponse',
  tryOps.GetNftDetailsByIdResponse,
  'paths["/v2/GetNftDetailsById/{nftUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetNftsResponse',
  tryOps.GetNftsResponse,
  'paths["/v2/GetNfts/{projectUid}/{state}/{count}/{page}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetProjectTransactionsResponse',
  tryOps.GetProjectTransactionsResponse,
  'paths["/v2/GetProjectTransactions/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetAdditionalPayoutWalletsResponse',
  tryOps.GetAdditionalPayoutWalletsResponse,
  'paths["/v2/GetAdditionalPayoutWallets/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Payment address operations (corrected paths and removed RequestBody for GET method)');
out.push(aliasOrPaths(
  'GetPaymentAddressForRandomNftSaleResponse',
  tryOps.GetPaymentAddressForRandomNftSaleResponse,
  'paths["/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetPaymentAddressForSpecificNftSaleResponse',
  tryOps.GetPaymentAddressForSpecificNftSaleResponse,
  'paths["/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Wallet operations');
out.push(aliasOrPaths(
  'AllAssetsInWalletResponse',
  tryOps.AllAssetsInWalletResponse,
  'paths["/v2/GetAllAssetsInWallet/{address}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'WalletUtxoResponse',
  tryOps.WalletUtxoResponse,
  'paths["/v2/GetWalletUtxo/{address}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Upload and metadata operations');
out.push('export type UploadNftRequest = components["schemas"]["UploadNftClass"];');
out.push('export type UploadNftResponse = components["schemas"]["UploadNftResultClass"];');
out.push('export type UpdateMetadataRequest = components["schemas"]["UploadMetadataClass"];');
out.push(aliasOrPaths(
  'UpdateMetadataResponse',
  tryOps.UpdateMetadataResponse,
  'paths["/v2/UpdateMetadata/{nftprojectid}/{nftid}"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Payment status');
out.push(aliasOrPaths(
  'GetNmkrPayStatusResponse',
  tryOps.GetNmkrPayStatusResponse,
  'paths["/v2/GetNmkrPayStatus/{paymentTransactionUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Minting operations');
out.push(aliasOrPaths(
  'MintAndSendRandomResponse',
  tryOps.MintAndSendRandomResponse,
  'paths["/v2/MintAndSendRandom/{nftProjectId}/{countNft}/{receiverAddress}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'MintAndSendSpecificResponse',
  tryOps.MintAndSendSpecificResponse,
  'paths["/v2/MintAndSendSpecific/{nftProjectId}/{nftId}/{tokenCount}/{receiverAddress}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'MintAndSendMultipleSpecificRequestBody',
  tryOps.MintAndSendMultipleSpecificRequestBody,
  'paths["/v2/MintAndSendSpecific/{projectUid}/{receiverAddress}"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'MintAndSendMultipleSpecificResponse',
  tryOps.MintAndSendMultipleSpecificResponse,
  'paths["/v2/MintAndSendSpecific/{projectUid}/{receiverAddress}"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Payment gateway operations');
out.push(aliasOrPaths(
  'ProceedReserveRequestBody',
  tryOps.ProceedReserveRequestBody,
  'paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/ReservePaymentgatewayMintAndSendNft"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'ProceedReserveResponse',
  tryOps.ProceedReserveResponse,
  'paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/ReservePaymentgatewayMintAndSendNft"]["post"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'ProceedMintRequestBody',
  tryOps.ProceedMintRequestBody,
  'paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/MintAndSendPaymentgatewayNft"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'ProceedMintResponse',
  tryOps.ProceedMintResponse,
  'paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/MintAndSendPaymentgatewayNft"]["post"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'ProceedCancelResponse',
  tryOps.ProceedCancelResponse,
  'paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/CancelTransaction"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Project management');
out.push(aliasOrPaths(
  'ProjectDetailsResponse',
  tryOps.ProjectDetailsResponse,
  'paths["/v2/GetProjectDetails/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'CreateProjectRequest',
  tryOps.CreateProjectRequest,
  'paths["/v2/CreateProject"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'CreateProjectResponse',
  tryOps.CreateProjectResponse,
  'paths["/v2/CreateProject"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// IPFS operations');
out.push(aliasOrPaths(
  'UploadToIpfsRequestBody',
  tryOps.UploadToIpfsRequestBody,
  'paths["/v2/UploadToIpfs/{customerId}"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'UploadToIpfsResponse',
  tryOps.UploadToIpfsResponse,
  'paths["/v2/UploadToIpfs/{customerId}"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Address operations');
out.push('export type CheckAddressResponse = components["schemas"]["CheckAddressResultClass"];');
out.push(aliasOrPaths(
  'CancelAddressReservationResponse',
  tryOps.CancelAddressReservationResponse,
  'paths["/v2/CancelAddressReservation/{projectUid}/{paymentAddress}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Whitelist operations');
out.push(aliasOrPaths(
  'WhitelistGetResponse',
  tryOps.WhitelistGetResponse,
  'paths["/v2/ManageWhitelist/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'WhitelistPostResponse',
  tryOps.WhitelistPostResponse,
  'paths["/v2/ManageWhitelist/{projectUid}/{address}/{countOfNfts}"]["post"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'WhitelistDeleteResponse',
  tryOps.WhitelistDeleteResponse,
  'paths["/v2/ManageWhitelist/{projectUid}/{address}"]["delete"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Project listing');
out.push(aliasOrPaths(
  'ListProjectsResponse',
  tryOps.ListProjectsResponse,
  'paths["/v2/ListProjects"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'ListProjectsPaginatedResponse',
  tryOps.ListProjectsPaginatedResponse,
  'paths["/v2/ListProjects/{count}/{page}"]["get"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Sale conditions');
out.push(aliasOrPaths(
  'SaleConditionsGetResponse',
  tryOps.SaleConditionsGetResponse,
  'paths["/v2/GetSaleConditions/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'SaleConditionsPutRequestBody',
  tryOps.SaleConditionsPutRequestBody,
  'paths["/v2/UpdateSaleConditions/{projectUid}"]["put"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'SaleConditionsPutResponse',
  tryOps.SaleConditionsPutResponse,
  'paths["/v2/UpdateSaleConditions/{projectUid}"]["put"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Re-export components for convenience');
out.push('export type { components } from "./openapi";');

fs.writeFileSync(outPath, out.join('\n') + '\n', 'utf8');
console.log(`✔ Generated ${outPath} with stable type aliases (${foundOpsTypes.length} from operations, rest from paths fallback)`);
console.log('ops-resolved count:', foundOpsTypes.length);
for (const t of foundOpsTypes.sort()) console.log('  -', t);
