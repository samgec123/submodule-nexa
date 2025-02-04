/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../vendor/htm-preact.js';
import Banner from './banner.js';
import LoginStepsInfo from './steps-info.js';

function Login({ config }) {
  return html`
    <div class="cmp-login">
    <link rel="preload" href="/blocks/ebook-module/ebook-journey/ebook-journey.css" />
      <${Banner} config=${config} />
      <div class="cmp-login--padding-left-right">
        <${LoginStepsInfo} config=${config} />
      </div>
    </div> 
  `;
}

Login.parse = (block) => {
  // eslint-disable-next-line max-len
  const [bannerImageWrapper, subTitleWrapper, titleWrapper, descriptionWrapper, formWrapper, stepsInfoWrapper, firstStepWrapper, secondStepWrapper, thirdStepWrapper, otpWrapper, resendOTPWrapper] = [...block.children]
    .map((row) => row.firstElementChild);
  const bannerImage = bannerImageWrapper.firstElementChild;
  const subTitle = subTitleWrapper.firstElementChild;
  const title = titleWrapper.firstElementChild;
  const description = descriptionWrapper.firstElementChild;
  const resendOTP = resendOTPWrapper.firstElementChild;
  // eslint-disable-next-line max-len
  const [formTitle, formSubTitle, signInText, formName, formMobile, formSubmit, formRequired, formValid] = [...formWrapper.children];
  const [stepsInfoTitle, StepsInfoDescription] = [...stepsInfoWrapper.children];
  const [firstNumber, firstTitle, firstDescription] = [...firstStepWrapper.children];
  const [secondNumber, secondTitle, secondDescription] = [...secondStepWrapper.children];
  const [thirdNumber, thirdTitle, thirdDescription] = [...thirdStepWrapper.children];
  const [otpTitle, otpDescription, otpButton, otpLeftHeading, otpLeftDescription, otpImage, otpInvalidText] = [...otpWrapper.children];
  return {
    bannerImage,
    subTitle,
    title,
    description,
    formTitle,
    formSubTitle,
    signInText,
    formName,
    formMobile,
    formSubmit,
    stepsInfoTitle,
    StepsInfoDescription,
    firstNumber,
    firstTitle,
    firstDescription,
    secondNumber,
    secondTitle,
    secondDescription,
    thirdNumber,
    thirdTitle,
    thirdDescription,
    otpTitle,
    otpDescription,
    otpButton,
    resendOTP,
    otpImage,
    otpLeftHeading,
    otpLeftDescription,
    otpInvalidText,
    formRequired,
    formValid
  };
};

Login.defaults = {
  submitButton: html`<p>Send OTP</p>`,
};

export default Login;
