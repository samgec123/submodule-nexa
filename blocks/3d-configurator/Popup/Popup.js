import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { useEffect, useState } from '../../../commons/scripts/vendor/preact-hooks.js';
import authUtils from '../../../commons/utility/authUtils.js';
import configuratorApiUtils from '../configuratorApiUtils.js';
import interaction from '../interaction.js';
import POPUP_TYPES from './constant.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';
import { DeleteCarPopupCloseIcon } from '../Icons.js';

const Popup = (props) => {
  const {
    type,
    setActiveTab,
    handleTabClick,
    setShowPopup,
    heading,
    subHeading,
    name,
    setName,
    handleSave,
    isLoading,
    setIsLoading,
    selectedCardConfig,
    setSelectedCardConfig,
    configurations,
    setConfigurations,
    saveCarConfig,
    setSaveCarConfig,
    selectedVariant,
    addedAccessories,
    selectedColor,
    activeTab,
    selectedModel,
    loginPopupCTAOneLabelEl,
    loginPopupCTATwoLabel,
    renameCarInputLabel,
    renameCarPopCtaLabel,
    deletePopupCtaOneLabelEl,
    deletePopupCtaTwoLabelEl,
    renamePopInputLabelEl,
    renamePopCtaLabelEl,
    edgeCasePopupCtaOneLabelEl,
    exitPopupCtaOneLabelEl,
    exitPopupCtaTwoLabelEl,
    backBtnPopupCtaOneLabel,
    backBtnPopupCtaTwoLabel,
    renameCarPopCtaLabelEl,
  } = props;

  const getPopupFromType = (type = POPUP_TYPES.LOGIN) => {
    switch (type) {
      case POPUP_TYPES.LOGIN:
        return html`<${Login}
          heading=${heading}
          subHeading=${subHeading}
          isLoading=${isLoading}
          setShowPopup=${setShowPopup}
          setIsLoading=${setIsLoading}
          saveCarConfig=${saveCarConfig}
          setSaveCarConfig=${setSaveCarConfig}
          selectedVariant=${selectedVariant}
          addedAccessories=${addedAccessories}
          selectedColor=${selectedColor}
          activeTab=${activeTab}
          selectedModel=${selectedModel}
          loginPopupCTAOneLabelEl=${loginPopupCTAOneLabelEl}
          loginPopupCTATwoLabel=${loginPopupCTATwoLabel}
          
        />`;
      case POPUP_TYPES.NAME:
        return html`<${Name}
          heading=${heading}
          subHeading=${subHeading}
          name=${name}
          setName=${setName}
          setActiveTab=${setActiveTab}
          handleSave=${handleSave}
          isLoading=${isLoading}
          setIsLoading=${setIsLoading}
          renameCarInputLabel=${renameCarInputLabel}
          renameCarPopCtaLabel=${renameCarPopCtaLabel}
        />`;
      case POPUP_TYPES.DELETE:
        return html`<${Delete}
          heading=${heading}
          subHeading=${subHeading}
          isLoading=${isLoading}
          setIsLoading=${setIsLoading}
          setShowPopup=${setShowPopup}
          selectedCardConfig=${selectedCardConfig}
          setSelectedCardConfig=${setSelectedCardConfig}
          configurations=${configurations}
          setConfigurations=${setConfigurations}
          deletePopupCtaOneLabelEl=${deletePopupCtaOneLabelEl}
          deletePopupCtaTwoLabelEl=${deletePopupCtaTwoLabelEl}
        />`;
      case POPUP_TYPES.GOBACK:
        return html`<${GoBack}
          heading=${heading}
          subHeading=${subHeading}
          setShowPopup=${setShowPopup}
          backBtnPopupCtaOneLabel=${backBtnPopupCtaOneLabel}
          backBtnPopupCtaTwoLabel=${backBtnPopupCtaTwoLabel}
        />`;
      case POPUP_TYPES.GOBACKFROMCUSTOMIZE:
        return html`<${GoBackFromCustomize}
          heading=${heading}
          subHeading=${subHeading}
          setShowPopup=${setShowPopup}
          setActiveTab=${setActiveTab}
          handleTabClick=${handleTabClick}
          exitPopupCtaOneLabelEl=${exitPopupCtaOneLabelEl}
          exitPopupCtaTwoLabelEl=${exitPopupCtaTwoLabelEl}
          renameCarPopCtaLabelEl=${renameCarPopCtaLabelEl}
          selectedVariant=${selectedVariant}
          addedAccessories=${addedAccessories}
          selectedColor=${selectedColor}
          activeTab=${activeTab}
          selectedModel=${selectedModel}
        />`;
      case POPUP_TYPES.ERROR:
        return html`<${Error}
            heading=${heading}
            subHeading=${subHeading}
            setShowPopup=${setShowPopup}
            edgeCasePopupCtaOneLabelEl=${edgeCasePopupCtaOneLabelEl}
          />`;
      default:
        break;
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return html`
    <div className="modal save-share__modal">
      ${type !== POPUP_TYPES.GOBACKFROMCUSTOMIZE
    ? html`
            <div className="popup-container">
              ${getPopupFromType(type)}
          ${(type !== POPUP_TYPES.NAME || (heading?.toLowerCase().includes('rename') && type === POPUP_TYPES.NAME))
           && html`${type === POPUP_TYPES.GOBACK ? html`
           <div className="close-icon-delete-car-popup" onClick=${() => setShowPopup(false)}><${DeleteCarPopupCloseIcon}/></div>
            ` : html`<button
                className="icon-button close-btn"
                type="button"
                onClick=${closePopup}
              ></button>`}
              `}
            </div>
          `
    : html`<div className="exit-container">${getPopupFromType(type)}</div> `}
    </div>
  `;
};

const Login = ({
  heading,
  subHeading,
  setActiveTab,
  isLoading,
  setIsLoading,
  setShowPopup,
  saveCarConfig,
  setSaveCarConfig,
  selectedVariant,
  addedAccessories,
  selectedColor,
  selectedModel,
  activeTab,
  loginPopupCTAOneLabelEl,
  loginPopupCTATwoLabel,
}) => {
  const loginPopupCTAOneLabel = loginPopupCTAOneLabelEl?.textContent?.trim() || '';
  const loginPopupCTATwoLabl = loginPopupCTATwoLabel?.textContent?.trim() || '';

  const handleLogin = async () => {
    setIsLoading(true);

    interaction.storeDataForConfigModel(
      selectedVariant,
      selectedModel,
      activeTab,
      addedAccessories,
      selectedColor,
    );
    localStorage.setItem('saveCarConfig', JSON.stringify(saveCarConfig));
    try {
      await authUtils.login();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
      setShowPopup(false);
    }
  };

  return html`
    <div className="login-signup">
      <div className="header">
        <span className="confirmation-icon"></span>
      </div>
      <div className="body">
        <p className="heading">${heading}</p>
        <p className="sub-heading">${subHeading}</p>
      </div>
      ${isLoading
    ? html`<div className="loader">Please wait...</div>`
    : html`<div className="footer">
            <button
              className="sign-up button button-secondary"
              type="button"
              onClick=${(e) => {
    handleLogin(); configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.login-signup .heading'));
  }}
            >
          ${loginPopupCTATwoLabl}
            </button>
            <button
              className="login button button-primary"
              type="button"
              onClick=${(e) => {
    handleLogin(); configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.login-signup .heading'));
  }}
            >
              ${loginPopupCTAOneLabel}
            </button>
          </div>`}
    </div>
  `;
};

const Name = ({
  heading,
  subHeading,
  name,
  setName,
  handleSave,
  isLoading,
  setIsLoading,
  renameCarInputLabel,
  renameCarPopCtaLabel,
}) => {
  const [errorMessage, setErrorMessage] = useState('');

  const validateName = (input) => {
    // Check if input is empty
    if (input.trim() === '') {
      setErrorMessage('Name cannot be empty');
      return false;
    }

    // Check for invalid characters (only allow alphanumeric and spaces)
    const regex = /^[a-zA-Z0-9\s]*$/;
    if (!regex.test(input)) {
      setErrorMessage('Name contains invalid characters');
      return false;
    }

    // Check for character limit (up to 50 characters)
    if (input.length >= 35) {
      setErrorMessage('Name cannot be longer than 35 characters');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setName(inputValue);
    validateName(inputValue);
  };

  const isSaveDisabled = errorMessage !== '' || name.trim() === '';
  return html`
  <div className="name-car">
    <div className="header">
      <span className="confirmation-icon"></span>
    </div>
    <div className="body">
      <p className="heading">${heading}</p>
      <p className="sub-heading">${subHeading}</p>

      <input
        type="text"
        className="name-input"
        placeholder=${renameCarInputLabel.trim()}
        value=${name}
        maxLength="35"
        onInput=${handleInputChange}
      />
       ${errorMessage && html`<p className="error-message">${errorMessage}</p>`}
    </div>
    ${isLoading && html`<div className="loader">Please wait...</div>`}
    <div className="footer">
      <button
        className=${`save button button-primary ${isSaveDisabled ? 'validateName' : ''}`}
        type="button"
         onClick=${(e) => {
    if (validateName(name)) {
      handleSave();
      configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.name-car .heading'));
    }
  }}
      >
        ${renameCarPopCtaLabel}
      </button>
    </div>
  </div>
`;
};

const Delete = ({
  heading,
  subHeading,
  isLoading,
  setIsLoading,
  setShowPopup,
  selectedCardConfig,
  setSelectedCardConfig,
  configurations,
  setConfigurations,
  deletePopupCtaOneLabelEl,
  deletePopupCtaTwoLabelEl,
}) => {
  const deletePopupCtaOneLabel = deletePopupCtaOneLabelEl?.textContent?.trim() || '';
  const deletePopupCtaTwoLabel = deletePopupCtaTwoLabelEl?.textContent?.trim() || '';
  const rejectDelete = () => {
    setShowPopup(false);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    const msPin = selectedCardConfig?.pinNo;
    const profile = await authUtils.getProfile();
    const updatedConfigData = configurations?.filter(
      (card) => card?.pinNo !== selectedCardConfig?.pinNo,
    );
    setConfigurations(updatedConfigData);

    const result = await configuratorApiUtils.deleteCarConfig(
      msPin,
      profile?.number,
    );
    setIsLoading(false);

    setSelectedCardConfig(null);
    setShowPopup(false);
  };

  return html`
    <div className="delete-car">
      <div className="header">
       
        <span className="exclamation-icon"></span>
      </div>
      <div className="body">
        <p className="heading">${heading}</p>
        <p className="sub-heading">${subHeading}</p>
      </div>
      ${isLoading
    ? html`<div className="loader">Please wait...</div>`
    : html`<div className="footer">
            <button
              className="no-btn button button-primary"
              type="button"
              onClick=${(e) => {
    rejectDelete();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.delete-car .sub-heading'));
  }}
            >
              ${deletePopupCtaOneLabel}
            </button>
            <button
              className="no-btn button button-secondary"
              type="button"
               onClick=${(e) => {
    confirmDelete();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.delete-car .sub-heading'));
  }}
             
            >
              ${deletePopupCtaTwoLabel}
              
            </button>
          </div>`}
    </div>
  `;
};

const GoBack = ({
  heading, subHeading, setShowPopup, backBtnPopupCtaOneLabel,
  backBtnPopupCtaTwoLabel,
}) => {
  const onCancel = () => {
    setShowPopup(false);
  };

  const onConfirm = () => {
    setShowPopup(false);
    window.history.back();
  };

  return html`
    <div className="delete-car">
      <div className="header">
        <span className="exclamation-icon"></span>
      </div>
      <div className="body">
        <p className="heading">${heading}</p>
        <p className="sub-heading">${subHeading}</p>
      </div>

      <div className="footer" style='display:grid'>
       <button
          className="no-btn button button-primary"
          type="button"
           onClick=${(e) => {
    onConfirm();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.delete-car .sub-heading'));
  }}
        >
          ${backBtnPopupCtaTwoLabel}
        </button>
          
        <button
          className="no-btn button button-secondary"
          type="button"
          onClick=${(e) => {
    onCancel();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.delete-car .sub-heading'));
  }}
        >
          ${backBtnPopupCtaOneLabel}
        </button>
         
       
          
      </div>
    </div>
  `;
};

const GoBackFromCustomize = ({
  handleTabClick,
  heading,
  subHeading,
  setShowPopup,
  exitPopupCtaOneLabelEl,
  exitPopupCtaTwoLabelEl,
  renameCarPopCtaLabelEl,
  selectedVariant,
  selectedModel,
  activeTab,
  addedAccessories,
  selectedColor,

}) => {
  const exitPopupCtaOneLabel = exitPopupCtaOneLabelEl?.textContent?.trim() || '';
  const exitPopupCtaTwoLabel = exitPopupCtaTwoLabelEl?.textContent?.trim() || '';
  const renameCarPopCtaLabel = renameCarPopCtaLabelEl?.textContent?.trim() || '';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(async () => {
    const checkStatus = await interaction.isUserLogin();
    setIsLoggedIn(checkStatus);
  }, []);

  const onContinue = () => {
    setShowPopup(false);
    handleTabClick('explore');
  };

  const onConfirm = () => {
    handleTabClick('saveshare');
    setShowPopup(false);
  };

  const onSignIn = async () => {
    interaction.storeDataForConfigModel(
      selectedVariant,
      selectedModel,
      'saveshare',
      addedAccessories,
      selectedColor,
    );
    try {
      await authUtils.login();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setShowPopup(false);
    }
  };

  return html`
    <div class="edit-warning-popup">
      <div class="popup-body">
        <div class="close-popup" onClick=${() => setShowPopup(false)}></div>
        <h3>${heading}</h3>
        <p>${subHeading}</p>
        <div className="ctrl-btns">
         ${isLoggedIn
    ? html`
            <button
            className="sign-in button button-primary"
            type="button"
            onClick=${(e) => {
    onConfirm();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.edit-warning-popup h3'));
  }}
          >
             ${renameCarPopCtaLabel}
          </button>
          `
    : html`
          <button
            className="sign-in button button-primary"
            type="button"
            onClick=${(e) => {
    onSignIn();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.edit-warning-popup h3'));
  }}
          >
            ${exitPopupCtaOneLabel}
          </button>
          `
} 
          <button
            className="continue button button-secondary"
            type="button"
            onClick=${(e) => {
    onContinue();
    configuratorDataLayerUtils.pushClickToDataLayer(e, configuratorDataLayerUtils.getComponentTitle('.edit-warning-popup h3'));
  }}
          >
            ${exitPopupCtaTwoLabel}
          </button>
        </div>
      </div>
    </div>
  `;
};

const Error = ({
  heading, subHeading, setShowPopup, edgeCasePopupCtaOneLabelEl,
}) => {
  const onNext = () => {
    setShowPopup(false);
  };
  const edgeCasePopupCtaOneLabel = edgeCasePopupCtaOneLabelEl?.textContent?.trim() || '';
  return html`
    <div className="delete-car">
      <div className="header">
        <span className="exclamation-icon"></span>
      </div>
      <div class="close-popup" onClick=${() => setShowPopup(false)}></div>
      <div className="body">
        <p className="heading">${heading}</p>
        <p className="sub-heading">${subHeading}</p>
      </div>

      <div className="footer">
        <button
          className="no-btn button button-primary"
          type="button"
          onClick=${onNext}
        >
          ${edgeCasePopupCtaOneLabel}
        </button>
       
      </div>
    </div>
  `;
};

export default Popup;
