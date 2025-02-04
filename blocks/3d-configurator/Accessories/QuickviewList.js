import { useEffect, useRef, useState } from '../../../commons/scripts/vendor/preact-hooks.js';
import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  RemoveIcon, AddIcon, TickIcon, InfoIcon, ChevronRight, ChevronLeft, AddRemoveAccSvg, QuickViewCrossIcon, StrokeQuickViewSection,
} from '../Icons.js';
import utility from '../../../utility/utility.js';
import interaction from '../interaction.js';

const QuickviewList = ({
  handleOpenSummaryPopup, subCategoryAccessories,
  addedAccessories,
  handleAddAccessory,
  handleRemoveAccessory,
  isAccessoryAdded,
  handleInfoClick,
  setShowInfoPopup,
  setInfoAccessory,
  publishDomain,
  noSearchLabelEl,
  addBtnLabelEl,
  totalPrice,
  totalAmountLabelEl,
  viewSummaryCTALabelEl,
  quickViewLabelEl,
  setInQuickView,
  accessoriesPrice,
  acceTitleLabelEl,
}) => {
  const [visibleCount, setVisibleCount] = useState(12); // Initial count of visible accessories
  const isMobile = utility.isMobileView(); // Check if in mobile view
  const noSearchLabel = noSearchLabelEl?.textContent?.trim() || '';
  const addBtnLabel = addBtnLabelEl?.textContent?.trim() || '';
  const totalAmountLabel = totalAmountLabelEl?.textContent?.trim() || '';
  const viewSummaryCTALabel = viewSummaryCTALabelEl?.textContent?.trim() || '';
  const acceTitleLabel = acceTitleLabelEl?.textContent?.trim() || '';
  const quickViewLabel = quickViewLabelEl?.textContent?.trim() || '';

  function getDesktopThumbnailUrl(ccImageUrls) {
    const filteredUrls = ccImageUrls.filter((url) => url.includes('desktop/96x96'));
    return filteredUrls.length > 0 && `${publishDomain}${filteredUrls[0]}`;
  }
  useEffect(() => {
    setVisibleCount(12); // Reset to initial count whenever category changes
  }, [addedAccessories]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  return html`
  <div class="quickview__details-expanded">
    <div class="quickview-heading-div">
      <div class="quickview-heading">
      ${quickViewLabel}
      </div>
      <button onClick=${(e) => {
    e.stopPropagation();
    setInQuickView(false);
  }}>
              <${QuickViewCrossIcon} />
      </button>
    </div>
    <div class="total-accessories-section">
        <div class="total-label">
                  ${acceTitleLabel}: ${addedAccessories.length}
        </div>
        <div class="total-price">
                ₹ ${accessoriesPrice}
        </div>
    </div> 
    <div class="accessories-list">
      ${addedAccessories.length > 0 ? html`
          ${addedAccessories.slice(0, visibleCount)?.map((accessory) => {
    const thumbnailUrl = getDesktopThumbnailUrl(accessory.ccImageUrls || []);
    return html`
            <div 
              class="accessory-item"
            >
              <div class="accessory-image">
                  <img src=${thumbnailUrl} />
              </div>
              <div class="accessory-details">
                <div class="accessory-desc">
                  <p class="accessory-heading">${accessory.partDesc}</p> 
                  ${isAccessoryAdded(accessory) && html`<div class="tick-icon"><${TickIcon} /></div>`}
                </div>
                <div class="accessory-ctrl">   
                  <p class="accessory-price">₹${accessory.price}</p>
                  <div class="count-container">
                  ${isAccessoryAdded(accessory)
    ? html`<${AddRemoveAccSvg} />
                    <div class="count-ctrl">
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleRemoveAccessory(accessory);
  }}
                    >
                      -
                    </button>
                    <div class="accessory-vertical-separator"></div>
                    <span class="count-action">${addedAccessories.find((item) => item.partNum === accessory.partNum)?.qty || 0}</span>
                    <div class="accessory-vertical-separator"></div>
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleAddAccessory(accessory);
  }}
                    >
                      +
                    </button>
                    </div>`
    : html`<button class="accessory-action" onClick=${(e) => {
      e.stopPropagation();
      handleAddAccessory(accessory);
    }}><div class="add-text">${addBtnLabel}</div><div class="add-icon"><${AddIcon} /></div></button>`
}
                  </div>
                </div>
              </div>                     
            </div>
          `;
  })}
          ${!isMobile && visibleCount < addedAccessories.length && addedAccessories.length > 12 && html`
            <button class="load-more-button" onClick=${handleLoadMore}>
              Load More
            </button>
          `}
      ` : html`
        <div class="no-search-div"><p class="no-search-label">${noSearchLabel}</p></div>
      `}
    </div>
    ${!isMobile && addedAccessories.length > 0 && html`
      <div class="price-section">
          <div class="stroke-quickview"></div>
          <div class="total-price-section">           
            <div class="total-label">
              ${totalAmountLabel}
            </div>
            <div class="total-price">
              ₹ ${totalPrice}
            </div>
          </div>
          <div class="price-section-button">
            <div class="price-section-label" onClick=${handleOpenSummaryPopup}>${viewSummaryCTALabel}</div>
          </div>       
      </div>
    `} 
  </div>
`;
};

export default QuickviewList;
