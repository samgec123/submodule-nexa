/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useEffect, useState } from '../../../scripts/vendor/preact-hooks.js';
import { hnodeAs, MultiStepFormContext } from './multi-step-form.js';
import { sendDealerOtp, validateDealerOtp, sendCustomerOtp, validateCustomerOtp, customerActiveEnquiry, getCustomerData } from '../../../utility/sfUtils.js';
import Recaptcha from '../../../utility/recaptcha.js';

function RequestOtpStep({ config }) {
  const { customerOption, dealerOption, dealerDesc, description, button, dashboardLink, loanStatuLink,
    loanOfferLink,
    personalDetailsLink,
    priceSummaryLink,
    componentVariation,
    isCapthchaEnabled} = config;
  const { updateFormState, handleSetActiveRoute, placeholders } = useContext(MultiStepFormContext);
  const formRef = useRef();
  const [showError, setShowError] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputsRef = useRef([]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [requestId, setRequestId] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);


  const isValidMobileNumber = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Adjust regex for your specific requirements
    return mobileRegex.test(mobile);
  };

  const isValidMspin = (number) => {
    const mspinPattern = /^\d{4,7}$/;
    return mspinPattern.test(number);
  };

  const [isDealer, setIsDealer] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const formEntries = Object.fromEntries([...new FormData(formRef.current)]);
    const { 'mspin-number': mspin } = formEntries;

    if (isDealer) {
      if (!isValidMspin(mspin)) {
        setShowError(true);
        return;
      }
      setMobileNumber(mspin);
      try {
        const response = await sendDealerOtp(mspin, placeholders.apiChannel);
        if (response.ok) {
          setRequestId(mspin); // Store mspin as requestId
          setShowError(!response.ok);
          setShowOtpForm(response.ok);

        }
        else{
          document.querySelector('#amt_error_popup p').innerText = response?.message;
          document.querySelector('#amt_error_popup').style.display='block';
          setShowError(response.ok);
        }
      } catch (error) {
        document.querySelector('#amt_error_popup p').innerText = 'Something went wrong. Please try again after sometime.';
        document.querySelector('#amt_error_popup').style.display='block';
        setShowError(false);
      }
    } else {
      const formEntriess = Object.fromEntries([...new FormData(formRef.current)]);
      const { 'mobile-number': mobile } = formEntriess;
      // Save the mobile number to a state variable for later use
      setMobileNumber(mobile);

      // Validate mobile number
      if (!mobile || !isValidMobileNumber(mobile)) {
        setShowError(true); // Show validation error
        return;
      }

      // Reset error state
      setShowError(false);

      try {
        // API call to send OTP
        const response = await sendCustomerOtp(mobile, placeholders.apiChannel);
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.status === 'Success') {
            setShowOtpForm(true); // Proceed to OTP input form
            setRequestId(mobile); // Store mobile number or requestId if needed
          } else {
            document.querySelector('#amt_error_popup p').innerText = responseData?.error_message;
            document.querySelector('#amt_error_popup').style.display='block';
            setShowError(false); // Show generic error if API response indicates failure
          }
        } else {
          setShowError(false); // Show error for HTTP response issues
          const responseData = await response.json();
          document.querySelector('#amt_error_popup p').innerText = responseData?.error_message;
          document.querySelector('#amt_error_popup').style.display='block';
        }
      } catch (error) {
        setShowError(false); // Show error for network or unexpected issues
        document.querySelector('#amt_error_popup p').innerText = 'Something went wrong. Please try again after sometime.';
        document.querySelector('#amt_error_popup').style.display='block';
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = inputsRef.current.map((input) => input.value).join('');
    // Use the stored mobile number from the state
    const mobile = mobileNumber;

    if (isDealer) {
      if (otp.length === 4) {
        try {
          // Pass mspin (requestId)
          const response = await validateDealerOtp(requestId, otp, placeholders.apiChannel);
          if (response.success) {
          // Redirect to the dealer dashboard page upon successful OTP validation
            window.location.href = dashboardLink?.props?.href;
          } else {
            setOtpError(placeholders.failedOtp);
          }
        } catch (error) {
          setOtpError(placeholders.errorOtp);
        }
      } else {
        setOtpError(placeholders.digitFour);
      }
    } else {
      // Mobile journey logic
      if(otp.length === 4){
        try {
          // Proceed to the new API for generating the token
          const response = await validateCustomerOtp(mobile, otp, placeholders.apiChannel);
          const tokenResponseData = await response.json();

          if (tokenResponseData && tokenResponseData.access_token) {
            sessionStorage.setItem('mobile', mobileNumber);
            sessionStorage.setItem('access_token', tokenResponseData.access_token);

            const checkActiveEnquiry = await customerActiveEnquiry(mobileNumber);
            if(checkActiveEnquiry?.success){

              const activeEnquiries = checkActiveEnquiry?.data?.active_enquiries.length &&
              checkActiveEnquiry?.data?.active_enquiries[0];

              const activeEnquiryStatus = activeEnquiries?.enquiry_status;
              const yesOptionsAllValues = ['NA','CLOSED'];
              const redirectToLoanOfferValues = ['USER_DETAILS_SAVED','LOAN_APPLICATION_SAVED'];
              const redirectToLoanStatusValues = ['LOAN_APPLICATION_SUBMITTED','AWAIT_RETRY'];
              const redirectToPriceSummaryValues = ['CAR_PERSONALIZED'];
              const redirectToPersonalDetailsValues = ['USER_PARTIAL_DETAILS_SAVED'];
              sessionStorage.setItem('existingEnquiryId', activeEnquiries?.enquiry_id);
              sessionStorage.setItem('enquiryId', activeEnquiries?.enquiry_id);

              if (yesOptionsAllValues.includes(activeEnquiryStatus)) {
                handleSetActiveRoute('basic-user-details-step');
              } else if(redirectToLoanOfferValues.includes(activeEnquiryStatus)){
                // redirect to loan offer
                await handleRestorePreviousJourneyStep(loanOfferLink?.props?.href, mobile, activeEnquiries, placeholders);
              }
              else if(redirectToLoanStatusValues.includes(activeEnquiryStatus)){
                // redirect to loan status
                await handleRestorePreviousJourneyStep(loanStatuLink?.props?.href, mobile, activeEnquiries, placeholders);
              }
              else if(redirectToPriceSummaryValues.includes(activeEnquiryStatus)){
                // redirect to price summary
                await handleRestorePreviousJourneyStep(priceSummaryLink?.props?.href, mobile, activeEnquiries, placeholders);
              }else if(redirectToPersonalDetailsValues.includes(activeEnquiryStatus)){
                // redirect to personal details
                await handleRestorePreviousJourneyStep(personalDetailsLink?.props?.href, mobile, activeEnquiries, placeholders);
              }
              else {
                handleSetActiveRoute('basic-user-details-step');
              }

            }
            else{
              document.querySelector('#amt_error_popup p').innerText = checkActiveEnquiry?.message;
              document.querySelector('#amt_error_popup').style.display='block';
            }
          } else {
            setOtpError(`${placeholders.errorTokenMobile}`);
          }
        } catch (error) {
          setOtpError(`${placeholders.nextTokenStep}`);
          handleSetActiveRoute('request-otp-step');
        }
      }
      else{
        setOtpError(placeholders?.customerOTPEmptyError);
      }

    }

    setShowError(false);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [timeLeft]);

  useEffect(() => {

  }, []);

  const handleRestorePreviousJourneyStep = async (redirectURL, mobile, activeEnquiries, placeholders)=>{
    const enquiryDetails = activeEnquiries &&  await fetchEnquiryDetails(activeEnquiries?.enquiry_id, componentVariation, placeholders);
    if(!enquiryDetails){
      return
    }

    updateFormState((currentState) => ({
    ...currentState,
    mobileNumber: mobile,
    carDesc: enquiryDetails,
    redirectURL,
  }));
  handleSetActiveRoute('restore-previous-journey-step');
  return true;
  };

  const validateAndMove = (event, index) => {
    const input = event.target;
    const { key } = event;
    if (key === 'Backspace' && input.value === '' && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    } else if (/^\d$/.test(input.value)) {
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    } else {
      input.value = '';
    }
  };

  const resendOtpRequest = async (e) => {
    e.preventDefault();
    try {
      if(isDealer){
        const response = await sendDealerOtp(mobileNumber, placeholders.apiChannel);
        setShowError(!response.ok);
        setShowOtpForm(response.ok);
        if (response.ok) {
          setRequestId(mspin); // Store mspin as requestId
          setTimeLeft(120); // Reset the timer
        }
      }
      else{
        const response = await sendCustomerOtp(mobileNumber, placeholders.apiChannel);
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.status === 'Success') {
            setShowOtpForm(true); // Proceed to OTP input form
            setTimeLeft(120); // Reset the timer
          } else {
            setShowError(true); // Show generic error if API response indicates failure
          }
        } else {
          setShowError(true); // Show error for HTTP response issues
        }
      }

    } catch (error) {
      setShowError(true); // Show error for network or unexpected issues
    }
  };

  const setInputRef = (el, index) => {
    inputsRef.current[index] = el;
  };

  const trimMobileNumber = (event) => {
    event.target.value = event.target.value.slice(0, 10).replace(/\D/g, '');
  };

  const trimMspinNumber = (event) => {
    event.target.value = event.target.value.slice(0, 7).replace(/\D/g, '');
  };

  useEffect(() => {
    const customerRadio = document.getElementById('customer-journey');
    const dealerRadio = document.getElementById('dealer-journey');

    const handleSelectionChange = () => {
      setIsDealer(dealerRadio.checked);
    };

    customerRadio.addEventListener('change', handleSelectionChange);
    dealerRadio.addEventListener('change', handleSelectionChange);

    // Cleanup event listeners on unmount
    return () => {
      customerRadio.removeEventListener('change', handleSelectionChange);
      dealerRadio.removeEventListener('change', handleSelectionChange);
    };
  }, []);

  const handleOnOtpSubmit = (event) => {
    const journeyTypeEl = document.querySelectorAll('.request-otp-step-options input[type="radio"]');
    const selectedRadioValue = document.querySelectorAll('.request-otp-step-options input[type="radio"]:checked');
    if(!isCapthchaEnabled){
      journeyTypeEl.forEach((radio) => {
        if (!radio.checked && radio.value ==='dealer') {
          radio.disabled = true; // Disable unselected radios
        }
        if (!radio.checked && radio.value ==='customer') {
          document.querySelector('.request-otp-step-options').style.display = 'none';
        }
      });
      handleOnSubmit(event);

    }else{
      Recaptcha.createPopupWindow();
    const requestOtpForm = document.querySelector('.request-otp-step form');

    // when captcha is success
    document.getElementById("submitCaptcha").addEventListener("click", (e) => {
      if (Recaptcha.isCaptchaVerified) {
        const recaptchaPopup = document.querySelector('#recaptcha-popup');
        requestOtpForm.classList.add('success');
        recaptchaPopup.remove();
        document.body.style.overflow = "";
        journeyTypeEl.forEach((radio) => {
          if (!radio.checked && radio.value ==='dealer') {
            radio.disabled = true; // Disable unselected radios
          }
          if (!radio.checked && radio.value ==='customer') {
            document.querySelector('.request-otp-step-options').style.display = 'none';
          }
        });
        handleOnSubmit(e);
      }
    });
    }
  };

  const handlePopUpClose = () => {
    document.querySelector('#amt_error_popup').style.display='none';
  };

  return html`
  <div>
      <form ref=${formRef} onsubmit=${(e) => e.preventDefault()} class="${isDealer? 'dealer' : 'customer'}-journey">
          <div class="form-left">
              <div class="request-otp-step-options">
                  <div>
                      <input type="radio" id="customer-journey" name="journey-type" value="customer"
                        checked={!isDealer} />
                      ${hnodeAs(customerOption, 'label', { for: 'customer-journey' })}
                  </div>
                  <div>
                      <input type="radio" id="dealer-journey" name="journey-type" value="dealer" />
                       ${hnodeAs(dealerOption, 'label', { for: 'dealer-journey' })}
                  </div>
              </div>
              <div class="request-otp-step-description" style="display: ${isDealer ? 'none' : 'block'};">
                  ${description}
              </div>
              <div class="request-otp-step-description-dealer"
                  style="display: ${isDealer ? 'block' : 'none'};">
                 ${dealerDesc}
              </div>
          </div>
          <div class="form-right">
              ${showOtpForm ? html`
                  <div class="otp-box">
                      ${[0, 1, 2, 3].map((_, index) => html`
                          <input
                                  class="otp-input"
                                  type="text"
                                  maxlength="1"
                                  inputmode="numeric"
                                  onInput=${(event) => validateAndMove(event, index)}
                                  onKeyDown=${(event) => validateAndMove(event, index)}
                                  ref=${(el) => setInputRef(el, index)}
                          />
                      `)}
                      ${timeLeft > 0 ? html`
                          <span class="timer-countdown">${timeLeft} Sec</span>
                      ` : html`
                          <a href="#" class="resend-otp" onclick=${resendOtpRequest}>${placeholders.resend}</a>
                      `}
                  </div>
                  ${otpError && html`
                  <div class="invalid-otp" style="display: block">
                      ${otpError}
                    </div>
                  `}
                  <button type="submit" onclick=${handleOtpSubmit}>Submit</button>
              ` : html`
                  <div class="request-otp-step-input"  style="display: ${isDealer ? 'none' : 'block'};">
                      <input type="text" name="mobile-number"
                             class=${`mobile-number ${showError ? 'in-valid' : ''}`}
                             placeholder=${placeholders.mobileNumber}
                             onKeyUp=${(event) => { trimMobileNumber(event); }}/>
                      <em class=${`error-form ${showError ? 'active' : ''}`}>
                        ${placeholders.mobileMissing}
                      </em>
                      <button type="submit" onClick=${(event)=>handleOnOtpSubmit(event)}>
                          ${hnodeAs(button, 'span')}
                      </button>
                  </div>
                  <div class="request-otp-step-input"  style="display: ${isDealer ? 'block' : 'none'};">
               <div style="position:relative">   <label class="mspin-label">MSPIN</label>
                  <input type="text" name="mspin-number"
                             class=${`mspin-number ${showError ? 'in-valid' : ''}`}
                             placeholder=${placeholders.mspin}
                             onKeyUp=${(event) => { trimMspinNumber(event); }}/>
                             <span class="verify" id="verify_mspin1"
                                onClick=${(event)=>handleOnOtpSubmit(event)}>${placeholders.verifyBtn}</span></div>
                      <em class=${`error-form ${showError ? 'active' : ''}`}>
                      ${placeholders.mspinError}
                      </em>
                      <button type="submit" style="display:none">
                          ${hnodeAs(button, 'span')}
                      </button>
                  </div>
              `}
          </div>
      </form>

      <div class="popUpmain fade-in" id="amt_error_popup" style="display: none;">
      <div class="modal-content">
        <div class="close" id="close-amt-error-popup" onClick=${handlePopUpClose}></div>
        <div class="popupContent red">
            <h2><div class="icon-img "></div> Error</h2>
            <p>Something went wrong</p>
            <div class="btn-container">
                <div class="blackButton"><button type="button" id="close-popup-btn" onClick=${handlePopUpClose} >Ok</button></div>
            </div>
          </div>
        </div>
        </div>
    </div>
  `;
}


const fetchEnquiryDetails = async (enquiryId, componentVariation, placeholders) => {
  try{
    const enquiryDetailsResp = await getCustomerData(enquiryId);
    if (enquiryDetailsResp?.success && enquiryDetailsResp?.data?.status === 'Success') {
      const carSummary = enquiryDetailsResp?.data?.customer_data?.car_summary;
      sessionStorage.setItem('variant', JSON.stringify({
        variant_code: carSummary?.variant_code,
        variantDesc: carSummary?.variantDesc,
        variantColorCode: carSummary?.color_code,
        variantColorDesc: carSummary?.color_description,
        variantColorType: carSummary?.color_indicator,
        variantFuelType: carSummary?.fuel_type,
      }));
      sessionStorage.setItem('selectedDealerId',enquiryDetailsResp?.data?.customer_data?.enquiry?.dealer);
      const graphQlEndpoint = componentVariation === 'arena-variant'
    ? `${placeholders.publishDomain}/graphql/execute.json/msil-platform/ArenaCarList`
    : `${placeholders.publishDomain}/graphql/execute.json/msil-platform/NexaCarList`;
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const matchedCar = result?.data?.carModelList?.items.find(car => car.model_code === carSummary?.model_code);
        return matchedCar?.modelDesc;
      })
      .catch((error)=>{
        throw new Error(error);
      });

    }
    else{
      throw new Error('Something went wrong.');
    }
  }
  catch(error){
    document.querySelector('#amt_error_popup p').innerText = 'Something went wrong. Please try again after sometime.';
    document.querySelector('#amt_error_popup').style.display='block';
    return false
  }
};

RequestOtpStep.parse = (block) => {
  const [optionsWrapper, descriptionWrapper, buttonWrapper,
    dashboardLinkWrapper] = [...block.children]
    .map((row) => row.firstElementChild);
  const [customerOption, dealerOption, dealerDesc] = [...optionsWrapper.children];
  const description = descriptionWrapper?.children;
  const button = buttonWrapper?.firstElementChild;
  const [ dashboardLinkEl, loanStatuLinkEl, loanOfferLinkEl, personalDetailsLinkEl, priceSummaryLinkEl, componentVariationEl ,isCapthchaEnabledEl] = [...dashboardLinkWrapper.children];
  const dashboardLink = dashboardLinkEl?.firstElementChild;
  const loanStatuLink = loanStatuLinkEl?.firstElementChild;
  const loanOfferLink = loanOfferLinkEl?.firstElementChild;
  const personalDetailsLink = personalDetailsLinkEl?.firstElementChild;
  const priceSummaryLink = priceSummaryLinkEl?.firstElementChild;
  const componentVariation = componentVariationEl?.firstElementChild;
  const isCapthchaEnabled = isCapthchaEnabledEl?.children[0].textContent;


  return {
    customerOption,
    dealerOption,
    dealerDesc,
    description,
    button,
    dashboardLink,
    loanStatuLink,
    loanOfferLink,
    personalDetailsLink,
    priceSummaryLink,
    componentVariation,
    isCapthchaEnabled,
  };
};

RequestOtpStep.defaults = {
  customerOption: html`<p>Customer</p>`,
  dealerOption: html`<p>Dealer</p>`,
  dealerDesc: html`<p>Please Enter Your MSPIN.</p>`,
  description: html`<p>Description</p>`,
  button: html`<p>Request OTP</p>`,
  loanStatuLink : html`<p>Loan Status</p>`,
  loanOfferLink : html`<p>Loan Offer</p>`,
  personalDetailsLink : html`<p>Personal Details</p>`,
  priceSummaryLink : html`<p>price summary</p>`,
  componentVariation: html`<p>Component variation</p>`,
  isCapthchaEnabled: false,
};

export default RequestOtpStep;
