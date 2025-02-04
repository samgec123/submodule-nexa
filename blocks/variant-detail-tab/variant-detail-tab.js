import utility from '../../commons/utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import apiUtils from '../../commons/utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [idEl, mainDiv] = block.children;

  const [
    modelCdEl,
    titleEl,
    searchPlaceholderEl,
    variantSelectorHeadingEL,
    applySelectionCTATextEl,
    featureLabelEl,
    technicalSpecificationLabelEL,
    variantDetailDescEl,
    hideSimillarEL,
    searchPrimaryErrEL,
    searchSecondaryErrEL,
    showAddIconEL,
    removeHideSimilaritiesEL] = mainDiv.children[0].children;

  const removeHideSimilarities = removeHideSimilaritiesEL?.textContent?.trim() || 'no';

  const showAddIcon = showAddIconEL?.textContent?.trim() || '';
  let maxRows = 4;

  const id = idEl?.textContent?.trim() || null;
  const modelCd = modelCdEl?.textContent;
  const searchPlaceholderElText = searchPlaceholderEl?.textContent;
  const variantSelectorHeading = variantSelectorHeadingEL?.textContent.trim();
  const applySelectionCTAText = applySelectionCTATextEl?.textContent.trim();
  const featureLabel = featureLabelEl?.textContent.trim();
  const technicalSpecification = technicalSpecificationLabelEL?.textContent.trim();
  const variantDetailDesc = variantDetailDescEl?.textContent.trim();
  const hideSimillar = hideSimillarEL?.textContent.trim();
  const searchSecondaryErr = searchSecondaryErrEL?.textContent.trim();
  const searchPrimaryErr = searchPrimaryErrEL?.textContent.trim();
  const { publishDomain } = await fetchPlaceholders();
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantDetailCompare;modelCd=${modelCd};channel=EXC;locale=en;`;
  let forCode = apiUtils.getLocalStorage('selected-location')?.forCode || '08';
  let apiRespObj = {};
  let transformedFeatures = [];

  let showHideSimilaritiesContent = '';
  if (removeHideSimilarities === 'no') {
    showHideSimilaritiesContent = `<input type="checkbox" id="toggle-similarities">
                  <span class="label-text">${hideSimillar}</span>
                  <span class="slider"></span>`;
  }

  block.innerHTML = utility.sanitizeHtml(`
        <div class="variants-showcasing">
           <div class="showcasing-header">
             <span class="header-text">${variantSelectorHeading}</span>
             <span class="close-icon"></span>
           </div>
           <div class="variants-showcasing-option"></div>
           <div class="showcasing-cta">${applySelectionCTAText}</div>
        </div>
        <div class="top-container">
        <div class="variant-details_top">
        ${
  titleEl
    ? `<div class="variants-details_title">
          ${titleEl.outerHTML}
          <div class="custom-dropdown">
            <div class="dropdown-selected">${featureLabel}</div>
            <div class="dropdown-options">
              <div class="dropdown-option features active" data-tab="features">${featureLabel}</div>
              <div class="dropdown-option technical-specifications" data-tab="specifications">${technicalSpecification}</div>
            </div>
          </div>
        </div>`
    : ''
}
        <div class="variant-details_description">
        ${variantDetailDesc}
        </div>
        </div>
            <div class="variant-detail-tab-search form-input">
            <div class="search-container">
            <input type="text" id="search-input" class="search-input" placeholder="${searchPlaceholderElText}"
                      aria-label="Search" autocomplete="off" />
            <div id="search-suggestions-list" class="search-suggestions-list">
              <div id="search-suggestions" class="search-suggestions"></div>
            </div>
            <div class="no-results" style="display: none">
              <div class="primary-error">${searchPrimaryErr}</div>
              <div class="secondary-error">${searchSecondaryErr}</div>
            </div>
        </div>
                <div class="model-drop-downs">
                <label class="slider-toggle">
                  ${showHideSimilaritiesContent}
                </label>
              <div class="variant-models">
              </div>
              <button type="button" class="add-button"></button>
            </div>
        </div>
        </div>
        <div class="bottom-container">
            <div class="accordion-content" id="features" style="display: block;"></div>
            <div class="accordion-content" id="specifications" style="display: none;"></div>
        </div>
    </div>
  `);
  if (id) {
    block.setAttribute('id', id);
  }
  const priceFeatures = document.querySelector('body');
  if (priceFeatures) {
    const variantOverlay = document.createElement('div');
    variantOverlay.className = 'variant-overlay';
    priceFeatures.appendChild(variantOverlay);
  }
  let maxDropdowns = 4;
  const minDropdowns = 2;
  const addDropdownButton = block.querySelector('.add-button');
  const dropdownContainer = block.querySelector('.variant-models');
  const searchInput = block.querySelector('#search-input');
  const searchSuggestions = block.querySelector('#search-suggestions');
  const searchSuggestionsList = block.querySelector('#search-suggestions-list');

  function updateButtonStates() {
    const dropdowns = dropdownContainer.querySelectorAll(
      '.variant-model.active',
    );
    const deleteButtons = dropdownContainer.querySelectorAll('.delete-button');

    addDropdownButton.disabled = dropdowns.length >= maxDropdowns;

    if (showAddIcon === 'no' && dropdowns.length >= maxDropdowns) {
      document.querySelector('.add-button').style.display = 'none';
    } else {
      document.querySelector('.add-button').style.removeProperty('display');
    }

    deleteButtons.forEach((button) => {
      button.disabled = dropdowns.length <= minDropdowns;
    });
  }

  function getSelectedVariants() {
    const dropdowns = block.querySelectorAll('.variant-model.active');
    const selectedVariants = [];

    dropdowns.forEach((dropdown) => {
      const selectedValue = dropdown.getAttribute('variant-id');
      if (selectedValue) {
        selectedVariants.push(selectedValue);
      }
    });

    return selectedVariants;
  }

  async function createSpecificationObject(response, variantCodes, transformedFeatureList) {
    const result = { features: [], specifications: [] };
    const featureHighlights = response.data.carModelList.items[0].featureHighlight;
    const specificationLabels = response.data.variantSpecificationsLabelsList.items[0];
    async function searchKeyInObject(dataObject, searchValue) {
      const foundKey = Object.keys(dataObject).find(
        (key) => key.toLowerCase() === searchValue.toLowerCase(),
      );
      return foundKey ? dataObject[foundKey] : null;
    }
    variantCodes.forEach((variantCode, index) => {
      const variantData = response.data.carModelList.items[0].variants.find(
        (item) => item.variantCd === variantCode,
      );
      if (variantData) {
        variantData.specificationCategory.forEach((category) => {
          const categoryType = category.categoryName === 'Features'
            ? 'features'
            : 'specifications';
          category.specificationAspect.forEach((aspect) => {
            const categoryName = aspect.categoryLabel;
            let categoryObj = result[categoryType].find(
              (cat) => cat.category === categoryName,
            );
            if (!categoryObj) {
              categoryObj = {
                category: categoryName,
                items: [],
                highlight: {},
              };
              result[categoryType].push(categoryObj);
            }
            const matchingFeature = featureHighlights.find(
              (feature) => feature.featureTag === categoryName,
            );
            if (matchingFeature) {
              categoryObj.highlight = matchingFeature;
            }
            Object.keys(aspect).forEach(async (key) => {
              if (key !== 'categoryLabel') {
                const itemName = await searchKeyInObject(
                  specificationLabels,
                  `${key}_label`,
                );
                let item = categoryObj.items.find((i) => i.name === itemName);
                if (!item) {
                  item = { name: itemName };
                  categoryObj.items.push(item);
                }
                item[`variant${index + 1}`] = aspect[key];
                const feature = transformedFeatureList.find((f) => f[key]);
                if (feature) {
                  const featureDetails = feature[key];
                  item.featureImage = featureDetails.featureImage;
                  item.featureDesc = featureDetails.featureDesc;
                }
              }
            });
          });
        });
      }
    });
    return result;
  }

  async function fetchCustomAPiData() {
    const customResp = await createSpecificationObject(
      apiRespObj,
      getSelectedVariants(),
      transformedFeatures,
    );
    return customResp;
  }

  function generateAccordionContent(tabId, data) {
    const container = block.querySelector(`#${tabId}`);
    container.innerHTML = '';

    data.forEach((category) => {
      const section = document.createElement('div');
      if(category.category !== undefined) {
          section.className = 'accordion-section';

          const header = document.createElement('div');
          header.className = 'accordion-header';
          header.innerHTML = `<span class="header-text">${category.category}</span>
                              <span class="toggle-arrow"></span>`;

          const spanEl = header.querySelector('span:last-child');
          header.addEventListener('click', () => {
            const body = section.querySelector('.accordion-body');
            const isExpanded = body.style.display === 'block';
            body.style.display = isExpanded ? 'none' : 'block';
            if (isExpanded) {
              spanEl.classList.remove('active');
            } else {
              spanEl.classList.add('active');
            }
          });

          const body = document.createElement('div');
          body.className = 'accordion-body';
          body.style.display = 'none';

          category.items.forEach((item) => {
            if(item.name !== null) {
                const itemRow = document.createElement('div');
                itemRow.className = 'accordion-items';
                const checkSignContainer = document.createElement('div');
                checkSignContainer.className = 'checkSign-container';
                let checkBoxesSign = '';

                const tooltipHtml = (item.featureImage || item.featureDesc) ? `
                <div class="tooltip-main">
                  <div class="tooltip-icon">i</div>
                  <div class="tooltip-content-wrap">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-content">
                      <img src="${publishDomain + (item?.featureImage ?? '')}" alt="Tooltip Image" />
                      <p>${item.featureDesc ?? ''}<span class="close-popup"></span></p>
                    </div>
                  </div>
                </div>` : '';

                const itemHTML = `<div class="sub-category"><span class="item-title">${item.name}</span>${tooltipHtml}</div>`;
                let noOfVariants = 0;
                let noOfVariantsWithNullValues = 0;
                Object.keys(item).forEach((key) => {
                  if (key.startsWith('variant')) {
                    noOfVariants++;
                    let displayValue;

                    if (item[key] === 'Yes') {
                      //displayValue = '&#x2713;';
                      displayValue = `<span class="tick-icon"></span>`;
                    } else if (item[key] === 'No') {
                      displayValue = '<span class="minus-icon"></span>';
                    } else if (item[key] === undefined || item[key] === null) {
                      displayValue = '<span class="minus-icon"></span>';
                      noOfVariantsWithNullValues++;
                    } else {
                      displayValue = item[key];
                    }

                    checkBoxesSign += `<span class="checkSign">${displayValue}</span>`;
                  }
                });

                itemRow.innerHTML = itemHTML;
                checkSignContainer.innerHTML = checkBoxesSign;
                itemRow.appendChild(checkSignContainer);
                if(noOfVariants > noOfVariantsWithNullValues) {
                    body.appendChild(itemRow);
                }
            }
          });

          section.appendChild(header);
          section.appendChild(body);
          container.appendChild(section);
      }
    });
  }

  function clearHighlights() {
    block.querySelectorAll('.accordion-items.highlight').forEach((item) => {
      item.classList.remove('highlight');
    });
  }

  function toggleSimilarities() {
    const hideSimilar = block.querySelector('#toggle-similarities').checked;
    block.querySelectorAll('.accordion-section').forEach((section) => {
      let allItemsSame = true;

      section.querySelectorAll('.accordion-items').forEach((item) => {
        const variantSpans = Array.from(
          item.querySelectorAll('span:not(.item-title)'),
        );
        const variantTexts = variantSpans.map((span) => span.textContent.trim());

        const isItemSame = variantTexts.every(
          (text) => text === variantTexts[0],
        );
        item.style.display = hideSimilar && isItemSame ? 'none' : 'flex';

        if (!isItemSame) {
          allItemsSame = false;
        }
      });
      section.style.display = hideSimilar && allItemsSame ? 'none' : 'block';
    });
  }

  function highlightSearchResults(searchValue) {
    if (!searchValue.trim()) {
      clearHighlights();
      return;
    }

    const openSections = new Set();
    const activeTab = block
      .querySelector('.dropdown-option.active')
      .getAttribute('data-tab');
    const container = block.querySelector(`#${activeTab}`);
    const sections = container.querySelectorAll('.accordion-section');

    sections.forEach((section) => {
      const body = section.querySelector('.accordion-body');
      if (body.style.display === 'block') {
        openSections.add(section);
      }
    });

    clearHighlights();

    let firstMatch = null;

    sections.forEach((section) => {
      const body = section.querySelector('.accordion-body');
      const items = body.querySelectorAll('.accordion-items');
      let hasMatch = false;

      items.forEach((item) => {
        const title = item
          .querySelector('.item-title')
          .textContent.toLowerCase();
        if (title.includes(searchValue.toLowerCase())) {
          item.classList.add('highlight');
          hasMatch = true;

          if (!firstMatch) {
            firstMatch = item;
          }
        }
      });

      if (hasMatch) {
        body.style.display = 'block';
        section
          .querySelector('.accordion-header span:last-child')
          .classList.remove('active');
      } else if (!openSections.has(section)) {
        body.style.display = 'none';
        section
          .querySelector('.accordion-header span:last-child')
          .classList.add('active');
      }
    });

    if (firstMatch) {
      firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleEvents(apiResponse) {
    const defaultOption = block.querySelector('.dropdown-selected');
    const dropdownOptionsDiv = block.querySelector('.dropdown-options');
    // Option switching
    block.querySelectorAll('.dropdown-option').forEach((option) => {
      option.addEventListener('click', () => {
        block.querySelector('#search-input').value = '';
        searchSuggestions.innerHTML = '';
        clearHighlights();
        defaultOption.textContent = option.textContent;
        dropdownOptionsDiv.style.display = 'none';

        block.querySelectorAll('.accordion-body').forEach((body) => {
          body.style.display = 'none';
        });
        block
          .querySelectorAll('.accordion-header span:last-child')
          .forEach((icon) => {
            icon.classList.remove('active');
          });

        block
          .querySelectorAll('.dropdown-option')
          .forEach((opt) => opt.classList.remove('active'));
        block.querySelectorAll('.accordion-content').forEach((content) => {
          content.style.display = 'none';
        });

        option.classList.add('active');
        const selectedOption = option.getAttribute('data-tab');
        block.querySelector(`#${selectedOption}`).style.display = 'block';
      });
    });

    if (removeHideSimilarities === 'no' && block.querySelector('#toggle-similarities')) {
      block
        .querySelector('#toggle-similarities')
        .addEventListener('change', toggleSimilarities);
      toggleSimilarities();
    }

    // Handle search functionality
    searchInput.addEventListener('input', () => {
      const noResults = block.querySelector('.no-results');
      const activeOption = block.querySelector('.dropdown-option.active');
      if (!activeOption) return;

      const activeOpt = activeOption.getAttribute('data-tab');
      const suggestionsData = apiResponse[activeOpt]?.flatMap((category) => category.items.map((item) => item.name)) || [];
      const query = searchInput.value.toLowerCase();
      const filteredSuggestions = suggestionsData.filter((item) => item?.toLowerCase().startsWith(query));

      searchSuggestions.innerHTML = '';

      if (query) {
        if (filteredSuggestions.length > 0) {
          // Render suggestions
          filteredSuggestions.forEach((suggestion) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            const itemText = suggestionItem.textContent.toLowerCase();
            /* eslint-disable-next-line */
            const regex = new RegExp(`(${query.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&')})`, 'gi');
            if (itemText.includes(query)) {
              suggestionItem.innerHTML = suggestionItem.textContent.replace(regex, '<span class="highlight-letters">$1</span>');
            }

            suggestionItem.addEventListener('click', () => {
              searchInput.value = suggestion;
              searchSuggestions.innerHTML = '';
              highlightSearchResults(suggestion);
              searchSuggestions.style.display = 'none';
              searchSuggestionsList.style.display = 'none';
            });

            searchSuggestions.appendChild(suggestionItem);
          });
          noResults.style.display = 'none';
        } else {
          searchSuggestions.style.display = 'none';
          searchSuggestionsList.style.display = 'none';
          noResults.style.display = 'block';
        }
      } else {
        noResults.style.display = 'none';
        searchSuggestions.style.display = 'none';
        searchSuggestionsList.style.display = 'none';
      }
    });
  }

  const findLowestVariantPriceFromAPiResp = (apiResponse, variantCd) => {
    const foundPrices = apiResponse.data.models[0].exShowroomDetailResponseDTOList
      .filter((variant) => variant.variantCd === variantCd)
      .map((variant) => variant.exShowroomPrice);

    return foundPrices.length === 0 ? null : Math.min(...foundPrices);
  };

  const storeVariantDetails = (variantCd, exShowroomPrice, forCod) => {
    const storedData = JSON.parse(localStorage.getItem('variantDetails')) || {};
    const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
    if (!storedData[variantCd]) {
      storedData[variantCd] = {
        price: {},
        timestamp,
      };
    }
    storedData[variantCd].price[forCod] = exShowroomPrice;
    storedData[variantCd].timestamp = timestamp;
    localStorage.setItem('variantDetails', JSON.stringify(storedData));
  };

  const getApiPrice = async (variantCd, modelCode) => {
    const apiPriceObj = await apiUtils.fetchExShowroomPrices(
      forCode,
      modelCode,
      'EXC',
      true,
    );
    if (apiPriceObj && Object.keys(apiPriceObj).length > 0) {
      const apiPrice = findLowestVariantPriceFromAPiResp(
        apiPriceObj,
        variantCd,
      );
      storeVariantDetails(variantCd, apiPrice, forCode);
      return apiPrice;
    }
    return null;
  };

  const fetchPrice = async (variantCd, modelCode) => {
    const localStoredPrices = JSON.parse(localStorage.getItem('variantDetails')) || {};
    const variantData = localStoredPrices[variantCd] || {};
    const storedPrice = variantData?.price?.[forCode];
    const expiryTimestamp = variantData.timestamp;
    const currentTimestamp = new Date().getTime();
    let variantPrice;
    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      variantPrice = storedPrice;
    } else {
      variantPrice = await getApiPrice(variantCd, modelCode);
    }
    return variantPrice;
  };

  async function getvariantPrices() {
    const variantlist = getSelectedVariants();
    const pricesArr = await Promise.all(
      variantlist.map(async (variantCd) => fetchPrice(variantCd, modelCd)),
    );
    return pricesArr;
  }
  async function updatePricefromAPi() {
    const accordionItems = block.querySelectorAll('.accordion-items');
    let checkSignSpans = [];
    accordionItems.forEach((item) => {
      const itemTitle = item.querySelector('.item-title');

      if (
        itemTitle
        && itemTitle.innerText.trim() === 'Ex-Showroom Price (Delhi) (INR)'
      ) {
        checkSignSpans = item.querySelectorAll('.checkSign');
      }
    });

    const pricesArr = await getvariantPrices();
    checkSignSpans.forEach(async (span, i) => {
      if (pricesArr[i] !== null) {
        span.textContent = utility.formatINR(pricesArr[i]);
      }
    });
  }

  function setupDropdownListeners() {
    const dropdowns = block.querySelectorAll('.variant-model');
    const showcasingContainer = block.querySelector(
      '.variants-showcasing-option',
    );
    showcasingContainer.innerHTML = '';

    dropdowns?.forEach((dropdown) => {
      const activeKey = dropdown.classList.contains('active');
      const variantOption = document.createElement('div');
      variantOption.setAttribute(
        'variant-id',
        dropdown?.getAttribute('variant-id'),
      );
      if (activeKey) {
        variantOption.classList.add('variant-option', 'active');
      } else {
        variantOption.classList.add('variant-option');
      }

      variantOption.innerHTML = `
      <div class="check-box"></div>
      <div class="data-wrapper">
      <div class="variant-data">
         <h3 class="variant-name">${
  dropdown?.getAttribute('variant-name') || ''
}</h3>
         <div class="transmission">${
  dropdown?.getAttribute('variant-type') || ''
}</div>
      </div>
      <div class="active-text">Currently in comparison</div>
      </div>
      `;
      showcasingContainer.appendChild(variantOption);
    });
  }
  async function updateAndRenderBlock() {
    const apiResp = await fetchCustomAPiData();
    generateAccordionContent('features', apiResp.features);
    generateAccordionContent('specifications', apiResp.specifications);
    handleEvents(apiResp);
    setupDropdownListeners();
    updatePricefromAPi();
  }

  function deleteDropdown(event) {
    const dropdown = event.target.closest('.variant-model');
    const dropdowns = dropdownContainer.querySelectorAll(
      '.variant-model.active',
    );

    if (dropdowns.length > minDropdowns) {
      dropdown.classList.remove('active');
      updateButtonStates();
      updateAndRenderBlock();
    }
  }

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      highlightSearchResults(searchInput.value);
    }
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
      searchSuggestions.style.display = 'none';
      searchSuggestionsList.style.display = 'none';
    } else {
      searchSuggestions.style.display = 'block';
      searchSuggestionsList.style.display = 'block';
    }
  });

  block.addEventListener('click', (event) => {
    if (!block.contains(event.target)) {
      searchSuggestions.innerHTML = '';
    }
  });

  const fetchDetails = async (graphQlEndpointurl) => {
    try {
      const response = await fetch(graphQlEndpointurl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch {
      return {};
    }
  };

  function populateDropdowns(response) {
    const container = block.querySelector('.variant-models');
    container.innerHTML = '';

    const carVariants = response.data.carModelList.items[0].variants;

    // Sort car variants by price in ascending order
    carVariants.sort((a, b) => {
      const priceA = a.specificationCategory
        .find(
          (category) => category.categoryName === 'Technical Specifications',
        )
        ?.specificationAspect.find(
          (aspect) => aspect.categoryLabel === 'Price',
        )?.exShowroomPrice || 0;
      const priceB = b.specificationCategory
        .find(
          (category) => category.categoryName === 'Technical Specifications',
        )
        ?.specificationAspect.find(
          (aspect) => aspect.categoryLabel === 'Price',
        )?.exShowroomPrice || 0;
      return priceA - priceB;
    });

    carVariants?.forEach((variant) => {
      // Create a new `variant-model` div
      const variantModel = document.createElement('div');
      variantModel.classList.add('variant-model', 'active');

      // Variant Name
      const variantNameDiv = document.createElement('h3');
      variantNameDiv.classList.add('variant-name');
      variantNameDiv.textContent = variant.variantName;
      variantModel.appendChild(variantNameDiv);

      // Variant Type (Transmission)
      const variantTypeDiv = document.createElement('div');
      variantTypeDiv.classList.add('variant-type');
      variantTypeDiv.textContent = variant.variantTechnology || 'N/A';
      variantModel.appendChild(variantTypeDiv);

      // Edit Button
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.classList.add('edit-icon');
      variantModel.appendChild(editButton);

      // Delete Button
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.classList.add('delete-button');
      variantModel.appendChild(deleteButton);

      // Set attributes for the variant model
      variantModel.setAttribute('variant-id', variant.variantCd);
      variantModel.setAttribute('variant-name', variant.variantName);
      variantModel.setAttribute('variant-type', variant.variantTechnology);

      // Append the new `variant-model` div to the container
      container.appendChild(variantModel);
    });

    // If no variants are available, show a fallback message
    if (carVariants.length < 2) {
      console.error('Not sufficient variants');
    }
  }

  async function renderBlock() {
    apiRespObj = await fetchDetails(graphQlEndpoint);
    maxRows = apiRespObj?.data?.carModelList?.items?.[0].variants.length;
    maxDropdowns = maxRows < 4 ? maxRows : 4;

    transformedFeatures = apiRespObj?.data?.carModelList?.items?.[0]?.featureHighlight?.map(
      (feature) => feature?.tagFeature?.reduce((acc, tag) => {
        const tagName = tag?.split('/').pop();
        if (
          tagName
              && feature?.featureImage?._dynamicUrl
              && feature?.featureDescription?.plaintext
        ) {
          acc[tagName] = {
            featureImage: feature.featureImage._dynamicUrl,
            featureDesc: feature.featureDescription.plaintext,
          };
        }
        return acc;
      }, {}),
    ) || [];
    populateDropdowns(apiRespObj);

    dropdownContainer.querySelectorAll('.delete-button').forEach((button) => {
      button.addEventListener('click', deleteDropdown);
    });

    updateButtonStates();
  }
  function setActiveOption() {
    const selectedElement = block.querySelector('.dropdown-selected');
    const dropdownOptionsDiv = block.querySelector('.dropdown-options');

    selectedElement.addEventListener('click', (event) => {
      event.stopPropagation();
      const isDropdownVisible = dropdownOptionsDiv.style.display === 'block';
      dropdownOptionsDiv.style.display = isDropdownVisible ? 'none' : 'block';
    });
  }
  function manageActiveVariants() {
    const container = document.querySelector('.variant-models');
    const variantModels = Array.from(
      container.querySelectorAll('.variant-model'),
    );

    if (!variantModels.length) {
      console.error('No variants available to manage.');
      return;
    }
    const isMobile = window.innerWidth < 768;

    variantModels.forEach((model, index) => {
      if (isMobile) {
        model.classList.toggle('active', index < minDropdowns);
      } else {
        model.classList.toggle('active', index < maxDropdowns);
      }
    });
  }
  function updateDropdowns(selectedVariantIds) {
    const variantElements = document.querySelectorAll('.variant-model');

    variantElements.forEach((element) => {
      const variantId = element.getAttribute('variant-id');

      if (selectedVariantIds.includes(variantId)) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    updateAndRenderBlock();
  }
  function handleOverlay() {
    const showcasingContainer = block.querySelector('.variants-showcasing');
    const overlayContainer = document.querySelector('.variant-overlay');
    const tooltipContainer = block.querySelector('.tooltip-content-wrap');
    if (showcasingContainer.style.display === 'block' || (tooltipContainer && tooltipContainer.style.display === 'block')) {
      overlayContainer.style.display = 'block';
    } else {
      overlayContainer.style.display = 'none';
    }
    document.documentElement.classList.toggle('no-scroll-detail-tab');
  }
  // Function to toggle selected variants and handle selections
  const showcasingContainer = document.querySelector('.variants-showcasing');
  const applyButton = showcasingContainer.querySelector('.showcasing-cta');
  function initializeVariantSelection(editId) {
    const variantOptions = showcasingContainer.querySelectorAll('.variant-option');

    const maxDesktopSelections = 4;
    const maxMobileSelections = 2;

    function isMobile() {
      return window.innerWidth < 768;
    }

    function handleVariantClick(event) {
      const clickedOption = event.currentTarget;

      if (isMobile()) {
        const selectedOptions = showcasingContainer.querySelectorAll('.variant-option.active');

        // Prevent deselecting below the minimum number of active options
        if (selectedOptions.length <= 2 && clickedOption.classList.contains('active')) {
          console.warn('You must have at least 2 variants selected.');
          return;
        }

        clickedOption.classList.toggle('active');
        const updatedSelectedOptions = Array.from(showcasingContainer.querySelectorAll('.variant-option.active'));

        if (updatedSelectedOptions.length > maxMobileSelections) {
          let variantToRemove = null;

          // If editId is provided, prioritize removing the variant matching editId
          if (editId) {
            variantToRemove = updatedSelectedOptions.find(
              (option) => option.getAttribute('variant-id') === editId,
            );
          }

          // If no match for editId, remove the oldest selected option
          if (!variantToRemove) {
            variantToRemove = updatedSelectedOptions.find((option) => option !== clickedOption);
          }

          if (variantToRemove) variantToRemove.classList.remove('active');
        }
      } else {
        const selectedOptions = showcasingContainer.querySelectorAll(
          '.variant-option.active',
        );
        if (
          selectedOptions.length <= 2
          && clickedOption.classList.contains('active')
        ) {
          console.warn('You must have at least 2 variants selected.');
          return;
        }
        clickedOption.classList.toggle('active');
        const updatedSelectedOptions = Array.from(
          showcasingContainer.querySelectorAll('.variant-option.active'),
        );
        if (updatedSelectedOptions.length > maxDesktopSelections) {
          const oldestOption = updatedSelectedOptions.find(
            (option) => option !== clickedOption,
          );
          if (oldestOption) oldestOption.classList.remove('active');
        }
      }
    }

    variantOptions.forEach((option) => {
      option.addEventListener('click', handleVariantClick);
    });
  }

  function dataLayerDetailsInit(selectedVariantsDetails) {
    const pageDetails = {};
    pageDetails.webName = applyButton.textContent.trim();
    pageDetails.linkType = 'other';
    pageDetails.componentName = block.dataset.blockName;
    pageDetails.componentType = 'button';
    pageDetails.selectedCarVariants = selectedVariantsDetails;

    analytics.setCompareCarsDetails(pageDetails);
  }
  function handleApplyClick() {
    const selectedOptions = showcasingContainer.querySelectorAll(
      '.variant-option.active',
    );
    const selectedVariantIds = Array.from(selectedOptions).map((option) => option.getAttribute('variant-id'));

    const selectedVariantsDetails = [];
    Array.from(selectedOptions).map((option) => selectedVariantsDetails.push(option.querySelector('.variant-name')?.textContent.trim()));
    dataLayerDetailsInit(selectedVariantsDetails);
    showcasingContainer.style.display = 'none';
    handleOverlay();
    updateDropdowns(selectedVariantIds);
    updateButtonStates();
    setupDropdownListeners();
  }

  await renderBlock();
  setActiveOption();
  manageActiveVariants();
  const apiResp = await fetchCustomAPiData();
  generateAccordionContent('features', apiResp.features);
  generateAccordionContent('specifications', apiResp.specifications);
  handleEvents(apiResp);
  setupDropdownListeners();
  updatePricefromAPi();
  initializeVariantSelection();
  applyButton.addEventListener('click', handleApplyClick);

  const showcasingDiv = block.querySelector('.variants-showcasing');

  block.querySelector('.close-icon').addEventListener('click', () => {
    showcasingDiv.style.display = 'none';
    handleOverlay();
    setupDropdownListeners();
  });
  block.querySelectorAll('.edit-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      const closestVariantModel = icon.closest('.variant-model');
      const modelId = closestVariantModel?.getAttribute('variant-id');
      showcasingDiv.style.display = 'block';
      handleOverlay();
      initializeVariantSelection(modelId);
    });
  });
  block.querySelector('.add-button').addEventListener('click', () => {
    showcasingDiv.style.display = 'block';
    const dropdowns = dropdownContainer.querySelectorAll(
      '.variant-model.active',
    );
    if (showAddIcon === 'no' && dropdowns.length >= maxDropdowns) {
      document.querySelector('.add-button').style.display = 'none';
    } else {
      document.querySelector('.add-button').style.removeProperty('display');
    }
    handleOverlay();
    initializeVariantSelection();
  });
  const toolTipContainer = block.querySelector('.tooltip-content-wrap');
  if (window.innerWidth < 768) {
    block.querySelector('.tooltip-icon').addEventListener('click', () => {
      toolTipContainer.style.display = 'block';
      handleOverlay();
    });
  }
  block.querySelector('.close-popup')?.addEventListener('click', () => {
    toolTipContainer.style.display = 'none';
    handleOverlay();
  });
  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await updatePricefromAPi();
  });
}
