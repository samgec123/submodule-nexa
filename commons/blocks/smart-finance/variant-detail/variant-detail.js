import { fetchPlaceholders } from '../../../scripts/aem.js';
import utility from '../../../utility/utility.js';
import utilitysf from '../../../utility/smart-finance/utility.js';
import apiUtils from '../../../utility/apiUtils.js';
import { createDealerEnquiry, sendDealerCustomerOtp, validateDealerCustomerOtp } from '../../../utility/sfUtils.js';

export default async function decorate(block) {
  const { publishDomain, apiChannel ,sfChannelId } = await fetchPlaceholders();
  const innerDiv = block.children[0].children[0];
  const [
    pretitleEl,
    titleEl,
    modelIdEL,
    maxFeatureCountEl,
    selectVariantEl,
    journeyTypeEl,
    dealerSecUrlEl,
    loanOffUrlEl,
    userChociesUrlEl,
  ] = innerDiv.children;

  const elementsToHide = [
    pretitleEl,
    modelIdEL,
    maxFeatureCountEl,
    selectVariantEl,
    journeyTypeEl,
    dealerSecUrlEl,
    loanOffUrlEl,
    userChociesUrlEl,
  ];

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const pretitle = pretitleEl?.textContent?.trim();
  const modelId = localStorage.getItem('modelCd') ? localStorage.getItem('modelCd') : modelIdEL?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const maxFeatureCount = maxFeatureCountEl?.textContent?.trim();
  const journeyType = utilitysf.getCookie('journeyType');
  const dealerSecUrl = dealerSecUrlEl?.querySelector('a')?.href || '#';
  const loanoffurl = loanOffUrlEl?.querySelector('a')?.href || '#';
  const userChociesUrl = userChociesUrlEl?.querySelector('a')?.href || '#';
  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';
  let variants = null;
  let featureListHtml = '';
  let variantOptions = '';
  let colorList = '';
  let exShowroomPrice = null;
  let carModelName = '';
  let countdown = 120;
  let timer;
  let modelCd = null;
  const customerVerificationHtml = `<div class="popUpmain" id="customer-verification-popup">
        <div class="modal-content">
            <div>
                <div class="close" id="close-verification-popup" aria-label="Close">
                </div>
                <div class="loginBoxContainer">
                    <div class="loginSignUpBox">
                        <div class="loginLeftBox">
                            <form name="formnf" id="form_login_dealer" novalidate="novalidate">
                                <h2></h2>
                                <div class="clearfix"></div>
                                <div class="row nf-mobile-box" style="display: block;">
                                    <div class="col-sm-12">
                                        <input type="tel" maxlength="10" placeholder="Enter Your Mobile Number"  class="Mobile" name="mobile" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" tabindex="25">
                                        <div class="nf-error" style="display: none;">
                                            Enter valid mobile number
                                        </div>
                                    </div>
                                    <div class="col-sm-12 form-group">
                                        <button type="button" class="sub-btn login_dealer-submit">Continue</button>
                                    </div>
                                </div>
                                <div class="otp-finance" style="display: none;">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <p class="ph-message">
                                                An SMS verification code has been sent to: <span></span>.<br>
                                                Please enter it in the box below.
                                            </p>
                                        </div>
                                        <div class="col-sm-12">
                                            <div class="input-group-otp">
                                                <div class="inputField otpTxt" style="position: relative;">
                                                    <input class="verifyotp is-valid" data-error="Enter a valid 4 digit OTP" id="Otp" maxlength="4" name="otp" placeholder="OTP" type="text" value="" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" tabindex="26" aria-invalid="false">
                                                    <span class="resend0_dealer_login_ps" style="cursor: pointer; position: absolute; font-size: 10px; right: 10px; top: 8px; color: rgb(255, 0, 0); font-weight: bold; pointer-events: inherit;">RESEND</span>
                                                    <span class="rfiotperror" style="display: none; font-size: 10px; color: red; position: relative; text-align: left; float: left; width: 100%; top: 3px;">OTP does not match</span>
                                                    <span id="counter_login_dealer" style="font-size: 10px; position: relative; bottom: -6px; color: green; float: right; text-align: left;">
                                                        RESEND
                                                        OTP IN <strong id="count_login_customer"></strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-12">
                                            <button type="button" class="sub-btn mdl_dealer-vrfy_login">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;


  const errorMessagePopUp = `    <div class="popUpmain fade-in" id="amt_error_popup" style="display: none;">
      <div class="modal-content">
        <div class="close" id="close-amt-error-popup"></div>
        <div class="popupContent red">
            <h2><div class="icon-img "></div> Error</h2>
            <p>Something went wrong. Please try again in sometime.</p>
            <div class="btn-container">
                <div class="blackButton"><button type="button" id="close-popup-btn">Ok</button></div>
            </div>
        </div>
    </div>
</div>`;

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const storeVariantDetails = (variantCd, exShowroomPrice, forCod) => {
    const storedData = JSON.parse(localStorage.getItem('variantDetails')) || {};
    const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
    if (!storedData[variantCd]) {
      storedData[variantCd] = {
        price: {},
        timestamp,
      };
    }
    storedData[variantCd].price[forCod] = exShowroomPrice;
    storedData[variantCd].timestamp = timestamp;
    localStorage.setItem('variantDetails', JSON.stringify(storedData));
  };

  const findLowestVariantPriceFromAPiResp = (apiResponse, variantCd) => {
    const foundPrices = apiResponse.data.models[0].exShowroomDetailResponseDTOList
      .filter((variant) => variant.variantCd === variantCd)
      .map((variant) => variant.exShowroomPrice);

    return foundPrices.length === 0 ? null : Math.min(...foundPrices);
  };

  const getApiPrice = async (variantCd, modelCode) => {
    const apiPriceObj = await apiUtils.fetchExShowroomPrices(
      forCode,
      modelCode,
      'EXC',
      true,
    );
    if (apiPriceObj && Object.keys(apiPriceObj).length > 0) {
      const apiPrice = findLowestVariantPriceFromAPiResp(
        apiPriceObj,
        variantCd,
      );
      storeVariantDetails(variantCd, apiPrice, forCode);
      return apiPrice;
    }
    return null;
  };
  function backButton() {
    let currentUrl = window.location.href;
    currentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    return currentUrl;
  }
  function validatePhoneNumber() {
    const phoneNumber = block.querySelector('.Mobile').value.trim();
    const pattern = /^\d{10}$/; // Regex pattern for 10-digit phone number
    const isValid = pattern.test(phoneNumber);
    if (!isValid) {
      block.querySelector('.nf-error').style.display = 'block';
    } else {
      block.querySelector('.nf-error').style.display = 'none';
    }
    return isValid;
  }
  function updateTimer(resendOtpButton, resendOtpCounter) {
    const timerElement = block.querySelector('#count_login_customer');
    if (countdown > 0) {
      timerElement.textContent = `${countdown}`;
      countdown -= 1;
    } else {
      resendOtpButton.classList.remove('disabled');
      resendOtpButton.disabled = false;
      timerElement.textContent = '';
      resendOtpCounter.style.display = 'none';
      countdown = 120;
      clearInterval(timer);
    }
  }
  function startResendTimer(resendOtpButton, resendOtpCounter) {
    resendOtpButton.classList.add('disabled');
    resendOtpCounter.style.display = 'block';
    resendOtpButton.disabled = true;
    timer = setInterval(() => updateTimer(resendOtpButton, resendOtpCounter), 1000);
  }
  function createFeatureList(variant) {
    const features = variant.highlightFeatures;
    if (features) {
      const featureHtml = features.map((feature) => `<li>${feature}</li>`).join(' ');
      return featureHtml;
    }
    return null;
  }
  function getColorHtml(variant) {
    colorList = '';
    variant.colors.forEach((color) => {
      const colorOptionHtml = `<li class="blue"><label class="customCheckBox"><input type="radio" name="color" data-value="${color.colorId}" data-colorType="${color.colorType}" data-colorDesc="${color.eColorDesc}" data-colorCd="${color.eColorCd}" class="radio-style"><span class="cusCheckMark"></span>
                <div class="color"><span class="color-in" style="background: ${color.hexCode[0]}">${color.hexCode && color.hexCode[1] ? `<small style="background: ${color.hexCode[1]}"></small>` : ''}</span></div>
                <div class="text">${color.eColorDesc}</div>
                </label></li>`;
      colorList += colorOptionHtml;
    });
  }
  function populateVariants() {
    if (componentVariation === 'arena-variant') {
      block.parentElement.classList.add('arena-style');
    }
    variants.forEach((variant) => {
      const variantOptionHtml = `<label class="group-label" style="position:relative">
                <input type="radio" name="variant" value="${variant.variantDesc}" class="radio-style">
             <span class="custom-radio"></span>
                ${variant.variantDesc}
            </label>`;
      variantOptions += variantOptionHtml;
    });
    block.innerHTML = '';
    /* eslint no-underscore-dangle: 0 */
    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
      <link rel="preload" href="${publishDomain + (variants[0].variantImage?._dynamicUrl ?? '')}" as="image">
      <div class="container">
      <div class="content">
          <div class="variant-selection">
              <div class="header">
                <div class="title-wrapper">
                    <span class="pretitle">${pretitle}</span>
                    <div class="title">${titleEl ? titleEl.outerHTML : ''}</div>
                </div>
                  <img src="${publishDomain + (variants[0].variantImage?._dynamicUrl ?? '')}" alt="Car" class="mob-car-img" fetchpriority="high">
              </div>
              <h3>Select Variant</h3>
              <form>
                  ${variantOptions}
              </form>
          </div>
          </div>
        <div class="pageButton">
            <div class="whiteButton mr-2"><a class="back-btn" href="${backButton()}">Back</a></div>
            <div class="blackButton"><a href="${journeyType === 'dealer' ? loanoffurl : dealerSecUrl}" class="submit_variant">${journeyType === 'dealer' ? 'Proceed to Loan Offers' : 'Proceed to dealer selection'}</a></div>
        </div>
    </div>
    ${journeyType === 'dealer' ? customerVerificationHtml + errorMessagePopUp : ''}
    `),
    );
    const firstRadioButton = document.querySelector('input[name="variant"]:first-of-type');
    if (firstRadioButton) {
      firstRadioButton.parentElement.classList.add('active');
      firstRadioButton.checked = true;
    }
    if (journeyType === 'dealer') {
      let custContactNumber = null;
      const resendOtpButton = block.querySelector('.resend0_dealer_login_ps');
      const custContactPopup = block.querySelector('#customer-verification-popup');
      const otpVerificationPopup = block.querySelector('.otp-finance');
      const resendOtpCounter = block.querySelector('#counter_login_dealer');
      resendOtpButton.addEventListener('click', async () => {
        if(resendOtpCounter.style.display !=='block'){
          const dealerAuthToken = sessionStorage.getItem('mspin_token');
          const sendDealerCustomerOTPResponse =  await sendDealerCustomerOtp(custContactNumber,dealerAuthToken, sfChannelId);

          if(sendDealerCustomerOTPResponse.success){
            startResendTimer(resendOtpButton, resendOtpCounter);
          }
          else{
            // handle error scenario
            document.querySelector('#amt_error_popup p').innerText = sendDealerCustomerOTPResponse?.message;
            document.querySelector('#amt_error_popup').style.display='block';
          }
        }

      });
      block.querySelector('.submit_variant').addEventListener('click', async(e) => {
        e.preventDefault();
        block.querySelector('.row.nf-mobile-box').style.display = 'none';
        const enquiryDetails = JSON.parse(sessionStorage.getItem('enquiry_details'));
        custContactNumber = enquiryDetails?.mobile;
          const dealerAuthToken = sessionStorage.getItem('mspin_token');
          const sendDealerCustomerOTPResponse =  await sendDealerCustomerOtp(custContactNumber,dealerAuthToken, sfChannelId);
          if(sendDealerCustomerOTPResponse?.success){
            custContactPopup.classList.add('fade-in');
            custContactPopup.style.display = 'flex';
            block.querySelector('.row.nf-mobile-box').style.display = 'none';
            otpVerificationPopup.style.display = 'block';
            block.querySelector('.ph-message span').innerText = `${custContactNumber}`;
            startResendTimer(resendOtpButton, resendOtpCounter);
          }
          else{
            //handle error scenario
            document.querySelector('#amt_error_popup p').innerText = sendDealerCustomerOTPResponse?.message;
            document.querySelector('#amt_error_popup').style.display='block';
          }

      });
      block.querySelector('#close-verification-popup').addEventListener('click', () => {
        custContactPopup.classList.remove('fade-in');
        custContactPopup.style.display = 'none';
      });

      block.querySelector('.login_dealer-submit.sub-btn').addEventListener('click', async (event) => {
        if (!validatePhoneNumber()) {
          event.preventDefault();
        } else {
          custContactNumber = block.querySelector('.Mobile').value.trim();
          const dealerAuthToken = sessionStorage.getItem('mspin_token');

          const sendDealerCustomerOTPResponse =  await sendDealerCustomerOtp(custContactNumber,dealerAuthToken, sfChannelId);
          if(sendDealerCustomerOTPResponse?.success){
            block.querySelector('.row.nf-mobile-box').style.display = 'none';
            otpVerificationPopup.style.display = 'block';
            block.querySelector('.ph-message span').innerText = `${custContactNumber}`;
            startResendTimer(resendOtpButton, resendOtpCounter);
          }
          else{
            //handle error scenario
            document.querySelector('#amt_error_popup p').innerText = sendDealerCustomerOTPResponse?.message;
            document.querySelector('#amt_error_popup').style.display='block';
          }
        }
      });
      block.querySelector('.mdl_dealer-vrfy_login').addEventListener('click', async (event) => {
        event.preventDefault();
        const otpEntered = block.querySelector('.verifyotp').value;
        if (otpEntered.length === 4) {
          const dealerAuthToken = sessionStorage.getItem('mspin_token');
          const validateOTPResponse = await validateDealerCustomerOtp(custContactNumber,dealerAuthToken, otpEntered);
          if(validateOTPResponse?.success){
            sessionStorage.setItem('access_token', validateOTPResponse?.data?.access_token);
            const createEnquiryApiResponse = await createEnquiry(apiChannel);
            if (createEnquiryApiResponse.success) {
              sessionStorage.setItem('enquiryId', response?.data?.enquiry_id);
              window.location.href = userChociesUrl;
            } else {
              // handle the error scenario for api call not working
            }
          }
          else{
            //handle error scenario
            block.querySelector('.rfiotperror').textContent = validateOTPResponse?.message;
            block.querySelector('.rfiotperror').style.display = 'block';
          }
        } else {
          block.querySelector('.rfiotperror').textContent = 'Please enter 4 digit OTP'
          block.querySelector('.rfiotperror').style.display = 'block';
        }
      });
    }

    document.querySelectorAll('#close-amt-error-popup, #close-popup-btn').forEach((btn)=>{
      btn.addEventListener('click',()=>{
        document.querySelector('#amt_error_popup').style.display='none';
      });
    });
  }

  function toggleListItems() {
    const list = block.querySelector('.features ul');
    const allItems = list.querySelectorAll('li');
    const toggleButton = block.querySelector('.car-details .features a');

    const isShowingMore = allItems[maxFeatureCount].style.display === 'block';

    for (let i = Number(maxFeatureCount); i < allItems.length; i += 1) {
      allItems[i].style.display = isShowingMore ? 'none' : 'block';
    }

    toggleButton.textContent = isShowingMore ? 'Show More' : 'Show Less';
  }
  function colorChangeHandler(event) {
    const labels = block.querySelectorAll('.customCheckBox');
    labels.forEach((label) => {
      if (label.classList.contains('active')) {
        label.classList.remove('active');
      }
    });
    event.target.parentElement.classList.add('active');
    const selectedColorId = event.target.getAttribute('data-value');
    const variantSessionObj = JSON.parse(sessionStorage.getItem('variant'));
    variantSessionObj.variantColorCode = event.target.getAttribute('data-colorCd');
    variantSessionObj.variantColorDesc = event.target.getAttribute('data-colorDesc');
    variantSessionObj.variantColorType = event.target.getAttribute('data-colorType');
    sessionStorage.setItem('variant', JSON.stringify(variantSessionObj));
    const imgElement = block.querySelector('.lg-car-img');
    const mobileImageElement = block.querySelector('.mob-car-img');
    if (imgElement && mobileImageElement) {
      const [baseSrc] = imgElement.src.split('?');
      imgElement.src = baseSrc;
      mobileImageElement.src = baseSrc;
      imgElement.src += `?${selectedColorId}`;
      mobileImageElement.src += `?${selectedColorId}`;
    }
  }
  async function renderVariantDetails(variant) {
    const variantPrice = await getApiPrice(variant.variantCd, modelCd);
    const formattedPrice = utility.formatINR(variantPrice);
    const contentDiv = block.querySelector('.content');
    const carDetailDiv = contentDiv.querySelector('.car-details');
    if (carDetailDiv) {
      contentDiv.removeChild(carDetailDiv);
    }
    getColorHtml(variant);
    featureListHtml = createFeatureList(variant);
    exShowroomPrice = utility.formatIndianRupees(variant.exShowroomPrice);
    const mobileImgElement = block.querySelector('.mob-car-img');
    mobileImgElement.src = publishDomain + (variant.variantImage?._dynamicUrl ?? '');
    contentDiv.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`<div class="car-details">
              <img src="${publishDomain + (variant.variantImage?._dynamicUrl ?? '')}" alt="Car" class="lg-car-img" fetchpriority="high">
              <div class="features">
                  <h3>Top Features of ${carModelName}</h3>
                  <ul>
                      ${featureListHtml}
                  </ul>
                  <a href="javascript:void(0)" class="btn btn-link btn-more p-0">Show More</a>
              </div>
              <div class="price">
                  <h3>${variant.variantDesc}</h3>
                  <div class="price-block">
                      <p>${formattedPrice}</p>
                      <small class="price-ex-showroom">Price-Ex-Showroom</small>
                  </div>

              </div>
              <div class="selectColor flex-column">
                  <h5><strong>Select Color</strong></h5>
                  <ul class="colorSelect color_list">
                    ${colorList}
                </ul>
              </div>
          </div>
      </div>
      `),
    );
    const colorRadios = document.querySelectorAll('input[type=radio][name="color"]');
    if (colorRadios.length) {
      Array.prototype.forEach.call(colorRadios, (radio) => {
        radio.addEventListener('change', colorChangeHandler);
      });
      colorRadios[0].click();
    }
    const list = block.querySelector('.features ul');
    const allItems = list.querySelectorAll('li');

    for (let i = Number(maxFeatureCount); i < allItems.length; i += 1) {
      allItems[i].style.display = 'none';
    }
    block.querySelector('.car-details .features a').addEventListener('click', toggleListItems);
  }
  function variantChangeHandler(event) {
    const selectedValue = event.target.value;
    const variantList = event.target.closest('form').children;
    Array.prototype.forEach.call(variantList, (variant) => {
      if (variant.classList.contains('active')) {
        variant.classList.remove('active');
      }
    });
    event.target.parentElement.classList.add('active');
    variants.forEach((variant) => {
      if (selectedValue === variant.variantDesc) {
        const selectedVariant = variant;
        sessionStorage.setItem('variant', JSON.stringify({
          variant_code: variant.variant_code,
          variantDesc: variant.variantDesc,
          variantColorCode: variant.colors[0].eColorCd,
          variantColorDesc: variant.colors[0].eColorDesc,
          variantColorType: variant.colors[0].colorType,
          variantFuelType: variant.fuelType,
        }));
        renderVariantDetails(selectedVariant);
      }
    });
    return true;
  }

  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/SfVariantDetailsList;modelCd=${modelId}`;
  fetch(graphQlEndpoint, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      variants = result?.data?.carModelList?.items[0]?.variants;
      carModelName = result?.data?.carModelList?.items[0]?.modelDesc;
      const modelCode = result?.data?.carModelList?.items[0]?.model_code;
      modelCd = result?.data?.carModelList?.items[0]?.modelCd;
      sessionStorage.setItem('model', modelCode);
      populateVariants();
      const variantRadios = document.querySelectorAll('input[type=radio][name="variant"]');
      if (variantRadios) {
        Array.prototype.forEach.call(variantRadios, (radio) => {
          radio.addEventListener('change', variantChangeHandler);
        });
      }
      renderVariantDetails(variants[0]);
      sessionStorage.setItem('variant', JSON.stringify({
        variant_code: variants[0].variant_code,
        variantDesc: variants[0].variantDesc,
        variantColorCode: variants[0].colors[0].eColorCd,
        variantColorDesc: variants[0].colors[0].eColorDesc,
        variantColorType: variants[0].colors[0].colorType,
        variantFuelType: variants[0].fuelType,
      }));
    })
    .catch();
}

const createEnquiry = async (apiChannel) => {
  const variantObj = JSON.parse(sessionStorage.getItem('variant'));
  const enquiryDetails = JSON.parse(sessionStorage.getItem('enquiry_details'));
  const requestBody = {
    name: null,
    first_name: enquiryDetails.first_name,
    last_name: enquiryDetails.last_name,
    email: enquiryDetails.email,
    mobile: enquiryDetails.mobile,
    auth_mobile: enquiryDetails.mobile,
    dob: enquiryDetails.dob,
    city: sessionStorage.getItem('city_id'),
    state: sessionStorage.getItem('state_id'),
    dealer: sessionStorage.getItem('dealer_id'),
    car_model: sessionStorage.getItem('model'),
    car_variant: variantObj.variant_code,
    disclaimer_flag: 'Y',
    channel: apiChannel,
    force_create_flag: 'Y',
    existing_enquiry_id: sessionStorage.getItem('existingEnquiryId') || null,
    for_code: sessionStorage.getItem('selectedDealerForCode') || null,
    state_code: sessionStorage.getItem('selectedDealerStateCd') || null,
    color_code: variantObj.variantColorCode,
    color_description: variantObj.variantColorDesc,
    color_indicator: variantObj.variantColorType,
    mspin: sessionStorage.getItem('mspin'),
    dms_lead_id: sessionStorage.getItem('dmsLeadId'),
    fuel_type: variantObj.variantFuelType,
  };
  const response = await createDealerEnquiry(requestBody);
  return response;
};