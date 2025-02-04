import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import common from '../common.js';
import { useState, useEffect } from '../../../commons/scripts/vendor/preact-hooks.js';
import Popup from '../Popup/Popup.js';
import POPUP_TYPES from '../Popup/constant.js';
import interaction from '../interaction.js';
import { getMetadata } from '../../../commons/scripts/aem.js';
import utility from '../../../utility/utility.js';
import configuratorDataLayerUtils from '../configuratorDataLayerUtils.js';
import authUtils from '../../../commons/utility/authUtils.js';

let clicked = false;

const ConfiguratorHeader = ({
  model,
  selectedVariant,
  backButtonCTAlinkEl,
  exploreTabNameEl,
  customizeTabNameEl,
  saveAbdShareTabNameEl,
  termsAndConditionsTabNameEl,
  termsAndConditionsTextEl,
  activeTab,
  onTabChange,
  selectedModel,
  setSelectedVariant,
  addedAccessories,
  categoriesData,
  selectedColor,
  exitConfiguratorPopupLabelEl,
  exitConfigPopupSubTitleEl,
  exitPopupCtaOneLabelEl,
  exitPopupCtaTwoLabelEl,
  backBtnPopupTitleEl,
  backBtnPopupSubTitleEl,
  backBtnPopupCtaOneLabelEl,
  backBtnPopupCtaTwoLabelEl,
  backPopImageEl,
  backPopImageAltEl,
  renameCarPopCtaLabelEl,
  confirmedVariant,
  setConfirmedVariant,
}) => {
  const [showBack, setShowBack] = useState(false);
  const [isSignedIn, setSignedInStatus] = useState(false);
  const signInText = 'Sign In';
  const signOutText = 'Sign Out';
  const exploreTabName = exploreTabNameEl?.textContent?.trim() || '';
  const customizeTabName = customizeTabNameEl?.textContent?.trim() || '';
  const saveAbdShareTabName = saveAbdShareTabNameEl?.textContent?.trim() || '';
  const termsAndConditionsTabName = termsAndConditionsTabNameEl?.textContent?.trim() || '';
  const termsAndConditionsText = termsAndConditionsTextEl?.textContent?.trim() || '';
  const exitConfiguratorPopupLabel = exitConfiguratorPopupLabelEl?.textContent?.trim() || '';
  const exitConfigPopupSubTitle = exitConfigPopupSubTitleEl?.textContent?.trim() || '';
  const backBtnPopupTitle = backBtnPopupTitleEl?.textContent?.trim() || '';
  const backBtnPopupSubTitle = backBtnPopupSubTitleEl?.textContent?.trim() || '';
  const backBtnPopupCtaOneLabel = backBtnPopupCtaOneLabelEl?.textContent?.trim() || '';
  const backBtnPopupCtaTwoLabel = backBtnPopupCtaTwoLabelEl?.textContent?.trim() || '';
  const backPopImage = backPopImageEl?.getAttribute('src') || '';
  const backPopImageAlt = backPopImageAltEl?.textContent?.trim() || '';
  const [isUserPopupVisible, setUserPopupVisible] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  const toggleContactDetails = () => {
    setShowContactDetails((prevState) => !prevState);
  };

  const handleSignInClick = () => {
    if (isSignedIn) {
      authUtils.logout();
    } else {
      authUtils.login();
    }
  };

  useEffect(() => {
    authUtils.waitForAuth().then(async () => {
      if (await authUtils.getProfile()) {
        setSignedInStatus(true);
      } else {
        setSignedInStatus(false);
      }
    });
  });

  const getModelName = () => getMetadata('car-model-name') || '';

  const handleUserPopup = () => {
    if (utility.supportsTouch()) {
      document.querySelector('.tc-popup').classList.add('hide');
      common.toggleClass('#signInPopup', 'hide');
      common.toggleClass('.config-pop-overlay', 'hide');
    } else {
      document.querySelector('.tc-popup').classList.add('hide');
      document.querySelector('#signInPopup').classList.remove('hide');
    }
  };

  const handleTcPopup = () => {
    if (utility.supportsTouch()) {
      document.querySelector('#signInPopup').classList.add('hide');
      common.toggleClass('.tc-popup', 'hide');
    }
  };
  const handleTcPopupHover = () => {
    document.querySelector('#signInPopup').classList.add('hide');
    document.querySelector('.tc-popup').classList.remove('hide');
    setUserPopupVisible(false);
  };
  const handleTcPopupClose = () => {
    document.querySelector('.tc-popup').classList.add('hide');
  };

  const handleTabClick = async (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    }

    // restore data from local storage if user is logged in
    // const isLoggedIn = await interaction.isUserLogin();
    if (isSignedIn) {
      const modelData = interaction.getDataForConfigModel(selectedModel);
      if (modelData !== undefined) {
        if (modelData?.selectedVariant != null || modelData?.selectedVariant != undefined) {
          setSelectedVariant(modelData?.selectedVariant);
          setConfirmedVariant(modelData?.selectedVariant);
          window.ONE3D?.changeVariant(modelData?.selectedVariant?.variant3dCode);
          window.ONE3D?.changeColor(modelData?.selectedColor?.color3dCode || modelData?.selectedColor?.eColorCd);
        }
      }
      interaction.removeKeyFromModelConfig(selectedModel, 'selectedVariant');
    }
  };

  const handleBackClick = () => {
    setShowBack(true);
  };

  const pushOnFirstClick = (e) => {
    if (!clicked) {
      configuratorDataLayerUtils.pushStartToDataLayer(e, selectedColor, selectedVariant);
      clicked = true;
    }
  };

  const handleTabAction = (tab, e) => {
    window.ONE3D.viewFeatureHotspot(false);

    switch (tab) {
      case 'explore':
        if (window?.ONE3D?.hideAddedAccessories) {
          window?.ONE3D?.hideAddedAccessories();
        }
        window?.ONE3D?.viewFeatureHotspot(true);
        configuratorDataLayerUtils.pushClickToDataLayer(e, getModelName());
        break;
      case 'customise':
        window?.ONE3D?.forceResetMicroInteraction();
        if (window?.ONE3D?.showAddedAccessories) {
          window?.ONE3D?.showAddedAccessories();
        }
        window?.ONE3D?.viewFeatureHotspot(false);
        pushOnFirstClick(e);
        configuratorDataLayerUtils.pushClickToDataLayer(e, getModelName());
        break;
      case 'saveshare':
        configuratorDataLayerUtils.pushClickToDataLayer(e, getModelName());
        configuratorDataLayerUtils.pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories);
        break;
      default:
        break;
    }

    handleTabClick(tab);
  };

  const handleUserPopupClick = () => {
    if (!isUserPopupVisible) {
      handleUserPopup();
    }
    setUserPopupVisible(!isUserPopupVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const userPopup = document.querySelector('#signInPopup');
      // const tcPopup = document.querySelector('.tc-popup');
      if (isUserPopupVisible && !userPopup?.contains(event.target)) {
        setUserPopupVisible(false);
      }
    };

    if (isUserPopupVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserPopupVisible]);

  const handleEmailClick = (event) => {
    event.preventDefault();
    window.open('mailto:contact@nexaexperience.com');
  };

  return html`
    <div class="config-header hide-interection">
      <div class="navbar navbar-nexa">
        <div class="nav-left">
          <div class="back-link" onClick=${handleBackClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <mask
                id="mask0_1699_1984"
                style="mask-type:alpha"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_1699_1984)">
                <path
                  d="M7.373 12.25L13.0693 17.9462L12 19L4.5 11.5L12 4L13.0693 5.05375L7.373 10.75H19.5V12.25H7.373Z"
                  fill="white"
                />
              </g>
            </svg>
          </div>
          <div class="config-links">
            <div
              class="link-title ${activeTab === 'explore'
    ? 'active'
    : ''} overlay_hover no-overlay"
            >
              <span
               onClick=${(e) => handleTabAction('explore', e)}
                >${exploreTabName}</span
              >
            </div>

            ${selectedModel !== 'VE' && html`
            <div
              class="link-title ${activeTab === 'customise'
    ? 'active'
    : ''} overlay_hover no-overlay"
            >
              <span
                onClick=${(e) => handleTabAction('customise', e)}
                >${customizeTabName}</span
              >
            </div>
            <div
              class="link-title ${activeTab === 'saveshare'
    ? 'active'
    : ''} overlay_hover no-overlay"
            >
              <span
                onClick=${(e) => handleTabAction('saveshare', e)}
                >${saveAbdShareTabName}</span
              >
            </div>`}


          </div>
        </div>

        <div class="right" id="nav-right">
        ${!utility.isCarConfigSmView() && html`<div class="tc-block" onClick=${handleTcPopup} onMouseEnter=${handleTcPopupHover}
            onMouseLeave=${handleTcPopupClose}>
             <span  class="tc-link">${termsAndConditionsTabName}</span>
          </div>
          <div class="tc-popup hide" onMouseEnter=${handleTcPopupHover}
            onMouseLeave=${handleTcPopupClose}>
              <h3>Terms & Conditions</h3>
              <p>
                *Accessories and features shown may not be a part of standard
                equipment. *As certified by Test Agency Under Rule 115 (G) of
                CMVR 1989.
              </p>
               <p>
                **Car colors shown may not be available across all
                variants.
              </p>
              <p>
              *Car images shown are of top variant and for illustration purposes only.
              </p>
              <p>
              Accessories and features may not be part of standard equipment
              </p>
            </div>
          `}
          ${!utility.isCarConfigSmView() && html`<div class="user-setting-btn" onClick=${handleUserPopupClick}>
          <div
            id="user-img-config"
            class="overlay_click no-overlay"
          ></div>
          </div>`}
      
          
          <div id="signInPopup" class=${`sign-in-wrapper ${isUserPopupVisible ? '' : 'hide'}`}>
            <div
              class="sign-in block"
              data-block-name="sign-in"
              data-block-status="loaded"
            >
              <div class="user__dropdown">
                <div class="sign-in-teaser">
                  <div class="sign-in-teaser__desc">
                    <div class="sign-in-teaser__desc-content">
                      <h4 id="get-personalised-recommendations">
                        Get personalised recommendations
                      </h4>
                      <p>Sign in to save your preferences and more</p>
                    </div>
                    <a
                      href="https://author-p71852-e1137339.adobeaemcloud.com/content/eds-universal-editor/us/en/nexa-header-test.html"
                      class="sign-in-teaser--link"
                      target="_self"
                    >
                      Sign in <span class="sign-in-teaser--arrow"></span>
                    </a>
                    
                  </div>
                  <div class="sign-in-teaser__image">
                    <img
                      src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:193d360f-23e2-4836-b5bd-d5aa607015b4/as/nexa-teaser-signin-right-img.jpg?height=157&width=750"
                      loading="lazy"
                      alt="Mobile"
                    />
                  </div>
                </div>
                <div class="user__account">
                ${selectedModel !== 'VE' && html`<button
                    class="user__account--link hide-sm"
                    target="_self"
                    type="button"
                    onClick=${handleSignInClick}
                  >
                   <span class="user__account__list-icon">
                      <img
                        src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:55f3d7a5-78e3-4156-ae1c-f51275222dc3/as/account_circle.svg?width=750"
                        loading="lazy"
                        alt="Desktop"
                      />
                    </span>
                    
                    ${(isSignedIn) ? signOutText : signInText}
                  </button>`}
                  <a
                    href="https://www.nexaexperience.com/contact-us"
                    class="user__account--link"
                    target="_self"
                  >
                    <span class="user__account__list-icon">
                      <img
                        src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:c56e8f49-7995-42b2-91f3-c63190308d3e/as/call_24dp_FILL0_wght300_GRAD0_opsz24-1.svg?width=750"
                        loading="lazy"
                        alt="icon"
                      />
                    </span>
                    Reach Us
                  </a>
                </div>
                <div class="contact-wrapper">
                  <div
                    class="contact block"
                    data-block-name="contact"
                    data-block-status="loaded"
                  >
                    <div class="user__contact">
                      <h4 id="contact-us" class="user__contact-title">
                        Contact Us
                      </h4>
                      <div class="user__contact__icons">
                        <button
                          class="user__contact--icon-text phone"
                          aria-label="Contact Us"
                          onClick=${toggleContactDetails}
                        >
                          <img
                            src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:c56e8f49-7995-42b2-91f3-c63190308d3e/as/call_24dp_FILL0_wght300_GRAD0_opsz24-1.svg?width=750"
                            alt="Phone"
                            loading="lazy"
                          />
                        </button>
                        <a
                          href="https://wa.me/919289311488?text=Hi"
                          target="_blank"
                          class="user__contact--icon-text whatsapp"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:4e34cfe1-472c-4e40-96f7-1398fbf926f7/as/ic_baseline-whatsapp.svg?width=750"
                            alt="whatsapp"
                            loading="lazy"
                          />
                        </a>
                        <a
                          href="mailto:contact@nexaexperience.com"
                          class="user__contact--icon-text email"
                          onClick=${handleEmailClick}
                        >
                          <img
                            src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:6f085c25-01b7-4ed2-b260-63edff19f024/as/outgoing_mail.svg?width=750"
                            alt="email"
                            loading="lazy"
                          />
                        </a>
                      </div>
                      ${showContactDetails && html`
                        <div class="contact-details-phone">
                          <p>1800-102-6392 <span class="contact-separator">|</span> 1800-200-6392</p>
                        </div>
                      `}
                        <div class="user__contact__icon-call_container hidden">
                          <a href="tel:1800-102-6392" class="primary-telephone"
                            >1800-102-6392</a
                          >
                          <p class="separator"></p>
                          <a href="tel:1800-200-6392" class="secondary-telephone"
                            >1800-200-6392</a
                          >
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        ${showBack && activeTab === 'explore'
    && html`<${Popup}
      type=${POPUP_TYPES.GOBACK}
      setShowPopup=${setShowBack}
      heading=${backBtnPopupTitle}
      subHeading=${backBtnPopupSubTitle}
      backBtnPopupCtaOneLabel=${backBtnPopupCtaOneLabel}
      backBtnPopupCtaTwoLabel=${backBtnPopupCtaTwoLabel}
    />`}

      ${showBack && activeTab === 'customise'
    && html`<${Popup}
      type=${POPUP_TYPES.GOBACKFROMCUSTOMIZE}
      setShowPopup=${setShowBack}
      heading=${exitConfiguratorPopupLabel}
      subHeading=${exitConfigPopupSubTitle}
      handleTabClick=${handleTabClick}
      exitPopupCtaOneLabelEl=${exitPopupCtaOneLabelEl}
      exitPopupCtaTwoLabelEl=${exitPopupCtaTwoLabelEl}
      renameCarPopCtaLabelEl=${renameCarPopCtaLabelEl}
      selectedVariant=${selectedVariant}
      addedAccessories=${addedAccessories}
      selectedColor=${selectedColor}
      activeTab=${activeTab}
      selectedModel=${selectedModel}
    />`}
    </div>
  `;
};

export default ConfiguratorHeader;
