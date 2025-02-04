import {
  useState,
  useEffect,
} from '../../commons/scripts/vendor/preact-hooks.js';
import { html } from '../../commons/scripts/vendor/htm-preact.js';
import interaction from './interaction.js';
import ConfiguratorHeader from './configurator-header/ConfiguratorHeader.js';
import BottomContainer from './bottom-container/BottomContainer.js';
import HelpOverlay from './help-overlay/HelpOverlay.js';
import VideoCompare from './video-compare/VideoCompare.js';
import Loader from './loader/Loader.js';
import Highlights from './Highlights/Highlights.js';

const Configurator = ({
  backButtonCTAlinkEl,
  exploreTabNameEl,
  customizeTabNameEl,
  saveAbdShareTabNameEl,
  termsAndConditionsTabNameEl,
  termsAndConditionsTextEl,
  backBtnPopupTitleEl,
  backBtnPopupSubTitleEl,
  backBtnPopupCtaOneLabelEl,
  backBtnPopupCtaTwoLabelEl,
  backPopImageEl,
  backPopImageAltEl,
  jumpBacktoSummaryCTALabelEl,
  rotLandScapeLabelEl,
  rotPortraitLabelEl,
  scriptEl,
  colorEl,
  modelEl,
  modelIdCfEl,
  variantEl,
  assetTypeEl,
  rsLabelEl,
  changeVariantLabelEl,
  selectVariantLabelEl,
  confirmVariantLabelEl,
  extBtnEL,
  intBtnEL,
  nudgeTextEl,
  nudgeIconEl,
  dayImageEl,
  dayImageAltEl,
  nightImageEl,
  nightImageAltEl,
  studioImageEl,
  studioImageAltEl,
  colorUpdateMsgEl,
  transmissionLabelEl,
  fuelTypeLabelEl,
  mileageLabelEl,
  airbagLabelEl,
  featuresLabelEl,
  variantComparisonLabelEl,
  addToCompareLabelEl,
  compareLabelEl,
  removeLabelEl,
  comparisonErrorMessageEl,
  acceTitleLabelEl,
  acceSubTitleLabelEl,
  totalAmountLabelEl,
  viewSummaryCTALabelEl,
  searchPlaceholderLabelEl,
  noSearchLabelEl,
  quickViewLabelEl,
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
  grandTotalLabelEl,
  conToDealerCtaLabelEl,
  checkoutCtaLabelEl,
  exitConfiguratorLabelEl,
  exitConfiguratorPopupLabelEl,
  exitConfigPopupSubTitleEl,
  exitPopupCtaOneLabelEl,
  exitPopupCtaTwoLabelEl,
  noAccessoryMessageEl,
  noAccessoryProceedLabelEl,
  noAccessoryCtaOneLabelEl,
  noAccessoryCtaTwoLabelEl,
  modelLabelEl,
  variantLabelEl,
  colorLabelEl,
  accNotAvlblTitleLabelEl,
  accNotAvailableLabelEl,
  accNotAvailableCTAOneLabelEl,
  accNotAvailableCTATwoLabelEl,
  basicSelectionLabelEl,
  newvariantPopupTitleEl,
  newvariantPopupSubTitleEl,
  newVariantPopUpCtaOneEl,
  newVariantPopUpCtaTwoEl,
  mainNavEl,
  featureHotspotEl,
  carInteractionEl,
  colorSelectionEl,
  variantSelectionEl,
  mainNavHighlightEl,
  featureHotspotHighlightEl,
  carInteractionHighlightEl,
  colorSelectionHighlightEl,
  variantSelectionHighlightEl,
  loginPopupTitlelabelEl,
  loginPopupSubTitleLabelEl,
  loginPopupCTAOneLabelEl,
  loginPopupCTATwoLabel,
  renameCarPopupTitleLabelEl,
  renameCarInputLabelEl,
  renameCarPopCtaLabelEl,
  savdCarsLabelEl,
  askFriendLabelEl,
  savedCarsSubTitleLabelEl,
  savedCardCtaOneLabelEl,
  savedCardCtaTwoLabelEl,
  noSavedCarsMsgLabelEl,
  newConfLabelEl,
  renameConfLabelEl,
  downloadConfLabelEl,
  duplicateConfLabelEl,
  deleteConfLabelEl,
  selectModelLabelEl,
  continueCtalabelEl,
  deletePopupTitleLabelEl,
  deletePopupSubTitleLabelEl,
  deletePopupCtaOneLabelEl,
  deletePopupCtaTwoLabelEl,
  renamePopTitleLabelEl,
  renamePopInputLabelEl,
  renamePopCtaLabelEl,
  edgeCasePopupTitleLabelEl,
  edgeCasePopupSubTitleLabelEl,
  edgeCasePopupCtaOneLabelEl,
  selectCarsToDeleteLabelEl,
}) => {
  const getElementTextContent = (el) => el?.querySelector('p')?.textContent?.trim() || '';

  const exteriorBtnLabel = getElementTextContent(extBtnEL);
  const interiorBtnLabel = getElementTextContent(intBtnEL);
  const featuresLabel = getElementTextContent(featuresLabelEl);
  const changeVariantLabel = getElementTextContent(changeVariantLabelEl) || '';
  const transmissionLabel = getElementTextContent(transmissionLabelEl);
  const fuelTypeLabel = getElementTextContent(fuelTypeLabelEl);
  const mileageLabel = getElementTextContent(mileageLabelEl);
  const airbagLabel = getElementTextContent(airbagLabelEl);
  const rsLabel = getElementTextContent(rsLabelEl) || '';
  const confirmVariantLabel = getElementTextContent(confirmVariantLabelEl) || '';
  const selectVariantLabel = getElementTextContent(selectVariantLabelEl) || '';
  const testModel = modelEl?.textContent?.trim() || '';
  const mainHelpNav = mainNavEl?.textContent?.trim() || '';
  const carInteractionHelp = carInteractionEl?.textContent?.trim() || '';
  const featureHotspotHelp = featureHotspotEl?.textContent?.trim() || '';
  const colorSelectionHelp = colorSelectionEl?.textContent?.trim() || '';
  const variantSelectionHelp = variantSelectionEl?.textContent?.trim() || '';

  const mainHelpHighlight = mainNavHighlightEl?.textContent?.trim() || '';
  const featureHighlight = featureHotspotHighlightEl?.textContent?.trim() || '';
  const carInteractionHighlight = carInteractionHighlightEl?.textContent?.trim() || '';
  const colorSelectionHighlight = colorSelectionHighlightEl?.textContent?.trim() || '';
  const variantSelectionHighlight = variantSelectionHighlightEl?.textContent?.trim() || '';

  const variantComparisonLabel = getElementTextContent(variantComparisonLabelEl) || '';
  const addToCompareLabel = getElementTextContent(addToCompareLabelEl) || '';
  const compareLabel = getElementTextContent(compareLabelEl) || '';
  const removeLabel = getElementTextContent(removeLabelEl) || '';
  const comparisonErrorMessage = getElementTextContent(comparisonErrorMessageEl) || '';
  const nudgeText = getElementTextContent(nudgeTextEl) || '';
  const nudgeIcon = nudgeIconEl.querySelector('img') || '';
  const dayImage = dayImageEl.querySelector('img')?.src || '';
  const nightImage = nightImageEl.querySelector('img')?.src || '';
  const studioImage = studioImageEl.querySelector('img')?.src || '';
  const dayImageAltText = getElementTextContent(dayImageAltEl) || '';
  const nightImageAltText = getElementTextContent(nightImageAltEl) || '';
  const studioImageAltText = getElementTextContent(studioImageAltEl) || '';
  const connectToDealerLabel = getElementTextContent(conToDealerCtaLabelEl) || '';
  const connectToDealerLink = conToDealerCtaLabelEl?.querySelector('a')?.href || '#';
  const eBookingLabel = getElementTextContent(savedCardCtaTwoLabelEl) || '';
  const eBookingLink = savedCardCtaTwoLabelEl?.querySelector('a')?.href || '#';

  const variantDetailsLabels = {
    transmissionLabel,
    fuelTypeLabel,
    mileageLabel,
    airbagLabel,
    featuresLabel,
  };

  // Data for Help section Menu
  const HelpConfig = [
    {
      menuTitle: mainHelpNav,
      selectedName: mainHelpHighlight,
      elementSelector: 'config-header',
      alignArrow: 'top',
    },
    {
      menuTitle: carInteractionHelp,
      selectedName: carInteractionHighlight,
      elementSelector: 'wrapper__interactions',
      alignArrow: 'bottom',
    },
    {
      menuTitle: colorSelectionHelp,
      selectedName: colorSelectionHighlight,
      elementSelector: 'color__selector',
      alignArrow: 'bottom',
    },
    {
      menuTitle: variantSelectionHelp,
      selectedName: variantSelectionHighlight,
      elementSelector: 'variant__selector-container',
      alignArrow: 'bottom',
    },
  ];

  const [color, setColor] = useState(colorEl?.textContent?.trim() || '');
  const [model, setModel] = useState(modelEl?.textContent?.trim() || '');
  const [variant, setVariant] = useState(variantEl?.textContent?.trim() || '');
  const [script, setScript] = useState(
    scriptEl?.querySelector('a')?.href || '',
  );
  const selectedModel = modelIdCfEl?.textContent?.trim() || '';
  const assetType = assetTypeEl?.textContent?.trim() || '';
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showHelpScreen, setShowHelpScreen] = useState(false);
  const [showVideoCompair, setShowVideoCompair] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [highlightsView, setHighlightsView] = useState(false);
  const [variantData, setVariantData] = useState([]);
  const [compareVariantData, setCompareVariantData] = useState([]);
  const [onMoreClick, setOnMoreClick] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [addedAccessories, setAddedAccessories] = useState([]);
  const [categoriesData, setCategoriesData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [confirmedVariant, setConfirmedVariant] = useState();

  const interactionLabel = {
    exteriorBtnLabel,
    interiorBtnLabel,
    changeVariantLabel,
    airbagLabel,
    rsLabel,
    confirmVariantLabel,
    selectVariantLabel,
    testModel, // to be check later
    variantComparisonLabel,
    addToCompareLabel,
    compareLabel,
    removeLabel,
    comparisonErrorMessage,
  };

  useEffect(() => {
    if (script && color && model && variant) {
      interaction.loadConfigurator(
        script,
        color,
        model,
        variant,
        assetType,
        selectedModel,
      );
    }
  }, []);

  const onTabChange = (tab) => {
    setActiveTab(tab);
  };

  const htmlContent = html`
    ${showLoader && html`<${Loader}/>`}
    <${ConfiguratorHeader}
      model=${model}
      selectedVariant=${selectedVariant}
      setSelectedVariant=${setSelectedVariant}
      backButtonCTAlinkEl=${backButtonCTAlinkEl}
      exploreTabNameEl=${exploreTabNameEl}
      customizeTabNameEl=${customizeTabNameEl}
      saveAbdShareTabNameEl=${saveAbdShareTabNameEl}
      termsAndConditionsTabNameEl=${termsAndConditionsTabNameEl}
      termsAndConditionsTextEl=${termsAndConditionsTextEl}
      selectedModel=${selectedModel}
      activeTab=${activeTab}
      onTabChange=${onTabChange}
      addedAccessories=${addedAccessories}
      categoriesData=${categoriesData}
      selectedColor=${selectedColor}
      exitConfiguratorPopupLabelEl=${exitConfiguratorPopupLabelEl}
      exitConfigPopupSubTitleEl=${exitConfigPopupSubTitleEl}
      exitPopupCtaOneLabelEl=${exitPopupCtaOneLabelEl}
      exitPopupCtaTwoLabelEl=${exitPopupCtaTwoLabelEl}
      backBtnPopupTitleEl=${backBtnPopupTitleEl}
      backBtnPopupSubTitleEl=${backBtnPopupSubTitleEl}
      backBtnPopupCtaOneLabelEl=${backBtnPopupCtaOneLabelEl}
      backBtnPopupCtaTwoLabelEl=${backBtnPopupCtaTwoLabelEl}
      backPopImageEl=${backPopImageEl}
      backPopImageAltEl=${backPopImageAltEl}
      renameCarPopCtaLabelEl=${renameCarPopCtaLabelEl}
      confirmedVariant=${confirmedVariant} 
      setConfirmedVariant=${setConfirmedVariant}
    />
    <div id="app3d" classList="appOne3d">
      <div id="one3d" style="padding-left:0"></div>
    </div>
    <${BottomContainer}
      authoredColor=${color}
      authoredVariant=${variant}      
      selectedVariant=${selectedVariant}
      setSelectedVariant=${setSelectedVariant}
      interactionLabel=${interactionLabel}
      variantDetailsLabels=${variantDetailsLabels}
      setShowHelpScreen=${setShowHelpScreen}
      activeTab=${activeTab}
      setHighlightsView=${setHighlightsView}
      setActiveTab=${setActiveTab}
      variantData=${variantData}
      setVariantData=${setVariantData}
      showVideoCompair=${showVideoCompair}
      setShowVideoCompair=${setShowVideoCompair}
      compareVariantData=${compareVariantData}
      setCompareVariantData=${setCompareVariantData}
      onMoreClick=${onMoreClick}
      setOnMoreClick=${setOnMoreClick}
      selectedModel=${selectedModel}
      onTabChange=${onTabChange}
      acceTitleLabelEl=${acceTitleLabelEl}
      acceSubTitleLabelEl=${acceSubTitleLabelEl}
      totalAmountLabelEl=${totalAmountLabelEl}
      viewSummaryCTALabelEl=${viewSummaryCTALabelEl}
      searchPlaceholderLabelEl=${searchPlaceholderLabelEl}
      noSearchLabelEl=${noSearchLabelEl}
      addBtnLabelEl=${addBtnLabelEl}
      removeBtnLabelEl=${removeBtnLabelEl}
      priceLabelEl=${priceLabelEl}
      priceFilterOneLabelEl=${priceFilterOneLabelEl}
      priceFilterTwoLabelEl=${priceFilterTwoLabelEl}
      acceWarningMsgTitleLabelEl=${acceWarningMsgTitleLabelEl}
      acceWarningMsgSubTitleLabelEl=${acceWarningMsgSubTitleLabelEl}
      acceWarningProceedLabelEl=${acceWarningProceedLabelEl}
      warnCtaOneLabelEl=${warnCtaOneLabelEl}
      warnCtaTwolabelEl=${warnCtaTwolabelEl}
      setShowLoader=${setShowLoader}
      quickViewLabelEl=${quickViewLabelEl}
      addedAccessories=${addedAccessories}
      setAddedAccessories=${setAddedAccessories}
      categoriesData=${categoriesData}
      setCategoriesData=${setCategoriesData}
      connectToDealerLink=${connectToDealerLink}
      connectToDealerLabel=${connectToDealerLabel}
      selectedColor=${selectedColor}
      setSelectedColor=${setSelectedColor}
      noAccessoryMessageEl=${noAccessoryMessageEl}
      noAccessoryProceedLabelEl=${noAccessoryProceedLabelEl}
      noAccessoryCtaOneLabelEl=${noAccessoryCtaOneLabelEl}
      noAccessoryCtaTwoLabelEl=${noAccessoryCtaTwoLabelEl}
      loginPopupTitlelabelEl=${loginPopupTitlelabelEl}
      loginPopupSubTitleLabelEl=${loginPopupSubTitleLabelEl}
      loginPopupCTAOneLabelEl=${loginPopupCTAOneLabelEl}
      loginPopupCTATwoLabel=${loginPopupCTATwoLabel}
      renameCarPopupTitleLabelEl=${renameCarPopupTitleLabelEl}
      renameCarInputLabelEl=${renameCarInputLabelEl}
      renameCarPopCtaLabelEl=${renameCarPopCtaLabelEl}
      savdCarsLabelEl=${savdCarsLabelEl}
      askFriendLabelEl=${askFriendLabelEl}
      savedCarsSubTitleLabelEl=${savedCarsSubTitleLabelEl}
      savedCardCtaOneLabelEl=${savedCardCtaOneLabelEl}
      savedCardCtaTwoLabelEl=${savedCardCtaTwoLabelEl}
      noSavedCarsMsgLabelEl=${noSavedCarsMsgLabelEl}
      newConfLabelEl=${newConfLabelEl}
      renameConfLabelEl=${renameConfLabelEl}
      downloadConfLabelEl=${downloadConfLabelEl}
      duplicateConfLabelEl=${duplicateConfLabelEl}
      deleteConfLabelEl=${deleteConfLabelEl}
      selectModelLabelEl=${selectModelLabelEl}
      continueCtalabelEl=${continueCtalabelEl}
      deletePopupTitleLabelEl=${deletePopupTitleLabelEl}
      deletePopupSubTitleLabelEl=${deletePopupSubTitleLabelEl}
      deletePopupCtaOneLabelEl=${deletePopupCtaOneLabelEl}
      deletePopupCtaTwoLabelEl=${deletePopupCtaTwoLabelEl}
      renamePopTitleLabelEl=${renamePopTitleLabelEl}
      renamePopInputLabelEl=${renamePopInputLabelEl}
      renamePopCtaLabelEl=${renamePopCtaLabelEl}
      edgeCasePopupTitleLabelEl=${edgeCasePopupTitleLabelEl}
      edgeCasePopupSubTitleLabelEl=${edgeCasePopupSubTitleLabelEl}
      edgeCasePopupCtaOneLabelEl=${edgeCasePopupCtaOneLabelEl}
      selectCarsToDeleteLabelEl=${selectCarsToDeleteLabelEl}
      grandTotalLabelEl=${grandTotalLabelEl}
      modelLabelEl=${modelLabelEl}
      variantLabelEl=${variantLabelEl}
      colorLabelEl=${colorLabelEl}
      basicSelectionLabelEl=${basicSelectionLabelEl}
      eBookingLabel=${eBookingLabel}
      eBookingLink=${eBookingLink}
      checkoutCtaLabelEl=${checkoutCtaLabelEl}
      newvariantPopupTitleEl=${newvariantPopupTitleEl}
      newvariantPopupSubTitleEl=${newvariantPopupSubTitleEl}
      newVariantPopUpCtaOneEl=${newVariantPopUpCtaOneEl}
      newVariantPopUpCtaTwoEl=${newVariantPopUpCtaTwoEl}
      nudgeText=${nudgeText}
      jumpBacktoSummaryCTALabelEl=${jumpBacktoSummaryCTALabelEl}
      accNotAvlblTitleLabelEl=${accNotAvlblTitleLabelEl}
      accNotAvailableLabelEl=${accNotAvailableLabelEl}
      accNotAvailableCTAOneLabelEl=${accNotAvailableCTAOneLabelEl}
      accNotAvailableCTATwoLabelEl=${accNotAvailableCTATwoLabelEl}
      confirmedVariant=${confirmedVariant} 
      setConfirmedVariant=${setConfirmedVariant}
      dayImage=${dayImage}
      nightImage=${nightImage}
      studioImage=${studioImage}
      dayImageAltText=${dayImageAltText}
      nightImageAltText=${nightImageAltText}
      studioImageAltText=${studioImageAltText}
    />
    <${HelpOverlay}
      helpConfig=${HelpConfig}
      showHelpScreen=${showHelpScreen}
      setShowHelpScreen=${setShowHelpScreen}
    />
    ${highlightsView
    && html`<${Highlights}
      highlightsView=${highlightsView}
      setHighlightsView=${setHighlightsView}
      selectedModel=${selectedModel}
      selectedVariant=${selectedVariant}
    />`}
    ${showVideoCompair
    && html`<${VideoCompare}
      compaireList=${compareVariantData}
      setCompaireList=${setCompareVariantData}
      allVarient=${variantData}
      showVideoCompair=${showVideoCompair}
      setShowVideoCompair=${setShowVideoCompair}
      setOnMoreClick=${setOnMoreClick}
      rsLabel=${rsLabel}
    />`}
  `;

  return htmlContent;
};
export default Configurator;
