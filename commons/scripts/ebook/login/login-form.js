import { html } from '../../vendor/htm-preact.js';
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from '../../vendor/preact-hooks.js';
import apiUrls from '../../../utility/apiConstants.js';
import environmentSelection from '../../../utility/domainUtils.js';
import { hnodeAs, MultiStepFormContext } from '../multi-step-form.js';
import {
  CONSTANTS,
  removeLocalStorage,
  setLocalStorage,
} from '../../../utility/localStorage.js';
import { cloneElement } from '../../vendor/preact.js';
import analytics from '../../../../utility/analytics.js';
import utility from '../../../../utility/utility.js';

function LoginForm({ config }) {
  const { handleSetActiveRoute } = useContext(MultiStepFormContext);
  const [loginValue, setLoginValue] = useState({});
  const [sdkDetails, setSdkDetails] = useState({});
  const [existingUser, setExistingUser] = useState(true);
  const [signInSession, setSignInSession] = useState({});
  const[enquiryStartFlag, setEnquiryStartFlag] = useState(0)
  const inputsRef = useRef([]);
  // eslint-disable-next-line max-len
  const expiresTimeInMilliSecond = Date.now() + CONSTANTS.TOKEN_TIMEOUT * CONSTANTS.MILLISECONDS_MULTIPLIER;
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formError, setFormError] = useState({ error: true });
  const [otpButtonStatus, setOtpButtonStatus] = useState(false);
  const [mobileNumberStatus, setMobileNumberStatus] = useState('');
  const coutdown = 10;
  const [interval, setIntervalTimer] = useState(coutdown);
  const [enableResend, setEnableResend] = useState(false);
  const [resendOTP, setResendOTP] = useState((coutdown >= 10) ? `(0:${interval} s)` : `(0:0${interval} s)`);
  const [optError, setOtpError] = useState(false);
  const loginform = useRef();
  const image = `${document.querySelector('.login.hide-content')?.firstElementChild?.querySelector('img')?.getAttribute('src')?.split('?')[0]}?width=${window.innerWidth}&format=webply&optimize=medium`;
  useEffect(() => {
    if (showOTPModal) {
      document.querySelector('body').classList.add('overflow-hidden');
    } else {
      document.querySelector('body').classList.remove('overflow-hidden');
    }
  }, [showOTPModal]);

  const intervalTimer = () => {
    let currentTime = coutdown;
    const otpInterval = setInterval(() => {
      if (currentTime > 0) {
        setEnableResend(false);
        setResendOTP(() => {
          currentTime -= 1;
          setIntervalTimer(currentTime);
          if (currentTime < 10) {
            return `(0: 0${currentTime} s)`;
          }
          return `(0: ${currentTime} s)`;
        });
      } else {
        setIntervalTimer(coutdown);
        clearInterval(otpInterval);
        setEnableResend(true);
      }
    }, 1000);
  };
    /* This method to trigger adobe analytics form start event */
    async function analyticsFormStart() {
      const details = {};
      details.formName = 'E-Book';
      details.webName = 'Start Booking Journey';
      details.linkType = 'other';
      if (loginValue?.mobileNumber) {
        details.identities = {
          hashedphoneSHA256: await utility.getSHA256Hash(loginValue.mobileNumber),
        };
      }
      if(enquiryStartFlag === 0){
        setEnquiryStartFlag(1) 
      analytics.setEnquiryStartDetails(details);
      }
    }
    async function analyticsFormStepSubmit() {
      const details = {};
      details.formName = 'E-Book';
      details.webName = 'Proceed';
      details.linkType = 'other';
      details.userInfo = {
        authenticatedState: 'unauthenticated',
      };
      if (loginValue?.mobileNumber) {
        details.identities = {
          // eslint-disable-next-line max-len
          hashedphoneSHA256: await utility.getSHA256Hash(loginValue?.mobileNumber),
        };
      }
      const dataLayerObj = {
        enquiryStepName: 'E-Book Login',
        custName: loginValue?.name || '',
      };
      analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
    }
  /**
   * To do the API call to get the details of the AWS Amplify configurations
   * AWS Amplify is used to create the login session for the EBOOK Module
   */
  const sdkAPI = () => {
    const sdkInterval = setInterval(async () => {
      if (window.aws_amplify !== undefined) {
        try {
          const response = await fetch(
            `${apiUrls.sdkUrl}?apiKey=${environmentSelection.getSdkNumber()}`,
          );
          const data = await response.json();
          const auth = {
            region: data.region,
            userPoolId: data.userPoolId,
            userPoolWebClientId: data.userPoolWebClientId,
            authenticationFlowType: 'CUSTOM_AUTH',
          };
          setSdkDetails(data);
          window.aws_amplify.configure({ Auth: auth });
        } catch (error) {
          sdkAPI();
        }
        clearInterval(sdkInterval);
      }
    }, 1000);
  };

  /**
   * Use this effect to call the method once the component is
   * avaiable for the user
   */
  useEffect(() => {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = `${window.location.origin}/commons/scripts/vendor/aws-amplify.min.js`;
      script.defer = true;
      script.type = 'text/javascript';
      script.onload = () => {
        window.aws_amplify = window.aws_amplify.default;
        sdkAPI();
      };
      document.body.appendChild(script);
    }, 3000);
  }, []);

  /**
   * This method will trigger when the user change the value on the input field
   * And set the login form values in the state
   * @param {Event} e
   * @param {field name} key
   */
  const handleChange = () => {
    const inputFields = loginform.current.querySelectorAll('[name]');
    inputFields.forEach((field) => {
      const key = field.getAttribute('name');
      setFormError((current) => ({
        ...current,
        error: false,
        [key]: false,
        [`${key}-error`]: false,
      }));
    });
    inputFields.forEach((field) => {
      const key = field.getAttribute('name');
      const value = field.value?.trim();
      if (!value.length) {
        setFormError((current) => ({ ...current, [key]: true, error: true }));
      } else if (field.getAttribute('data-type') !== 'text' && ((value.length > 1 && value.length < 10) || !Number(value) || value?.split('')[0] === '1')) {
        setFormError((current) => ({
          ...current, [`${key}-error`]: true, error: true, [key]: false,
        }));
      }
      setLoginValue((current) => ({ ...current, [key]: value }));
    });
  };

  /**
   * This method is used to call the register api for the new user
   * @param {mobile number} contactInfo
   */
  const sendOtpForUnregisteredUser = async (contactInfo) => {
    const otpBody = {
      mobile: contactInfo,
      applicationName: sdkDetails.applicationName,
    };
    try {
      const url = `${sdkDetails.gatewayUrl}customer/api/v1/otp/register/send`;
      const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(otpBody),
        headers: { 'Content-type': 'application/json;' },
      });
      const data = await response.json();
      if (!data.error) {
        setShowOTPModal(true);
        analyticsFormStepSubmit();
        setIntervalTimer(coutdown);
        intervalTimer();
      } else {
        throw data.error;
      }
    } catch (error) {
      console.log(error);
    }
  };
    /* This method to trigger adobe analytics verifiy otp event */
    async function analyticsVerifyOTP() {
      const details = {};
      details.componentName = 'otp-input';
      details.componentType = 'button';
      details.webName = 'Verify OTP';
      details.linkType = 'other';
      details.userInfo = {
        authenticatedState: 'authenticated',
      };
      if (loginValue?.mobileNumber) {
        details.identities = {
          hashedphoneSHA256: await utility.getSHA256Hash(loginValue.mobileNumber),
        };
      }
      analytics.setVerifyOtpDetails(details);
    }
  /**
   * This method will trigger when the form is submit and otp will get triggered
   * @param {Event} e
   */
  const formSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await window.aws_amplify.Auth.signIn(
        loginValue.mobileNumber,
      );
      analyticsFormStepSubmit();
      setExistingUser(true);
      setShowOTPModal(true);
      setIntervalTimer(coutdown);
      intervalTimer();

      setSignInSession(response);
    } catch (error) {
      if (
        error
        && error.code === 'UserLambdaValidationException'
        && error.message.includes('USERNOTFOUND')
      ) {
        setExistingUser(false);
        setSignInSession({});
        sendOtpForUnregisteredUser(loginValue.mobileNumber);
      }
    }
  };

  /**
   * This method will get triggered when the customer is an existing user
   */
  const handleOtpCognitoSubmit = async () => {
    const otp = inputsRef.current.map((input) => input.value).join('');
    try {
      const response = await window.aws_amplify.Auth.sendCustomChallengeAnswer(
        signInSession,
        otp,
      );
      if (response.Session) {
        removeLocalStorage('ebookToken');
        removeLocalStorage('ebookExpiresIn');
        removeLocalStorage('ebookNumber');
        handleSetActiveRoute('login');
        setOtpError(true);
      } else if (response.signInUserSession) {
        analyticsVerifyOTP();
        setLocalStorage(
          'ebookToken',
          response.signInUserSession.accessToken.jwtToken,
        );
        setLocalStorage('ebookExpiresIn', expiresTimeInMilliSecond.toString());
        setLocalStorage('ebookNumber', response.username);
        setLocalStorage('ebookUserName', loginValue.name);
        handleSetActiveRoute('select-vehicle');
      }
    } catch (error) {
      setOtpError(true);
      handleSetActiveRoute('login');
    }
  };

  /**
   * This method is required to call the api for the new user coming to ebook for
   * first time
   * @param {user info json} user
   * @param {otp value} otp
   */
  const register = async (user, otp) => {
    const url = `${sdkDetails.gatewayUrl}customer/api/v1/user/register`;
    const registerXHR = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-type': 'application/json;',
        'x-app-id': '4',
      },
    });
    const response = await registerXHR.json();
    try {
      if (!response.error) {
        window.aws_amplify.Auth.signIn(loginValue.mobileNumber).then(
          (data1) => {
            // eslint-disable-next-line max-len
            window.aws_amplify.Auth.sendCustomChallengeAnswer(data1, otp).then(
              (response1) => {
                setLocalStorage(
                  'ebookToken',
                  response1.signInUserSession.accessToken.jwtToken,
                );
                setLocalStorage(
                  'ebookExpiresIn',
                  expiresTimeInMilliSecond.toString(),
                );
                analyticsVerifyOTP();
                setLocalStorage('ebookNumber', response1.username);
                setLocalStorage('ebookUserName', loginValue.name);
                handleSetActiveRoute('select-vehicle');
              },
              () => {
                setOtpError(true);
                removeLocalStorage('ebookToken');
                removeLocalStorage('ebookExpiresIn');
                removeLocalStorage('ebookNumber');
                handleSetActiveRoute('login');
              },
            );
          },
          () => {
            setOtpError(true);
            removeLocalStorage('ebookToken');
            removeLocalStorage('ebookExpiresIn');
            removeLocalStorage('ebookNumber');
            handleSetActiveRoute('login');
          },
        );
      }
    } catch (error) {
      removeLocalStorage('ebookToken');
      removeLocalStorage('ebookExpiresIn');
      removeLocalStorage('ebookNumber');
      handleSetActiveRoute('login');
    }
  };

  const registerCustomerInCognito = (user) => {
    const customerBody = {
      uuid: user.userUuid,
    };
    register(customerBody);
  };

  /**
   * This method is used to call the OTP for
   * new users
   */
  const handleOtpNewSubmit = async () => {
    const otp = inputsRef.current.map((input) => input.value).join('');
    const verifyOTP = await fetch(
      `${sdkDetails.gatewayUrl}customer/api/v1/otp/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ otp, contactInfo: loginValue.mobileNumber }),
        headers: {
          'Content-type': 'application/json;',
        },
      },
    );

    const response = await verifyOTP.json();
    try {
      if (!response.error) {
        if (response.data) {
          registerCustomerInCognito(response.data);
        } else {
          register(
            {
              customerRegisterReqDto: {
                businessType: 'EBOOK',
                firstName: loginValue.name,
                mobile: loginValue.mobileNumber,
              },
            },
            otp,
          );
        }
      } else {
        throw response.error;
      }
    } catch (error) {
      setOtpError(true);
      removeLocalStorage('ebookToken');
      removeLocalStorage('ebookExpiresIn');
      removeLocalStorage('ebookNumber');
      handleSetActiveRoute('login');
    }
  };
  /**
   * This method is used to find the current user is existing or new user
   * @param {Event} e
   * @returns call the method based on the exiting user or not
   */
  const verifyOtp = (e) => {
    e.preventDefault();
    if (existingUser) {
      handleOtpCognitoSubmit();
      return;
    }
    handleOtpNewSubmit();
  };
  /**
   * This function is used to validate and move the
   * cursor to the next input field in the OTP modal
   * @param {Event} event
   * @param {current input field} index
   */
  const validateAndMove = (event, index) => {
    const input = event.target;
    const { key } = event;
    if (
      key === 'Backspace'
      && input.value === ''
      && inputsRef.current[index - 1]
    ) {
      inputsRef.current[index - 1].focus();
    } else if (/^\d$/.test(input.value)) {
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    } else {
      input.value = '';
    }

    const otp = inputsRef.current.map((ele) => ele.value).join('');
    if (otp.length === 4) {
      setOtpButtonStatus(true);
    } else {
      setOtpButtonStatus(false);
    }
  };
  /**
   * To set the value in the input ref for the selected element
   * @param {Element} el
   * @param {current Index} index
   */
  const setInputRef = (el, index) => {
    inputsRef.current[index] = el;
  };
  /**
   * Close the modal on button click
   * @param {Event} e
   */
  const modalClose = (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-nested-ternary
    const type = e.target.classList.contains('edit') ? 'edit' : e.target.classList.contains('back') ? 'back' : '';
    if (type === 'edit') {
      document.querySelector('.cmp-login--form__container input[name="mobileNumber"]').value = '';
    }
    if (type === 'back' || type === 'edit') {
      document.querySelector('.cmp-login--form__container input[name="mobileNumber"]').focus();
      document.querySelector('.cmp-login--form__container input[name="name"]').focus();
    }
    setShowOTPModal(false);
    setIntervalTimer(coutdown);
    intervalTimer();
  };
  /**
   * This function is used to validate the entered mobile number
   * is in numberic order or not
   * @param {event} e
   * @param {key} key
   * @param {type} type
   */
  const validateNumber = (e, key) => {
    const { value } = e.target;
    if (/^\d+\.?\d*$/.test(value)) {
      setFormError((current) => ({ ...current, [`${key}-error`]: false }));
      const maskedValue = `${String(value).substring(0, 2)}xxxxxx${String(value).slice(-2)}`;
      setMobileNumberStatus(maskedValue);
    } else {
      setFormError((current) => ({ ...current, [`${key}-error`]: true }));
    }
  };

  const validateName = (e) => {
    const value = e.target.value.split(' ');
    let formattedValue = e.target.value;
    formattedValue = value.map((string) => {
      if (string !== '') {
        return String(string[0]).toUpperCase() + String(string).slice(1);
      }
      return String(string);
    });
    e.target.value = formattedValue.join(' ');
  };

  const resendOTPFun = (e) => {
    e.preventDefault();
    if (enableResend) {
      formSubmit(e);
    }
  };
  return html`
    <div class="cmp-login--form cmp-login--padding-left-right"  style="background-image: url(${image})">
      <div class="cmp-login--form__description">
        ${hnodeAs(config.subTitle, 'h4')}
        ${hnodeAs(config.title, 'h1')}
        ${hnodeAs(config.description, 'p')}
      </div>
      <div class="cmp-login--form__container">
        <form ref=${loginform} autocomplete="off" onsubmit=${(e) => formSubmit(e)}>
          ${hnodeAs(config.formTitle, 'h4')}
          ${hnodeAs(config.formSubTitle, 'p')}
          ${hnodeAs(config.signInText, 'a', { href: '#' })}
          <div class="cmp-login--form__container-name">
            <div class="field-container name-container">
              <input
                class="${formError.name ? 'error' : ''}"
                type="text"
                placeholder=${cloneElement(config.formName).props.children[0]}
                name="name"
                data-type="text"
                autocomplete="off"
                onClick=${() => analyticsFormStart()}
                onInput=${(e) => validateName(e)}
                onChange=${(e) => handleChange(e, 'name')}
              />
              ${formError.name ? hnodeAs(config.formRequired, 'p', {class: "error"}): ''}   
            </div>
          </div>
          <div class="cmp-login--form__container-mobile-number">
            <div class="field-container">
              <input
                class="${(formError.mobileNumber || formError['mobileNumber-error']) ? 'error' : ''}"
                type="text"
                placeholder=${hnodeAs(config.formMobile).props.children[0]}
                name="mobileNumber"
                maxlength="10"
                inputmode="numeric"
                autocomplete="off"
                maxLength="10"
                data-type="number"
                onClick=${() => analyticsFormStart()}
                onInput=${(e) => validateNumber(e, 'mobileNumber')}
                onChange=${() => handleChange()}
              />
              ${formError.mobileNumber ? hnodeAs(config.formRequired, 'p', {class: "error"}): ''}
              ${(formError['mobileNumber-error'] && !formError.mobileNumber) ? hnodeAs(config.formValid, 'p', {class: "error"}): ''}
            </div>
          </div>
          <button class="${!formError.error ? 'button-primary' : 'button-secondary'}">
            ${hnodeAs(config.formSubmit, 'span')}
          </button>
        </form>
      </div>
    </div>
          ${showOTPModal
    ? html`<div class="cmp-ebook--otp-verify-modal">
            <div class="cmp-ebook--otp-verify__left">
              ${hnodeAs(config.otpImage, 'span')}
              <div class="cmp-ebook--otp-verify__left-content">
                ${hnodeAs(config.otpLeftDescription, 'p')}
                ${hnodeAs(config.otpLeftHeading, 'h4')}
              </div>
            </div>
            <div class="cmp-ebook--otp-verify__right">
              <a
                href="#"
                class="close-modal"
                onClick=${(e) => modalClose(e)}
              ></a>
              <h3>
                <a
                  href="#"
                  class="modal-close back"
                  onClick=${(e) => modalClose(e)}
                ></a>
                  ${hnodeAs(config.otpTitle, 'span')}
              </h3>
              <p>
                ${hnodeAs(config.otpDescription, 'span')} ${mobileNumberStatus}
                <a
                  href="#"
                  class="modal-close edit"
                  onClick=${(e) => modalClose(e)}
                ></a>
              </p>
              <form autocomplete="off" onsubmit=${(e) => verifyOtp(e)}>
                <div class="otp-input-container">
                  ${[0, 1, 2, 3].map(
    (_, index) => html` <input
                      class="otp-input"
                      type="text"
                      maxlength="1"
                      inputmode="numeric"
                      onInput=${(event) => validateAndMove(event, index)}
                      onKeyDown=${(event) => validateAndMove(event, index)}
                      ref=${(el) => setInputRef(el, index)}
                    />`,
  )}
                </div>
                <div class="otp-invalid-resend-container">
                ${optError ? hnodeAs(config.otpInvalidText, 'p', {class: 'error'}) : ''}
                <a href="#" class="resend-otp" onclick=${(e) => resendOTPFun(e)}>${hnodeAs(config.resendOTP, 'span')} ${!enableResend ? html`<span>${resendOTP}</span>` : ''}</a>
                </div>
                <button class="${otpButtonStatus ? 'button-primary' : 'button-secondary'}">${hnodeAs(config.otpButton, 'span')}</button>
              </form>
            </div>
          </div>`
    : ''}
  `;
}

export default LoginForm;
