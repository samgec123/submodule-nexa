import formDataUtils from '../../utility/formDataUtils.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../utility/utility.js';
import { attachValidationListeners, mergeValidationRules } from '../../utility/validation.js';
import analytics from '../../utility/analytics.js';
import commonApiUtils, { toTitleCase, sentenceToTitleCase } from '../../commons/utility/apiUtils.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import authUtils from '../../commons/utility/authUtils.js';

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const [
    componentIdEl,
    titleEl,
    descriptionEl,
    welcomeImageEl,
    fillDetailsEl,
    preferredDealershipEl,
    sendOtpButtonEl,
    personalDetailsEl,
    chooseModelEl,
    selectDealershipEl,
    nextButtonEl,
    tAndCTextEl,
    thankyouTitleEl,
    thankyouDescEl, ,
    formStyleEl,
    defaultModelCodeEl,
  ] = innerDiv.children;

  let dataLayerObj = {};
  const componentId = componentIdEl?.textContent?.trim() || '';
  const title = titleEl?.textContent?.trim() || '';
  const subtitle = descriptionEl?.textContent?.trim() || '';
  const welcomeImage = welcomeImageEl?.querySelector('picture');
  const fillDetailsText = fillDetailsEl?.textContent?.trim() || '';
  const preferredDealership = preferredDealershipEl?.textContent?.trim() || '';
  const sendOtpButton = sendOtpButtonEl?.textContent?.trim() || '';
  const personalDetails = personalDetailsEl?.textContent?.trim() || '';
  const chooseModel = chooseModelEl?.textContent?.trim() || '';
  const selectDealership = selectDealershipEl?.textContent?.trim() || '';
  const nextButtonText = nextButtonEl?.textContent?.trim() || '';
  const thankyouTitle = thankyouTitleEl?.textContent?.trim() || '';
  const thankyouDesc = thankyouDescEl?.textContent?.trim() || '';
  const formStyle = formStyleEl?.textContent?.trim() || '';
  const defaultModelCode = defaultModelCodeEl?.textContent?.trim() || 'GV';
  const evModelCode = 'VE'
  const { defaultLatitude: initialLat, defaultLongitude: initialLong, minDealers= 2 , maxDealers= 4 } = await fetchPlaceholders();
  let dealershipFlag = true;

  let finalOtp;
  let finalRequestId;
  let finalTid;
  let otpTid;
  let otpMobileNum;
  const TOTAL_STEPS = 2;
  let currentStep = 1;
  let lat = initialLat;
  let long = initialLong;
  let isOtpVerified = false;
  let countDown = 30;
  let placesOptions;
  let pincode;
  let geoLocationData;
  let geoLocationPayload = {
    latitude: lat,
    longitude: long,
  };
  let citiesObject;
  let allCityObj = null;
  let mobileValue = null;
  let analyticsPincode = null;
  let socialCheckboxesAnalytics = null;
  let submissionFlag = true;
   // Function to check if query parameters are present in the URL for utm fields
   function hasQueryParams() {
      return window.location.search.length > 1;
    }
    function getQueryParams() {
      const params = new URLSearchParams(window.location.search);
      const queryParams = {
        utm_medium: params.get('utm_medium') || '',
        utm_source: params.get('utm_source') || '',
        utm_id: params.get('utm_id') || '',
        utm_content: params.get('utm_content') || '',
        utm_term: params.get('utm_term') || '',
        utm_campaign: params.get('utm_campaign') || '',
      };
      return queryParams;
    }
    function updatePayloadWithQueryParams(payload) {
      const queryParams = getQueryParams(); // Get query parameters
      payload.utm_medium = queryParams.utm_medium;
      payload.utm_source = queryParams.utm_source;
      payload.utm_id = queryParams.utm_id;
      payload.utm_content = queryParams.utm_content;
      payload.utm_term = queryParams.utm_term;
      payload.utm_campaign = queryParams.utm_campaign;
    }
  let payload = {
    isDealerFlow: false,
    date: new Date(),
    timeSlot: '',
    timePeriodSlot: '',
    dealer_code: '', // Mandatory
    dealer_for_code: '', // Mandatory
    dealer_name: '',
    location_code: '', // Mandatory
    Name: '', // Mandatory
    Email: '', // Optional
    dealer_distance: '',
    dealer_address: '',
    Phone: '', // Mandatory
    maruti_service_id: '', // Optional
    maruti_service_name: '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    color_cd: '', // Optional
    variant_cd: '', // Optional
    model_cd: '', // Optional
    test_drive_location: '', // Optional
    book_pref_btd_date: '', // Optional
    model_name: '', // Optional
    variant_name: '', // Optional
    color_name: '', // Optional
    vin_number: '', // Optional
    variantslot: '-', // Optional
    test_drive_address: '', // Optional
    exchange_preference: '', // Optional
    utm_medium: '', // Mandatory
    utm_source: '', // Mandatory
    utm_id: '', // Optional
    utm_content: '', // Optional
    utm_term: '', // Optional
    utm_campaign: '', // Optional
    is_client_meeting: '', // Optional
    marketing_checkbox: 1, // optional possible valie us 0 or 1
    transmission_type: '', // Optional
    house_street_area: '', // Optional
    landmark: '', // Optional
    state: '', // Optional
    city: '', // Optional
    pincode: '', // Optional
    fuel_type: '', // Optional // P for Petrol , C for CNG
    preferred_communication_channel: ['W', 'C', 'S'],
    cust_fname: '',
    cust_lname: '',
  };
   if (hasQueryParams()) {
      updatePayloadWithQueryParams(payload);
    }
  tAndCTextEl?.classList.add('disclaimer-text');
  block.innerHTML = '';

  const initForm = async () => {
    const data = await formDataUtils.fetchFormData('form-data-register-your-interest');

    const stateList = await apiUtils.getStateList(async (error) => {
      const details = {};
      details.formName = 'Register Your Interest';
      details.errorField = data.dealerState.id;
      details.errorType = 'API Error';
      details.errorCode = error.status.toString();
      details.errorDetails = 'Failed to load states';
      details.webName = data.dealerState.id;
      details.linkType = 'other';
      analytics.setWebError(details);
    });

    // Functions to update each field in the payload
    const updatePayload = {
      updateModelID: (value) => {
        payload.model_cd = value;
      },
      updateModelName: (value) => {
        payload.model_name = value;
      },
      updateFuelType: (value) => {
        payload.fuel_type = value;
      },
      updateDate: (value) => {
        payload.date = value;
      },
      updateTimeSlot: (value) => {
        payload.timeSlot = value;
      },
      updateTimePeriodSlot: (value) => {
        payload.timePeriodSlot = value;
      },
      updateName: (value) => {
        payload.Name = value;
      },
      updateDealerName: (value) => {
        payload.dealer_name = value;
      },
      updateDealerDistance: (value) => {
        payload.dealer_distance = value;
      },
      updateDealerAddress: (value) => {
        payload.dealer_address = value;
      },
      updateTransmissionType: (value) => {
        payload.transmission_type = value;
      },
      updatePhoneNo: (value) => {
        payload.Phone = value;
      },
      updateCustFName: (value) => {
        payload.cust_fname = value;
      },
      updateCustLName: (value) => {
        payload.cust_lname = value;
      },
      updateCity: (value) => {
        payload.city = value;
      },
      updateState: (value) => {
        payload.state = value;
      },
      updatePinCode: (value) => {
        payload.pincode = value;
      },
      updateDealerCode: (value) => {
        payload.dealer_code = value;
      },
      updateDealerForCode: (value) => {
        payload.dealer_for_code = value;
      },
      updateVarientID: (value) => {
        payload.variant_cd = value;
      },
      updateVarientName: (value) => {
        payload.variant_name = value;
      },
      updatePreferredCommunicationChannel: (channels) => {
        payload.preferred_communication_channel = channels;
      },
      updateLocationCode: (value) => { payload.location_code = value; },
    };

    function finalPayload() {
      const finalSubmitPayload = {
        // Mandatory fields
        dealer_code: payload.dealer_code,
        dealer_for_code: payload.dealer_for_code,
        location_code: payload.location_code,
        Name: payload.Name,
        Phone: payload.Phone,
        utm_medium: payload.utm_medium,
        utm_source: payload.utm_source,

        // Optional fields
        Email: payload.Email, // Optional
        maruti_service_id: payload.maruti_service_id, // Optional
        maruti_service_name: payload.maruti_service_name, // Optional
        color_cd: payload.color_cd, // Optional
        variant_cd: payload.variant_cd, // Optional
        model_cd: payload.model_cd, // Optional
        test_drive_location: payload.test_drive_location, // Optional
        book_pref_btd_date: payload.book_pref_btd_date, // Optional
        model_name: payload.model_name, // Optional
        variant_name: payload.variant_name, // Optional
        color_name: payload.color_name, // Optional
        vin_number: payload.vin_number, // Optional
        variantslot: payload.variantslot, // Optional
        test_drive_address: payload.test_drive_address, // Optional
        exchange_preference: payload.exchange_preference, // Optional
        utm_id: payload.utm_id, // Optional
        utm_content: payload.utm_content, // Optional
        utm_term: payload.utm_term, // Optional
        utm_campaign: payload.utm_campaign, // Optional
        is_client_meeting: payload.is_client_meeting, // Optional
        marketing_checkbox: payload.marketing_checkbox, // Optional, possible values are 0 or 1
        transmission_type: payload.transmission_type, // Optional
        house_street_area: payload.house_street_area, // Optional
        landmark: payload.landmark, // Optional
        state: payload.state, // Optional
        city: payload.city, // Optional
        pincode: payload.pincode, // Optional
        fuel_type: payload.fuel_type, // Optional, P for Petrol, C for CNG
        preferred_communication_channel: payload.preferred_communication_channel, // Optional, W for WhatsApp, C for Call, S for SMS
      };

      // You can adjust payload fields here dynamically based on form values
      return finalSubmitPayload;
    }

    function validateStepFields(stepNumber) {
      let isValid = true;

      switch (stepNumber) {
        case 1: {
          const firstName = document.getElementById('first-name').value;
          const phoneNumber = document.getElementById('mobile').value;
          const sendotpBtn = block.querySelector('#sendotp-btn');

          if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
            sendotpBtn.disabled = false;
          } else {
            sendotpBtn.disabled = true;
          }

          if (!firstName || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || !isOtpVerified || !payload.model_cd) {
            isValid = false;
          }
          break;
        }
        case 2: {
          // as of now dealer name is mentioned which we will change with dealer_id
          // in future once it is available
          const dealerInput = payload.dealer_name;
          if (!dealerInput || payload.preferred_communication_channel.length === 0) {
            isValid = false;
          }
          break;
        }

        default:
          break;
      }

      return isValid;
    }

    function toggleNextButton(stepNumber) {
      const nextButton = document.getElementById('interested');
      if (nextButton) {
        nextButton.disabled = !validateStepFields(stepNumber);
      }
    }

    function selectRadioButton() {
      block.querySelectorAll('.dealer__card').forEach((card) => {
        card.addEventListener('change', () => {
          // Fetch and handle state value
          const stateSelect = document.getElementById('state');
          const selectedState = stateSelect ? stateSelect.value : ''; // Default to empty string if stateSelect is null
          updatePayload.updateState(selectedState);

          // Fetch and handle city value
          const citySelect = document.getElementById('city');
          const selectedCity = citySelect ? citySelect.value : ''; // Default to empty string if citySelect is null
          updatePayload.updateCity(selectedCity);

          // Fetch and handle pin code value
          const pinCodeInput = document.getElementById('pincode');
          const pinCode = pinCodeInput ? pinCodeInput.value : ''; // Default to empty string if pinCodeInput is null
          updatePayload.updatePinCode(pinCode);

          // Get the dealer's name, distance, and address
          const dealerName = card.querySelector('.dealer__name')?.textContent;
          const dealerDistance = `${card.querySelector('.dealer__distance')?.textContent.split(' ')[0]} Kms`;
          const dealerAddress = card.querySelector('.dealer__address')?.textContent;
          const dealerCode = card.querySelector('.dealer__code')?.textContent;
          const dealerforCode = card.querySelector('.dealer_for_code')?.textContent;
          const locationCode = card.querySelector('.location_code')?.textContent;

          updatePayload.updateDealerName(dealerName);
          updatePayload.updateDealerAddress(dealerAddress);
          updatePayload.updateDealerDistance(dealerDistance);
          updatePayload.updateDealerCode(dealerCode);
          updatePayload.updateDealerForCode(dealerforCode);
          updatePayload.updateLocationCode(locationCode);

          // Toggle "Next" button for step 2 based on selection
          toggleNextButton(2);
        });
      });
    }

    function getSelectedLocationStorage() {
      return utility.getLocalStorage('selected-location');
    }

    function formatAddress(inputAddr1, inputAddr2) {
      const addr1 = inputAddr1 ? inputAddr1.trim() : '';
      const addr2 = inputAddr2 ? inputAddr2.trim() : '';
      let combinedAddress = addr1;
      if (addr2) {
        combinedAddress += ` ${addr2}`;
      }
      combinedAddress = combinedAddress.replace(/,\s*$/, '');
      return toTitleCase(combinedAddress);
    }

    async function getNearestDealersAndUpdate(latitude, longitude) {
      if(!latitude || !longitude)
        return '';
      updatePayload.updateDealerName('');
      updatePayload.updateDealerAddress('');
      updatePayload.updateDealerDistance('');
      toggleNextButton(2);
      let container = block.querySelector('.container__dealers');

      if (!container) {
        container = document.createElement('div');
        container.classList.add('container__dealers');
      }

      const loader = document.createElement('div');
      loader.classList.add('loader');
      loader.classList.add('form-heading');
      loader.textContent = "Loading dealers...";

      const dealerContainer = document.createElement('div');
      dealerContainer.classList.add('dealer__list__container');

      container.innerHTML = '';
      container.appendChild(loader);
      block?.querySelector('.suggested-places-btd')?.classList.add('disabled');
      block?.querySelector('.pin-code-container')?.classList.add('disabled');
      block?.querySelector('.dropdown-state-user')?.classList.add('disabled');
      const initialRadius = 100000;
      const fallbackRadius = 500000;
      let dealers = [];

      try {
        const response = await commonApiUtils.getNearestDealers(latitude, longitude, initialRadius, "S,3S");
        dealers = response.filter((dealer) => dealer.channel === 'EXC' && dealer.isActive === true);
        if (dealers.length < minDealers) {
          const fallbackResponse = await commonApiUtils.getNearestDealers(latitude, longitude, fallbackRadius, "S,3S");
          const fallbackDealers = fallbackResponse.filter((dealer) => dealer.channel === 'EXC' && dealer.isActive === true);
          dealers = [...dealers, ...fallbackDealers];
        }
      } catch (error) {
        dealers = [];
      }

      container.innerHTML = '';
      if(dealershipFlag)
        block?.querySelector('.suggested-places-btd')?.classList.remove('disabled');
      block?.querySelector('.pin-code-container')?.classList.remove('disabled');
      block?.querySelector('.dropdown-state-user')?.classList.remove('disabled');
      dealers.slice(0, Math.min(dealers.length, maxDealers)).forEach((dealer) => {
        const dealerCode = dealer.dealerUniqueCd;
        const dealerForCode = dealer.forCd;
        const dealerType = dealer.dealerType || '';
        const locCode = dealer.locCd;
        const card = document.createElement('label');
        card.className = 'dealer__card';
    
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'dealer';
        radio.value = dealer.name;
        radio.className = 'dealer__radio';
    
        const name = document.createElement('p');
        name.textContent = sentenceToTitleCase(dealer.name);
        name.className = 'dealer__name';
    
        const address = document.createElement('p');
        address.textContent = formatAddress(dealer.addr1, dealer.addr2);
        address.className = 'dealer__address';
    
        const distanceTag = document.createElement('p');
        distanceTag.textContent = `${(dealer.distance / 1000).toFixed(2)} Kms`;
        distanceTag.className = 'dealer__distance';
    
        const dealerCodeP = document.createElement('p');
        dealerCodeP.textContent = dealerCode;
        dealerCodeP.className = 'dealer__code hidden';
    
        const dealerForCodeP = document.createElement('p');
        dealerForCodeP.textContent = dealerForCode;
        dealerForCodeP.className = 'dealer_for_code hidden';
    
        const locationCodeP = document.createElement('p');
        locationCodeP.textContent = locCode;
        locationCodeP.className = 'location_code hidden';
    
        const dealerTopInfo = document.createElement('div');
        dealerTopInfo.classList.add('dealership__top__info');
        dealerTopInfo.setAttribute('data-dealerType', dealerType);
        dealerTopInfo.appendChild(name);
        dealerTopInfo.appendChild(distanceTag);
    
        card.appendChild(radio);
        card.appendChild(dealerTopInfo);
        card.appendChild(address);
        card.appendChild(dealerCodeP);
        card.appendChild(dealerForCodeP);
        card.appendChild(locationCodeP);
    
        dealerContainer.appendChild(card);
      });
    
      container.appendChild(dealerContainer);
      return `
        <div class="container__dealers">
          ${dealerContainer ? dealerContainer.outerHTML : ''}
        </div>
      `;
    }
    
    async function getDealershipForm() {
      const selectedLocation = getSelectedLocationStorage();
      if (selectedLocation) {
        lat = selectedLocation.location.latitude?.trim();
        long = selectedLocation.location.longitude?.trim();
      }
      const dealershipFormHTML = `
        <div class="dealership-form">
          <div class="dealership-form-row-1">
            <div class="dealership-form-fields">
              ${formDataUtils.createDropdownFromArray(data.state, stateList, 'dropdown-state-user', true, {}, '', '', true, 'custom')}
              ${formDataUtils.createDropdownFromArray(data.city, [], 'suggested-places-btd', true, {}, '', '', true, 'custom')}
              <div class='pin-code-container'>
                ${formDataUtils.createInputField(data.pincode, 'pin-code', 'text', {})}
                <span class='detect-location__button_ryi'></span>
              </div>
            </div>
          </div>
          <div class="dealership-form-data-row-2">
            ${await getNearestDealersAndUpdate(lat, long)}
          </div>
        </div>
      `;

      return dealershipFormHTML;
    }

    if (welcomeImage) {
      const image = welcomeImage?.querySelector('img');
      image.setAttribute('alt', 'form-image');
      image.removeAttribute('width');
      image.removeAttribute('height');
    }

    const dealershipFormHTML = await getDealershipForm();
    let  modelList = await commonApiUtils.getModelList('EXC');
    if (defaultModelCode === evModelCode) {
        modelList = modelList.filter((model) => model.includes(evModelCode));
    }
    block.innerHTML = utility.sanitizeHtml(`
      <div class="modal" id=${componentId}>
        <div class="container">
          <div class='close-button-container'>
            <button class='close-button' type='button'></button>
          </div>
          <div class="image-container">
            ${welcomeImage?.outerHTML}
            <div class="information-container">
              <p class="title">${title}</p>
              <p class="description">${subtitle}</p>
            </div>
            <div class='thank-you-information'>
              <span class='thank-you-icon'></span>
              <p class='title'>${thankyouTitle}</p>
              <p class='description'>${thankyouDesc}</p>
            </div>
          </div>
          <div class="form-container">
            <form id='register-interest-form' novalidate>
              <div class='step-header'>
                <button id='backButton' class='back-button hidden' type="button"></button>
                <p class='step-number'>${currentStep}/${TOTAL_STEPS}</p>
                <p class='step-title'>${fillDetailsText}</p>
              </div>
              <div class='step-container active' data-step-number=1>
                <div class='personal-details'>
                  <p class='form-heading'>${personalDetails}</p>
                  <div class="form-fields">
                    ${formDataUtils.createInputField(data?.firstName, 'first-name', 'text', { minlength: 3, maxlength: 30 }, formStyle)}
                    ${formDataUtils.createInputField(data?.lastName, 'last-name', 'text', { minlength: 3, maxlength: 30 }, formStyle)}
                    ${formDataUtils.createInputField(data.mobile, 'mobileField', 'tel', { minlength: 10, maxlength: 10 }, formStyle)}
                    ${formDataUtils.createSendOtpField(
      data.otp,
      'half-width resend-otp-container',
      'resend-otp-btn',
      { minlength: 5, maxlength: 5 },
      formStyle,
    )}
                    <div class="sendotp-container otp-button-container">
                      <button id="sendotp-btn" class="button button-secondary-blue otp-button">
                        ${sendOtpButton}
                      </button>
                    </div>
                  </div>
                </div>
                <div class='model-details'>
                  <p class='form-heading'>${chooseModel}</p>
                  <div class="form-fields">
                    ${formDataUtils.createDropdownFromArray(data.model, modelList, 'car-model', true, {}, '', '', true, 'custom')}
                    ${defaultModelCode!==evModelCode? formDataUtils.createDropdownFromArray(data.variant, [], 'model-variant', true, {}, '', '', true, 'custom'):''}
                  </div>
                </div>
              </div>
              <div class='step-container' data-step-number=2>
                <div class='dealership-details'>
                  <p class='form-heading'>${selectDealership}</p>
                  <div class="dealership-step">${dealershipFormHTML}</div>
                </div>
                <div class="socials">
                  <p class="reach-heading">${data.socialIcon.label}</p>
                  <div class="social-checkboxes">
                    ${formDataUtils.createCheckboxes({ ...data.socialIcon, label: '' }, '', 'communication-checkbox')}
                  </div>
                </div>
              </div>
              <div class='footer'>
                <div class='disclaimer-container'>
                  ${tAndCTextEl?.outerHTML}
                </div>
                ${formDataUtils.createButton(data.interested, 'full-width button-secondary interested-button', 'button')}
              </div>
            </form>
          </div>
        </div>
      </div>
    `);
    block.querySelector("#pincode").removeAttribute('placeholder');
    const prefillUserData = async () => {
      const userDetails = await authUtils.getProfile();
      if (userDetails) {
        block.querySelector('#first-name').value = userDetails?.fname || '';
        block.querySelector('#last-name').value = userDetails?.lname || '';
        block.querySelector('#mobile').value = userDetails?.number || '';
        if (userDetails.fname) {
          updatePayload.updateCustFName(userDetails.fname);
        }
        if (userDetails.lname) {
          updatePayload.updateCustLName(userDetails.lname);
        }
        if (userDetails.number) {
          updatePayload.updatePhoneNo(userDetails.number);
        }
      }
    };
    await authUtils.waitForAuth();
    await prefillUserData();

    const resendOtpContainer = block.querySelector('.resend-otp-container');
    const sendotpContainer = block.querySelector('.sendotp-container');
    const sendotpBtn = block.querySelector('#sendotp-btn');
    const resendotpBtn = block.querySelector('#resend-otp-btn');
    const mobileField = block.querySelector('.mobileField');
    const otpValidation = resendOtpContainer.querySelector('.validation-text');
    const otpDigits = block.querySelectorAll('.otp-digit');
    const modelVariant = block.querySelector('.model-variant select');
    const userNameField = block.querySelector('.first-name').querySelector('input');
    const disclaimer = block.querySelector('.disclaimer-container');
    const dealersForm = block.querySelector('.dealership-form-data-row-2');

    const otpErrorMsg = document.createElement('p');
    otpErrorMsg.id = 'otp-error';
    otpErrorMsg.style.color = 'red';
    otpErrorMsg.style.display = 'none';
    otpErrorMsg.classList.add('validation-text');
    otpErrorMsg.textContent = 'Please enter correct otp';
    resendOtpContainer.appendChild(otpErrorMsg);

    resendotpBtn.textContent = 'Resend OTP';
    let requestId;
    let mobileNumber;
    let otpInputField = '';
    let interval;

    const hideAndShowEl = (el, value) => {
      el.style.display = value;
    };

    // green tick for otp verification, initially hidden
    const tickIcon = `
        <span class='tick-icon hidden'></span>
      `;
    mobileField.insertAdjacentHTML('beforeend', tickIcon);

    const startOtpCountDown = () => {
      const mobileElement = block.querySelector('#mobile');
      mobile.disabled=true;
      mobile.style.color = '#767879';
      const resendOtpButton = document.getElementById('resend-otp-btn');
      resendOtpButton.style.color = '#767879';
      resendOtpButton.style.pointerEvents = 'none';
      const otpCountDown = block.querySelector('#otp-countDown');
      countDown = 30; // Reset countdown to default value
       // Calculate minutes and seconds
       const minutes = Math.floor(countDown / 60);
       const seconds = countDown % 60;
       otpCountDown.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')} s)`; // Initialize the text
      clearInterval(interval); // Clear any existing interval before starting a new one
      resendotpBtn.disabled = true;
      interval = setInterval(() => {
        countDown -= 1;
        const minutes = Math.floor(countDown / 60);
        const seconds = countDown % 60;
        otpCountDown.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')} s)`;
        if (countDown <= 0) {
          clearInterval(interval); // Stop the timer when countdown reaches 0
          otpCountDown.textContent = '';
          resendotpBtn.disabled = false;
          resendOtpButton.style.color = '#18171A';

          mobileElement.disabled=false;
          mobileElement.style.color = '#18171A'
          resendOtpButton.style.pointerEvents = 'auto'; // Re-enable button click
        }
      }, 1000);
    };

    // Reset countdown on form submission
    const resetCountdown = () => {
      clearInterval(interval); // Stop the existing interval
      countDown = 30; // Reset the countdown to default
      const otpCountDown = block.querySelector('#otp-countDown');
      if (otpCountDown) {
        otpCountDown.textContent = `${countDown} sec`; // Reset displayed text
      }
    };

    const disbleEnableSendOTPBtn = (disabled) => {
      sendotpBtn.disabled = disabled;
    };

    disbleEnableSendOTPBtn(true);

    function verifyOtpData() {
      const pageDetails = {};
      pageDetails.componentName = 'otp-input';
      pageDetails.componentType = 'button';
      pageDetails.webName = 'Verify OTP';
      pageDetails.linkType = 'other';
      pageDetails.phoneNumber = mobileNumber;
      analytics.setVerifyOtpDetails(pageDetails);
    }

    const verifyOtpApi = async (otp) => {
      const optionEl = block.querySelector('#model-options option.selected');
      try {
        const response = await commonApiUtils.otpValidationRequest(otp, requestId, mobileNumber, otpTid);
        if (response.ok) {
          const result = await response.json();
          if (result.data.status === 'OTP_VERIFIED' && result.data.tId) {
            finalTid = result.data.tId;
            finalOtp = otp;
            finalRequestId = requestId;
            verifyOtpData();
            if (optionEl) {
              updatePayload.updateModelID(optionEl.value);
              updatePayload.updateModelName(optionEl.textContent);
            }
            const stateCodeCh= block.querySelector('#state-options .selected').value;
            const statewiseData = await commonApiUtils.getDealerCities(stateCodeCh);
            const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
            dealersForm.innerHTML = await getNearestDealersAndUpdate(initialLat.trim(), initialLong.trim());
            citiesObject = await processData(filteredStateData);
            await populateAllCities();
            await dealerCityUpdate();
            await dealerPinCodeUpdate();
            await cityListener();
            selectRadioButton();
            return true;
          }
          const details = {};
          details.formName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to verify OTP';
          details.webName = sendotpBtn?.textContent?.trim();// should be aria-label
          details.linkType = 'other';
          analytics.setWebError(details);
          return false;
        }
      } catch (error) {
        console.error('Error during OTP verification:', error);
      }
      return false;
    };

    const verifyMobileOtp = async () => {
      const otpValue = otpInputField;
      const otpdigits = block.querySelectorAll('.otp-digit');
      const otpErrorEl = resendOtpContainer.querySelector('#otp-error');
      if (otpValue.length === 5) {
        hideAndShowEl(otpValidation, 'none');
        const isVerifyOtpApiSuccess = await verifyOtpApi(otpValue);
        if (isVerifyOtpApiSuccess) {
          isOtpVerified = true;

          otpdigits.forEach((digit) => {
            digit.classList.add('green');
            digit.classList.remove('red');
            digit.disabled = true; // Disables all digits
            digit.style.color = '#939393'; // Optional: if you want to enforce consistent style
          });

          document.getElementById('mobile').disabled = true;
          document.getElementById('mobile').style.color = '#939393';
          mobileField.classList.add('valid');
          mobileField.querySelector('.tick-icon').classList.remove('hidden');
          block.querySelector('.otp-container').style.display = 'none';
          toggleNextButton(1);
          if (otpErrorEl) hideAndShowEl(otpErrorEl, 'none');
        } else if (!isOtpVerified) {
          otpdigits.forEach((digit) => {
            digit.classList.remove('green');
            digit.classList.add('red'); // Add the red class for failure
            digit.disabled = false; // Enables digits in case of failure
          });

          document.getElementById('mobile').disabled = false;
          mobileField.classList.remove('valid');
          hideAndShowEl(otpValidation, 'none');
          if (otpErrorEl) hideAndShowEl(otpErrorEl, 'block');
        }
      } else {
        otpValidation.textContent = 'OTP is required';
        hideAndShowEl(otpValidation, 'block');
        hideAndShowEl(otpErrorEl, 'none');
        isOtpVerified = false;

        otpdigits.forEach((digit) => {
          digit.classList.remove('green');
          digit.classList.remove('red'); // Remove both green and red classes for reset
        });

        toggleNextButton(1);
      }
    };

    const sendotp = async () => {
      mobileNumber = mobileField.querySelector('input').value;
      if (mobileNumber !== otpMobileNum) {
        otpTid = null;
      }
      otpMobileNum = mobileNumber;
      try {
        const response = await commonApiUtils.sendOtpRequest(mobileNumber, otpTid);
        if (!response.ok) {
          const details = {};
          details.formName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to send OTP';
          details.webName = block.querySelector('.otp-button')?.textContent?.trim(); // should be aria-label
          details.linkType = 'other';
          analytics.setWebError(details);
        } else {
          const result = await response.json();
          requestId = result.data?.requestId;
          otpTid = result.data?.tId;
          return true;
        }
      } catch (error) {
        console.error('Failed to Send OTP:', error);
      }
      return false;
    };

    const updateCarVariantOptions = (variantData, defaultVariantCd = '') => {
      // Select the target div
      const variantDiv = block.querySelector("#variant-div");

      // Clear all previous HTML inside the div
      variantDiv.innerHTML = "";

      // Add the new HTML structure
      variantDiv.innerHTML = `
      <custom-select class="form-dropdown-select true" id="variant" name="variant" aria-labelledby="variant-label">
          <div class="selected-option" id="variant-selected">Select Variant(Optional)</div>
          <div class="dropdown-options" id="variant-options" style="display: none;"></div>
        </custom-select>
    `;

      // Get references to the dropdown components
      const dropdownOptions = document.getElementById('variant-options');
      const selectedOption = document.getElementById('variant-selected');

      // Clear existing options
      dropdownOptions.innerHTML = '';

      // Populate the options dynamically
      variantData.forEach((variant, index) => {
        const optionElement = document.createElement('option');
        optionElement.value = variant.variantCd;
        if (variant.variantCd === defaultVariantCd) {
          optionElement.textContent = `${variant.variantName} (Top Variant)`;
        } else {
          optionElement.textContent = variant.variantName;
        }
        optionElement.setAttribute('class', 'dropdown-item');

        // Mark the first option as selected
        // if (index === 0) {
        //   optionElement.setAttribute('class', 'selected');
        //   selectedOption.textContent = variant.variantName; // Set as the selected option
        // }

        dropdownOptions.appendChild(optionElement);
      });


      const variantDropdown = block.querySelector('#variant');
      const variantOption = block.querySelector('#variant-options');
      const selectedOptionContainer = block.querySelector('#variant-selected');
      variantDropdown.addEventListener('click', () => {
        variantOption.style.display = variantOption.style.display === "block" ? "none" : "block";
      });
      variantOption.addEventListener("click", async (e) => {
        if (!e.target || !e.target.matches("option")) {
          return; // Exit if the click is not on an <option>
        }
        const { selectedValue, selectedText } = handleOptionSelection(
          e,
          selectedOptionContainer,          // Reference to the selected option container
          variantOption                     // Reference to the dropdown container
        );
        const selecteVariant = selectedValue;
        const selectedVariantName = selectedText
        updatePayload.updateVarientID(selecteVariant);
        updatePayload.updateVarientName(selectedVariantName);
        toggleNextButton(1);

      });
      block.addEventListener("click", (e) => {
        if (!variantDropdown.contains(e.target)) {
          variantOption.style.display = "none";
        }
      })
    };

    hideAndShowEl(resendOtpContainer, 'none');

    sendotpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const otpCountDownSpan = document.createElement('span');
      otpCountDownSpan.id = 'otp-countDown';
      if (!resendotpBtn.querySelector('#otp-countDown')) {
        resendotpBtn.appendChild(otpCountDownSpan);
      }
      startOtpCountDown();
      sendotp();
      hideAndShowEl(sendotpContainer, 'none');
      hideAndShowEl(resendOtpContainer, 'flex');
    });

    resendotpBtn.addEventListener('click', () => {
      if (countDown > 0) return;
      clearInterval(interval);
      countDown = 30;
      startOtpCountDown();
      sendotp();
      // Clear previous OTP
      const otpErrorEl = resendOtpContainer.querySelector('#otp-error');
      if (otpErrorEl) hideAndShowEl(otpErrorEl, 'none');
      otpDigits.forEach(digit => {
        digit.value = '';
        digit.classList.remove('green', 'red');
      });
      otpInputField = '';
      otpDigits[0].focus();
    });

    otpDigits.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, ''); // Remove non-numeric characters
        if (input.value.length === 1 && index < otpDigits.length - 1) {
          otpDigits[index + 1].focus(); // Move to the next input
        }
        // Log current OTP
        otpInputField = Array.from(otpDigits)
          .map((digit) => digit.value)
          .join('');
        if (otpInputField.length === 5) {
          verifyMobileOtp();
        }
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && input.value === '' && index > 0) {
          otpDigits[index - 1].focus(); // Move to the previous input
        }
      });
    });

    function handleOptionSelection(event, selectedContainer, dropdownContainer) {
      event.stopPropagation(); // Prevent event bubbling

      const selectedOption = event.target;

      // Ensure the selected element exists and is valid
      if (!selectedOption) return;

      const selectedValue = selectedOption.value;
      const selectedText = selectedOption.textContent;

      // Update the selected value container
      selectedContainer.textContent = selectedText;

      // Remove 'selected' class from all options
      dropdownContainer.querySelectorAll(`option`).forEach((opt) => {
        opt.classList.remove("selected");
      });

      // Add 'selected' class to the clicked option
      selectedOption.classList.add("selected");

      // Hide the dropdown
      if (dropdownContainer) {
        dropdownContainer.style.display = "none";
      }

      // Return the selected value and text
      return { selectedValue, selectedText };
    }

    const carModel = block.querySelector('.car-model custom-select');
    const dropdownModel = carModel.querySelector('.dropdown-options');
    const modeldropdownOptions = document.getElementById("model-options");
    const selectedOptionContainer = carModel.querySelector('.selected-option');
    carModel.addEventListener('click', () => {
      dropdownModel.style.display = dropdownModel.style.display === "block" ? "none" : "block";
    });
    dropdownModel.addEventListener("click", async (e) => {
      if (!e.target || !e.target.matches("option")) {
        return; // Exit if the click is not on an <option>
      }
      const { selectedValue, selectedText } = handleOptionSelection(
        e,
        selectedOptionContainer,          // Reference to the selected option container
        modeldropdownOptions                     // Reference to the dropdown container
      );

      const selectedModel = selectedValue;
      const selectedModelName = selectedText;

      updatePayload.updateModelID(selectedModel);
      updatePayload.updateModelName(selectedModelName);
      updatePayload.updateVarientID('');
      updatePayload.updateVarientName('');
      toggleNextButton(1);
      const selectedVariantObj = await apiUtils.getCarVariantsByModelCd(selectedModel);
      updateCarVariantOptions(selectedVariantObj);
    });
    block.addEventListener("click", (e) => {
      if (!carModel.contains(e.target)) {
        dropdownModel.style.display = "none";
      }
    });

    userNameField.addEventListener('input', () => {
      userNameField.value = userNameField.value.replace(/[^A-Za-z\s]/g, '');
      const firstNameValue = userNameField.value;
      const isValid = /^[A-Za-z\s]*$/.test(firstNameValue);
      if (!isValid) {
        otpValidation.style.display = 'block';
      } else {
        otpValidation.style.display = 'none';
      }
    });

    const handleFormSuccess = (e) => {
      e.preventDefault();
      const details = {};
      const firstName = e.target.querySelector('[name="firstName"]')?.value?.trim() || '';
      const lastName = e.target.querySelector('[name="lastName"]')?.value?.trim() || '';
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      const mobile = document.getElementById('mobile').value;
      const state = e.target.querySelector('[name="dealer-state"] option:checked')?.textContent?.trim();
      const city = e.target.querySelector('[name="dealer-city"] option:checked')?.textContent?.trim();
      const socialCheckboxes = block.querySelectorAll('.social-checkboxes input[type="checkbox"]:checked');
      let whatsapp = 'n';
      let sms = 'n';
      let call = 'n';
      socialCheckboxes.forEach((checkbox) => {
        if (checkbox.value === 'whatsapp') whatsapp = 'y';
        if (checkbox.value === 'sms') sms = 'y';
        if (checkbox.value === 'call') call = 'y';
      });
      details.whatsapp = whatsapp;
      details.sms = sms;
      details.call = call;
      details.custName = fullName;
      details.city = city;
      details.state = state;
      details.formName = 'Register Your Interest';
      details.webName = e.submitter?.textContent?.trim() || '';
      details.linkType = 'other';
      details.phoneNumber = mobile;
      analytics.setEnquirySubmitDetails(details);
      const container = block.querySelector('.modal .container');
      container.classList.add('thank-you-container');
    };

    function selectDropdownOption(dropdownID, selectOption) {
      // Get the dropdown div by the constructed ID
      const dropdown = block.querySelector(`#${dropdownID}-options`);
      const selectedContainer = block.querySelector(`#${dropdownID}-selected`);

      // Find the option with the matching value
      const selectedOption = dropdown.querySelector(`option[value="${selectOption}"]`);

      // Ensure the selected element exists and is valid
      if (!selectedOption) return;

      const selectedValue = selectOption;
      const selectedText = selectedOption.textContent;

      // Update the selected value container
      selectedContainer.textContent = selectedText;

      // Remove 'selected' class from all options
      dropdown.querySelectorAll(`option`).forEach((opt) => {
        opt.classList.remove("selected");
      });

      // Add 'selected' class to the clicked option
      selectedOption.classList.add("selected");

      // Hide the dropdown
      if (dropdown) {
        dropdown.style.display = "none";
      }

    }


    function autoSelectModel(modelCd) {
      const dropdown = block.querySelector('#model');
      if(dropdown.options) {
        for (let i = 0; i < dropdown.options.length; i += 1) {
          if (dropdown.options[i].value === modelCd) {
            dropdown.selectedIndex = i;
            break;
          }
        }
      }
    }

    if (defaultModelCode) {
      selectDropdownOption('model',defaultModelCode);
      const selectedVariantObj = await apiUtils.getCarVariantsByModelCd(defaultModelCode);
      if(defaultModelCode!==evModelCode)
      updateCarVariantOptions(selectedVariantObj);
    }

    const customRules = {};
    const formValidationRules = mergeValidationRules(customRules);
    let initFormEvent = false;
    const closeBtn = block.querySelector('.close-button');
    const form = block.querySelector('form');
    const formFields = form.querySelectorAll('input, select');

    attachValidationListeners(
      form,
      formValidationRules,
      (e) => {
        try {
          handleFormSuccess(e); // If no error, call success handler
        } catch (error) {
          throw new Error('Error Submitting Form', error); // Catch any errors and handle them
        }
      },
      (e, invalidFields) => {
        const details = {};
        details.formName = 'Register Your Interest';
        details.errorField = invalidFields.map((field) => field.name).join('|');
        details.errorDetails = invalidFields
          .map((field) => {
            const formField = field.closest('.form-field');
            const validationText = formField.querySelector('.validation-text[style*="display: block"]');
            return validationText ? validationText.textContent?.trim() : '';
          })
          .join('|');
        details.errorType = 'Validation Error';
        details.linkType = 'other';
        details.webName = e.submitter?.textContent?.trim() || '';
        analytics.setWebError(details);
      },
    );

    function selectDropdownValue(valueToSelect) {
      selectDropdownOption('state', valueToSelect);
    }

    let currentStateCode = getSelectedLocationStorage()?.stateCode || 'DL';
    const stepPanels = block.querySelectorAll('.step-container');
    const nextButton = document.getElementById('interested');
    const backButton = document.getElementById('backButton');
    const currentStepElement = block.querySelector('.step-number');
    const stepTitle = block.querySelector('.step-title');
    geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);

    function setState(state) {
      selectDropdownValue(state);
    }

    function processData(cityData) {
      citiesObject = cityData?.reduce((acc, item) => {
        item.cityDesc = sentenceToTitleCase(item.cityDesc);
        acc[item.cityDesc] = {
          cityDesc: item.cityDesc,
          cityCode: item.cityCode,
          latitude: item.latitude,
          longitude: item.longitude,
          forCode: item.forCode,
          pinCode: item.pinCode,
        };
        return acc;
      }, {});
      return citiesObject;
    }

    async function getStateCodeByCity(response, cityName) {
      let stateCode = null;
      if (response && Array.isArray(response)) {
        response.forEach((item) => {
          if (item.cityDesc && item.cityDesc.toLowerCase() === cityName.toLowerCase()) {
            stateCode = item.stateCode;
          }
        });
      }
      return stateCode;
    }

    async function getStateCodeByCityCode(response, cityCode) {
      let stateCode = null;
      if (response && Array.isArray(response)) {
        response.forEach((item) => {
          if (item.cityDesc && item.cityCode.trim() === cityCode.trim()) {
            stateCode = item.stateCode;
          }
        });
      }
      return stateCode;
    }

    async function dealerPinCodeUpdate(locationObj) {
      const selectedLocation = getSelectedLocationStorage();
      if (locationObj) {
        geoLocationPayload.latitude = locationObj.latitude;
        geoLocationPayload.longitude = locationObj.longitude;
        geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);
        pincode.value = geoLocationData[0]?.pinCd;
      } else if (!selectedLocation) {
        pincode.value = geoLocationData[0]?.pinCd;
      } else if (selectedLocation) {
        geoLocationPayload.latitude = selectedLocation.location.latitude;
        geoLocationPayload.longitude = selectedLocation.location.longitude;
        geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);
        pincode.value = geoLocationData[0]?.pinCd;
      }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      return distance;
    }

    async function autoSelectNearestCity(latitude, longitude) {
      let nearestCity = null;
      // eslint-disable-next-line no-unused-vars
      let forCode = null;
      let minDistance = Infinity;
      const locationObj = {};

      // Iterating over all cities and logging latitude and longitude
      Object.keys(citiesObject).forEach((cityName) => {
        const cityLatitude = citiesObject[cityName].latitude;
        const cityLongitude = citiesObject[cityName].longitude;
        const distance = calculateDistance(latitude, longitude, cityLatitude, cityLongitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = cityName;
          forCode = citiesObject[cityName].forCode;
          locationObj.latitude = cityLatitude;
          locationObj.longitude = cityLongitude;
        }
      });

      dealerPinCodeUpdate(locationObj);
      dealersForm.innerHTML = await getNearestDealersAndUpdate(latitude, longitude);
      selectRadioButton();
      return nearestCity;
    }

    async function showPosition(position) {
      const lat4 = position.coords.latitude;
      const lon4 = position.coords.longitude;
      return autoSelectNearestCity(lat4, lon4);
    }

    async function getCurrentLocation() {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              resolve({ latitude, longitude });
            },
            (error) => {
              reject(error);
            },
          );
        });
      } else {
        throw new Error('Geolocation is not supported by this browser.');
      }
    }

    async function populateAllCities() {
      const suggestedPlaces = block.querySelector('.suggested-places-btd');

      suggestedPlaces.innerHTML = '';
      suggestedPlaces.innerHTML = `
      <custom-select class="form-dropdown-select true" id="city" name="city" aria-labelledby="city-label" required="">
          <div class="selected-option" id="city-selected">-Select City-*</div>
          <div class="dropdown-options" id="city-options"></div>
        </custom-select>
      `;
      suggestedPlaces.scrollTop = 0;
      const dropdownOptions = document.getElementById('city-options');
      const selectedOption = document.getElementById('city-selected');


      Object.keys(citiesObject).forEach((cityName, index) => {
        const optionElement = document.createElement('option');
        optionElement.value = citiesObject[cityName].forCode;
        optionElement.textContent = cityName;
        // Mark the first option as selected
        if (index === 0) {
          optionElement.classList.add('selected');
          selectedOption.textContent = cityName; // Set as the selected option
        }

        optionElement.setAttribute('data-citycode', citiesObject[cityName].cityCode);
        dropdownOptions.appendChild(optionElement);
      });
    }

    function selectOption(dropdown, criteria, isValue = true) {

      // Convert dropdown to an array if it's not already
      const options = Array.isArray(dropdown) ? dropdown : Array.from(dropdown);

      // Remove 'selected' class from all options
      options.forEach((option) => {
        option.classList.remove('selected');
      });

      // Iterate through the options and select the matching one
      options.forEach((option) => {
        if (typeof criteria === 'object') {
          if (option.value === criteria.code && option.text === criteria.cityName) {
            option.classList.add('selected');
            return option;
          }
        } else {
          const optionToCompare = isValue ? option.value : option.text;
          if (optionToCompare === criteria) {
            option.classList.add('selected');
            return option;
          }
        }
      });

      return null;
    }
    async function detectLocationBtd() {
      const detectLocation = block.querySelector('.detect-location__button_ryi');
      detectLocation.addEventListener('click', async () => {
        if (!allCityObj) {
          allCityObj = await commonApiUtils.getDealerCities();
        }
        const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
        citiesObject = await processData(filteredData);
        const location = await getCurrentLocation();
        let locationPromise= await apiUtils.getGeoLocation(location);
        const state = await getStateCodeByCityCode(allCityObj, locationPromise[0]?.cityCd);

        if(state) {
          setState(state);
          dealershipFlag = true;
          block.querySelector('.suggested-places-btd').classList.remove('disabled');
          updateValidationMessage('pin-code', '', 'none');
        } else {
          setState(null);
          dealershipFlag = false
          document.getElementById('state-selected').textContent = '-Select State-*';
          document.getElementById('city-selected').textContent = '-Select City-*';
          block.querySelector('.suggested-places-btd').classList.add('disabled');
          block.querySelector('#state-options .selected')?.classList.remove('selected');
          block.querySelector('#city-options .selected')?.classList.remove('selected');
          updateValidationMessage('pin-code', 'No dealership available for this pincode', 'block');
          document.getElementById('pincode').value=locationPromise[0]?.pinCd;
          dealersForm.innerHTML = await getNearestDealersAndUpdate(location.latitude, location.longitude);

          return;
        }

        const statewiseData = await commonApiUtils.getDealerCities(state);
        const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
        citiesObject = await processData(filteredStateData);
        await populateAllCities();
        await cityListener();
        updateValidationMessage('pin-code', '', 'none');
        const selectedOptionEl = block.querySelector(`option[data-citycode="${locationPromise[0]?.cityCd}"]`);
        block.querySelector('#city-selected').textContent=toTitleCase(locationPromise[0]?.cityDesc);
        block.querySelector('#city-options .selected')?.classList.remove('selected');
        document.getElementById('pincode').value=locationPromise[0]?.pinCd;
        selectedOptionEl.classList.add('selected');
        dealersForm.innerHTML = await getNearestDealersAndUpdate(location.latitude, location.longitude);
        selectRadioButton();
      });
    }

    function validatePincodeInput(event) {
      const input = event.target;
      const regex = /^\d*$/; // Allow only numeric characters

      // Remove non-numeric characters
      if (!regex.test(input.value)) {
        input.value = input.value.replace(/[^0-9]/g, '');
      }

      // Limit to 6 characters
      if (input.value.length > 6) {
        input.value = input.value.substring(0, 6);
      }
    }
    function updateValidationMessage(className, message, isVisible) {
      // Select the span element using its class
      const validationMessage = block.querySelector(`.${className} .validation-text.validation-required`);
      validationMessage.textContent = message; // Update the message
      validationMessage.style.display = isVisible ? 'block' : 'none'; // Toggle visibility

    }
    let isValidPincode = true;
    async function pincodeListener() {
      pincode.addEventListener('input', async (event) => {
        validatePincodeInput(event);
        const pincodeValue = event.target.value;
        if (pincodeValue && pincodeValue.length === 6) {
          geoLocationPayload = {
            pinCode: pincodeValue,
          };

          const citiesData = await apiUtils.getGeoLocation(geoLocationPayload);
          const cityName = citiesData[0]?.cityDesc;
          const lat2 = citiesData[0]?.latitude;
          const long2 = citiesData[0]?.longitude;
          const cityCode = citiesData[0]?.cityCd;
          if (cityName) {

            if (!allCityObj) {
              allCityObj = await commonApiUtils.getDealerCities();
            }
            const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
            citiesObject = await processData(filteredData);
            const state = await getStateCodeByCityCode(allCityObj, cityCode);
            if(state) {
              setState(state);
              dealershipFlag = true;
              block.querySelector('.suggested-places-btd').classList.remove('disabled');
              updateValidationMessage('pin-code', '', 'none');
            } else {
              setState(null);
              dealershipFlag = false
              document.getElementById('state-selected').textContent = '-Select State-*';
              document.getElementById('city-selected').textContent = '-Select City-*';
              block.querySelector('.suggested-places-btd').classList.add('disabled');
              block.querySelector('#state-options .selected')?.classList.remove('selected');
              block.querySelector('#city-options .selected')?.classList.remove('selected');
              updateValidationMessage('pin-code', 'No dealership available for this pincode', 'block');
              dealersForm.innerHTML = await getNearestDealersAndUpdate(lat2, long2);
              return;
            }
            const statewiseData = await commonApiUtils.getDealerCities(state);
            const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
            citiesObject = await processData(filteredStateData);
            await populateAllCities();
            const cityDropdownEl = block.querySelector('#city-options')
            const selectedOptionEl = block.querySelector(`option[data-citycode="${cityCode}"]`);
            block.querySelector('#city-selected').textContent=toTitleCase(cityName);
            block.querySelector('#city-options .selected')?.classList.remove('selected');
            selectedOptionEl.classList.add('selected');

            selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(cityName), false);
            dealersForm.innerHTML = await getNearestDealersAndUpdate(lat2, long2);
            selectRadioButton();
            updateValidationMessage('pin-code', '', 'none');
            isValidPincode = true;
          } else {
            isValidPincode = false;
            updateValidationMessage('pin-code', 'Please Enter valid Pincode', 'block');
            console.warn('City not found for the entered pincode');
          }
          await cityListener();
        }
        else {
          pincodeValue.length === 0 ? updateValidationMessage('pin-code', 'Please Enter Your Pincode', 'block') : updateValidationMessage('pin-code', 'Please Enter 6 digit Pincode', 'block');
        }
      });
    }

    async function cityListener() {
      const cityOption = block.querySelector('#city-options');
      const cityDropdown = block.querySelector('#city');
      const selectedOptionContainer = block.querySelector('#city-selected');
      cityDropdown.addEventListener('click', () => {
        cityOption.style.display = cityOption.style.display === "block" ? "none" : "block";
      });
      cityOption.addEventListener("click", async (e) => {
        if (!e.target || !e.target.matches("option")) {
          return; // Exit if the click is not on an <option>
        }
        const { selectedValue } = handleOptionSelection(e, selectedOptionContainer, cityOption);

        const selectedCity = selectedValue;
        const option = block.querySelector('#city-options option.selected');
        const cityCode = option.getAttribute('data-citycode');
        geoLocationPayload = {
          cityCd: cityCode,
        };
        const selectedCityData = Object.values(citiesObject).find(city => city.cityCode === cityCode);
        const selectedCityPincode = selectedCityData?.pinCode?.trim();
        const selectedCityLatitude = selectedCityData?.latitude?.trim();
        const selectedCityLongitude = selectedCityData?.longitude?.trim();
        pincode.value = selectedCityPincode??'';
        dealersForm.innerHTML = await getNearestDealersAndUpdate(selectedCityLatitude, selectedCityLongitude);
        selectRadioButton();

      });

      block.addEventListener("click", (e) => {
        if (!cityDropdown.contains(e.target)) {
          cityOption.style.display = "none";
        }
      })


    }

    async function dealerCityUpdate(forCode, cityName) {
      const selectedLocation = getSelectedLocationStorage();
      const criteria = { code: forCode, cityName };
      if (forCode && cityName) {
        selectOption(placesOptions, criteria, true);
      } else if (!selectedLocation) {
        selectOption(placesOptions, '08', true);
      } else if (selectedLocation) {
        criteria.code = selectedLocation.forCode;
        criteria.cityName = selectedLocation.cityName;
        selectOption(placesOptions, criteria, true);
      }
    }

    async function stateEventListner() {
      const stateOption = block.querySelector('#state-options');
      const stateDropdown = block.querySelector('#state');
      const selectedOptionContainer = block.querySelector('#state-selected');
      stateDropdown.addEventListener('click', () => {
        stateOption.style.display = stateOption.style.display === "block" ? "none" : "block";
      });
      stateOption.addEventListener("click", async (e) => {
        if (!e.target || !e.target.matches("option")) {
          return; // Exit if the click is not on an <option>
        }
        block.querySelector('.suggested-places-btd').classList.remove('disabled');
        dealershipFlag=true;
        updateValidationMessage('pin-code', '', 'none');
        const { selectedValue } = handleOptionSelection(e, selectedOptionContainer, stateOption);
        const stateCd = selectedValue;
        const result = await commonApiUtils.getDealerCities(stateCd);
        const filteredData = result?.filter((obj) => obj.cityDesc !== null);
        citiesObject = processData(filteredData);
        await populateAllCities();
        placesOptions = block.querySelector('.suggested-places-btd');
        pincode = block.querySelector('#pincode');
        await dealerCityUpdate();
        const selectedOption = block.querySelector('#city-options option.selected');
        const cityCode = selectedOption?.getAttribute('data-citycode');
        geoLocationPayload = {
          cityCd: cityCode,
        };

        const firstCityKey = Object.keys(citiesObject)[0];
        const firstCity = citiesObject[firstCityKey];
        const updatedPinCode = firstCity?.pinCode?.trim();
        const lat1 = firstCity?.latitude?.trim();
        const long1 = firstCity?.longitude?.trim();
        pincode.value = updatedPinCode ?? '';        
        //await pincodeListener();
        await cityListener();
        dealersForm.innerHTML = await getNearestDealersAndUpdate(lat1, long1);
        selectRadioButton();        
      });
      block.addEventListener("click", (e) => {
        if (!stateDropdown.contains(e.target)) {
          stateOption.style.display = "none";
        }
      })
    }

    const updateStepper = () => {
      // Show or hide the Back button based on the current step
      if (currentStep === 1) {
        backButton.classList.add('hidden'); // Hide completely for step 1
        stepTitle.textContent = fillDetailsText;
        disclaimer.style.visibility = 'hidden';
      } else {
        backButton.classList.remove('hidden'); // Show from step 2 onwards
        stepTitle.textContent = preferredDealership;
        disclaimer.style.visibility = 'visible';
      }

      // Update current step number (e.g., 01/02)
      currentStepElement.textContent = `${currentStep}/${TOTAL_STEPS}`;

      // Show only the current step content
      stepPanels.forEach((panel, index) => {
        panel.classList.toggle('active', index === currentStep - 1);
      });

      // Change Next button text on the last step
      nextButton.textContent = currentStep === stepPanels.length ? data.interested.label : nextButtonText;
    };

    closeBtn.addEventListener('click', async () => {
      block.closest('.register-your-interest-wrapper').style.display = 'none';
      block.querySelector('.container').classList.remove('thank-you-container');
      mobileField.querySelector('.tick-icon').classList.add('hidden');
      document.body.style.overflow = 'auto';
      initFormEvent = false;
      const mobileEl = block.querySelector('.form-field.mobileField');
      const otpdigits = block.querySelectorAll('.otp-digit');
      const resetPayload = {
        isDealerFlow: false,
        date: new Date(),
        timeSlot: '',
        timePeriodSlot: '',
        dealer_code: '', // Mandatory
        dealer_for_code: '', // Mandatory
        dealer_name: '',
        location_code: '', // Mandatory
        Name: '', // Mandatory
        Email: '', // Optional
        dealer_distance: '',
        dealer_address: '',
        Phone: '', // Mandatory
        maruti_service_id: '', // Optional
        maruti_service_name: '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
        color_cd: '', // Optional
        variant_cd: '', // Optional
        model_cd: '', // Optional
        test_drive_location: '', // Optional
        book_pref_btd_date: '', // Optional
        model_name: '', // Optional
        variant_name: '', // Optional
        color_name: '', // Optional
        vin_number: '', // Optional
        variantslot: '-', // Optional
        test_drive_address: '', // Optional
        exchange_preference: '', // Optional
        utm_medium: '', // Mandatory
        utm_source: '', // Mandatory
        utm_id: '', // Optional
        utm_content: '', // Optional
        utm_term: '', // Optional
        utm_campaign: '', // Optional
        is_client_meeting: '', // Optional
        marketing_checkbox: 1, // optional possible valie us 0 or 1
        transmission_type: '', // Optional
        house_street_area: '', // Optional
        landmark: '', // Optional
        state: '', // Optional
        city: '', // Optional
        pincode: '', // Optional
        fuel_type: '', // Optional // P for Petrol , C for CNG
        preferred_communication_channel: [],
        cust_fname: '',
        cust_lname: '',
      };
      currentStep = 1;
      block.querySelector('#register-interest-form').reset();
      if (mobileEl) {
        mobileEl.classList.remove('valid');
        mobileEl.querySelector('#mobile').removeAttribute('disabled');
        mobileEl.querySelector('#mobile').style.color = '#000';
      }

      sendotpContainer.style.display = 'block';
      sendotpBtn.disabled = true;
      isOtpVerified = false;
      resetCompleteForm();
      const otpContainerEl = block.querySelector('.resend-otp-container');
      const otpErrorEl = resendOtpContainer.querySelector('#otp-error');
      otpContainerEl.style.display = "none";
      otpdigits.forEach((digit) => {
        digit.classList.remove('green', 'red');
        digit.disabled = false; // Disables all digits
        digit.style.color = '#000'; // Optional: if you want to enforce consistent style
      });
      otpErrorEl.style.display = "none";
      payload = resetPayload;
      setState(currentStateCode);
      autoSelectModel(defaultModelCode);
      selectRadioButton();
      resetCountdown();
      updateStepper();
      toggleNextButton(1);
      prefillUserData();
    });

    const handleUserInteraction = (e) => {
      if (!initFormEvent) {
        const details = {};
        details.formName = 'Register Your Interest';
        details.webName = 'start';
        details.linkType = 'other';
        analytics.setEnquiryStartDetails(details);
        initFormEvent = true;
      }
    };

    function setPersonalData() {
      const details = {};
      details.formName = 'Register Your Interest';
      details.webName = document.getElementById('interested')?.textContent.trim();
      details.linkType = 'other';
      details.phoneNumber = document.getElementById('mobile').value;
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const model = payload.model_name;
      const variant = payload.variant_name;
      const custName = `${firstName} ${lastName}`;
      const enquiryStepName = stepTitle.textContent;
      dataLayerObj = {
        custName, model, variant, enquiryStepName,
      };
      analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
    }

    function finalFormSubmission() {
      let details = {};
      details.formName = 'Register Your Interest';
      details.webName = 'Submit';
      details.linkType = 'other';
      details.phoneNumber = mobileValue;
      const selectState = document.getElementById('state');
      const state = selectState?.querySelector('#state-selected')?.textContent.trim();
      const selectCity = document.getElementById('city');
      const city = selectCity?.querySelector('#city-selected')?.textContent.trim();
      const pincode = analyticsPincode;
      const dealer = payload.dealer_name;
      let whatsapp = 'n';
      let sms = 'n';
      let call = 'n';
      socialCheckboxesAnalytics.forEach((checkbox) => {
        if (checkbox.value === 'whatsapp') whatsapp = 'y';
        if (checkbox.value === 'sms') sms = 'y';
        if (checkbox.value === 'call') call = 'y';
      });
      details = {
        ...details, whatsapp, sms, call,
      };
      const dealerLocation = payload.dealer_address;
      const radius = payload.dealer_distance;
      const overview = {
        ...dataLayerObj, state, city, pincode, dealer, dealerLocation, radius,
      };
      delete overview.enquiryStepName;
      analytics.setEnquirySubmitDetails(details, overview, false);
    }

    formFields.forEach((field) => {
      field.addEventListener('focus', handleUserInteraction);
      field.addEventListener('change', handleUserInteraction);
    });

    async function waitForLocationInfo(key, timeout = 500, maxRetries = 10) {
      let retries = 0;
      const checkLocation = () => {
        const locationInfo = localStorage.getItem(key);
        return locationInfo ? JSON.parse(locationInfo) : null;
      };
      while (retries < maxRetries) {
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, timeout));
        const locationInfo = checkLocation();
        if (locationInfo && locationInfo.stateCode) {
          return locationInfo.stateCode;
        }
        retries += 1;
      }
      throw new Error('Location info not found in local storage within the time limit.');
    }

    block.addEventListener('updateLocation', async () => {
      const div = block.querySelector('.dealership-step');
      div.innerHTML = await getDealershipForm();
      const loc = await waitForLocationInfo('selected-location');
      currentStateCode = loc;
      setState(loc);
      const result = await commonApiUtils.getDealerCities(loc);
      const filteredData = result?.filter((obj) => obj.cityDesc !== null);
      citiesObject = processData(filteredData);
      await populateAllCities();
      placesOptions = block.querySelector('.suggested-places-btd');
      pincode = block.querySelector('#pincode');

      await pincodeListener();
      await cityListener();
      await dealerCityUpdate();
      await dealerPinCodeUpdate();
      await stateEventListner();
      selectRadioButton();
    });

    const result = await commonApiUtils.getDealerCities(currentStateCode);
    const filteredData = result?.filter((obj) => obj.cityDesc !== null);
    citiesObject = await processData(filteredData);
    setState(currentStateCode);
    await populateAllCities();

    placesOptions = block.querySelector('.suggested-places-btd');
    pincode = block.querySelector('#pincode');
    await dealerCityUpdate();
    await dealerPinCodeUpdate();
    await pincodeListener();
    await cityListener();
    detectLocationBtd();
    stateEventListner();
    const links = block.querySelectorAll('.disclaimer-text a');
    links.forEach(link => { link.setAttribute('target', '_blank'); });

    function showErrorToaster(message, spanMessage) {
      // Create a toaster div
      const toaster = document.createElement('div');
      toaster.classList.add('custom-toaster'); // Add the CSS class

      // Add the main message
      const messageText = document.createElement('span');
      messageText.innerText = message;

      // Add the span for "Please try again later"
      const spanText = document.createElement('span');
      spanText.innerText = spanMessage;
      spanText.id = 'toaster-retry-message';

      // Create the close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;'; // HTML entity for the cross icon

      // Close toaster on button click
      closeButton.addEventListener('click', () => {
        toaster.remove();
      });

      // Append elements to the toaster
      toaster.appendChild(messageText);
      toaster.appendChild(spanText);
      toaster.appendChild(closeButton);

      // Append toaster to body
      document.body.appendChild(toaster);
    }

    function resetCompleteForm() {
      const optionEl = block.querySelector("#model-options option.selected");
      currentStep = 1;
      stepPanels.forEach((panel, index) => {
        panel.classList.toggle("active", index === currentStep - 1);
      });
      block.querySelector("#register-interest-form").reset();
      userNameField.value='';
      updateStepper();
      if (optionEl) {
        updatePayload.updateModelID(optionEl.value);
        updatePayload.updateModelName(optionEl.textContent);
      }
    }

    async function submitFormAfterFinalPayload() {
      const finalPayloadforAPI = finalPayload();
      try {
        const resp = await commonApiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
        if (resp.status === 200) {
          block.querySelector('.container').classList.add('thank-you-container');
          const thankYouText = block.querySelector('.thank-you-information .title');
          const firstName = userNameField.value;
          thankYouText.textContent = 'Thank you, {first-name}';
          thankYouText.textContent = thankYouText.textContent.replace('{first-name}', firstName);
          mobileValue = block.querySelector('#mobile')?.value;
          analyticsPincode = block.querySelector('#pincode')?.value;
          socialCheckboxesAnalytics = block.querySelectorAll('.social-checkboxes input[type="checkbox"]:checked');
          resetCompleteForm();
          toggleNextButton(currentStep);
          finalFormSubmission();
        } else if (resp.status === 400) {
          const otpdigits = block.querySelectorAll('.otp-digit');
          otpdigits.forEach((digit) => {
            digit.classList.remove('green');
            digit.classList.remove('red');
            digit.disabled = false;
            digit.removeAttribute('style');
            digit.value = '';
          });
          document.getElementById('mobile').disabled = false;
          document.getElementById('mobile').removeAttribute('style');
          mobileField.classList.remove('valid');
          mobileField.querySelector('.tick-icon').classList.add('hidden');
          block.querySelector('.otp-container').style.display = 'block';
          resetCountdown();
          if (await sendotp()) {
            startOtpCountDown();
          }
          toggleNextButton(currentStep);
          backButton.click();
        } else {
          if (currentStep > 1) {
            currentStep -= 1; // Move to the previous step
            updateStepper();
          }
          toggleNextButton(currentStep);
          showErrorToaster('Submission failed | ', 'Please try again later');
        }
      } catch (error) {
        console.error('Error during API submission:', error);
      }
    }

    nextButton.addEventListener('click', async() => {
      if (currentStep < stepPanels.length) {
        if (currentStep === 1) {
          // Get the values for first name, last name, selected city, and selected state
          const firstName = document.getElementById('first-name').value;
          const lastName = document.getElementById('last-name').value;
          const fullName = `${firstName} ${lastName}`;
          const mobile = document.getElementById('mobile').value;
          updatePayload.updatePhoneNo(mobile);

          updatePayload.updateCustFName(firstName);
          updatePayload.updateCustLName(lastName);
          updatePayload.updateName(fullName);
          setPersonalData();
          // next button
          // nextButtonData();
        }

        currentStep += 1;
        updateStepper();
      } else if (currentStep === stepPanels.length) {
        if(submissionFlag) {
          try {
            submissionFlag = false;
            await submitFormAfterFinalPayload();
          } finally {
            submissionFlag = true;
          }
        }
      }

      toggleNextButton(currentStep);
    });

    // Event listener for Back button
    backButton.addEventListener('click', () => {
      const mobileElement = block.querySelector('#mobile');
      mobileElement.disabled=true;
      if (currentStep > 1) {
        currentStep -= 1; // Move to the previous step
        updateStepper();
      }
      toggleNextButton(currentStep);
    });

    // Initialize the stepper on page load
    updateStepper();

    function validateAlphabetInput(event) {
      const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
      if (!regex.test(event.target.value)) {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
      }
    }

    const firstNameInput = document.getElementById('first-name');
    firstNameInput.addEventListener('input', (e) => {
      validateAlphabetInput(e);
      toggleNextButton(1);
    });

    const lastNameInput = document.getElementById('last-name');
    lastNameInput.addEventListener('input', (e) => {
      validateAlphabetInput(e);
      toggleNextButton(1);
    });

    const mobileNo = document.getElementById('mobile');
    const mobileErrorEl = document.getElementById('mobile-validation');
    mobileNo.addEventListener('input', (evt) => {
      mobileNo.value = mobileNo.value.replace(/[+\*#;N,()/\.]/g, '');
      if(mobileNo.value.length>0 && mobileNo.value[0]==='0'){
        mobileNo.value = mobileNo.value.slice(1);
      }
      if(mobileNo.value.length>10){
        mobileNo.value = mobileNo.value.slice(0,10);
      }
      if (mobileNo.value.length === 10 && /^[0-9]+$/.test(mobileNo.value)) {
        mobileErrorEl.style.display = 'none';
      }
      else if(mobileNo.value.length === 0){
         mobileErrorEl.style.display = 'none';
      }
      else {
        mobileErrorEl.style.display = 'block';
      }
      toggleNextButton(1);
    });
    mobileNo.addEventListener('keypress', (evt) => {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
        return false;

      }
      return true;
    });
    ['copy', 'paste', 'cut'].forEach((event) => {
      mobileNo.addEventListener(event, (evt) => {
        evt.preventDefault();
      });
    });

    // Initial call to set the button state for the first step
    toggleNextButton(1);

    selectRadioButton();

    // Function to get the checked values
    function getCheckedValues() {
      const checkedValues = [];

      // Get all checkboxes with the 'form-checkbox' class
      const checkboxes = block.querySelectorAll('.communication-checkbox input');

      // Loop through checkboxes and add checked ones to the array
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          checkedValues.push(checkbox.value.charAt(0));
        }
      });

      updatePayload.updatePreferredCommunicationChannel(checkedValues);
      toggleNextButton(2);

      return checkedValues;
    }

    getCheckedValues();

    // Event listener for changes in the checkboxes
    block.querySelectorAll('.communication-checkbox input').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        getCheckedValues();
      });
    });

    const option = block.querySelector('#model-options option.selected');
    if (option) {
      updatePayload.updateModelID(option.value);
      updatePayload.updateModelName(option.textContent);
    }
  };
  initForm();
}
