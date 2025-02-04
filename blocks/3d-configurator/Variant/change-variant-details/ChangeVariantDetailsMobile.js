import { html } from '../../../../commons/scripts/vendor/htm-preact.js';
import {
  useState,
  useEffect,
} from '../../../../commons/scripts/vendor/preact-hooks.js';
import {
  BackArrowBtn,
  DownArrowIcon,
  RightArrowIcon,
  CheckBoxCheckedIcon,
  CheckBoxIcon,
  variantCloseIconGray,
} from '../../Icons.js';
import interaction from '../../interaction.js';

import VariantDetails from '../../VariantDetails.js';

const ChangeVariantDetailsMobile = ({
  variantData,
  selectedVariant,
  setSelectedVariant,
  interactionLabel,
  variantDetailsLabels,
  handleVariantChange,
  filters,
  setFilters,
  isChangeMode,
  setIsChangeMode,
  showSelectedBtn,
  setShowSelectedBtn,
  changeVariant,
  setIsChangeVariantMobile,
  onMoreClick,
  setOnMoreClick,
  clearFilters,
  showVideoCompair,
  setShowVideoCompair,
  compareVariantData,
  setCompareVariantData,
  hasSelectedVariant,
  setHasSelectedVariant,
  getFuelTypeFromPlaceHolder,
}) => {
  const [filteredVariantData, setFilteredVariantData] = useState(variantData);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [compareVariantArray, setCompareVariantArray] = useState([]);
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [isFuelFilterEnabled, setIsFuelFilterEnabled] = useState(false);

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
      setExpandedIndex(0);
      setHasSelectedVariant(selectedVariant);
      setShowSelectedBtn(true);
    }
  }, []);

  useEffect(() => {
    const hasNullTechnology = variantData.some((variant) => variant.variantTechnology === null);
    setIsFuelFilterEnabled(hasNullTechnology);
    setFilteredVariantData(variantData);

    // Initialize filters and ensure 'All' options are included
    setFilters({
      transmission:
      Array.from(
        new Map(
          variantData?.map((item) => [
            item.transmission,
            {
              value: item.transmission,
              selected: !!variantData.find(
                (variant) => variant.variantCd === selectedVariant.variantCd && variant.transmission === item.transmission,
              ),
            },
          ]),
        ).values(),
      ),
      technology: [
        {
          value: 'All',
          selected: false, // 'All' option is initially not selected
        },
        ...Array.from(
          new Map(
            variantData?.map((item) => [
              item.variantTechnology,
              {
                value: item.variantTechnology,
                selected: !!variantData.find(
                  (variant) => variant.variantCd === selectedVariant.variantCd && variant.variantTechnology === item.variantTechnology,
                ),
              },
            ]),
          ).values(),
        ),
      ],
      fuel: [
        {
          value: 'All',
          selected: false, // 'All' option is initially not selected
        },
        ...Array.from(
          new Map(
            variantData?.map((item) => [
              item.fuelType,
              {
                value: item.fuelType,
                selected: !!variantData.find(
                  (variant) => variant.variantCd === selectedVariant.variantCd && variant.fuelType === item.fuelType,
                ),
              },
            ]),
          ).values(),
        ),
      ],
    });
  }, []);

  const renderFilterChip = (filter, name) => (filter
    ? html`
          <div>
            ${filter.selected
      ? html`
                  <span
                    class="chip chip--success"
                    onClick=${() => handleFilterClick(filter, name)}
                  >
                    ${filter.value !== 'All'
                    && html`<em class="chip__icon-wrapper">
                      <svg
                        class="cd-icon"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <polyline
                          points="1.5 6 4.5 9 10.5 3"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </em>`}
                    <span class="chip__label">${getFuelTypeFromPlaceHolder(filter.value)}</span>
                  </span>
                `
      : html`
                  <div
                    class="chip chip--outline"
                    onClick=${() => handleFilterClick(filter, name)}
                  >
                    <span class="chip__label">${getFuelTypeFromPlaceHolder(filter.value)}</span>
                  </div>
                `}
          </div>
        `
    : html``);

  const handleFilterClick = (filter, name) => {
    const updatedFilters = filters[name]?.map((item) => {
      if (filter.value === 'All') {
        return { ...item, selected: item.value === 'All' };
      }
      if (item.value === 'All' && filter.value !== 'All' && item.selected) {
        // Deselect the "All" filter if a non-"All" filter is selected
        item.selected = false;
      }
      return {
        ...item,
        selected: filter.value === item.value ? !item.selected : item.selected,
      };
    });
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: updatedFilters,
    }));
  };

  // Function to filter data based on selected filters
  const filterData = (data, filters) => {
    const selectedTransmissionFilters = filters?.transmission?.filter(
      (filter) => filter.selected,
    );
    const selectedTechnologyFilters = filters?.technology?.filter(
      (filter) => filter.selected && filter.value !== 'All',
    );
    const selectedFuelFilters = filters?.fuel?.filter(
      (filter) => filter.selected && filter.value !== 'All',
    );

    // If no fuel filter is selected and no technology filter is selected, return data based on transmission
    if (isFuelFilterEnabled) {
      if (selectedFuelFilters.length === 0 && selectedTransmissionFilters.length === 0) {
        return data;
      }

      // If no transmission filter is selected, return all variants matching the selected fuel type
      if (selectedTransmissionFilters.length === 0) {
        return data.filter((item) => selectedFuelFilters.some(
          (fuel) => fuel.value === item.fuelType,
        ));
      }

      // Apply AND filter logic for both transmission and fuel
      return data.filter(
        (item) => selectedTransmissionFilters.some(
          (filter) => filter.value === item.transmission,
        ) && selectedFuelFilters.some(
          (filter) => filter.value === item.fuelType,
        ),
      );
    }

    // Normal technology and transmission filter
    if (selectedTransmissionFilters.length === 0 && selectedTechnologyFilters.length === 0) {
      return data;
    }

    if (selectedTransmissionFilters.length === 0) {
      return data.filter((item) => selectedTechnologyFilters.some(
        (technology) => technology.value === item.variantTechnology,
      ));
    }

    if (selectedTechnologyFilters.length === 0) {
      return data.filter((item) => selectedTransmissionFilters.some(
        (transmission) => transmission.value === item.transmission,
      ));
    }

    return data.filter(
      (item) => selectedTransmissionFilters.some(
        (filter) => filter.value === item.transmission,
      ) && selectedTechnologyFilters.some(
        (filter) => filter.value === item.variantTechnology,
      ),
    );
  };

  const toggleCompareVariant = (variant) => {
    setExpandedIndex(null);
    if (
      compareVariantArray.some((v) => v.variantName === variant.variantName)
    ) {
      setCompareVariantArray(
        compareVariantArray.filter((v) => v.variantName !== variant.variantName),
      );
    } else if (compareVariantArray.length < 3) {
      setCompareVariantArray([...compareVariantArray, variant]);
    }
  };

  useEffect(() => {
    compareVariantArray.length === 1
      ? setShowErrorMsg(true)
      : setShowErrorMsg(false);
  }, [compareVariantArray]);

  useEffect(() => {
    const isEmpty = Object.values(filters).every((set) => set.size === 0);
    if (!isEmpty) {
      const filteredData = filterData(variantData, filters);
      const updatedVariantData = filteredData?.map((variant) => ({
        ...variant,
        isSelected: compareVariantArray.some(
          (v) => v.variantName === variant.variantName,
        ),
      }));
      setFilteredVariantData(updatedVariantData);
    }
    // Set hasSelectedVariant to true if any variant is selected for comparison
    // setHasSelectedVariant(selectedVariant);
  }, [filters, compareVariantArray]);

  useEffect(() => {
    const updatedVariantData = variantData.map((variant) => ({
      ...variant,
      isSelected: compareVariantArray.some(
        (v) => v.variantName === variant.variantName,
      ),
    }));
    setFilteredVariantData(updatedVariantData);
  }, [variantData, compareVariantArray]);

  return html`
    <div
      class="bottom-interaction-panel-container variant-comparison-panel mobile"
    >
      <div class="all-variants">
        <span
          class="back-btn"
          onClick=${() => {
    setOnMoreClick(false);
    setIsChangeVariantMobile(true);
    setSelectedVariant(hasSelectedVariant);
  }}
          ><${BackArrowBtn}
        /></span>
        ${interactionLabel.variantComparisonLabel}
      </div>
      <div class="top-block">
        <div class="variant__details-expanded">
          <div class="chip-list horizontal-line">
        ${isFuelFilterEnabled
    ? [...filters?.fuel]?.map((filter) => renderFilterChip(filter, 'fuel'))
    : [...filters?.technology]?.map((filter) => renderFilterChip(filter, 'technology'))
}
      </div>
      <div class="chip-list horizontal-line">
        ${[...filters?.transmission]?.map((filter) => renderFilterChip(filter, 'transmission'))}
      </div>
          ${showErrorMsg
          && html` <div class="error-msg" id="errorMsg">
            <span class="error-text">
              ${interactionLabel.compareTooltipMobile
              || 'Choose two variants for visual comparison.'}
            </span>
            <button
              class="toggleBtn error-close-btn"
              onClick=${() => {
    setShowErrorMsg(false);
  }}
            >
              <${variantCloseIconGray} />
            </button>
          </div>`}
          <div class="variant__accordian">
            ${filteredVariantData?.map(
    (item, index) => html`
                <div
                  key=${item.variantName}
                  class="accordian-item ${expandedIndex === index
    ? 'expanded'
    : ''}"
                  data-index=${index}
                   onClick=${async () => {
    // if (compareVariantArray.length < 3) {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (item.variantName === hasSelectedVariant.variantName) {
      setShowSelectedBtn(true);
    } else {
      setShowSelectedBtn(false);
    }
    setSelectedVariant(item);
    changeVariant(
      item?.variant3dCode,
      item?.variantDesc,
    );
    // }
  }}
                >
                  <div
                    class="accordian-header ${compareVariantArray.length >= 2
                    && !item.isSelected
    ? 'disabled'
    : ''}"
                  >
                    <div class="variant-and-technology">
                      <div class="model">
                        <div class="compare-variant">
                          ${compareVariantArray.length >= 1
    ? html`<span
                                class="checkbox"
                                onClick=${() => toggleCompareVariant(item)}
                              >
                                ${item.isSelected
    ? html`<${CheckBoxCheckedIcon} />`
    : html`<${CheckBoxIcon} />`}
                              </span>`
    : null}
                          <span class="variant-name">${item.variantName}</span>
                        </div>
                        <div class="price-technology">
                          <span class="price technology"
                            >${interactionLabel.rsLabel}<span
                              style="margin-left:3px"
                            ></span>
                            ${interaction.formatDisplayPrice(item.variantPrice)}</span
                          >
                          <span
                            class="arrow-icon"
                            style="${expandedIndex === index
    ? 'padding-top: 8px;'
    : ''}"
                          >
                            ${expandedIndex === index
    ? html`<${DownArrowIcon} />`
    : html`<${RightArrowIcon} />`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="accordian-content">
                    <${VariantDetails}
                      labels=${variantDetailsLabels}
                      variantData=${item}
                      isChangeMode=${isChangeMode}
                      onMoreClick=${onMoreClick}
                    />
                    <button
                      class="confirm-cta addToCompareBtnMobile"
                      type="button"
                      onClick=${() => toggleCompareVariant(item)}
                    >
                      ${item.isSelected
    ? interactionLabel.removeLabel
    : interactionLabel.addToCompareLabel}
                    </button>
                  </div>
                </div>
              `,
  )}
          </div>
          ${compareVariantArray.length > 0
          && html`<div class="selected-variants">
            ${compareVariantArray?.map(
    (variant) => html`
                <span class="selected-chip">
                  <span class="chip-text"> ${variant.variantName}</span>
                  <button
                    class="remove-chip"
                    onClick=${() => {
    setCompareVariantArray(
      compareVariantArray.filter(
        (v) => v.variantName !== variant.variantName,
      ),
    );
  }}
                  >
                    ×
                  </button>
                </span>
              `,
  )}
          </div> `}
          <div class="confirm-variant-panel">
            ${onMoreClick && showSelectedBtn && compareVariantArray.length < 2
    ? html`<button
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
                </button> `
    : html`<button
                  class="confirm-cta ${compareVariantArray.length < 2
                  && compareVariantArray.length >= 1
    ? 'btnDisabled'
    : ''}"
                  type="button"
                  onClick=${async () => {
    if (compareVariantArray.length === 1) return;
    if (compareVariantArray.length === 0) {
      setHasSelectedVariant(selectedVariant);
      changeVariant(
        selectedVariant?.variant3dCode,
        selectedVariant?.variantDesc,
      );
      setOnMoreClick(false);
      setIsChangeVariantMobile(true);
      clearFilters();
    } else {
      setShowVideoCompair(true);
      setOnMoreClick(false);
      setCompareVariantData(compareVariantArray);
    }
  }}
                >
                  ${compareVariantArray.length >= 1
    ? interactionLabel.compareLabel
    : interactionLabel.confirmVariantLabel}
                </button> `}
          </div>
        </div>
      </div>
    </div>
  `;
};

export default ChangeVariantDetailsMobile;
