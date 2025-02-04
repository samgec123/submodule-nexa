import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useEffect,
  useState,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import configuratorApiUtils from '../configuratorApiUtils.js';
import { moreOptionBtn } from '../Icons.js';
import POPUP_TYPES from '../Popup/constant.js';
import {
  fetchPlaceholders,
  getMetadata,
} from '../../../commons/scripts/aem.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';

const { publishDomain } = await fetchPlaceholders();
const ConfigCard = ({
  savedCar,
  interactionLabel,
  selectedCardConfig,
  setSelectedCardConfig,
  setPopupType,
  setHeading,
  setSubHeading,
  setShowPopup,
  configData,
  setConfigData,
  saveCarConfig,
  setSaveCarConfig,
  yourCarName,
  setIfConfigDataUpdateRequired,
  profileData,
  carList,
  setYourCarName,
  connectToDealerLink,
  connectToDealerLabel,
  savedCardCtaOneLabelEl,
  savedCardCtaTwoLabelEl,
  renameConfLabelEl,
  downloadConfLabelEl,
  duplicateConfLabelEl,
  deleteConfLabelEl,
  deletePopupTitleLabelEl,
  deletePopupSubTitleLabelEl,
  renamePopTitleLabelEl,
  eBookingLabel,
  eBookingLink,
}) => {
  const savedCarsCtaOneLink = savedCardCtaOneLabelEl?.querySelector('a')?.href || '#';
  const savedCarsCtaOneLabel = savedCardCtaOneLabelEl?.querySelector('a')?.textContent?.trim() || '';
  const savedCarsCtaTwoLink = savedCardCtaTwoLabelEl?.querySelector('a')?.href || '#';
  const savedCarsCtaTwoLable = savedCardCtaTwoLabelEl?.querySelector('a')?.textContent?.trim() || '';
  const renameConfLabel = renameConfLabelEl?.textContent?.trim() || '';
  const downloadConfLabel = downloadConfLabelEl?.textContent?.trim() || '';
  const duplicateConfLabel = duplicateConfLabelEl?.textContent?.trim() || '';
  const deleteConfLabel = deleteConfLabelEl?.textContent?.trim() || '';
  const deletePopupTitleLabel = deletePopupTitleLabelEl?.textContent?.trim() || '';
  const deletePopupSubTitleLabel = deletePopupSubTitleLabelEl?.textContent?.trim() || '';
  const renamePopTitleLabel = renamePopTitleLabelEl?.textContent?.trim() || '';

  const [dropdownMenu, setDropdownMenu] = useState(false);
  const menuRef = useRef(null);
  const moreOptionBtnRef = useRef(null);
  const [carImage, setCarImage] = useState(null);

  useEffect(() => {
    if (dropdownMenu) {
      document.addEventListener('click', handleClickOutsideMenu);
    } else {
      document.removeEventListener('click', handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener('click', handleClickOutsideMenu);
    };
  }, [dropdownMenu]);

  useEffect(() => {
    fetchCarImage(savedCar.modelCd);
  }, []);

  const fetchCarImage = (modelCd) => {
    try {
      const car = carList.find((car) => car.modelCd === modelCd);

      if (car && car.carImage && car.carImage?._dynamicUrl) {
        setCarImage(`${publishDomain}${car.carImage?._dynamicUrl}`);
      } else {
        setCarImage(null);
      }
    } catch (error) {
      console.error('Error fetching car image:', error);
      setCarImage(null);
    }
  };

  const handleMoreOptionsClick = (event) => {
    setDropdownMenu((prev) => !prev);
  };

  const handleClickOutsideMenu = (event) => {
    if (
      menuRef.current
      && !menuRef.current.contains(event.target)
      && moreOptionBtnRef.current
      && !moreOptionBtnRef.current.contains(event.target)
    ) {
      setDropdownMenu(false);
    }
  };

  const handleRename = async () => {
    setPopupType(POPUP_TYPES.NAME);
    setHeading(renamePopTitleLabel);
    setSubHeading(savedCar?.configName);
    setShowPopup(true);
  };

  const handleDelete = async () => {
    setPopupType(POPUP_TYPES.DELETE);
    setHeading(deletePopupTitleLabel);
    setSubHeading(deletePopupSubTitleLabel);
    setShowPopup(true);
  };

  const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  const handleDuplicate = async () => {
    try {
      const updatedConfigData = [...configData];
      const configIndex = updatedConfigData.findIndex(
        (config) => config.pinNo === selectedCardConfig.pinNo,
      );

      if (configIndex !== -1) {
        const { pinNo, ...restConfig } = updatedConfigData[configIndex];
        const duplicatedConfig = {
          ...restConfig,
          configName: `${restConfig.configName} - Copy`,
        };

        const newConfigData = [duplicatedConfig, ...updatedConfigData];

        setConfigData(newConfigData);
        setDropdownMenu(false);

        const currentDateTime = getCurrentDateTime();
        const duplicatedCarConfig = {
          firstName: profileData.fname,
          lastName: profileData.lname,
          mobileNumber: profileData.number,
          email: profileData.email,
          ...duplicatedConfig,
          createdDate: currentDateTime,
          modifiedDate: currentDateTime,
        };

        const data = await configuratorApiUtils.saveCarConfig(
          duplicatedCarConfig,
        );
      }
    } catch (err) {
      setErrorMsg(err);
      console.error('Error Saving config data', err);
    }
  };

  const handleDownload = async () => {};

  return html`
    <div class="card-panel">
      ${savedCar?.configName !== selectedCardConfig?.configName
    ? html`<div
            class="card"
            onClick=${() => setSelectedCardConfig(savedCar)}
          >
            <div class="car-info">
              <img
                src=${carImage}
                alt="preview not available"
                class="car-image"
              />
              <div class="car-details">
                <div class="title">${savedCar?.configName}</div>
                <div class="price">
                  ${interactionLabel.rsLabel}
                  ${savedCar?.totalPrice
    ? ` ${configuratorApiUtils
      .formatCurrency(savedCar.totalPrice)
      .replace(/,/g, ' ')}`
    : ''}
                </div>
              </div>
            </div>
          </div>`
    : html`<div class="card selected">
            <div class="car-info">
              <img
                src=${carImage}
                alt="preview not available"
                class="car-image"
              />
              <div class="car-details">
                <div class="title selected-title">${savedCar?.configName}</div>
                <div class="price selected-price">
                  ${interactionLabel.rsLabel}
                  ${savedCar?.totalPrice
    ? ` ${configuratorApiUtils
      .formatCurrency(savedCar.totalPrice)
      .replace(/,/g, ' ')}`
    : ''}
                </div>
              </div>
              <div class="moreBtn">
                <div
                  class="more-option-btn"
                  ref=${moreOptionBtnRef}
                  onClick="${handleMoreOptionsClick}"
                >
                  <${moreOptionBtn} />
                </div>
                <div
                  class="more-options-menu"
                  ref=${menuRef}
                  style="display: ${dropdownMenu ? 'block' : 'none'}"
                >
                  <div
                    class="menu-option"
                    onClick=${(e) => {
    handleRename();
    configuratorDataLayerUtils.pushUserInteractionToDataLayer(e, savedCar);
  }}
                  >
                    ${renameConfLabel}
                  </div>
                  <div class="separator"></div>
                   <div
                    class="menu-option"
                    onClick=${(e) => {
    handleDownload();
    configuratorDataLayerUtils.pushUserInteractionToDataLayer(e, savedCar);
  }}
                  >
                    ${downloadConfLabel}
                  </div>
                 
                  <div class="separator"></div>
                  <div
                    class="menu-option"
                    onClick=${(e) => {
    handleDuplicate();
    configuratorDataLayerUtils.pushUserInteractionToDataLayer(e, savedCar);
  }}
                  >
                    ${duplicateConfLabel}
                  </div>
                  <div class="separator"></div>
                  <div
                    class="menu-option"
                    onClick=${(e) => {
    handleDelete();
    configuratorDataLayerUtils.pushUserInteractionToDataLayer(e, savedCar);
  }}
                  >
                    ${deleteConfLabel}
                  </div>
                </div>
              </div>
            </div>
            <div class="btn-panel">
              <div class="action-buttons">
                <div
                  class="configBtn connect-dealer"
                  onClick=${(e) => {
    const urlWithModelCode = `${savedCarsCtaOneLink}?modelCd=${
      savedCar?.modelCd || ''
    }`;
    window.open(urlWithModelCode);
    configuratorDataLayerUtils.pushClickToDataLayer(e, savedCar?.modelDesc);
  }}
                >
                  ${savedCarsCtaOneLabel}
                </div>
                <div
                  class="configBtn e-booking"
                  onClick=${(e) => {
    const urlWithModelCode = `${eBookingLink}?modelCd=${
      savedCar?.modelCd || ''
    }`;
    window.open(urlWithModelCode);
    configuratorDataLayerUtils.pushClickToDataLayer(e, savedCar?.modelDesc);
  }}
                >
                  ${eBookingLabel}
                </div>
              </div>
            </div>
          </div> `}
    </div>
  `;
};

export default ConfigCard;
