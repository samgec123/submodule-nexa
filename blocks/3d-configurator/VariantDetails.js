import { html } from '../../commons/scripts/vendor/htm-preact.js';

const VariantDetails = ({
  labels,
  variantData,
  isChangeMode,
  isChangeVariantMobile,
  onMoreClick,
  isRedirectedToVariant,
}) => {
  const specData = variantData?.specificationCategory
    ?.map((item) => {
      const obj = {};

      item.specificationAspect.forEach((aspect) => {
        if (aspect.transmissionType) {
          obj.transmissionType = aspect.transmissionType;
        }
        if (aspect.fuelType) obj.fuelType = aspect.fuelType;
        if (aspect.fuelEfficiency) obj.fuelEfficiency = aspect.fuelEfficiency;
        if (aspect.seatingCapacity) {
          obj.seatingCapacity = aspect.seatingCapacity;
        }
      });

      return Object.keys(obj).length > 0 ? obj : null;
    })
    .filter((item) => item !== null);

  return html`
    ${isChangeVariantMobile || onMoreClick || isRedirectedToVariant
    ? html` <div class="variant__specs">
          <div class="spec-item">
            <p class="spec-value">${specData[0]?.transmissionType || 'N/A'}</p>
            <p class="spec-label">${labels?.transmissionLabel}</p>
          </div>

          <div class="spec-item">
            <p class="spec-value">
              ${specData[0]?.fuelEfficiency || 'N/A'} kmpl
            </p>
            <p class="spec-label">${labels?.mileageLabel}</p>
          </div>
          <div class="spec-item">
            <p class="spec-value">${specData[0]?.fuelType || 'N/A'}</p>
            <p class="spec-label">${labels?.fuelTypeLabel}</p>
          </div>
          <div class="spec-item">
            <p class="spec-value">${variantData?.airbags || 'N/A'}</p>
            <p class="spec-label">${labels?.airbagLabel}</p>
          </div>
        </div>`
    : html`
          <div class="variant__specs">
            <div class="spec-item">
              <p class="spec-label">${labels?.transmissionLabel}</p>
              <p class="spec-value">
                ${specData[0]?.transmissionType || 'N/A'}
              </p>
            </div>
            <div class="spec-item">
              <p class="spec-label">${labels?.fuelTypeLabel}</p>
              <p class="spec-value">${specData[0]?.fuelType || 'N/A'}</p>
            </div>
            <div class="spec-item">
              <p class="spec-label">${labels?.mileageLabel}</p>
              <p class="spec-value">
                ${specData[0]?.fuelEfficiency || 'N/A'} kmpl
              </p>
            </div>
            <div class="spec-item">
              <p class="spec-label">${labels?.airbagLabel}</p>
              <p class="spec-value">${variantData?.airbags || 'N/A'}</p>
            </div>
          </div>
        `}
    ${onMoreClick && html`<div class="horizontal-line"></div>`}
    ${!isChangeMode
    && !isChangeVariantMobile
    && !isRedirectedToVariant
    && html`<div class="variant__features">
      <p class="label">${labels?.featuresLabel}</p>
      <ul class="features-list">
        ${variantData?.featuresHighlights?.map((feature) => (onMoreClick
    ? html`<li class="list-item-2">${feature}</li>`
    : html`<li class="list-item">${feature}</li>`))}
      </ul>
    </div> `}
  `;
};

export default VariantDetails;
