/* eslint-disable import/no-cycle */
/* eslint-disable import/no-unresolved */

import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef } from '../../../scripts/vendor/preact-hooks.js';
import {
  hnodeAs, replaceAndConvertNode, MultiStepFormContext,
} from './multi-step-form.js';

function RestorePreviousJourenyStep({ config }) {
  const { description, yesButton, noButton } = config;
  const { updateFormState, handleSetActiveRoute, formState } = useContext(MultiStepFormContext);
  const formRef = useRef();

  const updatedDescription = replaceAndConvertNode(hnodeAs(description, 'div'), 'carDesc', formState.carDesc);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (e.currentTarget.value === 'yes'){
      updateFormState((currentState) => ({
        ...currentState,
        answer: e.currentTarget.value, // Store the user's answer in the state
      }));
      window.location.href = formState?.redirectURL;
    }
    else{
      // Update the form state with the user's answer
      updateFormState((currentState) => ({
        ...currentState,
        answer: e.currentTarget.value, // Store the user's answer in the state
      }));

      // Move to the next step
      handleSetActiveRoute('basic-user-details-step');
    }

  };

  return html`
     <form ref=${formRef}>
      <div class="restore-previous-journey-step-description">
        ${hnodeAs(updatedDescription, 'div')}
      </div>
      <div class="restore-previous-journey-step-buttons">
        <button name="yes-or-no" onclick=${(e) => handleOnSubmit(e)} value="yes">
          ${hnodeAs(yesButton, 'span')}
        </button>
        <button name="yes-or-no" onclick=${(e) => handleOnSubmit(e)} value="no">
          ${hnodeAs(noButton, 'span')}
        </button>
      </div>
    </form>
  `;
}

RestorePreviousJourenyStep.parse = (block) => {
  const [description, buttonsWraper] = [...block.children]
    .map((row) => row.firstElementChild);
  const [yesButton, noButton] = [...buttonsWraper.children];
  return { description, yesButton, noButton };
};

RestorePreviousJourenyStep.defaults = {
  description: html`<p>Do you want to restore your previous journey?</p>`,
  yesButton: html`<button>Yes</button>`,
  noButton: html`<button>No</button>`,
};

export default RestorePreviousJourenyStep;
