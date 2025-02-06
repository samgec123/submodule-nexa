import { html } from "../../../commons/scripts/vendor/htm-preact.js";
import {
  useEffect,
  useState,
} from "../../../commons/scripts/vendor/preact-hooks.js";
import utility from "../../../utility/utility.js";
import { DownArrowIcon } from "../Icons.js";
import SummaryDetailsPopup from "../Summary/SummaryDetailsPopup.js";
import AccessoriesList from "./AccessoriesList.js";
import AccessoriesPriceSection from "./AccessoriesPriceSection.js";
import ConfirmationPopup from "./ConfirmationPopup.js";
import InfoPopup from "./InfoPopup.js";
import ParentCategoryNav from "./ParentCategoryNav.js";
import QuickviewList from "./QuickviewList.js";
import SearchAndSort from "./SearchAndSort.js";
import SubCategoryNav from "./SubCategoryNav.js";

const AccessoriesDetails = ({
  handleAccessoriesChange,
  handleAddAccessory,
  handleRemoveAccessory,
  selectedVariant,
  acceTitleLabelEl,
  acceSubTitleLabelEl,
  totalAmountLabelEl,
  viewSummaryCTALabelEl,
  searchPlaceholderLabelEl,
  noSearchLabelEl,
  addBtnLabelEl,
  removeBtnLabelEl,
  priceLabelEl,
  priceFilterOneLabelEl,
  priceFilterTwoLabelEl,
  acceWarningMsgTitleLabelEl,
  acceWarningMsgSubTitleLabelEl,
  acceWarningProceedLabelEl,
  warnCtaOneLabelEl,
  warnCtaTwolabelEl,
  categoriesData,
  selectedColor,
  showSummary,
  setShowSummary,
  isSummaryEditable,
  addedAccessories,
  setAddedAccessories,
  isRedirectedToColor,
  setIsRedirectedToColor,
  isRedirectedToVariant,
  setIsRedirectedToVariant,
  showEditVariantPopup,
  setShowEditVariantPopup,
  selectedModel,
  newAccessoriesList,
  missingAccessoriesList,
  accessoryType,
  setAccessoryType,
  handleRedirecttoSummary,
  handleRedirecttoAcc,
  totalPrice,
  setTotalPrice,
  setActiveTab,
  setIsChangeMode,
  publishDomain,
  isAccessoryAdded,
  handleConfirmAdd,
  handleCancelAdd,
  showPopup,
  setShowPopup,
  duplicateAccessory,
  setDuplicateAccessory,
  setPreviousSelectedVariant,
  conflictingAccessories,
  setConflictingAccessories,
  confirmPopupContent,
  setConfirmPopupContent,
  showInfoPopup,
  setShowInfoPopup,
  handleTabClick,
  setIsChangeVariantMobile,
  quickViewLabelEl,
  setInQuickView,
  inQuickView,
  connectToDealerLink,
  connectToDealerLabel,
  handleAccessoryClick,
  previewState,
  isAccessoryInPreview,
  setInfoAccessory,
  infoAccessory,
  noAccessoryMessageEl,
  noAccessoryProceedLabelEl,
  noAccessoryCtaOneLabelEl,
  noAccessoryCtaTwoLabelEl,
  grandTotalLabelEl,
  modelLabelEl,
  variantLabelEl,
  colorLabelEl,
  basicSelectionLabelEl,
  checkoutCtaLabelEl,
  formatIndianCurrency,
}) => {
  const [selectedParentCategory, setSelectedParentCategory] = useState("ALL");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("ALL");
  const [subCategoryAccessories, setSubCategoryAccessories] = useState([]);
  const [accessoriesPrice, setAccessoriesPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const isMobile = utility.isMobileView(); // Check if in mobile view

  const parentCategories = categoriesData?.data?.parentCategories || [];
  const noAccessoryMessageText = noAccessoryMessageEl?.textContent?.trim();
  const noAccessoryProceedLabel =
    noAccessoryProceedLabelEl?.textContent?.trim();
  const noAccessoryCtaOneLabel = noAccessoryCtaOneLabelEl?.textContent?.trim();
  const noAccessoryCtaTwoLabel = noAccessoryCtaTwoLabelEl?.textContent?.trim();

  // Fetch accessories based on selected parent and subcategory
  const updateAccessories = () => {
    if (selectedParentCategory === "ALL") {
      const allSubCategories = parentCategories.flatMap(
        (category) => category.subCategories
      );
      setSelectedSubCategories(allSubCategories);
    }
    if (selectedParentCategory === "ALL" && selectedSubCategory === "ALL") {
      // Combine all accessories across all parent categories
      const allAccessories = parentCategories.flatMap((parent) =>
        parent.subCategories.flatMap((sub) => sub.accessories || [])
      );
      setSubCategoryAccessories(allAccessories || []);
    } else if (selectedSubCategory === "ALL") {
      // Combine all accessories for the selected parent category
      const selectedParent = parentCategories.find(
        (parent) => parent.parentCategoryCd === selectedParentCategory
      );
      const allAccessories = selectedParent?.subCategories.flatMap(
        (sub) => sub.accessories || []
      );
      setSubCategoryAccessories(allAccessories || []);
    } else {
      // Set accessories for the specific selected subcategory
      const selectedCategory = selectedSubCategories.find(
        (sub) => sub.l2CatgName === selectedSubCategory
      );
      setSubCategoryAccessories(selectedCategory?.accessories || []);
    }
  };

  useEffect(() => {
    updateAccessories();
  }, [selectedParentCategory, selectedSubCategory]);

  useEffect(() => {
    updateAccessories();
  }, [categoriesData]);

  const filteredAndSortedAccessories = subCategoryAccessories
    .filter((accessory) =>
      accessory.partDesc.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

  useEffect(() => {
    const totalAccPrice = addedAccessories.reduce((acc, accessory) => {
      const price = parseFloat(
        String(accessory.price || "0").replace(/,/g, "")
      );
      return acc + price * (accessory.qty || 1); // Multiply by quantity
    }, 0);

    const accessoryTotal = formatIndianCurrency(totalAccPrice);
    setAccessoriesPrice(accessoryTotal);
  }, [addedAccessories]);

  const handleParentCategoryClick = (parentCategoryCd) => {
    setSelectedParentCategory(parentCategoryCd);
    if (parentCategoryCd !== "ALL") {
      // if its not required to reset then remove it
      setSearchTerm("");
      setSortOrder("asc");
    }
    if (parentCategoryCd === "ALL") {
      const allSubCategories = parentCategories.flatMap(
        (category) => category.subCategories
      );
      setSelectedSubCategories(allSubCategories);
      setSelectedSubCategory("ALL"); // Default subcategory
    } else {
      const selectedCategory = parentCategories.find(
        (category) => category.parentCategoryCd === parentCategoryCd
      );
      setSelectedSubCategories(
        selectedCategory ? selectedCategory.subCategories : []
      );
      setSelectedSubCategory("ALL"); // Default subcategory for the new parent
    }
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(
      subCategory === "ALL" ? "ALL" : subCategory.l2CatgName
    );
  };

  const handleInfoClick = (accessory) => {
    setInfoAccessory(accessory);
    setShowInfoPopup(true);
  };

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  const handleOpenSummaryPopup = () => {
    if (addedAccessories.length > 0) {
      setShowSummary(true);
      return;
    }
    setConfirmPopupContent({
      heading: noAccessoryMessageText,
      confirmationText: noAccessoryProceedLabel,
      isSummaryFlow: true,
      revertBtnText: noAccessoryCtaTwoLabel,
      confirmBtnText: noAccessoryCtaOneLabel,
    });
    setShowPopup(true);
  };

  const handleCloseSummaryPopup = () => {
    setShowSummary(false);
  };

  return html`
    ${!(isMobile && showSummary) &&
    html`<div
      class="accessories__details-expanded${inQuickView
        ? " in-quick-view"
        : ""}"
    >
      <div class="accessories-name">
        ${acceTitleLabelEl?.textContent?.trim()}
        <button
          id="accessories-down-arrow"
          onClick=${() => {
            if (isMobile) {
              handleTabClick("explore");
            } else {
              handleAccessoriesChange();
            }
          }}
        >
          <${DownArrowIcon} />
        </button>
      </div>
      <div class="accessories-sub-details">
        <p class="accessories-sub-text">
          ${acceSubTitleLabelEl?.textContent?.trim()}
        </p>
      </div>
      <${ParentCategoryNav}
        parentCategories=${parentCategories}
        selectedParentCategory=${selectedParentCategory}
        handleParentCategoryClick=${handleParentCategoryClick}
      />
      ${selectedParentCategory !== "ALL" &&
      html`<${SubCategoryNav}
        selectedSubCategories=${selectedSubCategories}
        selectedSubCategory=${selectedSubCategory}
        handleSubCategoryClick=${handleSubCategoryClick}
      />`}
      ${selectedParentCategory === "ALL" &&
      html`<${SearchAndSort}
        searchTerm=${searchTerm}
        setSearchTerm=${setSearchTerm}
        sortOrder=${sortOrder}
        setSortOrder=${setSortOrder}
        searchPlaceholderLabelEl=${searchPlaceholderLabelEl}
        priceLabelEl=${priceLabelEl}
        priceFilterOneLabelEl=${priceFilterOneLabelEl}
        priceFilterTwoLabelEl=${priceFilterTwoLabelEl}
      />`}
      <${AccessoriesList}
        subCategoryAccessories=${filteredAndSortedAccessories}
        addedAccessories=${addedAccessories}
        handleAddAccessory=${handleAddAccessory}
        handleRemoveAccessory=${handleRemoveAccessory}
        isAccessoryAdded=${isAccessoryAdded}
        searchTerm=${searchTerm}
        sortOrder=${sortOrder}
        handleInfoClick=${handleInfoClick}
        setShowInfoPopup=${setShowInfoPopup}
        setInfoAccessory=${setInfoAccessory}
        publishDomain=${publishDomain}
        noSearchLabelEl=${noSearchLabelEl}
        addBtnLabelEl=${addBtnLabelEl}
        removeBtnLabelEl=${removeBtnLabelEl}
        totalPrice=${totalPrice}
        totalAmountLabelEl=${totalAmountLabelEl}
        viewSummaryCTALabelEl=${viewSummaryCTALabelEl}
        handleOpenSummaryPopup=${handleOpenSummaryPopup}
        handleAccessoryClick=${handleAccessoryClick}
        isAccessoryInPreview=${isAccessoryInPreview}
        selectedParentCategory=${selectedParentCategory}
        selectedSubCategory=${selectedSubCategory}
        categoriesData=${categoriesData}
        selectedColor=${selectedColor}
        selectedVariant=${selectedVariant}
      />
      ${addedAccessories.length >= 1 &&
      html`<${AccessoriesPriceSection}
        addedAccessories=${addedAccessories}
        accessoriesPrice=${accessoriesPrice}
        totalPrice=${totalPrice}
        acceTitleLabelEl=${acceTitleLabelEl}
        totalAmountLabelEl=${totalAmountLabelEl}
        viewSummaryCTALabelEl=${viewSummaryCTALabelEl}
        handleOpenSummaryPopup=${handleOpenSummaryPopup}
        setInQuickView=${setInQuickView}
        categoriesData=${categoriesData}
        selectedColor=${selectedColor}
        selectedVariant=${selectedVariant}
      />`}
    </div> `}
    <${ConfirmationPopup}
      showPopup=${showPopup}
      heading=${confirmPopupContent.heading}
      description=${confirmPopupContent.description}
      confirmationText=${confirmPopupContent.confirmationText}
      handleConfirmAdd=${handleConfirmAdd}
      handleCancelAdd=${handleCancelAdd}
      conflictingAccessories=${conflictingAccessories}
      acceWarningMsgTitleLabelEl=${acceWarningMsgTitleLabelEl}
      acceWarningMsgSubTitleLabelEl=${acceWarningMsgSubTitleLabelEl}
      acceWarningProceedLabelEl=${acceWarningProceedLabelEl}
      warnCtaOneLabelEl=${warnCtaOneLabelEl}
      warnCtaTwolabelEl=${warnCtaTwolabelEl}
      revertBtnText=${confirmPopupContent.revertBtnText}
      confirmBtnText=${confirmPopupContent.confirmBtnText}
      isSummaryFlow=${confirmPopupContent.isSummaryFlow}
      handleOpenSummaryPopup=${handleOpenSummaryPopup}
      setShowSummary=${setShowSummary}
      setShowPopup=${setShowPopup}
    />
    ${showInfoPopup &&
    html`<${InfoPopup}
      infoAccessory=${infoAccessory}
      handleAddAccessory=${handleAddAccessory}
      handleCloseInfoPopup=${handleCloseInfoPopup}
      publishDomain=${publishDomain}
      addBtnLabelEl=${addBtnLabelEl}
      removeBtnLabelEl=${removeBtnLabelEl}
      isAccessoryAdded=${isAccessoryAdded}
      handleRemoveAccessory=${handleRemoveAccessory}
      addedAccessories=${addedAccessories}
    /> `}
    ${showSummary &&
    html`<${SummaryDetailsPopup}
      addedAccessories=${addedAccessories}
      accessoriesPrice=${accessoriesPrice}
      totalPrice=${totalPrice}
      selectedVariant=${selectedVariant}
      selectedColor=${selectedColor}
      handleCloseSummaryPopup=${handleCloseSummaryPopup}
      categoriesData=${categoriesData}
      setSelectedParentCategory=${setSelectedParentCategory}
      isSummaryEditable=${isSummaryEditable}
      isRedirectedToColor=${isRedirectedToColor}
      setIsRedirectedToColor=${setIsRedirectedToColor}
      isRedirectedToVariant=${isRedirectedToVariant}
      setIsRedirectedToVariant=${setIsRedirectedToVariant}
      setActiveTab=${setActiveTab}
      setIsChangeMode=${setIsChangeMode}
      setPreviousSelectedVariant=${setPreviousSelectedVariant}
      setShowSummary=${setShowSummary}
      handleTabClick=${handleTabClick}
      connectToDealerLink=${connectToDealerLink}
      connectToDealerLabel=${connectToDealerLabel}
      grandTotalLabelEl=${grandTotalLabelEl}
      modelLabelEl=${modelLabelEl}
      variantLabelEl=${variantLabelEl}
      colorLabelEl=${colorLabelEl}
      basicSelectionLabelEl=${basicSelectionLabelEl}
      checkoutCtaLabelEl=${checkoutCtaLabelEl}
    /> `}
    ${inQuickView &&
    html`<${QuickviewList}
      subCategoryAccessories=${filteredAndSortedAccessories}
      addedAccessories=${addedAccessories}
      handleAddAccessory=${handleAddAccessory}
      handleRemoveAccessory=${handleRemoveAccessory}
      isAccessoryAdded=${isAccessoryAdded}
      searchTerm=${searchTerm}
      sortOrder=${sortOrder}
      handleInfoClick=${handleInfoClick}
      setShowInfoPopup=${setShowInfoPopup}
      setInfoAccessory=${setInfoAccessory}
      publishDomain=${publishDomain}
      noSearchLabelEl=${noSearchLabelEl}
      addBtnLabelEl=${addBtnLabelEl}
      totalPrice=${totalPrice}
      totalAmountLabelEl=${totalAmountLabelEl}
      viewSummaryCTALabelEl=${viewSummaryCTALabelEl}
      handleOpenSummaryPopup=${handleOpenSummaryPopup}
      quickViewLabelEl=${quickViewLabelEl}
      setInQuickView=${setInQuickView}
      accessoriesPrice=${accessoriesPrice}
      acceTitleLabelEl=${acceTitleLabelEl}
    /> `}
  `;
};
//this is a comment
//this is comment 2
//this is cooment 3
export default AccessoriesDetails;
