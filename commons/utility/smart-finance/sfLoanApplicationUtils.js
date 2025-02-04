import { fetchPlaceholders } from '../../scripts/aem.js';
import util from "./utility.js";
const { apiDomain , sfChannelId} = await fetchPlaceholders();

async function getCustomerData(enquiryId) {
  const journeyType = util.getCookie('journeyType');
  let url;
  if (journeyType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/dealer-customer-data/${enquiryId}`;
  } else {
    url = `${apiDomain}/app-service/api/v1/customer-journey/customer-data/${enquiryId}`;
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: util.setHeader(journeyType),
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function verifyPincode(cityCode, pinCode) {
  const url = `${apiDomain}/app-service/api/v1/city/${cityCode}/pin/${pinCode}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function getAddrDetailStates() {
  const url = `${apiDomain}/app-service/api/v1/state/all`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function getAddrDetailCities(stateID, financierId, panIndiaCities) {
  const url = `${apiDomain}/app-service/api/v1/city/${stateID}?financierId=${financierId}&panindiacities=${panIndiaCities}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function uploadDocument(formData) {
  const url = `${apiDomain}/app-service/api/v1/sub-document/upload`;
  const userType = util.getCookie('journeyType');
  const headers = {
    'X-Channel': sfChannelId,
  };
  if(userType === 'dealer') {
    headers['X-dealer-Authorization'] = sessionStorage.getItem('mspin_token');
  }
  else {
    headers.Authorization = sessionStorage.getItem('access_token');
  }
 
  try {
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: headers,
    
    });

    //delete response.headers.get('Content-Type');

    const result = await response.json();

    if (response.ok && result.status === 'SUCCESS') {
      return { success: true, data: result };
    }

    return { success: false, message: result.error_message || '' };
  } catch (error) {
    return { success: false, message: '' };
  }
}

async function collateDocument(formData) {
  const url = `${apiDomain}/app-service/api/v1/sub-document/collate`;
  const userType = util.getCookie('journeyType');
  const headers = {
    'X-Channel': sfChannelId,
  };
  if(userType === 'dealer') {
    headers['X-dealer-Authorization'] = sessionStorage.getItem('mspin_token');
  }
  else {
    headers.Authorization = sessionStorage.getItem('access_token');
  }
 
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: headers,
    });

    const result = await response.json();

    if (response.ok && result.status === 'SUCCESS') {
      return {
        success: true,
        data: result,
        message: result.message || '',
      };
    }

    return {
      success: false,
      message: result.message || '',
    };
  } catch (error) {
    return { success: false, message: '' };
  }
}

async function getDocsByEmpType(financierId, empTypeId, subEmploymentId, residenceTypeId) {
  const url = `${apiDomain}/app-service/api/v1/docs-with-emp-type/${financierId}/${empTypeId}?subEmploymentId=${subEmploymentId}&residenceTypeId=${residenceTypeId}`;
  const headers = { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (response) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function stateSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/old-state-search`;
  const requestBody = {
    search_text: body.search_text,
    financier_id: body.financier_id,
  };
  const userType = util.getCookie('journeyType');
  const { success, data, message } = await util.fetchData(url, requestBody, util.setHeader(userType));

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function branchSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/city/branch/search`;
  const requestBody = {
    city: body.city,
    search_text: body.search_text,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function cityBranch(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/city/branch`;
  const requestBody = {
    rule_id: body.rule_id,
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

async function loanApplicantBranch(body) {
  const url = `${apiDomain}/app-service/api/v1/loan-applicant/branch`;
  const enquiryId = sessionStorage.getItem('enquiryId');
  const requestBody = {
    city: body.city,
    branch_name: body.branch_name,
    branch_address: body.branch_address,
    branch_code: body.branch_code,
    state: body.state,
    rah_name: body.rah_name,
    pin_code: body.pin_code,
    rah_dp_code: body.rah_dp_code,
    branch_ifsc_code: body.branch_ifsc_code,
    enquiry_id: enquiryId,
    financier_id: body.financier_id,
  };
  const userType = util.getCookie('journeyType');
  const { success, data, message } = await util.fetchData(url, requestBody, util.setHeader(userType));

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function branchDetail(body) {
  const url = `${apiDomain}/app-service/api/v1/branch-detail`;
  const requestBody = {
    financier_id: body.financier_id,
    rule_id: body.rule_id,
  };
  const headers = { 'Content-Type': 'application/json', 'X-Channel': '1000000' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch Detail.' };
}

async function fetchCities(body) {
  const url = `${apiDomain}/app-service/api/v1/fetch-cities`;
  const requestBody = {
    financier_id: body.financier_id,
    state: body.state,
  };
  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Cities.' };
}

async function fetchOldBranchCities(body) {
  const url = `${apiDomain}/app-service/api/v1/city/search`;
  const requestBody = {
    financier_id: body.financier_id,
    search_text: body.search_text,
  };
  const headers = { 'Content-Type': 'application/json' };
  const { status: success, cities: data, message } = {
    status: 'Success',
    cities: [
      'AHMEDABAD',
      'AHMADNAGAR',
      'MOHAMMADPUR TALUKA AHMADPUR AS',
    ],
    message: 'Data fetched successfully',
  };
  if (success) {
    return { success: true, data };
  }
  return { success: false, message: message || 'Failed to fetch Cities.' };
}

async function standardStateSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/state/search`;
  const requestBody = {
    financier_id: body.financier_id,
  };
  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch State.' };
}

async function standardBranchSearch(body) {
  const url = `${apiDomain}/app-service/api/v1/standard/branch/search`;
  const requestBody = {
    financier_id: body.financier_id,
    city: body.city,
    state: body.state,
    search_text: body.search_text,
  };

  const headers = { 'Content-Type': 'application/json' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

async function ifscBranchDetail(body) {
  const url = `${apiDomain}/app-service/api/v1/ifsc/branch-detail`;
  const requestBody = {
    financier_id: body.financier_id,
    ifsc_code: body.ifsc_code,
  };
  const headers = { 'Content-Type': 'application/json', 'X-Channel': '1000000' };
  const { success, data, message } = await util.fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Branch.' };
}

async function saveDraftLoanApplication(body) {
  const url = `${apiDomain}/app-service/api/v1/draft-loan-application`;
  const userType = util.getCookie('journeyType');
  try {
    const { success, data, message } = await util.fetchData(url, body, util.setHeader(userType));
    if (success) {
      return { success: true, data };
    }
    return { success: false, message: message || 'Failed to save loan application.' };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

async function saveAddressLoanApplication(body) {
  body['channel_id'] = sfChannelId;
  const url = `${apiDomain}/app-service/api/v1/customer/loan-applicant`;
  const userType = util.getCookie('journeyType');
    try {
    const { success, data, message } = await util.fetchData(url, body, util.setHeader(userType));
    if (success) {
      return { success: true, data };
    }
    return { success: false, message: message || 'Failed to save loan application.' };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

async function fetchOCRStatus() {
  const url = `${apiDomain}/app-service/api/v1/ocr-validation/67580e80ad6e3900093d75fd`;
  const userType = util.getCookie('journeyType');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: util.setHeader(userType),
    });
    const result = await response.json();
    if (response.ok && result.ocr_status) {
      return {
        success: true,
        data: result,
        message: result.ocr_status || '',
      };
    }
    return {
      success: false,
      message: result.ocr_status || '',
    };
  } catch (error) {
    return { success: false, message: '', error };
  }
}

export { getCustomerData,verifyPincode, getAddrDetailStates, getAddrDetailCities,
  collateDocument, uploadDocument, stateSearch,
  branchSearch, cityBranch, loanApplicantBranch, branchDetail, fetchCities,
  standardStateSearch, standardBranchSearch,
  ifscBranchDetail, saveDraftLoanApplication, getDocsByEmpType,
  fetchOCRStatus, fetchOldBranchCities, saveAddressLoanApplication
};
