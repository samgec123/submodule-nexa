import { fetchPlaceholders } from "../../scripts/aem.js";
import util from "./utility.js";
const { apiDomain } = await fetchPlaceholders();


async function getCompanyListSearch(searchText, financierId) {
    const url = `${apiDomain}/app-service/api/v1/company-dms-search`;
    const requestBody = { search_text: searchText, financier_id: financierId };
    const userType = util.getCookie('journeyType');
    const headers = util.setHeader(userType);
    const { success, data, message } = await util.fetchData(url, requestBody, headers);

    if (success) {
      return { success: true, data };
    }

    return { success: false, message: message || 'Failed to fetch data.' };
  }


async function getCompanyOffers(requestBody) {
    const url = `${apiDomain}/app-service/api/v1/company-dms-offers`;
    const userType = util.getCookie('journeyType');
    const headers = util.setHeader(userType);
    const { success, data, message } = await util.fetchData(url, requestBody, headers);

    if (success) {
      return { success: true, data };
    }

    return { success: false, message: message || 'Failed to fetch data.' };
}

async function fetchExchangeDetails(body) {
    const url = `${apiDomain}/app-service/api/v1/exchange-details`;
    const userType = util.getCookie('journeyType');
    const headers = util.setHeader(userType);
    const { success, data, message } = await util.fetchData(url, body, headers);

    if (success) {
        return { success: true, data };
    }

    return { success: false, message: message || 'Failed to fetch exchange details.' };
}

async function setInspectionDetails(body) {
  const url = `${apiDomain}/app-service/api/v1/inspection-details`;
  const userType = util.getCookie('journeyType');
  const headers = util.setHeader(userType);
  const { success, data, message } = await util.fetchData(url, body, headers);
  if (success) {
      return { success: true, data };
  }

  return { success: false, message: message || 'Failed to submit inspection details.' };
}


export { fetchExchangeDetails, getCompanyListSearch, getCompanyOffers, setInspectionDetails };