import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useEffect,
  useState,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import apiUtils from '../../../utility/apiUtils.js';
import common from '../common.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';
import { stubbedResponse } from '../stubbedResponse.js';
import {
  UpDarkArrowIcon,
  HelpIcon,
  HomeIcon,
  EnvironmentIcon,
  SnapIcon,
  UpArrowIcon,
  DownArrowIcon,
  variantCloseIcon,
  HotspotOnIcon,
  HotspotOffIcon,
  InteriorModeBtn,
  InteriorModeBtnClicked,
  fullScreenBtn,
  ShareSummaryMobileIcon,
  DownloadSummaryMobileIcon,
  EditSummaryMobileIcon,
  nextTabIcon,
  ActiveHomeIcon,
  fullScreenBtnOpen,
  ActiveEnvironmentIcon,
} from '../Icons.js';
import AccessoriesDetails from '../Accessories/AccessoriesDetails.js';
import interaction from '../interaction.js';
import CarVariantDetails from '../Variant/car-variant-details/CarVariantDetails.js';
import CarVariantDetailsMobile from '../Variant/car-variant-details/CarVariantDetailsMobile.js';
import ChangeVariantDetails from '../Variant/change-variant-details/ChangeVariantDetails.js';
import ChangeVariantDetailsMobile from '../Variant/change-variant-details/ChangeVariantDetailsMobile.js';
import ColorPicker from '../color-picker/ColorPicker.js';
import utility from '../../../utility/utility.js';
import SaveConfiguration from '../save-configuration/SaveConfiguration.js';
import configuratorApiUtils from '../configuratorApiUtils.js';
import EditVariantPopup from '../Accessories/EditVariantPopup.js';
import { fetchPlaceholders } from '../../../commons/scripts/aem.js';

const allPlaceholders = await fetchPlaceholders();

const BottomContainer = ({
  authoredColor,
  authoredVariant,
  interactionLabel,
  variantDetailsLabels,
  setShowHelpScreen,
  selectedVariant,
  setSelectedVariant,
  activeTab,
  setHighlightsView,
  setActiveTab,
  variantData,
  setVariantData,
  showVideoCompair,
  setShowVideoCompair,
  compareVariantData,
  setCompareVariantData,
  setIfCompareVideo,
  onMoreClick,
  setOnMoreClick,
  selectedModel,
  onTabChange,
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
  setShowLoader,
  quickViewLabelEl,
  addedAccessories,
  setAddedAccessories,
  categoriesData,
  setCategoriesData,
  connectToDealerLink,
  connectToDealerLabel,
  selectedColor,
  setSelectedColor,
  noAccessoryMessageEl,
  noAccessoryProceedLabelEl,
  noAccessoryCtaOneLabelEl,
  noAccessoryCtaTwoLabelEl,
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
  grandTotalLabelEl,
  modelLabelEl,
  variantLabelEl,
  colorLabelEl,
  basicSelectionLabelEl,
  eBookingLabel,
  eBookingLink,
  checkoutCtaLabelEl,
  newvariantPopupTitleEl,
  newvariantPopupSubTitleEl,
  newVariantPopUpCtaOneEl,
  newVariantPopUpCtaTwoEl,
  nudgeText,
  jumpBacktoSummaryCTALabelEl,
  accNotAvlblTitleLabelEl,
  accNotAvailableLabelEl,
  accNotAvailableCTAOneLabelEl,
  accNotAvailableCTATwoLabelEl,
  confirmedVariant,
  setConfirmedVariant,
  dayImage,
  nightImage,
  studioImage,
  dayImageAltText,
  nightImageAltText,
  studioImageAltText,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [showVariantDetails, setShowVariantDetails] = useState(false);
  const [showAccessoryDetails, setShowAccessoryDetails] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [showSelectedBtn, setShowSelectedBtn] = useState(false);
  const [isChangeVariantMobile, setIsChangeVariantMobile] = useState(false);
  const [toggleHotspotBtn, setToggleHotspotBtn] = useState(true);
  const [homeIconBtn, setHomeIconBtn] = useState(true);
  const [evnIconBtn, setEvnIconBtn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(
    selectedVariant?.variantPrice || 0,
  );
  const [isIntModeBtnClicked, setIsIntModeBtnClicked] = useState(false);
  const [isIntBtnDesktopClicked, setIsIntBtnDesktopClicked] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [hotspotTitle, setHotspotTitle] = useState('');
  const [isRearSeatClicked, setIsRearSeatClicked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummaryEditable, setIsSummaryEditable] = useState(false);
  const [selectedCardConfig, setSelectedCardConfig] = useState(null);
  const [isRedirectedToColor, setIsRedirectedToColor] = useState(false);
  const [isRedirectedToVariant, setIsRedirectedToVariant] = useState(false);
  const [checkInteraction, setCheckInteraction] = useState({
    ext: false,
    int: true,
    homebtn: false,
    picturebtn: false,
    helpbtn: false,
    hotspotbtn: false,
    changeVariant: false,
    colorbtn: false,
  });
  const [modelDesc, setModelDesc] = useState('');
  const [publishDomain, setPublishDomain] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [duplicateAccessory, setDuplicateAccessory] = useState(null); // State to store the duplicate accessory
  const [inQuickView, setInQuickView] = useState(false);
  const [envType, setEnvType] = useState('studio');
  const [accModelCd, setAccModelCd] = useState('');
  const [accFromYear, setAccFromYear] = useState('');
  const [accToYear, setAccToYear] = useState('');
  const [channel, setChannel] = useState('');
  const [activeAccessory, setActiveAccessory] = useState(null);
  const [previewState, setPreviewState] = useState([]);
  const [infoAccessory, setInfoAccessory] = useState(null);
  const [hasSelectedVariant, setHasSelectedVariant] = useState(false);
  const [variantPrices_onColorBasis, setVariantPrices_onColorBasis] = useState(null);
  const [variantListLength, setVariantListLength] = useState(false);
  const [inFullscreenMode, setInFullscreenMode] = useState(false);
  const [interiorLabel, setInteriorLabel] = useState(null);
  const [exteriorLabel, setExteriorLabel] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const forCode = urlParams?.get('forCode') || '08';

  const acceWarningMsgTitleLabel = acceWarningMsgTitleLabelEl?.textContent?.trim() || '';
  const acceWarningMsgSubTitleLabel = acceWarningMsgSubTitleLabelEl?.textContent?.trim() || '';
  const acceWarningProceedLabel = acceWarningProceedLabelEl?.textContent?.trim() || '';
  const warnCtaOneLabel = warnCtaOneLabelEl?.textContent?.trim() || '';
  const warnCtaTwolabel = warnCtaTwolabelEl?.textContent?.trim() || '';
  const jumpBacktoSummaryCTALabel = jumpBacktoSummaryCTALabelEl?.textContent?.trim() || '';

  const toggleSummaryEdit = () => {
    setIsSummaryEditable(!isSummaryEditable);
  };

  const [filters, setFilters] = useState({
    transmission: new Set(),
    fuel: new Set(),
    technology: new Set(),
  });

  const [toggleState, setToggleState] = useState({
    Lights: true,
    Orvms: true,
    Doors: true,
    Wheels: true,
    Sunroof: true,
    Window: true,
  });
  const [iscolorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [previousCategoriesData, setPreviousCategoriesData] = useState(null);
  const [newAccessoriesList, setNewAccessoriesList] = useState([]);
  const [missingAccessoriesList, setMissingAccessoriesList] = useState();
  const [showEditVariantPopup, setShowEditVariantPopup] = useState(false);
  const [accessoryType, setAccessoryType] = useState(null);
  const [previousSelectedVariant, setPreviousSelectedVariant] = useState(null);
  const [conflictingAccessories, setConflictingAccessories] = useState([]);
  const [confirmPopupContent, setConfirmPopupContent] = useState({
    heading: '',
    description: '',
    confirmationText: '',
    isSummaryFlow: false,
    confirmBtnText: '',
    revertBtnText: '',
  });
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef(null);

  // Function to reset the inactivity timer
  const resetTimer = () => {
    setIsInactive(false); // User is active
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear the previous timer
    }
    // Set a new timer for 10 seconds
    timerRef.current = setTimeout(() => {
      setIsInactive(true); // User is inactive
    }, 10000); // 10 seconds
  };
  const updateColors = (currentVariant) => {
    interaction.colorSelectorFunctions.createColorSelectors(
      currentVariant.colors,
      interactionLabel.testModel,
    ); // model for testing. Remove later
  };

  async function getPublishDomain() {
    const { publishDomain } = allPlaceholders;
    setPublishDomain(publishDomain);
  }

  useEffect(() => {
    getPublishDomain();
  }, []);

  const addtooltipToColorName = () => {
    const checkOverflow = () => {
      const colorNameElement = document.querySelector('.bottom-interaction-panel .wrapper__color-and-variant .color__selector .selected-color-name');

      if (colorNameElement) {
        if (colorNameElement.textContent.length > 30) {
          colorNameElement.classList.remove('tooltip-no-target');
        } else {
          colorNameElement.classList.add('tooltip-no-target');
        }
      }
    };

    checkOverflow();

    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  };

  const handleViewClick = (viewHandler, activeClass) => (e) => {
    if (activeClass === 'ext') {
      setIsIntBtnDesktopClicked(true);
      setIsIntModeBtnClicked(true);
    } else {
      setIsIntBtnDesktopClicked(false);
      setIsIntModeBtnClicked(false);
      if (utility.isCarConfigSmView()) {
        window.ONE3D?.fullscreenMode(true);
      }
    }
    document
      .querySelector(`.interaction__${activeClass}-btn`)
      ?.classList.remove('active');
    e.target.classList.add('active');
    setHomeIconBtn(true);
    setIsColorPickerVisible(false);

    if (!checkInteraction[activeClass]) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        [activeClass]: true,
      }));
    }

    viewHandler(e);
  };

  const handleExteriorViewClick = handleViewClick(
    interaction.createViewHandler(interaction.viewFunctions.exteriorView),
    'int',
  );

  const handleInteriorViewClick = handleViewClick(
    interaction.createViewHandler(interaction.viewFunctions.interiorView),
    'ext',
  );

  const renderHotspotIcon = () => (toggleHotspotBtn ? html`<${HotspotOnIcon} />` : html`<${HotspotOffIcon} />`);
  const renderHomeIcon = () => (homeIconBtn ? html`<${HomeIcon} />` : html`<${ActiveHomeIcon} />`);

  const renderEnvIcon = () => (evnIconBtn ? html`<${EnvironmentIcon} />` : html`<${ActiveEnvironmentIcon} />`);

  // help section close and reset
  const resetMenuSelection = () => {
    setHomeIconBtn(true);
    setIsColorPickerVisible(false);
    setIsChangeMode(false);

    if (!checkInteraction.helpbtn) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        helpbtn: true,
      }));
    }
    setShowHelpScreen(true);
    common.toggleClass('.help-configrator-overlay', 'hide');
    if (
      document
        .querySelector('.help-configrator-overlay')
        .classList.contains('hide')
    ) {
      setShowHelpScreen(false);
    } else {
      setShowHelpScreen(true);
    }
    const helpMenuItem = document.querySelectorAll('.help-item');
    helpMenuItem.forEach((menuItem, index) => {
      if (index !== 0) {
        menuItem.classList.remove('selected');
      } else {
        menuItem.classList.add('selected');
      }
    });
  };

  const disableTopandBottomContainer = () => {
    const headerContainer = document.querySelector('.config-header');
    const bottomContainerDesktop = document.querySelector(
      '.bottom-interaction-panel-container.desktop',
    );
    if (!utility.isCarConfigSmView()) {
      bottomContainerDesktop.classList.add('disabled');
      headerContainer.classList.add('disabled');
    } else {
      const bottomContainerMobile = document.querySelector(
        '.bottom-interaction-panel-container.mobile',
      );
      bottomContainerDesktop
        && bottomContainerDesktop.classList.add('disabled');
      bottomContainerMobile && bottomContainerMobile.classList.add('disabled');
      headerContainer.classList.add('disabled');
      document.querySelector('.mode-buttons')?.classList.add('disabled');
    }
  };

  const enableTopandBottomContainer = () => {
    const headerContainer = document.querySelector('.config-header');
    const bottomContainerDesktop = document.querySelector(
      '.bottom-interaction-panel-container.desktop',
    );
    if (!utility.isCarConfigSmView()) {
      bottomContainerDesktop.classList.remove('disabled');
      headerContainer.classList.remove('disabled');
    } else {
      const bottomContainerMobile = document.querySelector(
        '.bottom-interaction-panel-container.mobile',
      );
      bottomContainerDesktop
        && bottomContainerDesktop.classList.remove('disabled');
      bottomContainerMobile
        && bottomContainerMobile.classList.remove('disabled');
      headerContainer.classList.remove('disabled');
      document.querySelector('.mode-buttons')?.classList.remove('disabled');
    }
  };

  const handleAccessoriesChange = () => {
    setShowAccessoryDetails((prev) => !prev);
    const targetOffset = showAccessoryDetails ? 0 : 150;
    let currentOffset = showAccessoryDetails ? 150 : 0;

    const increment = targetOffset > currentOffset ? 1 : -1;
    const stepInterval = 2;
    const steps = Math.abs(targetOffset - currentOffset);

    const applyIncrementalOffset = () => new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentOffset !== targetOffset) {
          interaction.toggleFunctionsMap?.cameraOffset(currentOffset, 0);
          currentOffset += increment;
        } else {
          clearInterval(intervalId);
          interaction.toggleFunctionsMap?.cameraOffset(targetOffset, 0);
          resolve(); // Resolve the promise when the offset is complete
        }
      }, stepInterval);
    });
    // offset should not be applied when clicked on interior mode or when in mobile screen
    if (!utility.isCarConfigSmView() && !isIntBtnDesktopClicked) {
      disableTopandBottomContainer();

      applyIncrementalOffset().then(() => {
        enableTopandBottomContainer();
      });
    }
  };

  const handleVariantChange = () => {
    setHomeIconBtn(true);
    setIsColorPickerVisible(false);
    if (!checkInteraction.changeVariant) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        changeVariant: true,
      }));
    }
    setShowVariantDetails((prev) => !prev);
    const targetOffset = showVariantDetails ? 0 : 150;
    let currentOffset = showVariantDetails ? 150 : 0;

    const increment = targetOffset > currentOffset ? 1 : -1;
    const stepInterval = 2;
    const steps = Math.abs(targetOffset - currentOffset);

    const applyIncrementalOffset = () => new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (currentOffset !== targetOffset) {
          interaction.toggleFunctionsMap?.cameraOffset(currentOffset, 0);
          currentOffset += increment;
        } else {
          clearInterval(intervalId);
          interaction.toggleFunctionsMap?.cameraOffset(targetOffset, 0);
          resolve(); // Resolve the promise when the offset is complete
        }
      }, stepInterval);
    });
    // offset should not be applied when clicked on interior mode or when in mobile screen
    if (!utility.isCarConfigSmView() && !isIntBtnDesktopClicked) {
      disableTopandBottomContainer();

      applyIncrementalOffset().then(() => {
        enableTopandBottomContainer();
      });
    }
  };

  useEffect(async () => {
    const handleOffsetOnVariantChange = async () => {
      if (isIntBtnDesktopClicked && !utility.isCarConfigSmView()) {
        await interaction.toggleFunctionsMap?.cameraOffset(0, 0);
      } else if (!isIntBtnDesktopClicked && !utility.isCarConfigSmView()) {
        if (showVariantDetails || showAccessoryDetails) {
          disableTopandBottomContainer();
          await interaction.toggleFunctionsMap?.cameraOffset(150, 0);
          enableTopandBottomContainer();
        } else {
          disableTopandBottomContainer();
          await interaction.toggleFunctionsMap?.cameraOffset(0, 0);
          enableTopandBottomContainer();
        }
      }
    };
    if (window?.ONE3D !== undefined) {
      handleOffsetOnVariantChange();
    }
  }, [isIntBtnDesktopClicked]);

  const handleDisablestate = (e, interactionEvent) => {
    const bottomContainerDesktop = document.querySelector(
      '.bottom-interaction-panel-container.desktop',
    );
    const bottomContainerMobile = document.querySelector(
      '.bottom-interaction-panel-container.mobile',
    );
    bottomContainerDesktop.classList.add('disabled');
    bottomContainerMobile.classList.add('disabled');
    const currentSelectedBtn = e.currentTarget;
    currentSelectedBtn.disabled = true;
    interactionEvent()
      .then((data) => {
        currentSelectedBtn.disabled = false;
        bottomContainerDesktop.classList.remove('disabled');
        bottomContainerMobile.classList.remove('disabled');
      })
      .catch((error) => {
        console.error(error);
        currentSelectedBtn.disabled = false;
        bottomContainerDesktop.classList.remove('disabled');
        bottomContainerMobile.classList.remove('disabled');
      });
  };

  const renderMicroInteractions = (microinteractions) => {
    if (!microinteractions || microinteractions.length === 0) {
      return html`
        <button class="interaction__default-btn">
          <span>No interactions available</span>
        </button>
      `;
    }

    return microinteractions?.map((interactionItem, index) => {
      if (interactionItem?.interactionCategory !== 'Exterior') {
        return null;
      }

      setCheckInteraction((prevState) => {
        if (prevState.hasOwnProperty(interactionItem.interactionName)) {
          return prevState; // Return the current state without modification
        }
        return {
          ...prevState,
          [interactionItem.interactionName]: false,
        };
      });

      const interactionName = interactionItem?.interactionName || '';
      const iconUrl = interactionItem?.icon?._dmS7Url || '';
      const clickedIconUrl = interactionItem?.clickedIcon?._dmS7Url || iconUrl;
      const hoveredTextInactive = interactionItem?.hoveredTextActive || '';
      const hoveredTextActive = interactionItem?.hoveredTextInactive || '';
      const showIcon = iconUrl || clickedIconUrl;
      const currentState = toggleState?.[interactionName] ?? false;

      const titleText = currentState ? hoveredTextActive : hoveredTextInactive;
      const iconToShow = currentState ? iconUrl : clickedIconUrl;

      const buttonClass = `interaction__${interactionName.toLowerCase()}-btn`;

      return html`
        <button
          key=${index}
          class="${buttonClass} tooltip-target ${currentState ? '' : 'active'}"
          tooltip-target=${titleText}
          onClick=${(e) => {
    if (
      interactionName
              && interaction.toggleFunctionsMap[interactionName]
    ) {
      setHomeIconBtn(true);
      setIsColorPickerVisible(false);

      if (!checkInteraction[interactionName]) {
        setCheckInteraction((prevState) => ({
          ...prevState,
          [interactionName]: true,
        }));
      }
      const toggleFunction = interaction.toggleFunctionsMap[interactionName];
      const currentSelectedBtn = e.currentTarget;

      handleDisablestate(e, () => toggleFunction(!currentState));
      setToggleState((prevState) => {
        const newState = {
          ...prevState,
          [interactionName]: !currentState,
        };
        return newState;
      });
    }
  }}
        >
          ${showIcon
          && html`<img src="${iconToShow}" alt="${interactionName}" />`}
          ${!showIcon
    ? html`<span class="interaction__text">${titleText}</span>`
    : ''}
        </button>
      `;
    });
  };

  const resetInteractionStates = () => {
    setToggleState({
      Lights: true,
      Orvms: true,
      Doors: true,
      Wheels: true,
      Sunroof: true,
      Window: true,
    });
    setCheckInteraction({
      ext: true,
      int: false,
      homebtn: false,
      picturebtn: false,
      helpbtn: false,
      hotspotbtn: false,
      changeVariant: false,
      colorbtn: false,
    });
  };

  useEffect(async () => {
    if (window?.ONE3D?.forceResetMicroInteraction !== undefined) {
      await window?.ONE3D?.forceResetMicroInteraction();
    }
    resetInteractionStates();
  }, [activeTab, confirmedVariant]);

  const displayInteriorModeMicroInteractions = (microinteractions) => {
    const interiorInteractions = microinteractions.filter(
      (interactionItem) => interactionItem?.interactionCategory === 'Interior',
    );

    return html`
      <div>
        ${interiorInteractions?.map((interactionItem, index) => {
    if (
      !isRearSeatClicked
            && interactionItem.interactionName === 'Rearseat'
    ) {
      return html`
              <div
                class="switch-btn"
                onClick=${() => {
    setIsRearSeatClicked((prev) => !prev);
    interaction.viewFunctions.backseatView();
  }}
              >
                ${interactionItem.interactionLabel}
              </div>
            `;
    }

    if (
      isRearSeatClicked
            && interactionItem.interactionName === 'Rearseat'
    ) {
      return null;
    }

    if (
      isRearSeatClicked
            && interactionItem.interactionName !== 'Rearseat'
    ) {
      if (interactionItem.interactionName === 'Thirdrow') {
        return html`
                <div
                  class="switch-btn"
                  onClick=${() => {
    interaction.viewFunctions.lastseatView();
    setIsRearSeatClicked(false);
  }}
                >
                  ${interactionItem.interactionLabel}
                </div>
              `;
      }

      if (interactionItem.interactionName === 'Frontseat') {
        return html`
                <div
                  class="switch-btn"
                  onClick=${() => {
    interaction.viewFunctions.frontseatView();
    setIsRearSeatClicked(false);
  }}
                >
                  ${interactionItem.interactionLabel}
                </div>
              `;
      }
    }
  })}
      </div>
    `;
  };

  //   camera functionality
  const camera = [];
  const width = 1920;
  const height = 1080;
  const extension = 'png';
  const options = {
    quality: 0.7,
    transparent: true,
  };

  const cameraSettings = [
    {
      camera: [],
      width: 1920,
      height: 1080,
      extension: 'png',
      options: { transparent: true },
    },
    {
      camera: [],
      width: 1920,
      height: 1080,
      extension: 'jpeg',
      options: { quality: 0.8 },
    },
    {
      camera: ['interior_front', 'FEAT_WIRELESS_PORT'],
      width: 1920,
      height: 1080,
      extension: 'png',
      options: { transparent: true },
    },
  ];

  const selectedCameraSetting = cameraSettings[0];

  const handleCaptureScreenshotClick = interaction.createCaptureHandler(
    selectedCameraSetting.camera,
    selectedCameraSetting.width,
    selectedCameraSetting.height,
    selectedCameraSetting.extension,
    selectedCameraSetting.options,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const environmentCardContainer = document.querySelector('.environment-card-container');
      const buttonElement = document.querySelector('.interaction__picture-btn');

      if (
        environmentCardContainer
        && !environmentCardContainer.contains(event.target)
        && buttonElement
        && !buttonElement.contains(event.target)
      ) {
        document.querySelector('.environment-card-container').classList.add('hide');
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleChangeEnvironment = (e) => {
    e.stopPropagation();
    setHomeIconBtn(true);
    setIsColorPickerVisible(false);
    setEvnIconBtn(false);
    if (!checkInteraction.picturebtn) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        picturebtn: true,
      }));
    }
    const buttonElement = e.currentTarget;
    buttonElement.classList.add('interaction__active');
    buttonElement.classList.add('active');
    setTimeout(() => {
      if (buttonElement) {
        buttonElement.classList.remove('interaction__active');
        buttonElement.classList.remove('active');
      }
      setEvnIconBtn(true);
    }, 300);
    common.toggleClass('.environment-card-container', 'hide');
  };

  const popOverlay = document.querySelector('.rotate-overlay');
  const popOverlayContent = document.querySelector('.rotate-overlay-content');
  const blockRotateOverlay = () => {
    popOverlay.classList.remove('hide');
    popOverlay.classList.add('show');
    popOverlayContent.classList.remove('hide');
    document.querySelector('.car-configurator').classList.remove('mobile-view');
    window.ONE3D?.resize();
    ONE3D?.fullscreenMode(true);
    // window.ONE3D?.fitToCam();
  };

  const closeRotateOverlay = async () => {
    popOverlay.classList.remove('show');
    popOverlay.classList.add('hide');
    popOverlayContent.classList.remove('show');
    popOverlayContent.classList.add('hide');

    if (!(window.innerWidth > window.innerHeight) && inFullscreenMode) {
      if (isIntModeBtnClicked) {
        setIsIntModeBtnClicked(false);
        setInFullscreenMode(false);
        await interaction?.viewFunctions?.exteriorView();
      //   document.querySelector('.interaction__ext-btn')
      //   .classList.add('active');
      // document
      //   .querySelector('.interaction__int-btn')
      //   .classList.remove('active');
      }
      window.ONE3D?.resize();
      ONE3D?.fullscreenMode(false);
    } else {
      setTimeout(() => {
        window.ONE3D?.fitToCam();
      }, 100);
    }

    // window.ONE3D?.fitToCam();
  };

  const handleChangeEnvironment = async (e) => {
    // Remove 'active' class from all cards
    document
      .querySelectorAll('.environment-card-container .card')
      ?.forEach((card) => {
        card.classList.remove('active');
      });
    e.currentTarget.classList.add('active');
    common.toggleClass('.environment-card-container', 'hide');
    const envType = e.currentTarget.getAttribute('data-card');
    setEnvType(envType);
    setShowLoader(true);
    interaction
      .toggleActionWithDisable(window.ONE3D.ChangeEnv, envType)
      .then((result) => {
        setShowLoader(false);
        if (utility.isCarConfigSmView()) {
          document
            .querySelector('.car-configurator')
            .classList.remove('mobile-view');
        }
      })
      .catch((error) => {
        console.error('Failed to change environment:', error);
        setShowLoader(false);
      });
  };

  const handleHotspots = async (e) => {
    setHomeIconBtn(true);
    setIsColorPickerVisible(false);
    if (!checkInteraction.hotspotbtn) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        hotspotbtn: true,
      }));
    }

    const newToggleValue = !toggleHotspotBtn;
    setToggleHotspotBtn(newToggleValue);
    e.currentTarget.classList.toggle('active');
    setLoading(false);
    try {
      await interaction.showHotspot(newToggleValue);
    } catch (error) {
      console.error('Failed to show hotspots:', error);
    }
  };

  const closeOverlay = () => {
    setVideoUrl(null);
    setLoading(true);
  };

  const handleVideoCanPlay = () => {
    // setLoading(false);
    setTimeout(() => {
      videoRef.current.play();
    }, 500);
  };

  const clearFilters = () => {
    // Reset the selected state of all filters to false
    const resetFilters = {
      transmission: filters.transmission?.map((filter) => ({
        ...filter,
        selected: false,
      })),
      technology: filters.technology?.map((filter) => ({
        ...filter,
        selected: false,
      })),
      fuel: filters.fuel?.map((filter) => ({
        ...filter,
        selected: false,
      })),
    };
    setFilters(resetFilters); // Update the filter state
  };

  useEffect(() => {
    const app3dDiv = document.querySelector('.car-configurator');
    if (utility.isCarConfigSmView() && isChangeVariantMobile) {
      app3dDiv.classList.add('change-variant-mobile-view');
    } else if (utility.isCarConfigSmView() && !isChangeVariantMobile) {
      app3dDiv.classList.remove('change-variant-mobile-view');
    }
  }, [isChangeVariantMobile]);

  useEffect(async () => {
    if (utility.isCarConfigSmView()) {
      const app3dDiv = document.querySelector('.car-configurator');
      if (activeTab === 'customise') {
        app3dDiv.classList.add('accessories-mobile-view');
        app3dDiv.classList.remove('explore-mobile-view');
        app3dDiv.classList.remove('save-share-mobile-view');
      }

      if (activeTab === 'explore') {
        app3dDiv.classList.add('explore-mobile-view');
        app3dDiv.classList.remove('save-share-mobile-view');
        app3dDiv.classList.remove('accessories-mobile-view');
      }
      if (activeTab === 'saveshare') {
        app3dDiv.classList.add('save-share-mobile-view');
        app3dDiv.classList.remove('explore-mobile-view');
        app3dDiv.classList.remove('accessories-mobile-view');
      }
      await window?.ONE3D?.resize();
    }
    if (activeTab === 'saveshare') {
      document
        .querySelector('.bottom-interaction-panel')
        ?.classList.add('hide-container');
    } else {
      document
        .querySelector('.bottom-interaction-panel')
        ?.classList.remove('hide-container');
    }

    const selectedElementClass = selectedColor?.hexCode?.length === 2 ? 'dual-tone' : 'single-color';
    const selectedColorLabel = selectedColor?.eColorDesc;
    const colorBoxStyle = selectedColor?.hexCode?.length === 2
      ? `background: linear-gradient(135deg, ${selectedColor?.hexCode[0]} 50%, ${selectedColor?.hexCode[1]} 50%);`
      : `background-color: ${selectedColor?.hexCode[0]};`;
    interaction.colorSelectorFunctions.updateSelectedColorDisplay(
      selectedColorLabel,
      colorBoxStyle,
      selectedElementClass,
    );
    confirmedVariant && setSelectedVariant(confirmedVariant); // to handle revert variant in summary section
    if (utility.isCarConfigSmView() && activeTab === 'customise') {
      setIsChangeVariantMobile(false);
      setIsRedirectedToVariant(false);
    }

    // fetch current tab after login
    const isLoggedIn = await interaction.isUserLogin();
    if (isLoggedIn) {
      const modelData = interaction.getDataForConfigModel(selectedModel);
      /** *********restore color and accessories******************* */
      if (modelData !== undefined) {
        if (modelData?.addedAccessories?.length > 0) {
          setAddedAccessories(modelData?.addedAccessories);
        }

        if (modelData?.selectedColor !== undefined) {
          setSelectedColor(modelData?.selectedColor);
        }

        if (
          modelData?.selectedVariant != null
          || modelData?.selectedVariant != undefined
        ) {
          setSelectedVariant(modelData?.selectedVariant);
          setConfirmedVariant(modelData?.selectedVariant);
        }
        const selectedColorLabel = modelData?.selectedColor?.eColorDesc;
        const colorBoxStyle = modelData?.selectedColor?.hexCode?.length === 2
          ? `background: linear-gradient(135deg, ${modelData?.selectedColor?.hexCode[0]} 50%, ${modelData?.selectedColor?.hexCode[1]} 50%);`
          : `background-color: ${modelData?.selectedColor?.hexCode[0]};`;

        const selectedElementClass = modelData?.selectedColor?.hexCode?.length === 2
          ? 'dual-tone'
          : 'single-color';
        interaction.colorSelectorFunctions.updateSelectedColorDisplay(
          selectedColorLabel,
          colorBoxStyle,
          selectedElementClass,
        );
      }
      interaction.removeKeyFromModelConfig(selectedModel, 'selectedColor');
      interaction.removeKeyFromModelConfig(selectedModel, 'addedAccessories');
    }
  }, [activeTab]);
  function handleResize() {
    if (utility.isCarConfigSmView()) {
      document.querySelector('.car-configurator').classList.add('mobile-view');
      // block.classList.add('mobile-view');
      checkViewportHeight();
    } else {
      document
        .querySelector('.car-configurator')
        .classList.remove('mobile-view');
      // block.classList.remove('mobile-view');
    }
    const extLabel = common.trimTextForMobile(
      interactionLabel.exteriorBtnLabel,
      3,
    );
    const intLabel = common.trimTextForMobile(
      interactionLabel.interiorBtnLabel,
      3,
    );
    setExteriorLabel(extLabel);
    setInteriorLabel(intLabel);

    if (window.ONE3D?.resize) {
      window.ONE3D.resize();
    }
  }

  const checkViewportHeight = async () => {
    const mediaQuery = window.matchMedia(
      '(min-height: 220px) and (max-height: 539px)',
    );
    const rotateOverlay = document.querySelector('.rotate-overlay');
    if (mediaQuery.matches) {
      document
        .querySelector('.car-configurator')
        .classList.remove('mobile-view');
      document.querySelector('.config-header')?.classList.add('hide-header');
      document.querySelector('.mode-buttons')?.classList.add('shift-up');
      document.querySelector('.mode-btn-int')?.classList.add('hide');
      document.querySelector('.appOne3d')?.classList.add('change-height');
      window.ONE3D?.resize();
      rotateOverlay?.classList.remove('show')?.add('hide');
      const extLabel = common.trimTextForMobile(
        interactionLabel.exteriorBtnLabel,
        3,
      );
      const intLabel = common.trimTextForMobile(
        interactionLabel.interiorBtnLabel,
        3,
      );
      setExteriorLabel(extLabel);
      setInteriorLabel(intLabel);
      setTimeout(() => {
        if (
          !document
            .querySelector('.interaction__int-btn')
            .classList.contains('active')
        ) {
          window.ONE3D?.fitToCam();
        }
      }, 100);
    } else {
      document.querySelector('.appOne3d')?.classList.remove('change-height');
      document.querySelector('.mode-btn-int')?.classList.remove('hide');
      document.querySelector('.config-header')?.classList.remove('hide-header');
      document.querySelector('.mode-buttons')?.classList.remove('shift-up');
      setIsIntModeBtnClicked(false);
      setInFullscreenMode(false);
      window.ONE3D?.resize();
      // window.ONE3D?.fitToCam();
      await interaction?.viewFunctions?.exteriorView();
      document.querySelector('.interaction__ext-btn').classList.add('active');
      document
        .querySelector('.interaction__int-btn')
        .classList.remove('active');
      const extLabel = common.trimTextForMobile(
        interactionLabel.exteriorBtnLabel,
        3,
      );
      const intLabel = common.trimTextForMobile(
        interactionLabel.interiorBtnLabel,
        3,
      );
      setExteriorLabel(extLabel);
      setInteriorLabel(intLabel);
      if (window.ONE3D?.fullscreenMode) {
        window.ONE3D?.fullscreenMode(false);
      }
    }
  };

  useEffect(() => {
    const handleHotspotVideoUpdate = (event) => {
      setLoading(true);
      setVideoUrl(event.detail.videoUrl);
      setThumbnailUrl(event.detail.thumbnailUrl);
      setHotspotTitle(event.detail.hotspotTitle);
    };
    const handleUserActivity = () => resetTimer();

    window.addEventListener('hotspotVideoUpdated', handleHotspotVideoUpdate);
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Start the initial timer
    resetTimer();

    // Cleanup event listeners and timer on unmount

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener(
        'hotspotVideoUpdated',
        handleHotspotVideoUpdate,
      );
    };
  }, []);
  useEffect(() => {
    const areAllTrue = Object.values(checkInteraction).every(
      (value) => value === true,
    );
    if (areAllTrue) {
      containerRef.current.className = 'next-tab-btn active';
    }
  }, [isInactive]);

  useEffect(async () => {
    fetchVariantData();
    const isLoggedIn = await interaction.isUserLogin();
    if (isLoggedIn) {
      const modelData = interaction.getDataForConfigModel(selectedModel);
      if (modelData !== undefined) {
        setActiveTab(modelData?.activeTab);
      }
      interaction.removeKeyFromModelConfig(selectedModel, 'activeTab');
    }
  }, []);

  useEffect(() => {
    addtooltipToColorName();

    if (selectedModel !== 'VE') {
      if (!selectedColor || !selectedVariant?.variantCd) return;

      const price = variantPrices_onColorBasis[selectedVariant?.variantCd]?.price[
        forCode
      ]?.[selectedColor.colorType];
      if (!price) return;

      const updatedVariantData = [...variantData];
      const variantIndex = updatedVariantData.findIndex(
        (variant) => variant?.variantCd === selectedVariant?.variantCd,
      );
      if (variantIndex === -1) return;

      const variant = updatedVariantData[variantIndex];
      variant.variantPrice = price;

      setSelectedVariant(variant);
      // setConfirmedVariant(variant);
      setVariantData(updatedVariantData);
    }
  }, [selectedColor]);

  useEffect(() => {
    const basePrice = parseFloat(
      String(selectedVariant?.variantPrice || '0').replace(/,/g, ''),
    );

    const accessoriesTotal = addedAccessories.reduce((acc, accessory) => {
      const price = parseFloat(
        String(accessory.price || '0').replace(/,/g, ''),
      );
      return acc + price * (accessory.qty || 1);
    }, 0);

    const total = basePrice + accessoriesTotal;
    const formattedTotalPrice = formatIndianCurrency(total);
    setTotalPrice(formattedTotalPrice);
  }, [addedAccessories, confirmedVariant]);

  const formatIndianCurrency = (amount) => {
    const amountStr = amount.toString();
    if (amountStr.length <= 3) {
      return amountStr;
    }
    const lastThree = amountStr.slice(-3);
    const otherNumbers = amountStr.slice(0, amountStr.length - 3);
    const formatted = `${otherNumbers.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ',',
    )},${lastThree}`;
    return formatted;
  };

  const fetchVariantData = async () => {
    const variantsList = await apiUtils.getVariantFeaturesList(selectedModel);
    if (variantsList?.variants) {
      variantsList.variants = variantsList.variants.filter(
        (variant) => variant?.hideFromConfiguratorPage === null,
      );
    }
    setModelDesc(variantsList?.modelDesc);
    setAccModelCd(variantsList?.modelCodeAccessory);
    setAccFromYear(variantsList?.accessoryFromYear);
    setAccToYear(variantsList?.accessoryToYear);
    setChannel(variantsList?.channel);

    const variants = variantsList?.variants;
    variantsList?.variants?.length === 1
      ? setVariantListLength(true)
      : setVariantListLength(false);
    let defaultVariant = variants?.find((variant) => variant.variant3dCode === authoredVariant)
      || null;
    if (variants?.length) {
      let variantPrices;
      const variantCodes = variants?.map((variant) => variant?.variantCd);
      if (selectedModel !== 'VE') {
        variantPrices = await apiUtils.getVariantPrice(variantCodes);
        setVariantPrices_onColorBasis(variantPrices);
      }
      const updatedVariants = await Promise.all(
        variants?.map(async (currentVariant) => {
          const colorType = defaultVariant?.colors?.find(
            (color) => color?.eColorCd === authoredColor,
          )?.colorType || defaultVariant?.colors[0]?.colorType;
          let currVariantPrice = null;
          let defaultVariantPrice = null;
          if (selectedModel !== 'VE') {
            currVariantPrice = variantPrices[currentVariant?.variantCd]?.price[forCode][
              colorType
            ];
            defaultVariantPrice = variantPrices[defaultVariant?.variantCd]?.price[forCode][
              colorType
            ];
          }
          if (defaultVariant === null) {
            if (currentVariant?.default3dvariant) {
              defaultVariant = {
                ...currentVariant,
                variantPrice: currVariantPrice,
              };
            }
          } else {
            defaultVariant = {
              ...defaultVariant,
              variantPrice: defaultVariantPrice,
            };
          }
          return { ...currentVariant, variantPrice: currVariantPrice };
        }),
      );
      setVariantData(updatedVariants);

      setSelectedVariant(
        defaultVariant === null ? updatedVariants[0] : defaultVariant,
      );
      setTotalPrice(
        defaultVariant === null
          ? updatedVariants[0].variantPrice
          : defaultVariant?.variantPrice,
      );

      setConfirmedVariant(defaultVariant);
      const defaultColor = defaultVariant?.colors?.find(
        (color) => color?.eColorCd === authoredColor,
      ) || defaultVariant.colors[0];
      setSelectedColor(defaultColor);
      const selectedColorLabel = defaultColor?.eColorDesc;
      const colorBoxStyle = defaultColor?.hexCode?.length === 2
        ? `background: linear-gradient(135deg, ${defaultColor?.hexCode[0]} 50%, ${defaultColor?.hexCode[1]} 50%);`
        : `background-color: ${defaultColor?.hexCode[0]};`;

      const selectedElementClass = defaultColor?.hexCode?.length === 2 ? 'dual-tone' : 'single-color';
      interaction.colorSelectorFunctions.updateSelectedColorDisplay(
        selectedColorLabel,
        colorBoxStyle,
        selectedElementClass,
      );
    }
  };

  useEffect(async () => {
    if (selectedCardConfig) {
      if (selectedCardConfig?.variantCd) {
        const selectedVariant = variantData.find(
          (variant) => variant.variantCd === selectedCardConfig?.variantCd,
        );
        if (selectedVariant) {
          setSelectedVariant(selectedVariant);
          setConfirmedVariant(selectedVariant);
          await window.ONE3D.changeColor(
            selectedCardConfig?.color3dCode || selectedCardConfig?.colorCd,
          );
        } else {
          console.error('VariantCd not found in variantData');
        }
      }

      const accessoryData = await restoreAccessoryDataFromSummary(
        selectedCardConfig?.pinNo,
      );
      const parentCategories = categoriesData?.data?.parentCategories || [];
      updateAccessoriesData(parentCategories, accessoryData);
    }
  }, [selectedCardConfig]);

  const restoreAccessoryDataFromSummary = async (pinNo) => {
    const data = await configuratorApiUtils.getCarConfigSummary(pinNo || null);
    return data?.accessories;
  };

  const updateAccessoriesData = (parentCategories, inputArray) => {
    const addedAccessoryArr = [];
    parentCategories.forEach((parentCategory) => {
      parentCategory.subCategories.forEach((subCategory) => {
        subCategory.accessories.forEach((accessory) => {
          const match = inputArray.find(
            (item) => item.partNumber === accessory.partNum,
          );

          if (match) {
            accessory.price = match.unitPrice;
            accessory.qty = match.minQty;
            accessory.isSelected = true;
            addedAccessoryArr.push(accessory);
          }
        });
      });
    });
    setAddedAccessories(addedAccessoryArr);
  };

  const handleTabClick = (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    }
  };

  const changeVariant = (variantCode, variantDesc) => {
    // setShowLoader(true);
    disableTopandBottomContainer();
    window.ONE3D?.forceResetMicroInteraction();
    resetInteractionStates();
    window.ONE3D?.changeVariant(variantCode)
      .then(() => {
        enableTopandBottomContainer();
      })
      .catch((error) => {
        console.error('Error changing variant:', error);
      });
    // interaction.toggleActionWithDisable(
    //   window.ONE3D.changeVariant,
    //   variantCode,
    // ).then(()=>{
    //   setShowLoader(false);
    // })
    // .catch((error) => {
    //   console.error('Failed to change variant:', error);
    // });
  };

  useEffect(() => {
    async function fetchCategoriesData() {
      if (!selectedModel || !selectedVariant?.variantCd) {
        return;
      }

      setLoading(true);
      const data = await configuratorApiUtils.getCarConfigDetails(
        accModelCd,
        selectedVariant?.variantCodeAccessory,
        undefined,
        (err) => {
          setError(err);
          console.error('Error fetching categories data:', err);
        },
        accFromYear,
        accToYear,
      );
      const filteredData = filterData(data);
      if (filteredData?.data?.parentCategories?.length == 0) {
        setCategoriesData(stubbedResponse.gvAccessories);
      } else {
        setCategoriesData(filteredData);
      }
    }
    if (selectedModel !== 'VE') fetchCategoriesData();
  }, [confirmedVariant]);

  // setShowSummary is set to false when redirection happens
  useEffect(() => {
    if (utility.isCarConfigSmView()) {
      if (isRedirectedToVariant || isRedirectedToColor) {
        setShowSummary(false);
      }
    }
  }, [isRedirectedToVariant, isRedirectedToColor]);

  useEffect(() => {
    setPreviousCategoriesData(categoriesData);
  }, [showSummary]);

  function filterData(data) {
    if (data?.data?.parentCategories?.length) {
      data.data.parentCategories = data.data.parentCategories.filter(
        (parent) => {
          if (parent?.subCategories?.length) {
            parent.subCategories = parent.subCategories.filter(
              (subcategory) => {
                if (subcategory?.accessories?.length) {
                  subcategory.accessories = subcategory.accessories.filter(
                    (accessory) => accessory?.catg3DId !== null,
                  );
                  return subcategory.accessories.length > 0;
                }
                return false;
              },
            );
            return parent.subCategories.length > 0;
          }
          return false;
        },
      );
    }
    return data;
  }

  useEffect(() => {
    if (categoriesData && previousCategoriesData) {
      const mobileMode = utility.isCarConfigSmView()
        && categoriesData !== previousCategoriesData;
      const desktopMode = !utility.isCarConfigSmView()
        && categoriesData
        && previousCategoriesData;

      if (mobileMode || desktopMode) {
        function compareCategoryData(previousCategoryData, newCategoryData) {
          const newAccessories = [];
          const missingAccessories = [];

          const previousAccessories = flattenAccessories(previousCategoryData);
          const newAccessoriesSet = flattenAccessories(newCategoryData);

          // Accessories present in new data not in previous data
          newAccessoriesSet.forEach((newAcc) => {
            if (
              !previousAccessories.some(
                (prevAcc) => prevAcc.partNum === newAcc.partNum,
              )
            ) {
              newAccessories.push(newAcc);
            }
          });

          // Accessories present in previous data not in new data
          previousAccessories.forEach((prevAcc) => {
            if (
              !newAccessoriesSet.some(
                (newAcc) => newAcc.partNum === prevAcc.partNum,
              )
            ) {
              missingAccessories.push(prevAcc);
            }
          });
          return { newAccessories, missingAccessories };
        }

        function flattenAccessories(categoryData) {
          const accessories = [];
          categoryData.data.parentCategories.forEach((category) => {
            category.subCategories.forEach((subCategory) => {
              subCategory.accessories.forEach((acc) => {
                accessories.push(acc);
              });
            });
          });
          return accessories;
        }
        const result = compareCategoryData(
          previousCategoriesData,
          categoriesData,
        );
        setNewAccessoriesList(result.newAccessories);
        setMissingAccessoriesList(result.missingAccessories);
      }
    }
  }, [categoriesData, previousCategoriesData]);

  useEffect(() => {
    if (isRedirectedToVariant) {
      setShowEditVariantPopup(true);
      if (missingAccessoriesList.length > 0) {
        setAccessoryType('missingAcc');
      } else if (newAccessoriesList.length > 0) {
        setAccessoryType('newAcc');
      } else {
        setAccessoryType('newAcc');
      }
    }
  }, [newAccessoriesList, missingAccessoriesList]);

  function removeMissingAccessories(addedAccessories, missingAccessories) {
    const missingPartNums = missingAccessories?.map(
      (accessory) => accessory.partNum,
    );
    const filteredAccessories = addedAccessories.filter(
      (accessory) => !missingPartNums.includes(accessory.partNum),
    );
    setAddedAccessories(filteredAccessories);
  }

  const handleRedirecttoSummary = () => {
    setShowEditVariantPopup(false);
    setIsRedirectedToVariant(false);
    setShowSummary(true);
    missingAccessoriesList
      && removeMissingAccessories(addedAccessories, missingAccessoriesList);
  };
  const handleReverttoSummary = () => {
    setShowEditVariantPopup(false);
    handleTabClick('customise');
    setIsRedirectedToVariant(false);
    setShowSummary(true);
  };
  const handleRedirecttoAcc = () => {
    setShowEditVariantPopup(false);
    setIsRedirectedToVariant(false);
    setShowSummary(false);
    missingAccessoriesList
      && removeMissingAccessories(addedAccessories, missingAccessoriesList);
  };
  const handleAddAccessory = (accessory) => {
    setConflictingAccessories([]);
    setDuplicateAccessory(null);
    // Check if the accessory with the same partNum already exists in the list
    const existingAccessory = addedAccessories.find(
      (item) => item.partNum === accessory.partNum,
    );

    if (existingAccessory) {
      // If the same partNum exists, increment the count
      setAddedAccessories((prevState) => prevState?.map((item) => (item.partNum === accessory.partNum
        ? { ...item, qty: (item.qty || 1) + 1 }
        : item)));
      return; // Exit as no conflict handling is required
    }

    // Find conflicts for accessories with different partNum but same catg3DId or overlapping category
    const conflicts = addedAccessories.filter(
      (item) => item.catg3DId === accessory.catg3DId
        || accessory.ccOverlappingCodes?.some((id) => item.catg3DId === id),
    );

    if (conflicts.length > 0) {
      setDuplicateAccessory(accessory);
      setConflictingAccessories(conflicts); // Set all conflicting accessories
      setConfirmPopupContent({
        heading: acceWarningMsgTitleLabel,
        description: acceWarningMsgSubTitleLabel,
        confirmationText: acceWarningProceedLabel,
        revertBtnText: warnCtaTwolabel,
        confirmBtnText: warnCtaOneLabel,
      });
      setShowPopup(true);
      if (showInfoPopup === true) {
        setShowInfoPopup(false);
      }
    } else {
      // No conflicts, add the accessory with count set to 1
      setAddedAccessories((prevState) => [
        ...prevState,
        { ...accessory, qty: 1 },
      ]);
      Promise.resolve()
        .then(() => {
          disableTopandBottomContainer();
        })
        .then(() => window.ONE3D.addAccessory(accessory.partNum))
        .then(() => {
          enableTopandBottomContainer();
        });
    }
  };

  const handleRemoveAccessory = (accessory) => {
    // If count reaches 0 remove the accessory from ONE3D
    const updatedAccessory = addedAccessories.find(
      (item) => item.partNum === accessory.partNum,
    );

    if (updatedAccessory && updatedAccessory.qty === 1) {
      Promise.resolve()
        .then(() => {
          disableTopandBottomContainer();
        })
        .then(() => window.ONE3D.removeAccessory(accessory.partNum))
        .then(() => {
          enableTopandBottomContainer();
        });
    }
    // If count is more than 1 decrement the count else remove the accessory
    setAddedAccessories(
      (prevState) => prevState
        ?.map((item) => (item.partNum === accessory.partNum
          ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 0 }
          : item))
        .filter((item) => item.qty > 0), // Filter out items with count 0
    );
  };

  const isAccessoryAdded = (accessory) => {
    const existingAccessory = addedAccessories.find(
      (item) => item.partNum === accessory?.partNum,
    );
    return existingAccessory ? existingAccessory.qty > 0 : false;
  };

  const isAccessoryInPreview = (accessory) => previewState.some((item) => item.partNum === accessory?.partNum);

  const handleAccessoryClick = (accessory) => {
    // Check if the accessory is already in the previewState
    const isPreviewed = previewState.some(
      (item) => item.partNum === accessory.partNum,
    );

    if (isPreviewed) {
      // If the accessory is already previewed, remove it from previewState
      setPreviewState((prevState) => prevState.filter((item) => item.partNum !== accessory.partNum));
    } else {
      // Check for conflicts in previewState before adding the new accessory
      const conflicts = previewState.filter(
        (item) => item.catg3DId === accessory.catg3DId
          || accessory.ccOverlappingCodes?.some((id) => item.catg3DId === id),
      );
      if (conflicts.length > 0) {
        // Remove the conflicting accessories from previewState
        setPreviewState((prevState) => prevState.filter((item) => item.partNum !== conflicts[0].partNum));
      }
      // Add the new accessory to previewState
      setPreviewState((prevState) => [...prevState, accessory]);
    }

    if (accessory.ccPart3dId === null) {
      setInfoAccessory(accessory);
      setShowInfoPopup(true);
      return;
    }

    const handleAccessoryRemoval = () => window.ONE3D.setAccessorieCamera(accessory.partNum)
      .then(() => window.ONE3D.removeAccessory(accessory.partNum))
      .then(() => setActiveAccessory(null));

    const handleAccessoryAddition = () => window.ONE3D.setAccessorieCamera(accessory.partNum).then(() => window.ONE3D.addAccessory(accessory.partNum));

    if (activeAccessory === accessory.partNum) {
      interaction.handleAccessoryWithDisable(handleAccessoryRemoval);
    } else {
      setActiveAccessory(accessory.partNum);
      interaction.handleAccessoryWithDisable(handleAccessoryAddition);
    }
  };

  const handleConfirmAdd = () => {
    if (duplicateAccessory) {
      // Remove conflicting accessories, ignoring the duplicateAccessory's own catg3DId
      setAddedAccessories((prevState) => prevState.filter((item) => {
        const isConflict = item.catg3DId === duplicateAccessory.catg3DId
            || (Array.isArray(duplicateAccessory.ccOverlappingCodes)
              && duplicateAccessory.ccOverlappingCodes.some(
                (overlapId) => overlapId === item.catg3DId,
              ));
        if (isConflict) {
          Promise.resolve()
            .then(() => {
              disableTopandBottomContainer();
            })
            .then(() => window.ONE3D.removeAccessory(item.partNum))
            .then(() => {
              enableTopandBottomContainer();
            });
        }
        return !isConflict;
      }));

      // Check if the duplicateAccessory is already in the list
      setAddedAccessories((prevState) => {
        const existingAccessory = prevState.find(
          (item) => item.partNum === duplicateAccessory.partNum,
        );

        if (existingAccessory) {
          // If accessory already exists, increment its count
          return prevState?.map((item) => (item.partNum === duplicateAccessory.partNum
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item));
        }
        // If not add with a count of 1
        Promise.resolve()
          .then(() => {
            disableTopandBottomContainer();
          })
          .then(() => window.ONE3D?.addAccessory(duplicateAccessory.partNum))
          .then(() => {
            enableTopandBottomContainer();
          });
        return [...prevState, { ...duplicateAccessory, qty: 1 }];
      });
    }
    setShowPopup(false);
    confirmPopupContent?.isSummaryFlow && setShowSummary(true);
  };

  const handleCancelAdd = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const delayExecution = setTimeout(() => {
      addedAccessories?.forEach((accessory) => {
        const isConflictingInPreview = previewState.some(
          (item) => item.catg3DId === accessory.catg3DId
            || accessory.ccOverlappingCodes?.some((id) => item.catg3DId === id),
        );
        if (!isConflictingInPreview && window.ONE3D?.addAccessory) {
          window.ONE3D?.addAccessory(accessory.partNum);
        }
      });
    }, 500);
    return () => {
      clearTimeout(delayExecution); // Clean up timeout on dependency change or unmount
    };
  }, [previewState, addedAccessories]);

  useEffect(() => {
    if (!utility.isMobileDevice()) {
      setTimeout(() => {
        common.createTooltip();
      }, 5000);
    }
  }, []);

  const getFuelTypeFromPlaceHolder = (fuel) => {
    if (fuel) {
      const fuelType = fuel?.toLowerCase()?.replace('-', '');
      return allPlaceholders[fuelType] || fuel;
    }
    return '';
  };

  useEffect(async () => {
    if (inFullscreenMode) {
      document.querySelector('.config-header').classList.add('hide-header');
      document.querySelector('.mode-buttons').classList.add('shift-up');
    } else {
      document.querySelector('.config-header').classList.remove('hide-header');
      document.querySelector('.mode-buttons').classList.remove('shift-up');
      setIsIntModeBtnClicked(false);
      await interaction?.viewFunctions?.exteriorView();
      document.querySelector('.interaction__ext-btn')
        .classList.add('active');
      document
        .querySelector('.interaction__int-btn')
        .classList.remove('active');
    }
  }, [inFullscreenMode]);

  const handleFullscreenClick = () => {
    if (!inFullscreenMode) {
      blockRotateOverlay();
      setInFullscreenMode(!inFullscreenMode);
      window.ONE3D?.resize();
      ONE3D.fullscreenMode(!inFullscreenMode);
      // window.ONE3D?.fitToCam();
    } else if (!(window.innerWidth > window.innerHeight)) {
      document.querySelector('.car-configurator').classList.add('mobile-view');
      setInFullscreenMode(false);
      window.ONE3D?.resize();
      ONE3D.fullscreenMode(false);
      // window.ONE3D?.fitToCam();
    } else {
      blockRotateOverlay();
    }
  };

  return html`
    <div class="bottom-interaction-panel-container desktop hide-interection">
      <div class="bottom-interaction-panel">
        <div class="wrapper__interactions">
          <div class="interaction-container">
            <div class="interaction-tab view-controller">
              <button
                class="interaction__ext-btn active"
                onClick=${handleExteriorViewClick}
              >
                ${exteriorLabel}
              </button>
              <button
                class="interaction__int-btn"
                onClick=${handleInteriorViewClick}
              >
                ${interiorLabel}
              </button>
            </div>
            <div class="interaction-tab car-reset">
              <button
                class="interaction__home-btn tooltip-target"
                tooltip-target="Home view"
                onClick=${(e) => {
    window.ONE3D?.forceResetMicroInteraction();
    resetInteractionStates();
    const newToggleValue = !homeIconBtn;
    setHomeIconBtn(false);
    setIsColorPickerVisible(false);
    const buttonElement = e.currentTarget;
    buttonElement.classList.add('interaction__active');
    buttonElement.classList.add('active');
    // e.currentTarget.classList.toggle("interaction__active");
    // e.currentTarget.classList.toggle("active");

    setTimeout(() => {
      if (buttonElement) {
        buttonElement.classList.remove('interaction__active');
        buttonElement.classList.remove('active');
      }
      setHomeIconBtn(true);
    }, 300);

    if (!checkInteraction.homebtn) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        homebtn: true,
      }));
    }
    if (activeTab === 'customise') {
      Promise.resolve()
        .then(() => {
          disableTopandBottomContainer();
        })
        .then(() => {
          setAddedAccessories([]);
          setPreviewState([]);
          setConflictingAccessories([]);
          setShowAccessoryDetails(false);
          return window.ONE3D?.removeAllAccessories();
        })
        .then(() => {
          enableTopandBottomContainer();
        });
    }
  }}
              >
                <span> ${renderHomeIcon()} </span>
              </button>
              ${activeTab !== 'customise'
              && html`
                <div class="home vertical-separator"></div>
                <button
                  class="interaction__picture-btn tooltip-target"
                  tooltip-target="Change environment"
                  onClick=${toggleChangeEnvironment}
                >
                  <span> ${renderEnvIcon()} </span>
                </button>
              `}
              ${activeTab !== 'customise'
              && html`<div class="snap vertical-separator"></div>
                <div class="environment-card-container hide">
                  <div
                    class="card ${envType === 'day' ? 'active' : ''}"
                    data-card="day"
                    onClick=${(e) => (envType === 'day'
    ? common.toggleClass(
      '.environment-card-container',
      'hide',
    )
    : handleChangeEnvironment(e))}
                  >
                    <img
                      src="${dayImage}"
                      alt="${dayImageAltText}"
                    />
                    <span class="card-label">${dayImageAltText}</span>
                  </div>
                  <div
                    class="card ${envType === 'night' ? 'active' : ''}"
                    data-card="night"
                    onClick=${(e) => (envType === 'night'
    ? common.toggleClass(
      '.environment-card-container',
      'hide',
    )
    : handleChangeEnvironment(e))}
                  >
                    <img
                      src="${nightImage}"
                      alt="${nightImageAltText}"
                    />
                    <span class="card-label">${nightImageAltText}</span>
                  </div>
                  <div
                    class="card ${envType === 'studio' ? 'active' : ''}"
                    data-card="studio"
                    onClick=${(e) => (envType === 'studio'
    ? common.toggleClass(
      '.environment-card-container',
      'hide',
    )
    : handleChangeEnvironment(e))}
                  >
                    <img
                      src="${studioImage}"
                      alt="${studioImageAltText}"
                    />
                    <span class="card-label">${studioImageAltText}</span>
                  </div>
                </div>`}
            </div>
            ${utility.isMobileDevice()
    ? html`<div class="m-separator vertical-separator"></div>`
    : html``}
            ${activeTab !== 'customise'
            && html`<div class="interaction-tab toggle-interactions">
                ${selectedVariant?.microinteractions
    ? renderMicroInteractions(selectedVariant.microinteractions)
    : html`
                      <button class="interaction__default-btn">
                        <span>No microinteractions available</span>
                      </button>
                    `}
                <div class="toggle-interaction vertical-separator"></div>
              </div>

              <div class="interaction-tab help-interactions">
                <button
                  class="interaction__help-btn tooltip-target"
                  tooltip-target="Help: How to Use Configurator"
                  type="button"
                  onClick=${resetMenuSelection}
                >
                  <span> <${HelpIcon} /> </span>
                </button>
              </div>
              ${!utility.isCarConfigSmView()
              && html`
                <div class="interaction-tab hotspot-interactions">
                  <button
                    class="interaction__hotspot-btn tooltip-target"
                    tooltip-target="Hotspot ON/OFF"
                    type="button"
                    onClick=${handleHotspots}
                  >
                    <span> ${renderHotspotIcon()} </span>
                  </button>
                </div>
              `} `}
          </div>
        </div>

        <div class="wrapper__color-and-variant">
          <div class="color__selector">
            ${activeTab === 'customise'
    ? html` <div class="variant-info-customise">
                  <div class="variant-info-details">
                    <div class="variant-model-customise">${modelDesc}</div>
                    <div
                      class="selected-color-box"
                      style=${`background-color: ${selectedColor.hexCode}`}
                    ></div>
                  </div>
                  <div class="variant-name-customise">
                    ${selectedVariant?.variantName}
                  </div>
                </div>`
    : html`
                  <span class="selected-color-name tooltip-target" tooltip-target='${selectedColor?.eColorDesc}'></span>
                  <span class="selected-color-box"></span>
                  <div
                    class="arrow-icon"
                    onClick=${() => {
    setIsColorPickerVisible((prev) => !prev);
    setHomeIconBtn(true);
    // document
    //   .querySelector(".interaction__home-btn")
    //   .classList.remove("active", "interaction__active");
    if (!checkInteraction.colorbtn) {
      setCheckInteraction((prevState) => ({
        ...prevState,
        colorbtn: true,
      }));
    }
  }}
                  >
                    <${UpDarkArrowIcon} />
                  </div>
                  ${iscolorPickerVisible
                  && html`<${ColorPicker}
                    colors=${selectedVariant?.colors}
                    model=${interactionLabel.testModel}
                    iscolorPickerVisible="${iscolorPickerVisible},"
                    setIsColorPickerVisible=${setIsColorPickerVisible}
                    selectedColor=${selectedColor}
                    setSelectedColor=${setSelectedColor}
                  />`}
                `}
          </div>
          <div class="variant__selector-container">
            ${activeTab !== 'customise'
            && html`
              <div class="variant-info">
                <p class="variant-name"
                 style=${selectedModel !== 'VE' ? null: 'padding-top:13px;padding-bottom:7px;'}>
                 ${modelDesc}
                 </p>
                <p class="variant-model truncate-section"
                 style=${selectedModel !== 'VE' ? null: 'display:none'}>
                  <span
                    class=" variant-truncate ${selectedVariant?.variantName
    .length > 12
    ? 'tooltip-target'
    : ''}"
                    tooltip-target="${selectedVariant?.variantName}"
                    >${selectedVariant?.variantName}</span
                  >
                  ${selectedVariant?.variantTechnology}
                </p>
              </div>
            `}
            <div class="variant-details">
              ${activeTab !== 'customise' && selectedModel !== 'VE'
              && html` <button
                class="variant__expand-icon"
                onClick=${handleVariantChange}
              >
                <${UpArrowIcon} />
              </button>`}
              ${activeTab === 'customise'
              && html` <button
                class="accessories__expand-icon"
                onClick=${handleAccessoriesChange}
              >
                <${UpArrowIcon} />
              </button>`}
              <p class="variant-price">
                ${selectedVariant?.variantPrice
    ? `${`${interactionLabel.rsLabel} ${
      interaction.formatDisplayPrice(
        selectedVariant?.variantPrice,
      ) || ''
    }`}`
    : ''}
              </p>
            </div>
            ${showVariantDetails
            && !isChangeMode
            && activeTab !== 'customise'
            && html`
              <${CarVariantDetails}
                selectedVariant=${selectedVariant}
                interactionLabel=${interactionLabel}
                variantDetailsLabels=${variantDetailsLabels}
                isChangeMode=${isChangeMode}
                setIsChangeMode=${setIsChangeMode}
                handleVariantChange=${handleVariantChange}
                variantListLength=${variantListLength}
                getFuelTypeFromPlaceHolder=${getFuelTypeFromPlaceHolder}
              />
            `}
            ${showAccessoryDetails
            && activeTab === 'customise'
            && html`
              <${AccessoriesDetails}
                handleAccessoriesChange=${handleAccessoriesChange}
                selectedVariant=${selectedVariant}
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
                selectedModel=${selectedModel}
                categoriesData=${categoriesData}
                addedAccessories=${addedAccessories}
                setAddedAccessories=${setAddedAccessories}
                selectedColor=${selectedColor}
                showSummary=${showSummary}
                setShowSummary=${setShowSummary}
                isSummaryEditable=${isSummaryEditable}
                isRedirectedToColor=${isRedirectedToColor}
                setIsRedirectedToColor=${setIsRedirectedToColor}
                isRedirectedToVariant=${isRedirectedToVariant}
                setIsRedirectedToVariant=${setIsRedirectedToVariant}
                showEditVariantPopup=${showEditVariantPopup}
                newAccessoriesList=${newAccessoriesList}
                missingAccessoriesList=${missingAccessoriesList}
                accessoryType=${accessoryType}
                setAccessoryType=${setAccessoryType}
                handleRedirecttoSummary=${handleRedirecttoSummary}
                handleRedirecttoAcc=${handleRedirecttoAcc}
                totalPrice=${totalPrice}
                setTotalPrice=${setTotalPrice}
                setActiveTab=${setActiveTab}
                setIsChangeMode=${setIsChangeMode}
                publishDomain=${publishDomain}
                isAccessoryAdded=${isAccessoryAdded}
                handleConfirmAdd=${handleConfirmAdd}
                handleCancelAdd=${handleCancelAdd}
                setShowPopup=${setShowPopup}
                showPopup=${showPopup}
                duplicateAccessory=${duplicateAccessory}
                setDuplicateAccessory=${setDuplicateAccessory}
                setPreviousSelectedVariant=${setPreviousSelectedVariant}
                handleAddAccessory=${handleAddAccessory}
                handleRemoveAccessory=${handleRemoveAccessory}
                conflictingAccessories=${conflictingAccessories}
                setConflictingAccessories=${setConflictingAccessories}
                confirmPopupContent=${confirmPopupContent}
                setConfirmPopupContent=${setConfirmPopupContent}
                showInfoPopup=${showInfoPopup}
                setShowInfoPopup=${setShowInfoPopup}
                handleTabClick=${handleTabClick}
                setIsChangeVariantMobile=${setIsChangeVariantMobile}
                quickViewLabelEl=${quickViewLabelEl}
                setInQuickView=${setInQuickView}
                inQuickView=${inQuickView}
                connectToDealerLink=${connectToDealerLink}
                connectToDealerLabel=${connectToDealerLabel}
                handleAccessoryClick=${handleAccessoryClick}
                previewState=${previewState}
                isAccessoryInPreview=${isAccessoryInPreview}
                infoAccessory=${infoAccessory}
                setInfoAccessory=${setInfoAccessory}
                noAccessoryMessageEl=${noAccessoryMessageEl}
                noAccessoryProceedLabelEl=${noAccessoryProceedLabelEl}
                noAccessoryCtaOneLabelEl=${noAccessoryCtaOneLabelEl}
                noAccessoryCtaTwoLabelEl=${noAccessoryCtaTwoLabelEl}
                grandTotalLabelEl=${grandTotalLabelEl}
                modelLabelEl=${modelLabelEl}
                variantLabelEl=${variantLabelEl}
                colorLabelEl=${colorLabelEl}
                basicSelectionLabelEl=${basicSelectionLabelEl}
                checkoutCtaLabelEl=${checkoutCtaLabelEl}
                formatIndianCurrency=${formatIndianCurrency}
              />
            `}
            ${isChangeMode
            && activeTab !== 'customise'
            && html`
              <${ChangeVariantDetails}
                variantData=${variantData}
                selectedVariant=${selectedVariant}
                setSelectedVariant=${setSelectedVariant}
                interactionLabel=${interactionLabel}
                variantDetailsLabels=${variantDetailsLabels}
                filters=${filters}
                setFilters=${setFilters}
                isChangeMode=${isChangeMode}
                setIsChangeMode=${setIsChangeMode}
                handleVariantChange=${handleVariantChange}
                setShowSelectedBtn=${setShowSelectedBtn}
                showSelectedBtn=${showSelectedBtn}
                changeVariant=${changeVariant}
                showVideoCompair=${showVideoCompair}
                setShowVideoCompair=${setShowVideoCompair}
                compareVariantData=${compareVariantData}
                setCompareVariantData=${setCompareVariantData}
                setIfCompareVideo=${setIfCompareVideo}
                setShowEditVariantPopup=${setShowEditVariantPopup}
                confirmedVariant=${confirmedVariant}
                setConfirmedVariant=${setConfirmedVariant}
                hasSelectedVariant=${hasSelectedVariant}
                setHasSelectedVariant=${setHasSelectedVariant}
                getFuelTypeFromPlaceHolder=${getFuelTypeFromPlaceHolder}
              />
            `}
          </div>
        </div>
      </div>
      ${activeTab === 'saveshare'
      && html`
        <div class="configuration-desktop-container">
          <${SaveConfiguration}
            activeTab=${activeTab}
            setActiveTab=${setActiveTab}
            interactionLabel=${interactionLabel}
            selectedModel=${selectedModel}
            selectedCardConfig=${selectedCardConfig}
            setSelectedCardConfig=${setSelectedCardConfig}
            addedAccessories=${addedAccessories}
            selectedColor=${selectedColor}
            selectedVariant=${selectedVariant}
            categoriesData=${categoriesData}
            addedAccessories=${addedAccessories}
            modelDesc=${modelDesc}
            totalPrice=${totalPrice}
            connectToDealerLink=${connectToDealerLink}
            connectToDealerLabel=${connectToDealerLabel}
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
            eBookingLabel=${eBookingLabel}
            eBookingLink=${eBookingLink}
            accModelCd=${accModelCd}
            accFromYear=${accFromYear}
            accToYear=${accToYear}
            forCode=${forCode}
            channel=${channel}
          />
        </div>
      `}
      ${activeTab === 'explore'
      && !utility.isCarConfigSmView()
      && selectedModel !== 'VE'
      && html`<div
        ref=${containerRef}
        class="next-tab-btn"
        onClick=${(e) => {
    configuratorDataLayerUtils.pushClickToDataLayer(
      e,
      e.currentTarget?.textContent,
    );
    handleTabClick('customise');
  }}
      >
        <span>${nudgeText}</span>
        <${nextTabIcon} />
      </div>`}
      ${!utility.isCarConfigSmView()
      && activeTab === 'customise'
      && addedAccessories.length > 0
      && html`<div
        class="next-tab-btn summary"
        onClick=${() => {
    setShowSummary(true);
  }}
      >
        <span>${jumpBacktoSummaryCTALabel}</span>
        <${nextTabIcon} />
      </div>`}
    </div>

    ${isIntModeBtnClicked
    && html`<div class="interior-mode-container">
      ${selectedVariant?.microinteractions
    ? displayInteriorModeMicroInteractions(
      selectedVariant.microinteractions,
    )
    : html``}
    </div> `}
    ${activeTab === 'saveshare'
    && utility.isCarConfigSmView()
    && html`
      <div class="bottom-interaction-panel-container mobile">
        <div class="configuration-mobile-container">
          <${SaveConfiguration}
            activeTab=${activeTab}
            interactionLabel=${interactionLabel}
            selectedModel=${selectedModel}
            selectedCardConfig=${selectedCardConfig}
            setSelectedCardConfig=${setSelectedCardConfig}
            addedAccessories=${addedAccessories}
            selectedColor=${selectedColor}
            selectedVariant=${selectedVariant}
            setActiveTab=${setActiveTab}
            categoriesData=${categoriesData}
            addedAccessories=${addedAccessories}
            modelDesc=${modelDesc}
            totalPrice=${totalPrice}
            connectToDealerLink=${connectToDealerLink}
            connectToDealerLabel=${connectToDealerLabel}
            eBookingLabel=${eBookingLabel}
            eBookingLink=${eBookingLink}
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
            eBookingLabel=${eBookingLabel}
            eBookingLink=${eBookingLink}
            accModelCd=${accModelCd}
            accFromYear=${accFromYear}
            accToYear=${accToYear}
            forCode=${forCode}
            channel=${channel}
          />
        </div>
      </div>
    `}

    <div class="mode-buttons hide-onload">
      ${showSummary
    ? html` ${utility.isCarConfigSmView()
          && html`
            <div class="share-summary-btn hidden">
              <${ShareSummaryMobileIcon} />
            </div>
            <div class="download-summary-btn hidden">
              <${DownloadSummaryMobileIcon} />
            </div>
            <div class="edit-summary-btn" onClick=${toggleSummaryEdit}>
              <${EditSummaryMobileIcon} />
            </div>
          `}`
    : html`
            ${utility.isCarConfigSmView()
            && !isIntModeBtnClicked
            && !inFullscreenMode
    ? html`<div
                  class="mode-btn mode-btn-int"
                  onClick=${(e) => {
    handleInteriorViewClick(e);
    document
      .querySelector('.interaction__ext-btn')
      .classList.remove('active');
    document
      .querySelector('.interaction__int-btn')
      .classList.add('active');
    document
      .querySelector('.car-configurator')
      .classList.remove('mobile-view');
    setIsIntModeBtnClicked(true);
    setInFullscreenMode(true);
  }}
                >
                  <${InteriorModeBtn} />
                </div>`
    : html`${!inFullscreenMode
                && html`<div
                  class="mode-btn selected"
                  onClick=${(e) => {
    handleExteriorViewClick(e);
    document
      .querySelector('.interaction__ext-btn')
      .classList.add('active');
    document
      .querySelector('.interaction__int-btn')
      .classList.remove('active');
    setIsIntModeBtnClicked(false);
    document
      .querySelector('.car-configurator')
      .classList.add('mobile-view');
  }}
                >
                  <${InteriorModeBtnClicked} />
                </div>`} `}

            <div class="mode-btn" onClick=${handleFullscreenClick}>
              ${inFullscreenMode
    ? html`<${fullScreenBtnOpen} />`
    : html` <${fullScreenBtn} />`}
            </div>
          `}
    </div>

    ${activeTab === 'explore'
    && html`<div class="bottom-interaction-panel-container mobile">
      <div class="top-block">
        <div class="variant-info">
          <div class="variant-info-left">
            <p class="variant-name">${modelDesc}</p>
            <p class="variant-model">${selectedVariant?.variantName}</p>
          </div>
          ${selectedModel !== 'VE' && html`<div
            class="change-variant-btn"
            onClick=${() => setIsChangeVariantMobile(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15.0386 11.9996L9.38456 17.6533L8.33081 16.5996L12.9308 11.9996L8.33081 7.39957L9.38456 6.34582L15.0386 11.9996Z"
                fill="#767879"
              />
            </svg>
          </div>`}
          
        </div>
        <div class="variant-color-price">
          ${selectedVariant?.variantPrice
    ? html`<p class="variant-price">
                ${`${interactionLabel.rsLabel} ${
    interaction.formatDisplayPrice(
      selectedVariant?.variantPrice,
    ) || ''
  }`}
              </p>`
    : ''}

          <div class="variant-color">
            <span class="selected-color-name">Nexa Blue</span>
            <span class="selected-color-box"></span>
          </div>
        </div>
        <div class="color__pickers">
          ${selectedVariant?.colors?.length > 0
          && html`<${ColorPicker}
            colors=${selectedVariant?.colors}
            model=${interactionLabel.testModel}
            iscolorPickerVisible=${iscolorPickerVisible}
            setIsColorPickerVisible=${setIsColorPickerVisible}
            selectedColor=${selectedColor}
            setSelectedColor=${setSelectedColor}
            isMobile=${true}
          />`}
        </div>
      </div>
      <div class="ctrl-block">
        <button
          class="btn btn-secondary highlight"
          type="button"
          onClick=${() => setHighlightsView(true)}
        >
          View Highlights
        </button>
        ${selectedModel !== 'VE'
        && html` <button
          class="btn btn-primary customize"
          type="button"
          onClick=${() => {
    window?.ONE3D?.forceResetMicroInteraction();
    window?.ONE3D?.showAddedAccessories();
    handleTabClick('customise');
  }}
        >
          Customize
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
          >
            <path
              d="M11.5847 8.5H3.5V7.5H11.5847L7.78717 3.7025L8.5 3L13.5 8L8.5 13L7.78717 12.2975L11.5847 8.5Z"
              fill="white"
            />
          </svg>
        </button>`}
      </div>
    </div> `}
    ${activeTab === 'customise'
    && html`<div class="bottom-interaction-panel-container mobile">
      <div class="top-block">
        <${AccessoriesDetails}
          handleAccessoriesChange=${handleAccessoriesChange}
          selectedVariant=${selectedVariant}
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
          selectedModel=${selectedModel}
          categoriesData=${categoriesData}
          addedAccessories=${addedAccessories}
          setAddedAccessories=${setAddedAccessories}
          showSummary=${showSummary}
          setShowSummary=${setShowSummary}
          selectedColor=${selectedColor}
          isSummaryEditable=${isSummaryEditable}
          isRedirectedToColor=${isRedirectedToColor}
          setIsRedirectedToColor=${setIsRedirectedToColor}
          isRedirectedToVariant=${isRedirectedToVariant}
          setIsRedirectedToVariant=${setIsRedirectedToVariant}
          totalPrice=${totalPrice}
          setTotalPrice=${setTotalPrice}
          showEditVariantPopup=${showEditVariantPopup}
          newAccessoriesList=${newAccessoriesList}
          missingAccessoriesList=${missingAccessoriesList}
          accessoryType=${accessoryType}
          setAccessoryType=${setAccessoryType}
          handleRedirecttoSummary=${handleRedirecttoSummary}
          handleRedirecttoAcc=${handleRedirecttoAcc}
          setActiveTab=${setActiveTab}
          publishDomain=${publishDomain}
          isAccessoryAdded=${isAccessoryAdded}
          handleConfirmAdd=${handleConfirmAdd}
          handleCancelAdd=${handleCancelAdd}
          setShowPopup=${setShowPopup}
          showPopup=${showPopup}
          duplicateAccessory=${duplicateAccessory}
          setDuplicateAccessory=${setDuplicateAccessory}
          setPreviousSelectedVariant=${setPreviousSelectedVariant}
          handleAddAccessory=${handleAddAccessory}
          handleRemoveAccessory=${handleRemoveAccessory}
          conflictingAccessories=${conflictingAccessories}
          setConflictingAccessories=${setConflictingAccessories}
          confirmPopupContent=${confirmPopupContent}
          setConfirmPopupContent=${setConfirmPopupContent}
          showInfoPopup=${showInfoPopup}
          setShowInfoPopup=${setShowInfoPopup}
          handleTabClick=${handleTabClick}
          setIsChangeVariantMobile=${setIsChangeVariantMobile}
          quickViewLabelEl=${quickViewLabelEl}
          setInQuickView=${setInQuickView}
          inQuickView=${inQuickView}
          connectToDealerLink=${connectToDealerLink}
          connectToDealerLabel=${connectToDealerLabel}
          handleAccessoryClick=${handleAccessoryClick}
          previewState=${previewState}
          isAccessoryInPreview=${isAccessoryInPreview}
          infoAccessory=${infoAccessory}
          setInfoAccessory=${setInfoAccessory}
          noAccessoryMessageEl=${noAccessoryMessageEl}
          noAccessoryProceedLabelEl=${noAccessoryProceedLabelEl}
          noAccessoryCtaOneLabelEl=${noAccessoryCtaOneLabelEl}
          noAccessoryCtaTwoLabelEl=${noAccessoryCtaTwoLabelEl}
          grandTotalLabelEl=${grandTotalLabelEl}
          modelLabelEl=${modelLabelEl}
          variantLabelEl=${variantLabelEl}
          colorLabelEl=${colorLabelEl}
          basicSelectionLabelEl=${basicSelectionLabelEl}
          checkoutCtaLabelEl=${checkoutCtaLabelEl}
          formatIndianCurrency=${formatIndianCurrency}
        />
      </div>
    </div> `}
    ${showEditVariantPopup
    && html`<${EditVariantPopup}
      handleTabClick=${handleTabClick}
      modelName=${selectedModel}
      selectedVariant=${selectedVariant}
      publishDomain=${publishDomain}
      isAccessoryAdded=${isAccessoryAdded}
      addBtnLabelEl=${addBtnLabelEl}
      handleConfirmAdd=${handleConfirmAdd}
      handleCancelAdd=${handleCancelAdd}
      acceWarningMsgTitleLabelEl=${acceWarningMsgTitleLabelEl}
      acceWarningMsgSubTitleLabelEl=${acceWarningMsgSubTitleLabelEl}
      acceWarningProceedLabelEl=${acceWarningProceedLabelEl}
      warnCtaOneLabelEl=${warnCtaOneLabelEl}
      warnCtaTwolabelEl=${warnCtaTwolabelEl}
      newAccessories=${newAccessoriesList}
      missingAccessories=${missingAccessoriesList}
      accessoryType=${accessoryType}
      setAccessoryType=${setAccessoryType}
      setShowSummary=${setShowSummary}
      setIsRedirectedToVariant=${setIsRedirectedToVariant}
      setShowEditVariantPopup=${setShowEditVariantPopup}
      handleRedirecttoSummary=${handleRedirecttoSummary}
      handleRedirecttoAcc=${handleRedirecttoAcc}
      previousSelectedVariant=${previousSelectedVariant}
      setSelectedVariant=${setSelectedVariant}
      setConfirmedVariant=${setConfirmedVariant}
      handleAddAccessory=${handleAddAccessory}
      handleRemoveAccessory=${handleRemoveAccessory}
      handleReverttoSummary=${handleReverttoSummary}
      setPreviousCategoriesData=${setPreviousCategoriesData}
      newvariantPopupTitleEl=${newvariantPopupTitleEl}
      newvariantPopupSubTitleEl=${newvariantPopupSubTitleEl}
      newVariantPopUpCtaOneEl=${newVariantPopUpCtaOneEl}
      newVariantPopUpCtaTwoEl=${newVariantPopUpCtaTwoEl}
      accNotAvlblTitleLabelEl=${accNotAvlblTitleLabelEl}
      accNotAvailableLabelEl=${accNotAvailableLabelEl}
      accNotAvailableCTAOneLabelEl=${accNotAvailableCTAOneLabelEl}
      accNotAvailableCTATwoLabelEl=${accNotAvailableCTATwoLabelEl}
    />`}

    <div class="rotate-overlay hide">
      <div class="close-btn" onClick=${closeRotateOverlay}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4.26646 12.4361L3.56396 11.7336L7.2973 8.00029L3.56396 4.26695L4.26646 3.56445L7.9998 7.29779L11.7331 3.56445L12.4356 4.26695L8.7023 8.00029L12.4356 11.7336L11.7331 12.4361L7.9998 8.70279L4.26646 12.4361Z"
            fill="#18171A"
          />
        </svg>
      </div>

      <div class="rotate-overlay-content hide">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="61"
          height="58"
          viewBox="0 0 61 58"
          fill="none"
        >
          <path
            d="M1 4.05469V22.5547H18.5"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8.32083 37.9712C10.212 43.6457 13.7964 48.5168 18.534 51.8505C23.2716 55.1842 28.9057 56.7999 34.5875 56.4542C40.2693 56.1085 45.6909 53.8201 50.0354 49.9338C54.3799 46.0475 57.412 40.7739 58.6748 34.9075C59.9376 29.0411 59.3628 22.8998 57.0368 17.4088C54.7109 11.9178 50.7599 7.37469 45.7791 4.46393C40.7983 1.55317 35.0576 0.432464 29.422 1.27068C23.7863 2.10889 18.561 4.86062 14.5333 9.11124L1 22.5546"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p>Please Rotate your Device for complete experience.</p>
      </div>
    </div>
    ${(isChangeVariantMobile || isRedirectedToVariant)
    && html`
      <${CarVariantDetailsMobile}
        variantData=${variantData}
        selectedVariant=${selectedVariant}
        setSelectedVariant=${setSelectedVariant}
        interactionLabel=${interactionLabel}
        variantDetailsLabels=${variantDetailsLabels}
        filters=${filters}
        setFilters=${setFilters}
        isChangeMode=${isChangeMode}
        setIsChangeMode=${setIsChangeMode}
        handleVariantChange=${handleVariantChange}
        setShowSelectedBtn=${setShowSelectedBtn}
        showSelectedBtn=${showSelectedBtn}
        isChangeVariantMobile=${isChangeVariantMobile}
        setIsChangeVariantMobile=${setIsChangeVariantMobile}
        changeVariant=${changeVariant}
        setOnMoreClick=${setOnMoreClick}
        clearFilters=${clearFilters}
        confirmedVariant=${confirmedVariant}
        setConfirmedVariant=${setConfirmedVariant}
        addedAccessories=${addedAccessories}
        categoriesData=${categoriesData}
        isRedirectedToVariant=${isRedirectedToVariant}
        handleReverttoSummary=${handleReverttoSummary}
        modelDesc=${modelDesc}
        variantListLength=${variantListLength}
        getFuelTypeFromPlaceHolder=${getFuelTypeFromPlaceHolder}
      />
    `}
    ${videoUrl
    && html`<div className="videopopup-overlay">
      <div className="videoContainer">
        <div className="overlayHeader">
          ${hotspotTitle}
          <button className="closeButton" onClick=${closeOverlay}>
            <${variantCloseIcon} />
          </button>
        </div>
        <video 
        src=${videoUrl} 
        onCanPlay=${() => handleVideoCanPlay()}  
        ref=${videoRef} 
        controls
        autoplay="autoplay"
        playsinline 
        muted 
        preload="auto"
        poster="${thumbnailUrl}">
        
            </video>
      </div>
    </div> `}
    ${onMoreClick
    && html`
      <${ChangeVariantDetailsMobile}
        variantData=${variantData}
        selectedVariant=${selectedVariant}
        setSelectedVariant=${setSelectedVariant}
        interactionLabel=${interactionLabel}
        variantDetailsLabels=${variantDetailsLabels}
        filters=${filters}
        setFilters=${setFilters}
        isChangeMode=${isChangeMode}
        setIsChangeMode=${setIsChangeMode}
        handleVariantChange=${handleVariantChange}
        setShowSelectedBtn=${setShowSelectedBtn}
        showSelectedBtn=${showSelectedBtn}
        changeVariant=${changeVariant}
        onMoreClick=${onMoreClick}
        setOnMoreClick=${setOnMoreClick}
        setIsChangeVariantMobile=${setIsChangeVariantMobile}
        showVideoCompair=${showVideoCompair}
        setShowVideoCompair=${setShowVideoCompair}
        clearFilters=${clearFilters}
        compareVariantData=${compareVariantData}
        setCompareVariantData=${setCompareVariantData}
        hasSelectedVariant=${hasSelectedVariant}
        setHasSelectedVariant=${setHasSelectedVariant}
      />
    `}
  `;
};

export default BottomContainer;
