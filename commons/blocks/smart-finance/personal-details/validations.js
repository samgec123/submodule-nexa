/* eslint-disable brace-style */
// Function to validate input fields (for text and number inputs)

import { fetchCibilInfo } from '../../../utility/sfUtils.js';

function checkError(fieldId, inputField, errorElement, isEmptyCheck) {
  if (!inputField && !errorElement) return false; // Ensure a return value

  // Validation patterns for specific field types
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation regex
  const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/; // PAN card validation regex
  const NamePattern = /^[a-zA-Z ]+$/;

  if (isEmptyCheck && inputField.value.trim() === '') {
    // Show error if input is empty
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }
  if (fieldId === 'Email' && !emailPattern.test(inputField.value.trim())) {
    // Validate email format
    errorElement.textContent = 'Please enter a valid email address.';
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }
  if (fieldId === 'Name' || fieldId === 'MiddleName' || fieldId === 'LastName') {
    // Validate Name format
    inputField.value = inputField.value.replace(/[^a-zA-Z]/g, '');
  }
  if (fieldId === 'Name' && !NamePattern.test(inputField.value.trim())) {
    // Validate Name format
    errorElement.textContent = 'Please enter valid First Name';
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }
  if (fieldId === 'Employer'
    && inputField.value.length < inputField.attributes.minlength.value) {
    // Validate employer format
    errorElement.textContent = 'Please enter valid Employer';
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }
  if (fieldId === 'net_income' || fieldId === 'Salary'
    || fieldId === 'CurrentEMI' || fieldId === 'AvgMonthyIncome') {
    inputField.value = inputField.value.slice(0, inputField.attributes.maxlength.value);
    if (inputField.value.length < inputField.attributes.minlength.value) {
      // Validate income format
      errorElement.style.display = 'block';
      return true; // Return true if there's an error
    }
  }
  if (fieldId === 'Pan' && !panPattern.test(inputField.value.trim())) {
    // Validate PAN format
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }
  if (fieldId === 'cattles' || fieldId === 'agriLand') {
    inputField.value = inputField.value.slice(0, 1).replace(/[^1-8]/g, '');
  }
  if (fieldId === 'dob' && inputField.value.trim() === '') {
    // Validate date input
    errorElement.textContent = 'Please select a valid date.';
    errorElement.style.display = 'block';
    return true; // Return true if there's an error
  }

  // Hide error if input is valid
  errorElement.style.display = 'none';
  return false; // Ensure a return value if no error found
}

function validateFields(fieldId, errorId, isEmptyCheck = true) {
  const inputField = document.getElementById(fieldId);
  const errorElement = document.getElementById(errorId);

  // Initially hide the error message
  errorElement.style.display = 'none';

  // Function to check and show error message

  // Add event listener for input interaction
  inputField.addEventListener('input', () => checkError(fieldId, inputField, errorElement, isEmptyCheck));

  // Add event listener for blur (losing focus)
  inputField.addEventListener('blur', () => checkError(fieldId, inputField, errorElement, isEmptyCheck));

  // Return the check function to be called on button click
  return () => checkError(fieldId, inputField, errorElement, isEmptyCheck);
  // Return the function to check the error on click
}

// Function to validate dropdown fields
function validateDropdown(dropdownId, errorId, defaultOption) {
  const dropdownField = document.getElementById(dropdownId);
  const errorElement = document.getElementById(errorId);

  // Initially hide the error message
  errorElement.style.display = 'none';

  // Function to check and show error message
  function checkDropdownError() {
    if (dropdownField.value === defaultOption) {
      // Show error if the default option is still selected
      errorElement.style.display = 'block';
      return true; // Return true if there's an error
    }
    // Hide error if a valid option is selected
    errorElement.style.display = 'none';
    return false; // Return false if there's no error
  }

  // Add event listener for change event
  dropdownField.addEventListener('change', checkDropdownError);

  // Return the check function to call it later
  return checkDropdownError;
}

function showCibilpositiveScorePopup() {
  const popup = document.getElementById('cibil-positive-score-popup');
  if (popup) {
    popup.style.display = 'flex'; // Display the popup

    // Enable the Resend OTP button
    const resendButton = popup.querySelector('.resend0_cibil');
    if (resendButton) {
      resendButton.style.pointerEvents = 'none'; // Initially disable Resend button
      resendButton.style.opacity = '0.5'; // Make it visually disabled
    }

    // Disable the Submit button initially
    const submitButton = popup.querySelector('.submitcibil');
    if (submitButton) {
      submitButton.classList.add('skiptooffer_disable'); // Add disabled style
      submitButton.style.pointerEvents = 'none'; // Disable click events
    }

    // Start the timer
    const counterElement = popup.querySelector('#counter_cibil');
    const countElement = counterElement.querySelector('#count_cibil');
    if (counterElement) {
      let timeRemaining = 20;
      counterElement.style.display = 'block'; // Show timer

      const timer = setInterval(() => {
        timeRemaining -= 1;
        countElement.textContent = `${timeRemaining}s`;

        if (timeRemaining <= 0) {
          clearInterval(timer);
          counterElement.style.display = 'none'; // Hide timer
          resendButton.style.pointerEvents = 'auto'; // Enable Resend OTP button
          resendButton.style.opacity = '1';
        }
      }, 1000);
    } else {
      throw new Error('Timer elements (#counter_cibil or #count_cibil) not found in the popup.');
    }
  } else {
    throw new Error('CIBIL Score positive Popup element not found.');
  }
}

function handleOtpInput() {
  const popup = document.getElementById('cibil-positive-score-popup');
  if (!popup) {
    throw new Error('Popup not found. Ensure the popup is available before calling this function.');
  }

  const otpInput = popup.querySelector('#otp');
  const submitButton = popup.querySelector('.submitcibil');
  const resendButton = popup.querySelector('.resend0_cibil');
  const skipOfferButtonDiv = popup.querySelector('.blackButton:nth-child(2)');
  const skipOfferButton = skipOfferButtonDiv.querySelector('.skiptooffer');
  const skipOfferSection = popup.querySelector('.skip_offer_dis');
  const disclaimerCheckbox = popup.querySelector('#disclaimer');

  otpInput.addEventListener('input', () => {
    const otpValue = otpInput.value;

    // Enable submit button only when OTP is correct
    if (otpValue === '1111') {
      submitButton.classList.remove('skiptooffer_disable'); // Enable submit button
      submitButton.style.pointerEvents = 'auto';
    } else {
      submitButton.classList.add('skiptooffer_disable'); // Disable submit button
      submitButton.style.pointerEvents = 'none';
    }
  });

  // Handle Resend button click
  resendButton.addEventListener('click', () => {
    submitButton.classList.add('skiptooffer_disable'); // Disable submit button
    submitButton.style.pointerEvents = 'none'; // Disable click events

    // Enable Skip Offer button
    skipOfferButtonDiv.style.display = 'block';
    skipOfferSection.style.display = 'block';
    skipOfferButton.classList.add('skiptooffer_disable'); // Keep Skip Offer disabled
    skipOfferButton.style.pointerEvents = 'none';

    resendButton.style.pointerEvents = 'none'; // Disable Resend button
    resendButton.style.opacity = '0.5'; // Visually disable Resend button

    // Reset the timer
    const counterElement = popup.querySelector('#counter_cibil');
    const countElement = counterElement.querySelector('#count_cibil');
    let timeRemaining = 90;
    counterElement.style.display = 'block'; // Show timer

    const timer = setInterval(() => {
      timeRemaining -= 1;
      countElement.textContent = `${timeRemaining}s`;

      if (timeRemaining <= 0) {
        clearInterval(timer);
        counterElement.style.display = 'none'; // Hide timer
        resendButton.style.pointerEvents = 'auto'; // Enable Resend button
        resendButton.style.opacity = '1';
      }
    }, 1000);
  });

  // Handle Disclaimer checkbox
  disclaimerCheckbox.addEventListener('change', () => {
    if (disclaimerCheckbox.checked) {
      skipOfferButton.classList.remove('skiptooffer_disable'); // Enable Skip to Offer button
      skipOfferButton.style.pointerEvents = 'auto';
    } else {
      skipOfferButton.classList.add('skiptooffer_disable'); // Disable Skip to Offer button
      skipOfferButton.style.pointerEvents = 'none';
    }
  });

  // Handle Submit button click
  submitButton.addEventListener('click', () => {
    if (!submitButton.classList.contains('skiptooffer_disable')) {
      const nextLink = submitButton.getAttribute('href');
      if (nextLink) {
        window.location.href = nextLink; // Redirect to the provided link
      }
    }
  });

  // Handle Skip to Offer button click
  skipOfferButton.addEventListener('click', () => {
    if (!skipOfferButton.classList.contains('skiptooffer_disable')) {
      const nextLink = skipOfferButton.getAttribute('href');
      if (nextLink) {
        window.location.href = nextLink; // Redirect to the provided link
      }
    }
  });
}

// Delay Initialization Until Popup is Loaded
function initializeCibilPopup() {
  const interval = setInterval(() => {
    const popup = document.getElementById('cibil-positive-score-popup');
    if (popup) {
      clearInterval(interval); // Stop checking once popup is available
      showCibilpositiveScorePopup();
      handleOtpInput();
    }
  }, 100); // Check every 100ms
}

function showCibilScorePopup() {
  const popup = document.getElementById('cibil-score-popup');
  if (popup) {
    popup.style.display = 'block';
  } else {
    throw new Error('CIBIL Score Popup element not found.');
  }
}

async function fetchAndDisplayCibilInfo() {
  const firstNameApi = document.getElementById('Name').value;
  const lastNameApi = document.getElementById('LastName').value;
  const emailApi = document.getElementById('Email').value;
  const dobApi = document.getElementById('dob')?.value.trim();
  const panNumberApi = document.getElementById('Pan').value;
  const mobileApi = document.getElementById('Mobile').value;
  const enquiryId = sessionStorage.getItem('enquiryId');

  const body = {
    enquiry_id: enquiryId,
    pan_number: panNumberApi,
    first_name: firstNameApi,
    last_name: lastNameApi,
    email: emailApi,
    mobile: mobileApi,
    dob: dobApi,
    is_co_applicant: false,
    cibil_info: null,
  };

  try {
    const result = await fetchCibilInfo(body);
    if (!result.success && result.message === 'FAILED') {
      showCibilScorePopup();
      return { success: true, data: result };
    } if (result.success && result.data?.cibil_status === 'FAILED') {
      showCibilScorePopup();
      return { success: true, data: result.data };
    } if (result.success && result.data?.cibil_status === 'SUCCESS') {
      initializeCibilPopup();
      showCibilpositiveScorePopup();
      return { success: true, data: result.data };
    } if (result.success && result.data?.cibil_status === 'PENDING') {
      showCibilScorePopup();
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || 'Unknown error occurred.' };
  } catch (error) {
    return { success: false, message: 'Unexpected error occurred during API call.' };
  }
}

function CheckFormValid() {
  let hasErrors = false;
  // Get the selected value of Employment Type
  const employmentTypeField = document.getElementById('EmploymentType');
  const selectedEmploymentType = employmentTypeField.value;

  const itrYesField = document.getElementById('ItrYes');
  const itrNoField = document.getElementById('ItrNo');
  let itrSelected = null;
  if (itrYesField.checked) {
    itrSelected = 'Yes';
  } else if (itrNoField.checked) {
    itrSelected = 'No';
  }

  // Get values from the input fields
  const netIncomeValue = parseFloat(document.getElementById('net_income').value) || 0;
  const salaryValue = parseFloat(document.getElementById('Salary').value) || 0;
  const currentValue = parseFloat(document.getElementById('CurrentEMI').value) || 0;
  const avgValue = parseFloat(document.getElementById('AvgMonthyIncome').value) || 0;

  // Initialize a flag to track errors

  // Validate fields only if 'Salaried' is selected
  if (selectedEmploymentType === '200001') {
    // Validate Residence Type, Residence Since
    hasErrors = validateDropdown('ResidenceType', 'residenceType-error', 'Residence Type*')() || hasErrors;
    hasErrors = validateDropdown('ResidentSince', 'residentSince-error', 'Residence Since*')() || hasErrors;

    // Validate Current EMI
    const checkCurrentEMI = validateFields('CurrentEMI', 'currentEMI-error');
    hasErrors = checkCurrentEMI() || hasErrors;

    // Validate Employer Type
    hasErrors = validateDropdown('EmployerType', 'employerType-error', 'Employer Type*')() || hasErrors;
    hasErrors = validateDropdown('Years', 'workyear-error', 'Year*')() || hasErrors;
    hasErrors = validateDropdown('Month', 'month-error', 'Month*')() || hasErrors;
    hasErrors = validateDropdown('Gender', 'gender-error', 'Gender*')() || hasErrors;

    // Validate other fields
    if(document.getElementById('EmployerType').value === '440008'){
      const checkEmployer = validateFields('Employer', 'employer-error');
      hasErrors = checkEmployer() || hasErrors;
    }
    const checkPan = validateFields('Pan', 'pan-error');
    hasErrors = checkPan() || hasErrors;

    const checkEmail = validateFields('Email', 'email-error');
    hasErrors = checkEmail() || hasErrors;

    // Corrected validation for date of birth
    const checkdob = validateFields('dob', 'dob-error');
    hasErrors = checkdob() || hasErrors;

    const checkNetIncome = validateFields('net_income', 'net-error');
    hasErrors = checkNetIncome() || hasErrors;

    const checkSalary = validateFields('Salary', 'gross-error');
    hasErrors = checkSalary() || hasErrors;
  } else if (selectedEmploymentType === 'Employment Type*') {
    // Validate Residence Type, Residence Since
    hasErrors = validateDropdown('ResidenceType', 'residenceType-error', 'Residence Type*')() || hasErrors;
    hasErrors = validateDropdown('ResidentSince', 'residentSince-error', 'Residence Since*')() || hasErrors;
    hasErrors = validateDropdown('EmploymentType', 'employmentType-error', 'Employment Type*')() || hasErrors;
    hasErrors = validateDropdown('Years', 'workyear-error', 'Year*')() || hasErrors;
    hasErrors = validateDropdown('Month', 'month-error', 'Month*')() || hasErrors;
    hasErrors = validateDropdown('Gender', 'gender-error', 'Gender*')() || hasErrors;
    const checkdob = validateFields('dob', 'dob-error');
    hasErrors = checkdob() || hasErrors;

    // Validate Current EMI
    const checkCurrentEMI = validateFields('CurrentEMI', 'currentEMI-error');
    hasErrors = checkCurrentEMI() || hasErrors;

    // Validate Employer Type
    hasErrors = validateDropdown('EmployerType', 'employerType-error', 'Employer Type*')() || hasErrors;

    // Validate other fields
    const checkEmployer = validateFields('Employer', 'employer-error');
    hasErrors = checkEmployer() || hasErrors;

    const checkPan = validateFields('Pan', 'pan-error');
    hasErrors = checkPan() || hasErrors;

    const checkEmail = validateFields('Email', 'email-error');
    hasErrors = checkEmail() || hasErrors;

    const checkNetIncome = validateFields('net_income', 'net-error');
    hasErrors = checkNetIncome() || hasErrors;

    const checkSalary = validateFields('Salary', 'gross-error');
    hasErrors = checkSalary() || hasErrors;
  } else if (selectedEmploymentType === '200003') {
    // Validate Residence Type, Residence Since
    hasErrors = validateDropdown('ResidenceType', 'residenceType-error', 'Residence Type*')() || hasErrors;
    hasErrors = validateDropdown('ResidentSince', 'residentSince-error', 'Residence Since*')() || hasErrors;
    hasErrors = validateDropdown('SubCategory', 'subCategory-error', 'Sub category*')() || hasErrors;

    const checkPan = validateFields('Pan', 'pan-error');
    hasErrors = checkPan() || hasErrors;

    const checkEmail = validateFields('Email', 'email-error');
    hasErrors = checkEmail() || hasErrors;

    hasErrors = validateDropdown('Gender', 'gender-error', 'Gender*')() || hasErrors;

    const checkdob = validateFields('dob', 'dob-error');
    hasErrors = checkdob() || hasErrors;

    // Check if there are no errors
    if (!hasErrors) {
      // Show CIBIL score popup if all validations are correct
      // showCibilScorePopup();
      fetchAndDisplayCibilInfo();
    }
  } else if (selectedEmploymentType === '200002') {
    // Get the SubEmployee field values
    const subEmployeeTypeField = document.getElementById('SubEmployee');
    const selectedSubEmployee = subEmployeeTypeField.value;
    const subEmployeeTypeNoField = document.getElementById('SubEmployee_no');
    const selectedSubEmployeeNo = subEmployeeTypeNoField.value;
    hasErrors = validateFields('Pan', 'pan-error')() || hasErrors;
    hasErrors = validateFields('Email', 'email-error')() || hasErrors;
    hasErrors = validateFields('CurrentEMI', 'currentEMI-error')() || hasErrors;
    hasErrors = validateFields('AvgMonthyIncome', 'avg-error')() || hasErrors;
    hasErrors = validateDropdown('ResidenceType', 'residenceType-error', 'Residence Type*')() || hasErrors;
    hasErrors = validateDropdown('ResidentSince', 'residentSince-error', 'Residence Since*')() || hasErrors;
    hasErrors = validateDropdown('Gender', 'gender-error', 'Gender*')() || hasErrors;
    const checkdob = validateFields('dob', 'dob-error');
    hasErrors = checkdob() || hasErrors;

    // If ITR is 'Yes', validate for 'Sub Employment*' and other relevant conditions
    if (itrSelected === 'Yes') {
      if (selectedSubEmployee === 'Sub Employment*') {
        hasErrors = validateDropdown('SubEmployee', 'subEmployee-error', 'Sub Employment*')() || hasErrors;
      }
      // Validate additional fields based on SubEmployee value
      if (selectedSubEmployee === 'Professional') {
        hasErrors = validateDropdown('ProfessionalYear', 'professionalYear-error', 'Year*')() || hasErrors;
        hasErrors = validateDropdown('ProfessionalMonth', 'professionalMonth-error', 'Month*')() || hasErrors;
      } else if (selectedSubEmployee === 'Business Individuals') {
        hasErrors = validateDropdown('TenureBussinessYear', 'tenureBussinessYear-error', 'Year*')() || hasErrors;
        hasErrors = validateDropdown('TenureBussinessMonth', 'tenureBussinessMonth-error', 'Month*')() || hasErrors;
      }
    }
    // If ITR is 'No', validate for 'Sub Employment_no*' condition
    else if (itrSelected === 'No') {
      if (selectedSubEmployeeNo === 'Sub Employment_no*') {
        hasErrors = validateDropdown('ResidenceType', 'residenceType-error', 'Residence Type*')() || hasErrors;
        hasErrors = validateDropdown('ResidentSince', 'residentSince-error', 'Residence Since*')() || hasErrors;
        hasErrors = validateDropdown('SubEmployee_no', 'subEmployeeNo-error', 'Sub Employment_no*')() || hasErrors;
        hasErrors = validateFields('Pan', 'pan-error')() || hasErrors;
        hasErrors = validateFields('Email', 'email-error')() || hasErrors;
        hasErrors = validateFields('CurrentEMI', 'currentEMI-error')() || hasErrors;
        hasErrors = validateFields('AvgMonthyIncome', 'avg-error')() || hasErrors;
      } else if (selectedSubEmployeeNo === 'Farmer(Agri/Dairy)') {
        hasErrors = validateDropdown('TenureBussinessYear', 'tenureBussinessYear-error', 'Year*')() || hasErrors;
        hasErrors = validateDropdown('TenureBussinessMonth', 'tenureBussinessMonth-error', 'Month*')() || hasErrors;
        hasErrors = validateFields('agriLand', 'agri-error')() || hasErrors;
        hasErrors = validateFields('cattles', 'cattles-error')() || hasErrors;
      } else if (selectedSubEmployeeNo === 'Trader/Commission Agent'
        || selectedSubEmployeeNo === 'Others') {
        hasErrors = validateDropdown('TenureBussinessYear', 'tenureBussinessYear-error', 'Year*')() || hasErrors;
        hasErrors = validateDropdown('TenureBussinessMonth', 'tenureBussinessMonth-error', 'Month*')() || hasErrors;
      } else if (selectedSubEmployeeNo === 'Driver') {
        hasErrors = validateDropdown('TenureBussinessYear', 'tenureBussinessYear-error', 'Year*')() || hasErrors;
        hasErrors = validateDropdown('TenureBussinessMonth', 'tenureBussinessMonth-error', 'Month*')() || hasErrors;
        hasErrors = validateDropdown('CarOwn', 'carOwn-error', 'Number of Cars Owned*')() || hasErrors;
      }
    }
  }

  // Check if there are any validation errors
  if (hasErrors) {
    return hasErrors; // Prevent further action
  }

  if (selectedEmploymentType === '200001') { // Check net income and salary conditions
    if (netIncomeValue > salaryValue) {
      document.getElementById('bank_validation_popup').style.display = 'block';
    } else if (currentValue > netIncomeValue || currentValue > salaryValue) {
      document.getElementById('bank_validation_popup_emiSal').style.display = 'block';
    } else {
      // document.getElementById('cibil-score-popup').style.display = 'block';
      fetchAndDisplayCibilInfo();
    }
  } else if (selectedEmploymentType === '200002') {
    if (currentValue > avgValue) {
      document.getElementById('bank_validation_popup_avgSal').style.display = 'block';
    } else {
      // document.getElementById('cibil-score-popup').style.display = 'block';
      fetchAndDisplayCibilInfo();
    }
  }

  document.querySelector('.skiptooffer').addEventListener('click', () => {
    document.getElementById('cibil-score-popup').style.display = 'none';
  });

  const bankValidationPopup = document.getElementById('bank_validation_popup');
  const bankValidationPopupEmiSal = document.getElementById('bank_validation_popup_emiSal');
  const bankValidationPopupAvgSal = document.getElementById('bank_validation_popup_avgSal');

  // Close button functionality for bank_validation_popup
  document.getElementById('close-bank-popup').onclick = function bankValidationPopupEvent() {
    bankValidationPopup.style.display = 'none';
  };

  // OK button functionality for bank_validation_popup
  bankValidationPopup.querySelector('.btn-container button').onclick = function bankValidationPopupEvent() {
    bankValidationPopup.style.display = 'none';
  };

  // Close button functionality for bank_validation_popup_emiSal
  document.getElementById('close-bank-popup-emiSal').onclick = function bankEmiSalPopupEvent() {
    bankValidationPopupEmiSal.style.display = 'none';
  };

  // OK button functionality for bank_validation_popup_emiSal
  bankValidationPopupEmiSal.querySelector('.btn-container button').onclick = function bankEmiSalPopupEvent() {
    bankValidationPopupEmiSal.style.display = 'none';
  };

  // Close button functionality for bank_validation_popup_avgSal
  document.getElementById('close-bank-popup-avgSal').onclick = function bankAvgSalPopupEvent() {
    bankValidationPopupAvgSal.style.display = 'none';
  };

  // OK button functionality for bank_validation_popup_avgSal
  bankValidationPopupAvgSal.querySelector('.btn-container button').onclick = function bankAvgSalPopupEvent() {
    bankValidationPopupAvgSal.style.display = 'none';
  };
  return hasErrors;
}

function showSuccessPopup() {
  let hasErrors = false;
  const emailInput = document.getElementById('Email'); // Adjust this ID if necessary
  const panInput = document.getElementById('Pan'); // PAN card input
  const emailErrorPopup = document.getElementById('email_error_popup');
  const ocrErrorPopup = document.getElementById('ocr_error_popup'); // PAN card error popup
  const savePopup = document.getElementById('save-popup');
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation regex
  const panPattern = /^[A-Z]{5}[\d]{4}[A-Z]$/; // PAN card validation regex

  // Check email validation
  if (emailInput && !emailPattern.test(emailInput.value)) {
    hasErrors = true;
    emailErrorPopup.style.display = 'block';
    savePopup.style.display = 'none'; // Hide save popup if email has error
  } else if (panInput && panInput.value.trim() === '') {
    // If PAN input is empty, do not show the ocrErrorPopup, just show savePopup
    // savePopup.style.display = 'block';
    // ocrErrorPopup.style.display = 'none'; // Ensure ocrErrorPopup is hidden
  } else if (panInput && !panPattern.test(panInput.value.trim())) {
    hasErrors = true;
    ocrErrorPopup.style.display = 'block'; // Show PAN error popup if invalid
    savePopup.style.display = 'none'; // Hide save popup if PAN has error
  } else {
    // If both validations pass
    // savePopup.style.display = 'block';
    // emailErrorPopup.style.display = 'none'; // Ensure email error popup is hidden
    // ocrErrorPopup.style.display = 'none'; // Ensure PAN error popup is hidden
  }

  // Close button functionality for save-popup
  document.getElementById('close-save-popup').onclick = function savePopupEvent() {
    savePopup.style.display = 'none';
  };

  // Close button functionality for email_error_popup
  document.getElementById('close-email-error-popup').onclick = function emailErrorPopupEvent() {
    emailErrorPopup.style.display = 'none';
  };

  // OK button functionality for email_error_popup
  emailErrorPopup.querySelector('.btn-container button').onclick = function emailErrorPopupEvent() {
    emailErrorPopup.style.display = 'none';
  };

  // Close button functionality for ocr_error_popup
  document.getElementById('close-ocr-error-popup').onclick = function ocrErrorPopupEvent() {
    ocrErrorPopup.style.display = 'none';
  };

  // OK button functionality for ocr_error_popup
  ocrErrorPopup.querySelector('.btn-container button').onclick = function ocrErrorPopupEvent() {
    ocrErrorPopup.style.display = 'none';
  };

  // OK button functionality for save-popup
  savePopup.querySelector('#ok-btn').onclick = function savePopupEvent() {
    savePopup.style.display = 'none';
  };
  return hasErrors;
}

// Export the validation functions (if using ES6 modules)
export {
  validateFields, validateDropdown, CheckFormValid, showSuccessPopup,
};
