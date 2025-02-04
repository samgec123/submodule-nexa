import { fetchPlaceholders } from '../scripts/aem.js';

const { apiDomain , sfChannelId} = await fetchPlaceholders();

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

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
      try{
        const result = await response.json();
        return { success: false, message: result.message };
      }
      catch(error){
        return { success: false, message: 'Something went wrong. Please try again later in sometime.' };
      }
    }else{
      const result = await response.json();
      if (result.error) {
        throw new Error(result.message || 'Request failed.');
      }
      return { success: true, data: result };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

const sendCustomerOtp = async (mobile, channel) => {
  const response = await fetch(`${apiDomain}/app-service/api/v1/customer/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile,
      channel, // Use the correct OTP type
    }),
  });
  return response;
};

const validateCustomerOtp = async (mobile, otp, channel) => {
  const tokenMobileResponse = await fetch(`${apiDomain}/app-service/api/v1/token-mobile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile, // Pass the same mobile value here
      otp, // The OTP entered by the user
      channel, // Use the correct channel if needed
    }),
  });
  if (tokenMobileResponse.ok) {
    setCookie('journeyType', 'customer', 1);
  }
  return tokenMobileResponse;
};

const sendDealerOtp = async (mspin, channel) => {
  try {
    const response = await fetch(`${apiDomain}/app-service/api/v1/dealer/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mspin,
        channel,
      }),
    });
    const data = await response.json();
    if (data.status === 'Success') {
      return { ok: true, message: data.message };
    }
    throw new Error(data.message || 'Failed to send OTP');
  } catch (error) {
    return { ok: false, message: 'OTP not send' };
  }
};

async function validateDealerOtp(mspin, otp, channel) {
  const url = `${apiDomain}/app-service/api/v1/validate-otp`;
  const requestBody = { mspin, otp, channel };
  const headers = { 'Content-Type': 'application/json' };

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success && data.mspin_token) {
    sessionStorage.setItem('mspin_token', data.mspin_token);
    sessionStorage.setItem('mspin', mspin);
    sessionStorage.setItem('city_id', data.city_id);
    sessionStorage.setItem('dealer_id', data.dealer_id);
    sessionStorage.setItem('state_id', data.state_id);
    sessionStorage.setItem('name', data.name);
    sessionStorage.setItem('designation', data.designation);
    sessionStorage.setItem('outlet_address', data.outlet_address);
    setCookie('journeyType', 'dealer', 1);
    return { success: true, mspin_token: data.mspin_token };
  }

  return { success: false, message: message || 'mspin_token is missing.' };
}

async function extendedWarranty(dealerCode, variantCode) {
  const url = `${apiDomain}/app-service/api/v1/extended-warranty`;
  const requestBody = { dealer_code: dealerCode, variant_code: variantCode };
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch data.' };
}

async function sendDealerCustomerOtp(mobileNumber, dealerAuthorization, channel) {
  const url = `${apiDomain}/app-service/api/v1/customer-otp`;
  const requestBody = { mobile: mobileNumber, otp_type: 'NEW_FINANCE_JOURNEY' };
  const headers = { 'Content-Type': 'application/json', 'X-dealer-Authorization': dealerAuthorization, 'X-channel': channel };
  const { success, data, message } = await fetchData(url, requestBody, headers);
  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to send OTP.' };
}

async function validateDealerCustomerOtp(mobileNumber,dealerAuthorization, otp) {
  const url = `${apiDomain}/app-service/api/v1/customer-otp/validate`;
  const requestBody = { mobile_number: mobileNumber, otp:otp, otp_type: 'NEW_FINANCE_JOURNEY' };
  const headers = { 'Content-Type': 'application/json', 'X-dealer-Authorization': dealerAuthorization };
  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to send OTP.' };
}

async function customerEnquiry(enquiryId, body) {
  const url = `${apiDomain}/app-service/api/v1/customer/enquiry/${enquiryId}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }
  const requestBody = {
    customer_type_id: body.customerTypeId,
    applicant_type_id: body.applicantTypeId,
    employment_type_id: body.employmentTypeId,
    sub_employment_type_id: body.subEmploymentTypeId || '',
    is_car_exchange: body.isCarExchange || '',
    registration_type: body.registrationType || '',
    ...(body.company_name ? { company_name: body.company_name } : {}),
    ...(body.company_id ? { company_id: body.company_id } : {}),
    ...(body.corporate_offer ? { corporate_offer: body.corporate_offer } : {}),
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const data = await response.json();
    return { success: true, data };
  }

  return { success: false };
}

async function createCustomerEnquiry(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/enquiry`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const authorization = sessionStorage.getItem('access_token');
  headers.Authorization = authorization;

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to create customer enquiry.' };
}

async function customerActiveEnquiry(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/enquiry/active`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const authorization = sessionStorage.getItem('access_token');
  headers.Authorization = authorization;

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch active enquiry details.' };
}

async function createDealerEnquiry(body) {
  const url = `${apiDomain}/app-service/api/v1/dealer-enquiry`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const authorization = sessionStorage.getItem('access_token');
  headers.Authorization = authorization;
  const dealerAuthorization = sessionStorage.getItem('mspin_token');
  headers['X-dealer-Authorization'] = dealerAuthorization;

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to create customer enquiry.' };
}

async function priceSummaryRequest(body) {
  const url = `${apiDomain}/app-service/api/v1/dealer/price-summary`;

  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch price summary.' };
}

async function withdrawnConsent(body, userType) {
  const url = `${apiDomain}/app-service/api/v1/withdraw-consent`;
  const requestBody = {
    enquiry_id: body.enquiry_id,
    mobile: body.mobileNumber,
    loan_application_id: body.loanApplicationId,
    financier_id: body.financierId,
    los_id: body.losId,
    withdrawn_reason: body.withdrawnReason,
    status_id: body.statusId,
    mssf_loan_reference_id: body.mssfLoanReferenceId,
  };

  const headers = { 'Content-Type': 'application/json' };

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    requestBody.otp = body.otp;
    requestBody.otp_type = 'CUSTOMER_WITHDRAWN_CONSENT';
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to withdraw consent.' };
}

async function getLoanStatus(enquiryId) {
  const url = `${apiDomain}/app-service/api/v1/loan-status/${enquiryId}`;

  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

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

async function loanStatusGoBack(body, userType) {
  const url = `${apiDomain}/app-service/api/v1/loan-go-back`;
  const requestBody = {
    enquiry_id: body.enquiry_id,
    status_id: body.status_id,
    financier_id: body.financier_id,
    mobile: body.mobile,
    is_not_interested: true,
    mssf_loan_reference_id: body.mssf_loan_reference_id,
  };
  const headers = { 'Content-Type': 'application/json' };

  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, requestBody, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to fetch loans.' };
}

async function personalDetailsSubmit(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/add-customer-details`;

  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to submit.' };
}

async function personalDetailsSave(body) {
  const url = `${apiDomain}/app-service/api/v1/draft`;
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to save.' };
}

async function generatePAOffers(mobile, dob) {
  const url = `${apiDomain}/app-service/api/v1/generate-pa-offers`;
  const headers = {
    'X-channel': '1000000',
    'Content-Type': 'application/json',
  };

  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const body = { mobile, dob };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      return { success: true, enquiry_id: result.enquiry_id };
    }
    return { success: false, message: result.message || '' };
  } catch (error) {
    return { success: false, message: error.message || '' };
  }
}

async function priceSummaryDownload(body) {
  const url = `${apiDomain}/app-service/api/v1/download/pdf`;
  const headers = { 'Content-Type': 'application/json' };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }

  const { success, data, message } = await fetchData(url, body, headers);

  if (success) {
    return { success: true, data };
  }

  return { success: false, message: message || 'Failed to download.' };
}



// cibilApi.js
async function fetchCibilInfo(body) {
  const url = `${apiDomain}/app-service/api/v1/cibil-info`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = `HTTP error! Status: ${response.status}`;
      return { success: false, message: errorMessage };
    }

    const data = await response.json();

    if (data.cibil_status === 'FAILED') {
      return { success: false, message: data.cibil_status };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message || '' };
  }
}

async function savePriceSummary(body) {
  const url = `${apiDomain}/app-service/api/v1/customer/selected-car`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const userType = getCookie('journeyType');
  if (userType === 'dealer') {
    const dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers['X-dealer-Authorization'] = dealerAuthorization;
  } else {
    const authorization = sessionStorage.getItem('access_token');
    headers.Authorization = authorization;
  }
  try {
    const { success, data, message } = await fetchData(url, body, headers);

    if (success) {
      return { success: true, data };
    }

    return { success: false, message: message || 'Failed to save loan application.' };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

async function getCustomerData(enquiryId) {
  const journeyType = getCookie('journeyType');
  let headers; let url; let dealerAuthorization; let
    authorization;
  if (journeyType === 'dealer') {
    url = `${apiDomain}/app-service/api/v1/dealer-customer-data/${enquiryId}`;
    dealerAuthorization = sessionStorage.getItem('mspin_token');
    headers = {
      'Content-Type': 'application/json',
      'X-dealer-Authorization': dealerAuthorization,
    };
  } else {
    url = `${apiDomain}/app-service/api/v1/customer-journey/customer-data/${enquiryId}`;
    authorization = sessionStorage.getItem('access_token');
    headers = {
      'Content-Type': 'application/json',
      Authorization: authorization,
    };
  }
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

export {
  validateDealerOtp, sendDealerOtp, sendDealerCustomerOtp, priceSummaryRequest, extendedWarranty,
  customerEnquiry, sendCustomerOtp, validateCustomerOtp, withdrawnConsent,
  getLoanStatus, loanStatusGoBack,personalDetailsSubmit,
  personalDetailsSave, createCustomerEnquiry,
  generatePAOffers, priceSummaryDownload,
  fetchCibilInfo, savePriceSummary, getCustomerData, validateDealerCustomerOtp,
  createDealerEnquiry, customerActiveEnquiry
};
