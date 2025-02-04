/* eslint-disable import/no-unresolved */
import { html } from '../../vendor/htm-preact.js';
import {
  useContext,
  useEffect,
  useState,
} from '../../vendor/preact-hooks.js';
import {
  hnodeAs,
  MultiStepFormContext,
  getCleanSessionData,
} from '../multi-step-form.js';
import {
  updateEbookUserSession,
  handlePaymentRequest,
  handleButtonClick,
  formatRupeesWithSymbol,
} from '../../../utility/apiUtils.js';
import { loadCSS } from '../../aem.js';
import EbookStep from '../ebook-steps.js';
import BookingStep from '../booking-step.js';
import environmentSelection from '../../../utility/domainUtils.js';
import {
  getLocalStorage,
} from '../../../utility/localStorage.js';
import utility from '../../../utility/utility.js';
import analytics from '../../../../utility/analytics.js';

function Summary({ config }) {
  loadCSS(
    `${window.hlx.commonsCodeBasePath}/scripts/ebook/summary/summary.css`,
  );
  const {
    stepTitle,
    vehicleTitle,
    dealerTitle,
    viewDetailText,
    colorText,
    exshowroomText,
    navigateText,
    customerTitle,
    agreeText,
    termsConditionsText,
    agreeThatText,
    agreeMoreText,
    namePlaceholderText,
    mobilePlaceholderText,
    emailPlaceholderText,
    addressPlaceholderText,
    paymentSuccessURL,
  } = config;

  const {
    formState,
    updateFormState,
    handleSetActiveRoute,
    getUserSessionApi,
    placeholders,
  } = useContext(MultiStepFormContext);

  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [termsConditionsAccepted, setTermsConditionsAccepted] = useState(false);
  const [selectedCar, setSelectedCar] = useState({});
  const [selectedDealer, setSelectedDealer] = useState({});
  const [channel, setChannel] = useState('');
  const [address2, setAddress2] = useState('');
  const [imgContainerWidth, setImgContainerWidth] = useState(360);

  const ebookVehicleDetils = JSON.parse(getLocalStorage('ebookVehicleDetils'));
  const selectedVariantName = ebookVehicleDetils?.variantName || 'N/A';
  const selectedTransmission = ebookVehicleDetils?.transmission || 'N/A';

  let fieldErrors = false;
  if ((Boolean(nameError)
    || Boolean(emailError)
    || Boolean(phoneError)
    || Boolean(addressError)
    || Boolean(!agreementAccepted)
    || Boolean(!termsConditionsAccepted))) {
    fieldErrors = true;
  }
  let fieldEmptyCheck = true;
  if (name && email && phoneNumber && address) {
    fieldEmptyCheck = false;
  }
  const errorsObjNew = {
    fieldErrors,
    fieldEmptyCheck,
  };
  async function analyticsFormStepSubmit() {
    const localGetSessionApiData = JSON.parse(
      sessionStorage.getItem('ebookPostState'),

    );

    const details = {};
    details.customerDetails = {
      email: localGetSessionApiData?.sessionInfo?.userProfile?.email,
    };
    details.formName = 'E-Book';
    details.webName = 'Proceed to Pay';
    details.linkType = 'other';
    details.userInfo = {
      authenticatedState: 'authenticated',
    };
    if (localGetSessionApiData?.SESSION_INFO?.userProfile?.phoneNumber) {
      details.identities = {
        // eslint-disable-next-line max-len
        hashedphoneSHA256: await utility.getSHA256Hash(localGetSessionApiData?.SESSION_INFO?.userProfile?.phoneNumber),
      };
    }
    const dataLayerObj = {
      enquiryStepName: 'Booking Summary',
      custName: localGetSessionApiData?.sessionInfo?.userProfile?.name || '',
      model: localGetSessionApiData?.sessionInfo?.selectedCar.modelDesc || '',
      variant: localGetSessionApiData?.sessionInfo?.selectedCar.variantDesc || '',
      color: localGetSessionApiData?.sessionInfo?.selectedCar.cmsColorDesc || '',
      dealer: localGetSessionApiData?.sessionInfo?.selectedDealer.name || '',
      radius: localGetSessionApiData?.sessionInfo?.userDealerPreference.radius || '',
      fuelType: localGetSessionApiData?.sessionInfo?.selectedCar?.fuelType || '',
      bookingAmount: localGetSessionApiData?.sessionInfo?.selectedCar.bookingAmount,
      bookingId: localGetSessionApiData?.sessionInfo?.webReferenceId || '',
    };
    analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
  }
  const getUserSession = async () => {
    if (!document.querySelector('body').classList.contains('session-stored')) {
      await getUserSessionApi();
      document.querySelector('body').classList.add('session-stored');
    }
  };

  /* set screen size */
  useEffect(() => {
    utility?.checkCurrentStep(2);
    window.scrollTo(0, 0);
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* find channel is arena or nexa */
  function findChannel() {
    const isNexa = document
      .querySelector('.ebook-journey')
      .classList.contains('arena');
    if (isNexa) {
      setChannel('arena');
    } else {
      setChannel('nexa');
    }
  }

  /* set image width on load */
  function setImageWidth() {
    const imageContainer = document.querySelector('#summary-vehicle-image').offsetWidth;
    if (imageContainer > 0 && imageContainer >= 360) {
      setImgContainerWidth(imageContainer);
    } else {
      setImgContainerWidth(360);
    }
  }

  useEffect(() => {
    findChannel();
    getUserSession();
    setImageWidth();
  }, []);

  // set selectedCar and selectedDealer data from session storage to display
  useEffect(() => {
    const postSessionData = JSON.parse(
      sessionStorage.getItem('ebookPostState'),
    );
    const sessionData = postSessionData || null;
    if (sessionData?.sessionInfo?.selectedCar) {
      setSelectedCar(sessionData.sessionInfo.selectedCar);
    }
    if (sessionData?.sessionInfo?.selectedDealer) {
      setSelectedDealer(sessionData.sessionInfo.selectedDealer);
    }
  }, []);

  // set if previous buyer profile data to prefill
  useEffect(() => {
    const postSessionData = sessionStorage.getItem('ebookPostState');
    const getSession = postSessionData ? getCleanSessionData() : null;
    if (getSession?.SESSION_INFO?.buyerProfile) {
      const buyerName = getSession.SESSION_INFO.buyerProfile.name;
      const ebookName = getLocalStorage('ebookUserName');
      const namevalue = buyerName || ebookName || '';
      const buyerMobile = getSession.SESSION_INFO.buyerProfile.phoneNumber;
      const ebookMobile = getLocalStorage('ebookNumber');
      const mobileValue = buyerMobile || ebookMobile || '';
      setName(namevalue);
      setPhoneNumber(mobileValue);
      setEmail(getSession.SESSION_INFO.buyerProfile.email);

      const addressValue = getSession.SESSION_INFO.buyerProfile.address;
      const addressArray = addressValue.split(' ');

      let currentcount = 0;
      let addressVal1 = '';
      let addressVal2 = '';
      addressArray.forEach((value) => {
        if (currentcount <= 30) {
          // eslint-disable-next-line prefer-template
          addressVal1 = addressVal1 + ' ' + value;
          currentcount = addressVal1.length;
        } else {
          // eslint-disable-next-line prefer-template
          addressVal2 = addressVal2 + ' ' + value;
        }
      });
      setAddress(addressVal1.trim());
      setAddress2(addressVal2.trim());
    } else {
      const userName = getSession?.SESSION_INFO?.userProfile?.name;
      const ebookName = getLocalStorage('ebookUserName');
      const namevalue = userName || ebookName || '';
      const userMobile = getSession?.SESSION_INFO?.userProfile?.phoneNumber;
      const ebookMobile = getLocalStorage('ebookNumber');
      const mobileValue = userMobile || ebookMobile || '';
      setName(namevalue);
      setPhoneNumber(mobileValue);
    }
  }, []);

  /* Name field validation */
  const validateName = (nameValue) => {
    if (nameValue.trim() === '') {
      return 'Name cannot be empty.';
    }
    return false;
  };

  /* Name field error handling */
  const handleName = (e) => {
    setName(e.target.value);
    if (validateName(e.target.value)) {
      setNameError(validateName(e.target.value));
    } else {
      setNameError('');
    }
  };

  /* Email validtaion */
  const validateEmail = (emailValue) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailValue.trim() === '') {
      return 'Email cannot be empty';
    }
    if (!emailRegex.test(emailValue)) {
      return 'Invalid Email Format';
    }
    return false;
  };

  /* Email field error handling */
  const handleEmail = (e) => {
    setEmail(e.target.value);
    if (validateEmail(e.target.value)) {
      setEmailError(validateEmail(e.target.value));
    } else {
      setEmailError('');
    }
  };

  /* Mobile field validation */
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (phone.trim() === '') {
      return 'Mobile cannot be empty.';
    }
    if (!phoneRegex.test(phone)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return false;
  };

  /* Mobile field error handling */
  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
    if (validatePhoneNumber(e.target.value)) {
      setPhoneError(validatePhoneNumber(e.target.value));
    } else {
      setPhoneError('');
    }
  };

  /* Address field validation */
  const validateAddress = (addressValue1, addressValue2) => {
    const addressTotal = addressValue1 + addressValue2;
    let errMsg = '';
    if (addressValue1.trim() === '') {
      errMsg = 'Address cannot be empty.';
    } else if (addressValue1.length < 5) {
      errMsg = 'Minimum length is 5 characters.';
    } else if (addressTotal.length > 60) {
      errMsg = 'Maximum Address length is 60 characters.';
    }

    if (errMsg) {
      return errMsg;
    }
    return false;
  };

  /* Address field handling */
  const handleAddress = (e) => {
    setAddress(e.target.value);
    if (validateAddress(e.target.value, address2)) {
      setAddressError(validateAddress(e.target.value, address2));
    } else {
      setAddressError('');
    }
  };

  /* Address2 field handling */
  const handleAddress2 = (e) => {
    setAddress2(e.target.value);
    if (validateAddress(address, e.target.value)) {
      setAddressError(validateAddress(address, e.target.value));
    } else {
      setAddressError('');
    }
  };

  /* Terms and condition checkbox field handling */
  const handleTerms = (e) => {
    setTermsConditionsAccepted(e.target.checked);
  };

  /* Agree checkbox field handling */
  const handleAgree = (e) => {
    setAgreementAccepted(e.target.checked);
  };

  /* Next button click user session post api  */
  const updateUserSessionApi = async () => {
    const addressCombine = address + address2;
    const buyerProfile = {
      // eslint-disable-next-line quote-props, quotes
      buyerProfile: {
        name,
        email,
        phoneNumber,
        address: addressCombine.trim(),
        agreementAccepted,
        termsConditionsAccepted,
      },
    };

    const payloadData = {
      SESSION_INFO: buyerProfile,
    };

    // update ebook multistep form state
    updateFormState((currentState) => ({
      ...currentState,
      summaryStep: buyerProfile,
    }));

    /* Store the information in session storage which can be used on next page.  */
    sessionStorage.setItem(
      'ebookFormState',
      JSON.stringify({ ...formState, summaryStep: buyerProfile }),
    );

    // call to user session post api
    await updateEbookUserSession('summaryStep', payloadData);
  };

  /* triggering payment request api call */
  const triggerPaymentForm = (encodedPaymentData) => {
    // Create a new form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = environmentSelection.getConfiguration('paymentGateWayUrl'); // Use the correct URL for initiating the transaction

    // Create hidden input for encoded data
    const encRequestInput = document.createElement('input');
    encRequestInput.type = 'hidden';
    encRequestInput.name = 'encRequest';
    encRequestInput.value = encodedPaymentData;
    form.appendChild(encRequestInput);

    // Create hidden input for access code
    const accessCodeInput = document.createElement('input');
    accessCodeInput.type = 'hidden';
    accessCodeInput.name = 'access_code';
    accessCodeInput.value = environmentSelection.getConfiguration('transactionAccessCode');
    form.appendChild(accessCodeInput);
    // Append the form to the document body
    document.body.appendChild(form);
    // Submit the form
    form.submit();
    // Optionally, you can remove the form after submission
    document.body.removeChild(form);
  };

  /* proceed to payment button click handling */
  const handleOnSubmit = async () => {
    await updateUserSessionApi();
    await analyticsFormStepSubmit();
    const response1 = await handleButtonClick();
    const data1 = await response1;
    const webRefId = data1.data.transactionRefId;

    // Second API Call
    const response2 = await handlePaymentRequest(webRefId, paymentSuccessURL);
    // if (!response2.ok) throw new Error(`Error in handlePaymentRequest: ${response2.status}`);
    const data2 = await response2;
    const encodedPaymentData = data2.data.encodedData;

    // Trigger the payment form with a slight delay
    setTimeout(() => {
      triggerPaymentForm(encodedPaymentData);
    }, 200);
  };

  /* previous button click handling */
  const handlePrevious = async () => {
    await updateUserSessionApi();
    handleSetActiveRoute('select-dealer');
  };

  /* mobile view accordian handling */
  const handleAccordianMobile = (e) => {
    const header = e.currentTarget;
    const accordianContent = header.nextElementSibling;
    const accordionIcon = header.querySelector('.accordian-icon');

    if (screenSize.width <= 767) {
      accordianContent.classList.toggle('open');
      accordionIcon.classList.toggle('open');
    }
  };

  /* email copy to clipboard */
  const copyEmail = async () => {
    const textToCopy = document.getElementsByClassName('dealerEmail');
    navigator.clipboard
      .writeText(textToCopy[0].innerHTML)
      .then(() => {
        console.log('copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  /* naviagte link click handling */
  const navigateLink = () => {
    const link = `https://www.google.com/maps?q=${selectedDealer?.address?.latitude}, ${selectedDealer?.address?.longitude}`;
    return link || '#';
  };

  /* custom image width handling */
  const customImageWidth = (url) => {
    let link = '';
    link = `${placeholders.publishDomain}${url}`;
    if (link.indexOf('?') !== -1) {
      link = `${link}&width=${imgContainerWidth}`;
    } else {
      link = `${link}?width=${imgContainerWidth}`;
    }
    return link;
  };

  return html`
    <div class="cmp-summary">
      <form>
        <div class="booking-wrapper">
          <${EbookStep} selectedDealer=${selectedDealer} />
          <div class="booking-content">
            <div class="booking-title">${stepTitle}</div>
            <div class="booking-details">
              <div class="car-section">
                <div class="vehicle-details">
                  <div
                    class="summary-title"
                    onclick=${(e) => handleAccordianMobile(e)}
                  >
                    ${hnodeAs(vehicleTitle, 'h4')}
                    <div class="accordian">
                      <span class="accordian-icon"></span>
                    </div>
                  </div>
                  <div id="car-info-section">
                    ${channel === 'arena'
    ? html`<div class="arena-vehicle-info">
                          <div class="left">
                            <div class="car-model info-item">
                              <p>${selectedCar?.modelDesc}</p>
                            </div>
                            <div class="sub-container info-item">
                              <div class="car-varient sub-item">
                                <p>${selectedCar?.variantDesc}</p>
                              </div>
                              <div class="engine-type sub-item">
                                <span class="engine-item"
                                  >${selectedCar?.fuelType}</span
                                >
                              </div>
                            </div>
                            <div
                              class="showroom-price info-item arena-desktop-only"
                            >
                                ${selectedCar?.exShowroomPrice
    ? html`
    <p>
    ${formatRupeesWithSymbol(selectedCar?.exShowroomPrice)}/-
    </p>
    ${hnodeAs(exshowroomText, 'span')}
    `
    : ''}                 
                            </div>
                            <div class="info-item arena-mobile-only">
                              <div class="arena-color-section">
                                <div class="color-text">
                                  ${hnodeAs(colorText, 'p')}
                                </div>
                                <div class="color-hexacode">
                                  <div
                                    class="tick-square"
                                    style="${`background-color:${selectedCar?.hexColorCd}`}"
                                  >
                                    <div class="tickmarknew"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="right">
                            <div class="arena-detail-link arena-desktop-only">
                              ${hnodeAs(viewDetailText, 'a', { href: '#' })}
                            </div>
                          </div>
                        </div> `
    : html`<div class="nexa-vehicle-info">
                            <div 
                              class="car-info info-item"
                              style="${!selectedCar?.exShowroomPrice ? 'border-right: none' : ''}"
                              >
                              <p class="model-name">
                                ${selectedCar?.modelDesc} ${' '}
                                <span class="variant-name">( ${selectedVariantName} ) </span>
                              </p>
                              <span class="transmission-fuel">
                                <span class="fueltype"  
                                  style="${!selectedCar?.fuelType ? 'border-right: none' : ''}"
                                >
                                ${selectedTransmission}
                                </span>
                                <span class="fueltype">${selectedCar?.fuelType}</span>
                              </span>                              
                            </div>
                            <div class="showroom-price info-item price-align">
                              ${selectedCar?.exShowroomPrice
    ? html`
    <p>
    ${formatRupeesWithSymbol(selectedCar?.exShowroomPrice)}/-
    </p>
    ${hnodeAs(exshowroomText, 'span')}
    `
    : ''}
                            </div>
                          </div>
                          <div class="nexa-vehicle-color-top">
                            <div class="nexa-color-info nexa-mobile-only">
                              <p class="color-name">
                                ${selectedCar?.cmsColorDesc}
                              </p>

                              ${hnodeAs(colorText, 'p', {
    class: 'color-label',
  })}
                            </div>
                          </div> `}
                    <div class="vehicle-img" id="summary-vehicle-image">
                      <img
                        src="${customImageWidth(selectedCar?.imageUrl)}"
                        alt="car-image"
                        width="100%"
                        height="100%"
                      />
                    </div>
                    ${channel === 'arena'
    ? html`<div class="arena-vehicle-color">
                          <div class="color-item arena-desktop-only">
                            <div class="arena-color-section">
                              <div class="color-text">
                                ${hnodeAs(colorText, 'p')}
                              </div>
                              <div class="color-hexacode">
                                <div
                                  class="tick-square"
                                  style="${`background-color:${selectedCar?.hexColorCd}`}"
                                >
                                  <div class="tickmarknew"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            class="showroom-price color-item arena-mobile-only"
                          >
                            ${selectedCar?.exShowroomPrice
    ? html`
    <p>
   ${formatRupeesWithSymbol(selectedCar?.exShowroomPrice)}/-
    </p>
    ${hnodeAs(exshowroomText, 'span')}
    `
    : ''}
                          </div>
                          <div
                            class="arena-detail-link color-item arena-mobile-only"
                          >
                            ${hnodeAs(viewDetailText, 'a', { href: '#' })}
                          </div>
                        </div> `
    : html`
                          <div class="nexa-vehicle-color">
                            <div class="nexa-color-info nexa-desktop-only">
                              <p class="color-name">
                                ${selectedCar?.cmsColorDesc}
                              </p>
                              ${hnodeAs(colorText, 'p', {
    class: 'color-label',
  })}
                            </div>                           
                          </div>
                        `}
                  </div>
                </div>
                <div class="dealer-details">
                  <div
                    class="summary-title"
                    onclick=${(e) => handleAccordianMobile(e)}
                  >
                    <div class="title-left">${hnodeAs(dealerTitle, 'h4')}</div>
                    <div class="title-right">
                      <div class="top-navigate-link">
                        ${hnodeAs(navigateText, 'a', {
    href: `${navigateLink()}`,
    target: '_blank',
  })}
                        <span class="arrow-icon-summary"></span>
                      </div>
                      <div class="accordian">
                        <span class="accordian-icon"></span>
                      </div>
                    </div>
                  </div>
                  <div id="dealer-info-section">
                    ${channel === 'arena'
    ? html`<div class="arena-dealer-info">
                          <div class="dealer-name">
                            <p>${selectedDealer?.name}</p>
                          </div>
                          <div class="dealer-contact">
                            <div class="dealer-contact-left">
                              <div class="dealer-address">
                                <p>
                                  ${selectedDealer?.address?.completeAddress}
                                </p>
                              </div>
                              <div class="phone-summary">
                                <span class="phone-icon-summary"></span>
                                <a
                                  href="tel:${selectedDealer?.phone}"
                                  aria-label="phone"
                                  >${selectedDealer?.phone}</a
                                >
                              </div>
                              <div class="email-summary">
                                <span class="email-icon-summary"></span>
                                <a
                                  href="mailto:${selectedDealer?.email}"
                                  aria-label="email"
                                  class="dealerEmail"
                                  >${selectedDealer?.email}</a
                                >
                                <span
                                  class="copy-icon-summary"
                                  onclick=${(e) => copyEmail(e)}
                                ></span>
                               
                              </div>
                            </div>
                            <div class="dealer-contact-right">
                              <div class="bottom-navigate-link">
                                ${hnodeAs(navigateText, 'a', {
    href: `${navigateLink()}`,
    target: '_blank',
  })}
                                <span class="arrow-icon-summary"></span>
                              </div>
                            </div>
                          </div>
                        </div> `
    : html`<div class="nexa-dealer-info">
                          <div class="dealer-info-content">
                            <div class="dealer-name">
                              <p>${selectedDealer?.name}</p>
                            </div>
                            <div class="dealer-address">
                              <p>${selectedDealer?.address?.completeAddress}</p>
                            </div>
                          </div>
                          <div class="dealer-contact">
                            ${selectedDealer?.phone ? html`<div class="phone-summary" 
                            style="${!selectedDealer?.email ? 'border-right: none' : ''}"
                            >
                              <div class="circle">
                                <span class="phone-icon-summary"></span>
                              </div>
                              ${selectedDealer?.phone?.split(',')[0] ? html`<a
                                href="tel:${selectedDealer?.phone}"
                                aria-label="phone"
                                >
                                ${selectedDealer?.phone}
                              </a>` : ''
}
                              ${selectedDealer?.phone?.split(',')[1] ? html`<a
                                href="tel:${selectedDealer?.phone}"
                                aria-label="phone"
                                >
                                ${selectedDealer?.phone}
                              </a>` : ''
}
                        </div>` : ''}
                            ${selectedDealer?.email ? html`<div class="email-summary">
                              <div class="circle">
                                <span class="email-icon-summary"></span>
                              </div>
                              <a
                                href="mailto:${selectedDealer?.email}"
                                aria-label="email"
                                class="dealerEmail"
                                >${selectedDealer?.email}</a
                              >
                              <img 
                                src="../../../icons/copy-icon-summary.svg" 
                                class="copy-icon-img" 
                                alt="copy-icon"
                                onclick=${(e) => copyEmail(e)}
                              />
                             
                            </div>` : ''}
                            
                            <div class="bottom-navigate-link">
                              ${hnodeAs(navigateText, 'a', {
    href: `${navigateLink()}`,
    target: '_blank',
  })}
                              <span class="arrow-icon-summary"></span>
                            </div>
                          </div>
                        </div> `}
                  </div>
                </div>
              </div>
              <div class="customer-section">
                <div class="customer-top customer-item">
                  <div class="summary-title customer-title user-item">
                    ${hnodeAs(customerTitle, 'h4')}
                  </div>
                  <div class="user-info user-item" id="user-form-section">
                    <div class="name-section">
                      <div class="input-box">
                        <input
                          type="text"
                          name="name"
                          class="dotted-line"
                          placeholder="${hnodeAs(namePlaceholderText).props.children[0]}"
                          onBlur=${(e) => handleName(e)}
                          value=${name}
                          disabled
                        />
                        <span
                          class=${`error-form ${nameError ? 'active' : ''}`}
                        >
                          ${nameError}
                        </span>
                      </div>
                    </div>

                    <div class="input-box">
                      <input
                        type="text"
                        name="phoneNumber"
                        class="dotted-line"
                        placeholder="${hnodeAs(mobilePlaceholderText).props.children[0]}"
                        maxlength="10"
                        onBlur=${(e) => handlePhoneNumber(e)}
                        value=${phoneNumber}
                        disabled
                      />
                      <span class=${`error-form ${phoneError ? 'active' : ''}`}>
                        ${phoneError}
                      </span>
                    </div>
                    <div class="input-box">
                      <input
                        type="email"
                        name="email"
                        placeholder="${hnodeAs(emailPlaceholderText).props.children[0]}"
                        onBlur=${(e) => handleEmail(e)}
                        value=${email}
                      />
                      <span class=${`error-form ${emailError ? 'active' : ''}`}>
                        ${emailError}
                      </span>
                    </div>
                    <div class="input-box">
                      <input
                        type="text"
                        name="address"
                        placeholder="${hnodeAs(addressPlaceholderText).props.children[0]}"
                        onBlur=${(e) => handleAddress(e)}
                        value=${address}
                      />                     
                    </div>
                    <div class="input-box">
                      <input
                        type="text"
                        name="address2"
                        placeholder=""
                        onBlur=${(e) => handleAddress2(e)}
                        value=${address2}
                      />
                      <span
                        class=${`error-form ${addressError ? 'active' : ''}`}
                      >
                        ${addressError}
                      </span>
                    </div>
                  
                  </div>
                </div>
                <div class="customer-bottom customer-item">
                      <div class="agree-terms user-item">
                      <div class="checkbox-container">
                        <input
                          type="checkbox"
                          name="terms"
                          id="terms"
                          checked=${termsConditionsAccepted}
                          onChange=${(e) => handleTerms(e)}
                        />
                        <span class="label">
                          ${hnodeAs(agreeText, 'span')}
                          <a href="/en/terms-of-use" target="_blank">${hnodeAs(termsConditionsText, 'span')}</a>
                        </span>
                      </div>

                      <div class="checkbox-container">
                        <input
                          type="checkbox"
                          name="agree"
                          id="agree"
                          checked=${agreementAccepted}
                          onChange=${(e) => handleAgree(e)}
                        />
                        <span class="label">
                          ${hnodeAs(agreeThatText, 'span')}
                          ${hnodeAs(agreeMoreText, 'span')}
                        </span>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="booking-amount-wrapper">
          <${BookingStep}
            config=${config}
            previousUpdateUserSession=${() => handlePrevious('previous')}
            nextUpdateUserSession=${() => handleOnSubmit('next')}            
            display="true"           
            step="summary"
            errors=${errorsObjNew}
          />
        </div>
      </form>
    </div>
  `;
}

Summary.parse = (block) => {
  const [summaryWrapper, paymentWrapper] = [...block.children].map(
    (row) => row.firstElementChild,
  );
  const [
    stepTitle,
    vehicleTitle,
    dealerTitle,
    viewDetailText,
    colorText,
    exshowroomText,
    navigateText,
    customerTitle,
    agreeText,
    termsConditionsText,
    agreeThatText,
    agreeMoreText,
    prevButton,
    proceedButton,
    namePlaceholderText,
    mobilePlaceholderText,
    emailPlaceholderText,
    addressPlaceholderText,
  ] = [...summaryWrapper.children];

  const [
    paymentSuccessWrapper,
  ] = [...paymentWrapper.children];

  const [
    paymentSuccessTag,
  ] = [...paymentSuccessWrapper.children];
  const paymentSuccessURL = paymentSuccessTag?.getAttribute('href');

  return {
    stepTitle,
    vehicleTitle,
    dealerTitle,
    viewDetailText,
    colorText,
    exshowroomText,
    navigateText,
    customerTitle,
    agreeText,
    termsConditionsText,
    agreeThatText,
    agreeMoreText,
    prevButton,
    proceedButton,
    namePlaceholderText,
    mobilePlaceholderText,
    emailPlaceholderText,
    addressPlaceholderText,
    paymentSuccessURL,
  };
};

Summary.defaults = {
  stepTitle: html`<p>Booking Summary</p>`,
  vehicleTitle: html`<p>Vehicle Details</p>`,
  dealerTitle: html`<p>Dealership Details</p>`,
  viewDetailText: html`<p>View Detailed Summary</p>`,
  colorText: html`<p>Color</p>`,
  exshowroomText: html`<p>Ex-Showroom Price</p>`,
  navigateText: html`<p>Navigate</p>`,
  customerTitle: html`<p>Customer Details</p>`,
  agreeText: html`<p>I agree to</p>`,
  termsConditionsText: html`<p>terms and conditions</p>`,
  agreeThatText: html`<p>I agree that by clicking the...</p>`,
  agreeMoreText: html`<p>more</p>`,
  prevButton: html`<p>Previous</p>`,
  proceedButton: html`<p>Proceed To Pay</p>`,
  namePlaceholderText: html`Name`,
  mobilePlaceholderText: html`Mobile`,
  emailPlaceholderText: html`Email`,
  addressPlaceholderText: html`Address`,
  paymentSuccessURL: html`/en/payment-success-nexa`,
};

export default Summary;
