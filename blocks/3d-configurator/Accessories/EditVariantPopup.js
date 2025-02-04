import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useRef,
  useEffect,
  useState,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import utility from '../../../utility/utility.js';
import {
  ErrorIcon,
  RemoveIcon,
  AddIcon,
  TickIcon,
  InfoIcon,
  ChevronRight,
  ChevronLeft,
  successIcon,
  NewReleases,
} from '../Icons.js';

const EditVariantPopup = ({
  handleTabClick,
  handleAddAccessory,
  handleRemoveAccessory,
  setConfirmedVariant,
  modelName,
  selectedVariant,
  publishDomain,
  isAccessoryAdded,
  addBtnLabelEl,
  handleConfirmAdd,
  handleCancelAdd,
  acceWarningMsgTitleLabelEl,
  acceWarningMsgSubTitleLabelEl,
  acceWarningProceedLabelEl,
  warnCtaOneLabelEl,
  warnCtaTwolabelEl,
  newAccessories,
  missingAccessories,
  accessoryType,
  setAccessoryType,
  handleRedirecttoSummary,
  handleRedirecttoAcc,
  removeBtnLabelEl,
  previousSelectedVariant,
  setSelectedVariant,
  handleReverttoSummary,
  newvariantPopupTitleEl,
  newvariantPopupSubTitleEl,
  newVariantPopUpCtaOneEl,
  newVariantPopUpCtaTwoEl,
  accNotAvlblTitleLabelEl,
  accNotAvailableLabelEl,
  accNotAvailableCTAOneLabelEl,
  accNotAvailableCTATwoLabelEl,
}) => {
  const acceWarningMsgTitleLabel = acceWarningMsgTitleLabelEl?.textContent?.trim() || '';
  const acceWarningMsgSubTitleLabel = acceWarningMsgSubTitleLabelEl?.textContent?.trim() || '';
  const acceWarningProceedLabel = acceWarningProceedLabelEl?.textContent?.trim() || '';
  const warnCtaOneLabel = warnCtaOneLabelEl?.textContent?.trim() || '';
  const warnCtaTwolabel = warnCtaTwolabelEl?.textContent?.trim() || '';
  const addBtnLabel = addBtnLabelEl?.textContent?.trim() || '';
  const removeBtnLabel = removeBtnLabelEl?.textContent?.trim() || '';
  const newvariantPopupTitle = newvariantPopupTitleEl?.textContent?.trim() || '';
  const newvariantPopupSubTitle = newvariantPopupSubTitleEl?.textContent?.trim() || '';
  const newVariantPopUpCtaOne = newVariantPopUpCtaOneEl?.textContent?.trim() || '';
  const newVariantPopUpCtaTwo = newVariantPopUpCtaTwoEl?.textContent?.trim() || '';
  const accNotAvlblTitleLabel = accNotAvlblTitleLabelEl?.textContent?.trim() || '';
  const accNotAvailableLabel = accNotAvailableLabelEl?.textContent?.trim() || '';
  const accNotAvailableCTAOneLabel = accNotAvailableCTAOneLabelEl?.textContent?.trim() || '';
  const accNotAvailableCTATwoLabel = accNotAvailableCTATwoLabelEl?.textContent?.trim() || '';

  function getDesktopThumbnailUrl(ccImageUrls) {
    const filteredUrls = ccImageUrls.filter((url) => url.includes('desktop/96x96'));
    return filteredUrls.length > 0 && `${publishDomain}${filteredUrls[0]}`;
  }
  const containerRef = useRef(null);
  const itemWidth = useRef(0); // Store the width of one carousel item
  const itemDot = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [enableleftArrow, setEnableLeftArrow] = useState(false);
  const [enableRightArrow, setEnableRightArrow] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;
    setEnableLeftArrow(container.scrollLeft > 0);
    setEnableRightArrow(
      container.scrollLeft + container.offsetWidth < container.scrollWidth,
    );
  };
  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.accessory-item');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth + 20; // Add gap/margin if any
    }
  };
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;

    // Calculate the new index before updating the state
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(carouselIndex - 1, 0); // Prevent going below 0
      container.scrollBy({ left: -itemWidth.current, behavior: 'smooth' });
    } else {
      newIndex = Math.min(carouselIndex + 1, itemDot.current.length - 1); // Prevent exceeding the last dot
      container.scrollBy({ left: itemWidth.current, behavior: 'smooth' });
    }

    // Update the state and highlight the correct dot
    setCarouselIndex(newIndex);

    // Update the dots immediately
    itemDot.current.forEach((dot, index) => {
      dot.className = index === newIndex ? 'carousel-dot active' : 'carousel-dot';
    });
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

  const isMobile = utility.isMobileView();

  useEffect(() => {
    const container = containerRef.current;
    calculateItemWidth();
    updateArrowVisibility();
    const handleResize = () => {
      calculateItemWidth();
      updateArrowVisibility();
    };
    const handleScrollEvent = () => updateArrowVisibility();
    container?.addEventListener('scroll', handleScrollEvent);
    window.addEventListener('resize', handleResize);

    return () => {
      container?.removeEventListener('scroll', handleScrollEvent);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const accessoryArr = accessoryType === 'missingAcc' ? missingAccessories : newAccessories;

  function getAccessoryText() {
    if (newAccessories.length > 0 && accessoryType !== 'missingAcc') {
      return newvariantPopupSubTitle;
    } if (accessoryType === 'missingAcc') {
      return accNotAvailableLabel;
    }
    return '';
  }

  return html`
  <div class="popup-overlay">
      <div class="popup-container">
        <div class="error-icon">
        ${accessoryType === 'missingAcc' ? html`<${ErrorIcon} />` : html`<${NewReleases} />`}
        </div>
          <div class="text-container">
            <div class="confirmation-text-heading">
              ${accessoryType === 'missingAcc'
    ? html`${accNotAvlblTitleLabel}`
    : html`${newvariantPopupTitle}`}
            </div>
            <div class="confirmation-text-description">
              ${getAccessoryText()} <span class="variant-sel">${selectedVariant?.variantName}</span>
            </div>
          </div>

          ${accessoryArr.length > 0
    ? html`
                <div
                  class="carousel-items"
                  ref=${containerRef}
                  onTouchStart=${handleTouchStart}
                  onTouchEnd=${handleTouchEnd}
                >
                  ${accessoryArr?.map((accessory) => {
    const thumbnailUrl = getDesktopThumbnailUrl(
      accessory.ccThumbnailUrl || [],
    );
    return html`
                      <div class="accessory-item">
                        <div class="accessory-image">
                          <img src=${thumbnailUrl} />
                        </div>
                        <div class="accessory-details">
                          <div class="accessory-desc">
                            <p class="accessory-heading">
                              ${accessory.partDesc}
                            </p>
                          </div>
                          <div class="accessory-ctrl">
                            <p class="accessory-price">₹${accessory.price}</p>
                            ${2 > 3 && html`<button
                              class=${`accessory-action ${
    isAccessoryAdded(accessory) ? 'remove' : 'add'
  }`}
                              id=${isAccessoryAdded(accessory)
    ? 'removeIcon'
    : 'addIcon'}
                              onClick=${(e) => {
    e.stopPropagation(); // Prevent conflicting with parent `onClick`
    if (isAccessoryAdded(accessory)) {
      handleRemoveAccessory(accessory);
      window.ONE3D.removeAccessory(
        accessory.partNum,
      );
    } else {
      handleAddAccessory(accessory);
      window.ONE3D.addAccessory(accessory.partNum);
    }
  }}
                            >
                              ${isAccessoryAdded(accessory)
    ? html`<div class="remove-text">
                                      ${removeBtnLabel}
                                    </div>
                                    <div class="remove-icon">
                                      <${RemoveIcon} />
                                    </div>`
    : html`<div class="add-text">
                                      ${addBtnLabel}
                                    </div>
                                    <div class="add-icon"><${AddIcon} /></div>`}
                            </button>`}
                          </div>
                        </div>
                      </div>
                    `;
  })}
                </div>
              `
    : html``}
          <div class="carousel-dots">
            ${accessoryArr?.map((el, index) => html`<button
                ref=${(el) => (itemDot.current[index] = el)}
                class="carousel-dot ${index === 0 ? 'active' : ''}"
                aria-label="Go to slide 0"
              ></button>`)}
          </div>
            ${accessoryArr.length > 1 && html`<div class="carousel-arrow_navigation">
            <button
              class="prev-arrow ${enableleftArrow ? '' : 'disabled'}"
              aria-label="Previous"
              onClick=${() => handleScroll('left')}
            ></button>
            <button
              class="next-arrow ${enableRightArrow ? '' : 'disabled'}"
              aria-label="Next"
              onClick=${() => handleScroll('right')}
            ></button>
          </div>`}
          <div class="confirmation-buttons">
            ${accessoryType === 'missingAcc'
    ? html`<button
                  class="revert-button"
                  onClick=${(e) => {
    setConfirmedVariant(previousSelectedVariant);
    setSelectedVariant(previousSelectedVariant);
    // handleTabClick('customise');
    handleReverttoSummary();
  }}
                >
                  ${accNotAvailableCTAOneLabel}
                </button>`
    : html`<button
                  class="customise-button"
                  onClick=${(e) => {
    handleTabClick('customise');
    handleRedirecttoAcc();
  }}
                >
                  ${newVariantPopUpCtaOne}
                </button>`}
            ${accessoryType === 'missingAcc'
    ? html`<button
                  class="continue-button"
                  onClick=${(e) => {
    setAccessoryType('newAcc');
  }}
                >
                  ${accNotAvailableCTATwoLabel}
                </button>`
    : html`<button
                  class="summary-button"
                  onClick=${(e) => {
    handleTabClick('customise');
    handleRedirecttoSummary();
  }}
                >
                  ${newVariantPopUpCtaTwo}
                </button>`}
          </div>
      </div>
    </div>
`;
};

export default EditVariantPopup;
