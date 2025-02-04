import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import EmptySummaryContent from './EmptySummaryContent.js';
import {
  CloseIcon, EditSummaryIcon, shareIcon, ArrowDownIcon, StrokeLine, BackNavigationSummary,
} from '../Icons.js';
import utility from '../../../utility/utility.js';
import { useState } from '../../../commons/scripts/vendor/preact-hooks.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';
import interaction from '../interaction.js';

const categoryMapping = { Interior: 'INT', Exterior: 'EXT' };

const SummaryDetailsPopup = ({
  selectedVariant,
  selectedColor,
  addedAccessories,
  handleCloseSummaryPopup,
  accessoriesPrice,
  totalPrice,
  categoriesData,
  setSelectedParentCategory,
  isSummaryEditable,
  isRedirectedToColor,
  setIsRedirectedToColor,
  isRedirectedToVariant,
  setIsRedirectedToVariant,
  setActiveTab,
  setIsChangeMode,
  setPreviousSelectedVariant,
  setShowSummary,
  handleTabClick,
  connectToDealerLink,
  connectToDealerLabel,
  grandTotalLabelEl,
  modelLabelEl,
  variantLabelEl,
  colorLabelEl,
  basicSelectionLabelEl,
  checkoutCtaLabelEl,
}) => {
  const isMobile = utility.isMobileView(); // Check if in mobile view
  const [isExpandedBasicSel, setIsExpandedBasicSel] = useState(false);
  const [isExpandedAcc, setIsExpandedAcc] = useState(false);
  const grandTotalLabel = grandTotalLabelEl?.textContent?.trim() || '';
  const modelLabel = modelLabelEl?.textContent?.trim() || '';
  const variantLabel = variantLabelEl?.textContent?.trim() || '';
  const colorLabel = colorLabelEl?.textContent?.trim() || '';
  const basicSelectionLabel = basicSelectionLabelEl?.textContent?.trim() || '';
  const checkoutCtaLabel = checkoutCtaLabelEl?.textContent?.trim() || '';

  const toggleBasicSel = () => {
    setIsExpandedBasicSel(!isExpandedBasicSel);
  };
  const toggleAccessories = () => {
    setIsExpandedAcc(!isExpandedAcc);
  };

  const separateCategories = (categoriesData, accessories) => {
    const categoryMapping = {};

    // Build a mapping of partNum to parentCategoryDesc
    categoriesData?.data?.parentCategories?.forEach((parentCategory) => {
      parentCategory.subCategories.forEach((subCategory) => {
        subCategory.accessories.forEach((accessory) => {
          categoryMapping[accessory.partNum] = parentCategory.parentCategoryDesc;
        });
      });
    });

    // Dynamically separate accessories into categories
    const separatedCategories = {};

    accessories.forEach((accessory) => {
      const category = categoryMapping[accessory.partNum];
      if (category) {
        if (!separatedCategories[category]) {
          separatedCategories[category] = []; // Initialize category if not already present
        }
        separatedCategories[category].push(accessory);
      }
    });

    return separatedCategories;
  };

  const categorisedData = separateCategories(categoriesData, addedAccessories);

  const getComponentTitle = () => `${document.querySelector('.summary-popup-container .name')?.textContent || ''}-${document.querySelector('.summary-popup-container .variant-name')?.textContent || ''}`;

  return html`
    ${isMobile ? html`
            <div class="summary-heading-mobile">
              <div onClick=${() => setShowSummary(false)}><${BackNavigationSummary}/></div>
              <div class="summary-label">Summary</div>
            </div>
            <div class='summary-panel'>
            <div class="accordion-div">
              <div class="accordion-label">${basicSelectionLabel}</div>
                <p class="accordion-price">₹ ${interaction.formatDisplayPrice(selectedVariant?.variantPrice)}</p>
                <button class="accordion-arrow  ${isExpandedBasicSel ? 'transform rotate-180' : ''}" 
                onClick=${toggleBasicSel}><${ArrowDownIcon} />
                </button>
            </div>
            ${isExpandedBasicSel && html`
              <div class="basic-sel-expanded">
                <div class="basic-sel-row">
                  <p class="basic-sel-label">${modelLabel}</p>
                  <p class="basic-sel-value">${document.title}</p>
                </div>
                <div class="stroke-line"><${StrokeLine} /></div>
                <div class="basic-sel-row">
                  <p class="basic-sel-label">${variantLabel}</p>
                  <p class="basic-sel-value">${selectedVariant?.variantName}${isSummaryEditable && html`<span id="editVariant" 
                  onClick=${() => {
    handleTabClick('explore');
    setIsRedirectedToVariant(true);
    setPreviousSelectedVariant(selectedVariant);
  }}>
                  <${EditSummaryIcon}/></span>`}</p>
                </div>
                <div class="stroke-line"><${StrokeLine} /></div>
                <div class="basic-sel-row">
                  <p class="basic-sel-label">${colorLabel}</p>
                  <p class="basic-sel-value">${selectedColor?.eColorDesc}${isSummaryEditable && html`<span id="editColor" onClick=${() => {
  setShowSummary(false);
  handleTabClick('explore');
}}><${EditSummaryIcon}/></span>`}</p>
                </div>
              </div>
            `}
            <div class="accordion-div">
              <p class="accordion-label">Accessories</p>
              <p class="accordion-price">₹ ${interaction.formatDisplayPrice(accessoriesPrice)}</p>
              <button class="accordion-arrow  ${isExpandedAcc ? 'transform rotate-180' : ''}" onClick=${toggleAccessories}><${ArrowDownIcon} /></button>
            </div>
            ${isExpandedAcc && html`<div class="category-details">
                ${Object.entries(categorisedData)?.map(
    ([category, accessories]) => html`
                      <div class="category-section">
                        <div class="category-heading">
                          ${category}<span
                            class="edit-icon"
                            onClick=${() => {
    setSelectedParentCategory(categoryMapping[category]);
    handleCloseSummaryPopup();
  }}
                            ><${EditSummaryIcon}
                          /></span>
                        </div>
                        <div class="accessory-list">
                          ${accessories?.map(
    (accessory) => html`
                              <div class="accessory-item">
                                <span class="accessory-name"
                                  >${accessory.partDesc} x ${accessory.qty}</span
                                >
                                <span class="accessory-price"
                                  >₹${accessory.price * (accessory.qty || 1)}</span
                                >
                              <div class="separation-line"></div>
                              </div>
                            `,
  )}
                        </div>
                      </div>
                    `,
  )}
              </div>
            `}
            </div>
         
          <div class="ctrl-block">
              <div class="total-price-section">
                <p class="total-label">Total</p>
                <p class="total-price-amount">₹ ${interaction.formatDisplayPrice(totalPrice)}</p>
              </div>
              <div class="stroke-line"><${StrokeLine} /></div>
              <div class="btn btn-primary" onClick=${() => setActiveTab('saveshare')}>${checkoutCtaLabel}</div>
              <div class="btn btn-secondary" onClick=${(e) => {
    const urlWithModelCode = `${connectToDealerLink}?modelCd=${selectedVariant?.modelCd || ''}`;
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
    configuratorDataLayerUtils.pushClickToDataLayer(e, getComponentTitle());
    window.location.href = urlWithModelCode;
  }}>${connectToDealerLabel}</div>
          </div>
     
      ` : html`
      <div class="summary-popup-overlay">
      <div class="summary-popup-container">
        <div class="car-details">
          <div class="car-name">
            <div class="name">${document.title}</div>
            <span
              class="variant-color"
              style=${`background-color: ${selectedColor.hexCode}`}
            ></span>
          </div>
          <div class="selected-variant">
            <span class="variant-name">${selectedVariant?.variantName}</span>
            <span class="variant-tech"
              >${selectedVariant?.variantTechnology}</span
            >
            <span class="edit-icon" title='Edit' onClick=${() => {
    setActiveTab('explore');
    setIsChangeMode(true);
    setIsRedirectedToVariant(true);
    setPreviousSelectedVariant(selectedVariant);
  }}><${EditSummaryIcon} /></span>
          </div>
        </div>
        ${!addedAccessories.length
    ? html`<${EmptySummaryContent}
              totalPrice=${totalPrice}
              handleCloseSummaryPopup=${handleCloseSummaryPopup}
              grandTotalLabel=${grandTotalLabel}
            />`
    : html` <div class="category-details">
         <div class="accessory-item">
         <span class="accessory-name">${basicSelectionLabel}</span>
         <span class="accessory-price">₹ ${interaction.formatDisplayPrice(selectedVariant?.variantPrice)}</span>
         </div>
                ${Object.entries(categorisedData)?.map(
    ([category, accessories]) => html`
                      <div class="category-section">
                        <div class="category-heading">
                          ${category}<span
                            class="edit-icon"
                            onClick=${() => {
    setSelectedParentCategory(categoryMapping[category]);
    handleCloseSummaryPopup();
  }}
                            ><${EditSummaryIcon}
                          /></span>
                        </div>
                        <div class="accessory-list">
                          ${accessories?.map(
    (accessory) => html`
                              <div class="accessory-item">
                                <span class="accessory-name"
                                  >${accessory.partDesc} x ${accessory.qty}</span
                                >
                                <span class="accessory-price"
                                  >₹${accessory.price * (accessory.qty || 1)}</span
                                >
                              </div>
                            `,
  )}
                        </div>
                      </div>
                    `,
  )}
              </div>
              <div class="total-accessories-section">
                <div class="total-label">Customisation</div>
                <div class="total-price">₹ ${interaction.formatDisplayPrice(accessoriesPrice)}</div>
              </div>
              <div class="total-price-section">
                <div class="grand-total-label">${grandTotalLabel}</div>
                <div class="grand-total-value">₹ ${interaction.formatDisplayPrice(totalPrice)}</div>
              </div>`}
        <div class="checkout-section">
         <button class="connect-dealer-btn" onClick=${(e) => {
    const urlWithModelCode = `${connectToDealerLink}?modelCd=${selectedVariant?.modelCd || ''}`;
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
    configuratorDataLayerUtils.pushClickToDataLayer(e, getComponentTitle());
    window.open(urlWithModelCode);
  }}>${connectToDealerLabel}</button>
          <button class="checkout-btn" onClick=${(e) => {
    setActiveTab('saveshare');
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
    configuratorDataLayerUtils.pushClickToDataLayer(e, getComponentTitle());
  }}>${checkoutCtaLabel}</button>
        </div>
        <div
          class="share-button"
          style="display:none"
          onClick=${(e) => {
    e.stopPropagation();
  }}
        >
          <${shareIcon} />
        </div>
        <div
          class="close-button"
          onClick=${(e) => {
    e.stopPropagation();
    handleCloseSummaryPopup();
  }}
        >
          <${CloseIcon} />
        </div>
      </div>
    </div>
      `}
  `;
};

export default SummaryDetailsPopup;
