import { fetchPlaceholders } from '../commons/scripts/aem.js';
import utility from './utility.js';

function toTitleCase(word) {
  if (typeof word !== 'string' || word.length === 0) {
    return word;
  }

  if (/\d/.test(word)) {
    return word.toUpperCase();
  }

  return word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}

async function fetchDataUsingPost(url, payload) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
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

function sentenceToTitleCase(sentence) {
  if (!sentence.includes(' ')) {
    return toTitleCase(sentence);
  }

  return sentence
    .split(' ')
    .map((word) => {
      if (/\d/.test(word)) {
        return word.toUpperCase();
      }

      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    })
    .join(' ');
}

export function processData(data, config) {
  if (!Array.isArray(data)) {
    return [];
  }
  const itemMap = data.reduce((map, item) => {
    const key = config.getKey(item);
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
    cityCode: item.cityCd,
    latitude: item.latitude,
    longitude: item.longitude,
    forCode: item.forCode,
  }),
  getFormat: (info) => `${info.cityDesc}:${info.cityCode}`,
};

const stateConfig = {
  getKey: (item) => (item.STATE_DESC ? sentenceToTitleCase(item.STATE_DESC) : null),
  getProcessedItem: (item) => ({
    stateDesc: sentenceToTitleCase(item.STATE_DESC),
    stateCode: item.STATE_CD,
  }),
  getFormat: (info) => `${info.stateDesc}:${info.stateCode}`,
};

const allModelConfig = {
  getKey: (item) => (item.modelDesc ? sentenceToTitleCase(item.modelDesc) : null),
  getProcessedItem: (item) => ({
    modelDesc: sentenceToTitleCase(item.modelDesc),
    modelCd: item.modelCd,
  }),
  getFormat: (info) => `${info.modelDesc}:${info.modelCd}`,
};

export async function fetchData(url, onError = () => { }) {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      onError({ status: response.status });
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

function getLocalStorage(key) {
  return localStorage.getItem(key);
}

function formatCurrency(value) {
  const numericValue = String(value).replace(/[^\d.]/g, '');
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  });
  const formattedValue = formatter.format(numericValue);
  return formattedValue;
}

const apiUtils = {
  getFormattedDealerCityList: async (stateCd, onError) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=EXC&stateCode=${stateCd}`;
    return fetchData(url, onError).then((data) => processData(data, cityConfig));
  },

  getDealerCityList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=EXC`;
    return fetchData(url).then((data) => data);
  },

  getDealerList: async (cityCd) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerMaster)}?outletType=O&type=S,S3&channel=EXC&cityCd=${cityCd}`;
    return fetchData(url).then((data) => processData(data, dealerConfig));
  },

  getCityList: async (stateCd) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiCityBrief)}?stateCd=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getStateList: async (onError) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url, onError).then((data) => processData(data, stateConfig));
  },

  getAllModelList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiCarModelList)}?channel=EXC`;
    return fetchData(url).then((data) => processData(data, allModelConfig));
  },

  getAllVariantList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getModelList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarList;channel=EXC;locale=en;?x=0`;
    const result = await fetchData(graphQlEndpoint);
    const models = result?.carModelList?.items || [];
    return models.map((model) => `${model.modelDesc}:${model.modelCd}`);
  },
  getGeoLocation: async (location) => {
    const { publishDomain, apiCityPincode } = await fetchPlaceholders();
    const url = new URL(publishDomain + apiCityPincode);
    if (location.latitude && location.longitude) {
      url.searchParams.append('latitude', location.latitude);
      url.searchParams.append('longitude', location.longitude);
    } else if (location.pinCode) {
      url.searchParams.append('pinCode', location.pinCode);
    } else if (location.cityCd) {
      url.searchParams.append('cityCd', location.cityCd);
    } else {
      throw new Error('Either pinCd, cityCd or latitude and longitude must be provided');
    }
    return fetchData(url.href);
  },
  submitBTDForm: async (payload, tid, requestId, otp) => {
    const { publishDomain, lqsApi } = await fetchPlaceholders();
    const url = `${publishDomain}${lqsApi}`;
    const txnId = btoa(`${requestId}|${otp}`);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      tid,
      'x-txn-id': txnId,
    };

    try {
      return await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return {};
    }
  },
  getVariantList: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0]?.variants || [];
    return variants.map((variant) => `${variant.variantDesc}:${variant.variantCd}`);
  },
  getVariantFeaturesList: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantFeaturesList;modelCd=${modelCd};locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0] || [];
    return variants;
  },

  getVariantsSpecifications: async (variant1, variant2, variant3) => {
    const { publishDomain } = await fetchPlaceholders();
    const variants = [variant1, variant2, variant3].filter(Boolean);
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantsSpecifications;${variants.map((v, i) => `variant${i + 1}=${v}`).join(';')};`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carVariantList?.items || [];
  },

  getCarLabelsList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarLabels;locale=en?x=0`;
    const result = await fetchData(graphQlEndpoint);
    const labels = result?.carLabelsList?.items || [];
    return labels;
  },

  getVariantPrice: async (variantCode) => {
    const urlParams = new URLSearchParams(window.location.search);
    const forCode = urlParams?.get('forCode') || '08';
    const storedVariantPrices = {};
    const storedPrices = getLocalStorage('configuratorPrice') ? JSON.parse(getLocalStorage('configuratorPrice')) : {};

    const { publishDomain, apiExShowroomDetail } = await fetchPlaceholders();

    if (storedPrices[variantCode]?.price[forCode]) {
      const expiryTimestamp = storedPrices[variantCode].timestamp;
      const currentTimestamp = new Date().getTime();
      if (currentTimestamp > expiryTimestamp) { 
        localStorage.removeItem('configuratorPrice');
        return apiUtils.getVariantPrice(variantCode);
      }
     // const storedPrice = storedPrices[variantCode].price[forCode];
      return storedPrices;
    }

    // Perform fetch only if price not already in localStorage
    const apiUrl = `${publishDomain}${apiExShowroomDetail}?forCode=${forCode}&variantCodes=${variantCode}&variantInfoRequired=true`;

    const url = new URL(apiUrl);

    let priceData;
    try {
      const response = await fetch(url.href, {
        method: 'GET',
      });
      priceData = await response.json();
    } catch (error) {
      priceData = {};
    }

    if (priceData?.error === false && priceData?.data) {
   
      const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000; // 1 day from now
      let storedPrices = {}; 
    
      priceData?.data?.models.forEach((variantList) => {
        variantList.exShowroomDetailResponseDTOList.forEach((obj) => {
        
          const formattedPrice = formatCurrency(obj.exShowroomPrice);
    
    
          if (!storedPrices[obj.variantCd]) {
            storedPrices[obj.variantCd] = {
              price: {},
              timestamp: timestamp
            };
          }
          if (!storedPrices[obj.variantCd].price[obj.forCode]) {
            storedPrices[obj.variantCd].price[obj.forCode] = {};
          }
 
          storedPrices[obj.variantCd].price[obj.forCode][obj.colorType] = formattedPrice;
        });
      });
    
      localStorage.setItem('configuratorPrice', JSON.stringify(storedPrices));
     // return storedPrices[variantCode].price[forCode];
     return storedPrices;
    }
    return '';
  },

  getVariantDetailsByPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantDetailsByPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carVariantByPath?.item;
  },

  getCarDetailsByVariantPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByVariantPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items[0] ?? {};
  },

  getCarModelByPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByPath;path=${path}`;
    try {
      return (await fetchData(graphQlEndpoint))?.carModelByPath?.item || {};
    } catch (e) {
      return {};
    }
  },
  getActiveVariantList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ActiveVariantList;channel=EXC;locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items;
  },
  getModelPrice: async (modelCode, channel, forCode) => {
    const { publishDomain, apiExShowroomDetail } = await fetchPlaceholders();
    const activeVariantList = await apiUtils.getActiveVariantList();
    const storedPrices = getLocalStorage('modelPrice') ? JSON.parse(getLocalStorage('modelPrice')) : {};
    const currentTime = new Date().getTime();
    const isValid = Object.keys(storedPrices).includes(modelCode) && (Object.values(storedPrices).some((item) => item.timestamp > currentTime && Object.hasOwn(item.price, forCode)));
    if (isValid) {
      return storedPrices[modelCode].price[forCode];
    }
  
    const apiUrl = publishDomain + apiExShowroomDetail;
  
    const params = {
      forCode,
      channel,
    };
  
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    url.searchParams.append("variantInfoRequired",true);
  
    let data;
    try {
      const response = await fetch(url.href, { method: 'GET' });
      data = await response.json();
    } catch (error) {
      data = {};
    }
  
    if (data?.error === false && data?.data) {
      const timestamp = currentTime + (1 * 24 * 60 * 60 * 1000);
      data.data.models.forEach((item) => {
        const { modelCd, lowestExShowroomPrice } = item;
  
        if (!Object.hasOwn(storedPrices, modelCd)) {
          storedPrices[modelCd] = { price: {}, timestamp };
        }
        const variantList = activeVariantList.find(item => item.modelCd === modelCd) || null;  
        const lowestPrice = utility.getLowestPriceVariant(variantList, item.exShowroomDetailResponseDTOList)

        storedPrices[modelCd].price[forCode] = lowestPrice.exShowroomPrice;
        storedPrices[modelCd].timestamp = timestamp;
      });
  
      localStorage.setItem('modelPrice', JSON.stringify(storedPrices));
    }
  
    return storedPrices[modelCode]?.price[forCode] || '';
  },
  getCarVariantsByModelCd: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarVariantByModelCd;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carVariantList?.items || [];
    return variants;
  },
  getCarVariantsColoursByVariantCd: async (variantCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarColorByVariantCode;variantCd=${variantCd}`;
    const result = await fetchData(graphQlEndpoint);
    const colours = result?.carVariantList?.items[0]?.colors || [];
    return colours;
  },
  getCarHotspots: async (modelCd, hotspotId) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarHotspotList;modelCd=${modelCd};locale=en;hotspotId=${hotspotId};`;
    const result = await fetchData(graphQlEndpoint);
    const hotspot = result?.carHotspotList?.items[0] || [];
    return hotspot;
  },
  getCarHighlights: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarHotspotList;modelCd=${modelCd};locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carHotspotList?.items;
  },
  getConfiguratorCarList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ConfiguratorCarList;channel=EXC;locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items;
  },
};

export default apiUtils;
export { formatCurrency };
