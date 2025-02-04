import { fetchPlaceholders } from '../../../scripts/aem.js';
import {
  priceSummaryRequest, extendedWarranty, priceSummaryDownload, savePriceSummary, getCustomerData,
} from '../../../utility/sfUtils.js';
import utility from '../../../utility/utility.js';

function convertNumbersToStrings(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'number') {
      obj[key] = String(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      convertNumbersToStrings(obj[key]);
    }
  });
}

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  const innerDiv = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    vehicleTextEl,
    accsTextEl,
    insuranceTextEl,
    specialOfferTextEl,
    registrationTextEl,
    backButtonTextEl,
    proceedToLoanOfferTextEl,
    disclaimerTextEl,
    disclaimerTextListEl,
    specialOfferInfoEl,
    msRewardsInfoEl,
    extendedWarrantyInfoEl,
    tcsInfoEl,
    nextPageLinkEl,
    prevPageLinkEl,
  ] = innerDiv.children;

  // Hide elements initially to avoid layout shifts
  const elementsToHide = [
    titleEl,
    descriptionEl,
    vehicleTextEl,
    accsTextEl,
    insuranceTextEl,
    specialOfferTextEl,
    registrationTextEl,
    backButtonTextEl,
    proceedToLoanOfferTextEl,
    disclaimerTextEl,
    disclaimerTextListEl,
    tcsInfoEl,
    nextPageLinkEl,
    prevPageLinkEl,
  ];

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const title = titleEl?.textContent?.trim();
  const description = descriptionEl?.textContent?.trim();
  const vehicleText = vehicleTextEl?.textContent?.trim();
  const accsText = accsTextEl?.textContent?.trim();
  const insuranceText = insuranceTextEl?.textContent?.trim();
  const specialOfferText = specialOfferTextEl?.textContent?.trim();
  const registrationText = registrationTextEl?.textContent?.trim();
  const backButtonText = backButtonTextEl?.textContent?.trim();
  const proceedToLoanOfferText = proceedToLoanOfferTextEl?.textContent?.trim();
  const disclaimerTextTitle = disclaimerTextEl?.textContent?.trim();
  const disclaimerTextList = [...disclaimerTextListEl.querySelectorAll('li')]
    .map((li) => li.outerHTML)
    .join('');
  const specialOfferInfo = specialOfferInfoEl?.outerHTML;
  const msRewardsInfo = msRewardsInfoEl?.outerHTML;
  const extendedWarrantyInfo = extendedWarrantyInfoEl?.outerHTML;
  const tcsInfo = tcsInfoEl?.outerHTML;
  const nextPageLink = nextPageLinkEl?.querySelector('a')?.href || '#';
  const prevPageLink = prevPageLinkEl?.querySelector('a')?.href || '#';
  let carContainer = '';
  let graphQlEndpoint;
  let summaryResponse;
  let newSummaryData;
  let onRoadPrice;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  async function fetchPriceSummaryData() {
    try {
      const enquiryId = sessionStorage.getItem('enquiryId');
      let body = {};
      body = {
        enquiry_id: enquiryId,
        default_acc_flag: 'Y',
        company_id: null,
        company_name: null,
        customer_type: 'I',
        buyer_type: 'F',
        share_capital: null,
        exchange_applicable: false,
        ac_type: 'B',
        extended_warranty_year: 'II',
        registration_tenure: '15',
      };
      if (
        sessionStorage.getItem('enquiryId')
        && sessionStorage.getItem('variant')
        && sessionStorage.getItem('selectedDealerId')
        && sessionStorage.getItem('model')
        && sessionStorage.getItem('selectedDealerCityCode')
        && sessionStorage.getItem('selectedDealerStateCode')
        && sessionStorage.getItem('salesType')
        && sessionStorage.getItem('registrationType')
      ) {
        const variantObj = JSON.parse(sessionStorage.getItem('variant'));
        body.dealer_code = sessionStorage.getItem('selectedDealerId');
        body.model_code = sessionStorage.getItem('model');
        body.variant_code = variantObj.variant_code;
        body.for_code = sessionStorage.getItem('selectedDealerCityCode');
        body.state_code = sessionStorage.getItem('selectedDealerStateCode');
        body.color_description = variantObj.variantColorDesc;
        body.color_code = variantObj.variantColorCode;
        body.color_indicator = variantObj.variantColorType;
        body.sales_type = sessionStorage.getItem('salesType');
        body.fuel_type = variantObj.variantFuelType;
        body.registration_type = sessionStorage.getItem('registrationType');
      } else {
        const custDataResponse = await getCustomerData(enquiryId);
        if (custDataResponse.success) {
          const custData = custDataResponse.data;
          body.dealer_code = custData.customer_data.car_summary.dealer_code;
          body.model_code = custData.customer_data.car_summary.model_code;
          body.variant_code = custData.customer_data.car_summary.variant_code;
          body.for_code = custData.customer_data.enquiry.msil_city_code;
          body.state_code = custData.customer_data.enquiry.state;
          body.color_description = custData.customer_data.car_summary.color_description;
          body.color_code = custData.customer_data.car_summary.color_code;
          body.color_indicator = custData.customer_data.car_summary.color_indicator;
          if (custData.customer_data.enquiry.customer_type_id === 470002) {
            body.sales_type = 'IND';
          } else {
            body.sales_type = 'CSD';
          }
          body.fuel_type = custData.customer_data.car_summary.fuel_type;
          body.registration_type = custData.customer_data.enquiry.registration_type;
        }
      }
      const stateCdValue = sessionStorage.getItem('selectedDealerStateCd');
      if (stateCdValue === 'ML' || stateCdValue === 'AR') {
        body.registration_tenure = '10';
      } else if (stateCdValue === 'MZ' || stateCdValue === 'WB') {
        body.registration_tenure = '5';
      }
      summaryResponse = await priceSummaryRequest(body);

      if (summaryResponse.success) {
        return summaryResponse.data;
      }

      throw new Error(`Error fetching price summary: ${summaryResponse.message}`);
    } catch (error) {
      throw new Error('Error:', error.message);
    }
  }

  function findCarByModelId(cars, modelCd) {
    return cars.find((car) => car.modelCd === modelCd);
  }

  const createAccessoryHtml = (category, accessoryTitle, cssClass) => {
    let partsHtml = '';
    category.parts.forEach((part) => {
      partsHtml += `
        <div
          class="active custom-control custom-radio align_div align-items-center"
          data-partprice="${part.partprice}"
          data-partno="${part.partno}"
        >
          <label class="custom-control-label ml-1">${part.partname}
            <span class="reflect-div">${utility.formatIndianRupees(part.partprice)}</span>
          </label>
        </div>`;
    });
    return `
      <div class="card accordInn ${cssClass}">
        <div class="card-header" id="heading-${cssClass}">
          <h5 class="mb-0">
            <div class="priceRightText1">
              <a class="collapsed" role="button" data-toggle="collapse" href="#collapse-${cssClass}"
                aria-expanded="false" aria-controls="collapse-${cssClass}">${accessoryTitle}</a>
            </div>
            <div class="priceRightText2 ${cssClass}_total" data-value="${category.totalPrice}">
              ${utility.formatIndianRupees(category.totalPrice)}
            </div>
          </h5>
        </div>
        <div id="collapse-${cssClass}" class="collapse psGreyBgBox" data-parent="#accordion-1"
          aria-labelledby="heading-${cssClass}">
          <div class="card-body">
            <div class="prsRightSubInnMain">
              <div class="priceSelectYearDiv ${cssClass}_list align_div align-items-center">
                ${partsHtml}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };

  function resetColorList(colorList) {
    colorList.innerHTML = '<option selected="selected" value="">Select Color*</option>';
  }

  function findVariantById(car, variantCd) {
    return car.variants?.find((variant) => variant.variantCd === variantCd);
  }

  function createColorOptionsFragment(colors) {
    const fragment = document.createDocumentFragment();
    Object.values(colors).forEach((color) => {
      const option = document.createElement('option');
      option.value = color.colorId;
      option.textContent = color.eColorDesc;
      option.setAttribute('data-colorCd', color.eColorCd);
      option.setAttribute('data-colorDesc', color.eColorDesc);
      option.setAttribute('data-colorType', color.colorType);
      fragment.appendChild(option);
    });
    return fragment;
  }

  function populateColorList(cars, selectedModel, selectedVariant, colorList) {
    const selectedCar = findCarByModelId(cars, selectedModel);
    if (selectedCar) {
      const variantDetails = findVariantById(selectedCar, selectedVariant);
      if (variantDetails?.colors) {
        const fragment = createColorOptionsFragment(variantDetails.colors);
        colorList.appendChild(fragment);
      }
    }
  }

  const createBasicKitHtml = (basicKit) => `
          <div class="card nexaBasicKit">
            <div class="card-header" id="heading-1-0">
              <h5 class="mb-0">
                <div class="priceRightText1 firstInfo">
                  <label class="checkboxWithLabel">
                    NEXA Basic Kit
                    <input
                      type="checkbox"
                      checked="checked"
                      class="basickit"
                      tabindex="14"
                    />
                    <span class="markedCheckbox"></span>
                  </label>
                  <span class="inf" data-target="basic-kit"></span>
                </div>
                <div class="priceRightText2 basic_kit">${utility.formatIndianRupees(basicKit.totalPrice)}</div>
              </h5>
            </div>
          </div>`;

  const createInsuranceHtml = (insuranceTotal, insuranceData) => {
    let insuranceAddonHtml = '';
    insuranceTotal.value = Number(insuranceData[0].amount);

    insuranceData[0].addon.forEach((insAddon) => {
      insuranceAddonHtml += `
        <div class="checkBoxInnRow">
          <div class="priceRightText1">
            <label class="checkboxWithLabel">${insAddon.name}
              <input type="checkbox" checked="checked" class="insurance parent0" data-partprice="${insAddon.amount}|child0" />
              <span class="markedCheckbox"></span>
            </label>
          </div>
          <div class="priceRightText2">${utility.formatIndianRupees(insAddon.amount)}</div>
        </div>`;
      insuranceTotal.value += Number(insAddon.amount);
    });

    return `
      <div class="card">
        <div class="card-header" id="heading-2">
          <h5 class="mb-0">
            <a class="collapsed" role="button" data-toggle="collapse" href="#collapse-2"
              aria-expanded="false" aria-controls="collapse-2">${insuranceText}
              <span class="pricesum_insur_total right">${utility.formatIndianRupees(insuranceTotal.value)}</span>
            </a>
          </h5>
        </div>
        <div id="collapse-2" class="firstLevelAccord collapse" data-parent="#accordionExample1"
          aria-labelledby="heading-2">
          <div class="card-body">
            <div id="accordion-2">
              <div class="card insureInn insurance_list">
                <div class="card-header bornone bornone2" id="heading-2-0">
                  <h5 class="mb-0 insuranceInnSecTxt">
                    <div class="priceRightText1">
                      <label class="checkboxWithLabel">${insuranceData[0].name}
                        <input type="checkbox" checked="checked" class="insurance parent child0"
                          data-partprice="${insuranceData[0].amount}|parent0" />
                        <span class="markedCheckbox"></span>
                      </label>
                    </div>
                    <div class="priceRightText2">${utility.formatIndianRupees(insuranceData[0].amount)}</div>
                    <div class="checkbxInnSec childs0">${insuranceAddonHtml}</div>
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };

  const createOffersHtml = (offersTotal, offersData) => {
    let offersHtml = '';

    offersData.forEach((offer) => {
      offersHtml += `
        <div class="checkBoxInnRow">
          <div class="priceRightText1">${offer.SCHEM_REMARKS}</div>
          <div class="priceRightText2">${utility.formatIndianRupees(offer.SCHEM_OFR_VAL)}</div>
        </div>`;
      offersTotal.value += Number(offer.SCHEM_OFR_VAL);
    });

    return offersHtml;
  };

  const createWarrantyOption = (warranty, label, id) => `
          <div class="custom-control custom-radio align_div align-items-center ml-4"
            data-value="${id}" data-price="${warranty.extended_warranty_premium}">
            <label class="custom-control-label ml-1">${label}</label>
          </div>`;

  const createExtendedWarrantyHtml = (extendedWarrantyData) => {
    let warrantyHtml = '';
    const { I, II, III } = extendedWarrantyData.extended_warranty_premium;

    if (I?.status === 'Success') warrantyHtml += createWarrantyOption(I, '1 Year', 'I');
    if (II?.status === 'Success') warrantyHtml += createWarrantyOption(II, '2 Years', 'II');
    if (III?.status === 'Success') warrantyHtml += createWarrantyOption(III, '3 Years', 'III');

    return warrantyHtml;
  };

  function generateChargesHtml(charges, chargesMap) {
    return Object.keys(chargesMap)
      .filter((key) => charges[key])
      .map((key) => `${chargesMap[key]} <div style="position: relative;float: right;">${charges[key]}</div><br>`)
      .join('');
  }

  function populateBasicKitPopup(summaryData, popupDetailEl) {
    const basicKit = summaryData.accessories.categories.find((category) => category.category === 'BASIC KIT');
    const basicKitPopupHtml = basicKit.parts.map((part) => `${part.partname}<br>`).join('');

    const paragraphElement = document.createElement('p');
    paragraphElement.innerHTML = basicKitPopupHtml;
    popupDetailEl.appendChild(paragraphElement);
  }

  function populateOtherPopups(dataTarget, popupDetailEl) {
    const contentMap = {
      'special-offer': specialOfferInfo,
      'extended-warranty': extendedWarrantyInfo,
      'ms-rewards': msRewardsInfo,
      tcs: tcsInfo,
    };

    popupDetailEl.innerHTML = contentMap[dataTarget] || '';
  }

  function hideModal(popupModalEl) {
    popupModalEl.classList.remove('showModal');
  }

  function showModal(popupModalEl) {
    popupModalEl.classList.add('showModal');
  }

  function addModalEventListeners(popupModalEl) {
    popupModalEl.addEventListener('click', (e) => {
      if (e.target === popupModalEl) hideModal(popupModalEl);
    });

    const closeIcon = popupModalEl.querySelector('.popup-close');
    closeIcon.addEventListener('click', () => hideModal(popupModalEl));
  }

  function checkAllInsuranceChildren(insuranceChildCheckboxes) {
    insuranceChildCheckboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        checkbox.click();
      }
    });
  }
  function uncheckAllInsuranceChildren(insuranceChildCheckboxes) {
    insuranceChildCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.click();
      }
    });
  }

  function resetActiveWarranty(radios) {
    radios.forEach((radio) => radio.classList.remove('active'));
  }

  function setActiveWarranty(event) {
    const targetElement = event.target;
    const { parentElement } = targetElement;

    if (parentElement.classList.contains('custom-radio')) {
      parentElement.classList.add('active');
    } else {
      targetElement.classList.add('active');
    }
  }

  function updateWarrantyPrice(extendedWarrantyPriceEl, event) {
    const targetElement = event.target;
    const price = targetElement.dataset.price || targetElement.parentElement.dataset.price;
    const warrantyYears = targetElement.dataset.value || targetElement.parentElement.dataset.value;
    newSummaryData.car_summary.extended_warranty_premium = Number(price);
    newSummaryData.car_summary.extended_warranty_year = warrantyYears;
    extendedWarrantyPriceEl.innerHTML = utility.formatIndianRupees(price);
  }

  function getKitAmount(summaryData) {
    return summaryData.accessories.categories.find((categoryType) => categoryType.category === 'BASIC KIT').totalPrice;
  }

  function updateKitAmount(element, amount) {
    element.innerHTML = utility.formatIndianRupees(amount);
  }

  function updateTotalCostDisplay(totalAccsCost, totalAccsCostEl) {
    totalAccsCostEl.innerHTML = utility.formatIndianRupees(totalAccsCost.value);
  }

  function calculateTotalPrice() {
    const exShowroomPrice = utility.extractNumber(block.querySelector('#pricesum_exshow').innerHTML);
    const accsTotal = utility.extractNumber(block.querySelector('.pricesum_Accessories_total.right').innerHTML);
    const insuranceTotalAmount = utility.extractNumber(block.querySelector('.pricesum_insur_total.right').innerHTML);
    const specialOfferTotal = utility.extractNumber(block.querySelector('.pricesum_Discount_total').innerHTML);
    const registrationTotal = utility.extractNumber(block.querySelector('.Registration_list').innerHTML);
    const rewardsTotal = utility.extractNumber(block.querySelector('.reward_point').innerHTML);
    const warrantyTotal = utility.extractNumber(block.querySelector('.ExtendedWarranty_total').innerHTML);
    onRoadPrice = exShowroomPrice + accsTotal
    + insuranceTotalAmount - specialOfferTotal
    + registrationTotal - rewardsTotal + warrantyTotal;
    const totalOnRoadPrice = utility.formatIndianRupees(onRoadPrice);
    document.querySelector('.totalPrice').innerHTML = `${totalOnRoadPrice}
   <span>*On Road Price </span>`;
  }

  function handleBasicKitChange(totalAccsCost, totalAccsCostEl, event, summaryData) {
    const kitAmountEl = block.querySelector('.priceRightText2.basic_kit');
    const kitAmount = getKitAmount(summaryData);

    if (event.target.checked) {
      updateKitAmount(kitAmountEl, kitAmount);
      totalAccsCost.value += kitAmount;
      const basicKitCategory = summaryData.accessories.categories.find((category) => category.category === 'BASIC KIT');
      const basicKitIndex = newSummaryData.car_summary.accessories.categories.findIndex((category) => category.category === 'BASIC KIT');

      if (basicKitIndex !== -1 && basicKitCategory) {
        newSummaryData.car_summary.accessories.categories[basicKitIndex] = basicKitCategory;
      }
      newSummaryData.car_summary.accessories.total_price = String(totalAccsCost.value);
    } else {
      updateKitAmount(kitAmountEl, 0);
      totalAccsCost.value -= kitAmount;

      const basicKitCategoryIndex = newSummaryData.car_summary.accessories.categories.findIndex((category) => category.category === 'BASIC KIT');

      if (basicKitCategoryIndex !== -1) {
        newSummaryData.car_summary.accessories.categories[basicKitCategoryIndex] = {
          category: 'BASIC KIT',
          parts: [],
          totalPrice: '0',
        };
      } else {
        newSummaryData.car_summary.accessories.categories.push({
          category: 'BASIC KIT',
          parts: [],
          totalPrice: '0',
        });
      }

      newSummaryData.car_summary.accessories.total_price = totalAccsCost.value;
    }
    updateTotalCostDisplay(totalAccsCost, totalAccsCostEl);
    calculateTotalPrice();
  }

  function initializeBasicKitCheckbox(totalAccsCost, totalAccsCostEl, summaryData) {
    const basicKitCheckbox = block.querySelector('.basickit');
    if (basicKitCheckbox) {
      basicKitCheckbox.addEventListener('change', (event) => handleBasicKitChange(totalAccsCost, totalAccsCostEl, event, summaryData));
    }
  }

  function adjustCategoryCost(element, amount) {
    const currentCost = Number(element.getAttribute('data-value')) + amount;
    element.setAttribute('data-value', currentCost);
    element.innerText = utility.formatIndianRupees(currentCost);
  }

  function deactivateRadioOption(radioElement, totalCategoryCostElement, partPrice, totalAccsCost) {
    radioElement.classList.remove('active');
    adjustCategoryCost(totalCategoryCostElement, -partPrice);
    const partNo = radioElement.getAttribute('data-partno');
    newSummaryData.car_summary.accessories.categories
      .find((category) => category.parts.some((part) => part.partno === partNo))
      .parts = newSummaryData.car_summary.accessories.categories
        .find((category) => category.parts.some((part) => part.partno === partNo)).parts
        .filter((part) => part.partno !== partNo);
    newSummaryData.car_summary.accessories.total_price -= partPrice;
    totalAccsCost.value -= partPrice;
  }

  function activateRadioOption(
    radioElement,
    totalCategoryCostElement,
    partPrice,
    totalAccsCost,
    summaryData,
  ) {
    radioElement.classList.add('active');
    adjustCategoryCost(totalCategoryCostElement, partPrice);
    const partNo = radioElement.getAttribute('data-partno');
    const AccsCategory = summaryData.accessories.categories
      .find((category) => category.parts.some((part) => part.partno === partNo));
    newSummaryData.car_summary.accessories.categories
      .find((category) => category.category === AccsCategory.category).parts
      .push(AccsCategory.parts.find((part) => part.partno === partNo));
    newSummaryData.car_summary.accessories.total_price += partPrice;
    totalAccsCost.value += partPrice;
  }

  function handleCustomRadioClick(event, totalAccsCost, totalAccsCostEl, summaryData) {
    const radioElement = event.target.parentElement;
    const totalCategoryCostElement = event.target.closest('.card').querySelector('.priceRightText2');
    const partPrice = Number(radioElement.getAttribute('data-partprice'));

    if (radioElement.classList.contains('active')) {
      deactivateRadioOption(radioElement, totalCategoryCostElement, partPrice, totalAccsCost);
    } else {
      activateRadioOption(
        radioElement,
        totalCategoryCostElement,
        partPrice,
        totalAccsCost,
        summaryData,
      );
    }
    updateTotalCostDisplay(totalAccsCost, totalAccsCostEl);
    calculateTotalPrice();
  }

  function initializeCustomRadios(customRadios, totalAccsCost, totalAccsCostEl, summaryData) {
    customRadios.forEach((radio) => {
      radio.addEventListener('click', (event) => handleCustomRadioClick(event, totalAccsCost, totalAccsCostEl, summaryData));
    });
  }

  function shouldSkipOtherLink(link, otherLink) {
    return otherLink === link || otherLink.classList.contains('btnSave');
  }

  function shouldCollapseContent(link, otherLink) {
    const sameCard = link.closest('.card') === otherLink.closest('.card');
    const sameFirstLevel = link.closest('.firstLevelAccord') === otherLink.closest('.firstLevelAccord');
    return sameCard || sameFirstLevel;
  }

  function collapseOtherLinks(link) {
    const parentAccordion = link.closest('.priceMainContainer');
    parentAccordion.querySelectorAll('a:not(.prsButtMain)').forEach((otherLink) => {
      if (shouldSkipOtherLink(link, otherLink)) return;

      const otherTargetSelector = otherLink.getAttribute('href');
      if (otherTargetSelector !== '#') {
        const otherContent = block.querySelector(otherTargetSelector);
        if (otherContent && shouldCollapseContent(link, otherLink)) {
          otherContent.classList.remove('show');
          otherLink.classList.add('collapsed');
        }
      }
    });
  }

  function toggleContentVisibility(content, link) {
    const isContentVisible = content.classList.contains('show');
    content.classList.toggle('show', !isContentVisible);
    link.classList.toggle('collapsed', isContentVisible);
  }

  function handleToggleLinkClick(event, link) {
    event.preventDefault();
    const targetSelector = link.getAttribute('href');
    if (targetSelector === '#') return;

    const content = block.querySelector(targetSelector);
    if (!content) return;

    toggleContentVisibility(content, link);
    collapseOtherLinks(link);
  }

  // it is used accordian toggle.
  function initializeToggleLinks() {
    const toggleLinks = block.querySelectorAll('.priceMainContainer a');
    const filteredToggleLinks = Array.from(toggleLinks).filter((link) => !link.closest('.prsButtMain'));
    filteredToggleLinks.forEach((link) => {
      link.addEventListener('click', (event) => handleToggleLinkClick(event, link));
    });
  }

  function resetDropdowns(variantList, colorList) {
    variantList.innerHTML = '<option selected="selected" value="">Select Variant*</option>';
    colorList.innerHTML = '<option selected="selected" value="">Select Color*</option>';
  }

  function createOptionElement(variant) {
    const option = document.createElement('option');
    option.value = variant.variantCd;
    option.textContent = variant.variantDesc;
    option.setAttribute('data-id', variant.variantCd);
    option.setAttribute('data-variantCode', variant.variant_code);
    return option;
  }

  function populateVariantList(cars, selectedModel, variantList) {
    const car = findCarByModelId(cars, selectedModel);
    if (car) {
      car.variants.forEach((variant) => {
        const option = createOptionElement(variant);
        variantList.appendChild(option);
      });
    }
  }

  async function populatePriceSummary(cars) {
    const insuranceTotal = { value: 0 };
    const offersTotal = { value: 0 };

    const summaryData = await fetchPriceSummaryData();
    newSummaryData = {
      enquiry_id: sessionStorage.getItem('enquiryId'),
      car_summary: structuredClone(summaryData),
    };
    const carKitHtml = summaryData?.accessories?.categories?.some((cat) => cat.category === 'BASIC KIT')
      ? createBasicKitHtml(summaryData.accessories.categories.find((cat) => cat.category === 'BASIC KIT'))
      : '';

    const exteriorHtml = summaryData?.accessories?.categories?.some((cat) => cat.category === 'EXTERIOR ACCESSORIES')
      ? createAccessoryHtml(summaryData.accessories.categories.find((cat) => cat.category === 'EXTERIOR ACCESSORIES'), 'Exterior', 'Exterior')
      : '';

    const interiorHtml = summaryData?.accessories?.categories?.some((cat) => cat.category === 'INTERIOR ACCESSORIES')
      ? createAccessoryHtml(summaryData.accessories.categories.find((cat) => cat.category === 'INTERIOR ACCESSORIES'), 'Interior', 'Interior')
      : '';

    const carCareHtml = summaryData?.accessories?.categories?.some((cat) => cat.category === 'CAR CARE KIT')
      ? createAccessoryHtml(summaryData?.accessories?.categories?.find((cat) => cat.category === 'CAR CARE KIT'), 'Car Care', 'car-care')
      : '';

    const insuranceHtml = summaryData.insurance_data.length > 0 ? createInsuranceHtml(insuranceTotal, summaryData.insurance_data) : '';
    const offerTypesHtml = createOffersHtml(offersTotal, summaryData.offers);
    const tcsHtml = summaryData.tcs ? `<div class="prsCheckBoxMain pricesum_TCS" style=""><div class="prsRightBoxTxt1">TCS (Tax Collection at Source)<span class="tcs inf"></span></div><div class="prsRightBoxTxt2 pricesum_TCS_total">${utility.formatIndianRupees(summaryData.tcs)}</div></div>` : '';
    const dealerCode = sessionStorage.getItem('selectedDealerId') || summaryData?.dealer_code;
    const variantCode = JSON.parse(sessionStorage.getItem('variant')).variant_code;
    const extendWarrantyResponse = await extendedWarranty(
      dealerCode,
      variantCode,
    );
    const extendedWarrantyData = extendWarrantyResponse.data;

    const extendedWarrantyOptionsHtml = createExtendedWarrantyHtml(extendedWarrantyData);

    block.innerHTML = '';
    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(` <div class="container priceListingDetail">
          <h2>${title}</h2>
          <h3>${description}</h3>
          <div class="priceMainContainer">
            <div class="priceContainer">
              <div class="accordianContainer" id="accordionContainerId">
                <div class="card">
                  <div class="card-header" id="heading-t1">
                    <h5 class="mb-0">
                      <a
                        role="button"
                        data-toggle="collapse"
                        href="#collapse-t1"
                        aria-expanded="false"
                        aria-controls="collapse-t1"
                        class="collapsed" style="height:25px"
                        >${vehicleText}<span class="right vehiclePrice"
                          ><span id="pricesum_exshow">${utility.formatIndianRupees(summaryData.exshowroom_price)}</span
                          ><small>*Ex-showroom price</small></span
                        ></a
                      >
                    </h5>
                  </div>
                  <div
                    id="collapse-t1"
                    class="firstLevelAccord collapse"
                    data-parent="#accordionExample1"
                    aria-labelledby="heading-t1"
                    style=""
                  >
                    <div class="card-body vehicleSec">
                      <div id="accordion-t1">
                        <div class="card accordInn">
                          <div class="card-header" id="heading-t1-1">
                            <h5 class="mb-0">
                              <div class="priceRightText1">Sales Type</div>
                              <div class="priceCarSelect right">
                                <span id="SalesType">${summaryData.sales_type}</span>
                              </div>
                            </h5>
                          </div>
                        </div>
                        <div class="card accordInn">
                          <div class="card-header" id="heading-t1-1">
                            <h5 class="mb-0">
                              <div class="priceRightText1">Model</div>
                              <div class="priceCarSelect right">
                                <select class="model_list_name" tabindex="12">
                                 ${carContainer}
                                </select>
                              </div>
                            </h5>
                          </div>
                        </div>
                        <div class="card accordInn">
                          <div class="card-header" id="heading-t1-2">
                            <h5 class="mb-0">
                              <div class="priceRightText1">Variant</div>
                              <div class="priceCarSelect right">
                                <select class="variant_list" tabindex="13">
                                  <option selected="selected" value="">
                                    Select Variant*
                                  </option>
                                  <option value="162178" data-id="FRR4EL1">
                                    MARUTI FRONX ISS SIGMA 1.2L 5MT ESP
                                  </option>
                                </select>
                              </div>
                            </h5>
                          </div>
                        </div>
                        <div class="card accordInn">
                          <div class="card-header" id="heading-t1-3">
                            <h5 class="mb-0">
                              <div class="priceRightText1">Color</div>
                              <div class="prsColorBox right">
                                <span
                                  style="
                                    background: rgb(182, 186, 189);
                                    display: none;
                                  "
                                ></span>
                                <select class="color_list" tabindex="14">
                                  <option selected="selected" value="">
                                    Select Color*
                                  </option>
                                  <option value="089" data-id="0">
                                    MYSTIC WHITE
                                  </option>
                                  <option value="1D6" data-id="1">
                                    MAJESTIC SILVER
                                  </option>
                                </select>
                              </div>
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="heading-1">
                    <h5 class="mb-0">
                      <a
                        class="collapsed"
                        role="button"
                        data-toggle="collapse"
                        href="#collapse-1"
                        aria-expanded="false"
                        aria-controls="collapse-1"
                        >${accsText}<span class="pricesum_Accessories_total right"
                          >${utility.formatIndianRupees(summaryData.accessories?.total_price)}</span
                        ></a
                      >
                    </h5>
                  </div>
                  <div
                    id="collapse-1"
                    class="collapse firstLevelAccord"
                    data-parent="#accordionExample1"
                    aria-labelledby="heading-1"
                  >
                    <div class="card-body">
                      <div id="accordion-1">
                        ${carKitHtml}
                        ${exteriorHtml}
                        ${interiorHtml}
                        ${carCareHtml}
                      </div>
                    </div>
                  </div>
                </div>
                ${insuranceHtml}
                <div class="card">
                  <div class="card-header bornone" id="heading-3">
                    <h5 class="mb-0">
                      <a
                        class="conInfoMain collapsed"
                        role="button"
                        data-toggle="collapse"
                        href="#collapse-3"
                        aria-expanded="false"
                        aria-controls="collapse-3"
                        >${specialOfferText} <span class="inf" data-target="special-offer"></span><span class="right pricesum_Discount_total">${utility.formatIndianRupees(offersTotal.value)}</span></a
                      >
                    </h5>
                  </div>
                  <div
                    id="collapse-3"
                    class="firstLevelAccord collapse"
                    data-parent="#accordionExample1"
                    aria-labelledby="heading-3"
                    style=""
                  >
                    <div class="card-body consumerOfferInn">
                      <div id="accordion-3">
                        <div class="checkbxInnSec consumer_offers_list">
                          ${offerTypesHtml}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card withoutAccordian">
                  <div class="card-header bornone" id="heading-3">
                    <div class="noAccordian">
                      ${registrationText}
                      <span class="inf" data-target="registration"></span>
                      <span class="right Registration_list">${utility.formatIndianRupees(summaryData.registration_charges?.registration_charges)}</span>
                    </div>
                  </div>
                  <div class="collapse show firstLevelAccord">
                    <div class="card-body customerWapper">
                      <div class="checkbxInnSec">
                        <div class="checkBoxInnRow">
                          <div class="priceRightText1">Customer Type</div>
                          <div class="priceSelectYearDiv corporate-type">
                            <a
                              href="#"
                              data-value="${summaryData.customer_type}"
                              class="active"
                              >${summaryData.customer_type === 'I' ? 'Individual' : ''}</a
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="priceCheckBoxDiv marginTop">
                  <div class="priceRightText1">
                    <label class="checkboxWithLabel">
                      Maruti Suzuki Rewards
                      <input
                        type="checkbox"
                        checked="checked"
                        class="rewards_point"
                        tabindex="17"
                      />
                      <span class="markedCheckbox"></span>
                    </label>
                    <span class="inf" data-target="ms-rewards"></span>
                  </div>
                  <div class="priceRightText2 reward_point">${utility.formatIndianRupees(summaryData.reward_point)}</div>
                </div>
                <div
                  class="priceCheckBoxDiv align_div align-items-center flex-wrap flex-md-nowrap extended-warranty-wrapper"
                >
                  <div class="priceRightText1">
                    <label class="checkboxWithLabel">
                      Extended Warranty
                      <input
                        type="checkbox"
                        checked="checked"
                        class="ExtendedWarranty"
                        tabindex="18"
                      />
                      <span class="markedCheckbox"></span>
                    </label>
                    <span class="inf" data-target="extended-warranty"></span>
                  </div>

                  <div class="priceSelectYearDiv extended_warrenty">
                    <div
                      class="align_div align-items-center extended_warrenty_wrap"
                    >
                      ${extendedWarrantyOptionsHtml}
                    </div>
                  </div>
                  <div class="priceRightText2 ExtendedWarranty_total">₹ 10 891</div>
                </div>
                ${tcsHtml}
                <div class="priceTotalDiv">
                  <div class="priceTotalText">Total</div>
                  <div class="priceTotalTextValue totalPrice">
                    ₹ 8 89 886<span>*On Road Price </span>
                  </div>
                </div>
                <div
                  class="prsButtMain align_div text-left flex-column flex-lg-row"
                >
                  <p class="Evaluatedprice d-none" style="display: none">
                    <strong
                      >Evaluated price of your old car is ₹ <text>0</text></strong
                    >
                  </p>
                  <div class="download_price_sum">
                    <i class="download-icon"></i>
                      <a class="btnSave cls-DPS_new btn-dps" id="download-pdf"
                        href="#"
                        >DOWNLOAD PRICE SUMMARY</a>
                  </div>

                  <div class="ml-md-auto btn-grp">
                    <div class="whiteButton">
                      <a
                        class="btnSave btn-back back-btn"
                        href="${prevPageLink}"
                        >${backButtonText}</a
                      >
                    </div>
                    <div class="blackButton ml-2 ml-md-3">
                      <a
                        class="btnSave cls-loan-offer_new"
                        href="javascript:void(0)"
                        >${proceedToLoanOfferText}</a
                      >
                    </div>
                    <div class="blackButton ml-2 ml-md-3">
                      <a
                        class="btnSave cls-loan-offer_next"
                        style="display: none"
                        href="${nextPageLink}"
                        >Next</a
                      >
                    </div>
                  </div>
                </div>
                <div class="priceDisclaimerDiv">
                  <span class="show_and_hide"
                    ><a href="#" id="toggleButton"
                      >${disclaimerTextTitle}<small class="active" id="smalldiv"></small></a
                  ></span>
                  <ol id="olList" class="hidden">
                    ${disclaimerTextList}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="popup-card" class="popup-overlay">
          <div class="popup-content">
            <span class="popup-close" id="popup-close">&times;</span>
            <div class="popup-detail">
              <p>
                Default Popup Content
              </p>
            </div>
          </div>
        </div>
     `),
    );

    function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
      const byteCharacters = atob(b64Data); // Decode Base64
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = Array.from(slice, (char) => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
    }

    const downloadBtn = document.getElementById('download-pdf');

    // Check if the element exists before binding the event
    if (downloadBtn) {
      downloadBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Example payload for the API
        const bodyData = {
          enquiry_id: sessionStorage.getItem('enquiryId'),
          email: sessionStorage.getItem('email'),
          mobile: sessionStorage.getItem('mobile'),
          dob: sessionStorage.getItem('dob'),
          car_summary: newSummaryData.car_summary,
        };

        try {
          const response = await priceSummaryDownload(bodyData);
          if (response.success) {
            const { data } = response.data; // Extract the Base64 data

            // Convert Base64 string to Blob
            const pdfBlob = b64toBlob(data, 'application/pdf');

            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'Price_Summary.pdf'; // Set a default file name
            document.body.appendChild(link); // Append link to the DOM
            link.click(); // Trigger the download
            document.body.removeChild(link); // Clean up the DOM
          } else {
            return { error: true, message: '', details: response.message };
          }
        } catch (error) {
          return { error: true, message: '', details: error };
        }
        return { };
      });
    } else {
      return { error: true, message: '' };
    }

    calculateTotalPrice();
    const imgElements = block.querySelectorAll('.inf');

    async function populateRegistrationPopup(popupDetailEl) {
      let registrationPopupHtml = '';
      const registrationCharges = summaryResponse.data.registration_charges;
      const filteredCharges = Object.fromEntries(
        Object.entries(registrationCharges).filter(([, value]) => value !== 0),
      );

      delete filteredCharges.registration_charges;

      const chargesMap = {
        road_tax: 'Road Tax',
        oth_tax: 'Other Tax',
        postal_fee: 'Postal Fee',
        smart_card_charges: 'Smart Card Charges',
        hp_charges: 'Hypothecation Charges',
        fast_tag: 'Fast Tag',
        insp_dlr_reg: 'Inspection of Dealer Registration',
        reg_fees: 'Registration Fees',
      };

      registrationPopupHtml = generateChargesHtml(filteredCharges, chargesMap);
      const paragraphElement = document.createElement('p');
      paragraphElement.innerHTML = registrationPopupHtml;
      popupDetailEl.appendChild(paragraphElement);
    }

    imgElements.forEach((imgTag) => {
      imgTag.addEventListener('click', async (event) => {
        const popupModalEl = block.querySelector('.popup-overlay');
        const popupDetailEl = popupModalEl.querySelector('.popup-detail');
        const dataTarget = event.target.getAttribute('data-target');

        popupDetailEl.innerHTML = ''; // Clear previous content

        if (dataTarget === 'registration') {
          await populateRegistrationPopup(popupDetailEl);
        } else if (dataTarget === 'basic-kit') {
          populateBasicKitPopup(summaryData, popupDetailEl);
        } else {
          populateOtherPopups(dataTarget, popupDetailEl);
        }

        showModal(popupModalEl);
        addModalEventListeners(popupModalEl);
      });
    });

    // insurance listeners
    const insuranceCheckbox = block.querySelector('.insurance_list .child0');
    const insuranceChildCheckboxes = block.querySelectorAll('.insurance.parent0:not(.child0)');

    function handleInsuranceCheckboxClick() {
      if (insuranceCheckbox.checked) {
        checkAllInsuranceChildren(insuranceChildCheckboxes);
      } else {
        uncheckAllInsuranceChildren(insuranceChildCheckboxes);
      }
    }
    insuranceCheckbox.addEventListener('click', handleInsuranceCheckboxClick);

    const checkboxes = block.querySelectorAll('.insurance');
    function handleCheckboxChange(event) {
      const checkbox = event.target;
      const insuranceAddon = checkbox.parentElement.innerText.trim();
      const partPrice = checkbox.dataset.partprice.split('|')[0];
      if (checkbox.checked) {
        insuranceTotal.value += Number(partPrice);
        const addonToAdd = summaryData.insurance_data[0]
          .addon.find((addon) => addon?.name === insuranceAddon);
        if (addonToAdd
          && !newSummaryData.car_summary
            .insurance_data[0]?.addon?.find((addon) => addon?.name === insuranceAddon)) {
          newSummaryData.car_summary.insurance_data[0].addon.push(addonToAdd);
        }
      } else {
        insuranceTotal.value -= Number(partPrice);
        newSummaryData.car_summary.insurance_data[0].addon = newSummaryData
          .car_summary.insurance_data[0].addon
          .filter((addon) => addon?.name !== insuranceAddon);
      }
      block.querySelector('.pricesum_insur_total').innerHTML = utility.formatIndianRupees(insuranceTotal.value);
      calculateTotalPrice();
    }
    // Add event listeners to each insurance checkbox
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });

    // reward points listener
    const msRewardsCheckbox = block.querySelector('.rewards_point');
    if (msRewardsCheckbox) {
      msRewardsCheckbox.addEventListener('change', (event) => {
        const msRewardsPoints = block.querySelector('.priceRightText2.reward_point');
        if (event.target.checked) {
          msRewardsPoints.innerHTML = utility.formatIndianRupees(summaryData.reward_point);
          newSummaryData.car_summary.reward_point = summaryData.reward_point;
        } else {
          msRewardsPoints.innerHTML = utility.formatIndianRupees(0);
          newSummaryData.car_summary.reward_point = null;
        }
        calculateTotalPrice();
      });
    }

    // extended warranty listener
    const extendedWarrantyRadios = block.querySelectorAll('.extended_warrenty_wrap .custom-radio');
    const extendedWarrantyPriceEl = block.querySelector('.priceRightText2.ExtendedWarranty_total');

    function warrantyChangeHandler(event) {
      resetActiveWarranty(extendedWarrantyRadios);
      setActiveWarranty(event);
      updateWarrantyPrice(extendedWarrantyPriceEl, event);
      calculateTotalPrice();
    }

    if (extendedWarrantyRadios.length) {
      extendedWarrantyRadios.forEach((radio) => {
        radio.addEventListener('click', warrantyChangeHandler);
      });
    }
    extendedWarrantyRadios[0]?.click();
    const extendedWarrantyCheckbox = block.querySelector('.ExtendedWarranty');
    extendedWarrantyCheckbox.addEventListener('change', (event) => {
      const checkbox = event.target;
      if (checkbox.checked) {
        block.querySelector('.extended_warrenty_wrap').style.display = 'flex';
        if (extendedWarrantyPriceEl.classList.contains('price_zero')) {
          extendedWarrantyPriceEl.classList.remove('price_zero');
        }
        extendedWarrantyRadios[0].click();
      } else {
        block.querySelector('.extended_warrenty_wrap').style.display = 'none';
        extendedWarrantyPriceEl.innerHTML = utility.formatIndianRupees(0);
        extendedWarrantyPriceEl.classList.add('price_zero');
        newSummaryData.car_summary.extended_warranty_premium = null;
        newSummaryData.car_summary.extended_warranty_year = null;
      }
      calculateTotalPrice();
    });

    // toggle link listeners for disclaimer
    const olList = document.getElementById('olList');
    const smallDiv = document.getElementById('smalldiv');
    if (window.screen.width > 1024) {
      smallDiv.style.display = 'none';
      olList.classList.remove('hidden');
      block.querySelector('#toggleButton').style.color = 'black';
    } else {
      document.getElementById('toggleButton').addEventListener('click', () => {
        if (olList.classList.contains('hidden')) {
          olList.classList.remove('hidden');
          smallDiv.classList.remove('active');
        } else {
          olList.classList.add('hidden');
          smallDiv.classList.add('active');
        }
      });
    }

    // accessories listeners
    const customRadios = block.querySelectorAll('.card .custom-radio');
    const totalAccsCostEl = block.querySelector('.pricesum_Accessories_total');
    const totalAccsCost = { value: utility.extractNumber(totalAccsCostEl.innerHTML) };

    // Initialize
    initializeBasicKitCheckbox(totalAccsCost, totalAccsCostEl, summaryData);
    initializeCustomRadios(customRadios, totalAccsCost, totalAccsCostEl, summaryData);

    // Initialize toggle link handlers
    initializeToggleLinks();

    function handleModelChange() {
      const selectedModel = this.value;
      const variantList = block.querySelector('select.variant_list');
      const colorList = block.querySelector('select.color_list');

      resetDropdowns(variantList, colorList);
      populateVariantList(cars, selectedModel, variantList);
    }
    function handleVariantChange() {
      const selectedVariant = this.value;
      const selectedVariantCode = block.querySelector(`option[value="${selectedVariant}"]`).getAttribute('data-variantCode');
      const selectedModel = block.querySelector('select.model_list_name').value;
      const selectedModelCode = block.querySelector(`option[value="${selectedModel}"]`).getAttribute('data-modelCode');
      sessionStorage.setItem('model', selectedModelCode);
      const variantSessionObj = JSON.parse(sessionStorage.getItem('variant'));
      variantSessionObj.variant_code = selectedVariantCode;
      sessionStorage.setItem('variant', JSON.stringify(variantSessionObj));

      const colorList = block.querySelector('select.color_list');

      resetColorList(colorList);
      populateColorList(cars, selectedModel, selectedVariant, colorList);
    }
    function handleColorChange() {
      const selectedColor = this.value;
      const selectedOption = block.querySelector(`option[value="${selectedColor}"]`);
      const selectedColorCd = selectedOption.dataset.colorcd;
      const selectedColorType = selectedOption.dataset.colortype;
      const selectedColorDesc = selectedOption.dataset.colordesc;
      const variantObj = JSON.parse(sessionStorage.getItem('variant'));
      variantObj.variantColorCode = selectedColorCd;
      variantObj.variantColorType = selectedColorType;
      variantObj.variantColorDesc = selectedColorDesc;
      sessionStorage.setItem('variant', JSON.stringify(variantObj));

      populatePriceSummary(cars);
    }
    // Add event listener for model selection
    block.querySelector('select.model_list_name')?.addEventListener('change', handleModelChange);
    block.querySelector('select.variant_list')?.addEventListener('change', handleVariantChange);
    block.querySelector('select.color_list')?.addEventListener('change', handleColorChange);

    function setDropdownValueByModelCode(modelCode) {
      const selectElement = block.querySelector('.model_list_name');
      const option = Array.from(selectElement.options).find(
        (opt) => opt.getAttribute('data-modelcode') === modelCode,
      );

      if (option) {
        selectElement.value = option.value;
        const event = new Event('change');
        selectElement.dispatchEvent(event);
      }
    }

    function setDropdownValueByVariantCode(variantCodeValue) {
      const selectElement = block.querySelector('.variant_list');
      const option = Array.from(selectElement.options).find(
        (opt) => opt.getAttribute('data-variantcode') === variantCodeValue,
      );

      if (option) {
        selectElement.value = option.value;
        const event = new Event('change');
        selectElement.dispatchEvent(event);
      }
    }
    function setDropdownValueByColorCode(colorCode) {
      const selectElement = block.querySelector('.color_list');
      const option = Array.from(selectElement.options).find(
        (opt) => opt.getAttribute('data-colorcd') === colorCode,
      );

      if (option) {
        selectElement.value = option.value;
      }
    }

    setDropdownValueByModelCode(sessionStorage.getItem('model'));
    setDropdownValueByVariantCode(JSON.parse(sessionStorage.getItem('variant'))?.variant_code);
    setDropdownValueByColorCode(JSON.parse(sessionStorage.getItem('variant'))?.variantColorCode);

    block.querySelector('.cls-loan-offer_new').addEventListener('click', async () => {
      convertNumbersToStrings(newSummaryData);
      newSummaryData.car_summary.on_road_price = String(onRoadPrice);
      newSummaryData.car_summary.ex_showroom_price = newSummaryData.car_summary.exshowroom_price;
      delete newSummaryData.car_summary.exshowroom_price;

      const savePriceSummaryResponse = await savePriceSummary(newSummaryData);
      if (savePriceSummaryResponse.success) {
        window.location.href = nextPageLink;
      }
    });

    return { };
  }

  function renderCarDetails(result) {
    const cars = result.data.carModelList.items;
    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    cars.forEach((car) => {
      const carModelName = `<option value="${car.modelCd}" data-modelCode="${car.model_code}" data-id="${car.modelCd}">
            ${car.modelDesc}
                              </option>`;
      carContainer += carModelName;
    });

    populatePriceSummary(cars);
    return true;
  }
  function getCarsDetails() {
    graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ModelVariantList`;
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        renderCarDetails(result);
      })
      .catch();
  }
  getCarsDetails();

  // check for disclaimer to hide and show
  function handleResize() {
    const viewportWidth = window.innerWidth;

    const divToRemove = document.getElementById('smalldiv');
    const olDiv = document.getElementById('olList');

    // Check if the viewport width is greater than 999px
    if (viewportWidth > 999) {
      if (divToRemove) {
        divToRemove.style.display = 'none';
        olDiv.style.display = 'block';
      }
    } else {
      olDiv.style = '';
      divToRemove.style = '';
    }
  }

  window.addEventListener('resize', handleResize);
}
