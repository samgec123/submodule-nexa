/* eslint-disable no-unused-vars */
import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useState,
  useEffect,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import { fetchPlaceholders } from '../../../commons/scripts/aem.js';
import SavedCars from './SavedCars.js';
import authUtils from '../../../commons/utility/authUtils.js';
import Popup from '../Popup/Popup.js';
import POPUP_TYPES from '../Popup/constant.js';
import configuratorApiUtils from '../configuratorApiUtils.js';
import ModelCarousel from '../ModelCarousel/ModelCarousel.js';
import interaction from '../interaction.js';

const SaveConfiguration = ({
  activeTab,
  setActiveTab,
  interactionLabel,
  selectedVariant,
  selectedModel,
  selectedCardConfig,
  setSelectedCardConfig,
  addedAccessories,
  selectedColor,
  categoriesData,
  modelDesc,
  totalPrice,
  connectToDealerLink,
  connectToDealerLabel,
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
  eBookingLabel,
  eBookingLink,
  accModelCd,
  accFromYear,
  accToYear,
  forCode,
  channel,
}) => {
  const loginPopupTitlelabel = loginPopupTitlelabelEl?.textContent?.trim() || '';
  const loginPopupSubTitleLabel = loginPopupSubTitleLabelEl?.textContent?.trim() || '';
  const renameCarPopupTitleLabel = renameCarPopupTitleLabelEl?.textContent?.trim() || '';
  const renameCarInputLabel = renameCarInputLabelEl?.textContent?.trim() || '';
  const renameCarPopCtaLabel = renameCarPopCtaLabelEl?.textContent?.trim() || '';
  const edgeCasePopupTitleLabel = edgeCasePopupTitleLabelEl?.textContent?.trim() || '';
  const edgeCasePopupSubTitleLabel = edgeCasePopupSubTitleLabelEl?.textContent?.trim() || '';

  const [configData, setConfigData] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [heading, setHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [saveCarConfig, setSaveCarConfig] = useState({
    modelCd: selectedModel,
    modelDesc,
    variantCd: selectedVariant?.variantCd,
    variantDesc: selectedVariant?.variantDesc,
    variant3dCode: selectedVariant?.variant3dCode,
    modelCodeAccessory: accModelCd,
    variantCodeAccessory: selectedVariant?.variantCodeAccessory,
    accessoryFromYear: accFromYear,
    accessoryToYear: accToYear,
    catgCd: ['AA'],
    forCd: forCode,
    channel,
    colorCd: selectedColor?.eColorCd,
    color3dCode: selectedColor?.color3dCode,
    colorDesc: selectedColor?.eColorDesc,
    colorType: selectedColor.colorType,
    hexCode: selectedColor?.hexCode?.[0] || '',
    totalPrice: parseInt((totalPrice?.toString()?.replace(/,/g, '')) || '0', 10),

  });
  const [yourCarName, setYourCarName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ifConfigDataUpdateRequired, setIfConfigDataUpdateRequired] = useState(false);
  const [savedPinNumber, setSavedPinNumber] = useState(null);
  let configDataTemp;

  const [newCarousel, setNewCarousel] = useState(false);
  localStorage.setItem('saveCarConfig', JSON.stringify(saveCarConfig));
  const isFirstRender = useRef(true);

  useEffect(() => {
    const init = async () => {
      try {
        await authUtils.waitForAuth();
        const profile = await authUtils.getProfile();
        if (profile) {
          const saveObj = JSON.parse(localStorage.getItem('saveCarConfig')) || {};
          setSaveCarConfig(saveObj);
          fetchProfileandConfigs(profile);
        } else {
          setPopupType(POPUP_TYPES.LOGIN);
          setHeading(loginPopupTitlelabel);
          setSubHeading(loginPopupSubTitleLabel);
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setShowPopup(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (ifConfigDataUpdateRequired) {
      fetchSavedCars(profileData);
    }
  }, [ifConfigDataUpdateRequired]);

  const fetchProfileandConfigs = (profile) => {
    setPopupType(POPUP_TYPES.NAME);
    setHeading(renameCarPopupTitleLabel);
    setSubHeading(selectedVariant?.variantDesc || '');
    setShowPopup(true);
    // fetchSavedCars(profile);
    setProfileData(profile);
  };

  const fetchSavedCars = async (profile) => {
    const data = await configuratorApiUtils.getSavedCarsConfigs(
      profile?.number || null,
    );
    if (data?.configurations?.length > 0) {
      setConfigData(data.configurations);
      // If we have a saved pinNumber, match the data
      if (savedPinNumber) {
        const savedConfig = data.configurations.find((config) => config.pinNo === savedPinNumber);
        if (savedConfig) {
          setSelectedCardConfig(savedConfig);
        }
      }
    } else {
      setConfigData(configDataTemp);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (heading.toLowerCase().includes('rename')) {
      await handleUpdateSaveConfig();
    } else {
      await handleNewSaveConfig();
    }

    setIsLoading(false);
    setYourCarName('');
  };

  const handleNewSaveConfig = async () => {
    const obj = {
      ...saveCarConfig,
      firstName: profileData?.fname,
      lastName: profileData?.lname,
      mobileNumber: profileData?.number,
      email: profileData?.email,
      configName: yourCarName,
      accessories: storeAccesoryData(),
      createdDate: getFormattedDate(),
    };

    try {
      const response = await configuratorApiUtils.saveCarConfig(obj);
      // Map the pinNumber to the saved configuration
      const { pinNumber } = response;
      setSavedPinNumber(pinNumber);
      localStorage.removeItem('saveCarConfig');
      setIsLoading(false);
      setShowPopup(false);
    } catch (err) {
      fetchSavedCars(profileData);
      setIsLoading(false);
      setPopupType(POPUP_TYPES.ERROR);
      if (err.message === 'Not allowed to have more than 3 configurations for the provided mobile number and channel.') {
        setHeading(edgeCasePopupTitleLabel);
        setSubHeading(edgeCasePopupSubTitleLabel);
      } else {
        setHeading(err.message);
        setSubHeading('');
      }
    }
  };

  useEffect(async () => {
    if (savedPinNumber) {
      fetchSavedCars(profileData);
    }
  }, [savedPinNumber]);

  const fetchDataFromConfigSummary = async (pinNo) => {
    const data = await configuratorApiUtils.getCarConfigSummary(
      pinNo || null,
    );
    data.configName = yourCarName;
    return data;
  };

  const handleUpdateSaveConfig = async () => {
    const updateObj = {
      ...selectedCardConfig,
      modifiedDate: getFormattedDate(),
      firstName: profileData?.fname,
      lastName: profileData?.lname,
      mobileNumber: profileData?.number,
      email: profileData?.email,
      configName: yourCarName,
    };

    const carConfigObjUpdate = await fetchDataFromConfigSummary(selectedCardConfig.pinNo);
    const data = await configuratorApiUtils.updateCarConfig(
      carConfigObjUpdate,
      (err) => {
        setIsLoading(false);
        console.error('Error updating config data', err);
      },
    );
    setShowPopup(false);
    setSavedPinNumber(selectedCardConfig.pinNo);

    const updatedConfigData = [...(configDataTemp || [])];
    const configIndex = updatedConfigData?.findIndex(
      (config) => config?.pinNo === selectedCardConfig?.pinNo,
    );
    if (configIndex !== -1) {
      updatedConfigData[configIndex].configName = yourCarName;
      setConfigData(updatedConfigData);
    }
  };

  const storeAccesoryData = () => {
    const accessoriesJsonObj = (addedAccessories || [])?.map((accessory) => {
      const parentCategoryArr = categoriesData?.data?.parentCategories;
      const parentCategoryData = parentCategoryArr?.find((category) => category.subCategories?.some((subCategory) => subCategory.accessories.some((acc) => acc.partNum === accessory.partNum)));
      const parentCategory = parentCategoryData?.parentCategoryCd || null;

      const subCategory = parentCategoryData?.subCategories?.find((subCategory) => subCategory.accessories?.some((acc) => acc.partNum === accessory.partNum))?.l2CatgName || null;

      return {
        accessoriesObject: subCategory,
        partNumber: accessory?.partNum,
        partDesc: accessory?.partDesc,
        parentCategory,
        subCategory,
        unitPrice: accessory?.price,
        minQty: accessory?.qty,
        threeDAccessoryId: accessory?.catg3DId,
        createdDate: '',
        modifiedDate: '',
      };
    });
    return accessoriesJsonObj;
  };

  const getFormattedDate = () => new Date()
    .toLocaleString('sv-SE', { timeZone: 'UTC' });

  return html`<div>
    <div class="configuration-container">
      <div class="inner-block">
        <div class="config-panel">
          <${SavedCars}
            newCarousel=${newCarousel}
            setNewCarousel=${setNewCarousel}
            configurations=${configData}
            setConfigurations=${setConfigData}
            selectedCardConfig=${selectedCardConfig}
            setSelectedCardConfig=${setSelectedCardConfig}
            setActiveTab=${setActiveTab}
            interactionLabel=${interactionLabel}
            setPopupType=${setPopupType}
            setHeading=${setHeading}
            setSubHeading=${setSubHeading}
            setShowPopup=${setShowPopup}
            setIfConfigDataUpdateRequired=${setIfConfigDataUpdateRequired}
            yourCarName=${yourCarName}
            setYourCarName=${setYourCarName}
            profileData=${profileData}
            connectToDealerLink=${connectToDealerLink}
            connectToDealerLabel=${connectToDealerLabel}
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
            deletePopupTitleLabelEl=${deletePopupTitleLabelEl}
            deletePopupSubTitleLabelEl=${deletePopupSubTitleLabelEl}
            renamePopTitleLabelEl=${renamePopTitleLabelEl}
            renamePopInputLabelEl=${renamePopInputLabelEl}
            renamePopCtaLabelEl=${renamePopCtaLabelEl}
            eBookingLabel=${eBookingLabel}
            eBookingLink=${eBookingLink}
            selectedVariant=${selectedVariant}
            selectedColor=${selectedColor}
          />
        </div>
      </div>
    </div>
    ${showPopup
    && html`<${Popup}
      setActiveTab=${setActiveTab}
      type=${popupType}
      setShowPopup=${setShowPopup}
      heading=${heading}
      subHeading=${subHeading}
      name=${yourCarName}
      setName=${setYourCarName}
      handleSave=${handleSave}
      isLoading=${isLoading}
      setIsLoading=${setIsLoading}
      selectedCardConfig=${selectedCardConfig}
      setSelectedCardConfig=${setSelectedCardConfig}
      configurations=${configData}
      setConfigurations=${setConfigData}
      saveCarConfig=${saveCarConfig}
      setSaveCarConfig=${setSaveCarConfig}
      selectedVariant=${selectedVariant}
      addedAccessories=${addedAccessories}
      selectedColor=${selectedColor}
      activeTab=${activeTab}
      selectedModel=${selectedModel}
      loginPopupCTAOneLabelEl=${loginPopupCTAOneLabelEl}
      loginPopupCTATwoLabel=${loginPopupCTATwoLabel}
      renameCarInputLabel=${renameCarInputLabel}
      renameCarPopCtaLabel=${renameCarPopCtaLabel}
      deletePopupCtaOneLabelEl=${deletePopupCtaOneLabelEl}
      deletePopupCtaTwoLabelEl=${deletePopupCtaTwoLabelEl}
      renamePopInputLabelEl=${renamePopInputLabelEl}
      renamePopCtaLabelEl=${renamePopCtaLabelEl}
      edgeCasePopupCtaOneLabelEl=${edgeCasePopupCtaOneLabelEl}
    />`}
    ${newCarousel
    && html`<${ModelCarousel} setNewCarousel=${setNewCarousel} />`}
  </div>`;
};

export default SaveConfiguration;
