/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import { fetchPlaceholders } from "../scripts/aem.js";
import authUtils from "./authUtils.js";
import environmentSelection from "./domainUtils.js";

const {
  apiDealerMaster,
  apiNearestDealers,
  apiVehicleModel,
  apiCityPincode,
  lqsApi,
  apiDealerOnlyCities,
  publishDomain,
} = await fetchPlaceholders();

export function toTitleCase(word) {
  if (typeof word !== "string" || word.length === 0) {
    return word;
  }

  if (/\d/.test(word)) {
    return word.toUpperCase();
  }

  return word
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

export function sentenceToTitleCase(sentence) {
  if (!sentence.includes(" ")) {
    return toTitleCase(sentence);
  }

  return sentence
    .split(" ")
    .map((word) => {
      if (/\d/.test(word)) {
        return word.toUpperCase();
      }

      return word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    })
    .join(" ");
}

export function formatRupeesWithSymbol(price) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  return `₹ ${formatter.format(price).replaceAll(',', ' ')}`;
}

function processData(data, config) {
  if (!Array.isArray(data)) {
    return [];
  }
  const itemMap = data.reduce((map, item) => {
    const key = config?.getKey(item);
    if (key) {
      const processedItem = config.getProcessedItem(item);
      map[key] = processedItem;
    }
    return map;
  }, {});
  return Object.values(itemMap).map(config.getFormat);
}

const dealerConfig = {
  getKey: (item) => (item.name ? sentenceToTitleCase(item.name) : null),
  getProcessedItem: (item) => ({
    name: sentenceToTitleCase(item.name),
    dealerUniqueCd: item.dealerUniqueCd,
  }),
  getFormat: (info) => `${info.name}:${info.dealerUniqueCd}`,
};

const cityConfig = {
  getKey: (item) => (item.cityDesc ? sentenceToTitleCase(item.cityDesc) : null),
  getProcessedItem: (item) => ({
    cityDesc: sentenceToTitleCase(item.cityDesc),
    cityCode: item.cityCode,
    latitude: item.latitude,
    longitude: item.longitude,
    forCode: item.forCode,
  }),
  getFormat: (info) => `${info.cityDesc}:${info.cityCode}`,
};

const stateConfig = {
  getKey: (item) =>
    item.STATE_DESC ? sentenceToTitleCase(item.STATE_DESC) : null,
  getProcessedItem: (item) => ({
    stateDesc: sentenceToTitleCase(item.STATE_DESC),
    stateCode: item.STATE_CD,
  }),
  getFormat: (info) => `${info.stateDesc}:${info.stateCode}`,
};

const allModelConfig = {
  getKey: (item) =>
    item.modelDesc ? sentenceToTitleCase(item.modelDesc) : null,
  getProcessedItem: (item) => ({
    modelDesc: sentenceToTitleCase(item.modelDesc),
    modelCd: item.modelCd,
  }),
  getFormat: (info) => `${info.modelDesc}:${info.modelCd}`,
};

async function fetchData(url, onError) {
  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      if (onError) {
        onError({ status: response.status });
      }
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}
async function fetchDataUsingPost(url, payload) {
  const { apiKey } = await fetchPlaceholders();
  const defaultHeaders = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

async function fetchDataFromGraphQL(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

export async function fetchDataUsingToken(
  url,
  channel,
  doRedirect = false,
  method = "GET",
  payload = null
) {
  const token = await authUtils.getToken(doRedirect);
  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: token,
    channel,
  };
  try {
    const request = { method, headers: defaultHeaders };
    if (payload) {
      request.body = JSON.stringify(payload);
    }
    const response = await fetch(url, request);
    if (response.status === 400) {
      const result = await response.json();
      const errorMessage =
        result.errors && result.errors[0]
          ? result.errors[0].errorMessage
          : "Unknown error";
      throw new Error(errorMessage);
    }
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  } catch (error) {
    throw error;
  }
}

const apiUtils = {
  getFormattedDealerCityList: async (stateCd, channel) => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiDealerOnlyCities
    )}?channel=${channel}&stateCode=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getDealerCityList: async () => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiDealerOnlyCities
    )}?channel=EXC`;
    return fetchData(url).then((data) => data);
  },

  getDealerList: async (cityCd, channel) => {
    const url = `${publishDomain}${apiDealerMaster}?outletType=O&type=S,S3&channel=${channel}&cityCd=${cityCd}`;
    return fetchData(url).then((data) => processData(data, dealerConfig));
  },

  getNearestDealers: async (
    latitude,
    longitude,
    distance,
    dealerType,
    onError
  ) => {
    let url = `${publishDomain}${apiNearestDealers}?longitude=${longitude}&latitude=${latitude}&distance=${distance}`;
    if (dealerType) {
      url += `&dealerType=${dealerType}`;
    }

    return fetchData(url, onError);
  },

  getCityList: async (stateCd) => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiCityBrief
    )}?stateCd=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getStateList: async () => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiStateBrief
    )}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getDealerStateList: async () => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiStateBrief,
    )}`;
    return fetchData(url);
  },

  getAllModelList: async (channel) => {
    const url = `${publishDomain}${apiVehicleModel}?channel=${channel}`;
    return fetchData(url).then((data) => processData(data, allModelConfig));
  },

  getAllVariantList: async () => {
    const url = `${await fetchPlaceholders().then(
      (p) => p.publishDomain + p.apiStateBrief
    )}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getModelList: async (channel) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarList;channel=${channel}`;
    const result = await fetchDataFromGraphQL(graphQlEndpoint);
    const models = result?.carModelList?.items || [];
    return models.map((model) => `${model.modelDesc}:${model.modelCd}`);
  },

  getGeoLocation: async (location) => {
    const url = new URL(publishDomain + apiCityPincode);
    if (location.latitude && location.longitude) {
      url.searchParams.append("latitude", location.latitude);
      url.searchParams.append("longitude", location.longitude);
    } else if (location.pinCode) {
      url.searchParams.append("pinCode", location.pinCode);
    } else if (location.cityCd) {
      url.searchParams.append("cityCd", location.cityCd);
    }
    return fetchData(url.href);
  },

  submitBTDForm: async (payload, tid, requestId, otp) => {
    const url = `${publishDomain}${lqsApi}`;
    const txnId = btoa(`${requestId}|${otp}`);
    const defaultHeaders = {
      "Content-Type": "application/json",
      tid,
      "x-txn-id": txnId,
    };
    try {
      return await fetch(url, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return {};
    }
  },

  getVariantList: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0].variants || [];
    return variants.map(
      (variant) => `${variant.variantDesc}:${variant.variantCd}`
    );
  },
  async fetchListOfCities() {
    const cityList = [
      "PENDRA ROAD",
      "SRI KARANPUR",
      "ZIRO",
      "AARANG",
      "JAIPUR",
      "DELHI",
      "NOIDA",
      "GURUGRAM",
    ];
    return cityList;
  },
  fetchFromUrl: async (url) =>
    fetch(url)
      .then((response) => response.json())
      .then((res) => res),

  async fetchExShowroomPrices(
    forCode,
    modelCodes,
    channel,
    variantInfoRequired
  ) {
    const { apiExShowroomDetail } = await fetchPlaceholders();
    const apiUrl = publishDomain + apiExShowroomDetail;
    const params = {
      forCode,
      channel,
      modelCodes,
      variantInfoRequired,
    };
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => {
      if (params[key] !== "") {
        url.searchParams.append(key, params[key]);
      }
    });
    try {
      const response = await fetch(url.href, { method: "GET" });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  },
  getLocalStorage(key) {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  },
  getCarDetailsByVariantPath: async (path) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByVariantPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items[0] ?? {};
  },
  getDealerCities: async (stateCd = null) => {
    let stateCodeParam = "";
    if (stateCd) {
      stateCodeParam = `&stateCode=${stateCd}`;
    }
    const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=EXC${stateCodeParam}`;
    return fetchData(urlWithParams);
  },

  getCitiesList: async () => {
    const channel = await environmentSelection.getChannel();
    const url = `${publishDomain}/dms/v1/api/common/msil/dms/dealer-only-cities?channel=${channel}`;
    return fetchData(url);
  },

  getCarVariantsByModelCd: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarVariantByModelCd;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carVariantList?.items || [];
    return variants;
  },
  getCarVariantsColoursByVariantCd: async (variantCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarColorByVariantCode;variantCd=${variantCd}?p=10`;
    const result = await fetchData(graphQlEndpoint);
    const colours = result?.carVariantList?.items[0]?.colors || [];
    return colours;
  },
  getFuelTypeByModelCd: async (modelCd) => {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantFuelType;modelCd=${modelCd}?p=10`;
    return fetchData(graphQlEndpoint);
  },
  otpValidationRequest: async (otp, requestId, mobileNumber, tid) => {
    const { apiVerifyOtp } = await fetchPlaceholders();
    const headers = {
      "Content-Type": "application/json",
    };
    if (tid) {
      headers.tid = tid;
    }
    return fetch(publishDomain + apiVerifyOtp, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        requestId,
        mobile: mobileNumber,
        otp,
      }),
    });
  },
  otpValidationRequestForTeaser: async (
    otp,
    requestId,
    mobileNumber,
    name,
    email,
    consent
  ) => {
    const { apiVerifyOtpForTeaser } = await fetchPlaceholders();
    return fetch(apiVerifyOtpForTeaser, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        mobile: mobileNumber,
        otp,
        name,
        email,
        consent,
      }),
    });
  },
  sendOtpRequest: async (mobileNum, tid) => {
    const { apiSendOtp } = await fetchPlaceholders();
    const headers = {
      "Content-Type": "application/json",
    };
    if (tid) {
      headers.tid = tid;
    }
    return fetch(publishDomain + apiSendOtp, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ mobile: mobileNum }),
    });
  },

  getCarList: async (channel) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarList;channel=${channel};locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items || [];
  },

  getTestDriveDetails: async (
    number,
    fromDate,
    toDate,
    channel,
    doRedirect = true
  ) => {
    const { apiTestDriveDetails } = await fetchPlaceholders();
    const url = `${publishDomain}${apiTestDriveDetails}?customerMobileNumber=${number}&fromDate=${fromDate}&toDate=${toDate}`;
    try {
      const response = await fetchDataUsingToken(url, channel, doRedirect);
      return response?.data?.data || [];
    } catch (error) {
      return [];
    }
  },

  getBookingDetails: async (number, channel, doRedirect = true) => {
    const { apiBookingDetailsByNumber } = await fetchPlaceholders();
    const url = `${publishDomain}${apiBookingDetailsByNumber}?mobile=${number}`;
    try {
      const response = await fetchDataUsingToken(url, channel, doRedirect);
      return response?.data || [];
    } catch (error) {
      return [];
    }
  },
  sendOtpRequestForTeaser: async (mobileNum) => {
    const { apiSendOtpForTeaser } = await fetchPlaceholders();
    return fetch(apiSendOtpForTeaser, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile: mobileNum }),
    });
  },
  getCarVariantsByModelCode: async (modelCd) => {
    try {
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarVariantsByModelCode;modelCd=${modelCd}`;
      const result = await fetchDataFromGraphQL(graphQlEndpoint);
      const variants = [];
      const totalVariants = result?.carModelList.items || [];
      // eslint-disable-next-line array-callback-return
      totalVariants.map((val) => {
        // eslint-disable-next-line array-callback-return
        [...val.variants].map((item) => {
          item.brochure = val.brochure;
        });
        variants.push(...val.variants);
      });
      variants
        ?.flatMap((item) => item?.variants || [])
        ?.filter((variant) => Object.keys(variant).length > 0)
        ?.map((variant) => {
          const colors = (variant.colors || [])
            ?.filter((color) => Object.keys(color).length > 0)
            ?.map((color) => ({
              colorId: color.colorId,
              eColorDesc: color.eColorDesc,
              isDefault: color.isDefault,
              hexCode: color.hexCode,
              carColorImage: color.carColorImage?._dynamicUrl,
              spinSetAssetPath: color.spinSetAssetPath?._dynamicUrl,
            }));

          return {
            variantCd: variant.variantCd,
            variantDesc: variant.variantDesc,
            variantName: variant.variantName,
            fuelType: variant.fuelType,
            transmission: variant.transmission,
            colors,
            highlightFeatures: variant.highlightFeatures || [],
            highlightFeaturesIcon: (variant.highlightFeaturesIcon || []).map(
              (feature) => ({
                featureName: feature.featureName,
                featureIcon: feature.featureIcon?._dynamicUrl,
              })
            ),
            carFeatures: (variant.carFeatures || []).map((featureObj) => ({
              hotspot: featureObj.feature?.hotspot,
              title: featureObj.feature?.title,
              description: featureObj.feature?.description,
              category: featureObj.feature?.category,
              is3d: featureObj.feature?.is3d,
              image2d: featureObj.feature?.image2d,
              status: featureObj.feature?.status,
            })),
          };
        });
      return variants;
    } catch (error) {
      return [];
    }
  },
  fetchCustomerData: async () => {
    const { publishDomain,fetchCustomerDetails, channelId } = await fetchPlaceholders();
    
    const apiUrl = publishDomain + fetchCustomerDetails;
    const token = await authUtils.getToken(false);
    const headers = {
      "Content-Type": "application/json",
      Authorization: token,
      channel:channelId,
    };

    const body = {
      principalMapCode: 1,
      bookingDetailsYn: "N",
      loyaltyDetailsYn: "Y",
      tcuAssetDetailsYn: "Y",
      enquiryDetailsYn: "N",
      mobileNo: "1234567890",
    };

    const result = await fetchApiData(apiUrl, body, headers);
    return result;
  },
};

export const getEbookUserSession = async () => {
  const sessionToken = localStorage.getItem("ebookToken");
  const mobileNumber = localStorage.getItem("ebookNumber");
  const channel = await environmentSelection.getChannel();
  const mobile = mobileNumber || "";
  const authorization = sessionToken || "";
  const apiUrl = `${environmentSelection.getConfiguration(
    "apiUrl"
  )}usersession?mobileNo=${mobile}&channel=${channel}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
  try {
    const response = await fetch(apiUrl, { method: "GET", headers });
    if (!response.ok) {
      throw new Error("Api response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return error || null;
  }
};

const escapeSessionInfo = (payload) => {
  const jsonString = JSON.stringify(payload.sessionInfo);
  // eslint-disable-next-line no-useless-escape
  const jsonEscaped = jsonString.replace(/"/g, '"');
  return jsonEscaped;
};

export const updateEbookUserSession = async (step, stepDetails = {}) => {
  const ebookFormState = JSON.parse(sessionStorage.getItem("ebookFormState"));
  const ebookGetSessionParsed = JSON.parse(
    sessionStorage.getItem("ebookGetSessionParsed")
  );
  const ebookPostStateData = JSON.parse(
    sessionStorage.getItem("ebookPostState")
  );
  const sessionToken = localStorage.getItem("ebookToken");
  const mobileNumber = localStorage.getItem("ebookNumber");
  const channelName = await environmentSelection.getChannel();
  const mobile = mobileNumber || "";
  const authorization = sessionToken || "";
  const webRefId = ebookGetSessionParsed.WEB_REF_ID || "";

  let buildPayload = {};

  buildPayload = {
    webRefId,
    mobileNumber: mobile,
    channel: channelName,
  };

  const commonInfo = {
    channel: channelName,
    webReferenceId: webRefId,
  };

  if (ebookGetSessionParsed.SESSION_INFO === null) {
    if (step === "selectVehicleStep") {
      buildPayload = {
        ...buildPayload,
        sessionInfo: {
          ...commonInfo,
          ...stepDetails.SESSION_INFO,
        },
      };
    }
    if (step === "selectDealerStep") {
      buildPayload = {
        ...buildPayload,
        sessionInfo: {
          ...commonInfo,
          ...ebookFormState.selectVehicleStep,
          ...stepDetails.SESSION_INFO,
        },
      };
    }
    if (step === "summaryStep") {
      buildPayload = {
        ...buildPayload,
        sessionInfo: {
          ...commonInfo,
          ...ebookFormState.selectVehicleStep,
          ...ebookFormState.selectDealerStep,
          ...stepDetails.SESSION_INFO,
        },
      };
    }
  } else {
    buildPayload = {
      ...buildPayload,
      sessionInfo: {
        ...ebookGetSessionParsed?.SESSION_INFO,
        ...ebookPostStateData?.sessionInfo,
        ...stepDetails?.SESSION_INFO,
      },
    };
  }
  // updating each step post user session payload in storage for previous button click
  sessionStorage.setItem("ebookPostState", JSON.stringify(buildPayload));

  const escapedSessionInfo = escapeSessionInfo(buildPayload);
  const finalPayload = {
    ...buildPayload,
    sessionInfo: `${escapedSessionInfo}`,
  };
  const apiUrl = `${environmentSelection.getConfiguration(
    "apiUrl"
  )}usersession/`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(finalPayload),
    });
    if (!response.ok) {
      throw new Error("Api response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return error || null;
  }
};

export const getBookingDataFromId = async (id) => {
  const sessionToken = localStorage.getItem("ebookToken");
  const channel = await environmentSelection.getChannel();
  const authorization = sessionToken || "";
  const apiUrl = `${environmentSelection.getConfiguration(
    "apiUrl"
  )}enquiry/v2/booking/webRefId/${id}?channel=${channel}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
  try {
    const response = await fetch(apiUrl, { method: "GET", headers });
    if (!response.ok) {
      throw new Error("Api response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return error || null;
  }
};

export const handleButtonClick = async () => {
  const sessionToken = localStorage.getItem("ebookToken");
  const sessionData = JSON.parse(sessionStorage.getItem("ebookPostState"));
  const url = `${environmentSelection.getConfiguration(
    "apiUrl"
  )}enquiry/v1/booking`;
  const channel = await environmentSelection.getChannel();
  const authorization = sessionToken || "";
  const { sessionInfo } = sessionData;
  const selectedCar = sessionInfo.selectedCar || {};
  const selectedDealer = sessionInfo.selectedDealer || {};
  const buyerProfile = sessionInfo.buyerProfile || {};
  const userProfile = sessionInfo.userProfile || {};
  const webRefId = sessionData.webRefId || "";
  const payload = {
    enqName: userProfile.name,
    mobileNum: userProfile.phoneNumber,
    webRefId,
    preBooking: false,
    vehicle: {
      modelCd: selectedCar.modelCd,
      modelDesc: selectedCar.modelDesc,
      variantCd: selectedCar.variantCd,
      variantDesc: selectedCar.variantCd,
      colorCd: selectedCar.cmsColorCode,
      colorDesc: selectedCar.cmsColorDesc,
      amount: selectedCar.bookingAmount,
    },
    buyer: {
      firstName: buyerProfile.name,
      lastName: '',
      mobileNo: buyerProfile.phoneNumber,
      emailId: buyerProfile.email,
      address1: buyerProfile.address.substring(0, 30),
      address2: buyerProfile.address.substring(30, 60),
    },
    dealer: {
      dealerCd: selectedDealer.code,
      dealerDesc: selectedDealer.name,
      stateCd: selectedDealer.address.stateCode,
      stateDesc: selectedDealer.address.stateName,
      cityCd: selectedDealer.address.cityCode,
      cityDesc: selectedDealer.address.cityName,
      pin: selectedDealer.address.pincode,
      dealerEmail: selectedDealer.email,
      dealerPhone: selectedDealer.phone,
      channel,
      forCd: selectedDealer.forCode,
      mapCd: selectedDealer.mapCd,
      locCd: selectedDealer.locCd,
      parentGrp: selectedDealer.parentGrp,
      tsmEmailId: selectedDealer.tsmEmail,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
    Authorization: authorization,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    // Assuming this field exists in the response
    // Pass the webRefId to handlePaymentRequest
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error("Error:", error);
  }
};
export const handlePaymentRequest = async (paymentWebRefId, paymentSuccessURL) => {
  // e.preventDefault();
  const sessionData = JSON.parse(sessionStorage.getItem("ebookPostState"));
  const { sessionInfo } = sessionData;
  const selectedCar = sessionInfo.selectedCar || {};
  const selectedDealer = sessionInfo.selectedDealer || {};
  const buyerProfile = sessionInfo.buyerProfile || {};
  const webRefId = sessionData.webRefId || "";
  const sessionToken = localStorage.getItem("ebookToken");
  const channel = await environmentSelection.getChannel();
  const authorization = sessionToken || "";
  const url = `${environmentSelection.getConfiguration(
    "apiUrl"
  )}payment/v2/prepare/request`;
  const payload = {
    webRefId, // Use the passed `webRefId`
    paymentWebRefId,
    amount: selectedCar.bookingAmount,
    subAccountId:
      environmentSelection.getEnvironment() === "prod"
        ? selectedDealer.mainOutletAccountId
        : "Dealer1",
    dealerCode: selectedDealer.code,
    forCode: selectedDealer.forCode,
    buyerName: buyerProfile.name,
    buyerMobile: buyerProfile.phoneNumber,
    channel,
    uiSuccessUrl: `${window.location.origin}${paymentSuccessURL}`,
    uiFailureUrl: "http://localhost:3000/en/ebook?step=summary",
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: authorization,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error("Payment Error:", error);
  }
};

async function fetchApiData(url, requestBody, headers) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default apiUtils;
