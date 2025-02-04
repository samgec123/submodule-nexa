import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import ConfigCard from './ConfigCard.js';
import {
  useEffect,
  useState,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import configuratorApiUtils from '../configuratorApiUtils.js';
import { getMetadata } from '../../../commons/scripts/aem.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';

const SavedCars = ({
  newCarousel,
  setNewCarousel,
  configurations,
  setConfigurations,
  setActiveTab,
  interactionLabel,
  selectedCardConfig,
  setSelectedCardConfig,
  setPopupType,
  setHeading,
  setSubHeading,
  setShowPopup,
  setIfConfigDataUpdateRequired,
  yourCarName,
  profileData,
  setYourCarName,
  connectToDealerLink,
  connectToDealerLabel,
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
  deletePopupTitleLabelEl,
  deletePopupSubTitleLabelEl,
  renamePopTitleLabelEl,
  renamePopInputLabelEl,
  renamePopCtaLabelEl,
  eBookingLabel,
  eBookingLink,
  selectedVariant,
  selectedColor,
}) => {
  const handleNewClick = () => {
    setNewCarousel(true);
  };

  const [carList, setCarList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carListData = await configuratorApiUtils.getConfigCarList();
        setCarList(carListData);
      } catch (error) {
        console.error('Error fetching car list:', error);
      }
    };

    fetchData();
  }, []);

  const savdCarsLabel = savdCarsLabelEl?.textContent?.trim() || '';
  const savedCarsSubTitleLabel = savedCarsSubTitleLabelEl?.textContent?.trim() || '';
  const noSavedCarsMsgLabel = noSavedCarsMsgLabelEl?.textContent?.trim() || '';
  const newConfLabel = newConfLabelEl?.textContent?.trim() || '';

  return html`
    <div class="config-details">
      <div class="config-title">${savdCarsLabel}</div>
      <div class="config-subtitle">
        ${configurations?.length > 0
    ? savedCarsSubTitleLabel
    : noSavedCarsMsgLabel}
      </div>

      ${configurations?.length > 0
      && html`<div class="saved-cars-panel">
        ${configurations?.map(
    (savedConfig) => html` <${ConfigCard}
            savedCar=${savedConfig}
            setActiveTab=${setActiveTab}
            interactionLabel=${interactionLabel}
            selectedCardConfig=${selectedCardConfig}
            setSelectedCardConfig=${setSelectedCardConfig}
            setPopupType=${setPopupType}
            setHeading=${setHeading}
            setSubHeading=${setSubHeading}
            setShowPopup=${setShowPopup}
            configData=${configurations}
            setConfigData=${setConfigurations}
            setIfConfigDataUpdateRequired=${setIfConfigDataUpdateRequired}
            yourCarName=${yourCarName}
            profileData=${profileData}
            carList=${carList}
            setYourCarName=${setYourCarName}
            connectToDealerLink=${connectToDealerLink}
            connectToDealerLabel=${connectToDealerLabel}
            savedCardCtaOneLabelEl=${savedCardCtaOneLabelEl}
            savedCardCtaTwoLabelEl=${savedCardCtaTwoLabelEl}
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
          />`,
  )}
      </div> `}

      <div class="new-config" onClick=${(e) => { handleNewClick(); configuratorDataLayerUtils.pushStartToDataLayer(e, selectedColor, selectedVariant); }}>${newConfLabel}</div>
    </div>
  `;
};

export default SavedCars;
