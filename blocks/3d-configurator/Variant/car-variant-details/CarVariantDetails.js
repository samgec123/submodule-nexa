import { html } from '../../../../commons/scripts/vendor/htm-preact.js';
import { DownArrowIcon } from '../../Icons.js';
import VariantDetails from '../../VariantDetails.js';
import interaction from '../../interaction.js';

const CarVariantDetails = ({
  selectedVariant,
  interactionLabel,
  variantDetailsLabels,
  handleVariantChange,
  isChangeMode,
  setIsChangeMode,
  variantListLength,
}) => html`
    <div class="variant__details-expanded">
      <div class="variant-model horizontal-line">
        <div class="variant-name">
          ${selectedVariant?.variantName}
          <button class="toggleBtn" onClick=${handleVariantChange}>
            <${DownArrowIcon} />
          </button>
        </div>
        <div class="variant-sub-details">
          <p class="variant-sub-model">${selectedVariant?.variantTechnology}</p>
          <span class="seperator"></span>
          <p class="variant-price">
  ${selectedVariant?.variantPrice ? `${`${interactionLabel.rsLabel} ${
    interaction.formatDisplayPrice(selectedVariant?.variantPrice) || ''
  }`}` : ''}
          </p>
        </div>
      </div>

      <div class="toggleBtn">
      <${VariantDetails}
        labels=${variantDetailsLabels}
        variantData=${selectedVariant}
        isChangeMode=${isChangeMode}
      />
      </div>
    ${!variantListLength && html`<button
      class="confirm-cta toggleBtn"
      type="button"
      onClick=${() => setIsChangeMode((prev) => !prev)}
    >
      ${interactionLabel?.changeVariantLabel}
    </button>`}

    </div>
  `;

export default CarVariantDetails;
