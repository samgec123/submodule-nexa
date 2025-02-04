import { fetchPlaceholders } from '../../scripts/aem.js';
import util from "./utility.js";

const { apiDomain } = await fetchPlaceholders();

function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) { // Replace i++ with i += 1
    let c = ca[i];
    while (c.charAt(0) === ' ') { // Use strict equality
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) { // Use strict equality
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

async function fetchData(url, requestBody, headers) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.message || 'Request failed.');
    }

    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }
  return headers;
}


async function getAllLoanOffers(tenure, enquiryId, down_payment, financier_id, loan_type, filterOn, dealer_id) {
  const url = `${apiDomain}/app-service/api/v1/offers/all`;

  const optionalParams = { down_payment, financier_id, loan_type, filterOn, dealer_id };

  // Filter out undefined or null values dynamically
  const requestBody = {
    enquiry_id: enquiryId,
    tenure,
    ...Object.fromEntries(
      Object.entries(optionalParams).filter(([_, value]) => value !== undefined && value !== null)
    )
  };
  const headers = getAuthHeaders();

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch Preapproved loans.' };
}

async function getPreApprovedLoanOffers(body) {
  const url = `${apiDomain}/app-service/api/v1/preApprovedOffers`;
  const enquiryId = sessionStorage.getItem('enquiryId');
  const requestBody = {
    enquiry_id: enquiryId,
    tenure: body.tenure,
    email: body.email,
    dob: body.dob,
    mobile: body.mobile,
    dealer_id: body.dealer_id,
  };
  const headers = getAuthHeaders();
  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to go back.' };
}

async function getLoanScheme() {
  const url = `${apiDomain}/app-service/api/v1/loan-scheme`;
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

async function selectedLoanOffer(body) {
  const journeyType = getCookie('journeyType');
  let headers; let url; let dealerAuthorization; let
    authorization;
  if (journeyType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/selected-offer`;
    dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers = {
      'Content-Type': 'application/json',
      'X-dealer-Authorization': dealerAuthorization,
    };
  } else {
    url = `${apiDomain}/app-service/api/v1/customer/selected-offer`;
    authorization = sessionStorage.getItem('access_token');
    headers = {
      'Content-Type': 'application/json',
      Authorization: authorization,
    };
  }
  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to select offer.' };
}

async function loanOffersDownload(body) {
  const url = `${apiDomain}/app-service//api/v1/download-offers-pdf`;
  const headers = getAuthHeaders();

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to download.' };
}

export {
  getAllLoanOffers, getPreApprovedLoanOffers, getLoanScheme, selectedLoanOffer, loanOffersDownload,
};
