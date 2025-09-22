// AUTO-GENERATED from paths by generate-operations.cjs. DO NOT EDIT.
import type { paths, components } from './openapi';
type P = paths;
type S = components['schemas'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} path parameters */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6PathParams = P['/CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress}']['get']['parameters']['path'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} 401 response */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response401 = P['/CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress}']['get']['responses']['401']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} 404 response */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response404 = P['/CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress}']['get']['responses']['404']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} 406 response */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response406 = P['/CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress}']['get']['responses']['406']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} 500 response */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response500 = P['/CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress}']['get']['responses']['500']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} success response */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response = GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response200;

/** GET /CancelAddressReservation/{apikey}/{nftprojectid}/{paymentaddress} error response union */
export type GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Error = GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response401 | GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response404 | GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response406 | GetCancelAddressReservationApikeyNftprojectidPaymentaddress_157ae6Response500;

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} path parameters */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914PathParams = P['/CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress}']['get']['parameters']['path'];

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} 401 response */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response401 = P['/CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress}']['get']['responses']['401']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} 404 response */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response404 = P['/CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress}']['get']['responses']['404']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} 406 response */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response406 = P['/CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress}']['get']['responses']['406']['content']['application/json'];

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} success response */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response = GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response200;

/** GET /CancelAddressReservation/{apikey}/{projectuid}/{paymentaddress} error response union */
export type GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Error = GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response401 | GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response404 | GetCancelAddressReservationApikeyProjectuidPaymentaddress_920914Response406;

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} path parameters */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaPathParams = P['/CheckAddress/{apikey}/{nftprojectid}/{address}']['get']['parameters']['path'];

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} 200 response */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse200 = P['/CheckAddress/{apikey}/{nftprojectid}/{address}']['get']['responses']['200']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} 401 response */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse401 = P['/CheckAddress/{apikey}/{nftprojectid}/{address}']['get']['responses']['401']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} 404 response */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse404 = P['/CheckAddress/{apikey}/{nftprojectid}/{address}']['get']['responses']['404']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} success response */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse = GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse200;

/** GET /CheckAddress/{apikey}/{nftprojectid}/{address} error response union */
export type GetCheckAddressApikeyNftprojectidAddress_9a1efaError = GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse401 | GetCheckAddressApikeyNftprojectidAddress_9a1efaResponse404;

/** GET /CheckAddress/{apikey}/{projectuid}/{address} path parameters */
export type GetCheckAddressApikeyProjectuidAddress_be060fPathParams = P['/CheckAddress/{apikey}/{projectuid}/{address}']['get']['parameters']['path'];

/** GET /CheckAddress/{apikey}/{projectuid}/{address} 200 response */
export type GetCheckAddressApikeyProjectuidAddress_be060fResponse200 = P['/CheckAddress/{apikey}/{projectuid}/{address}']['get']['responses']['200']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{projectuid}/{address} 401 response */
export type GetCheckAddressApikeyProjectuidAddress_be060fResponse401 = P['/CheckAddress/{apikey}/{projectuid}/{address}']['get']['responses']['401']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{projectuid}/{address} 404 response */
export type GetCheckAddressApikeyProjectuidAddress_be060fResponse404 = P['/CheckAddress/{apikey}/{projectuid}/{address}']['get']['responses']['404']['content']['application/json'];

/** GET /CheckAddress/{apikey}/{projectuid}/{address} success response */
export type GetCheckAddressApikeyProjectuidAddress_be060fResponse = GetCheckAddressApikeyProjectuidAddress_be060fResponse200;

/** GET /CheckAddress/{apikey}/{projectuid}/{address} error response union */
export type GetCheckAddressApikeyProjectuidAddress_be060fError = GetCheckAddressApikeyProjectuidAddress_be060fResponse401 | GetCheckAddressApikeyProjectuidAddress_be060fResponse404;

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} path parameters */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bPathParams = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['parameters']['path'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} 200 response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse200 = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['responses']['200']['content']['application/json'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} 401 response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse401 = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['responses']['401']['content']['application/json'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} 404 response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse404 = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['responses']['404']['content']['application/json'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} 429 response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse429 = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['responses']['429']['content']['application/json'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} 500 response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse500 = P['/CheckWalletValidation/{apikey}/{validationuid}/{lovelace}']['get']['responses']['500']['content']['application/json'];

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} success response */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse = GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse200;

/** GET /CheckWalletValidation/{apikey}/{validationuid}/{lovelace} error response union */
export type GetCheckWalletValidationApikeyValidationuidLovelace_627d3bError = GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse401 | GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse404 | GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse429 | GetCheckWalletValidationApikeyValidationuidLovelace_627d3bResponse500;

/** POST /CreateProject/{apikey} path parameters */
export type PostCreateProjectApikey_9ec63aPathParams = P['/CreateProject/{apikey}']['post']['parameters']['path'];

/** POST /CreateProject/{apikey} request body */
export type PostCreateProjectApikey_9ec63aRequestBody = P['/CreateProject/{apikey}']['post']['requestBody']['content']['application/json'];

/** POST /CreateProject/{apikey} 200 response */
export type PostCreateProjectApikey_9ec63aResponse200 = P['/CreateProject/{apikey}']['post']['responses']['200']['content']['application/json'];

/** POST /CreateProject/{apikey} 401 response */
export type PostCreateProjectApikey_9ec63aResponse401 = P['/CreateProject/{apikey}']['post']['responses']['401']['content']['application/json'];

/** POST /CreateProject/{apikey} 406 response */
export type PostCreateProjectApikey_9ec63aResponse406 = P['/CreateProject/{apikey}']['post']['responses']['406']['content']['application/json'];

/** POST /CreateProject/{apikey} 500 response */
export type PostCreateProjectApikey_9ec63aResponse500 = P['/CreateProject/{apikey}']['post']['responses']['500']['content']['application/json'];

/** POST /CreateProject/{apikey} success response */
export type PostCreateProjectApikey_9ec63aResponse = PostCreateProjectApikey_9ec63aResponse200;

/** POST /CreateProject/{apikey} error response union */
export type PostCreateProjectApikey_9ec63aError = PostCreateProjectApikey_9ec63aResponse401 | PostCreateProjectApikey_9ec63aResponse404 | PostCreateProjectApikey_9ec63aResponse406 | PostCreateProjectApikey_9ec63aResponse409 | PostCreateProjectApikey_9ec63aResponse500;

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} path parameters */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bPathParams = P['/DeleteNft/{apikey}/{nftprojectid}/{nftid}']['get']['parameters']['path'];

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} 401 response */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bResponse401 = P['/DeleteNft/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['401']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} 404 response */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bResponse404 = P['/DeleteNft/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['404']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} 406 response */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bResponse406 = P['/DeleteNft/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['406']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} success response */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bResponse = GetDeleteNftApikeyNftprojectidNftid_126f2bResponse200;

/** GET /DeleteNft/{apikey}/{nftprojectid}/{nftid} error response union */
export type GetDeleteNftApikeyNftprojectidNftid_126f2bError = GetDeleteNftApikeyNftprojectidNftid_126f2bResponse401 | GetDeleteNftApikeyNftprojectidNftid_126f2bResponse404 | GetDeleteNftApikeyNftprojectidNftid_126f2bResponse406;

/** GET /DeleteNft/{apikey}/{nftuid} path parameters */
export type GetDeleteNftApikeyNftuid_5fd0b6PathParams = P['/DeleteNft/{apikey}/{nftuid}']['get']['parameters']['path'];

/** GET /DeleteNft/{apikey}/{nftuid} 401 response */
export type GetDeleteNftApikeyNftuid_5fd0b6Response401 = P['/DeleteNft/{apikey}/{nftuid}']['get']['responses']['401']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftuid} 404 response */
export type GetDeleteNftApikeyNftuid_5fd0b6Response404 = P['/DeleteNft/{apikey}/{nftuid}']['get']['responses']['404']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftuid} 406 response */
export type GetDeleteNftApikeyNftuid_5fd0b6Response406 = P['/DeleteNft/{apikey}/{nftuid}']['get']['responses']['406']['content']['application/json'];

/** GET /DeleteNft/{apikey}/{nftuid} success response */
export type GetDeleteNftApikeyNftuid_5fd0b6Response = GetDeleteNftApikeyNftuid_5fd0b6Response200;

/** GET /DeleteNft/{apikey}/{nftuid} error response union */
export type GetDeleteNftApikeyNftuid_5fd0b6Error = GetDeleteNftApikeyNftuid_5fd0b6Response401 | GetDeleteNftApikeyNftuid_5fd0b6Response404 | GetDeleteNftApikeyNftuid_5fd0b6Response406;

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} path parameters */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6PathParams = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['parameters']['path'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} query parameters */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6QueryParams = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['parameters']['query'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} 200 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response200 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} 401 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response401 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} 404 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response404 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} 406 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response406 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} 500 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response500 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} success response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response = GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response200;

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}/{lovelace} error response union */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Error = GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response401 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response404 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response406 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response429 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnftLovelace_103cf6Response500;

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} path parameters */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645PathParams = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['parameters']['path'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} query parameters */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645QueryParams = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['parameters']['query'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} 200 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response200 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} 401 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response401 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} 404 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response404 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} 406 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response406 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} 500 response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response500 = P['/GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} success response */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response = GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response200;

/** GET /GetAddressForRandomNftSale/{apikey}/{nftprojectid}/{countnft} error response union */
export type GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Error = GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response401 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response404 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response406 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response429 | GetGetAddressForRandomNftSaleApikeyNftprojectidCountnft_3ec645Response500;

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} path parameters */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8PathParams = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['parameters']['path'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} query parameters */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8QueryParams = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['parameters']['query'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} 200 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response200 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} 401 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response401 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} 404 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response404 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} 406 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response406 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} 500 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response500 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} success response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response = GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response200;

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft} error response union */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Error = GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response401 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response404 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response406 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response429 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnft_39cec8Response500;

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} path parameters */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9PathParams = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['parameters']['path'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} query parameters */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9QueryParams = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['parameters']['query'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} 200 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response200 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} 401 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response401 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} 404 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response404 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} 406 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response406 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} 500 response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response500 = P['/GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} success response */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response = GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response200;

/** GET /GetAddressForRandomNftSale/{apikey}/{projectuid}/{countnft}/{lovelace} error response union */
export type GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Error = GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response401 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response404 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response406 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response429 | GetGetAddressForRandomNftSaleApikeyProjectuidCountnftLovelace_ee6ee9Response500;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} path parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abPathParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['parameters']['path'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} query parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abQueryParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['parameters']['query'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 200 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse200 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 401 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse401 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 404 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse404 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 406 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse406 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 409 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse409 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['409']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 429 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse429 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['429']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} 500 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse500 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} success response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse = GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse200;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{lovelace} error response union */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abError = GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse401 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse404 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse406 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse409 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse429 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencountLovelace_f786abResponse500;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} path parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cPathParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['parameters']['path'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} query parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cQueryParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['parameters']['query'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 200 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse200 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 401 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse401 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 404 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse404 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 406 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse406 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 409 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse409 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['409']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 429 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse429 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['429']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} 500 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse500 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} success response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse = GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse200;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}/{lovelace} error response union */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cError = GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse401 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse404 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse406 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse409 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse429 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencountLovelace_5a355cResponse500;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} path parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632PathParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['parameters']['path'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} query parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632QueryParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['parameters']['query'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 200 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response200 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 401 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response401 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 404 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response404 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 406 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response406 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 409 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response409 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['409']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 429 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response429 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['429']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} 500 response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response500 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} success response */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response = GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response200;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftprojectid}/{nftid}/{tokencount} error response union */
export type GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Error = GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response401 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response404 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response406 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response409 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response429 | GetGetAddressForSpecificNftSaleApikeyNftprojectidNftidTokencount_916632Response500;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} path parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78PathParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['parameters']['path'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} query parameters */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78QueryParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['parameters']['query'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 200 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response200 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['200']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 401 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response401 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['401']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 404 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response404 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['404']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 406 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response406 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['406']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 409 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response409 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['409']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 429 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response429 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['429']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} 500 response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response500 = P['/GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount}']['get']['responses']['500']['content']['application/json'];

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} success response */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response = GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response200;

/** GET /GetAddressForSpecificNftSale/{apikey}/{nftuid}/{tokencount} error response union */
export type GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Error = GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response401 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response404 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response406 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response409 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response429 | GetGetAddressForSpecificNftSaleApikeyNftuidTokencount_9eba78Response500;

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} path parameters */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fPathParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['parameters']['path'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} query parameters */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fQueryParams = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['parameters']['query'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} request body */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fRequestBody = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['requestBody']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 200 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse200 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['200']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 401 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse401 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['401']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 404 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse404 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['404']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 406 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse406 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['406']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 409 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse409 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['409']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 429 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse429 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['429']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} 500 response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse500 = P['/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}']['post']['responses']['500']['content']['application/json'];

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} success response */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse = PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse200;

/** POST /GetAddressForSpecificNftSale/{apikey}/{nftprojectid} error response union */
export type PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fError = PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse401 | PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse404 | PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse406 | PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse409 | PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse429 | PostGetAddressForSpecificNftSaleApikeyNftprojectid_bd582fResponse500;

/** GET /GetCounts/{apikey}/{nftprojectid} path parameters */
export type GetGetCountsApikeyNftprojectid_159693PathParams = P['/GetCounts/{apikey}/{nftprojectid}']['get']['parameters']['path'];

/** GET /GetCounts/{apikey}/{nftprojectid} 200 response */
export type GetGetCountsApikeyNftprojectid_159693Response200 = P['/GetCounts/{apikey}/{nftprojectid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetCounts/{apikey}/{nftprojectid} 401 response */
export type GetGetCountsApikeyNftprojectid_159693Response401 = P['/GetCounts/{apikey}/{nftprojectid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetCounts/{apikey}/{nftprojectid} success response */
export type GetGetCountsApikeyNftprojectid_159693Response = GetGetCountsApikeyNftprojectid_159693Response200;

/** GET /GetCounts/{apikey}/{nftprojectid} error response */
export type GetGetCountsApikeyNftprojectid_159693Error = GetGetCountsApikeyNftprojectid_159693Response401;

/** GET /GetCounts/{apikey}/{projectuid} path parameters */
export type GetGetCountsApikeyProjectuid_3ababbPathParams = P['/GetCounts/{apikey}/{projectuid}']['get']['parameters']['path'];

/** GET /GetCounts/{apikey}/{projectuid} 200 response */
export type GetGetCountsApikeyProjectuid_3ababbResponse200 = P['/GetCounts/{apikey}/{projectuid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetCounts/{apikey}/{projectuid} 401 response */
export type GetGetCountsApikeyProjectuid_3ababbResponse401 = P['/GetCounts/{apikey}/{projectuid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetCounts/{apikey}/{projectuid} success response */
export type GetGetCountsApikeyProjectuid_3ababbResponse = GetGetCountsApikeyProjectuid_3ababbResponse200;

/** GET /GetCounts/{apikey}/{projectuid} error response */
export type GetGetCountsApikeyProjectuid_3ababbError = GetGetCountsApikeyProjectuid_3ababbResponse401;

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} path parameters */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3bePathParams = P['/GetNftDetails/{apikey}/{nftprojectid}/{nftname}']['get']['parameters']['path'];

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} 200 response */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse200 = P['/GetNftDetails/{apikey}/{nftprojectid}/{nftname}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} 401 response */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse401 = P['/GetNftDetails/{apikey}/{nftprojectid}/{nftname}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} 404 response */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse404 = P['/GetNftDetails/{apikey}/{nftprojectid}/{nftname}']['get']['responses']['404']['content']['application/json'];

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} success response */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse = GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse200;

/** GET /GetNftDetails/{apikey}/{nftprojectid}/{nftname} error response union */
export type GetGetNftDetailsApikeyNftprojectidNftname_0ad3beError = GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse401 | GetGetNftDetailsApikeyNftprojectidNftname_0ad3beResponse404;

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} path parameters */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1PathParams = P['/GetNftDetailsById/{apikey}/{nftprojectid}/{nftid}']['get']['parameters']['path'];

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} 200 response */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response200 = P['/GetNftDetailsById/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} 401 response */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response401 = P['/GetNftDetailsById/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} 404 response */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response404 = P['/GetNftDetailsById/{apikey}/{nftprojectid}/{nftid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} success response */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response = GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response200;

/** GET /GetNftDetailsById/{apikey}/{nftprojectid}/{nftid} error response union */
export type GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Error = GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response401 | GetGetNftDetailsByIdApikeyNftprojectidNftid_d324f1Response404;

/** GET /GetNftDetailsById/{apikey}/{nftuid} path parameters */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124PathParams = P['/GetNftDetailsById/{apikey}/{nftuid}']['get']['parameters']['path'];

/** GET /GetNftDetailsById/{apikey}/{nftuid} 200 response */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124Response200 = P['/GetNftDetailsById/{apikey}/{nftuid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftuid} 401 response */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124Response401 = P['/GetNftDetailsById/{apikey}/{nftuid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftuid} 404 response */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124Response404 = P['/GetNftDetailsById/{apikey}/{nftuid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetNftDetailsById/{apikey}/{nftuid} success response */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124Response = GetGetNftDetailsByIdApikeyNftuid_1b8124Response200;

/** GET /GetNftDetailsById/{apikey}/{nftuid} error response union */
export type GetGetNftDetailsByIdApikeyNftuid_1b8124Error = GetGetNftDetailsByIdApikeyNftuid_1b8124Response401 | GetGetNftDetailsByIdApikeyNftuid_1b8124Response404;

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} path parameters */
export type GetGetNftsApikeyNftprojectidState_e6cc2bPathParams = P['/GetNfts/{apikey}/{nftprojectid}/{state}']['get']['parameters']['path'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} 200 response */
export type GetGetNftsApikeyNftprojectidState_e6cc2bResponse200 = P['/GetNfts/{apikey}/{nftprojectid}/{state}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} 401 response */
export type GetGetNftsApikeyNftprojectidState_e6cc2bResponse401 = P['/GetNfts/{apikey}/{nftprojectid}/{state}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} 406 response */
export type GetGetNftsApikeyNftprojectidState_e6cc2bResponse406 = P['/GetNfts/{apikey}/{nftprojectid}/{state}']['get']['responses']['406']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} success response */
export type GetGetNftsApikeyNftprojectidState_e6cc2bResponse = GetGetNftsApikeyNftprojectidState_e6cc2bResponse200;

/** GET /GetNfts/{apikey}/{nftprojectid}/{state} error response union */
export type GetGetNftsApikeyNftprojectidState_e6cc2bError = GetGetNftsApikeyNftprojectidState_e6cc2bResponse401 | GetGetNftsApikeyNftprojectidState_e6cc2bResponse406;

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} path parameters */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1PathParams = P['/GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page}']['get']['parameters']['path'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} query parameters */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1QueryParams = P['/GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page}']['get']['parameters']['query'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} 200 response */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response200 = P['/GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} 401 response */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response401 = P['/GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} 406 response */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response406 = P['/GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page}']['get']['responses']['406']['content']['application/json'];

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} success response */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response = GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response200;

/** GET /GetNfts/{apikey}/{nftprojectid}/{state}/{count}/{page} error response union */
export type GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Error = GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response401 | GetGetNftsApikeyNftprojectidStateCountPage_0f80e1Response406;

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} path parameters */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058PathParams = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['parameters']['path'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} query parameters */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058QueryParams = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['parameters']['query'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} 200 response */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Response200 = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['responses']['200']['content']['application/json'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} 401 response */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Response401 = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['responses']['401']['content']['application/json'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} 404 response */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Response404 = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['responses']['404']['content']['application/json'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} 406 response */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Response406 = P['/GetNfts/{apikey}/{projectuid}/{state}/{count}/{page}']['get']['responses']['406']['content']['application/json'];

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} success response */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Response = GetGetNftsApikeyProjectuidStateCountPage_db3058Response200;

/** GET /GetNfts/{apikey}/{projectuid}/{state}/{count}/{page} error response union */
export type GetGetNftsApikeyProjectuidStateCountPage_db3058Error = GetGetNftsApikeyProjectuidStateCountPage_db3058Response401 | GetGetNftsApikeyProjectuidStateCountPage_db3058Response404 | GetGetNftsApikeyProjectuidStateCountPage_db3058Response406;

/** GET /GetPricelist/{apikey}/{nftprojectid} path parameters */
export type GetGetPricelistApikeyNftprojectid_97abb2PathParams = P['/GetPricelist/{apikey}/{nftprojectid}']['get']['parameters']['path'];

/** GET /GetPricelist/{apikey}/{nftprojectid} 200 response */
export type GetGetPricelistApikeyNftprojectid_97abb2Response200 = P['/GetPricelist/{apikey}/{nftprojectid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{nftprojectid} 401 response */
export type GetGetPricelistApikeyNftprojectid_97abb2Response401 = P['/GetPricelist/{apikey}/{nftprojectid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{nftprojectid} 404 response */
export type GetGetPricelistApikeyNftprojectid_97abb2Response404 = P['/GetPricelist/{apikey}/{nftprojectid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{nftprojectid} success response */
export type GetGetPricelistApikeyNftprojectid_97abb2Response = GetGetPricelistApikeyNftprojectid_97abb2Response200;

/** GET /GetPricelist/{apikey}/{nftprojectid} error response union */
export type GetGetPricelistApikeyNftprojectid_97abb2Error = GetGetPricelistApikeyNftprojectid_97abb2Response401 | GetGetPricelistApikeyNftprojectid_97abb2Response404;

/** GET /GetPricelist/{apikey}/{projectuid} path parameters */
export type GetGetPricelistApikeyProjectuid_64fcb6PathParams = P['/GetPricelist/{apikey}/{projectuid}']['get']['parameters']['path'];

/** GET /GetPricelist/{apikey}/{projectuid} 200 response */
export type GetGetPricelistApikeyProjectuid_64fcb6Response200 = P['/GetPricelist/{apikey}/{projectuid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{projectuid} 401 response */
export type GetGetPricelistApikeyProjectuid_64fcb6Response401 = P['/GetPricelist/{apikey}/{projectuid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{projectuid} 404 response */
export type GetGetPricelistApikeyProjectuid_64fcb6Response404 = P['/GetPricelist/{apikey}/{projectuid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetPricelist/{apikey}/{projectuid} success response */
export type GetGetPricelistApikeyProjectuid_64fcb6Response = GetGetPricelistApikeyProjectuid_64fcb6Response200;

/** GET /GetPricelist/{apikey}/{projectuid} error response union */
export type GetGetPricelistApikeyProjectuid_64fcb6Error = GetGetPricelistApikeyProjectuid_64fcb6Response401 | GetGetPricelistApikeyProjectuid_64fcb6Response404;

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} path parameters */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0PathParams = P['/GetProjectDetails/{apikey}/{customerid}/{nftprojectid}']['get']['parameters']['path'];

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} 200 response */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response200 = P['/GetProjectDetails/{apikey}/{customerid}/{nftprojectid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} 401 response */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response401 = P['/GetProjectDetails/{apikey}/{customerid}/{nftprojectid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} 404 response */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response404 = P['/GetProjectDetails/{apikey}/{customerid}/{nftprojectid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} success response */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response = GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response200;

/** GET /GetProjectDetails/{apikey}/{customerid}/{nftprojectid} error response union */
export type GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Error = GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response401 | GetGetProjectDetailsApikeyCustomeridNftprojectid_a635a0Response404;

/** GET /GetProjectDetails/{apikey}/{projectuid} path parameters */
export type GetGetProjectDetailsApikeyProjectuid_b6371ePathParams = P['/GetProjectDetails/{apikey}/{projectuid}']['get']['parameters']['path'];

/** GET /GetProjectDetails/{apikey}/{projectuid} 200 response */
export type GetGetProjectDetailsApikeyProjectuid_b6371eResponse200 = P['/GetProjectDetails/{apikey}/{projectuid}']['get']['responses']['200']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{projectuid} 401 response */
export type GetGetProjectDetailsApikeyProjectuid_b6371eResponse401 = P['/GetProjectDetails/{apikey}/{projectuid}']['get']['responses']['401']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{projectuid} 404 response */
export type GetGetProjectDetailsApikeyProjectuid_b6371eResponse404 = P['/GetProjectDetails/{apikey}/{projectuid}']['get']['responses']['404']['content']['application/json'];

/** GET /GetProjectDetails/{apikey}/{projectuid} success response */
export type GetGetProjectDetailsApikeyProjectuid_b6371eResponse = GetGetProjectDetailsApikeyProjectuid_b6371eResponse200;

/** GET /GetProjectDetails/{apikey}/{projectuid} error response union */
export type GetGetProjectDetailsApikeyProjectuid_b6371eError = GetGetProjectDetailsApikeyProjectuid_b6371eResponse401 | GetGetProjectDetailsApikeyProjectuid_b6371eResponse404;

/** GET /GetWalletValidationAddress/{apikey}/{validationname} path parameters */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4PathParams = P['/GetWalletValidationAddress/{apikey}/{validationname}']['get']['parameters']['path'];

/** GET /GetWalletValidationAddress/{apikey}/{validationname} 200 response */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response200 = P['/GetWalletValidationAddress/{apikey}/{validationname}']['get']['responses']['200']['content']['application/json'];

/** GET /GetWalletValidationAddress/{apikey}/{validationname} 401 response */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response401 = P['/GetWalletValidationAddress/{apikey}/{validationname}']['get']['responses']['401']['content']['application/json'];

/** GET /GetWalletValidationAddress/{apikey}/{validationname} 429 response */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response429 = P['/GetWalletValidationAddress/{apikey}/{validationname}']['get']['responses']['429']['content']['application/json'];

/** GET /GetWalletValidationAddress/{apikey}/{validationname} 500 response */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response500 = P['/GetWalletValidationAddress/{apikey}/{validationname}']['get']['responses']['500']['content']['application/json'];

/** GET /GetWalletValidationAddress/{apikey}/{validationname} success response */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response = GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response200;

/** GET /GetWalletValidationAddress/{apikey}/{validationname} error response union */
export type GetGetWalletValidationAddressApikeyValidationname_b3b8b4Error = GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response401 | GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response429 | GetGetWalletValidationAddressApikeyValidationname_b3b8b4Response500;

/** GET /ListProjects/{apikey} path parameters */
export type GetListProjectsApikey_b6d5e7PathParams = P['/ListProjects/{apikey}']['get']['parameters']['path'];

/** GET /ListProjects/{apikey} 200 response */
export type GetListProjectsApikey_b6d5e7Response200 = P['/ListProjects/{apikey}']['get']['responses']['200']['content']['application/json'];

/** GET /ListProjects/{apikey} 401 response */
export type GetListProjectsApikey_b6d5e7Response401 = P['/ListProjects/{apikey}']['get']['responses']['401']['content']['application/json'];

/** GET /ListProjects/{apikey} 404 response */
export type GetListProjectsApikey_b6d5e7Response404 = P['/ListProjects/{apikey}']['get']['responses']['404']['content']['application/json'];

/** GET /ListProjects/{apikey} 406 response */
export type GetListProjectsApikey_b6d5e7Response406 = P['/ListProjects/{apikey}']['get']['responses']['406']['content']['application/json'];

/** GET /ListProjects/{apikey} success response */
export type GetListProjectsApikey_b6d5e7Response = GetListProjectsApikey_b6d5e7Response200;

/** GET /ListProjects/{apikey} error response union */
export type GetListProjectsApikey_b6d5e7Error = GetListProjectsApikey_b6d5e7Response401 | GetListProjectsApikey_b6d5e7Response404 | GetListProjectsApikey_b6d5e7Response406;

/** GET /ListProjects/{apikey}/{count}/{page} path parameters */
export type GetListProjectsApikeyCountPage_1d70d9PathParams = P['/ListProjects/{apikey}/{count}/{page}']['get']['parameters']['path'];

/** GET /ListProjects/{apikey}/{count}/{page} 200 response */
export type GetListProjectsApikeyCountPage_1d70d9Response200 = P['/ListProjects/{apikey}/{count}/{page}']['get']['responses']['200']['content']['application/json'];

/** GET /ListProjects/{apikey}/{count}/{page} 401 response */
export type GetListProjectsApikeyCountPage_1d70d9Response401 = P['/ListProjects/{apikey}/{count}/{page}']['get']['responses']['401']['content']['application/json'];

/** GET /ListProjects/{apikey}/{count}/{page} 404 response */
export type GetListProjectsApikeyCountPage_1d70d9Response404 = P['/ListProjects/{apikey}/{count}/{page}']['get']['responses']['404']['content']['application/json'];

/** GET /ListProjects/{apikey}/{count}/{page} 406 response */
export type GetListProjectsApikeyCountPage_1d70d9Response406 = P['/ListProjects/{apikey}/{count}/{page}']['get']['responses']['406']['content']['application/json'];

/** GET /ListProjects/{apikey}/{count}/{page} success response */
export type GetListProjectsApikeyCountPage_1d70d9Response = GetListProjectsApikeyCountPage_1d70d9Response200;

/** GET /ListProjects/{apikey}/{count}/{page} error response union */
export type GetListProjectsApikeyCountPage_1d70d9Error = GetListProjectsApikeyCountPage_1d70d9Response401 | GetListProjectsApikeyCountPage_1d70d9Response404 | GetListProjectsApikeyCountPage_1d70d9Response406;

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} path parameters */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4PathParams = P['/ListProjects/{apikey}/{customerid}/{count}/{page}']['get']['parameters']['path'];

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} 200 response */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Response200 = P['/ListProjects/{apikey}/{customerid}/{count}/{page}']['get']['responses']['200']['content']['application/json'];

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} 401 response */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Response401 = P['/ListProjects/{apikey}/{customerid}/{count}/{page}']['get']['responses']['401']['content']['application/json'];

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} 404 response */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Response404 = P['/ListProjects/{apikey}/{customerid}/{count}/{page}']['get']['responses']['404']['content']['application/json'];

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} 406 response */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Response406 = P['/ListProjects/{apikey}/{customerid}/{count}/{page}']['get']['responses']['406']['content']['application/json'];

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} success response */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Response = GetListProjectsApikeyCustomeridCountPage_eaa4b4Response200;

/** GET /ListProjects/{apikey}/{customerid}/{count}/{page} error response union */
export type GetListProjectsApikeyCustomeridCountPage_eaa4b4Error = GetListProjectsApikeyCustomeridCountPage_eaa4b4Response401 | GetListProjectsApikeyCustomeridCountPage_eaa4b4Response404 | GetListProjectsApikeyCustomeridCountPage_eaa4b4Response406;

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} path parameters */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4ePathParams = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['parameters']['path'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 200 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse200 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['200']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 401 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse401 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['401']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 402 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse402 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['402']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 404 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse404 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['404']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 406 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse406 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['406']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 409 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse409 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['409']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} 500 response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse500 = P['/MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress}']['get']['responses']['500']['content']['application/json'];

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} success response */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse = GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse200;

/** GET /MintAndSendRandom/{apikey}/{nftprojectid}/{countnft}/{receiveraddress} error response union */
export type GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eError = GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse401 | GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse402 | GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse404 | GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse406 | GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse409 | GetMintAndSendRandomApikeyNftprojectidCountnftReceiveraddress_63bb4eResponse500;

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} path parameters */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237PathParams = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['parameters']['path'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 200 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response200 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['200']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 401 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response401 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['401']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 402 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response402 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['402']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 404 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response404 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['404']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 406 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response406 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['406']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 409 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response409 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['409']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} 500 response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response500 = P['/MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress}']['get']['responses']['500']['content']['application/json'];

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} success response */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response = GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response200;

/** GET /MintAndSendSpecific/{apikey}/{nftprojectid}/{nftid}/{tokencount}/{receiveraddress} error response union */
export type GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Error = GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response401 | GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response402 | GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response404 | GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response406 | GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response409 | GetMintAndSendSpecificApikeyNftprojectidNftidTokencountReceiveraddress_26d237Response500;

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} path parameters */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3PathParams = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['parameters']['path'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} request body */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3RequestBody = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['requestBody']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} 200 response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response200 = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['responses']['200']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} 401 response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response401 = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['responses']['401']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} 404 response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response404 = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['responses']['404']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} 406 response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response406 = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['responses']['406']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} 500 response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response500 = P['/UpdateMetadata/{apikey}/{nftprojectid}/{nftid}']['post']['responses']['500']['content']['application/json'];

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} success response */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response = PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response200;

/** POST /UpdateMetadata/{apikey}/{nftprojectid}/{nftid} error response union */
export type PostUpdateMetadataApikeyNftprojectidNftid_1326a3Error = PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response401 | PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response404 | PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response406 | PostUpdateMetadataApikeyNftprojectidNftid_1326a3Response500;

/** POST /UploadNft/{apikey}/{nftprojectid} path parameters */
export type PostUploadNftApikeyNftprojectid_e6d68cPathParams = P['/UploadNft/{apikey}/{nftprojectid}']['post']['parameters']['path'];

/** POST /UploadNft/{apikey}/{nftprojectid} request body */
export type PostUploadNftApikeyNftprojectid_e6d68cRequestBody = P['/UploadNft/{apikey}/{nftprojectid}']['post']['requestBody']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} 200 response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse200 = P['/UploadNft/{apikey}/{nftprojectid}']['post']['responses']['200']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} 401 response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse401 = P['/UploadNft/{apikey}/{nftprojectid}']['post']['responses']['401']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} 406 response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse406 = P['/UploadNft/{apikey}/{nftprojectid}']['post']['responses']['406']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} 409 response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse409 = P['/UploadNft/{apikey}/{nftprojectid}']['post']['responses']['409']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} 500 response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse500 = P['/UploadNft/{apikey}/{nftprojectid}']['post']['responses']['500']['content']['application/json'];

/** POST /UploadNft/{apikey}/{nftprojectid} success response */
export type PostUploadNftApikeyNftprojectid_e6d68cResponse = PostUploadNftApikeyNftprojectid_e6d68cResponse200;

/** POST /UploadNft/{apikey}/{nftprojectid} error response union */
export type PostUploadNftApikeyNftprojectid_e6d68cError = PostUploadNftApikeyNftprojectid_e6d68cResponse401 | PostUploadNftApikeyNftprojectid_e6d68cResponse404 | PostUploadNftApikeyNftprojectid_e6d68cResponse406 | PostUploadNftApikeyNftprojectid_e6d68cResponse409 | PostUploadNftApikeyNftprojectid_e6d68cResponse500;

// Convenience re-exports
export type { components, paths } from './openapi';

export const NMKR_CONFIG = {
  DEFAULT_TIMEOUT: 15000,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
} as const;