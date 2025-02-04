import formDataUtils from '../../utility/formDataUtils.js';
import { fetchPlaceholders, getMetadata } from '../../commons/scripts/aem.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../utility/utility.js';
import { attachValidationListeners, mergeValidationRules } from '../../utility/validation.js';
import analytics from '../../utility/analytics.js';
import commonApiUtils, {
  toTitleCase, sentenceToTitleCase,
} from '../../commons/utility/apiUtils.js';
import authUtils from '../../commons/utility/authUtils.js';
import modelUtility from '../../utility/modelUtils.js';

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const [
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
    previousButtonEl,
    tAndCTextEl,
    thankyouTitleEl,
    thankyouDescEl,
    thankyouImageEl,
    thankyouImageElAlt, ,
    formStyleEl,
  ] = innerDiv.children;
  let dataLayerObj = {};
  const title = titleEl?.textContent?.trim() || '';
  const subtitle = descriptionEl?.textContent?.trim() || '';
  const fillDetails = fillDetailsEl?.textContent?.trim() || '';
  const welcomeImage = welcomeImageEl?.querySelector('picture img');
  const preferredDealership = preferredDealershipEl?.textContent?.trim() || '';
  const sendOtpButton = sendOtpButtonEl?.textContent?.trim() || '';
  const personalDetails = personalDetailsEl?.textContent?.trim() || '';
  const chooseModel = chooseModelEl?.textContent?.trim() || '';
  const selectDealership = selectDealershipEl?.textContent?.trim() || '';
  const nextButtonText = nextButtonEl?.textContent?.trim() || '';
  const previousButtonText = previousButtonEl?.textContent?.trim() || '';
  const thankyouTitle = thankyouTitleEl?.textContent?.trim() || '';
  const thankyouDesc = thankyouDescEl?.textContent?.trim() || '';
  const thankyouImage = thankyouImageEl?.querySelector('picture');
  const thankyouImageAlt = thankyouImageElAlt?.textContent?.trim() || '';
  const formStyle = formStyleEl?.textContent?.trim() || '';
  const { publishDomain, sitedomain, defaultLatitude: initialLat, defaultLongitude: initialLong } = await fetchPlaceholders();
  let finalOtp;
  let finalTid;
  let finalRequestId;
  let otpTid;
  let otpMobileNum;
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
  const payload = {
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

  tAndCTextEl?.querySelectorAll('a').forEach((ele) => ele.classList?.add('terms_conditions_link'))
  tAndCTextEl?.classList.add('disclaimer-text');
  block.innerHTML = '';

  const initForm = async () => {

    const data = await formDataUtils.fetchFormData('form-data-register-your-interest');
    const defaultModel = getMetadata('car-model-name');

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
        utm_medium: 'paid',
        utm_source: 'fb',

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
          const sendotpBtn = document.querySelector('#sendotp-btn');
          const mobileValidationError = document.querySelector('#mobile-validation');

          if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
            hideAndShowEl(mobileValidationError, 'none');
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
          const pincode = document.getElementById('pincode').value;
          const isPincodeValid = (pincode.length === 6 && isValidPincode);
          if (!dealerInput || payload.preferred_communication_channel.length === 0 || !isPincodeValid) {
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
      const nextButton = document.querySelector('.next-btn');
      if (nextButton) {
        nextButton.disabled = !validateStepFields(stepNumber);
      }
    }
    let selectedDealerType;
    function selectRadioButton() {
      document.querySelectorAll('.dealer__radio').forEach((radio) => {
        radio.addEventListener('change', () => {
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

          // Find the selected dealer card
          const selectedDealerCard = radio.closest('.dealer__card');

          // Get the dealer's name, distance, and address
          const dealerName = selectedDealerCard.querySelector('.dealer__name')?.textContent;
          const dealerDistance = `${selectedDealerCard.querySelector('.dealer__distance')?.textContent.split(' ')[0]} Kms`;
          const dealerAddress = selectedDealerCard.querySelector('.dealer__address')?.textContent;
          const dealerCode = selectedDealerCard.querySelector('.dealer__code')?.textContent;
          const dealerforCode = selectedDealerCard.querySelector('.dealer_for_code')?.textContent;
          const locationCode = selectedDealerCard.querySelector('.location_code')?.textContent;
          selectedDealerType = selectedDealerCard.querySelector('.dealership__top__info').getAttribute('data-dealerType');

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
      updatePayload.updateDealerName('');
      updatePayload.updateDealerAddress('');
      updatePayload.updateDealerDistance('');
      toggleNextButton(2);
      const dealerContainer = document.createElement('div');
      dealerContainer.classList.add('dealer__list__container');
      const radius = 500000;
      let dealers = [];
      try {
        const response = await commonApiUtils.getNearestDealers(latitude, longitude, radius);
        dealers = response.filter((dealer) => dealer.channel === 'EXC');
      } catch (error) {
        dealers = [];
      }

      dealers.slice(0, 4).forEach((dealer) => {
        const dealerCode = dealer.dealerUniqueCd;
        const dealerForCode = dealer.forCd;
        const dealerType = dealer.dealerType || '';
        const locCode = dealer.locCd;
        const card = document.createElement('div');
        card.className = 'dealer__card';

        const dealerCardHeader = document.createElement('div');
        dealerCardHeader.classList.add('dealer-card__header');

        const dealerCardFooter = document.createElement('div');
        dealerCardFooter.classList.add('dealer-card__footer');

        card.append(dealerCardHeader);
        card.append(dealerCardFooter);

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'dealer';
        radio.value = dealer.name;
        radio.className = 'dealer__radio';

        const name = document.createElement('p');
        name.textContent = sentenceToTitleCase(dealer.name);
        name.className = 'dealer__name';

        const distanceTag = document.createElement('p');
        distanceTag.textContent = `${(dealer.distance / 1000).toFixed(2)} Kms`;
        distanceTag.className = 'dealer__distance';

        const address = document.createElement('p');
        address.textContent = formatAddress(dealer.addr1, dealer.addr2);
        address.className = 'dealer__address';

        const dealerCodeP = document.createElement('p');
        dealerCodeP.textContent = dealerCode;
        dealerCodeP.className = 'dealer__code hidden';

        const dealerForCodeP = document.createElement('p');
        dealerForCodeP.textContent = dealerForCode;
        dealerForCodeP.className = 'dealer_for_code hidden';

        const locationCodeP = document.createElement('p');
        locationCodeP.textContent = locCode;
        locationCodeP.className = 'location_code hidden';

        const dealerTop = document.createElement('div');
        dealerTop.classList.add('dealership__top');

        const dealerTopInfo = document.createElement('div');
        dealerTopInfo.classList.add('dealership__top__info');
        dealerTopInfo.setAttribute('data-dealerType', dealerType);
        dealerTopInfo.appendChild(name);

        // dealerTopInfo.appendChild(distanceTag);
        dealerTop.append(radio)
        dealerTop.append(dealerTopInfo)

        dealerCardHeader.append(dealerTop)
        dealerCardHeader.append(distanceTag)

        dealerCardFooter.append(address)

        // card.appendChild(radio);
        // card.appendChild(dealerTopInfo);
        // card.appendChild(address);
        card.appendChild(dealerCodeP);
        card.appendChild(dealerForCodeP);
        card.appendChild(locationCodeP);

        dealerContainer.appendChild(card);
      });
      return `
        <div class="container__dealers">
          ${dealerContainer ? dealerContainer.outerHTML : ''}
        </div>
      `;
    }

    const modelList = await commonApiUtils.getModelList('EXC');

    async function getDealershipForm() {
      const selectedLocation = getSelectedLocationStorage();
      if (selectedLocation) {
        lat = selectedLocation.location.latitude?.trim();
        long = selectedLocation.location.longitude?.trim();
      }
      const dealershipFormHTML = `
        <div class="dealership-form-container">
          <div class='left-section'>
            <div class='location-details'>
              <p class='form-heading'>${preferredDealership}</p>
              <div class='form-fields'>
                ${formDataUtils.createDropdownFromArray(data.state, stateList, 'dropdown-state-user', true, {}, '', '', true, 'custom')}
                ${formDataUtils.createDropdownFromArray(data.city, [], 'suggested-places-btd', true, {}, '', '', true, 'custom')}
                ${formDataUtils.createInputField(data.pincode, 'pincode', 'text', {})}
              </div>
            </div>
            <div class="socials">
              <p class="reach-heading form-heading">${data.socialIcon.label}</p>
              <div class="social-checkboxes">
                ${formDataUtils.createCheckboxes({ ...data.socialIcon, label: '' }, '', 'communication-checkbox')}
              </div>
            </div>
          </div>
          <div class='right-section'>
            ${await getNearestDealersAndUpdate(lat, long)}
          </div>
        </div>
      `;
      return dealershipFormHTML;
    }

    function getPersonalDetailsForm() {
      const html = `
        <div class='personal-details-form'>
          <div class='personal-details'>
            <p class='form-heading'>${fillDetails}</p>
            <div class="form-fields">
              ${formDataUtils.createInputField(data?.firstName, 'first-name', 'text', { minlength: 3, maxlength: 30 }, formStyle)}
              ${formDataUtils.createInputField(data?.lastName, 'last-name', 'text', { minlength: 3, maxlength: 30 }, formStyle)}
              ${formDataUtils.createInputField(data.mobile, 'mobileField', 'tel', { minlength: 10, maxlength: 10 }, formStyle)}
              ${formDataUtils.createSendOtpField(data.otp, 'half-width resend-otp-container', 'resend-otp-btn', { minlength: 5, maxlength: 5 }, formStyle)}
              <div class="sendotp-container otp-button-container">
                <button id="sendotp-btn" class="button button-secondary-blue otp-button">
                ${sendOtpButton}
              </button>
            </div>
            </div>
          </div>
          <div class='model-details'>
            <div class='form-fields-container'>
              <p class='form-heading'>${chooseModel}</p>
              <div class="form-fields">
                ${formDataUtils.createDropdownFromArray(data.model, modelList, 'car-model', true, {}, '', true, false, 'custom')}
                ${formDataUtils.createDropdownFromArray(data.variant, [], 'model-variant', true, {}, '', true, false, 'custom')}
              </div>
            </div>
            <div class='image-container'>
              ${welcomeImage.outerHTML}
            </div>
          </div>
        </div>
      `;
      return html;
    }

    if (welcomeImage) {
      welcomeImage.setAttribute('alt', 'form-image');
      welcomeImage.removeAttribute('width');
      welcomeImage.removeAttribute('height');
    }

    if (thankyouImage) {
      const image = thankyouImage?.querySelector('img');
      image?.setAttribute('alt', thankyouImageAlt);
      image?.removeAttribute('width');
      image?.removeAttribute('height');
    }

    block.innerHTML = utility.sanitizeHtml(` 
        <div class="container">
        <div class="title-container">
          <button id='backButton' class='back-button hidden'></button>
          <div class='title-header'>
            <h3 class='title'>${title}</h3>
            <p class='description'>${subtitle}</p>
          </div>
          </div>
          <div class='stepper-container'>
            <div class="stepper">
              <div class="step" data-step="1"><span>1</span> ${personalDetails}</div>
              <div class="step" data-step="2"><span>2</span> ${selectDealership}</div>
            </div>
            <div class="content">
              <form id='register-interest-form' novalidate>
                <div class="step-content" id="step1">${getPersonalDetailsForm()}</div>
                <div class="step-content" id="step2">${await getDealershipForm()}</div>
              </form>
            </div>
            <div class="footer">
              <div class='disclaimer-container'>
                ${tAndCTextEl?.outerHTML}
              </div>
              <div class='controls'>
                <button class='prev-btn button secondary-black-btn'>${previousButtonText}</button>
                <button class='next-btn button button-primary-blue cta__new cta__new-primary' id="nextButton">${nextButtonText}</button>
              </div>
            </div>
          </div>
        </div>
        <!-- Thankyou popup -->
        <div class='modal success-modal hidden'>
          <div class='modal-content'>
            <div class='thank-you-image'>${thankyouImage?.outerHTML}</div>
            <div class='content-overlay'>
              <div class='content'>
                <span class='thank-you-icon'></span>
                <p class='title'>${thankyouTitle}</p>
                <p class='description'>${thankyouDesc}</p>
              </div>
            </div>
            <button class='close-button' type='button'></button>
          </div>
        </div>
    `);

    await authUtils.waitForAuth();
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

    const resendOtpContainer = block.querySelector('.resend-otp-container');
    const sendotpContainer = block.querySelector('.sendotp-container');
    const sendotpBtn = block.querySelector('#sendotp-btn');
    const resendotpBtn = block.querySelector('#resend-otp-btn');
    const mobileField = block.querySelector('.mobileField');
    const otpValidation = resendOtpContainer.querySelector('.validation-text');
    const otpDigits = document.querySelectorAll('.otp-digit');
    const carModel = block.querySelector('.car-model custom-select');
    const modelVariant = block.querySelector('.model-variant select');
    const userNameField = block.querySelector('.first-name').querySelector('input');
    const carImage = block.querySelector('.image-container img');
    const successModal = block.querySelector('.success-modal');
    const modalCloseBtn = block.querySelector('.close-button');
    const disclaimer = block.querySelector('.disclaimer-container');
    const selectedOptionContainer = carModel.querySelector('.selected-option');
    const dropdownModel = carModel.querySelector('.dropdown-options');
    const modeldropdownOptions = document.getElementById("model-options");

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
    carModel.addEventListener('click', () => {
      dropdownModel.style.display = dropdownModel.style.display === "block" ? "none" : "block";
    });
    dropdownModel.addEventListener("click", async (e) => {
      // Check if the click is on a valid option
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

      // Update payload and trigger actions
      updatePayload.updateModelID(selectedModel);
      updatePayload.updateModelName(selectedModelName);
      updatePayload.updateVarientID('');
      updatePayload.updateVarientName('');
      toggleNextButton(1);

      const selectedVariantObj = await apiUtils.getCarVariantsByModelCd(selectedModel);
      updateCarVariantOptions(selectedVariantObj);
      updateCarImage(selectedModel);
    });
    document.addEventListener("click", (e) => {
      if (!carModel.contains(e.target)) {
        dropdownModel.style.display = "none";
      }
    });
    // green tick for otp verification, initially hidden
    const tickIcon = `
        <span class='tick-icon hidden'></span>
      `;
    mobileField.insertAdjacentHTML('beforeend', tickIcon);

    const startOtpCountDown = () => {
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

      interval = setInterval(() => {
        countDown -= 1;
        const minutes = Math.floor(countDown / 60);
        const seconds = countDown % 60;
        otpCountDown.textContent = ` (${minutes}:${seconds.toString().padStart(2, '0')} s)`;
        if (countDown <= 0) {
          clearInterval(interval); // Stop the timer when countdown reaches 0
          otpCountDown.textContent = '';
          resendOtpButton.style.color = '#18171A';
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
      try {
        const response = await commonApiUtils.otpValidationRequest(otp, requestId, mobileNumber, otpTid);
        if (response.ok) {
          const result = await response.json();
          if (result.data.status === 'OTP_VERIFIED' && result.data.tId) {
            finalOtp = otp;
            finalRequestId = requestId;
            finalTid = result.data.tId;
            verifyOtpData();
            return true;
          }
          const details = {};
          details.formName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to verify OTP';
          details.webName = 'Verify OTP';
          details.linkType = 'other';
          details.phoneNumber = mobileNumber;
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
      const otpdigits = document.querySelectorAll('.otp-digit');
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
          document.getElementById('mobile').style.backgroundColor = 'var(--tertiary-white)';
          document.getElementById('mobile').style.borderBottom = '1px dashed var(--tertiary-deep-Grey)';
          document.getElementById('mobile').style.color = '#939393';
          mobileField.classList.add('valid');
          mobileField.querySelector('.tick-icon').classList.remove('hidden');
          setTimeout(() => {
            document.querySelector('.otp-container').style.display = 'none';
          }, 3000);
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


    const updateCarVariantOptions = (variantData, defaultVariantCd = '') => {
      // Select the target div
      const variantDiv = document.querySelector("#variant-div");

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
        optionElement.textContent = variant.variantName;
        optionElement.setAttribute('class', 'dropdown-item');

        // Mark the first option as selected
        // if (index === 0) {
        //   optionElement.setAttribute('class', 'selected');
        //   selectedOption.textContent = variant.variantName; // Set as the selected option
        // }

        dropdownOptions.appendChild(optionElement);
      });


      const variantDropdown = document.querySelector('#variant');
      const variantOption = document.querySelector('#variant-options');
      const selectedOptionContainer = document.querySelector('#variant-selected');
      variantDropdown.addEventListener('click', () => {
        variantOption.style.display = variantOption.style.display === "block" ? "none" : "block";
      });
      variantOption.addEventListener("click", async (e) => {
        // Check if the click is on a valid option
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
      document.addEventListener("click", (e) => {
        if (!variantDropdown.contains(e.target)) {
          variantOption.style.display = "none";
        }
      })
    };

    const updateCarImage = async (model) => {
      const url = `${publishDomain}/graphql/execute.json/msil-platform/variantFuelType;modelCd=${model};locale=en;`;
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      try {
        const resp = await fetch(url, requestOptions);
        const response = await resp.json();
        const carImageNav = response?.data?.carModelList?.items[0].carImage._publishUrl;
        let carImageBTD = response?.data?.carModelList?.items[0]?.carImageRegisterYourInterestSection?._dynamicUrl;
        carImageBTD = carImageBTD ? (sitedomain + carImageBTD) : carImageBTD;
        carImage.src = carImageBTD || carImageNav;
      } catch (error) {
        throw new Error('Unable to fetch car image');
      }
    };

    hideAndShowEl(resendOtpContainer, 'none');

    sendotpBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      document.getElementById('mobile').disabled = true;
      const otpCountDownSpan = document.createElement('span');
      otpCountDownSpan.id = 'otp-countDown';
      if (!resendotpBtn.querySelector('#otp-countDown')) {
        resendotpBtn.appendChild(otpCountDownSpan);
      }
      if (await sendotp()) {
        startOtpCountDown();
        hideAndShowEl(sendotpContainer, 'none');
        hideAndShowEl(resendOtpContainer, 'block');
      }
    });

    resendotpBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      clearInterval(interval);
      countDown = 30;
      if (await sendotp()) {
        startOtpCountDown();
      }
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
      const stepTitle = block.querySelector('.stepper .step.selected')?.textContent.substring(2);
      const enquiryStepName = stepTitle;
      details.whatsapp = whatsapp;
      details.sms = sms;
      details.call = call;
      details.custName = fullName;
      details.city = city;
      details.state = state;
      details.formName = 'Register Your Interest';
      details.webName = e.submitter?.textContent?.trim() || '';
      details.linkType = 'other';
      details.phoneNumber = mobileNumber;
      const dealerLocation = payload.dealer_address;
      analytics.setEnquirySubmitDetails(details, { enquiryStepName, dealerLocation });
      const container = block.querySelector('.modal .container');
      container.classList.add('thank-you-container');
    };

    function autoSelectModel(searchValue) {
      const dropdown = block.querySelector('#model');
      for (let i = 0; i < dropdown.options.length; i += 1) {
        if (dropdown.options[i].textContent.trim() === searchValue.trim()) {
          dropdown.selectedIndex = i;
          break;
        }
      }
    }

    if (defaultModel) {
      autoSelectModel(defaultModel);
      const modelCd = block.querySelector('#model').value;
      const selectedVariantObj = await apiUtils.getCarVariantsByModelCd(modelCd);
      updateCarVariantOptions(selectedVariantObj);
    }

    const customRules = {};
    const formValidationRules = mergeValidationRules(customRules);
    let initFormEvent = false;
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

    function selectDropdownOption(dropdownID, selectOption) {
      // Get the dropdown div by the constructed ID
      const dropdown = document.querySelector(`#${dropdownID}-options`);
      const selectedContainer = document.querySelector(`#${dropdownID}-selected`);

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

    function selectDropdownValue(valueToSelect) {
      selectDropdownOption('state', valueToSelect);
    }

    let currentStateCode = getSelectedLocationStorage()?.stateCode || 'DL';
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const backButton = document.getElementById('backButton');
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.step-content');
    const dealersForm = block.querySelector('.dealership-form-container .right-section');
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

    async function requestLocationPermission() {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const nearestCity = await showPosition(position);
              resolve(nearestCity);
            },
            (error) => {
              reject(error);
            },
          );
        });
      }
      return null;
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

        optionElement.setAttribute('data-cityCode', citiesObject[cityName].cityCode);
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
      const detectLocation = block.querySelector('.inner-detect-location__box_tab');
      detectLocation.addEventListener('click', async () => {
        if (!allCityObj) {
          allCityObj = await commonApiUtils.getDealerCities();
        }
        const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
        citiesObject = await processData(filteredData);
        const detectedCity = await requestLocationPermission();
        const state = await getStateCodeByCity(allCityObj, detectedCity);
        setState(state);
        const statewiseData = await commonApiUtils.getDealerCities(state);
        const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
        citiesObject = await processData(filteredStateData);
        await populateAllCities();
        selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(detectedCity), false);
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

    // Function to update the message
    function updateValidationMessage(className, message, isVisible) {
      // Select the span element using its class
      const validationMessage = document.querySelector(`.${className} .validation-text.validation-required`);
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
          // const forCd = citiesData[0]?.forCd;
          if (cityName) {
            if (!allCityObj) {
              allCityObj = await commonApiUtils.getDealerCities();
            }
            const filteredData = allCityObj?.filter((obj) => obj.cityDesc !== null);
            citiesObject = await processData(filteredData);
            const state = await getStateCodeByCity(allCityObj, cityName);
            setState(state);
            const statewiseData = await commonApiUtils.getDealerCities(state);
            const filteredStateData = statewiseData?.filter((obj) => obj.cityDesc !== null);
            citiesObject = await processData(filteredStateData);
            await populateAllCities();
            selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(cityName), false);
            dealersForm.innerHTML = await getNearestDealersAndUpdate(lat2, long2);
            selectRadioButton();
            updateValidationMessage('pincode', '', 'none');
            isValidPincode = true;
            toggleNextButton(2);
          } else {
            isValidPincode = false;
            updateValidationMessage('pincode', 'Please Enter valid Pincode', 'block');
            console.warn('City not found for the entered pincode');
            toggleNextButton(2);
          }
        }
        else {
          pincodeValue.length === 0 ? updateValidationMessage('pincode', 'Please Enter Your Pincode', 'block') : updateValidationMessage('pincode', 'Please Enter 6 digit Pincode', 'block');
          toggleNextButton(2);

        }
      });
    }

    async function cityListener() {
      const cityOption = document.querySelector('#city-options');
      const cityDropdown = document.querySelector('#city');
      const selectedOptionContainer = document.querySelector('#city-selected');
      cityDropdown.addEventListener('click', () => {
        cityOption.style.display = cityOption.style.display === "block" ? "none" : "block";
      });
      cityOption.addEventListener("click", async (e) => {
        // Check if the click is on a valid option
        if (!e.target || !e.target.matches("option")) {
          return; // Exit if the click is not on an <option>
        }
        const { selectedValue } = handleOptionSelection(e, selectedOptionContainer, cityOption);

        const selectedCity = selectedValue;
        const option = document.querySelector('#city-options option.selected');
        const cityCode = option.getAttribute('data-citycode');
        geoLocationPayload = {
          cityCd: cityCode,
        };
        const pinCodeData = await apiUtils.getGeoLocation(geoLocationPayload);
        const updatedPinCode = pinCodeData[0]?.pinCd;
        const lat3 = pinCodeData[0]?.latitude;
        const long3 = pinCodeData[0]?.longitude;
        pincode.value = updatedPinCode;
        dealersForm.innerHTML = await getNearestDealersAndUpdate(lat3, long3);
        selectRadioButton();

      });

      document.addEventListener("click", (e) => {
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
      const stateOption = document.querySelector('#state-options');
      const stateDropdown = document.querySelector('#state');
      const selectedOptionContainer = document.querySelector('#state-selected');
      stateDropdown.addEventListener('click', () => {
        stateOption.style.display = stateOption.style.display === "block" ? "none" : "block";
      });
      stateOption.addEventListener("click", async (e) => {
        // Check if the click is on a valid option
        if (!e.target || !e.target.matches("option")) {
          return; // Exit if the click is not on an <option>
        }
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
        const cityCode = selectedOption.getAttribute('data-citycode');
        geoLocationPayload = {
          cityCd: cityCode,
        };
        const pinCodeData = await apiUtils.getGeoLocation(geoLocationPayload);
        const updatedPinCode = pinCodeData[0]?.pinCd;
        const lat1 = pinCodeData[0]?.latitude;
        const long1 = pinCodeData[0]?.longitude;
        pincode.value = updatedPinCode;

        await pincodeListener();
        await cityListener();
        dealersForm.innerHTML = await getNearestDealersAndUpdate(lat1, long1);
        selectRadioButton();
        detectLocationBtd();
      });
      document.addEventListener("click", (e) => {
        if (!stateDropdown.contains(e.target)) {
          stateOption.style.display = "none";
        }
      })
    }

    function centerSelectedStep() {
      // Select the currently selected step
      const selectedStep = document.querySelector('.stepper .step.selected');

      if (selectedStep) {
        // Get the .stepper container
        const stepperContainer = document.querySelector('.stepper');

        // Calculate the offset to center the selected step
        const offset = selectedStep.offsetLeft - stepperContainer.clientWidth / 2 + selectedStep.clientWidth / 2;

        // Scroll the container to bring the selected step to the center
        stepperContainer.scrollTo({
          left: offset,
          behavior: 'smooth',
        });
      }
    }

    function updateStepper() {
      // Update step styles
      steps.forEach((step, index) => {
        step.classList.remove('completed', 'selected');

        if (index + 1 < currentStep) {
          step.classList.add('completed'); // Green for completed steps
        } else if (index + 1 === currentStep) {
          step.classList.add('selected'); // Blue for the current step

          // Center the new selected step
          centerSelectedStep();
        }
      });

      // Show the relevant content for the current step
      contents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === currentStep) {
          content.classList.add('active'); // Show content for the current step
        }
      });
    }

    const handleUserInteraction = (e) => {
      if (!initFormEvent) {
        const details = {};
        details.formName = 'Register Your Interest';
        details.webName = e.target.name;
        details.linkType = 'other';
        analytics.setEnquiryStartDetails(details);
        initFormEvent = true;
      }
    };

    function setPersonalData() {
      const details = {};
      details.formName = 'Register Your Interest';
      details.webName = document.getElementById('nextButton')?.textContent.trim();
      details.linkType = 'other';
      details.phoneNumber = mobileNumber;
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const model = payload.model_name;
      const variant = payload.variant_name;
      const custName = `${firstName} ${lastName}`;
      const stepTitle = block.querySelector('.stepper .step.selected')?.textContent.substring(2);
      const enquiryStepName = stepTitle;
      dataLayerObj = {
        custName, model, variant, enquiryStepName,
      };
      analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
    }

    function finalFormSubmission() {
      let details = {};
      details.formName = 'Register Your Interest';
      details.webName = document.getElementById('nextButton')?.textContent.trim();
      details.linkType = 'other';
      details.phoneNumber = mobileNumber;
      const selectState = document.getElementById('state');
      const state = selectState.querySelector('#state-selected')?.textContent.trim();
      const selectCity = document.getElementById('city');
      const city = selectCity.querySelector('#city-selected')?.textContent.trim();
      const pinCode = block.querySelector('.pincode input').value;
      const dealer = payload.dealer_name;
      let whatsapp = 'n';
      let sms = 'n';
      let call = 'n';
      const socialCheckboxes = block.querySelectorAll('.social-checkboxes input[type="checkbox"]:checked');
      socialCheckboxes.forEach((checkbox) => {
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
        ...dataLayerObj, state, city, pincode: pinCode, dealer, dealerLocation, radius,
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

    document.addEventListener('updateLocation', async () => {
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

      await detectLocationBtd();
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

    async function submitFormAfterFinalPayload() {
      const finalPayloadforAPI = finalPayload();
      try {
        const resp = await commonApiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
        if (resp.status === 200) {
          successModal.querySelector('.title').textContent = thankyouTitle?.replace('{first-name}', finalPayloadforAPI.Name || '');
          successModal.classList.remove('hidden');
          finalFormSubmission();
        } else if (resp.status === 400) {
          const otpdigits = document.querySelectorAll('.otp-digit');
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
          document.querySelector('.otp-container').style.display = 'block';
          resetCountdown();
          if (await sendotp()) {
            startOtpCountDown();
          }
          toggleNextButton(currentStep);
          previousStep();
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

    function updateSteps() {
      // Update step styles
      steps.forEach((step, index) => {
        step.classList.remove('completed', 'selected');

        if (index + 1 < currentStep) {
          step.classList.add('completed'); // Green for completed steps
        } else if (index + 1 === currentStep) {
          step.classList.add('selected'); // Blue for the current step

          // Center the new selected step
          centerSelectedStep();
        }
      });

      // Show the relevant content for the current step
      contents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === currentStep) {
          content.classList.add('active'); // Show content for the current step
        }
      });
    }

    function nextStep() {
      if (currentStep < steps.length) {
        currentStep += 1;
        prevButton.style.visibility = 'visible';
        if (window.innerWidth < 768) {
          prevButton.style.height = '40px';
        }
        else {
          prevButton.style.height = '52px';
          prevButton.style.padding = '0.75rem 1.25rem';
        }
        if (currentStep === 2) {
          nextButton.textContent = data.interested.label;
          backButton.classList.remove('hidden');
          disclaimer.style.visibility = 'visible';
          disclaimer.style.height = 'auto';
        } else {
          nextButton.textContent = nextButtonText;
          backButton.classList.add('hidden');
          disclaimer.style.visibility = 'hidden';
          disclaimer.style.height = 0;
        }
        updateSteps();
        toggleNextButton(currentStep);
      } else if (currentStep === steps.length) {
        // Last step, create payload
        submitFormAfterFinalPayload();
      }
    }

    function previousStep() {
      if (currentStep > 1) {
        currentStep -= 1;
        if (currentStep === 2) {
          nextButton.textContent = data.interested.label;
        } else {
          nextButton.textContent = nextButtonText;
        }
        updateSteps();
        toggleNextButton(currentStep);
        if (currentStep === 1) {
          disclaimer.style.visibility = 'hidden';
          disclaimer.style.height = 0;
          prevButton.style.visibility = 'hidden';
          prevButton.style.height = 0;
          prevButton.style.padding = 0;
          backButton.classList.add('hidden');
        }
      } else {
        prevButton.style.visibility = 'hidden';
        prevButton.style.height = 0;
        prevButton.style.padding = 0;
      }
    }

    function goToStep(stepNumber) {
      toggleNextButton(stepNumber);
      const stepContents = document.querySelectorAll('.step-content');
      if (stepNumber === 2) {
        nextButton.textContent = data.interested.label;
      } else {
        nextButton.textContent = nextButtonText;
      }

      steps.forEach((step, index) => {
        const stepIndex = index + 1;
        step.classList.remove('active', 'selected');
        step.classList.toggle('completed', stepIndex < stepNumber);
        if (stepIndex === stepNumber) {
          step.classList.add('active', 'selected');
          centerSelectedStep();
        }
      });

      currentStep = stepNumber;
      if (stepNumber === 1) {
        prevButton.style.visibility = 'hidden';
        prevButton.style.height = 0;
        prevButton.style.padding = 0;
        disclaimer.style.visibility = 'hidden';
        disclaimer.style.height = 0;
      }
      stepContents.forEach((content) => content.classList.remove('active'));
      const targetContent = document.getElementById(`step${stepNumber}`);
      if (targetContent) {
        targetContent.classList.add('active');
      } else {
        console.error(`No content found for step ${stepNumber}`);
      }
    }

    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.add('hidden');
      backButton.classList.add('hidden');
      disclaimer.style.visibility = 'hidden';
      // goToStep(1);
      resetCountdown();
      window.location.href = '/';
    });

    steps.forEach((step) => {
      step.addEventListener('click', () => {
        const stepNumber = parseInt(step.getAttribute('data-step'), 10);
        if (step.classList.contains('completed')) {
          goToStep(stepNumber);
        }
      });
    });

    nextButton.addEventListener('click', () => {
      // if (currentStep < stepPanels.length) {
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
      }
      nextStep();
    });

    prevButton.addEventListener('click', previousStep);

    backButton.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep -= 1; // Move to the previous step
        updateStepper();
        backButton.classList.add('hidden');
        disclaimer.style.visibility = 'hidden';
        previousStep();
        nextButton.textContent = nextButtonText;
      }
      toggleNextButton(currentStep);
    });

    // Initialize the stepper on page load
    updateStepper();
    prevButton.style.visibility = 'hidden';
    prevButton.style.height = 0;
    prevButton.style.padding = 0;

    // Helper function to validate and allow only alphabets
    function validateAlphabetInput(event) {
      const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
      const maxLength = 30; // Maximum character length
      if (!regex.test(event.target.value)) {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
      }
      // Trim input if it exceeds max length
      if (event.target.value.length > maxLength) {
        event.target.value = event.target.value.substring(0, maxLength);
      }
    }

    const firstNameInput = document.getElementById('first-name');
    firstNameInput.addEventListener('input', (event) => {
      validateAlphabetInput(event);
      toggleNextButton(1);
    });

    const lastNameInput = document.getElementById('last-name');
    lastNameInput.addEventListener('input', (event) => {
      validateAlphabetInput(event);
      toggleNextButton(1);
    });

    const mobileNo = document.getElementById('mobile');
    mobileNo.addEventListener('input', () => {
      toggleNextButton(1);
    });

    // Initial call to set the button state for the first step
    toggleNextButton(1);

    selectRadioButton();

    // Function to get the checked values
    function getCheckedValues() {
      const checkedValues = [];

      // Get all checkboxes with the 'form-checkbox' class
      const checkboxes = document.querySelectorAll('.communication-checkbox input');

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
    document.querySelectorAll('.communication-checkbox input').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        getCheckedValues();
      });
    });
    function selectTermsPolicy(itemIndex) {
      const faqItems = document.querySelectorAll('.termItem');
      faqItems.forEach((faq) => {
        faq.classList.remove('active');
        faq.querySelector('.answer').classList.remove('open');
        faq.querySelector('.answer').classList.add('close');
      });
      faqItems.forEach((item, index) => {
        const answer = item.querySelector('.answer');
        if (index === itemIndex) {
          item.classList.add('active');
          answer.classList.add('open');
          answer.classList.remove('close');
        }
      })
    }
    block.querySelectorAll(".terms_conditions_link").forEach((link) => {
      link.addEventListener("click", function (e) {
        const selectedLink = link;
        const selectedValue = selectedLink.getAttribute('title');
        if (selectedValue == 'Privacy Policy') {
          modelUtility.modalBody.classList.add("privacy");
          modelUtility.modalBody.classList.remove("terms");
          selectTermsPolicy(1);
        }
        else {
          modelUtility.modalBody.classList.add("terms");
          modelUtility.modalBody.classList.remove("privacy");
          selectTermsPolicy(0);
        }
        modelUtility.openModal();
        document.body.style.overflow = 'hidden';
      })
    })

    const option = document.querySelector('#model-options option.selected');
    if (option) {
      updatePayload.updateModelID(option.value);
      updatePayload.updateModelName(option.textContent);
    }

  };

  initForm();
}