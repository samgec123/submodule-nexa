import commonApiUtils from '../../commons/utility/apiUtils.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import util from '../../utility/utility.js';
import formDataUtils from '../../utility/formDataUtils.js';
import analytics from '../../utility/analytics.js';
import authUtils from '../../commons/utility/authUtils.js';

export default async function decorate(block) {
  const currentUrl = new URL(window.location.href); // Get the current URL
  const { homeLink,dealerPageUrl,publishDomain, sitedomain, defaultLatitude: initialLat, defaultLongitude: initialLong } = await fetchPlaceholders();

  let finalTid;
  let finalOtp;
  let finalRequestId;
  let otpTid;
  let otpMobileNum;
  let isOtpVerified = false;
  let isCitySelected = false;
  let dealerData;
  let cityDropdown;
  const isRedirectedFromdealerFlow = currentUrl.searchParams.get('isDealerFlow') || false; // Get 'isDealerFlow'
  const isRedirectedFromCarDetail = currentUrl.searchParams.get('modelCd') || false;
  let selectedCarValue = '';
  let selectedPincode = '';
  if (isRedirectedFromdealerFlow) {
    const allDealers = JSON.parse(sessionStorage.getItem('allDealers'))?.allDealers;
    const selectedDealerIndex = parseInt(sessionStorage.getItem('slectedDelerIndex'), 10); // Get 'isDealerFlow'
    selectedCarValue = JSON.parse(sessionStorage.getItem('dealerLocatorFilters'))?.showcasingValue;
    selectedPincode = JSON.parse(sessionStorage.getItem('dealerLocatorFilters'))?.pincode;
    if (selectedDealerIndex !== null && selectedDealerIndex !== undefined) {
      dealerData = allDealers[selectedDealerIndex];
    }
  }
  let payLoadBtd;
  if (sessionStorage.getItem('payLoadBtd')) {
    payLoadBtd = JSON.parse(sessionStorage.getItem('payLoadBtd'));
    selectedPincode = payLoadBtd?.pin;
  }
  if (localStorage.getItem('signInFlow')) {
    block.style.visibility = 'hidden';
  }

  // Function to update the message
  function updateValidationMessage(className, message, isVisible) {
    // Select the span element using its class
    const validationMessage = document.querySelector(`.${className} .validation-text.validation-required`);
    validationMessage.textContent = message; // Update the message
    validationMessage.style.display = isVisible ? 'block' : 'none'; // Toggle visibility
  }

  // Initialize payload with empty string values for each field
  const payload = {
    isDealerFlow: isRedirectedFromdealerFlow,
    date: payLoadBtd?.date ?? new Date(),
    timeSlot: payLoadBtd?.timeSlot ?? '',
    timePeriodSlot: payLoadBtd?.timePeriodSlot ?? '',
    dealer_code: dealerData?.dealerUniqueCd ?? '', // Mandatory
    dealer_for_code: dealerData?.forCd ?? '', // Mandatory
    dealer_name: dealerData?.name ?? '',
    location_code: dealerData?.locCd ?? '', // Mandatory
    Name: payLoadBtd?.Name ?? '', // Mandatory
    Email: payLoadBtd?.Email ?? '', // Optional
    dealer_distance: dealerData?.distance ?? '',
    dealer_address: `${dealerData?.addr1} ${dealerData?.addr2} ${dealerData?.addr3}`.replace(/,\s*$/, '') ?? '',
    Phone: payLoadBtd?.Phone ?? '', // Mandatory
    maruti_service_id: payLoadBtd?.maruti_service_id ?? '', // Optional
    maruti_service_name: payLoadBtd?.maruti_service_name ?? '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    color_cd: payLoadBtd?.color_cd ?? '', // Optional
    variant_cd: payLoadBtd?.variant_cd ?? '', // Optional
    model_cd: payLoadBtd?.model_cd ?? '', // Optional
    test_drive_location: payLoadBtd?.test_drive_location ?? '', // Optional
    book_pref_btd_date: payLoadBtd?.book_pref_btd_date ?? '', // Optional
    model_name: payLoadBtd?.model_name ?? '', // Optional
    variant_name: payLoadBtd?.variant_name ?? '', // Optional
    color_name: payLoadBtd?.color_name ?? '', // Optional
    vin_number: payLoadBtd?.vin_number ?? '', // Optional
    variantslot: payLoadBtd?.variantslot ?? '-', // Optional
    test_drive_address: payLoadBtd?.test_drive_address ?? '', // Optional
    exchange_preference: payLoadBtd?.exchange_preference ?? '', // Optional
    utm_medium: payLoadBtd?.utm_medium ?? '', // Mandatory
    utm_source: payLoadBtd?.utm_source ?? '', // Mandatory
    utm_id: payLoadBtd?.utm_id ?? '', // Optional
    utm_content: payLoadBtd?.utm_content ?? '', // Optional
    utm_term: payLoadBtd?.utm_term ?? '', // Optional
    utm_campaign: payLoadBtd?.utm_campaign ?? '', // Optional
    is_client_meeting: payLoadBtd?.is_client_meeting ?? '', // Optional
    marketing_checkbox: payLoadBtd?.marketing_checkbox ?? 1, // optional possible valie us 0 or 1
    transmission_type: payLoadBtd?.transmission_type ?? '', // Optional
    house_street_area: payLoadBtd?.house_street_area ?? '', // Optional
    landmark: payLoadBtd?.landmark ?? '', // Optional
    state: payLoadBtd?.state ?? '', // Optional
    city: payLoadBtd?.city ?? '', // Optional
    pincode: selectedPincode ?? '', // Optional
    fuel_type: payLoadBtd?.fuel_type ?? '', // Optional // P for Petrol , C for CNG
    preferred_communication_channel: payLoadBtd?.preferred_communication_channel ?? [
      'W',
      'C',
      'S',
    ],
    cust_fname: payLoadBtd?.cust_fname ?? '',
    cust_lname: payLoadBtd?.cust_lname ?? '',
    car_image: payLoadBtd?.car_image ?? '',
  };
  let dataLayerObj = {};
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  async function selectOptionByValue(selectId, value) {
    selectDropdownOption(selectId, value);
    await modelChange(value);
  }
  function finalPayload() {
    const date = new Date(payload.date);
    const formattedDate = date.toISOString().split('T')[0];
    const timeRange = payload.timeSlot;

    let startTime24hr = '';
    // Split the timeRange into individual components
    const parts = timeRange.split(' ');
    if (parts.length < 2) {
      console.error('Invalid time range format');
    } else {
      const time = parts[0]; // Extract time (e.g., "04:00")
      const period = parts[1]?.toUpperCase(); // Extract AM/PM and handle case sensitivity

      // Validate period
      if (period !== 'AM' && period !== 'PM' && period !== 'NOON') {
        console.error('Invalid period format');
      } else {
        // Convert hours and minutes
        let [hours, minutes] = time.split(':').map(Number);

        if (hours !== 12) {
          if (period === 'PM') {
            hours += 12; // Convert PM to 24-hour format
          } else if (period === 'AM' && hours === 12) {
            hours = 0; // Handle 12:00 AM as 00:00
          }
        }
        // Format the result
        startTime24hr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      }
    }
    const finalPayload = {
      // Mandatory fields
      dealer_code: payload.dealer_code,
      dealer_for_code: payload.dealer_for_code,
      location_code: payload.location_code,
      Name: payload.Name,
      Phone: payload.Phone,
      utm_medium: 'paid',
      utm_source: 'fb',

      // Optional fields
      model_cd: payload.model_cd, // Optional
      book_pref_btd_date: `${formattedDate} ${startTime24hr}`, // Optional
      model_name: payload.model_name, // Optional
      transmission_type: payload.transmission_type, // Optional
      state: payload.state, // Optional
      city: payload.city, // Optional
      pincode: payload.pincode, // Optional
      fuel_type: payload.fuel_type,
      maruti_service_id: 5, // Optional
      maruti_service_name: 'Book a Test Drive', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    };

    // You can adjust payload fields here dynamically based on form values
    return finalPayload;
  }

  // Functions to update each field in the payload
  const updatePayload = {
    updateModelID: (value) => payload.model_cd = value,
    updateModelName: (value) => payload.model_name = value,
    updateFuelType: (value) => payload.fuel_type = value,
    updateDate: (value) => payload.date = value,
    updateTimeSlot: (value) => payload.timeSlot = value,
    updateTimePeriodSlot: (value) => payload.timePeriodSlot = value,
    updateName: (value) => payload.Name = value,
    updateDealerName: (value) => payload.dealer_name = value,
    updateDealerDistance: (value) => payload.dealer_distance = value,
    updateDealerAddress: (value) => payload.dealer_address = value,
    updateTransmissionType: (value) => payload.transmission_type = value,
    updatePhoneNo: (value) => payload.Phone = value,
    updateCustFName: (value) => payload.cust_fname = value,
    updateCustLName: (value) => payload.cust_lname = value,
    updateCity: (value) => payload.city = value,
    updateState: (value) => payload.state = value,
    updateDealerCode: (value) => payload.dealer_code = value,
    updateDealerForCode: (value) => payload.dealer_for_code = value,
    updateCarImage: (value) => payload.car_image = value,
    updateLocationCode: (value) => payload.location_code = value,
    updatePinCode: (value) => payload.pincode = value,
  };

  let timerFlag = false;
  let timerInterval;
  let placesOptions;
  let pincode;
  let geoLocationData;
  let lat = initialLat; let long = initialLong; let city = 'Delhi';
  let geoLocationPayload = {
    latitude: lat,
    longitude: long,
  };

  async function getFormData() {
    if (typeof window.getFormData === 'function') {
      return window.getFormData();
    }
    return formDataUtils.fetchFormData('form-data-book-test-drive');
  }
  const data = await getFormData();
  const modelList = await apiUtils.getModelList('EXC');
  // Convert the array of strings into an array of objects
  const vehicles = modelList.map(vehicle => {
    const [name, value] = vehicle.split(":");
    return { name, value };
  }).filter(vehicle => vehicle.value !== 'EV');
  const stateList = await apiUtils.getStateList();
  geoLocationData = await apiUtils.getGeoLocation(geoLocationPayload);

  const fuelTypeList = await fetchPlaceholders();

  const [commonEl, vehicleEl, dealerEl, dateTimeEl, personalEl, overviewEl, successEl] = block.children;

  const [titleEl, previousEl, nextEl, confirmEl] = commonEl.children[0].children;
  const title = titleEl;
  const previousButtonText = previousEl?.textContent?.trim();
  const nextButtonText = nextEl?.textContent?.trim();
  const confirmButtonText = confirmEl?.textContent?.trim();

  const [vehicleNameEl,
    vehicleTextEl,
    vehicleImageEl] = vehicleEl.children[0].children;
  const vehicleName = vehicleNameEl?.textContent?.trim();
  const vehicleText = vehicleTextEl?.textContent?.trim();
  const image = vehicleImageEl?.querySelector('picture');
  const img = image.querySelector('img');
  img.removeAttribute('width');
  img.removeAttribute('height');

  const [dealerNameEl, dealerTextEl] = dealerEl.children[0].children;
  const dealerName = dealerNameEl?.textContent?.trim();
  const dealerText = dealerTextEl?.textContent?.trim();

  const [dateTimeNameEl, dateTimeTextEl, detailTextEl] = dateTimeEl.children[0].children;
  const dateTimeName = dateTimeNameEl?.textContent?.trim();
  const dateTimeText = dateTimeTextEl?.textContent?.trim();
  const detailText = detailTextEl?.textContent?.trim();

  const [
    personalNameEl,
    personalTextEl,
    personalOrTextEl,
    personalSignInTextEl,
    personalSignInCtaTextEl,
    personalSignUpTextEl,
    personalSignUpCtaTextEl,
    personalTcTextEl,
    pddetailTextEl,
  ] = personalEl.children[0].children;
  const personalName = personalNameEl?.textContent?.trim();
  const personalText = personalTextEl?.textContent?.trim();
  const pddetailText = pddetailTextEl?.textContent?.trim();
  const [
    personalOrText,
    personalSignInText,
    personalSignInCtaText,
    personalSignUpText,
    personalSignUpCtaText,
  ] = [
    personalOrTextEl,
    personalSignInTextEl,
    personalSignInCtaTextEl,
    personalSignUpTextEl,
    personalSignUpCtaTextEl,
  ].map((item) => item?.textContent?.trim() || '');
  // eslint-disable-next-line no-unused-vars
  const tcText = personalTcTextEl?.textContent?.trim(); // NOSONAR

  const [
    overviewNameEl,
    selectedVehicleEl,
    selectedDealerEl,
    selectedDateTimeEl,
    customerDetailsEl,
  ] = overviewEl.children[0].children;

  const overviewName = overviewNameEl?.textContent?.trim();
  const selectedVehicle = selectedVehicleEl?.textContent?.trim();
  const selectedDealer = selectedDealerEl?.textContent?.trim();
  const selectedDateTime = selectedDateTimeEl?.textContent?.trim();
  const customerDetails = customerDetailsEl?.textContent?.trim();
  const formattedDate = formatDateToString(payload.date);
  const [successTitleEl,
    successSubtitleEl,
    successCtaTextEl, thankyouImageEL, thankyouImageAltEl, closeIconTextEl, closeIconTextTargetEl,
  ] = successEl.children[0].children;

  const successTitle = successTitleEl?.textContent?.trim(); // NOSONAR
  const successSubtitle = successSubtitleEl?.textContent?.trim(); // NOSONAR
  const successLink = successCtaTextEl?.textContent?.trim();
  const thankyouImage = thankyouImageEL?.querySelector('picture');
  const thankyouImageAlt = thankyouImageAltEl?.textContent?.trim();
  const closeIconUrl = closeIconTextEl?.querySelector('.button-container a')?.href || '';
  const closeIconTextTarget = closeIconTextTargetEl?.textContent?.trim() || '_self';
  const img1 = thankyouImage.querySelector('img');
  img1.alt = thankyouImageAlt;
  img1.removeAttribute('width');
  img1.removeAttribute('height');
  const vehicleFormHTML = await getVehicleForm();
  const dealershipFormHTML = await getDealershipForm();
  const dateTimeslotFormHTML = await getDateTimeslotForm();
  const personalDetailsHTML = await getPersonalDetails();
  const overviewHTML = await getOverview();

  const formHTML = `
      <div class="container">
          <div class="bookTestDrive__title">
          <div class="bookTestDrive__title_back_button prev-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15.6538 21.3075L6 11.6538L15.6538 2L17.073 3.41925L8.83825 11.6538L17.073 19.8883L15.6538 21.3075Z" fill="#767879"/>
</svg>
</div>
${title.outerHTML}
 </div>
          <div class="stepper-container">
              <div class="stepper">
                  <div class="step" data-step="1"><span>1</span> ${vehicleName}</div>
                  <div class="step" data-step="2"><span>2</span> ${dealerName}</div>
                  <div class="step" data-step="3"><span>3</span> ${dateTimeName}</div>
                  <div class="step" data-step="4"><span>4</span> ${personalName}</div>
                  <div class="step" data-step="5"><span>5</span> ${overviewName}</div>
              </div>

              <div class="content">
                  <div class="step-content" id="step1">${vehicleFormHTML}</div>
                  <div class="step-content" id="step2">
                      <div class="dealership-step">${dealershipFormHTML}</div>
                  </div>
                  <div class="step-content" id="step3">${dateTimeslotFormHTML}</div>
                  <div class="step-content" id="step4">${personalDetailsHTML}</div>
                  <div class="step-content" id="step5">${overviewHTML}</div>
              </div>

          <div class="controls">
             ${isRedirectedFromdealerFlow ? `<button class="prev-btn button secondary-black-btn">
                 ${previousButtonText}
               </button>` : ''}
              <button class='next-btn button button-primary-blue cta__new cta__new-primary' id="nextButton">${nextButtonText}</button>
          </div>
      </div>
      </div>
      <!-- Popup container -->
    <div id="btd-confirmation-popup" class="btd-confirmation-popup hidden">
        <div class="btd-popup-content">
        <div class="btn-popup-gredient"></div>
            <!-- <span class="btd-popup-close">&times;</span> -->
            <span class="btd-popup-close">
              <a href="${closeIconUrl}" target="${closeIconTextTarget}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M6.40043 18.6542L5.34668 17.6004L10.9467 12.0004L5.34668 6.40043L6.40043 5.34668L12.0004 10.9467L17.6004 5.34668L18.6542 6.40043L13.0542 12.0004L18.6542 17.6004L17.6004 18.6542L12.0004 13.0542L6.40043 18.6542Z"
                        fill="black" />
                </svg>
              </a>
            </span>
            
            <div class="section-wrapper">
                <div class="left-section">
<div class="vector-image-icon"></div>
            <p class="btd-popup-title">${successTitle}</p>
            <p class="btd-popup-subtitle">${successSubtitle}</p>

                    <button class="button button-primary-blue">${successLink}</button>
                </div>
                <div class="right-section popup-car-image">${img1.outerHTML}</div>
            </div>



        </div>
    </div>
    `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(formHTML));
  setTimeout(() => {
    if (isRedirectedFromCarDetail) {
      selectOptionByValue('model', isRedirectedFromCarDetail);
    }
  }, 100);

  function dataLayerOnNextClick(currentStep) {
    if (currentStep === 1) {
      setVehicleData();
    } else if (currentStep === 2) {
      setDealershipData();
    } else if (currentStep === 3) {
      setDateAndTimeData();
    } else if (currentStep === 4) {
      setPersonalData();
    } else if (currentStep === 5) {
      finalFormSubmission();
    }
  }

  document.querySelectorAll('.next-btn').forEach((button) => {
    button.addEventListener('click', () => {
      dataLayerOnNextClick(currentStep);
      if (currentStep === 4) {
        // Get the values for first name, last name, selected city, and selected state
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const selectedState = document.getElementById('state').value;
        const selectedCity = document.getElementById('city').value;
        const fullName = `${firstName} ${lastName}`;
        const selectedStateText = document.getElementById('state').options[document.getElementById('state').selectedIndex]?.text;
        const selectedCityText = document.getElementById('city').options[document.getElementById('city').selectedIndex]?.text;
        const cityStateCombined = `${selectedCityText}, ${selectedStateText}`;
        updatePayload.updateCustFName(firstName);
        updatePayload.updateCustLName(lastName);
        updatePayload.updateState(selectedState);
        updatePayload.updateCity(selectedCity);
        updatePayload.updateName(fullName);
        document.querySelector('#step5 .customer-name').textContent = fullName;
        document.querySelector('#step5 .customer-location').textContent = cityStateCombined;
        nextStep();
      } else {
        nextStep();
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach((button) => {
    button.addEventListener('click', () => previousStep());
  });

  let currentStep = 1;
  const steps = document.querySelectorAll('.step');
  const contents = document.querySelectorAll('.step-content');

  async function getVehicleForm() {
    const vehicleFormHTML = `
             <div class="vehicle-form">
              <div class="left-section">
                ${!isMobile ? `<p class="select-vehicle-title">${vehicleText}</p>` : ''}
                <div class="custom-dropdown model-dropdown-div">
                  <div class="custom-dropdown-label" id="model">Select Vehicle</div>
                  <ul class="dropdown-options model-options" id="model-options">
                    ${vehicles.map(vehicle => `<li data-value="${vehicle.value}">${vehicle.name}</li>`).join('')}
                  </ul>
                  <div id="error-message" style="color: red; font-size: 0.9em; display: none;">Please select a vehicle.</div>
                </div>
                <div class="custom-dropdown" id="fuel-type-div">
                  <div class="custom-dropdown-label" id="fuel-type">Select Fuel Type</div>
                  <ul class="dropdown-options fuel-type-options" id="fuel-type-options">
                  </ul>
                  <div id="error-message" style="color: red; font-size: 0.9em; display: none;">Please select a fuel type.</div>
                </div>
                ${formDataUtils.createRadioButtons(
      data.transmission,
      'line',
      'transmission',
      {},
      '',
    )}
              </div>
              <div class="right-section">
                ${isMobile ? `<p class="select-vehicle-title">${vehicleText}</p>` : ''}
                <div class="car__image">${img.outerHTML}</div>
              </div>
            </div>
         `;
    return vehicleFormHTML;
  }

  function getSelectedLocationStorage() {
    return util.getLocalStorage('selected-location');
  }
  function toTitleCase(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return word;
    }

    if (/\d/.test(word)) {
      return word.toUpperCase();
    }

    return word
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('-');
  }
  function sentenceToTitleCase(sentence) {
    if (!sentence.includes(' ')) {
      return toTitleCase(sentence);
    }

    return sentence
      .split(' ')
      .map((word) => {
        if (/\d/.test(word)) {
          return word.toUpperCase();
        }

        return word
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      })
      .join(' ');
  }
  function formatAddress(inputAddr1, inputAddr2, inputAddr3) {
    const addr1 = inputAddr1 ? inputAddr1.trim() : '';
    const addr2 = inputAddr2 ? inputAddr2.trim() : '';
    const addr3 = inputAddr3 ? inputAddr3.trim() : '';
    let combinedAddress = addr1;
    if (addr2) {
      combinedAddress += ` ${addr2}`;
    }
    if (addr3) {
      combinedAddress += ` ${addr3}`;
    }
    combinedAddress = combinedAddress.replace(/,\s*$/, '');
    return toTitleCase(combinedAddress);
  }
  const selectedDealerIndex = 0;
  async function getNearestDealersAndUpdate(latitude, longitude) {
    updatePayload.updateDealerName(payload.dealer_name);
    updatePayload.updateDealerAddress(payload.dealer_address);
    updatePayload.updateDealerDistance(payload.dealer_distance);
    toggleNextButton(2);
    const dealerContainer = document.createElement('div');
    dealerContainer.classList.add('dealer__list__container');
    const radius = 500000;
    let dealers = [];
    try {
      const response = await commonApiUtils.getNearestDealers(latitude, longitude, radius, null, (error) => {
        const details = {};
        details.formName = 'Book Test Drive';
        details.errorType = 'API Error';
        details.errorCode = error.status.toString();
        details.errorDetails = 'Failed to fetch nearest dealer';
        details.webName = 'Search';
        details.linkType = 'other';
        analytics.setWebError(details);
      });
      dealers = response.filter((dealer) => dealer.channel === 'EXC');
    } catch (error) {
      dealers = [];
    }
    dealers.slice(0, 4).forEach((dealer) => {
      const dealerCode = dealer.dealerUniqueCd;
      const dealerForCode = dealer.forCd;
      const dealerPinCode = dealer.pin;
      const { dealerType } = dealer;
      const locCode = dealer.locCd;
      const card = document.createElement('label');
      card.className = 'dealer__card';

      // Create the radio input element
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'dealer';
      radio.value = dealer.name; // Set the value dynamically based on the dealer's name
      radio.className = 'dealer__radio'; // Optional: Add a class if you want to style the radio button

      // Create the distance tag
      const distanceTag = document.createElement('p');
      distanceTag.textContent = `${(dealer.distance / 1000).toFixed(2)} kms`;
      distanceTag.className = 'dealer__distance';

      const name = document.createElement('p');
      name.textContent = sentenceToTitleCase(dealer.name);
      name.className = 'dealer__name';

      const address = document.createElement('p');
      address.textContent = formatAddress(dealer.addr1, dealer.addr2, dealer.addr3);
      address.className = 'dealer__address';

      const dealerCodeP = document.createElement('p');
      dealerCodeP.textContent = dealerCode;
      dealerCodeP.className = 'dealer__code hidden'; // Adding another class

      const dealerForCodeP = document.createElement('p');
      dealerForCodeP.textContent = dealerForCode;
      dealerForCodeP.className = 'dealer_for_code hidden'; // Adding another class

      const dealerPinCodeP = document.createElement('p');
      dealerPinCodeP.textContent = dealerPinCode;
      dealerPinCodeP.className = 'dealer_pincode hidden'; // Adding another class

      const locationCodeP = document.createElement('p');
      locationCodeP.textContent = locCode;
      locationCodeP.className = 'location_code hidden';

      const dealerTopInfo = document.createElement('div');
      dealerTopInfo.classList.add('dealership__top__info');
      dealerTopInfo.setAttribute('data-dealerType', dealerType);
      dealerTopInfo.appendChild(name);
      dealerTopInfo.appendChild(distanceTag);

      // Append radio, dealer info, and address to the card
      card.appendChild(radio); // Add the radio input at the top of the card
      card.appendChild(dealerTopInfo);
      card.appendChild(address);
      card.appendChild(dealerCodeP);
      card.appendChild(dealerForCodeP);
      card.appendChild(locationCodeP);
      card.appendChild(dealerPinCodeP);

      dealerContainer.appendChild(card);
    });
    return `
            <div class="container__dealers">
              ${dealerContainer ? dealerContainer.outerHTML : ''}
            </div>
          `;
  }
  async function detectLocationBtd() {
    const detectLocation = block.querySelector('.inner-detect-location__box_tab');
    detectLocation.addEventListener('click', async () => {
      requestLocationPermission();
    });
  }
  document.addEventListener('updateLocation', async () => {
    const div = block.querySelector('.dealership-step');
    div.innerHTML = await getDealershipForm();
    await populateAllCities();
    placesOptions = block.querySelector('.suggested-places-btd');
    pincode = block.querySelector('#pincode');
    const dealerTitleDiv = block.querySelector('.select-dealer-title');
    const dealerTitle = dealerTitleDiv.textContent.replace('{carName}', payload.model_name);
    dealerTitleDiv.textContent = dealerTitle;
    selectRadioButton();
    await detectLocationBtd();
    await pincodeListener();
    await cityListener();
    await selectState();
    await selectCity();
    await dealerCityUpdate();
    await dealerPinCodeUpdate();
  });
  async function getDealershipForm() {
    const selectedLocation = getSelectedLocationStorage();
    if (selectedLocation) {
      lat = selectedLocation.location.latitude?.trim();
      long = selectedLocation.location.longitude?.trim();
      city = selectedLocation.cityName;
    }
    const dealershipFormHTML = `
             <div class="dealership-form">
                  <div class="dealership-form-column-1">
                      <p class="select-dealer-title">${dealerText}</p>
                       <div class="dealership-form-fields">
                          ${formDataUtils.createInputField(data.pincode, 'pin-code', 'text', {}, 'no-label')}
                          <select class="suggested-places-btd"></select>
                          <div class="inner-detect-location__box_tab">
                            <p class="detect-location__text">
                                Detect your location
                            </p>
                          </div>
                      </div>
                  </div>
                  <div class="dealership-form-column-2">
                      ${await getNearestDealersAndUpdate(lat, long)}
                  </div>
             </div>
         `;
    return dealershipFormHTML;
  }

  async function getDateTimeslotForm() {
    const dateTimeslotFormHTML = `


          <div class="steper-content-row">
              <div class="steper-content-col column-1 column-hide-xs">
                  <div class="timeSlot__title">
                      <h3>${detailText}</h3>
                  </div>
                  <div class="steper-cards">
                      <div class="book-td-card d-flex">
                          <div class="selected-car-details">
                              <p></p>
                              <p class="selected-car-type"><span class="fuel-type"></span><span class="divider"></span><span class="transmission-type"></span></p>
                          </div>
                          <div class="selected-car-image">
                          ${img.outerHTML}
                          </div>
                          <a class="ctrl-edit-btn edit-select-vehicle" id="edit-vehicle-btn"></a>
                      </div>
                      <div class="book-td-card step3-leftBox">
                          <div class="selected-car-dealer">
                              <p>${payload.dealer_name}</p>
                              <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                          </div>
                          <div class="selected-dealer-address">
                              <p>${payload.dealer_address}</p>
                          </div>
                          <a class="ctrl-edit-btn edit-address" id="edit-address-btn"></a>
                      </div>
                  </div>
              </div>

              <div class="steper-content-col column-2">
                  <div class="timeSlot__title">
                      <h3>${dateTimeText}</h3>
                  </div>
                  <div class="book-td-card card-calendar">
                      <div class="datepicker">
                          <div class="month"></div>
                          <div class="datepicker-calendar">

                          </div>
                      </div>
                      <div class="timeslot-picker">
                          <div class="title-block">
                              Preferred time of Visit on
                              <span class="pre-date"></span>
                          </div>
                          <ul class="time-slots">
                              <li class="time-slot morning active">
                                  <div class="icon"></div>
                                  <div class="time">
                                      <p>Morning</p>
                                      <span>09:00 Am - 12:00 Noon</span>
                                  </div>

                              </li>
                              <li class="time-slot noon">
                                  <div class="icon"></div>
                                  <div class="time">
                                      <p>Afternoon</p>
                                      <span>12:00 Noon - 04:00 Pm</span>
                                  </div>
                              </li>
                              <li class="time-slot evening">
                                  <div class="icon"></div>
                                  <div class="time">
                                      <p>Evening</p>
                                      <span>04:00 Pm - 08:00 Pm</span>
                                  </div>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>


         `;
    return dateTimeslotFormHTML;
  }

  async function getPersonalDetails() {
    const personalDetailsHTML = `

          <div class="steper-content-row">
             <div class="steper-content-col column-1 column-hide-xs">
                <div class="timeSlot__title">
                   <h3>${pddetailText}</h3>
                </div>
                <div class="steper-cards">
                   <div class="book-td-card d-flex">
                      <div class="selected-car-details">
                         <p></p>
                         <p class="selected-car-type"><span class="fuel-type"></span><span class="divider"></span><span class="transmission-type"></span></p>
                      </div>
                      <div class="selected-car-image">
                         ${img.outerHTML}
                      </div>
                      <a class="ctrl-edit-btn edit-vehicle-btn" id="pd-edit-vehicle-btn"></a>
                   </div>
                   <div class="book-td-card">
                      <div class="selected-date-time">
                         <div class="selected-date">
                            <span>Date :</span>
                            <p>${formattedDate}</p>
                         </div>
                         <div class="selected-time">
                            <span>Time :</span>
                            <p></p>
                         </div>
                      </div>
                      <a class="ctrl-edit-btn edit-datetime-btn" id="edit-datetime-btn"></a>
                   </div>
                   <div class="book-td-card">
                      <div class="selected-car-dealer">
                         <p>${payload.dealer_name}</p>
                         <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                      </div>
                      <div class="selected-dealer-address">
                         <p>${payload.dealer_address}</p>
                      </div>
                      <a class="ctrl-edit-btn" id="pd-edit-address-btn"></a>
                   </div>
                </div>
             </div>
             <div class="steper-content-col column-2">
              <div class="timeSlot__title personalDtlFrmHd">
                   <h3>${personalText}</h3>
                </div>
                <div class="book-td-card card-form personalDtlFrm">
                   <div class="personal-details-form__container">
                      <form class="personal-details-form__form-wrapper" novalidate>
                         <div class="form__reg">
                            <div class="form-row half-width">
                               ${formDataUtils.createInputField(data.firstName, '', 'text', { minlength: 3, maxlength: 30 })}
                               ${formDataUtils.createInputField(data.lastName, '', 'text', { minlength: 3, maxlength: 30 })}
                            </div>
                            <div class="form-row half-width telContainer phone-verification">
                               ${formDataUtils.createInputField(data.mobile, 'mobileField', 'tel', { minlength: 10, maxlength: 10 })}
                               ${formDataUtils.createSendOtpField(data.otp, 'half-width resend-otp-container', 'resend-otp-btn', { minlength: 5, maxlength: 5 }, '')}
                               <div class="sendotp-container">
                                 <span id="sendotp-btn">SEND OTP</span>
                               </div>
                            </div>
                            <div class="form-row half-width">
                               ${formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {})}
                               ${formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-user', true, {})}
                            </div>
                         </div>
                      </form>
                   </div>
                   <div class="book-td-sign-in-wrapper">
                    <div class="book-td-or-divider">
                     <span>${personalOrText}</span>
                    </div>
                    <div class="book-td-sign-in-actions">
                      <div class="book-td-sign-in">
                        <span>${personalSignInText}</span>
                        <button class="book-td-sign-in-btn">${personalSignInCtaText}</button>
                      </div>
                      <span class="book-td-vertical-divider"></span>
                      <div class="book-td-sign-up">
                        <span>${personalSignUpText}</span>
                        <button class="book-td-sign-up-btn">${personalSignUpCtaText}</button>
                      </div>
                    </div>
                   </div>
                </div>
             </div>
          </div>
         `;
    return personalDetailsHTML;
  }

  async function getOverview() {
    const overviewHTML = `

          <h2 class="overview-title">Overview</h2>
          <div class="steper-content-row">
              <div class="steper-content-col">
                 <h4 class="overview-heading">${selectedVehicle}</h4>
                  <div class="steper-cards selected-car">
                      <div class="book-td-card d-flex">
                          <div class="selected-car-details">
                              <p></p>
                              <p class="selected-car-type"><span class="fuel-type"></span><span class="divider"></span><span class="transmission-type"></span></p>
                          </div>
                          <div class="selected-car-image">
                          ${img.outerHTML}
                          </div>
                          <a class="ctrl-edit-btn" id="ov-edit-vehicle-btn"></a>
                      </div>
                  </div>
              </div>
              <div class="steper-second-col">
              <div class="steper-content-col">

                  <div class="steper-cards">
                      <h4 class="overview-heading">${selectedDealer}</h4>
                      <div class="book-td-card selected-delear">
                          <div class="selected-car-dealer">
                              <p>${payload.dealer_name}</p>
                              <span class="distance-km">${(payload.dealer_distance / 1000).toFixed(1)} kms</span>
                          </div>
                          <div class="selected-dealer-address">
                              <p>${payload.dealer_address}</p>
                          </div>
                          <a class="ctrl-edit-btn" id="ov-edit-address-btn"></a>
                      </div>
                      <h4 class="overview-heading">${selectedDateTime}</h4>
                      <div class="book-td-card">
                          <div class="selected-date-time">
                              <div class="selected-date">
                                  <span>Date :</span>
                                  <p>${formattedDate}</p>
                              </div>
                              <div class="selected-time">
                                  <span>Time :</span>
                                  <p></p>
                              </div>
                          </div>
                          <a class="ctrl-edit-btn" id="ov-edit-datetime-btn"></a>
                      </div>
                  </div>
              </div>

              <div class="steper-content-col">
                  <div class="steper-cards">
                  <h4 class="overview-heading">${customerDetails}</h4>
                      <div class="book-td-card">
                          <div class="selected-items">
                              <div class="selected-row"> <span>Name :</span>
                                  <p class="customer-name"></p>
                              </div>
                              <div class="selected-row"> <span>Location :</span>
                                  <p class="customer-location"></p>
                              </div>
                              <div class="selected-row"> <span>Mobile No :</span>
                                  <p class="customer-mobile-no">${payload.Phone}</p>
                              </div>
                          </div>
                          <a class="ctrl-edit-btn" id="ov-edit-personal-details"></a>
                      </div>
                  </div>
              </div>
              </div>
          </div>
         `;
    return overviewHTML;
  }

  const sendotpBtn = block.querySelector('#sendotp-btn');
  const resendOtpText = block.querySelector('#resend-otp-btn')?.textContent || '';
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

  // Move to the next step
  function nextStep() {
    if (currentStep < steps.length) {
      currentStep += 1;
      prevButton.disabled = false; // Enable the button
      prevButton.style.opacity = '1'; // Reset opacity
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 5) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = 'Next';
      }
      updateSteps();
      toggleNextButton(currentStep);
    } else if (currentStep === steps.length) { // Last step, create payload
      submitFormAfterFinalPayload();
    }
  }

  function updateWithDifferentContent(input, startChar, endChar, replacements) {
    const regex = new RegExp(`\\${startChar}(.*?)\\${endChar}`, 'g');
    let index = 0;

    return input.replace(regex, (match, content) => {
      const replacement = replacements[index] || content;
      index += 1;
      return `${replacement}`;
    });
  }

  function updateTyPageText() {
    const oldText = block.querySelector('.btd-popup-subtitle')?.textContent;
    const selectdCar = block.querySelector('.selected-car-details p')?.textContent;
    const selectedDate = block.querySelector('.selected-date p')?.textContent;
    const selectedTime = block.querySelector('.selected-time p')?.textContent;
    const date = `${selectedDate.split(' ')[0]}, ${selectedDate.split(' ')[1].substring(0, 3)}`;
    const time = selectedTime.split(' ')[0];
    const replacements = [selectdCar, date, time];
    const updatedText = updateWithDifferentContent(oldText, '{', '}', replacements);
    block.querySelector('.btd-popup-subtitle').textContent = updatedText;
  }

  // Get elements
  const popup = document.getElementById('btd-confirmation-popup');
  const closeBtn = document.querySelector('.btd-popup-close');

  // Function to format the date and time slot
  function formatDateAndTime(payload) {
    const date = new Date(payload.date);
    // Format the day with a suffix
    const day = date.getUTCDate();
    const daySuffix = day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

    const month = date.toLocaleString('default', { month: 'long' });
    // Extract the time period
    const timePeriod = payload.timePeriodSlot;
    return `${day}${daySuffix} ${month}, ${timePeriod}`;
  }
  // Define async function for API submission
  async function submitFormAfterFinalPayload() {
    const finalPayloadforAPI = finalPayload();
    const formattedDate = formatDateAndTime(payload);

    try {
      const isSuccess = await commonApiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
      if (isSuccess.status === 200) {
        updateTyPageText();
        document.getElementById('btd-confirmation-popup').style.display = 'flex';
        document.getElementById('btd-confirmation-popup').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else if (isSuccess.status === 400) {
        isOtpVerified = false;
        document.getElementById('mobile').disabled = true;
        document.getElementById('mobile').removeAttribute('style');
        mobileField.classList.remove('valid');
        document.querySelector('.otp-container').style.display = 'none';
        hideAndShowEl(resendOtpContainer, 'block');
        otpDigits.forEach((digit) => {
          digit.classList.remove('green')
          digit.disabled = false;
          digit.value = '';
        });
        clearInterval(timerInterval);
        timerInterval = null;
        const resendOtpBtn = document.getElementById('resend-otp-btn');
        resendOtpBtn.textContent = resendOtpText.trim();
        resendOtpBtn.style.pointerEvents = 'none';
        if (await sendotp()) {
          startTimer();
        }
        toggleNextButton(4);
        previousStep();
      }
    } catch (error) {
      console.error('Error during API submission:', error);
    }
  }

  const prevButton = document.querySelector('.prev-btn');
  // prevButton.disabled = true; // Disable the button
  // prevButton.style.opacity = '1'; // Optional: visually indicate that it's disabled
  // Move to the previous step
  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 5) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = 'Next';
      }
      if (payload.isDealerFlow && currentStep === 1) {
        sessionStorage.setItem('isBtdFlowStep', '2');
        sessionStorage.setItem('payLoadBtd', JSON.stringify(payload));
        const url = new URL(dealerPageUrl, window.location.origin);
        url.searchParams.set('lastFlow', 'btd'); // Add or update query parameter
        window.location.href = url.toString(); // Redirect to the updated URL
      } else {
        updateSteps();
        toggleNextButton(currentStep);
      }
      // if (currentStep === 1) {
      //   prevButton.disabled = true; // Disable the button
      //   prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
      // }
    } else {
      prevButton.disabled = true; // Disable the button
      prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
    }
  }

  // Initialize stepper on page load
  updateSteps();

  // js for step 3 : Select Date And Time

  const datesContainer = document.querySelector('.datepicker-calendar');
  const dateDisplay = document.querySelector('.pre-date');
  const monthDisplay = document.querySelector('.month');
  // Set today's date (November 2, 2024   2024, 10, 2)
  let today = new Date();
  // today.setHours(21, 0, 0, 0);
  let now = new Date();
  if (today.getHours() >= 20) {
    // Set the target time to midnight (12 AM) of the current day
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

    // Calculate the time remaining until midnight in milliseconds
    const msUntilMidnight = midnight - today;

    // Set `today` to tomorrow's date at 12 AM
    today.setDate(today.getDate() + 1); // Move `today` to the next day
    // today.setHours(0, 0, 0, 0);          // Set the time to midnight
    document.querySelector('#step4 .selected-date p').textContent = formatDateToString(today);
    document.querySelector('#step5 .selected-date p').textContent = formatDateToString(today);

    now.setHours(0, 0, 0, 0); // Set `now` to midnight as well

    // Set a timeout to update `today` and `now` at the real midnight
    setTimeout(() => {
      today = new Date();
      now = new Date();
      loadDatesTimeSlots();
    }, msUntilMidnight);
  }
  loadDatesTimeSlots();

  function loadDatesTimeSlots() {
    let totalDays = 30; // Total number of days to display
    const selectableDays = 15; // Number of days to allow selection including today
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Days of the week
    let selectedDate = today;

    // Function to check if selected date matches today's date
    function isToday(date) {
      return (
        date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate()
      );
    }

    // Clear existing content
    datesContainer.innerHTML = '';

    const timeSlots = document.querySelectorAll('.time-slot');

    const slotTimes = [
      { label: 'Morning', start: '09:00', end: '12:00' },
      { label: 'Afternoon', start: '12:00', end: '16:00' },
      { label: 'Evening', start: '16:00', end: '20:00' },
    ];
    timeSlots.forEach((slot, index) => {
      const { start, end } = slotTimes[index];

      // Convert start and end times to Date objects on today's date for comparison
      const [startHour, startMinute] = start.split(':').map(Number); // NOSONAR
      const [endHour, endMinute] = end.split(':').map(Number);

      const endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHour,
        endMinute,
      );

      slot.addEventListener('click', () => {
        // Only allow click action if the slot is not disabled
        if (!slot.classList.contains('disabled')) {
          document.querySelector('.time-slot.active')?.classList.remove('active');
          slot.classList.add('active');
          const timePeriod = slot.querySelector('.time span')?.textContent;
          const timePeriodSlot = slot.querySelector('.time p')?.textContent;
          updatePayload.updateTimeSlot(timePeriod);
          updatePayload.updateTimePeriodSlot(timePeriodSlot);
          // Toggle the "Next" button for step 3
          toggleNextButton(3);
          document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
          document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
        }
      });
      // Disable the slot if the current time is past the end time
      if (now > endTime) {
        slot.classList.add('disabled');
        slot.style.pointerEvents = 'none';
        slot.style.opacity = '0.5';
      }

      if (isToday(selectedDate) && now > endTime) {
        slot.classList.add('disabled');
        slot.style.pointerEvents = 'none';
        slot.style.opacity = '0.5';
      } else {
        slot.classList.remove('disabled');
        slot.style.pointerEvents = '';
        slot.style.opacity = '';
      }

      // Check if the initially active slot is disabled; if so, remove active class
      const activeSlot = document.querySelector('.time-slot.active');
      if (activeSlot?.classList.contains('disabled')) {
        activeSlot.classList.remove('active');
      } else {
        // eslint-disable-next-line no-unused-vars
        // const timePeriod = activeSlot.querySelector('.time span')?.textContent; // NOSONAR
      }

      // Set active class on the first non-disabled slot
      const firstNonDisabledSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
      if (payload.timePeriodSlot) {
        if (slot.querySelector('.time p')?.textContent === payload.timePeriodSlot) {
          document.querySelector('.time-slot.active')?.classList.remove('active');
          slot.classList.add('active');
        }
      } else if (firstNonDisabledSlot) {
        firstNonDisabledSlot.classList.add('active');
      }
    });

    // Check if all slots are disabled and update selectedDateTimeSlot if needed
    if (!payload.timePeriodSlot) {
      const allDisabled = Array.from(timeSlots).every((slot) => slot.classList.contains('disabled'));
      if (allDisabled) {
        updatePayload.updateTimeSlot('');
        updatePayload.updateTimePeriodSlot('');
        // Toggle the "Next" button for step 3
        toggleNextButton(3);
      } else {
        // Optionally, set to the first non-disabled slot
        // if you want to select an available time slot automatically

        const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
        if (firstAvailableSlot) {
          // Remove the 'active' class from all time slots
          timeSlots.forEach((slot) => {
            slot.classList.remove('active');
          });
          firstAvailableSlot.classList.add('active');
          const selectedTime = firstAvailableSlot.querySelector('.time span')?.textContent.trim();
          const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p')?.textContent.trim();
          updatePayload.updateTimeSlot(selectedTime);
          updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
          // Toggle the "Next" button for step 3
          toggleNextButton(3);
          document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
          document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
        }
      }
    }

    // Populate day names
    dayNames.forEach((day) => {
      const dayElement = document.createElement('span');
      dayElement.classList.add('day');
      dayElement.textContent = day;
      datesContainer.appendChild(dayElement);
    });

    // Calculate lastDate as today + 15 days
    const lastDate = new Date(today);
    lastDate.setDate(today.getDate() + (selectableDays - 1));

    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayOfWeek = today.getDay();
    const offset = (currentDayOfWeek === 0) ? 6 : currentDayOfWeek - 1; // Adjust for Monday start
    totalDays -= offset;

    // Calculate the adjusted start date based on how many days back we need to go
    const adjustedStartDate = new Date(today);
    adjustedStartDate.setDate(today.getDate() - offset); // Go back to the previous Monday

    // Variable to keep track of the currently selected date element
    let currentSelectedElement = null;

    // Function to format the date
    function formatDate(date) {
      // Create a new Date object from the input
      const d = new Date(date);

      // Get the day and month from the date
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const weekday = d.toLocaleString('en-US', { weekday: 'short' });

      // Function to get the suffix for the day
      const suffix = (day) => {
        if (day > 3 && day < 21) return 'th'; // Special case for 11th-13th
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      // Format and return the string in the desired format
      return `${weekday}, ${day}${suffix(day)} ${month}`;
    }

    // Start populating dates
    for (let i = 0; i < totalDays + offset; i += 1) {
      const dateElement = document.createElement('span');
      const date = new Date(adjustedStartDate);
      date.setDate(adjustedStartDate.getDate() + i);

      dateElement.classList.add('date');
      dateElement.textContent = date.getDate();

      // Highlight today's date
      if (payload.date !== 'Invalid Date') {
        if (new Date(today).getDate() === date.getDate() && new Date(payload.date).getMonth() === date.getMonth() && new Date(payload.date).getFullYear() === date.getFullYear()) {
          dateElement.classList.add('current-day');
          currentSelectedElement = dateElement;
          dateDisplay.textContent = formatDate(payload.date);
        }
      } else if (i === offset) {
        dateElement.classList.add('current-day');
        currentSelectedElement = dateElement;
        // Update the pre-date display with today's date format
        dateDisplay.textContent = formatDate(today);
      }

      // Check if the date is either in the past or beyond the last selectable date
      if (date < today) {
        // For past dates, show a blank field
        dateElement.textContent = '';
      } else if (date > lastDate) {
        // Add 'faded' class for dates beyond the 15-day range
        dateElement.classList.add('faded');
      } else {
        // Ensure normal behavior for dates within the range
        dateElement.classList.remove('faded');
      }

      dateElement.addEventListener('click', () => {
        if (!dateElement.classList.contains('faded')) {
          updatePayload.updateDate(date);
          // Toggle the "Next" button for step 3
          toggleNextButton(3);
          document.querySelector('#step4 .selected-date p').textContent = formatDateToString(date);
          document.querySelector('#step5 .selected-date p').textContent = formatDateToString(date);

          // Remove current-day class from the previously selected date, if any
          if (currentSelectedElement) {
            currentSelectedElement.classList.remove('current-day');
          }

          // Add current-day class to the clicked date
          dateElement.classList.add('current-day');

          // Update the currently selected element
          currentSelectedElement = dateElement;

          selectedDate = date;

          if (isToday(selectedDate)) {
            timeSlots.forEach((slot, index) => {
              const { end } = slotTimes[index];

              // Convert start and end times to Date objects on today's date for comparison
              const [endHour, endMinute] = end.split(':').map(Number);

              const endTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                endHour,
                endMinute,
              );

              // Disable the slot if the current time is past the end time
              if (now > endTime) {
                if (slot.classList.contains('active')) {
                  slot.classList.remove('active');
                }

                slot.classList.add('disabled');
                slot.style.pointerEvents = 'none';
                slot.style.opacity = '0.5';
              }
            });
            // Check if all slots are disabled and update selectedDateTimeSlot if needed
            const allDisabled = Array.from(timeSlots).every((slot) => slot.classList.contains('disabled'));
            if (allDisabled) {
              updatePayload.updateTimeSlot('');
              updatePayload.updateTimePeriodSlot('');
              // Toggle the "Next" button for step 3
              toggleNextButton(3);
            } else {
              // Remove the 'active' class from all time slots
              timeSlots.forEach((slot) => {
                slot.classList.remove('active');
              });
              // Optionally, set to the first non-disabled slot
              // if you want to select an available time slot automatically
              const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
              if (firstAvailableSlot) {
                firstAvailableSlot.classList.add('active');
                const selectedTime = firstAvailableSlot.querySelector('.time span')?.textContent.trim();
                const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p')?.textContent.trim();
                updatePayload.updateTimeSlot(selectedTime);
                updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
                // Toggle the "Next" button for step 3
                toggleNextButton(3);
                document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
                document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
              }
            }
          } else {
            timeSlots.forEach((slot) => {
              // If the date is not today, ensure all slots are enabled
              slot.classList.remove('disabled');
              slot.classList.remove('active');
              slot.style.pointerEvents = '';
              slot.style.opacity = '';
            });

            const firstAvailableSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
            if (firstAvailableSlot) {
              firstAvailableSlot.classList.add('active');
              const selectedTime = firstAvailableSlot.querySelector('.time span')?.textContent.trim();
              const selectedTimePeriodSlot = firstAvailableSlot.querySelector('.time p')?.textContent.trim();
              updatePayload.updateTimeSlot(selectedTime);
              updatePayload.updateTimePeriodSlot(selectedTimePeriodSlot);
              // Toggle the "Next" button for step 3
              toggleNextButton(3);
              document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
              document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
            }
          }

          // Update the pre-date display with the selected date format
          dateDisplay.textContent = formatDate(date);
        }
      });

      // Append the date element
      datesContainer.appendChild(dateElement);
    }

    // Determine and update the month range based on the visible dates
    const lastVisibleDate = new Date(lastDate);

    // Check if today's month and lastDate's month are the same
    const isSameMonth = today.getMonth() === lastVisibleDate.getMonth()
      && today.getFullYear() === lastVisibleDate.getFullYear();

    if (isSameMonth) {
      // If they are in the same month, only show the current month
      monthDisplay.textContent = `${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    } else {
      // If they are in different months, show both months
      monthDisplay.textContent = `${today.toLocaleString('default', { month: 'long', year: 'numeric' })} - ${lastVisibleDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    }
  }

  async function updateStepSequence(isDealerFlow) {
    const step1Label = document.querySelector('.step[data-step="1"]');
    const step2Label = document.querySelector('.step[data-step="2"]');
    const step1Content = document.getElementById('step1');
    const step2Content = document.getElementById('step2');

    if (isDealerFlow) {
      // Set step 1 for dealer and step 2 for vehicle
      step1Label.innerHTML = `<span>1</span> ${dealerName}`;
      step2Label.innerHTML = `<span>2</span> ${vehicleName}`;
      step1Content.innerHTML = dealershipFormHTML;
      step2Content.innerHTML = vehicleFormHTML;
      if (sessionStorage.getItem('isBtdFlowStep') && sessionStorage.getItem('isBtdFlowStep') > 1) {
        goToStep(parseInt(sessionStorage.getItem('isBtdFlowStep'), 10));

        document.getElementById('first-name').value = payload.cust_fname;
        document.getElementById('last-name').value = payload.cust_lname;
        document.getElementById('mobile').value = payload.Phone;
        document.querySelector('#step5 .customer-name').textContent = `${payload.cust_fname} ${payload.cust_lname}`;
        document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
        document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
        document.querySelector('#step4 .selected-date p').textContent = formatDateToString(payload.date);
        document.querySelector('#step5 .selected-date p').textContent = formatDateToString(payload.date);
      } else {
        goToStep(2);
      }
    } else {
      // Set step 1 for vehicle and step 2 for dealer
      step1Label.innerHTML = `<span>1</span> ${vehicleName}`;
      step2Label.innerHTML = `<span>2</span> ${dealerName}`;
      step1Content.innerHTML = vehicleFormHTML;
      step2Content.querySelector('.dealership-step').innerHTML = dealershipFormHTML;
    }
  }

  // Example usage
  const { isDealerFlow } = payload; // Assume payload object contains isDealerFlow flag
  updateStepSequence(isDealerFlow);

  function goToStep(stepNumber) {
    toggleNextButton(stepNumber);
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextButton = document.getElementById('nextButton');
    if (stepNumber === 5) {
      nextButton.textContent = confirmButtonText;
    } else {
      nextButton.textContent = 'Next';
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
      prevButton.disabled = true; // Disable the button
      prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
    }
    stepContents.forEach((content) => content.classList.remove('active'));
    const targetContent = document.getElementById(`step${stepNumber}`);
    if (targetContent) {
      targetContent.classList.add('active');
    } else {
      console.error(`No content found for step ${stepNumber}`);
    }
  }

  // Insert the HTML into the .custom-dropdown div
  // const customDropdown = document.querySelector(".custom-dropdown");

  // Select the dropdown elements after inserting HTML
  const modeldropdownOptions = document.getElementById("model-options");
  const modelDropdown = document.getElementById("model");
  const errorMessage = document.getElementById("error-message");

  // Toggle dropdown visibility
  modelDropdown.addEventListener("click", () => {
    modeldropdownOptions.style.display = modeldropdownOptions.style.display === "block" ? "none" : "block";

  });
  // Handle option click and selection
  modeldropdownOptions.addEventListener("click", async (e) => {
    if (e.target.tagName === "LI") {
      const selectedOption = e.target;

      // Update the selected value
      modelDropdown.textContent = selectedOption.textContent;

      // Remove 'selected' class from all options
      document.querySelectorAll(".model-options li").forEach((li) => {
        li.classList.remove("selected");
      });

      // Add 'selected' class to clicked option
      selectedOption.classList.add("selected");

      // Hide the dropdown
      modeldropdownOptions.style.display = "none";

      // Hide the error message
      errorMessage.style.display = "none";

      // Log the selected value
      let selectedModelValue = selectedOption.getAttribute("data-value");
      await modelChange(selectedModelValue);
    }
  });
  const customDropdown = document.querySelector(".custom-dropdown");
  // Close dropdown if clicking outside
  document.addEventListener("click", (e) => {
    if (!customDropdown.contains(e.target)) {
      modeldropdownOptions.style.display = "none";
    }
  });

  // Function to validate the dropdown
  function validateDropdown() {
    const selectedValue = modelDropdown.textContent.trim();

    // Check if the selected value is the placeholder text
    if (selectedValue === "Select Vehicle*") {
      errorMessage.style.display = "block"; // Show the error message
      return false;
    }

    errorMessage.style.display = "none"; // Hide the error message
    return true;
  }

  // Function to programmatically select a dropdown option
  function selectDropdownOption(dropdownId, value) {
    const dropdownContainer = document.getElementById(dropdownId);
    if (!dropdownContainer) {
      console.error(`Dropdown with ID '${dropdownId}' not found.`);
      return;
    }

    const dropdownOptions = document.querySelector(`.${dropdownId}-options`);
    const dropdownSelected = dropdownContainer;

    if (!dropdownOptions || !dropdownSelected) {
      console.error(`Dropdown structure is incomplete for ID '${dropdownId}'.`);
      return;
    }

    // Find the list item with the matching data-value
    const optionToSelect = Array.from(dropdownOptions.children).find(
      (li) => li.getAttribute("data-value") === value
    );

    if (optionToSelect) {
      // Update the selected value displayed in the dropdown
      dropdownSelected.textContent = optionToSelect.textContent;

      // Remove 'selected' class from all options
      dropdownOptions.querySelectorAll("li").forEach((li) => {
        li.classList.remove("selected");
      });

      // Add 'selected' class to the selected option
      optionToSelect.classList.add("selected");

      // Optionally, hide the dropdown after selection
      dropdownOptions.style.display = "none";

      // Hide the error message
      errorMessage.style.display = "none";

    } else {
      console.error(`Option not found for value: ${value}`);
    }
  }

  // selectDropdownOption("model", "FR");

  // Ensure the dropdown is fully set up before selecting the option
  // window.onload = () => {
  //   // Example: Select a specific option programmatically for the "model" dropdown
  //   selectDropdownOption("model", "FR"); // This will select the "Fronx" option
  // };

  function updateFuelTypeOption(selectedOption) {
    const fuelTypeOptions = document.querySelectorAll("#fuel-type-options li");
    const fuelTypeLabel = document.getElementById("fuel-type");

    // Iterate through the dropdown options
    fuelTypeOptions.forEach((option) => {
      if (option.getAttribute("data-value") === selectedOption) {
        // Update the selected class
        option.classList.add("selected");
        // Update the label text content
        fuelTypeLabel.textContent = option.textContent;
        document.querySelector('#step3 .fuel-type').textContent = option.textContent;
        document.querySelector('#step4 .fuel-type').textContent = option.textContent;
        document.querySelector('#step5 .fuel-type').textContent = option.textContent;
      } else {
        // Remove the selected class from non-matching options
        option.classList.remove("selected");
      }
    });

  }



  function setSelectVehicleModel() {
    const modelCd = payload.model_cd;
    const fuelType = payload.fuel_type;

    // Check if the model_cd is available
    if (modelCd) {
      const isModelCdPresent = vehicles.some(vehicle => vehicle.value === modelCd);
      if (isModelCdPresent) {
        selectDropdownOption("model", modelCd);
      }
    }

    if (fuelType) {
      updateFuelTypeOption(fuelType)
    }
  }

  document.getElementById('edit-vehicle-btn').addEventListener('click', () => {
    setSelectVehicleModel();
    if (isDealerFlow) {
      goToStep(2);
    } else {
      goToStep(1);
    }
  });

  document.getElementById('edit-address-btn').addEventListener('click', () => {
    setSelectVehicleModel();
    if (isDealerFlow) {
      sessionStorage.setItem('isBtdFlowStep', '3');
      sessionStorage.setItem('payLoadBtd', JSON.stringify(payload));
      const url = new URL(dealerPageUrl, window.location.origin);
      url.searchParams.set('lastFlow', 'btd'); // Add or update query parameter
      window.location.href = url.toString();
    } else {
      goToStep(2);
    }
  });

  document.getElementById('pd-edit-vehicle-btn').addEventListener('click', () => {
    setSelectVehicleModel();

    if (isDealerFlow) {
      goToStep(2);
    } else {
      goToStep(1);
    }
  });

  document.getElementById('pd-edit-address-btn').addEventListener('click', () => {
    setSelectVehicleModel();
    if (isDealerFlow) {
      const url = new URL(dealerPageUrl, window.location.origin);
      url.searchParams.set('lastFlow', 'btd');
      sessionStorage.setItem('isBtdFlowStep', '4');
      sessionStorage.setItem('payLoadBtd', JSON.stringify(payload));
      window.location.href = url.toString();
    } else {
      goToStep(2);
    }
  });

  document.getElementById('ov-edit-address-btn').addEventListener('click', () => {
    setSelectVehicleModel();
    if (isDealerFlow) {
      const url = new URL(dealerPageUrl, window.location.origin);
      url.searchParams.set('lastFlow', 'btd');
      window.location.href = url.toString();
      sessionStorage.setItem('isBtdFlowStep', '5');
      sessionStorage.setItem('payLoadBtd', JSON.stringify(payload));
    } else {
      goToStep(2);
    }
  });

  document.getElementById('ov-edit-vehicle-btn').addEventListener('click', () => {
    setSelectVehicleModel();

    if (isDealerFlow) {
      goToStep(2);
    } else {
      goToStep(1);
    }
  });

  document.getElementById('edit-datetime-btn').addEventListener('click', () => {
    goToStep(3);
  });

  document.getElementById('ov-edit-datetime-btn').addEventListener('click', () => {
    goToStep(3);
  });

  document.getElementById('ov-edit-personal-details').addEventListener('click', () => {
    goToStep(4);
  });

  // populate the fuelType Dropdown on Model Selection
  if (payload.model_cd) {
    selectDropdownOption("model", payload.model_cd);
    await modelChange(payload.model_cd);
  } else if (selectedCarValue) {
    selectDropdownOption("model", selectedCarValue);
    await modelChange(selectedCarValue);
  }

  // Function to get the corresponding name using the value
  function getNameByValue(value) {

    const vehicle = vehicles.find(vehicle => vehicle.value === value);
    if (vehicle) {
      return vehicle.name;
    } else {
      console.error(`No vehicle found with value '${value}'`);
      return null;
    }
  }

  function updateDropdownOptions(newArray, dropdownId) {

    // Regenerate the dropdown options HTML
    const newDropdownHTML = newArray
      .map(vehicle => `<li data-value="${vehicle.value}">${vehicle.name}</li>`)
      .join("");

    // Update the dropdown-options element
    const dropdownOptions = document.getElementById(`${dropdownId}-options`);
    if (dropdownOptions) {
      dropdownOptions.innerHTML = newDropdownHTML;
    } else {
      console.error("Dropdown options element not found.");
    }
  }

  async function modelChange(modelValue) {
    const modelLabel = document.getElementById('model');

    // Change the text color
    modelLabel.style.color = '#B2B2B2';
    function addValue(key, value) {
      if (!myMap[key]) {
        myMap[key] = [];
      }
      if (!myMap[key].includes(value)) {
        myMap[key].push(value);
      }
    }
    const selectedModel = modelValue;
    const selectedModelName = getNameByValue(modelValue);
    document.querySelector('#step3 p').textContent = selectedModelName;
    const dealerTitleDiv = block.querySelector('.select-dealer-title');
    const dealerTitle = dealerText.replace('{carName}', selectedModelName);
    dealerTitleDiv.textContent = dealerTitle;
    document.querySelector('#step4 p').textContent = selectedModelName;
    document.querySelector('#step5 p').textContent = selectedModelName;
    const selectedCarImageElementStep3 = document.querySelector('#step3 .selected-car-image');
    const selectedCarImageElementStep4 = document.querySelector('#step4 .selected-car-image');
    const selectedCarImageElementStep5 = document.querySelector('#step5 .selected-car-image');

    updatePayload.updateModelID(selectedModel);
    updatePayload.updateModelName(selectedModelName);
    updatePayload.updateFuelType("");
    const myMap = {};
    let carImage;
    let data1;
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantFuelType;modelCd=${selectedModel};locale=en;`;
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    try {
      const response = await fetch(graphQlEndpoint, requestOptions);
      if (!response.ok) {
        const details = {};
        details.formName = 'Book Test Drive';
        details.errorType = 'API Error';
        details.errorCode = response.status.toString();
        details.errorDetails = 'Failed to fetch model image';
        details.webName = 'Search'; // should be aria-label
        details.linkType = 'other';
        analytics.setWebError(details);
        throw new Error('Network response was not ok');
      } else {
        data1 = await response.json();
        const carImageNav = data1?.data?.carModelList?.items[0].carImage._publishUrl;
        let carImageBTD = data1?.data?.carModelList?.items[0]?.carBTD?._dynamicUrl;
        carImageBTD = carImageBTD ? (sitedomain + carImageBTD) : carImageBTD;
        carImage = carImageBTD || carImageNav;
      }
    } catch (error) {
      console.error('Error loading car models:', error);
    }
    const imageContainer = block.querySelector('.car__image img');
    updatePayload.updateCarImage(carImage);
    imageContainer.src = carImage;
    const popupImage = block.querySelector('.popup-car-image img');
    popupImage.src = carImage;
    selectedCarImageElementStep3.innerHTML = '';
    selectedCarImageElementStep4.innerHTML = '';
    selectedCarImageElementStep5.innerHTML = '';

    selectedCarImageElementStep3.appendChild(imageContainer.cloneNode(true));
    selectedCarImageElementStep4.appendChild(imageContainer.cloneNode(true));
    selectedCarImageElementStep5.appendChild(imageContainer.cloneNode(true));

    data1?.data?.carModelList?.items[0].variants.forEach((item, index) => {
      addValue(item.fuelType, item.transmission);
    });
    toggleNextButton(currentStep);

    // Select the target div
    const fuelTypeDiv = document.querySelector(".custom-dropdown#fuel-type-div");

    // Clear all previous HTML inside the div
    fuelTypeDiv.innerHTML = "";

    // Add the new HTML structure
    fuelTypeDiv.innerHTML = `
      <div class="custom-dropdown-label" id="fuel-type">Select Fuel Type</div>
      <ul class="dropdown-options fuel-type-options" id="fuel-type-options">
      </ul>
      <div id="error-message" style="color: red; font-size: 0.9em; display: none;">Please select a fuel type.</div>
    `;


    // Array to hold the new objects
    const newFuelTypeArray = [];
    Object.keys(myMap).forEach((key) => {
      // Map the key to its value (e.g., "PET" -> "Petrol")
      const name = fuelTypeList[key.toLowerCase().replace('-', '')];
      const value = key;

      // Push to the newVehicles array
      if (value && name) {
        newFuelTypeArray.push({ name, value });
      }

    });
    updateDropdownOptions(newFuelTypeArray, "fuel-type")
    const fuelTypeDropdown = document.getElementById("fuel-type");
    const fuelTypeDropdownOptions = document.getElementById("fuel-type-options");

    // Toggle dropdown visibility
    fuelTypeDropdown.addEventListener("click", () => {
      fuelTypeDropdownOptions.style.display = fuelTypeDropdownOptions.style.display === "block" ? "none" : "block";
    });

    // Handle option click and selection
    fuelTypeDropdownOptions.addEventListener("click", (e) => {
      const fuelLabel = document.getElementById('fuel-type');

      // Change the text color
      fuelLabel.style.color = '#B2B2B2';

      if (e.target.tagName === "LI") {
        const selectedOption = e.target;

        // Update the selected value
        fuelTypeDropdown.textContent = selectedOption.textContent;

        // Remove 'selected' class from all options
        document.querySelectorAll(".fuel-type-options li").forEach((li) => {
          li.classList.remove("selected");
        });

        // Add 'selected' class to clicked option
        selectedOption.classList.add("selected");


        // Hide the dropdown
        fuelTypeDropdownOptions.style.display = "none";

        // Hide the error message
        errorMessage.style.display = "none";

        // Log the selected value
        let selectedFuelType = selectedOption.getAttribute("data-value")
        updatePayload.updateFuelType(selectedFuelType);
        document.querySelector('#step3 .fuel-type').textContent = selectedOption.textContent;
        document.querySelector('#step4 .fuel-type').textContent = selectedOption.textContent;
        document.querySelector('#step5 .fuel-type').textContent = selectedOption.textContent;
        updateTransmissionOptions(selectedFuelType, myMap);
        logCheckedRadio();
        toggleNextButton(currentStep);
      }
    });

    const customFuelDropdown = document.querySelector("#fuel-type-div");
    const fueldropdownOptions = document.getElementById("fuel-type-options")
    // Close dropdown if clicking outside
    document.addEventListener("click", (e) => {
      if (!customFuelDropdown.contains(e.target)) {
        fueldropdownOptions.style.display = "none";
      }
    });

    if (payload.fuel_type) {
      selectDropdownOption("fuel-type", payload.fuel_type)
      document.querySelector('#step3 .fuel-type').textContent = payload.fuel_type;
      document.querySelector('#step4 .fuel-type').textContent = payload.fuel_type;
      document.querySelector('#step5 .fuel-type').textContent = payload.fuel_type;
    }
  }
  // document.getElementById('model').addEventListener('change', modelChange);
  function updateTransmissionOptions(selectedModel, myMap) {
    const transmissionOptions = myMap[selectedModel];
    const isAutomaticAvailable = transmissionOptions?.includes('Automatic');
    const isManualAvailable = transmissionOptions?.includes('Manual');
    const automaticRadioButton = document.getElementById('Automatic');
    const manualRadioButton = document.getElementById('Manual');
    if (isAutomaticAvailable) {
      automaticRadioButton.disabled = false;
    } else {
      automaticRadioButton.disabled = true;
    }

    if (isManualAvailable) {
      manualRadioButton.disabled = false;
    } else {
      manualRadioButton.disabled = true;
    }
    if (isAutomaticAvailable) {
      automaticRadioButton.checked = true;
    } else if (isManualAvailable) {
      manualRadioButton.checked = true;
    }
  }

  // Function to determine the suffix for the day (st, nd, rd, th)
  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th'; // Special case for 11th, 12th, and 13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  function formatDateToString(date) {
    date = new Date(date);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const day = date.getDate();
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}${getDaySuffix(day)} ${month} ${year} | ${dayOfWeek}`;
  }

  function formatTimeSlot(timePeriodSlot, timeSlot) {
    if (!timePeriodSlot || !timeSlot) {
      console.error('Invalid input: timePeriodSlot or timeSlot is undefined.');
      return '';
    }

    const timeParts = timeSlot.split(' - ');

    // Check if timeParts array has both start and end times
    if (timeParts.length !== 2) {
      console.error("Invalid timeSlot format. Expected 'start - end'.");
      return '';
    }

    const startTime = timeParts[0] ? timeParts[0].toLowerCase() : '';
    const endTime = timeParts[1] ? timeParts[1].toLowerCase() : '';

    // Return the formatted string
    return `${timePeriodSlot}`;
  }

  document.querySelectorAll('.step').forEach((step) => {
    step.addEventListener('click', () => {
      // Get the step number from the `data-step` attribute
      const stepNumber = parseInt(step.getAttribute('data-step'), 10);

      // Check if the clicked step has the 'completed' class
      if (step.classList.contains('completed')) {
        if (payload.isDealerFlow) {
          if (stepNumber === 1) {
            sessionStorage.setItem('isBtdFlowStep', '2');
            sessionStorage.setItem('payLoadBtd', JSON.stringify(payload));
            const url = new URL(dealerPageUrl, window.location.origin);
            url.searchParams.set('lastFlow', 'btd'); // Add or update query parameter
            window.location.href = url.toString(); // Redirect to the updated URL
          } else {
            goToStep(stepNumber);
          }
        } else {
          goToStep(stepNumber);
        }
      }
    });
  });
  let selectedDealerType;

  function selectRadioButton() {
    document.querySelectorAll('.dealer__radio').forEach((radio) => {
      radio.addEventListener('change', () => {
        // Find the selected dealer card
        const selectedDealerCard = radio.closest('.dealer__card');

        // Get the dealer's name, distance, and address
        const dealerName = selectedDealerCard.querySelector('.dealer__name')?.textContent;
        const dealerDistance = `${selectedDealerCard.querySelector('.dealer__distance')?.textContent.split(' ')[0]} kms`;
        const dealerAddress = selectedDealerCard.querySelector('.dealer__address')?.textContent;
        const dealerCode = selectedDealerCard.querySelector('.dealer__code')?.textContent;
        const dealerforCode = selectedDealerCard.querySelector('.dealer_for_code')?.textContent;
        const locationCode = selectedDealerCard.querySelector('.location_code')?.textContent;
        const dealerPincode = selectedDealerCard.querySelector('.dealer_pincode')?.textContent;
        selectedDealerType = selectedDealerCard.querySelector('.dealership__top__info').getAttribute('data-dealerType');

        updatePayload.updateDealerName(dealerName);
        updatePayload.updateDealerAddress(dealerAddress);
        updatePayload.updateDealerDistance(dealerDistance);
        updatePayload.updateDealerCode(dealerCode);
        updatePayload.updateDealerForCode(dealerforCode);
        updatePayload.updateLocationCode(locationCode);
        updatePayload.updatePinCode(dealerPincode)

        document.querySelector('#step3 .selected-car-dealer p').textContent = dealerName;
        document.querySelector('#step3 .selected-car-dealer span').textContent = dealerDistance;
        document.querySelector('#step3 .selected-dealer-address p').textContent = dealerAddress;

        document.querySelector('#step4 .selected-car-dealer p').textContent = dealerName;
        document.querySelector('#step4 .selected-car-dealer span').textContent = dealerDistance;
        document.querySelector('#step4 .selected-dealer-address p').textContent = dealerAddress;

        document.querySelector('#step5 .selected-car-dealer p').textContent = dealerName;
        document.querySelector('#step5 .selected-car-dealer span').textContent = dealerDistance;
        document.querySelector('#step5 .selected-dealer-address p').textContent = dealerAddress;

        // Toggle "Next" button for step 2 based on selection
        toggleNextButton(2);
      });
    });
  }
  selectRadioButton();
  // Step 4 Personal Details JS
  const resendOtpContainer = block.querySelector('.resend-otp-container');
  const sendotpContainer = block.querySelector('.sendotp-container');
  const mobileField = block.querySelector('.mobileField');
  let otpInputField = '';

  const userStateDropdown = block.querySelector('#state');
  const updateDropdown = (dropdown, list, processText = (text) => text) => {
    if (!dropdown) return;
    const uniqueItems = new Map();
    list.forEach((item) => {
      const [text, value] = item.split(':');
      if (text && value) uniqueItems.set(text, value);
    });
    const optionsHtml = Array.from(uniqueItems)
      .sort(([textA], [textB]) => textA.localeCompare(textB))
      .map(([text, value]) => `<option value="${value}">${processText(text)}</option>`)
      .join('');
    dropdown.innerHTML = optionsHtml;
  };

  const updateCityDropDown = async (target) => {
    cityDropdown = block.querySelector('.dropdown-city-user');
    const cityList = await apiUtils.getCityList(target.value);
    if (cityList.length > 0) {
      isCitySelected = true;
      toggleNextButton(4);
      updateDropdown(cityDropdown, cityList);
    } else {
      isCitySelected = false;
      toggleNextButton(4);
      const cityPlaceholder = cityDropdown.getAttribute('data-placeholder');
      cityDropdown.innerHTML = cityPlaceholder
        ? `<option value="" disabled selected>${cityPlaceholder}</option>`
        : '';
    }
    /* if (target.id === 'state') {
      cityDropdown = block.querySelector('.dropdown-city-user');
      if (cityDropdown) {
        const cityList = await apiUtils.getCityList(target.value);
        updateDropdown(cityDropdown, cityList);
      }
    } else if (target.id === 'dealer-state') {
      cityDropdown = block.querySelector('#dealer-city');
      if (cityDropdown) {
        await updateCityDropDown();
        const selectDealerCityElement = document.querySelector('#dealer-city');
        selectDealerCityElement.style.color = '#000';
      }
    } */
    if (payload.city) {
      cityDropdown.value = payload.city;
    }
  };

  const handleStateChange = async (event) => {
    updatePayload.updateState(event.target.value);
    updatePayload.updateCity('');
    await updateCityDropDown(event.target);
  };

  userStateDropdown.addEventListener('change', handleStateChange);
  function selectOption(dropdown, criteria, isValue = true) {
    for (const option of dropdown.options) {
      option.removeAttribute('selected');
    }
    for (const option of dropdown.options) {
      if (typeof (criteria) === 'object') {
        if (option.value === criteria.code && option.text === criteria.cityName) {
          option.setAttribute('selected', true);
          return option;
        }
      } else {
        const optionToCompare = isValue ? option.value : option.text;
        if (optionToCompare === criteria) {
          option.setAttribute('selected', true);
          return option;
        }
      }
    }
    return null;
  }
  async function selectState() {
    try {
      const selectedLocation = getSelectedLocationStorage();
      let stateCd;
      if (payload.state && Object.keys(payload.state).length !== 0) {
        stateCd = payload.state;
      } else {
        stateCd = selectedLocation ? selectedLocation.stateCode : 'DL';
      }
      const stateDropdown = document.querySelector('#state');
      stateDropdown.remove(0);
      const stateSelected = selectOption(stateDropdown, stateCd, true);
      if (stateSelected) {
        updatePayload.updateState(stateSelected);
        await updateCityDropDown(stateSelected);
      }
    } catch (error) {
      console.error('Error in selectState:', error);
    }
  }
  async function selectCity() {
    try {
      const selectedLocation = getSelectedLocationStorage();
      const cityName = selectedLocation ? selectedLocation.cityName : city;
      const citiesDropdown = document.querySelector('.dropdown-city-user');
      selectOption(citiesDropdown, cityName, false);
    } catch (error) {
      console.error('Error in selectCity:', error);
    }
  }
  async function initializeLocationSelection() {
    await selectState();
    await selectCity();
    if (payload.city && payload.state) {
      const selectedStateText = document.getElementById('state').options[document.getElementById('state').selectedIndex].text;
      const selectedCityText = document.getElementById('city').options[document.getElementById('city').selectedIndex].text;
      const cityStateCombined = `${selectedCityText}, ${selectedStateText}`;
      document.querySelector('#step5 .customer-location').textContent = cityStateCombined;
    }
  }
  initializeLocationSelection();

  const startTimer = () => {
    timerFlag = true;
    let remainingTime = 60;
    const getMinute = (time) => Math.floor(time / 60).toString().padStart(2, '0');
    const getSeconds = (time) => (time % 60).toString().padStart(2, '0');

    const resendOtpBtn = document.getElementById('resend-otp-btn');
    resendOtpBtn.style.pointerEvents = 'none';
    resendOtpBtn.textContent = `${resendOtpText} (${getMinute(remainingTime)}:${getSeconds(remainingTime)})`;

    const updateText = () => {
      remainingTime -= 1;
      if (remainingTime <= 0) {
        timerFlag = false;
        clearInterval(timerInterval);
        timerInterval = null;
        resendOtpBtn.textContent = resendOtpText;
        resendOtpBtn.style.pointerEvents = 'auto';
      } else {
        resendOtpBtn.textContent = `${resendOtpText} (${getMinute(remainingTime)}:${getSeconds(remainingTime)})`;
        timerInterval = setTimeout(updateText, 1000);
      }
    }
    updateText();
  }

  let requestId;
  let mobileNumber;
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
        details.formName = 'Book Test Drive';
        details.errorType = 'API Error';
        details.errorCode = response.status.toString();
        details.errorDetails = 'Failed to send OTP';
        details.webName = 'Send OTP Button Text'; // should be aria-label
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

  const hideAndShowEl = (el, value) => {
    el.style.display = value;
  };

  const otpDigits = document.querySelectorAll('.otp-digit');

  otpDigits.forEach((input, index) => {
    input.addEventListener('input', () => {
      // Remove any non-numeric characters
      input.value = input.value.replace(/\D/g, '');

      // Move to the next input if a digit is entered
      if (input.value.length === 1 && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
      }

      // Log the current OTP
      otpInputField = Array.from(otpDigits).map((input) => input.value).join('');
      verifyOtp();
    });

    // Move to the previous input on backspace if input is empty
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && input.value === '' && index > 0) {
        otpDigits[index - 1].focus();
      }
    });
  });

  const otpValidation = resendOtpContainer.querySelector('.validation-text');
  const verifyOtp = async () => {
    const otpValue = otpInputField;
    if (otpValue.length < 5) {
      otpDigits.forEach((digit) => {
        digit.classList.remove('red');
        digit.classList.remove('green');
        digit.disabled = false;
        mobileField.classList.remove('valid');
      });
    }
    if (otpValue.length === 5) {
      hideAndShowEl(otpValidation, 'none');
      if (await verifyOtpApi(otpValue) === true) {
        isOtpVerified = true;
        verifyOtpData();
        otpDigits.forEach((digit) => {
          document.getElementById('mobile').style.color = '#939393';
          digit.classList.add('green');
          digit.disabled = true;
          timerFlag = true;
          timerInterval = null;
          mobileField.classList.add('valid');
          setTimeout(() => {
            document.querySelector('.otp-container').style.display = 'none';
          }, 3000);
        });
        toggleNextButton(4);
      } else {
        otpDigits.forEach((digit) => {
          digit.classList.add('red');
          digit.disabled = false;
          mobileField.classList.remove('valid');
        });
        otpValidation.textContent = 'Please enter the correct OTP';
        hideAndShowEl(otpValidation, 'block');
      }
    } else {
      isOtpVerified = false;
      // Change the text message

      otpDigits.forEach((digit) => digit.classList.remove('green'));
      toggleNextButton(4);
    }
  };

  const verifyOtpApi = async (otp) => {
    try {
      const response = await commonApiUtils.otpValidationRequest(otp, requestId, mobileNumber, otpTid);

      if (response.ok) {
        const result = await response.json();
        if (result.data.status === 'OTP_VERIFIED' && result.data.tId) {
          finalRequestId = requestId;
          finalTid = result.data.tId;
          finalOtp = otp;
          return true;
        }
      }
      const details = {};
      details.formName = 'Book Test Drive';
      details.errorType = 'API Error';
      details.errorCode = response.status.toString();
      details.errorDetails = 'Failed to verify OTP';
      details.webName = 'Input'; // should be aria-label
      details.linkType = 'other';
      analytics.setWebError(details);

      return false;
    } catch (error) {
      console.error('Error during OTP verification:', error);
    }
  };

  document.getElementById('otp').addEventListener('input', () => {
    verifyOtp();
  });

  hideAndShowEl(resendOtpContainer, 'none');
  sendotpBtn.addEventListener('click', async () => {
    document.getElementById('mobile').disabled = true;
    try {
      if (timerFlag) {
        return;
      }
      if (await sendotp()) {
        startTimer();
        hideAndShowEl(sendotpContainer, 'none');
        hideAndShowEl(resendOtpContainer, 'block');
      }
    } catch {
      console.error('Error Sending OTP:', error);
    }
  });

  document.getElementById('resend-otp-btn').addEventListener('click', async () => {
    try {
      if (timerFlag) {
        return;
      }
      otpValidation.style.display = 'none';
      otpDigits.forEach((digit) => {
        digit.value = '';
        digit.classList.remove('red');
      });
      if (await sendotp()) {
        startTimer();
      }
    } catch (error) {
      console.error('Error Sending OTP:', error);
    }
  });
  const urlWithParams = `${fuelTypeList.publishDomain + fuelTypeList.apiDealerOnlyCities}?channel=EXC`;
  const response = await fetch(urlWithParams, {
    method: 'GET',
  });
  if (!response.ok) {
    const details = {};
    details.formName = 'Book Test Drive';
    details.errorType = 'API Error';
    details.errorCode = response.status.toString();
    details.errorDetails = 'Failed to fetch cities';
    details.webName = 'Search'; // should be aria-label
    details.linkType = 'other';
    analytics.setWebError(details);
  }

  let citiesObject;

  function processData(data) {
    citiesObject = data?.reduce((acc, item) => {
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

  async function populateAllCities() {
    const suggestedPlaces = block.querySelector('.suggested-places-btd');
    suggestedPlaces.innerHTML = '';
    suggestedPlaces.scrollTop = 0;
    Object.keys(citiesObject).forEach((cityName) => {
      const option = document.createElement('option');
      option.text = cityName;
      option.className = 'suggested__city__btd';
      option.value = citiesObject[cityName].forCode;
      option.setAttribute('data-cityCode', citiesObject[cityName].cityCode);
      suggestedPlaces.appendChild(option);
    });
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

  async function dealerPinCodeUpdate(locationObj) {
    pincode = block.querySelector('#pincode');
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
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLon / 2)
      * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  if (response.ok) {
    const result = await response.json();
    const filteredData = result?.data?.filter((obj) => obj.cityDesc !== null);
    citiesObject = processData(filteredData);
  }
  await populateAllCities();

  placesOptions = block.querySelector('.suggested-places-btd');
  pincode = block.querySelector('#pin-code');
  await dealerCityUpdate();
  await dealerPinCodeUpdate();
  await pincodeListener();
  await cityListener();

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
  let isValidPincodeFlag = true;
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
        const lat = citiesData[0]?.latitude;
        const long = citiesData[0]?.longitude;
        if (cityName) {
          selectOption(block.querySelector('.suggested-places-btd'), toTitleCase(cityName), false);
          const dealersForm = block.querySelector('.dealership-form-column-2');
          dealersForm.innerHTML = await getNearestDealersAndUpdate(lat, long);
          selectRadioButton();
          updateValidationMessage('pin-code', '', 'none')
          isValidPincodeFlag = true;
          if (payload.isDealerFlow) {
            toggleNextButton(1);
          }
          else {
            toggleNextButton(2);
          }

        } else {
          updateValidationMessage('pin-code', 'Please Enter valid Pincode', 'block');
          console.warn('City not found for the entered pincode');
          isValidPincodeFlag = false;
          if (payload.isDealerFlow) {
            toggleNextButton(1);
          }
          else {
            toggleNextButton(2);
          }
        }
      }
      else {
        pincodeValue.length === 0 ? updateValidationMessage('pin-code', 'Please Enter Your Pincode', 'block') : updateValidationMessage('pin-code', 'Please Enter 6 digit Pincode', 'block');
        if (payload.isDealerFlow) {
          toggleNextButton(1);
        }
        else {
          toggleNextButton(2);
        }
      }
    });
  }

  const handleDealerCityChange = async (selectedCity) => {
    updatePayload.updateDealerName('');
    const option = document.querySelector(`.suggested__city__btd[value="${selectedCity}"]`);
    const cityCode = option.getAttribute('data-citycode');
    geoLocationPayload = {
      cityCd: cityCode,
    };
    const pinCodeData = await apiUtils.getGeoLocation(geoLocationPayload);
    const updatedPinCode = pinCodeData[0]?.pinCd;
    const lat = pinCodeData[0]?.latitude;
    const long = pinCodeData[0]?.longitude;
    pincode.value = updatedPinCode;
    const dealersForm = block.querySelector('.dealership-form-column-2');
    dealersForm.innerHTML = await getNearestDealersAndUpdate(lat, long);
    selectRadioButton();
  };

  async function cityListener() {
    placesOptions.addEventListener('change', async (event) => {
      const selectedCity = event.target.value;
      handleDealerCityChange(selectedCity);
    });
  }

  async function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let forCode = null;
    let minDistance = Infinity;
    const locationObj = {};

    // Iterating over all cities and logging latitude and longitude
    Object.keys(citiesObject).forEach((cityName) => {
      const cityLatitude = citiesObject[cityName].latitude;
      const cityLongitude = citiesObject[cityName].longitude;
      const distance = calculateDistance(
        latitude,
        longitude,
        cityLatitude,
        cityLongitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
        forCode = citiesObject[cityName].forCode;
        locationObj.latitude = cityLatitude;
        locationObj.longitude = cityLongitude;
      }
    });
    //  Update the nearest city in the dropdown
    if (util.isMobileDevice()) {
      isMobileCityClicked = true;
    }
    dealerCityUpdate(forCode, nearestCity);
    dealerPinCodeUpdate(locationObj);
    const dealersForm = block.querySelector('.dealership-form-column-2');
    dealersForm.innerHTML = await getNearestDealersAndUpdate(latitude, longitude);
    selectRadioButton();
  }

  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    autoSelectNearestCity(lat, lon);
  }

  function requestLocationPermission() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          showPosition(position);
        },
        () => {
          if (util.isMobileDevice()) {
            isMobileCityClicked = true;
            findCityFromCode();
          }
        },
      );
    }
  }
  detectLocationBtd();
  // Function to log the value and label text of the checked radio button
  function logCheckedRadio() {
    const checkedRadio = document.querySelector('input[name="transmission"]:checked');
    if (checkedRadio) {
      const label = checkedRadio.nextElementSibling; // Get the label element next to the input
      if (label) {
        updatePayload.updateTransmissionType(checkedRadio.value);
        document.querySelector('#step3 .transmission-type').textContent = label.textContent.trim();
        document.querySelector('#step4 .transmission-type').textContent = label.textContent.trim();
        document.querySelector('#step5 .transmission-type').textContent = label.textContent.trim();
      }
    }
  }

  // Log the initial checked value and label text
  logCheckedRadio();

  // Add change event listeners to all radio buttons
  const radioButtons = document.querySelectorAll('input[name="transmission"]');
  radioButtons.forEach((radio) => {
    radio.addEventListener('change', logCheckedRadio);
  });

  document.getElementById('sendotp-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value;
    updatePayload.updatePhoneNo(mobile);
    document.querySelector('#step5 .customer-mobile-no').textContent = mobile;
  });
  // Helper function to validate and allow only alphabets
  function validateAlphabetInput(event) {
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remove invalid characters
    }
  }
  const firstNameInput = document.getElementById('first-name');
  firstNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(4);
  });

  const lastNameInput = document.getElementById('last-name');
  lastNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event);
    toggleNextButton(4);
  });

  const mobileNo = document.getElementById('mobile');
  mobileNo.addEventListener('input', () => {
    const input = event.target;
    // Replace any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    toggleNextButton(4);
  });

  // Initially, make the span non-clickable
  sendotpBtn.style.pointerEvents = 'none';
  sendotpBtn.style.opacity = '0.5'; // Optional: visually indicate that it's disabled

  // Function to validate required fields for the current step
  function validateStepFields(stepNumber) {
    let isValid = true;

    switch (stepNumber) {
      case 1:
        if (payload.isDealerFlow) {
          const dealerInput = payload.dealer_name;
          const pincode = document.getElementById('pincode').value;
          const isPincodeValid = pincode.length === 6 && isValidPincodeFlag;
          if (!dealerInput || !isPincodeValid) {
            isValid = false;
          }
        } else if (!payload.model_cd || !payload.fuel_type) {
          isValid = false;
        }
        break;
      case 2: {
        // as of now dealer name is mentioned which we will change with dealer_id
        // in future once it is available
        if (payload.isDealerFlow) {
          if (!payload.model_cd || !payload.fuel_type) {
            isValid = false;
          }
        } else {
          const dealerInput = payload.dealer_name;
          const pincode = document.getElementById('pincode').value;
          const isPincodeValid = pincode.length === 6 && isValidPincodeFlag;
          if (!dealerInput || !isPincodeValid) {
            isValid = false;
          }
        }
        break;
      }
      case 3: {
        if (!payload.date || !payload.timeSlot) {
          isValid = false;
        }
        break;
      }
      case 4: {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phoneNumber = document.getElementById('mobile').value;
        const isPhoneNumberValid = phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber);
        if (isPhoneNumberValid) {
          sendotpBtn.style.pointerEvents = 'auto'; // Enable clicking
          sendotpBtn.style.opacity = '1'; // Reset opacity
        } else {
          sendotpBtn.style.pointerEvents = 'none';
          sendotpBtn.style.opacity = '0.5';
        }
        return !!(
          firstName
          && isPhoneNumberValid
          && isOtpVerified
          && payload.state
        );
      }
      default:
        return true;
    }

    return isValid;
  }

  // Function to toggle the "Next" button state
  function toggleNextButton(stepNumber) {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
      nextButton.disabled = !validateStepFields(stepNumber);
    }
  }
  // Initial call to set the button state for the first step
  toggleNextButton(1);

  // Function to update the color based on the selected option
  function updateSelectColor(selectElement) {
    // Check if the selected option is disabled
    if (selectElement.selectedOptions[0].disabled) {
      // If the selected option is disabled, change the select color to grey
      selectElement.style.color = '#515151';
    } else {
      // Otherwise, reset the color to the default
      selectElement.style.color = '#B2B2B2'; // Or set it to your desired color
    }

    // Add an event listener to detect changes
    function handleChange() {
      this.style.color = '#B2B2B2'; // Or set it to your desired color
    }

    // Add an event listener to detect changes
    selectElement.addEventListener('change', handleChange);
  }

  // // Get the Model select element and apply the color update function
  // const selectModelElement = document.querySelector('#model');
  // updateSelectColor(selectModelElement);

  // Get the Fuel Type select element and apply the color update function
  // const selectFuelTypeElement = document.querySelector('#fuel-type');
  // updateSelectColor(selectFuelTypeElement);

  // Select the Next and Previous buttons
  const nextButton = document.querySelector('.next-btn');
  const previousButton = document.querySelector('.prev-btn');

  // Function to scroll to the top of the page
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling
    });
  }

  // Add click event listeners to the buttons
  nextButton.addEventListener('click', scrollToTop);
  previousButton.addEventListener('click', scrollToTop);

  function centerSelectedStep() {
    // Select the currently selected step
    const selectedStep = document.querySelector('.stepper .step.selected');

    if (selectedStep) {
      // Get the .stepper container
      const stepperContainer = document.querySelector('.stepper');

      // Calculate the offset to center the selected step
      const offset = selectedStep.offsetLeft
        - (stepperContainer.clientWidth / 2)
        + (selectedStep.clientWidth / 2);

      // Scroll the container to bring the selected step to the center
      stepperContainer.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }
  }
  block.querySelectorAll('.terms_conditions_link').forEach((link) => {
    link.addEventListener('click', (e) => {
      modelUtility.openModal();
    });
  });
  // Function to close the popup
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
    const redirectUrl = homeLink;
    const url = new URL(dealerPageUrl, window.location.origin);
    window.location.href = isDealerFlow ? url.toString() : redirectUrl; // Redirect to the updated URL
  });

  // Close popup when clicking outside the popup content
  window.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });

  // analytic code
  let initFormEvent = false;
  const form = block.querySelector('.stepper-container');

  function handleUserInteraction(e) {
    if (!initFormEvent) {
      const details = {};
      details.formName = 'Book Test Drive';
      details.webName = e.target.name;
      details.linkType = 'other';
      analytics.setEnquiryStartDetails(details);
      initFormEvent = true;
    }
  }

  const formFields = form.querySelectorAll('input, select');
  formFields.forEach((field) => {
    field.addEventListener('focus', handleUserInteraction);
    field.addEventListener('change', handleUserInteraction);
  });

  const testDriveLocation = 'Showroom';
  function webAnalyticsCommonData() {
    const details = {};
    details.formName = 'Book Test Drive';
    details.webName = 'Next';
    details.linkType = 'other';
    return details;
  }

  function setVehicleData() {
    let details = {};
    const model = payload.model_name;
    // Get the selected <li> element
    const selectedFuelTypeOption = document.querySelector(".fuel-type-options .selected");
    const fuelType = selectedFuelTypeOption.textContent.trim();
    const checkedRadio = document.querySelector('input[name="transmission"]:checked');
    const label = checkedRadio.nextElementSibling;
    const transmissionType = label.textContent.trim();
    const enquiryStepName = document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();
    dataLayerObj = {
      model, fuelType, transmissionType, enquiryStepName, testDriveLocation,
    };
    analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
  }

  function setDealershipData() {
    let details = {};
    const dealerName = payload.dealer_name;
    const pincode = block.querySelector('.pin-code input').value;
    const radius = payload.dealer_distance;
    const dealerLocation = payload.dealer_address;
    const enquiryStepName = document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();
    const dealershipData = {
      ...dataLayerObj, dealerName, pincode, radius, dealerLocation, enquiryStepName, testDriveLocation,
    };
    analytics.setEnquirySubmitDetails(details, dealershipData, true);
    dataLayerObj = dealershipData;
  }

  function setDateAndTimeData() {
    let details = {};
    // Convert the date string to a Date object
    const dateObject = new Date(payload.date);
    const date = dateObject.toISOString().split('T')[0];
    const slot = payload.timeSlot?.split('-')[0]?.trim();
    let hours = '';
    if(slot?.includes('09:00')) {
      hours = ' 09:00';
    } else if(slot?.includes('12:00')) {
      hours = ' 12:00';
    } else if(slot?.includes('04:00')) {
      hours = ' 16:00';
    }
    const timeSlot = `${date}${hours}`;
    const enquiryStepName = document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();
    const dateAndTime = {
      ...dataLayerObj, date, timeSlot, enquiryStepName, testDriveLocation,
    };
    analytics.setEnquirySubmitDetails(details, dateAndTime, true);
    dataLayerObj = dateAndTime;
  }

  function setPersonalData() {
    let details = {};
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const selectState = document.getElementById('state');
    const state = selectState.options[selectState.selectedIndex].text;
    const selectCity = document.getElementById('city');
    const city = selectCity.options[selectCity.selectedIndex].text;
    const custName = `${firstName} ${lastName}`;
    const enquiryStepName = document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();
    const personalData = {
      ...dataLayerObj, custName, state, city, enquiryStepName, testDriveLocation,
    };
    analytics.setEnquirySubmitDetails(details, personalData, true);
    dataLayerObj = personalData;
  }

  function verifyOtpData() {
    const pageDetails = {};
    pageDetails.componentName = 'otp-input';
    pageDetails.componentType = 'button';
    pageDetails.webName = 'Verify OTP';
    pageDetails.linkType = 'other';
    analytics.setVerifyOtpDetails(pageDetails);
  }

  function finalFormSubmission() {
    const details = {};
    details.formName = 'Book Test Drive';
    details.webName = 'Confirm';
    details.linkType = 'other';
    delete dataLayerObj.enquiryStepName;
    dataLayerObj.testDriveLocation = testDriveLocation;
    analytics.setEnquirySubmitDetails(details, dataLayerObj, false);
  }

  authUtils.waitForAuth().then(async () => {
    if (localStorage.getItem('btdSnapshot')) {
      const data = JSON.parse(localStorage.getItem('btdSnapshot'));
      updatePayload.updateModelID(data.model_cd);
      setSelectVehicleModel();
      await modelChange(data.model_cd);
      updatePayload.updateFuelType(data.fuel_type);
      updatePayload.updateTransmissionType(data.transmission_type);
      selectDropdownOption("fuel-type", data.fuel_type);
      Array.from(block.querySelectorAll('.transmission input[name="transmission"]')).find((radio) => radio.value === data.transmission_type)?.setAttribute('checked', true);
      updatePayload.updateDealerName(data.dealer_name);
      updatePayload.updateDealerAddress(data.dealer_address);
      updatePayload.updateDealerDistance(data.dealer_distance);
      updatePayload.updateDealerCode(data.dealer_code);
      updatePayload.updateDealerForCode(data.dealer_for_code);
      updatePayload.updateLocationCode(data.location_code);
      document.querySelector('#step3 .selected-car-dealer p').textContent = data.dealer_name;
      document.querySelector('#step3 .selected-car-dealer span').textContent = data.dealer_distance;
      document.querySelector('#step3 .selected-dealer-address p').textContent = data.dealer_address;
      document.querySelector('#step4 .selected-car-dealer p').textContent = data.dealer_name;
      document.querySelector('#step4 .selected-car-dealer span').textContent = data.dealer_distance;
      document.querySelector('#step4 .selected-dealer-address p').textContent = data.dealer_address;
      document.querySelector('#step5 .selected-car-dealer p').textContent = data.dealer_name;
      document.querySelector('#step5 .selected-car-dealer span').textContent = data.dealer_distance;
      document.querySelector('#step5 .selected-dealer-address p').textContent = data.dealer_address;
      block.querySelector('#step2 .suggested-places-btd option[selected="true"]')?.removeAttribute('selected');
      block.querySelector('#step2 .suggested-places-btd').value = data.dealer_for_code;
      const dealerCity = block.querySelector(`#step2 .suggested-places-btd option[value="${data.dealer_for_code}"]`);
      dealerCity.setAttribute('selected', 'true');
      await handleDealerCityChange(data.dealer_for_code);
      Array.from(block.querySelectorAll('.dealer__card')).find((card) => card.querySelector('.dealer__code')?.textContent.trim() === data.dealer_code)?.querySelector('input[type="radio"]').setAttribute('checked', true);
      const date = new Date(data.date);
      updatePayload.updateDate(date);
      updatePayload.updateTimeSlot(data.timeSlot);
      updatePayload.updateTimePeriodSlot(data.timePeriodSlot);
      document.querySelector('#step4 .selected-date p').textContent = formatDateToString(date);
      document.querySelector('#step5 .selected-date p').textContent = formatDateToString(date);
      document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(data.timePeriodSlot, data.timeSlot);
      document.querySelector('#step5 .selected-time p').textContent = formatTimeSlot(data.timePeriodSlot, data.timeSlot);
      const targetDate = Array.from(block.querySelectorAll('.datepicker-calendar .date')).find((item) => (!item.classList.contains('faded')) && parseInt(item.textContent, 10) >= date.getDate());
      targetDate.click();
      const slot = Array.from(block.querySelectorAll('.timeslot-picker .time p')).find((item) => item.textContent.trim() === data.timePeriodSlot);
      slot?.closest('.time-slot')?.click();
      goToStep(4);
    }
    localStorage.removeItem('btdSnapshot');
    const userDetails = await authUtils.getProfile();
    if (userDetails) {
      block.querySelector('.book-td-sign-in-wrapper').style.display = 'none';
      block.querySelector('#first-name').value = userDetails.fname || '';
      block.querySelector('#last-name').value = userDetails.lname || '';
      updatePayload.updateCustFName(userDetails.fname || '');
      updatePayload.updateCustLName(userDetails.lname || '');
      const isPhoneNumberValid = `${userDetails.number || ''}`.length === 10 && /^[0-9]+$/.test(userDetails.number || '');
      if (isPhoneNumberValid) {
        sendotpBtn.style.pointerEvents = 'auto';
        sendotpBtn.style.opacity = '1';
        block.querySelector('#mobile').value = userDetails.number;
        updatePayload.updatePhoneNo(userDetails.number);
      } else {
        sendotpBtn.style.pointerEvents = 'none';
        sendotpBtn.style.opacity = '0.5';
      }
      if (localStorage.getItem('signInFlow')) {
        block.querySelector('#first-name').setAttribute('readonly', !!userDetails.fname);
        block.querySelector('#last-name').setAttribute('readonly', !!userDetails.lname);
        if (isPhoneNumberValid) {
          block.querySelector('#mobile').setAttribute('readonly', !!userDetails.number);
        }
      }
      const state = Array.from(block.querySelectorAll('#state option')).find((option) => option.textContent?.trim()?.toUpperCase() === userDetails.state?.toUpperCase());
      if (state) {
        block.querySelector('#state').value = state.value;
        state.setAttribute('selected', 'true');
        state.checked = true;
        updatePayload.updateState(state.value);
        await updateCityDropDown(state);
        const city = Array.from(block.querySelectorAll('#city option')).find((option) => option.textContent?.trim()?.toUpperCase() === userDetails.city?.toUpperCase());
        if (city) {
          block.querySelector('#city').value = city.value;
          city.setAttribute('selected', 'true');
          city.checked = true;
          updatePayload.updateCity(city.value);
        }
      }
    }
    localStorage.removeItem('signInFlow');
    block.style.visibility = 'visible';
  });

  block.querySelectorAll('.book-td-sign-in-btn,.book-td-sign-up-btn').forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.setItem('btdSnapshot', JSON.stringify(payload));
      localStorage.setItem('signInFlow', true);
      await authUtils.login();
    });
  });
}
