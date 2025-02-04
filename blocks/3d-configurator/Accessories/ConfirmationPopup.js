import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { ErrorIcon, AccessoryCloseIcon, AccessoryCloseCircleIcon } from '../Icons.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';

const ConfirmationPopup = ({
  showPopup,
  handleConfirmAdd,
  handleCancelAdd,
  conflictingAccessories,
  acceWarningMsgTitleLabelEl,
  acceWarningMsgSubTitleLabelEl,
  acceWarningProceedLabelEl,
  warnCtaOneLabelEl,
  warnCtaTwolabelEl,
  heading,
  description,
  confirmationText,
  revertBtnText,
  confirmBtnText,
  isSummaryFlow,
  handleOpenSummaryPopup,
  setShowSummary,
  setShowPopup,

}) => {
  const acceWarningMsgTitleLabel = acceWarningMsgTitleLabelEl?.textContent?.trim() || '';
  const acceWarningMsgSubTitleLabel = acceWarningMsgSubTitleLabelEl?.textContent?.trim() || '';
  const acceWarningProceedLabel = acceWarningProceedLabelEl?.textContent?.trim() || '';
  const warnCtaOneLabel = warnCtaOneLabelEl?.textContent?.trim() || '';
  const warnCtaTwolabel = warnCtaTwolabelEl?.textContent?.trim() || '';

  const getTitle = () => configuratorDataLayerUtils.getComponentTitle('.confirmation-text-heading');

  if (!showPopup) return null;
  return html`
    <div class="popup-overlay">
      <div class="popup-container">
        <div class="close-acc-popup" onClick=${() => setShowPopup(false)}>
          <div class="accessory-popup-circle-icon"><${AccessoryCloseCircleIcon} /></div>
          <div class="accessory-popup-close-icon"><${AccessoryCloseIcon} /></div>
        </div>
        <div class="error-icon"><${ErrorIcon} /></div>
        <div class="confirmation-text-heading">
          ${heading}
        </div>
       ${!isSummaryFlow && html`<div class="confirmation-text-description">
          ${description} <span class="conflicting-accessory-text">${conflictingAccessories?.map((accessory) => html`<strong>${accessory.partDesc}</strong>`)}</span>
        </div>`}
        <div class="confirmation-text">
          ${confirmationText}
        </div>
        <div class="confirmation-buttons">        
          ${!isSummaryFlow ? html`
          <button onClick=${(e) => { handleConfirmAdd(); configuratorDataLayerUtils.pushClickToDataLayer(e, getTitle()); }} class="proceed-button">${confirmBtnText}</button>
          <button onClick=${(e) => { handleCancelAdd(); configuratorDataLayerUtils.pushClickToDataLayer(e, getTitle()); }} class="revert-button">${revertBtnText}</button>
          `
    : html`
         <button onClick=${(e) => {
    setShowPopup(false);
    setShowSummary(true);
    configuratorDataLayerUtils.pushClickToDataLayer(e, getTitle());
  }} class="proceed-button">${confirmBtnText}
          </button>
          <button onClick=${(e) => { handleCancelAdd(); configuratorDataLayerUtils.pushClickToDataLayer(e, getTitle()); }} class="revert-button">${revertBtnText}</button>
        `}
        </div> 
      </div>
    </div>
  `;
};

export default ConfirmationPopup;
