/* eslint-disable */
// @generated - DO NOT EDIT
// Auto-generated stable type aliases for NMKR API operations

import type { paths, components } from './openapi';

import type {
  PostCreateProjectApikey_9ec63aRequestBody,
  PostCreateProjectApikey_9ec63aResponse,
  GetCheckAddressApikeyProjectuidAddress_be060fResponse,
  GetCheckAddressApikeyProjectuidAddress_be060fResponse,
  GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response,
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetGetNftsApikeyProjectuidStateCountPage_db3058Response,
  GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response,
  GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response,
  PostUploadNftApikeyNftprojectid_e6d68cRequestBody,
  PostUploadNftApikeyNftprojectid_e6d68cResponse,
  PostUpdateMetadataApikeyNftprojectidNftid_1326a3RequestBody,
  PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response,
  PostCreateProjectApikey_9ec63aRequestBody,
  PostCreateProjectApikey_9ec63aResponse,
  GetListProjectsApikey_b6d5e7Response,
  GetListProjectsApikeyCountPage_1d70d9Response,
  GetListProjectsApikeyCustomeridCountPage_eaa4b4Response,
  GetDeleteNftApikeyNftprojectidNftid_126f2bResponse,
  GetDeleteNftApikeyNftuid_5fd0b6Response,
  GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse,
  GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response,
  PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fRequestBody,
  PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse,
  GetGetPricelistApikeyProjectuid_64fcb6Response,
  GetGetPricelistApikeyNftprojectid_97abb2Response,
  GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse,
  GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response,
  GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response,
  GetGetNftsApikeyNftprojectidState_e6cc2bResponse,
  GetGetCountsApikeyNftprojectid_159693Response,
  GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response,
  GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response,
  GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response,
  GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response,
  GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse,
  GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse,
  GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response,
  GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse,
  GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response
} from './types.operations';

// Payment transactions
export type CreatePaymentTransactionRequestBody = PostCreateProjectApikey_9ec63aRequestBody;
export type CreatePaymentTransactionResponse = PostCreateProjectApikey_9ec63aResponse;

// Basic API endpoints
export type CheckUtxoResponse = GetCheckAddressApikeyProjectuidAddress_be060fResponse;
export type PayoutWalletsResponse = paths["/v2/GetPayoutWallets"]["get"]["responses"]["200"]["content"]["application/json"];
export type RatesResponse = components["schemas"]["PricelistClass"];
export type AdaRatesResponse = components["schemas"]["PricelistClass"];
export type ServerStateResponse = paths["/v2/GetServerState"]["get"]["responses"]["200"]["content"]["application/json"];
export type PublicMintsResponse = paths["/v2/GetPublicMints"]["get"]["responses"]["200"]["content"]["application/json"];

// Project and NFT operations
export type GetCountsResponse = GetGetCountsApikeyProjectuid_3ababbResponse;
export type GetNftDetailsByIdResponse = GetGetNftDetailsByIdApikeyNftuid_1b8124Response;
export type GetNftsResponse = GetGetNftsApikeyProjectuidStateCountPage_db3058Response;
export type GetProjectTransactionsResponse = paths["/v2/GetProjectTransactions/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetAdditionalPayoutWalletsResponse = paths["/v2/GetAdditionalPayoutWallets/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"];

// Payment address operations (corrected paths and removed RequestBody for GET method)
export type GetPaymentAddressForRandomNftSaleResponse = GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response;
export type GetPaymentAddressForSpecificNftSaleResponse = GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response;

// Wallet operations
export type AllAssetsInWalletResponse = paths["/v2/GetAllAssetsInWallet/{address}"]["get"]["responses"]["200"]["content"]["application/json"];
export type WalletUtxoResponse = paths["/v2/GetWalletUtxo/{address}"]["get"]["responses"]["200"]["content"]["application/json"];

// Upload and metadata operations
export type UploadNftRequest = components["schemas"]["UploadNftClass"];
export type UploadNftResponse = components["schemas"]["UploadNftResultClass"];
export type UpdateMetadataRequest = components["schemas"]["UploadMetadataClass"];
export type UpdateMetadataResponse = PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response;

// Payment status
export type GetNmkrPayStatusResponse = paths["/v2/GetNmkrPayStatus/{paymentTransactionUid}"]["get"]["responses"]["200"]["content"]["application/json"];

// Minting operations
export type MintAndSendRandomResponse = GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse;
export type MintAndSendSpecificResponse = GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response;
export type MintAndSendMultipleSpecificRequestBody = paths["/v2/MintAndSendSpecific/{projectUid}/{receiverAddress}"]["post"]["requestBody"]["content"]["application/json"];
export type MintAndSendMultipleSpecificResponse = paths["/v2/MintAndSendSpecific/{projectUid}/{receiverAddress}"]["post"]["responses"]["200"]["content"]["application/json"];

// Payment gateway operations
export type ProceedReserveRequestBody = paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/ReservePaymentgatewayMintAndSendNft"]["post"]["requestBody"]["content"]["application/json"];
export type ProceedReserveResponse = paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/ReservePaymentgatewayMintAndSendNft"]["post"]["responses"]["200"]["content"]["application/json"];
export type ProceedMintRequestBody = paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/MintAndSendPaymentgatewayNft"]["post"]["requestBody"]["content"]["application/json"];
export type ProceedMintResponse = paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/MintAndSendPaymentgatewayNft"]["post"]["responses"]["200"]["content"]["application/json"];
export type ProceedCancelResponse = paths["/v2/ProceedPaymentTransaction/{paymentTransactionUid}/CancelTransaction"]["post"]["responses"]["200"]["content"]["application/json"];

// Project management
export type ProjectDetailsResponse = paths["/v2/GetProjectDetails/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"];
export type CreateProjectRequest = PostCreateProjectApikey_9ec63aRequestBody;
export type CreateProjectResponse = PostCreateProjectApikey_9ec63aResponse;

// IPFS operations
export type UploadToIpfsRequestBody = paths["/v2/UploadToIpfs/{customerId}"]["post"]["requestBody"]["content"]["application/json"];
export type UploadToIpfsResponse = paths["/v2/UploadToIpfs/{customerId}"]["post"]["responses"]["200"]["content"]["application/json"];

// Address operations
export type CheckAddressResponse = components["schemas"]["CheckAddressResultClass"];
export type CancelAddressReservationResponse = GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response;

// Whitelist operations
export type WhitelistGetResponse = paths["/v2/ManageWhitelist/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"];
export type WhitelistPostResponse = paths["/v2/ManageWhitelist/{projectUid}/{address}/{countOfNfts}"]["post"]["responses"]["200"]["content"]["application/json"];
export type WhitelistDeleteResponse = paths["/v2/ManageWhitelist/{projectUid}/{address}"]["delete"]["responses"]["200"]["content"]["application/json"];

// Project listing
export type ListProjectsResponse = GetListProjectsApikey_b6d5e7Response;
export type ListProjectsPaginatedResponse = GetListProjectsApikeyCountPage_1d70d9Response;

// Sale conditions
export type SaleConditionsGetResponse = paths["/v2/GetSaleConditions/{projectUid}"]["get"]["responses"]["200"]["content"]["application/json"];
export type SaleConditionsPutRequestBody = paths["/v2/UpdateSaleConditions/{projectUid}"]["put"]["requestBody"]["content"]["application/json"];
export type SaleConditionsPutResponse = paths["/v2/UpdateSaleConditions/{projectUid}"]["put"]["responses"]["200"]["content"]["application/json"];

// Re-export components for convenience
export type { components } from "./openapi";
