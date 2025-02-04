import { fetchPlaceholders } from '../../scripts/aem.js';
import util from './utility.js';

const { apiDomain } = await fetchPlaceholders();

async function saveMrLoanApplication(requestBody) {
  const url = `${apiDomain}/app-service/api/v1/mr/save`;
  const userType = util.getCookie('journeyType');
  const headers = util.setHeader(userType);
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch data.' };
}

async function consentMrLoanApplication(requestBody) {
  const url = `${apiDomain}/app-service/api/v1/mr/consent`;
  const userType = util.getCookie('journeyType');
  const headers = util.setHeader(userType);
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }
  return { success: false, message: message || 'Failed to fetch data.' };
  
}

export { saveMrLoanApplication, consentMrLoanApplication };
