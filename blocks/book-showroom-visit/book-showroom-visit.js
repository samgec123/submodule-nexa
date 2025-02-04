import commonApiUtils from '../../commons/utility/apiUtils.js';
import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import util from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';
import formDataUtils from '../../utility/formDataUtils.js';
import modelUtility from '../../utility/modelUtils.js';
import analytics from '../../utility/analytics.js';
import authUtils from '../../commons/utility/authUtils.js';
/* eslint-disable*/
export default async function decorate(block) {
  const currentUrl = new URL(window.location.href); // Get the current URL
  const { publishDomain,dealerPageUrl } = await fetchPlaceholders();
  const [commonEl, dateTimeEl, personalEl, overviewEl, thankYouEl, redirectLinkEl] = block.children;
  const [
    personalNameEl,
    personalTextEl,
    personalOrTextEl,
    personalSignInTextEl,
    personalSignInCtaTextEl,
    personalSignUpTextEl,
    personalSignUpCtaTextEl,
    tcTextEl,
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
    personalSignUpCtaText
  ] = [
    personalOrTextEl,
    personalSignInTextEl,
    personalSignInCtaTextEl,
    personalSignUpTextEl,
    personalSignUpCtaTextEl,
  ].map((item) => item?.textContent?.trim() || '');
  tcTextEl?.querySelectorAll('a').forEach((ele) =>ele.classList?.add('terms_conditions_link'))
  const tcText = tcTextEl?.outerHTML;

  const isRedirectedFromdealerFlow = currentUrl.searchParams.get('isDealerFlow') || false; // Get 'isDealerFlow'
  let finalTid;
  let finalRequestId;
  let finalOtp;
  let otpTid;
  let otpMobileNum;
  let dealerData;
  let slectedCarValue = ''
  if(isRedirectedFromdealerFlow) {
    const allDealers = JSON.parse(sessionStorage.getItem('allDealers')).allDealers;
    const slectedDelerIndex = parseInt(sessionStorage.getItem('slectedDelerIndex')); // Get 'isDealerFlow'
    slectedCarValue = JSON.parse(sessionStorage.getItem('dealerLocatorFilters')).showcasingValue; 
   
    if(slectedDelerIndex != null && slectedDelerIndex != undefined){
      dealerData = allDealers[slectedDelerIndex];
    }
  }

  let payLoadSrv;
  if(JSON.parse(localStorage.getItem('payLoadSrv'))) {
    payLoadSrv = JSON.parse(localStorage.getItem('payLoadSrv'));
  }

  if(JSON.parse(sessionStorage.getItem('payLoadSrv'))) {
    payLoadSrv = JSON.parse(sessionStorage.getItem('payLoadSrv'));
  }

  if(localStorage.getItem('signInFlow')) {
    block.style.visibility = 'hidden';
  }

  const payload = {
    isDealerFlow: isRedirectedFromdealerFlow,
    date: new Date(),
    date: payLoadSrv?.date ?? new Date(),
    timeSlot: payLoadSrv?.timeSlot ?? '',
    timePeriodSlot: payLoadSrv?.timePeriodSlot ?? '',
    dealer_for_code: dealerData?.forCd ?? '', // Mandatory
    dealer_name: dealerData?.name ??'',
    location_code: dealerData?.locCd ?? '', // Mandatory
    Name: payLoadSrv?.Name ?? '', // Mandatory
    Email: payLoadSrv?.Email ?? '', // Optional
    dealer_distance: dealerData?.distance ?? '',
    dealer_address: `${dealerData?.addr1} ${dealerData?.addr2} ${dealerData?.addr3}`  ?? '',
    Phone: payLoadSrv?.Phone ?? '', // Mandatory
    maruti_service_id: payLoadSrv?.maruti_service_id ?? '', // Optional
    maruti_service_name: payLoadSrv?.maruti_service_name ?? '', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    color_cd: payLoadSrv?.color_cd ?? '', // Optional
    variant_cd: payLoadSrv?.variant_cd ?? '', // Optional
    model_cd: payLoadSrv?.model_cd ?? '', // Optional
    test_drive_location: payLoadSrv?.test_drive_location ?? '', // Optional
    book_pref_btd_date: payLoadSrv?.book_pref_btd_date ?? '', // Optional
    model_name: payLoadSrv?.model_name ?? '', // Optional
    variant_name: payLoadSrv?.variant_name ?? '', // Optional
    color_name: payLoadSrv?.color_name ?? '', // Optional
    vin_number: payLoadSrv?.vin_number ?? '', // Optional
    variantslot: payLoadSrv?.variantslot ?? '-', // Optional
    test_drive_address: payLoadSrv?.test_drive_address ?? '', // Optional
    exchange_preference: payLoadSrv?.exchange_preference ?? '', // Optional
    utm_medium: payLoadSrv?.utm_medium ?? '', // Mandatory
    utm_source: payLoadSrv?.utm_source ?? '', // Mandatory
    utm_id: payLoadSrv?.utm_id ?? '', // Optional
    utm_content: payLoadSrv?.utm_content ?? '', // Optional
    utm_term: payLoadSrv?.utm_term ?? '', // Optional
    utm_campaign: payLoadSrv?.utm_campaign ?? '', // Optional
    is_client_meeting: payLoadSrv?.is_client_meeting ?? '', // Optional
    marketing_checkbox: payLoadSrv?.marketing_checkbox ?? 1, // optional possible valie us 0 or 1
    transmission_type: payLoadSrv?.transmission_type ?? '', // Optional
    house_street_area: payLoadSrv?.house_street_area ?? '', // Optional
    landmark: payLoadSrv?.landmark ?? '', // Optional
    state: payLoadSrv?.state ?? '', // Optional
    city: payLoadSrv?.city ?? '', // Optional
    pincode: payLoadSrv?.pincode ?? '', // Optional
    fuel_type: payLoadSrv?.fuel_type ?? '', // Optional // P for Petrol , C for CNG
    preferred_communication_channel: payLoadSrv?.preferred_communication_channel ?? [
      'W',
      'C',
      'S',
    ],
    cust_fname: payLoadSrv?.cust_fname ?? '',
    cust_lname: payLoadSrv?.cust_lname ?? '',
    car_image: payLoadSrv?.car_image ?? '',
    isOtpVerifiedFlag:payLoadSrv?.isOtpVerifiedFlag ?? false,
  };

  function finalPayload() {
    const finalPayload = {
      // Mandatory fields
      dealer_code: payload.dealer_code,
      dealer_for_code: payload.dealer_for_code,
      location_code: payload.location_code,
      Name: payload.Name,
      Phone: payload.Phone,
      utm_medium: payload.utm_medium,
      utm_source: payload.utm_source,
      model_cd: payload.model_cd, // Optional
      book_pref_btd_date: payload.book_pref_btd_date, // Optional
      model_name: payload.model_name, // Optional
      test_drive_address: payload.test_drive_address, // Optional
      transmission_type: payload.transmission_type, // Optional
      state: payload.state, // Optional
      city: payload.city, // Optional
      pincode: payload.pincode, // Optional
      fuel_type: payload.fuel_type, // Optional, P for Petrol, C for CNG
      maruti_service_id: 4, // Optional
      maruti_service_name: 'Book a Showroom Visit', // Optional // In case of blank maruti_service_id we need to mapping of maruti_service_name on the basis of maruti_service_id
    };

    // You can adjust payload fields here dynamically based on form values
    return finalPayload;
  }

  // Functions to update each field in the payload
  const updatePayload = {
    updateDate: (value) => { payload.date = value; },
    updateTimeSlot: (value) => { payload.timeSlot = value; },
    updateTimePeriodSlot: (value) => { payload.timePeriodSlot = value; },
    updateName: (value) => { payload.Name = value; },
    updateDealerName: (value) => { payload.dealer_name = value; },
    updateDealerDistance: (value) => { payload.dealer_distance = value; },
    updateDealerAddress: (value) => { payload.dealer_address = value; },
    updatePhoneNo: (value) => { payload.Phone = value; },
    updateCustFName: (value) => { payload.cust_fname = value; },
    updateCustLName: (value) => { payload.cust_lname = value; },
    updateCity: (value) => { payload.city = value; },
    updateState: (value) => { payload.state = value; },
    updateIsOtpVerifiedFlag:(value) => { payload.isOtpVerifiedFlag = value; },
  };

  function formatDateToString(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const day = new Date(date).getDate();
    const dayOfWeek = daysOfWeek[new Date(date).getDay()];
    const month = months[new Date(date).getMonth()];
    const year = new Date(date).getFullYear();

    // Function to determine the suffix for the day (st, nd, rd, th)
    const getDaySuffix = (dayNum) => {
      if (dayNum >= 11 && dayNum <= 13) return 'th'; // Special case for 11th, 12th, and 13th
      switch (dayNum % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${getDaySuffix(day)} ${month} ${year} | ${dayOfWeek}`;
  }

  async function getDateTimeslotForm() {
    const dateTimeslotFormHTML = `
        <div class="steper-content-row">
            <div class="steper-content-col column-1 column-hide-xs">
                <div class="timeSlot__title">
                    <h3>${detailText}</h3>
                </div>

                <div class="steper-cards">
                    <div class="book-td-card">
                        <div class="selected-car-dealer">
                            <p>${payload.dealer_name}</p>
                            <span class="distance-km">${(payload.dealer_distance/1000).toFixed(2)} kms</span>
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
                                    <span>09:00 AM - 12:00 Noon</span>
                                </div>

                            </li>
                            <li class="time-slot noon">
                                <div class="icon"></div>
                                <div class="time">
                                    <p>Afternoon</p>
                                    <span>12:00 Noon - 04:00 PM</span>
                                </div>
                            </li>
                            <li class="time-slot evening">
                                <div class="icon"></div>
                                <div class="time">
                                    <p>Evening</p>
                                    <span>04:00 PM - 08:00 PM</span>
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
                 <div class="book-td-card">
                    <div class="selected-car-dealer">
                       <p>${payload.dealer_name}</p>
                       <span class="distance-km">${(payload.dealer_distance/1000).toFixed(2)} kms</span>
                    </div>
                    <div class="selected-dealer-address">
                       <p>${payload.dealer_address}</p>
                    </div>
                    <a class="ctrl-edit-btn" id="pd-edit-address-btn"></a>
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
                             ${formDataUtils.createInputField(data.lastName, '', 'text',{ minlength: 3, maxlength: 30 })}
                          </div>
                          <div class="form-row half-width telContainer phone-verification">
                             ${formDataUtils.createInputField(data.mobile, 'mobileField', 'tel', { minlength: 10, maxlength: 10 })}
                             ${formDataUtils.createSendOtpField(data.otp, 'half-width resend-otp-container', 'resend-otp-btn', { minlength: 5, maxlength: 5 }, '')}
                                                          <div class="sendotp-container">
                                                            <span id="sendotp-btn">Send OTP</span>
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
              <div class="terms_conditions_container">
                 <div class="terms_conditions_checkbox">${tcText}</div>
              </div>
           </div>
        </div>
       `;
    return personalDetailsHTML;
  }

  async function getOverview() {
    const overviewHTML = `
    <h2 class="overview-title">${overviewName}</h2>
        <div class="steper-content-row">
            <div class="steper-content-col">
                <div class="steper-cards">
                <h4 class="overview-heading">${selectedDateTime}</h4>
                <div class="book-td-card">
                        <div class="selected-car-dealer">
                            <p>${payload.dealer_name}</p>
                            <span class="distance-km">${(payload.dealer_distance/1000).toFixed(2)} kms</span>
                        </div>
                        <div class="selected-dealer-address">
                            <p>${payload.dealer_address}</p>
                        </div>
                        <a class="ctrl-edit-btn edit-address" id="ov-edit-address-btn"></a>
                    </div>
                </div>
            </div>
            <div class="steper-content-col">
                <div class="steper-cards">
                <h4 class="overview-heading">${overviewDate}</h4>
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
                <h4 class="overview-heading">${overviewPersonal}</h4>
                    <div class="book-td-card">
                        <div class="selected-customer-detail">
                            <div class="selected-customer">
                            <span>Name:</span>
                            <p id="selected-first-name">${payload.cust_fname}</p>
                            </div>
                            <div class="selected-customer">
                            <span>Mobile no.:</span>
                            <p id="selected-phone">${payload.Phone}</p>
                            </div>
                        </div>
                        <a class="ctrl-edit-btn" id="ov-edit-personal-details"></a>
                    </div>
                </div>
            </div>
        </div>
       `;
    return overviewHTML;
  }

  let timerFlag = false;
  let timerInterval;

  const data = await formDataUtils.fetchFormData('form-data-book-test-drive');
  const stateList = await apiUtils.getStateList();

  const [titleEl, previousEl, nextEl,confirmEl,dealerTextNameEl] = commonEl.children[0].children;
  const title = titleEl;
  const previousButtonText = previousEl?.textContent?.trim();
  const nextButtonText = nextEl?.textContent?.trim();
  const confirmButtonText = confirmEl?.textContent?.trim();
  const dealerTextName = dealerTextNameEl?.textContent?.trim();


  const [dateTimeNameEl, dateTimeTextEl, detailTextEl] = dateTimeEl.children[0].children;
  const dateTimeName = dateTimeNameEl?.textContent?.trim();
  const dateTimeText = dateTimeTextEl?.textContent?.trim();
  const detailText = detailTextEl?.textContent?.trim();

  const [
    overviewNameEl,
    selectedDateTimeEl,
    overviewDateEl,
    overviewPersonalEl
  ] = overviewEl.children[0].children;

  const overviewName = overviewNameEl?.textContent?.trim();
  const selectedDateTime = selectedDateTimeEl?.textContent?.trim();
  const overviewDate = overviewDateEl?.textContent?.trim();
  const overviewPersonal = overviewPersonalEl?.textContent?.trim();
  const formattedDate = formatDateToString(payload.date);

  const dateTimeslotFormHTML = await getDateTimeslotForm();
  const personalDetailsHTML = await getPersonalDetails();
  const overviewHTML = await getOverview();

  const [thankYouTitleEl, descEl, thankyouImageEL, thankyouImageAltEl, detailsButtonEl, confirmButtonEl, confirmButtonLinkEl, confirmButtonTargetEl] = thankYouEl.children[0].children;
  const thankYouTitle = thankYouTitleEl?.textContent?.trim();
  const thankYouDesc = descEl?.textContent?.trim();
  const thankyouImage = thankyouImageEL?.querySelector('picture');
  const thankyouImageAlt = thankyouImageAltEl?.textContent?.trim();
  const detailsButton = detailsButtonEl?.textContent?.trim();
  const backHome = confirmButtonEl?.textContent?.trim();
  const backHomeTarget = confirmButtonTargetEl?.textContent?.trim();
  const backHomeLink = confirmButtonLinkEl?.textContent?.trim();

  const img1 = thankyouImage.querySelector('img');
  img1.alt = thankyouImageAlt;
  img1.removeAttribute('width');
  img1.removeAttribute('height');
  const redirectLink = redirectLinkEl?.querySelector('a');

  const formHTML = `
    <div class="container">
        <div class="bookShowroomVisit__title"><div class="bookShowroomVisit__title_back_button prev-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15.6538 21.3075L6 11.6538L15.6538 2L17.073 3.41925L8.83825 11.6538L17.073 19.8883L15.6538 21.3075Z" fill="#767879"/>
</svg>
</div>${title.outerHTML}</div>
        <div class="stepper-container">
            <div class="stepper">
                <div class="step" data-step="1"><span>1</span>${dealerTextName}</div>
                <div class="step" data-step="2"><span>2</span> ${dateTimeName}</div>
                <div class="step" data-step="3"><span>3</span> ${personalName}</div>
                <div class="step" data-step="4"><span>4</span> ${overviewName}</div>
            </div>

            <div class="content">
                <div class="step-content" id="step1">
                    <div class="dealership-step"></div>
                </div>
                <div class="step-content" id="step2">${dateTimeslotFormHTML}</div>
                <div class="step-content" id="step3">${personalDetailsHTML}</div>
                <div class="step-content" id="step4">${overviewHTML}</div>
            </div>

        <div class="controls">
            <button class='prev-btn button secondary-black-btn'>${previousButtonText}</button>
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
            <a href="#" target="_self">
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
            <p class="btd-popup-title">${thankYouTitle}</p>
            <p class="btd-popup-subtitle">${thankYouDesc}</p>
            <div class="btn-container">
                    <a href=${backHomeLink} target=${backHomeTarget} class="button button-primary-blue">${backHome}</a>
                    <a class="button button-primary-blue">${detailsButton}</a>
                    </div>
                </div>
                <div class="right-section popup-car-image">${img1.outerHTML}</div>
            </div>
        </div>
    </div>
  `;

  // Move to the next step
  function nextStep() {
    if (currentStep < steps.length) {
      currentStep += 1;
      prevButton.disabled = false; // Enable the button
      prevButton.style.opacity = '1'; // Reset opacity
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 4) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = 'Next';
      }
      updateSteps();
      toggleNextButton(currentStep);
    }
    else if (currentStep === steps.length) { // Last step, create payload
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
    const selectedDate = block.querySelector('.selected-date p')?.textContent;
    const dealerName = block.querySelector('.selected-car-dealer p')?.textContent || "Nexa Competent Automobiles Co-operation Limited";
    const date = `${selectedDate.split(' ')[0]} ${selectedDate.split(' ')[1].substring(0, 3)}`;
    const year = new Date(payload.date).getFullYear();
    const replacements = [dealerName, date, year];
    const updatedText = updateWithDifferentContent(oldText, '{', '}', replacements);
    block.querySelector('.btd-popup-subtitle').textContent = updatedText;
  }

  // Get elements
  const popup = document.getElementById('btd-confirmation-popup');

  // Define async function for API submission
  async function submitFormAfterFinalPayload() {
    const finalPayloadforAPI = finalPayload();
    try {
      const isSuccess = await commonApiUtils.submitBTDForm(finalPayloadforAPI, finalTid, finalRequestId, finalOtp);
      if (isSuccess.status === 200) {
        updateTyPageText();
        document.body.style.overflow = 'hidden'
        document.getElementById('btd-confirmation-popup').style.display = 'flex';
        document.getElementById('btd-confirmation-popup').classList.remove('hidden');
      } else if(isSuccess.status === 400) {
        isOtpVerified = false;
        document.getElementById('mobile').disabled = true;
        document.getElementById('mobile').removeAttribute('style');
        mobileField.classList.remove('valid');
        document.querySelector('.otp-container').style.display = 'none';
        hideAndShowEl(resendOtpContainer, 'block');
        otpDigits.forEach((digit) =>  {
          digit.classList.remove('green')
          digit.disabled = false;
          digit.value = '';
        });
        clearInterval(timerInterval);
        timerInterval = null;
        updatePayload.updateIsOtpVerifiedFlag(false);
        const resendOtpBtn = document.getElementById('resend-otp-btn');
        resendOtpBtn.textContent = resendOtpText.trim();
        resendOtpBtn.style.pointerEvents = 'none';
        if(await sendotp()) {
          startTimer();
        }
        toggleNextButton(3);
        previousStep();
      }
    } catch (error) {
      console.error('Error during API submission:', error);
    }
  }

   // DATALAYER stepSubmitEnquiry
   let dataLayerObj = {};

   function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th'; // Special case for days between 4 and 20
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }


  function webAnalyticsCommonData() {
    const details = {};
    details.formName = 'Book Showroom Visit';
    details.webName = 'Next';
    details.linkType = 'other';
    return details;
  }

   function setDateTimeData() {
    let details={};
    
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
    const radius = (payload.dealer_distance/1000).toFixed(2)+"km";
    const dealerName = block.querySelector('.selected-car-dealer p')?.textContent;
    const dealerLocation = payload.dealer_address;
    const enquiryStepName = document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();
   
    const dateAndTime = { ...dataLayerObj, date, timeSlot,dealerName,dealerLocation,radius,enquiryStepName};
    analytics.setEnquirySubmitDetails(details, dateAndTime, true);
    dataLayerObj = dateAndTime;
  }

  function setPersonalData() {
    let details = {};
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const selectState = document.getElementById('state');
    const state = selectState.options[selectState.selectedIndex].text;
    const selectCity = document.getElementById('state');
    const city = selectCity.options[selectCity.selectedIndex].text;
    //const mobile = document.getElementById('mobile').value;
    const custName = `${firstName.trim()} ${lastName.trim()}`;
    const enquiryStepName= document.querySelector('.stepper .step.selected')?.textContent.substring(2);
    details = webAnalyticsCommonData();

    const personalData = {
      ...dataLayerObj, custName, state, city,enquiryStepName
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
    details.formName = 'Book Showroom Visit';
    details.webName = confirmButtonText;
    details.linkType = 'other';
    delete dataLayerObj.enquiryStepName;
    analytics.setEnquirySubmitDetails(details, dataLayerObj, false);
  }  
  
  function dataLayerOnNextClick(currentStep) {
    if (currentStep === 2) {
      setDateTimeData();
    }
    else if (currentStep === 3) {
      setPersonalData();
    }
    else if (currentStep === 4) {
      finalFormSubmission();
    }
  }


  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(formHTML));
  let currentStep = 2;
  document.querySelectorAll('.next-btn').forEach((button) => {
    button.addEventListener('click', () => {
      dataLayerOnNextClick(currentStep);
      if (currentStep === 3) {
        // Get the values for first name, last name, selected city, and selected state
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const selectedState = document.getElementById('state').value;
        const selectedCity = document.getElementById('city').value;
        const fullName = `${firstName} ${lastName}`;
        updatePayload.updateCustFName(firstName);
        updatePayload.updateCustLName(lastName);
        updatePayload.updateState(selectedState);
        updatePayload.updateCity(selectedCity);
        updatePayload.updateName(fullName);
        document.querySelector('#selected-first-name').textContent = fullName;
        document.querySelector('#selected-phone').textContent = (payload.Phone).replace(/(\d{5})(?=\d)/g, '$1 ');;

        nextStep();
      } else {
        nextStep();
      }
    });
  });

  // Move to the previous step
  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;
      const nextButton = document.getElementById('nextButton');
      if (currentStep === 4) {
        nextButton.textContent = confirmButtonText;
      } else {
        nextButton.textContent = 'Next';
      }
      if(payload.isDealerFlow && currentStep === 1){
        const url = new URL(redirectLink,window.location.origin);
        url.searchParams.set('lastFlow', 'srv');
        window.location.href = url.toString(); // Redirect to the updated URL
        sessionStorage.setItem('isBsvFlowStep', '2');
        sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
      }else{
       updateSteps();
       toggleNextButton(currentStep);
      }
     } else {
       prevButton.disabled = true; // Disable the button
       prevButton.style.opacity = '0.5'; // Optional: visually indicate that it's disabled
     }
   }
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
      if(selectedValue == 'Privacy Policy') {
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
      document.body.style.overflow='hidden';
    })
  })

  document.querySelectorAll('.prev-btn').forEach((button) => {
    button.addEventListener('click', () => previousStep());
  });

  async function getToken() {
    if (window.authToken && window.tokenExpiration > Date.now()) {
      return window.authToken;
    }
    const authUrl = `${publishDomain}${AUTH_URL}`;

    try {
      const authResponse = await fetch(authUrl);
      if (!authResponse.ok) {
        throw new Error(`Failed to fetch authorization: ${authResponse.statusText}`);
      }
      window.authToken = await authResponse.text();
      window.tokenExpiration = Date.now() + TOKEN_EXPIRATION_TIME;
      return window.authToken;
    } catch (e) {
      throw new Error('Error fetching authorization:', e);
    }
  }

  const steps = document.querySelectorAll('.step');
  // if(payload.isDealerFlow){
  //   steps[0].classList.add('disabled');
  // }else{
  //   steps[0].classList.remove('disabled');
  // }
  const contents = document.querySelectorAll('.step-content');

  function getSelectedLocationStorage() {
    return util.getLocalStorage('selected-location');
  }
  document.addEventListener('updateLocation', async () => {
    await selectState();
    selectCity();
  });

  // Function to toggle the "Next" button state
  function toggleNextButton(stepNumber) {
    const nextButton = document.getElementById('nextButton');
    nextButton.disabled = !validateStepFields(stepNumber);
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

  if(payload.isDealerFlow){
    document.getElementById('first-name').value = payload.cust_fname;
    document.getElementById('last-name').value = payload.cust_lname;
    document.getElementById('mobile').value = payload.Phone;
    document.querySelector('#selected-first-name').value = payload.cust_fname + ' ' + payload.cust_lname;
    document.querySelector('#selected-phone').value = payload.Phone;
    document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
    document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(payload.timePeriodSlot, payload.timeSlot);
    document.querySelector('#step3 .selected-date p').textContent = formatDateToString(new Date(payload.date));
    document.querySelector('#step4 .selected-date p').textContent = formatDateToString(new Date(payload.date));
    if (sessionStorage.getItem('isBsvFlowStep') > 1) {
      goToStep(parseInt(sessionStorage.getItem('isBsvFlowStep')));
      currentStep = parseInt(sessionStorage.getItem('isBsvFlowStep'))
      if (parseInt(sessionStorage.getItem('isBsvFlowStep')) === 4) {
        const nextButton = document.getElementById('nextButton');
        nextButton.textContent = confirmButtonText;
      }
    }
  }
  const prevButton = document.querySelector('.prev-btn');
  // prevButton.disabled = true; // Disable the button
  // prevButton.style.opacity = '1'; // Optional: visually indicate that it's disabled

  // Initialize stepper on page load
  setTimeout(() => {
    updateSteps();
  }, 0);

  // js for step 3 : Select Date And Time

  const datesContainer = document.querySelector('.datepicker-calendar');
  const dateDisplay = document.querySelector('.pre-date');
  const monthDisplay = document.querySelector('.month');
  const timeSlots = document.querySelectorAll('.time-slot');
  // Set today's date (November 2, 2024   2024, 10, 2)
  let today = new Date();
    // today.setHours(23, 58, 59, 999);
  // today.setHours(21, 0, 0, 0); // Example: set to 9 PM for testing

  let now = new Date();
  // Calculate the time remaining until the next midnight
  if (today.getHours() >= 20) {
    // Set the target time to midnight (12 AM) of the current day
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

    // Calculate the time remaining until midnight in milliseconds
    const msUntilMidnight = midnight - today;

    // Convert milliseconds to hours (for console logging only)
    // const hoursUntilMidnight = msUntilMidnight / (1000 * 60 * 60);

    // Set `today` to tomorrow's date at 12 AM
    today.setDate(today.getDate() + 1); // Move `today` to the next day
    // today.setHours(0, 0, 0, 0);          // Set the time to midnight
    document.querySelector('#step3 .selected-date p').textContent = formatDateToString(today);
    document.querySelector('#step4 .selected-date p').textContent = formatDateToString(today);

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

    // now.setHours(21, 0, 0, 0);
    const slotTimes = [
      { label: 'Morning', start: '09:00', end: '12:00' },
      { label: 'Afternoon', start: '12:00', end: '16:00' },
      { label: 'Evening', start: '16:00', end: '20:00' },
    ];
    // if (isToday(selectedDate)) {
    timeSlots.forEach((slot, index) => {
      const { start, end } = slotTimes[index];

      // Convert start and end times to Date objects on today's date for comparison
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);

      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        startMinute,
      );

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
          toggleNextButton(2);
          document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
          document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(timePeriodSlot, timePeriod);
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
      if (activeSlot && activeSlot.classList.contains('disabled')) {
        activeSlot.classList.remove('active');
      }

      // Set active class on the first non-disabled slot
      const firstNonDisabledSlot = Array.from(timeSlots).find((slot) => !slot.classList.contains('disabled'));
      if (firstNonDisabledSlot) {
        firstNonDisabledSlot.classList.add('active');
      }


      if(payload.timePeriodSlot){
        if(slot.querySelector('.time p')?.textContent == payload.timePeriodSlot){
          document.querySelector('.time-slot.active')?.classList.remove('active');
          slot.classList.add('active');
       }
      }else {
        if (firstNonDisabledSlot) {
          firstNonDisabledSlot.classList.add('active');
        }
      }
    });

    if(!payload.timePeriodSlot) {
    // Check if all slots are disabled and update selectedDateTimeSlot if needed
    const allDisabled = Array.from(timeSlots).every((slot) => slot.classList.contains('disabled'));
    if (allDisabled) {
      updatePayload.updateTimeSlot('');
      updatePayload.updateTimePeriodSlot('');
      // Toggle the "Next" button for step 3
      toggleNextButton(2);
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
        toggleNextButton(2);
        document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
        document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
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
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const day = new Date(date).getDate();
      const suffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      return date.toLocaleString('en-US', options).replace(/(\d+)(?=th|st|nd|rd)/, (match) => match + suffix(match));
    }

    function formatPreDate(date) {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
  
      const day = new Date(date).getDate();
      const dayOfWeek = daysOfWeek[new Date(date).getDay()];
      const month = months[new Date(date).getMonth()];
  
      // Function to determine the suffix for the day (st, nd, rd, th)
      const getDaySuffix = (dayNum) => {
        if (dayNum >= 11 && dayNum <= 13) return 'th'; // Special case for 11th, 12th, and 13th
        switch (dayNum % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
  
      return `${dayOfWeek}, ${day}${getDaySuffix(day)} ${month}`;
    }
  

    // Start populating dates
    for (let i = 0; i < totalDays + offset; i += 1) {
      const dateElement = document.createElement('span');
      const date = new Date(adjustedStartDate);
      date.setDate(adjustedStartDate.getDate() + i);

      dateElement.classList.add('date');
      dateElement.textContent = date.getDate();

      // Highlight today's date
      if(payload.date != "Invalid Date"){
        if(new Date(today).getDate() == date.getDate() && new Date(payload.date).getMonth() == date.getMonth() && new Date(payload.date).getFullYear() == date.getFullYear()){
          dateElement.classList.add('current-day');
          currentSelectedElement = dateElement;
          dateDisplay.textContent = formatPreDate(payload.date);
        }
      } else{
      if (i === offset) {
        dateElement.classList.add('current-day');
        currentSelectedElement = dateElement;
        // Update the pre-date display with today's date format
        dateDisplay.textContent = formatPreDate(today);
      }
      }

      // Check if the date is either in the past or beyond the last selectable date
      if (date < today || date > lastDate) {
        dateElement.classList.add('faded');
      }

      dateElement.addEventListener('click', () => {
        if (!dateElement.classList.contains('faded')) {
          updatePayload.updateDate(date);
          // Toggle the "Next" button for step 3
          toggleNextButton(2);
          document.querySelector('#step4 .selected-date p').textContent = formatDateToString(date);
          document.querySelector('#step3 .selected-date p').textContent = formatDateToString(date);

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
              toggleNextButton(2);
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
                toggleNextButton(2);
                document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
                document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
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
              toggleNextButton(2);
              document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
              document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(selectedTimePeriodSlot, selectedTime);
            }
          }

          // Update the pre-date display with the selected date format
          dateDisplay.textContent = formatPreDate(date);
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

  // js for step 3 ends

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

  document.getElementById('edit-datetime-btn').addEventListener('click', () => {
    goToStep(2);
  });

  document.getElementById('ov-edit-datetime-btn').addEventListener('click', () => {
    goToStep(2);
  });

  document.getElementById('ov-edit-personal-details').addEventListener('click', () => {
    goToStep(3);
  });

  document.getElementById('edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink,window.location.origin);
      url.searchParams.set('lastFlow', 'srv');
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '2');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
    } else {
      goToStep(1);
    }
  });

  document.getElementById('pd-edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink,window.location.origin);
      url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '3');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
    } else {
    goToStep(1);
    }
  });

  document.getElementById('ov-edit-address-btn').addEventListener('click', () => {
    if (payload.isDealerFlow) {
      const url = new URL(redirectLink,window.location.origin);
      url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
      window.location.href = url.toString(); // Redirect to the updated URL
      sessionStorage.setItem('isBsvFlowStep', '4');
      sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
    } else {
    goToStep(1);
    }
  });

  function formatTimePart(part) {
    if (!part) return ''; // If part is undefined or empty, return an empty string
    return part
      .split(' ')
      .map(word => {
        if (word.toLowerCase() === 'noon') {
          // Capitalize only the first letter of "noon"
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toUpperCase(); // Convert other words to uppercase
      })
      .join(' ');
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

    const startTime = timeParts[0]
    ? timeParts[0].toLowerCase().includes("noon")
      ? formatTimePart(timeParts[0])
      : timeParts[0].toUpperCase()
    : "";

  const endTime = timeParts[1]
    ? timeParts[1].toLowerCase().includes("noon")
      ? formatTimePart(timeParts[1])
      : timeParts[1].toUpperCase()
    : "";

    // Return the formatted string
    return `${timePeriodSlot} (${startTime} to ${endTime})`;
  }

  document.querySelectorAll('.step').forEach((step) => {
    step.addEventListener('click', () => {
      // Get the step number from the `data-step` attribute
      const stepNumber = parseInt(step.getAttribute('data-step'), 10);

      // Check if the clicked step has the 'completed' class
      if (step.classList.contains('completed')) {
        if(payload.isDealerFlow){
          if(stepNumber == 1){
            const url = new URL(redirectLink,window.location.origin);
            url.searchParams.set('lastFlow', 'srv'); // Add or update query parameter
            window.location.href = url.toString(); // Redirect to the updated URL
            sessionStorage.setItem('isBsvFlowStep', '2');
            sessionStorage.setItem('payLoadSrv', JSON.stringify(payload));
          }else{
            goToStep(stepNumber);
          }
        }else{
           goToStep(stepNumber);
        }
      }
    });
  });

  // Step 4 Personal Details JS
  const resendOtpContainer = block.querySelector('.resend-otp-container');
  const sendotpContainer = block.querySelector('.sendotp-container');
  const resendotpBtn = block.querySelector('#resend-otp-btn');
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

  let isCitySelected = false;
  let cityDropdown;
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
    // if (target.id === 'state') {
    //   cityDropdown = block.querySelector('.dropdown-city-user');
    //   if (cityDropdown) {
    //     const cityList = await apiUtils.getFormattedDealerCityList(target.value, 'EXC');
    //     //const cityList = await apiUtils.getCityList(target.value);
    //     updateDropdown(cityDropdown, cityList);
    //   }
    // } else if (target.id === 'dealer-state') {
    //   cityDropdown = block.querySelector('#dealer-city');
    //   if (cityDropdown) {
    //     await updateCityDropDown();
    //     const selectDealerCityElement = document.querySelector('#dealer-city');
    //     selectDealerCityElement.style.color = '#000';
    //   }
    // }
    if(payload.city){
      cityDropdown.value = payload.city;
    }
  };

  const handleStateChange = async (event) => {
    updatePayload.updateState(event.target.value);
    updatePayload.updateCity('');
    await updateCityDropDown(event.target);
    toggleNextButton(3);
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
      if(payload.state && Object.keys(payload.state).length !== 0){
        stateCd = payload.state;
      }else{
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
    if(payload.city && payload.state){
      const selectedStateText = document.getElementById('state').options[document.getElementById('state').selectedIndex].text;
      const selectedCityText = document.getElementById('city').options[document.getElementById('city').selectedIndex].text;
      const cityStateCombined = `${selectedCityText}, ${selectedStateText}`;
      document.querySelector('#step5 .customer-location').textContent = cityStateCombined;
    }
  }
  initializeLocationSelection();

  const startTimer = () => {
    timerFlag = true;
    let remainingTime = 90;
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
    if(mobileNumber !== otpMobileNum) {
      otpTid = null;
    }
    otpMobileNum = mobileNumber;
    try {
      const response = await commonApiUtils.sendOtpRequest(mobileNumber, otpTid);
      if (!response.ok) {
        const details = {};
        details.formName = 'Book Showroom Visit';
        details.errorType = 'API Error';
        details.errorCode = response.status.toString();
        details.errorDetails = 'Failed to send OTP';
        details.webName = 'Input'; // should be aria-label
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
  let isOtpVerified = false;
  if(payLoadSrv && payLoadSrv.isOtpVerifiedFlag){
    const formField = document.querySelector('.form-input.mobileField.form-field');
if(formField){
formField.classList.add('valid');
hideAndShowEl(sendotpBtn, 'none');
}
  }
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
        updatePayload.updateIsOtpVerifiedFlag(true);
        verifyOtpData();
        otpDigits.forEach((digit) => {
          document.getElementById('mobile').style.color = '#727374';
          digit.classList.add('green');
          digit.disabled = true;
          timerFlag = true;
          clearInterval(timerInterval);
          timerInterval = null;
          mobileField.classList.add('valid');
          document.querySelector('.otp-container').style.display = 'none';
        });
        toggleNextButton(3);
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
      otpValidation.textContent = 'OTP is required';
      hideAndShowEl(otpValidation, 'block');
      isOtpVerified = false;
      updatePayload.updateIsOtpVerifiedFlag(false);
      // Change the text message

      otpDigits.forEach((digit) => digit.classList.remove('green'));
      toggleNextButton(3);
    }
  };

  const verifyOtpApi = async (otp) => {
    try {
      const response = await commonApiUtils.otpValidationRequest(otp, requestId, mobileNumber, otpTid);
      if (response.ok) {
        const result = await response.json();
        if (result.data.status === 'OTP_VERIFIED' && result.data.tId) {
          finalOtp = otp;
          finalRequestId = requestId;
          finalTid = result.data.tId;
          return true;
        }
        const details = {};
        details.formName = '';
        details.errorType = 'API Error';
        details.errorCode = response.status.toString();
        details.errorDetails = 'Failed to verify OTP';
        details.webName = 'Input'; // should be aria-label
        details.linkType = 'other';
        analytics.setWebError(details);
        return false;
      }
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
      if(!(await sendotp())) {
        return;
      }
      startTimer();
      hideAndShowEl(sendotpContainer, 'none');
      hideAndShowEl(resendOtpContainer, 'block');
       // Focus on the first OTP digit and disable the others
      const otpInputs = document.querySelectorAll('.otp-digit');
      otpInputs.forEach((input, index) => {
        input.value = ''; // Clear any previous values
        input.disabled = index !== 0; // Disable all except the first
      });
      otpInputs[0].focus(); // Focus on the first input
      // Add event listeners to enable the next input when the current one is filled
      otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
          if (input.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].disabled = false; // Enable the next input
            otpInputs[index + 1].focus(); // Focus on the next input
          }
        });
      });
    } catch {
      console.error('Error Sending OTP:', error);
    }
  });

  document.getElementById('resend-otp-btn').addEventListener('click', async () => {
    try {
      if (timerFlag) {
        return;
      }
      if(await sendotp()) {
        startTimer();
      }
    } catch (error) {
      console.error('Error Sending OTP:', error);
    }
  });

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

  document.getElementById('sendotp-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value;
    updatePayload.updatePhoneNo(mobile);
    //    document.querySelector('#step5 .customer-mobile-no').textContent = mobile;
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
    validateAlphabetInput(event)
    toggleNextButton(3);   
  });

  const lastNameInput = document.getElementById('last-name');
  lastNameInput.addEventListener('input', (event) => {
    validateAlphabetInput(event)
    toggleNextButton(3);
  });

  const mobileNo = document.getElementById('mobile');
  mobileNo.addEventListener('input', (event) => {
    const input = event.target;
    // Replace any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    toggleNextButton(3);
  });
  //  const sendotpBtn = document.getElementById('sendotp-btn');

  // Initially, make the span non-clickable
  sendotpBtn.style.pointerEvents = 'none';
  sendotpBtn.style.opacity = '0.5'; // Optional: visually indicate that it's disabled

  // Function to validate required fields for the current step
  function validateStepFields(stepNumber) {
    let isValid = true;

    switch (stepNumber) {
      case 2: {
        if (!payload.date || !payload.timeSlot) {
          isValid = false;
        }
        break;
      }
      case 3: {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const phoneNumber = document.getElementById('mobile').value;
        if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
          sendotpBtn.style.pointerEvents = 'auto'; // Enable clicking
          sendotpBtn.style.opacity = '1'; // Reset opacity
        } else {
          sendotpBtn.style.pointerEvents = 'none';
          sendotpBtn.style.opacity = '0.5';
        }

        if (!firstName || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || !payload.state ||  !payload.isOtpVerifiedFlag) {
          isValid = false;
        }
        break;
      }
      default:
        break;
    }

    return isValid;
  }

  // Initial call to set the button state for the first step
  toggleNextButton(2);

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
    const isMobile = window.innerWidth <= 768;

    if (selectedStep) {
      const stepperContainer = document.querySelector('.stepper');
      if (isMobile && selectedStep === steps[steps.length - 1]) {
        steps.forEach((step, index) => {
            if (index !== steps.length - 1) {
                step.style.display = 'none';
            }
        });
        selectedStep.classList.add('selected');
      } else {

        steps.forEach((step) => {
            step.style.display = 'flex';
        });
        const offset = selectedStep.offsetLeft
        - (stepperContainer.clientWidth / 2)
        + (selectedStep.clientWidth / 2);

        stepperContainer.scrollTo({
          left: offset,
          behavior: 'smooth',
        });
      }
    }
  }
  
  
  // DATALAYER startEnquiry
  let initFormDataLayerEvent = false;
  const sendEnquiryStartEvent = (e) => {
    if (!initFormDataLayerEvent) {
      const details = {};
      details.formName = 'Book Showroom Visit';
      details.webName = e.target.name || (e.target.closest('.time-slot') ? 'time-slot' : '') || (e.target.closest('.date') ? 'date' : '');
      details.linkType = 'other';
      analytics.setEnquiryStartDetails(details);
      initFormDataLayerEvent = true;
    }
  };

  function initFormDataLayer() {
    const form = block.querySelector('.content');
    form.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('focus', sendEnquiryStartEvent);
      field.addEventListener('change', sendEnquiryStartEvent);
    });
    form.querySelectorAll('.datepicker-calendar').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
    form.querySelectorAll('.time-slot').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
  }

  authUtils.waitForAuth().then(async () => {
    if(localStorage.getItem('payLoadSrv')) {
      const data = JSON.parse(localStorage.getItem('payLoadSrv'));
      const date = new Date(data.date);
      document.querySelector('#step3 .selected-date p').textContent = formatDateToString(date);
      document.querySelector('#step4 .selected-date p').textContent = formatDateToString(date);
      document.querySelector('#step3 .selected-time p').textContent = formatTimeSlot(data.timePeriodSlot, data.timeSlot);
      document.querySelector('#step4 .selected-time p').textContent = formatTimeSlot(data.timePeriodSlot, data.timeSlot);
      goToStep(3);
    }
    localStorage.removeItem('payLoadSrv');
    const userDetails = await authUtils.getProfile();
    if(userDetails) {
      document.querySelector('#selected-first-name').value = userDetails.fname || '' + ' ' + userDetails.lname || '';
      document.querySelector('#selected-phone').value = userDetails.number || '';
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
      if(localStorage.getItem('signInFlow')) {
        block.querySelector('#first-name').setAttribute('readonly', userDetails.fname ? true : false);
        block.querySelector('#last-name').setAttribute('readonly', userDetails.lname ? true : false);
        if (isPhoneNumberValid) {
          block.querySelector('#mobile').setAttribute('readonly', userDetails.number ? true : false);
        }
      }
      const state = Array.from(block.querySelectorAll('#state option')).find((option) => option.textContent?.trim()?.toUpperCase() === userDetails.state?.toUpperCase()); 
      if(state) {
        block.querySelector('#state').value = state.value;
        state.setAttribute('selected', 'true');
        state.checked = true;
        updatePayload.updateState(state.value);
        await updateCityDropDown(state);
        const city = Array.from(block.querySelectorAll('#city option')).find((option) => option.textContent?.trim()?.toUpperCase() === userDetails.city?.toUpperCase());
        if(city) {
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
      localStorage.setItem('payLoadSrv', JSON.stringify(payload));
      localStorage.setItem('signInFlow', true);
      await authUtils.login();
    });
  });

  initFormDataLayer();



  // Close popup when clicking outside the popup content
  window.addEventListener('click', (event) => {
    if (event.target.closest('.btd-popup-close')) {
      // Find the parent popup element
      const popup = event.target.closest('.btd-confirmation-popup');
      if (popup) {
        popup.style.display = 'none'; // Close the popup
        document.body.style.overflow = 'auto';
        const url = new URL(dealerPageUrl, window.location.origin);
        window.location.href = url.toString(); // Redirect to the updated URL
        // window.reload();
      }
    }
  });



}
/* eslint-enable */
