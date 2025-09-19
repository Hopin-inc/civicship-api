import fs from 'node:fs';
import path from 'node:path';

const opsPath = path.resolve('src/infrastructure/libs/nmkr/types.operations.d.ts');
const outPath = path.resolve('src/infrastructure/libs/nmkr/types.aliases.d.ts');

if (!fs.existsSync(opsPath)) {
  console.error(`Operations file not found: ${opsPath}`);
  process.exit(1);
}

const ops = fs.readFileSync(opsPath, 'utf8');

// Extract all exported type names from types.operations.d.ts
const exported = Array.from(ops.matchAll(/export\s+type\s+(\w+)\s*=/g))
  .map(m => m[1]); // e.g., GetGetPayoutWalletsApikey_g7h8i9Response

// Partial match picker function
function pickOp({ includes = [], suffix }) {
  const needle = includes.map(s => s.toLowerCase());
  const cand = exported.filter(name => {
    const n = name.toLowerCase();
    return needle.every(part => n.includes(part)) && n.endsWith(suffix.toLowerCase());
  });
  if (cand.length === 0) return null;
  // Sort by length and lexicographically for consistent results
  cand.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return cand[0];
}

// Try to find operation types using partial matching based on actual operation names that exist
const tryOps = {
  // CreatePaymentTransaction (maps to CreateProject since CreatePaymentTransaction doesn't exist)
  CreatePaymentTransactionRequestBody: pickOp({ includes: ['createproject', 'apikey'], suffix: 'RequestBody' }),
  CreatePaymentTransactionResponse: pickOp({ includes: ['createproject', 'apikey'], suffix: 'Response' }),

  // Address operations that actually exist
  CheckUtxoResponse: pickOp({ includes: ['checkaddress', 'apikey', 'address'], suffix: 'Response' }),
  CheckAddressResponse: pickOp({ includes: ['checkaddress', 'apikey', 'projectuid', 'address'], suffix: 'Response' }),
  CancelAddressReservationResponse: pickOp({ includes: ['canceladdressreservation', 'apikey', 'projectuid', 'paymentaddress'], suffix: 'Response' }),

  // Project/NFT operations that exist
  GetCountsResponse: pickOp({ includes: ['getcounts', 'apikey', 'projectuid'], suffix: 'Response' }),
  GetNftDetailsByIdResponse: pickOp({ includes: ['getnftdetailsbyid', 'apikey', 'nftuid'], suffix: 'Response' }),
  GetNftsResponse: pickOp({ includes: ['getnfts', 'apikey', 'projectuid', 'state', 'count', 'page'], suffix: 'Response' }),

  // Payment address operations that exist
  GetPaymentAddressForRandomNftSaleResponse: pickOp({ includes: ['getaddressforrandomnftsale', 'apikey', 'projectuid', 'countnft'], suffix: 'Response' }),
  GetPaymentAddressForSpecificNftSaleResponse: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftuid', 'tokencount'], suffix: 'Response' }),

  // Upload/Metadata operations that exist
  UploadNftRequest: pickOp({ includes: ['uploadnft', 'apikey', 'nftprojectid'], suffix: 'RequestBody' }),
  UploadNftResponse: pickOp({ includes: ['uploadnft', 'apikey', 'nftprojectid'], suffix: 'Response' }),
  UpdateMetadataRequest: pickOp({ includes: ['updatemetadata', 'apikey', 'nftprojectid', 'nftid'], suffix: 'RequestBody' }),
  UpdateMetadataResponse: pickOp({ includes: ['updatemetadata', 'apikey', 'nftprojectid', 'nftid'], suffix: 'Response' }),

  // Mint operations that exist
  MintAndSendRandomResponse: pickOp({ includes: ['mintandsendrandom', 'apikey', 'nftprojectid', 'countnft', 'receiveraddress'], suffix: 'Response' }),
  MintAndSendSpecificResponse: pickOp({ includes: ['mintandsendspecific', 'apikey', 'nftprojectid', 'nftid', 'tokencount', 'receiveraddress'], suffix: 'Response' }),

  // Project management that exists
  CreateProjectRequest: pickOp({ includes: ['createproject', 'apikey'], suffix: 'RequestBody' }),
  CreateProjectResponse: pickOp({ includes: ['createproject', 'apikey'], suffix: 'Response' }),
  ProjectDetailsResponse: pickOp({ includes: ['getprojectdetails', 'apikey', 'projectuid'], suffix: 'Response' }),

  // Listing operations that exist
  ListProjectsResponse: pickOp({ includes: ['listprojects', 'apikey'], suffix: 'Response' }),
  ListProjectsPaginatedResponse: pickOp({ includes: ['listprojects', 'apikey', 'count', 'page'], suffix: 'Response' }),
  ListProjectsCustomerResponse: pickOp({ includes: ['listprojects', 'apikey', 'customerid', 'count', 'page'], suffix: 'Response' }),

  // Delete operations that exist
  DeleteNftResponse: pickOp({ includes: ['deletenft', 'apikey', 'nftprojectid', 'nftid'], suffix: 'Response' }),
  DeleteNftByUidResponse: pickOp({ includes: ['deletenft', 'apikey', 'nftuid'], suffix: 'Response' }),

  // Wallet validation that exists
  CheckWalletValidationResponse: pickOp({ includes: ['checkwalletvalidation', 'apikey', 'validationuid', 'lovelace'], suffix: 'Response' }),
  GetWalletValidationAddressResponse: pickOp({ includes: ['getwalletvalidationaddress', 'apikey', 'validationname'], suffix: 'Response' }),

  // POST operations for GetAddressForSpecificNftSale that exist
  GetAddressForSpecificNftSaleRequestBody: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftprojectid'], suffix: 'RequestBody' }),
  GetAddressForSpecificNftSalePostResponse: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftprojectid'], suffix: 'Response' }),

  // Pricelist operations that exist
  GetPricelistResponse: pickOp({ includes: ['getpricelist', 'apikey', 'projectuid'], suffix: 'Response' }),
  GetPricelistNftProjectResponse: pickOp({ includes: ['getpricelist', 'apikey', 'nftprojectid'], suffix: 'Response' }),

  // NFT Details operations that exist
  GetNftDetailsResponse: pickOp({ includes: ['getnftdetails', 'apikey', 'nftprojectid', 'nftname'], suffix: 'Response' }),
  GetNftDetailsByIdNftProjectResponse: pickOp({ includes: ['getnftdetailsbyid', 'apikey', 'nftprojectid', 'nftid'], suffix: 'Response' }),

  // Additional GetNfts variations that exist
  GetNftsNftProjectResponse: pickOp({ includes: ['getnfts', 'apikey', 'nftprojectid', 'state', 'count', 'page'], suffix: 'Response' }),
  GetNftsStateOnlyResponse: pickOp({ includes: ['getnfts', 'apikey', 'nftprojectid', 'state'], suffix: 'Response' }),

  // Additional GetCounts variations that exist
  GetCountsNftProjectResponse: pickOp({ includes: ['getcounts', 'apikey', 'nftprojectid'], suffix: 'Response' }),

  // Additional GetAddressForRandomNftSale variations that exist
  GetAddressForRandomNftSaleNftProjectResponse: pickOp({ includes: ['getaddressforrandomnftsale', 'apikey', 'nftprojectid', 'countnft'], suffix: 'Response' }),
  GetAddressForRandomNftSaleWithLovelaceResponse: pickOp({ includes: ['getaddressforrandomnftsale', 'apikey', 'projectuid', 'countnft', 'lovelace'], suffix: 'Response' }),
  GetAddressForRandomNftSaleNftProjectWithLovelaceResponse: pickOp({ includes: ['getaddressforrandomnftsale', 'apikey', 'nftprojectid', 'countnft', 'lovelace'], suffix: 'Response' }),

  // Additional GetAddressForSpecificNftSale variations that exist
  GetAddressForSpecificNftSaleNftProjectResponse: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftprojectid', 'nftid', 'tokencount'], suffix: 'Response' }),
  GetAddressForSpecificNftSaleWithLovelaceResponse: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftuid', 'tokencount', 'lovelace'], suffix: 'Response' }),
  GetAddressForSpecificNftSaleNftProjectWithLovelaceResponse: pickOp({ includes: ['getaddressforspecificnftsale', 'apikey', 'nftprojectid', 'nftid', 'tokencount', 'lovelace'], suffix: 'Response' }),

  // Additional CancelAddressReservation variations that exist
  CancelAddressReservationNftProjectResponse: pickOp({ includes: ['canceladdressreservation', 'apikey', 'nftprojectid', 'paymentaddress'], suffix: 'Response' }),

  // Additional CheckAddress variations that exist
  CheckAddressNftProjectResponse: pickOp({ includes: ['checkaddress', 'apikey', 'nftprojectid', 'address'], suffix: 'Response' }),

  // Project details variations that exist
  ProjectDetailsCustomerResponse: pickOp({ includes: ['getprojectdetails', 'apikey', 'customerid', 'nftprojectid'], suffix: 'Response' }),

  // Operations that don't exist in types.operations.d.ts - will use paths fallback
  PayoutWalletsResponse: null, // Will use paths fallback
  ServerStateResponse: null, // Will use paths fallback
  PublicMintsResponse: null, // Will use paths fallback
  GetProjectTransactionsResponse: null, // Will use paths fallback
  GetAdditionalPayoutWalletsResponse: null, // Will use paths fallback
  AllAssetsInWalletResponse: null, // Will use paths fallback
  WalletUtxoResponse: null, // Will use paths fallback
  GetNmkrPayStatusResponse: null, // Will use paths fallback
  MintAndSendMultipleSpecificRequestBody: null, // Will use paths fallback
  MintAndSendMultipleSpecificResponse: null, // Will use paths fallback
  ProceedReserveRequestBody: null, // Will use paths fallback
  ProceedReserveResponse: null, // Will use paths fallback
  ProceedMintRequestBody: null, // Will use paths fallback
  ProceedMintResponse: null, // Will use paths fallback
  ProceedCancelResponse: null, // Will use paths fallback
  ProjectDetailsResponse: null, // Will use paths fallback
  UploadToIpfsRequestBody: null, // Will use paths fallback
  UploadToIpfsResponse: null, // Will use paths fallback
  WhitelistGetResponse: null, // Will use paths fallback
  WhitelistPostResponse: null, // Will use paths fallback
  WhitelistDeleteResponse: null, // Will use paths fallback
  SaleConditionsGetResponse: null, // Will use paths fallback
  SaleConditionsPutRequestBody: null, // Will use paths fallback
  SaleConditionsPutResponse: null, // Will use paths fallback
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
  'paths["/v2/CreatePaymentTransaction"]["post"]["requestBody"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'CreatePaymentTransactionResponse',
  tryOps.CreatePaymentTransactionResponse,
  'paths["/v2/CreatePaymentTransaction"]["post"]["responses"]["200"]["content"]["application/json"]'
));

out.push('');
out.push('// Basic API endpoints');
out.push(aliasOrPaths(
  'CheckUtxoResponse',
  tryOps.CheckUtxoResponse,
  'paths["/v2/CheckUtxo/{address}"]["get"]["responses"]["200"]["content"]["application/json"]'
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
  'paths["/v2/GetPaymentAddressForRandomNftSale/{projectUid}/{countNft}/{customerIpAddress}"]["get"]["responses"]["200"]["content"]["application/json"]'
));
out.push(aliasOrPaths(
  'GetPaymentAddressForSpecificNftSaleResponse',
  tryOps.GetPaymentAddressForSpecificNftSaleResponse,
  'paths["/v2/GetPaymentAddressForSpecificNftSale/{nftUid}/{tokenCount}"]["get"]["responses"]["200"]["content"]["application/json"]'
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
