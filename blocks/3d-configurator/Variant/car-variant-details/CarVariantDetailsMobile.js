import { html } from '../../../../commons/scripts/vendor/htm-preact.js';
import {
  useState,
  useEffect,
  useRef,
} from '../../../../commons/scripts/vendor/preact-hooks.js';
import { MoreIcon, LeftArrowIcon } from '../../Icons.js';
import VariantDetails from '../../VariantDetails.js';
import { fetchPlaceholders } from '../../../../commons/scripts/aem.js';
import interaction from '../../interaction.js';

const { publishDomain } = await fetchPlaceholders();
const CarVariantDetailsMobile = ({
  variantData,
  selectedVariant,
  setSelectedVariant,
  interactionLabel,
  variantDetailsLabels,
  filters,
  setFilters,
  isChangeMode,
  changeVariant,
  isChangeVariantMobile,
  setIsChangeVariantMobile,
  setOnMoreClick,
  clearFilters,
  confirmedVariant,
  setConfirmedVariant,
  addedAccessories,
  categoriesData,
  isRedirectedToVariant,
  setShowSummary,
  handleTabClick,
  handleReverttoSummary,
  modelDesc,
  variantListLength,
  getFuelTypeFromPlaceHolder,
}) => {
  const containerRef = useRef(null);
  const itemWidth = useRef(0); // Store the width of one carousel item
  const itemDot = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [filteredVariantData, setFilteredVariantData] = useState(variantData);
  // const [confirmedVariant, setConfirmedVariant] = useState(selectedVariant);
  const [selectedPreview, setSelectedPreview] = useState({});
  const [isFuelFilterEnabled, setIsFuelFilterEnabled] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (selectedVariant) {
      const sortedData = filteredVariantData.sort((a, b) => {
        if (a.variantName === selectedVariant?.variantName) {
          return -1; // Move selected variant to the top
        }
        if (b.variantName === selectedVariant?.variantName) {
          return 1; // Move selected variant to the top
        }
        return 0; // Keep the rest in the same order
      });

      setFilteredVariantData(sortedData);
    }
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

  useEffect(() => {
    const hasNullTechnology = variantData.some((variant) => variant.variantTechnology === null);
    setIsFuelFilterEnabled(hasNullTechnology);
    // set filters by default for selected variant
    const initializeFilters = {
      transmission: Array.from(
        new Map(
          variantData?.map((item) => [
            item.transmission,
            {
              value: item.transmission,
              selected: !!variantData.find((variant) => variant.variantCd === selectedVariant.variantCd && variant.transmission === item.transmission),
            },
          ]),
        ).values(),
      ),
      technology: Array.from(
        new Map(
          variantData?.map((item) => [
            item.variantTechnology,
            {
              value: item.variantTechnology,
              selected: !!variantData.find((variant) => variant.variantCd === selectedVariant.variantCd && variant.variantTechnology === item.variantTechnology),
            },
          ]),
        ).values(),
      ),
      fuel: Array.from(
        new Map(
          variantData?.map((item) => [
            item.fuelType,
            {
              value: item.fuelType,
              selected: !!variantData.find((variant) => variant.variantCd === selectedVariant.variantCd && variant.fuelType === item.fuelType),
            },
          ]),
        ).values(),
      ),
    };
    const filteredData = filterData(variantData, initializeFilters);
    setFilteredVariantData(filteredData);
    setFilters(initializeFilters);
  }, [variantData]);

  // Handle filter click for technology and fuel
  const handleFilterClick = (filter, filterType) => {
    const updatedFilters = filters[filterType]?.map((item) => ({
      ...item,
      selected: filter.value === item.value,
    }));

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: updatedFilters,
    }));
  };

  // Filter data based on the selected filters
  const filterData = (data, filters) => {
    const filterType = isFuelFilterEnabled ? 'fuel' : 'technology';
    const selectedFilters = filters[filterType]?.filter(
      (filter) => filter.selected,
    );

    if (selectedFilters.length === 0) {
      return data;
    }

    return data.filter((item) => selectedFilters.some((filter) => (isFuelFilterEnabled
      ? filter.value === item.fuelType // Apply fuel filter
      : filter.value === item.variantTechnology), // Apply technology filter
    ));
  };
  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;
  };
  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.carousel-item');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth + 24; // Add gap/margin if any
    }
  };
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;

    // Calculate the new index before updating the state
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(carouselIndex - 1, 0); // Prevent going below 0
      container.scrollBy({ left: -(itemWidth.current), behavior: 'smooth' });
    } else {
      newIndex = Math.min(carouselIndex + 1, itemDot.current.length - 1); // Prevent exceeding the last dot
      container.scrollBy({ left: (itemWidth.current), behavior: 'smooth' });
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
    const swipeThreshold = 20; // Minimum distance for swipe recognition

    if (swipeDistance > swipeThreshold) {
      // Swipe left
      handleScroll('right');
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe right
      handleScroll('left');
    }
  };
  // Handle toggling of the expanded state
  const toggleExpand = (variantName) => {
    setSelectedPreview((prevState) => ({
      ...prevState,
      [variantName]: !prevState[variantName],
    }));
  };

  useEffect(() => {
    const isEmpty = Object.values(filters).every((set) => set.size === 0);
    if (!isEmpty) {
      const filteredData = filterData(variantData, filters);
      setFilteredVariantData(filteredData);
    }
  }, [filters, variantData]);

  return html`
    <div
      class="bottom-interaction-panel-container variant-selection-panel mobile"
    >
      <div class="top-block">
        <div class="variant-info">
          <span
            class="back-btn"
            onClick=${(e) => {
    e.stopPropagation();

    if (isRedirectedToVariant) {
      setSelectedVariant(confirmedVariant);
      setIsChangeVariantMobile(false);
      handleReverttoSummary();
    } else {
      setSelectedVariant(confirmedVariant);
      setIsChangeVariantMobile(false);
      clearFilters();
    }
  }
}
            ><${LeftArrowIcon}
          /></span>
          <p class="variant-name">
            ${modelDesc}
          </p>
          <p class="variant-model open-panel">
            <span>-</span> ${selectedVariant?.variantName}
          </p>
        </div>
        <div class="horizontal-line"></div>
        <div class="filter-section">
       <div class="chip-list">
            ${[
    ...(isFuelFilterEnabled ? filters?.fuel : filters?.technology),
  ]?.map(
    (filter) => html`
                <div>
                  ${filter.selected
    ? html`
                        <div
                          class="chip chip--success"
                          onClick=${() => handleFilterClick(filter, isFuelFilterEnabled ? 'fuel' : 'technology')}
                        >
                          <span class="chip__label">${getFuelTypeFromPlaceHolder(filter.value)}</span>
                        </div>
                      `
    : html`
                        <div
                          class="chip chip--outline"
                          onClick=${() => handleFilterClick(filter, isFuelFilterEnabled ? 'fuel' : 'technology')}
                        >
                          <span class="chip__label">${getFuelTypeFromPlaceHolder(filter.value)}</span>
                        </div>
                      `}
                </div>
              `,
  )}
          </div>
         ${!variantListLength && html`<div class="more-btn" onClick=${() => {
    setIsChangeVariantMobile(false);
    setOnMoreClick(true);
  }
  }>
            <span style="margin-right:3px">${interactionLabel?.MoreBtnlabel || 'More'}</span>
            <${MoreIcon} />
          </div>`}
          </div>
        <div class="variant-carousel" ref=${containerRef} onTouchStart=${handleTouchStart}
                  onTouchEnd=${handleTouchEnd}>
          ${filteredVariantData?.map(
    (item, index) => html`
              <div
                key=${item.variantName}
                class=${!variantListLength ? 'carousel-item' : 'carousel-item single-item'}
                data-index=${index}
                onClick=${async () => {
    setSelectedVariant(item);
    changeVariant(
      item?.variant3dCode,
      item?.variantDesc,
    );
    toggleExpand(item.variantName);
  }}
              >
                <div class="carousel-header">
                  <div class="variant-and-technology">
                    <div class="model">
                      <span class="variant-name">${item.variantName}</span>
                    </div>
                    <div class="technology">
                      <span>${item.variantTechnology || item.fuelType}</span>
                      <span style="margin-left:auto">
                        ${item?.variantPrice ? `${interactionLabel?.rsLabel} ${interaction.formatDisplayPrice(item?.variantPrice)}` : ''}
                      </span>
                    </div>
                    <div class="horizontal-line"></div>
                  </div>
                </div>
                <div class="carousel-content">
                  ${!selectedPreview[item.variantName]
                  && item?.variantName !== confirmedVariant?.variantName
    ? html`
                        <div class="image-preview">
                          <img
                            src=${item.variantImageConfig?._dynamicUrl
    ? `${publishDomain}${item.variantImageConfig._dynamicUrl}`
    : ''}
                            alt=${item.variantAltTextConfig || ''}
                          />
                          <div class="tap-to-preview-text">
                            ${interactionLabel?.PreviewLabel || 'Tap to Preview'}
                          </div>
                        </div>
                      `
    : html`
                        <${VariantDetails}
                          labels=${variantDetailsLabels}
                          variantData=${item}
                          isChangeMode=${isChangeMode}
                          isChangeVariantMobile=${isChangeVariantMobile}
                          isRedirectedToVariant=${isRedirectedToVariant}
                        />
                        ${item?.variantName === confirmedVariant?.variantName
    ? html`
                              <button
                                class="confirm-cta selectedBtn"
                                type="button"
                                disabled
                              >
                                <em class="selected__icon-wrapper">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.36664 11.7692L2.8103 8.2129L3.52297 7.50007L6.36664 10.3437L12.477 4.2334L13.1896 4.94623L6.36664 11.7692Z"
                                      fill="white"
                                    />
                                  </svg>
                                </em>
                                ${interactionLabel.selectVariantLabel}
                              </button>
                            `
    : html`
                              <button
                                class="confirm-cta"
                                type="button"
                                onClick=${async () => {
    setSelectedVariant(item);
    changeVariant(
      item?.variant3dCode,
      item?.variantDesc,
    );
    setConfirmedVariant(item);
    setSelectedPreview({});
    clearFilters();
  }}
                              >
                                ${interactionLabel.confirmVariantLabel}
                              </button>
                            `}
                      `}
                </div>
              </div>
            `,
  )}
        </div>
         <div class="carousel-dots">
            ${filteredVariantData?.map((el, index) => html`<button
                ref=${(el) => (itemDot.current[index] = el)}
                class="carousel-dot ${index === 0 ? 'active' : ''}"
                aria-label="Go to slide ${index + 1}"
              ></button>`)}
          </div>
      </div>
    </div>
  `;
};

export default CarVariantDetailsMobile;
