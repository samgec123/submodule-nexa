import { useEffect, useRef, useState } from '../../../commons/scripts/vendor/preact-hooks.js';
import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  RemoveIcon, AddIcon, TickIcon, InfoIcon, ChevronRight, ChevronLeft, AddRemoveAccSvg,
} from '../Icons.js';
import utility from '../../../utility/utility.js';
import interaction from '../interaction.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';

const AccessoriesList = ({
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
  removeBtnLabelEl,
  totalPrice,
  totalAmountLabelEl,
  viewSummaryCTALabelEl,
  handleAccessoryClick,
  isAccessoryInPreview,
  selectedParentCategory,
  selectedSubCategory,
  categoriesData,
  selectedColor,
  selectedVariant,
}) => {
  const [visibleCount, setVisibleCount] = useState(12); // Initial count of visible accessories
  const [currentPage, setCurrentPage] = useState(1); // Mobile pagination
  const isMobile = utility.isMobileView(); // Check if in mobile view
  const noSearchLabel = noSearchLabelEl?.textContent?.trim() || '';
  const addBtnLabel = addBtnLabelEl?.textContent?.trim() || '';
  const removeBtnLabel = removeBtnLabelEl?.textContent?.trim() || '';
  const totalAmountLabel = totalAmountLabelEl?.textContent?.trim() || '';
  const viewSummaryCTALabel = viewSummaryCTALabelEl?.textContent?.trim() || '';

  function getDesktopThumbnailUrl(ccImageUrls) {
    const filteredUrls = ccImageUrls.filter((url) => url.includes('desktop/96x96'));
    return filteredUrls.length > 0 && `${publishDomain}${filteredUrls[0]}`;
  }
  function getMobileThumbnailUrl(ccImageUrls) {
    const filteredUrls = ccImageUrls.filter((url) => url.includes('mobile/96x96'));
    return filteredUrls.length > 0 && `${publishDomain}${filteredUrls[0]}`;
  }

  const containerRef = useRef(null);
  const [enableLeftArrow, setEnableShowLeftArrow] = useState(false);
  const [enableRightArrow, setEnableShowRightArrow] = useState(true);
  const itemWidth = useRef(0); // Store the width of one carousel item

  // Variables for touch gestures
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  useEffect(() => {
    document.querySelector('.accessories-list').scrollTo({ top: 0, behavior: 'smooth' });
    setVisibleCount(12); // Reset to initial count whenever category changes
    setCurrentPage(1);
  }, [selectedParentCategory, selectedSubCategory]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  const handlePageChange = (page) => {
    document.querySelector('.accessories-list').scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const itemsPerPage = 12;
  const totalPages = Math.ceil(subCategoryAccessories.length / itemsPerPage);
  const paginatedItems = subCategoryAccessories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;

    const scrollAmount = itemWidth.current; // Adjust scroll distance
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      document.querySelector('.accessories-list').scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentPage(Math.max(1, currentPage - 1)); // Go to previous page
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      document.querySelector('.accessories-list').scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentPage(Math.min(totalPages, currentPage + 1)); // Go to next page
    }
    updateArrowVisibility();
  };

  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;

    // Disable left arrow when at the first page
    setEnableShowLeftArrow(currentPage > 1);
    // Disable right arrow when at the last page
    setEnableShowRightArrow(currentPage < totalPages);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX; // Record start touch position
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX; // Record end touch position
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // Minimum distance for swipe recognition

    if (swipeDistance > swipeThreshold) {
      // Swipe left
      handleScroll('right');
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe right
      handleScroll('left');
    }
  };
  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.pagination-button');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth;
    } else {
      console.warn('Pagination button not found');
    }
  };
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    calculateItemWidth();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [subCategoryAccessories.length, totalPages]);
  const handleResize = () => {
    calculateItemWidth();
  };

  useEffect(() => {
    updateArrowVisibility();
  }, [currentPage]);

  return html`
    <div class="accessories-list">
      ${subCategoryAccessories.length > 0 ? html`
          ${isMobile ? paginatedItems?.map((accessory) => {
    const thumbnailUrl = getMobileThumbnailUrl(accessory.ccImageUrls || []);
    return html`
            <div 
              class="accessory-item ${isAccessoryInPreview(accessory) ? 'preview' : ''}"
              onClick=${(e) => handleAccessoryClick(accessory)}
            >
              <div class="accessory-image">
                  <img src=${thumbnailUrl} />
                  <button className="info-icon-button" onClick=${(e) => {
    e.stopPropagation();
    handleInfoClick(accessory);
  }
}
                   >
                   ${accessory.ccPart3dId === null ? html`<${InfoIcon} />` : html``}
                  </button>
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
                    <div class="vertical-separator"></div>
                    <span class="count-action">${addedAccessories.find((item) => item.partNum === accessory.partNum)?.qty || 0}</span>
                    <div class="vertical-separator"></div>
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
  }) : subCategoryAccessories.slice(0, visibleCount)?.map((accessory) => {
    const thumbnailUrl = getDesktopThumbnailUrl(accessory.ccImageUrls || []);
    return html`
            <div 
              class="accessory-item ${isAccessoryInPreview(accessory) ? 'preview' : ''}"
              onClick=${(e) => handleAccessoryClick(accessory)}
            >
              <div class="accessory-image">
                  <img src=${thumbnailUrl} />
                  <button className="info-icon-button" onClick=${(e) => {
    e.stopPropagation();
    handleInfoClick(accessory);
  }
}
                   >
                   ${accessory.ccPart3dId === null ? html`<${InfoIcon} />` : html``}
                  </button>
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
          ${isMobile && totalPages > 0 && html`    
          <div class="pagination">
            <div class="pagination-arrow ${enableLeftArrow ? '' : 'disabled'}" onClick=${() => handleScroll('left')} ><${ChevronLeft}/></div>
             <div ref=${containerRef} id="navMenu" class="page-buttons" onTouchStart=${handleTouchStart}
        onTouchEnd=${handleTouchEnd}>
            ${[...Array(totalPages)]?.map((_, index) => html`
              <button 
                class="pagination-button ${currentPage === index + 1 ? 'active' : ''}"
                onClick=${() => handlePageChange(index + 1)}
              >
                <div class="page-number">${index + 1}</div>
              </button>
            `)} 
              </div>
            <div class="pagination-arrow ${enableRightArrow ? '' : 'disabled'}" onClick=${() => handleScroll('right')}><${ChevronRight}/></div>
          </div>
        `}
          ${!isMobile && visibleCount < subCategoryAccessories.length && subCategoryAccessories.length > 12 && html`
            <button class="load-more-button" onClick=${handleLoadMore}>
              Load More
            </button>
          `}
      ` : html`
        <div class="no-search-div"><p class="no-search-label">${noSearchLabel}</p></div>
      `}
      ${!isMobile && addedAccessories.length === 0 && html`
        <div class="price-section">     
            <div class="total-price-section">
              <div class="total-label">
                ${totalAmountLabel}
              </div>
              <div class="total-price">
                ₹ ${interaction.formatDisplayPrice(totalPrice)}
              </div>
            </div>
          
        <div class="price-section-button">
          <div class="price-section-label" onClick=${(e) => {
    handleOpenSummaryPopup(); configuratorDataLayerUtils.pushClickToDataLayer(e, viewSummaryCTALabel);
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
  }}>${viewSummaryCTALabel}</div>
        </div>       
      </div>
      `}
      ${isMobile && addedAccessories.length === 0 && html`
        <div class="price-section-button">
          <div class="price-section-label" onClick=${(e) => {
    handleOpenSummaryPopup(); configuratorDataLayerUtils.pushClickToDataLayer(e, viewSummaryCTALabel);
    configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
  }}>${viewSummaryCTALabel}</div>
        </div> 
      `}    
  </div>
  `;
};

export default AccessoriesList;
