import formDataUtils from '../../utility/formDataUtils.js';
import { getMetadata } from '../../commons/scripts/aem.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../utility/utility.js';
import { attachValidationListeners, mergeValidationRules } from '../../utility/validation.js';
import analytics from '../../utility/analytics.js';
import commonApiUtils, { toTitleCase, sentenceToTitleCase } from '../../commons/utility/apiUtils.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    componentIdEl,
    titleEl,
    descriptionEl,
    welcomeImageEl,
    mobileWelcomeImageEl,
    fillDetailsEl,
    sendOtpButtonEl,
    personalDetailsEl,
    tAndCTextEl,
    thankyouTitleEl,
    thankyouDescEl,
    formStyleEl
  ] = children;

  block.innerHTML = '';

  const initForm = async () => {
    const data = await formDataUtils.fetchFormData('form-data-register-your-interest');
    let isOtpVerified = false;
    let countDown = 30;
    let requestId;
    let mobileNumber;
    let otpInputField = '';
    let interval;

    const componentId = componentIdEl?.textContent?.trim() || '';
    const title = titleEl?.textContent?.trim() || '';
    const subtitle = descriptionEl?.textContent?.trim() || '';
    const welcomeImage = welcomeImageEl?.querySelector('picture');
    const mobileWelcomeImage = mobileWelcomeImageEl?.querySelector('picture');
    const fillDetailsText = fillDetailsEl?.textContent?.trim() || '';
    const sendOtpButton = sendOtpButtonEl?.textContent?.trim() || '';
    const personalDetails = personalDetailsEl?.textContent?.trim() || '';
    const thankyouTitle = thankyouTitleEl?.textContent?.trim() || '';
    const thankyouDesc = thankyouDescEl?.textContent?.trim() || '';
    const formStyle = formStyleEl?.textContent?.trim() || '';
    const disclaimer = tAndCTextEl?.innerHTML || '';
    welcomeImage?.classList?.add('webViewContainer');
    mobileWelcomeImage?.classList?.add('mobileViewContainer');
    block.innerHTML = utility.sanitizeHtml(
      `<div class="modal yy8-register-interest-modal" aria-hidden="true" tabindex="-1" role="dialog" id=${componentId}>
          <div class="container">
            <div class='close-button-container'>
              <button class='close-button' type='button'></button>
            </div>
            <div class="image-container">
              ${welcomeImage?.outerHTML}
              ${mobileWelcomeImage?.outerHTML}
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
                  <p class='step-title'>${fillDetailsText}</p>
                </div>
                <div class='step-container active' data-step-number=1>
                  <div class='personal-details'>
                    <p class='form-heading'>${personalDetails}</p>
                    <div class="form-fields">
                      ${formDataUtils.createInputField(data?.name, 'name', 'text', {}, formStyle)}
                      ${formDataUtils.createInputField(data?.email, 'email-id', 'email', {}, formStyle)}
                      ${formDataUtils.createInputField(data?.mobile, 'mobileField', 'number', { minlength: 10, maxlength: 10 }, formStyle)}
                      <div class="otp-container half-width resend-otp-container form-field" style="display: none;">
                        <div class="otp-input">
                        <div class="otp-input-container">
                          <input type="number" maxlength="1" class="otp-digit" aria-label="OTP digit 1" required="">
                          <input type="number" maxlength="1" class="otp-digit" aria-label="OTP digit 2" required="">
                          <input type="number" maxlength="1" class="otp-digit" aria-label="OTP digit 3" required="">
                          <input type="number" maxlength="1" class="otp-digit" aria-label="OTP digit 4" required="">
                          <input type="number" maxlength="1" class="otp-digit" aria-label="OTP digit 5" required="">
                        </div>
                        <input type="text" id="otp" name="otp" placeholder="Type OTP*" aria-labelledby="otp-label" required="" minlength="5" maxlength="5" style="display: none;">
                        <span type="button" id="resend-otp-btn" class="otp-button">Resend OTP</span>
                        </div>
                        <span class="validation-text">OTP is required</span>
                        <p id="otp-error" class="validation-text" style="color: red; display: none;">Please enter correct OTP</p></div>
        
                        <div class="sendotp-container otp-button-container">
                          <button id="sendotp-btn" class="button button-secondary-blue otp-button" disabled="">
                            Send OTP
                          </button>
                        </div>
                        <div id="disclaimer"><input type="checkbox" class="consent-input" id="consent-input">${disclaimer} </div>
                      </div>
                    </div>
                  </div>
                  <div class='footer'>
                    ${formDataUtils.createButton(data.interested, 'full-width button-secondary interested-button', 'button')}
                  </div>
              </form>
            </div>
          </div>
        </div>`,
    );

    const resendOtpContainer = block.querySelector('.resend-otp-container');
    const sendotpContainer = block.querySelector('.sendotp-container');
    const mobileField = block.querySelector('.mobileField');
    const otpValidation = resendOtpContainer.querySelector('.validation-text');
    const userNameField = block.querySelector('.name').querySelector('input');
    const emailField = block.querySelector('#email');
    const nextButton = document.getElementById('interested');
    const sendotpBtn = block.querySelector('#sendotp-btn');
    const resendotpBtn = block.querySelector('#resend-otp-btn');
    const closeBtn = block.querySelector('.close-button');
    const otpDigits = document.querySelectorAll('.otp-digit');
    const form = block.querySelector('form');
    const formFields = form.querySelectorAll('input, select');
    resendotpBtn.textContent = 'Resend OTP';
    nextButton.textContent = data.interested.label;
    emailField.textContent = data.email.label;
    const firstNameInput = document.getElementById('name');
    toggleNextButton();

    firstNameInput.addEventListener('input', (e) => {
      toggleNextButton();
    });

    otpDigits.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1); // Remove non-numeric characters
        if (input.value.length === 1 && index < otpDigits.length - 1) {
          otpDigits[index + 1].focus(); // Move to the next input
        }
        // Log current OTP
        otpInputField = Array.from(otpDigits)
          .map((digit) => digit.value)
          .join('');
        toggleNextButton();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && input.value === '' && index > 0) {
          otpDigits[index - 1].focus(); // Move to the previous input
        }
      });
    });

    const disbleEnableSendOTPBtn = (disabled) => {
      sendotpBtn.disabled = disabled;
    };

    disbleEnableSendOTPBtn(true);

    const nameInput = document.getElementById('name');
    const nameErrorEl = document.getElementById('name-validation');
    if (!document.getElementById('name-validation')) {
      nameErrorEl.id = 'name-validation';
      nameErrorEl.className = 'validation-text';
      nameErrorEl.style.color = 'red';
      nameErrorEl.style.display = 'none';
      nameInput.parentElement.appendChild(nameErrorEl);
    }
    nameInput.addEventListener('input', (e) => {
      if (!nameInput.value) {
        nameErrorEl.style.display = 'block';
      } else {
        nameErrorEl.style.display = 'none';
        nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, '');
      }
      toggleNextButton();
    })

    const emailInput = document.getElementById('email');
    const emailErrorEl = document.getElementById('email-validation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    emailInput.addEventListener('input', (e) => {
      if (!emailInput.value || !emailRegex.test(emailInput.value)) {
        emailErrorEl.style.display = 'block';
        nextButton.disabled = true;
      } else {
        emailErrorEl.style.display = 'none';
        toggleNextButton();
      }
    });

    function toggleNextButton() {
      nextButton.disabled = !validateStepFields();
    }

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
      } else {
        mobileErrorEl.style.display = 'block';
      }

      toggleNextButton();
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

    const consent = document.getElementById('consent-input');
    consent.addEventListener('click', (e) => {
      if (!consent) isValid = false;
      toggleNextButton();
    })


    function toggleNextButton() {
      const nextButton = document.getElementById('interested');
      if (nextButton) {
        nextButton.disabled = !validateStepFields();
      }
    }

    function validateStepFields() {
      let isValid = true;
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phoneNumber = document.getElementById('mobile').value;
      const sendotpBtn = document.querySelector('#sendotp-btn');
      const consent = document.getElementById('consent-input').checked;
      const otpValue = otpInputField;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (phoneNumber.length === 10 && /^[0-9]+$/.test(phoneNumber)) {
        sendotpBtn.disabled = false;
      } else {
        sendotpBtn.disabled = true;
        isValid = false;
      }

      if (!name || !email || !emailRegex.test(email) || phoneNumber.length < 10 || !/^[0-9]+$/.test(phoneNumber) || otpValue.length < 5 || !consent) {
        isValid = false;
      }
      return isValid;
    }

    function verifyOtpData() {
      const pageDetails = {};
      pageDetails.componentName = 'otp-input';
      pageDetails.componentType = 'button';
      pageDetails.webName = block.querySelector('.otp-button')?.textContent?.trim();
      pageDetails.linkType = 'other';
      analytics.setVerifyOtpDetails(pageDetails);
    }

    const verifyOtpApi = async (otp) => {
      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const consent = document.querySelector('#consent-input').checked;
      try {
        const response = await commonApiUtils.otpValidationRequestForTeaser(otp, requestId, mobileNumber, name, email, consent);
        if (response.ok) {
          const result = await response.json();
          if (result.success === true) {
            // verifyOtpData();
            submitFormAfterFinalPayload();
            return true;
          }
          const details = {};
          details.formName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to verify OTP';
          details.webName = block.querySelector('.otp-button')?.textContent?.trim();// should be aria-label
          details.linkType = 'other';
          analytics.setWebError(details);
          return false;
        }
      } catch (error) {
        console.error('Error during OTP verification:', error);
      }
      return false;
    };
    clearInterval(interval);
    countDown = 0;

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
          document.getElementById('mobile').style.color = '#939393';
          mobileField.classList.add('valid');
          mobileField.querySelector('.tick-icon').classList.remove('hidden');
          document.querySelector('.otp-container').style.display = 'none';
          toggleNextButton();
          if (otpErrorEl) hideAndShowEl(otpErrorEl, 'none');
        }
        else if (!isOtpVerified) {
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
      try {
        const response = await commonApiUtils.sendOtpRequestForTeaser(mobileNumber);
        const result = await response.json();
        requestId = result.data.requestId;

        if (!response.ok) {
          const details = {};
          details.formName = 'Register Your Interest';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to send OTP';
          details.webName = block.querySelector('.otp-button')?.textContent?.trim(); // should be aria-label
          details.linkType = 'other';
          analytics.setWebError(details);
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Failed to Send OTP:', error);
      }
    };

    function resetForm(e) {
      e.preventDefault();
      form.reset();
      initFormEvent = false;
      isOtpVerified = false;
      otpInputField = '';
      const mobileErrorEl = document.getElementById('mobile-validation');
      const emailErrorEl = document.getElementById('email-validation');
      const nameErrorEl = document.getElementById('name-validation');
      mobileErrorEl.style.display = 'none';
      emailErrorEl.style.display = 'none';
      nameErrorEl.style.display = 'none';
      otpDigits.forEach((digit) => {
        digit.value = '';
        digit.classList.add('green');
        digit.classList.remove('red');
        digit.disabled = true; // Disables all digits
        digit.style.color = '#939393'; // Optional: if you want to enforce consistent style
      });
      const otpErrorEl = resendOtpContainer.querySelector('#otp-error');

      const consentCheckbox = document.getElementById('consent-input');
      if (consentCheckbox) consentCheckbox.checked = false;

      resendOtpContainer.style.display = 'none';
      sendotpContainer.style.display = 'flex';

      if (otpErrorEl) hideAndShowEl(otpErrorEl, 'none');
    }


    const startOtpCountDown = () => {
      const otpCountDown = block.querySelector('#otp-countDown');
      countDown = 30; // Reset countdown to default value
      otpCountDown.textContent = ` ${countDown} sec`; // Initialize the text
      clearInterval(interval); // Clear any existing interval before starting a new one
      resendotpBtn.disabled = true;
      interval = setInterval(() => {
        countDown -= 1;
        otpCountDown.textContent = ` ${countDown} sec`;
        if (countDown <= 0) {
          clearInterval(interval); // Stop the timer when countdown reaches 0
          otpCountDown.textContent = '';
          resendotpBtn.disabled = false;
        }
      }, 1000);
    };

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

    const hideAndShowEl = (el, value) => {
      el.style.display = value;
    };

    // green tick for otp verification, initially hidden
    const tickIcon = `
          <span class='tick-icon hidden'></span>
        `;
    mobileField.insertAdjacentHTML('beforeend', tickIcon);

    // Reset countdown on form submission
    const resetCountdown = () => {
      clearInterval(interval); // Stop the existing interval
      countDown = 30; // Reset the countdown to default
      const otpCountDown = block.querySelector('#otp-countDown');
      if (otpCountDown) {
        otpCountDown.textContent = `${countDown} sec`; // Reset displayed text
      }
    };

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
          // verifyMobileOtp();
        }
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && input.value === '' && index > 0) {
          otpDigits[index - 1].focus(); // Move to the previous input
        }
      });
    });
    nextButton.addEventListener('click', (e) => {
      // Get the values for first name, last name, selected city, and selected state
      const fullName = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const mobile = document.getElementById('mobile').value;

      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.innerText = 'Incorrect OTP. Please try again or resend OTP.';
        errorMessage.style.display = 'block';
      } else {
        verifyMobileOtp();
      }

      const data = {};
      data.componentName = 'Enquiry Popup';
      data.componentTitle = document.querySelector('.interested-button')?.innerHTML?.trim();
      data.componentType = 'button';
      data.webName = "Submit";
      data.linkType = 'other';
      data.custName = fullName;
      data.phoneNumber = mobile;
      data.email = email;
      data.whatsapp = 'y';
      data.call = 'y';
      data.sms = 'y';
      data.formName = 'Register Your Interest';
      analytics.setEnquirySubmitDetails(data);
    });
    consent.addEventListener('keydown', function (evt) {
      if (nextButton.hasAttribute('disabled')) {
        focusInModalOnly(evt);
      }
    });
    nextButton.addEventListener('keydown', function (evt) {
      focusInModalOnly(evt);
    });

    function focusInModalOnly(event) {
      event.preventDefault();
      var key = (event.which) ? event.which : event.keyCode;
      if (key === 9) {
        block.querySelector(".yy8-register-interest-modal").focus();
      }
    }

    function submitFormAfterFinalPayload() {
      block.querySelector('.container').classList.add('thank-you-container');
      const thankYouText = block.querySelector('.thank-you-information .title');
      const firstName = userNameField.value;
      thankYouText.textContent = thankYouText.textContent.replace('{first-name}', firstName);
    }

    let initFormEvent = false;

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


    formFields.forEach((field) => {
      field.addEventListener('focus', handleUserInteraction);
      field.addEventListener('change', handleUserInteraction);
    });

    closeBtn.addEventListener('click', async (e) => {
      block.closest('.yy8-register-your-interest-teaser-wrapper').style.display = 'none';
      resetForm(e);
      block.querySelector('.container').classList.remove('thank-you-container');
      mobileField.querySelector('.tick-icon').classList.add('hidden');
      document.body.style.overflow = 'auto';
      const mobileEl = block.querySelector('.form-field.mobileField.valid');
      if (mobileEl) {
        mobileEl.classList.remove('valid');
        const mobileInput = mobileEl.querySelector('#mobile');
        mobileInput.removeAttribute('disabled');
        mobileInput.style.color = '#000';
      }
      const nextButton = document.getElementById('interested');
      nextButton.disabled = true;
      document.querySelector('#register-interest-form').reset();
      const otpdigits = document.querySelectorAll('.otp-digit');
      sendotpContainer.style.display = 'flex';
      sendotpBtn.disabled = true;
      isOtpVerified = false;
      otpdigits.forEach((digit) => {
        digit.classList.remove('green');
        digit.disabled = false;
        digit.style.color = '#000';
      });
      toggleNextButton();
    });
    
  };

  initForm();
}
