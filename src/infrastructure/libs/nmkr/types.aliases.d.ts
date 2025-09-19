/* eslint-disable */
// @generated - DO NOT EDIT
// Auto-generated stable type aliases for NMKR API operations

import type { components } from './openapi';

import type {
  PostCreateProjectApikey_9ec63aRequestBody,
  PostCreateProjectApikey_9ec63aResponse,
  GetGetCountsApikeyProjectuid_3ababbResponse,
  GetGetNftDetailsByIdApikeyNftuid_1b8124Response,
  GetGetNftsApikeyProjectuidStateCountPage_db3058Response,
  GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response,
  PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fRequestBody,
  PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse,
  GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse,
  PostUploadNftApikeyNftprojectid_e6d68cRequestBody,
  PostUploadNftApikeyNftprojectid_e6d68cResponse,
  PostUpdateMetadataApikeyNftprojectidNftid_1326a3RequestBody,
  PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response,
  GetCheckAddressApikeyProjectuidAddress_be060fResponse,
  GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response,
  GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response,
  GetGetProjectDetailsApikeyProjectuid_b6371eResponse,
  GetListProjectsApikey_b6d5e7Response,
  GetListProjectsApikeyCountPage_1d70d9Response
} from './types.operations';

export type CreateProjectRequest = PostCreateProjectApikey_9ec63aRequestBody;
export type CreateProjectResponse = PostCreateProjectApikey_9ec63aResponse;
export type GetCountsResponse = GetGetCountsApikeyProjectuid_3ababbResponse;
export type GetNftDetailsByIdResponse = GetGetNftDetailsByIdApikeyNftuid_1b8124Response;
export type GetNftsResponse = GetGetNftsApikeyProjectuidStateCountPage_db3058Response;
export type GetPaymentAddressForRandomNftSaleResponse = GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response;
export type GetPaymentAddressForSpecificNftSaleRequestBody = PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fRequestBody;
export type GetPaymentAddressForSpecificNftSaleResponse = PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse;
export type MintAndSendRandomResponse = GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse;
export type UploadNftRequest = PostUploadNftApikeyNftprojectid_e6d68cRequestBody;
export type UploadNftResponse = PostUploadNftApikeyNftprojectid_e6d68cResponse;
export type UpdateMetadataRequest = PostUpdateMetadataApikeyNftprojectidNftid_1326a3RequestBody;
export type UpdateMetadataResponse = PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response;
export type CheckAddressResponse = GetCheckAddressApikeyProjectuidAddress_be060fResponse;
export type CancelAddressReservationResponse = GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response;
export type CreatePaymentTransactionRequestBody = Record<string, unknown>;
export type CreatePaymentTransactionResponse = Record<string, unknown>;
export type CheckUtxoResponse = Record<string, unknown>;
export type PayoutWalletsResponse = Record<string, unknown>;
export type RatesResponse = Record<string, unknown>;
export type AdaRatesResponse = Record<string, unknown>;
export type ServerStateResponse = Record<string, unknown>;
export type PublicMintsResponse = Record<string, unknown>;
export type GetProjectTransactionsResponse = Record<string, unknown>;
export type GetAdditionalPayoutWalletsResponse = Record<string, unknown>;
export type AllAssetsInWalletResponse = Record<string, unknown>;
export type WalletUtxoResponse = Record<string, unknown>;
export type GetNmkrPayStatusResponse = Record<string, unknown>;
export type MintAndSendSpecificResponse = GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response;
export type MintAndSendMultipleSpecificRequestBody = Record<string, unknown>;
export type MintAndSendMultipleSpecificResponse = Record<string, unknown>;
export type ProceedReserveRequestBody = Record<string, unknown>;
export type ProceedReserveResponse = Record<string, unknown>;
export type ProceedMintRequestBody = Record<string, unknown>;
export type ProceedMintResponse = Record<string, unknown>;
export type ProceedCancelResponse = Record<string, unknown>;
export type ProjectDetailsResponse = GetGetProjectDetailsApikeyProjectuid_b6371eResponse;
export type UploadToIpfsRequestBody = Record<string, unknown>;
export type UploadToIpfsResponse = Record<string, unknown>;
export type WhitelistGetResponse = Record<string, unknown>;
export type WhitelistPostResponse = Record<string, unknown>;
export type WhitelistDeleteResponse = Record<string, unknown>;
export type ListProjectsResponse = GetListProjectsApikey_b6d5e7Response;
export type ListProjectsPaginatedResponse = GetListProjectsApikeyCountPage_1d70d9Response;
export type SaleConditionsGetResponse = Record<string, unknown>;
export type SaleConditionsPutRequestBody = Record<string, unknown>;
export type SaleConditionsPutResponse = Record<string, unknown>;

// Re-export components for convenience
export type { components } from './openapi';
