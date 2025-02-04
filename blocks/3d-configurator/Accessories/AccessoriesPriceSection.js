import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import utility from '../../../utility/utility.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';
import interaction from '../interaction.js';

const AccessoriesPriceSection = ({
  handleOpenSummaryPopup,
  addedAccessories,
  accessoriesPrice,
  totalPrice,
  acceTitleLabelEl,
  totalAmountLabelEl,
  viewSummaryCTALabelEl,
  setInQuickView,
  categoriesData,
  selectedColor,
  selectedVariant,
}) => {
  const isMobile = utility.isMobileView();
  const acceTitleLabel = acceTitleLabelEl?.textContent?.trim() || '';
  const totalAmountLabel = totalAmountLabelEl?.textContent?.trim() || '';
  const viewSummaryCTALabel = viewSummaryCTALabelEl?.textContent?.trim() || '';

  return html`
      <div class="price-section">
        ${!isMobile && html`
          ${addedAccessories.length > 0 && html`
            <div class="total-accessories-section">
              <div class="total-label" onClick=${(e) => {
    e.stopPropagation();
    setInQuickView(true);
  }}>
                ${acceTitleLabel}: ${addedAccessories.length}
              </div>
              <div class="total-price">
                ₹ ${interaction.formatDisplayPrice(accessoriesPrice)}
              </div>
            </div>
            `}
            <div class="total-price-section">
              <div class="total-label">
                ${totalAmountLabel}
              </div>
              <div class="total-price">
                ₹ ${interaction.formatDisplayPrice(totalPrice)}
              </div>
            </div>
          `}
        <div class="price-section-button">
          <div class="price-section-label" onClick=${(e) => {
    handleOpenSummaryPopup(); configuratorDataLayerUtils.pushClickToDataLayer(e, viewSummaryCTALabel);
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
  }}>${viewSummaryCTALabel}</div>
        </div>
      </div>
    `;
};

export default AccessoriesPriceSection;
