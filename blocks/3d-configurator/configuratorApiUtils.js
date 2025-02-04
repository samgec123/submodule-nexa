import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { fetchData } from '../../utility/apiUtils.js';
import { fetchDataUsingToken } from '../../commons/utility/apiUtils.js';
import { stubbedResponse } from './stubbedResponse.js';

const CAR_CONFIG_DETAILS_PATH = '/app-service/api/v1/common/partmaster/car-config-details';

const configuratorApiUtils = {
  getCarConfigDetails: async (modelCd, variantCd, catgCd = 'AA', onError, fromYear = 2021, toYear = 9999) => {
    const placeholders = await fetchPlaceholders();
    const url = `${placeholders.publishDomain}${CAR_CONFIG_DETAILS_PATH}?modelCd=${modelCd}&variantCd=${encodeURIComponent(variantCd)}&catgCd=${catgCd}&fromYear=${fromYear}&toYear=${toYear}`;
    try {
      const response = await fetch(url, { method: 'GET' });
      const result = await response.json();
      return result;
    } catch {
      // return stubbedResponse.ignisAccessories;
      throw new Error('getCarConfigDetails API failing');
    }
  },
  getSavedCarsConfigs: async (number, doRedirect = true) => {
    try {
      const { publishDomain, apiCarConfigFetchByMobile } = await fetchPlaceholders();
      const url = `${publishDomain}${apiCarConfigFetchByMobile}?mobileNo=${number}`;
      const response = await fetchDataUsingToken(url, 'EXC', doRedirect);
      return response?.data || [];
    } catch (error) {
      return [];
    }
  },
  saveCarConfig: async (payload, doRedirect = true) => {
    try {
      const { publishDomain, apiCarConfigSave } = await fetchPlaceholders();
      const url = `${publishDomain}${apiCarConfigSave}`;
      const response = await fetchDataUsingToken(url, 'EXC', doRedirect, 'POST', payload);
      return response?.data;
    } catch (error) {
      throw error;
    }
  },
  updateCarConfig: async (payload, doRedirect = true) => {
    try {
      const { publishDomain, apiCarConfigUpdate } = await fetchPlaceholders();
      const url = `${publishDomain}${apiCarConfigUpdate}`;
      const response = await fetchDataUsingToken(url, 'EXC', doRedirect, 'POST', payload);
      return response?.data;
    } catch (error) {
      return null;
    }
  },
  getCarConfigSummary: async (pinNumber, doRedirect = true) => {
    try {
      const { publishDomain, apiCarConfigFetchSummary } = await fetchPlaceholders();
      const url = `${publishDomain}${apiCarConfigFetchSummary}?pinNo=${pinNumber}`;
      const response = await fetchDataUsingToken(url, 'EXC', doRedirect);
      return response?.data;
    } catch (error) {
      return null;
    }
  },
  deleteCarConfig: async (pinNumbers, number, doRedirect = true) => {
    try {
      const { publishDomain, apiCarConfigDeleteByPin } = await fetchPlaceholders();
      const url = `${publishDomain}${apiCarConfigDeleteByPin}?pinNumbers=${pinNumbers}&mobileNo=${number}`;
      const response = await fetchDataUsingToken(url, 'EXC', doRedirect, 'DELETE');
      return response?.data;
    } catch (error) {
      return null;
    }
  },
  getConfigCarList: async () => {
    try {
      const { publishDomain } = await fetchPlaceholders();
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ConfiguratorCarList;channel=EXC;locale=en;`;
      const result = await fetchData(graphQlEndpoint);
      return result?.carModelList?.items || [];
    } catch (error) {
      return null;
    }
  },
  getConfigCarByModelCd: async (modelCd) => {
    try {
      const { publishDomain } = await fetchPlaceholders();
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ConfiguratorCarList;channel=EXC;locale=en;modelCd=${modelCd};`;
      const result = await fetchData(graphQlEndpoint);
      return result?.carModelList?.items || [];
    } catch (error) {
      return null;
    }
  },
  formatCurrency: (price) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(price)}`;
  },
};

export default configuratorApiUtils;
