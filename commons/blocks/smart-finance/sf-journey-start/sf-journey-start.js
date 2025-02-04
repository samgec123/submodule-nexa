import '../../../scripts/vendor/preact.js';
import '../../../scripts/vendor/preact-hooks.js';
import '../../../scripts/vendor/htm-preact.js';
import decorateMultiStepFom from './multi-step-form.js';
import RequestOtpStep from './request-otp-step.js';
import RestorePreviousJourenyStep from './restore-previous-journey-step.js';
import BasicUserDetailsStep from './basic-user-details-step.js';

export default async function decorate(block) {
  await decorateMultiStepFom(block, {
    'request-otp-step': RequestOtpStep,
    'restore-previous-journey-step': RestorePreviousJourenyStep,
    'basic-user-details-step': BasicUserDetailsStep,
  });
}
