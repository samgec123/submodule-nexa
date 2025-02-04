import '../../../scripts/vendor/preact.js';
import '../../../scripts/vendor/preact-hooks.js';
import '../../../scripts/vendor/htm-preact.js';
import decorateMultiStepForm from './multi-step-form.js';
import ApplicantDetails from './applicant-details-step.js';
import AddressDetails from './address-details-step.js';
import UploadDocuments from './upload-documents-step.js';
import FinalizeLoan from './finalize-loan-step.js';

export default async function decorate(block) {
  await decorateMultiStepForm(block, {
    'applicant-details-step': ApplicantDetails,
    'address-details-step': AddressDetails,
    'upload-documents-step': UploadDocuments,
    'finalize-loan-step': FinalizeLoan,
  });
}
