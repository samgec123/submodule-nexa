/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../vendor/htm-preact.js';
import { useContext, useRef, useEffect, useState } from '../../vendor/preact-hooks.js';
import { getCleanSessionData, hnodeAs, MultiStepFormContext } from '../multi-step-form.js';
import apiUtils, {
  updateEbookUserSession,
  formatRupeesWithSymbol,
} from '../../../utility/apiUtils.js';
import FeaturesModal from './featuresModal.js';
import CarInfo from './car-info.js';
import BookingStep from '../booking-step.js';
import EbookStep from '../ebook-steps.js';
import { fetchPlaceholders } from '../../aem.js';
import environmentSelection from '../../../utility/domainUtils.js';
import { getLocalStorage } from '../../../utility/localStorage.js';
import analytics from '../../../../utility/analytics.js';
import utility from '../../../utility/utility.js';
import utill from '../../../../utility/utility.js';


function SelectVehicle({ config }) {
  const { formState,
    updateFormState,
    handleSetActiveRoute,
    placeholders,
    getUserSessionApi,
  } = useContext(MultiStepFormContext);
  const formRef = useRef();
  const [vehicle, setVehicle] = useState('');
  const [vehicleList, setVehicleList] = useState([]);
  const [variant, setVariant] = useState('');
  const [variantList, setVariantList] = useState([]);
  const [color, setColor] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorList, setColorList] = useState([]);
  const [selectedModel, setSelectedModel] = useState({});
  const [selectedVariant, setSelectedVariant] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [features, setFeatures] = useState([]);
  const [selectedColorImage, setSelectedColorImage] = useState('');
  const [userSession, setuserSession] = useState(null);
  const [exShowRoomList, setExShowRoomList] = useState([]);
  const [colorType, setColorType] = useState('');
  const [exshowroomPrice, setExshowroomPrice] = useState('');
  const [currrentPosition, setCurrentPosition] = useState(1);
  const maxColor = 8;

      /* analytics */
      async function analyticsFormStepSubmit(stepData) {
        const details = {};
        details.formName = 'E-Book';
        details.webName = 'Next';
        details.linkType = 'other';
        details.userInfo = {
          authenticatedState: 'authenticated',
        };
        if (stepData?.SESSION_INFO?.userProfile?.phoneNumber) {
          details.identities = {
            // eslint-disable-next-line max-len
            hashedphoneSHA256: await utill.getSHA256Hash(stepData?.SESSION_INFO?.userProfile?.phoneNumber),
          };
        }
        const dataLayerObj = {
          enquiryStepName: 'Car Details',
          custName: stepData?.SESSION_INFO?.userProfile?.name || '',
          model: stepData?.SESSION_INFO?.selectedCar.modelDesc || '',
          variant: stepData?.SESSION_INFO?.selectedCar.variantDesc || '',
          color: stepData?.SESSION_INFO?.selectedCar.cmsColorDesc || '',
          fuelType: stepData?.SESSION_INFO?.selectedCar.fuelType || '',
          bookingAmount: stepData?.SESSION_INFO?.selectedCar.bookingAmount || '',
        };
        analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
      }
    
      async function analyticsLinkClick(linkName) {
        const details = {};
        details.componentName = 'Ebook Select Vehicle';
        details.componentTitle = 'Vehicle Details';
        details.componentType = 'link';
        details.webName = linkName;
        details.linkType = 'other';
        details.userInfo = {
          authenticatedState: 'authenticated',
        };
        const phoneNumber = localStorage.getItem('ebookNumber');
        if (phoneNumber) {
          details.identities = {
            hashedphoneSHA256: await utill.getSHA256Hash(phoneNumber),
          };
        }
        analytics.setButtonDetails(details);
      }
  /* user session api  */

  const updateUserSessionApi = async (direction, amount) => {
    const selectedCar = {
      userCarPreference: null,
      userProfile: {
        name: localStorage.getItem('ebookUserName') || '',
        phoneNumber: localStorage.getItem('ebookNumber'),
      },
      selectedCar: {
        variantCd: selectedVariant.variantCd || '',
        variantDesc: selectedVariant.variantDesc || '',
        cmsColorCode: color || '',
        cmsColorDesc: colorName || '',
        hexColorCd: colorList.find((c) => c.code === color)?.hex || '',
        fuelType: selectedVariant.fuelType || '',
        fuelTypeDesc: selectedVariant.fuelTypeDesc || '',
        imageUrl: selectedColorImage,
        modelCd: selectedModel.split(':')?.[1] || '',
        modelDesc: selectedModel.split(':')?.[0] || '',
        bookingAmount: amount,
        preBookFlag: false,
        // eslint-disable-next-line max-len
        exShowroomPrice: exshowroomPrice,
      },
    };
    const payloadData = {
      SESSION_INFO: selectedCar,
    };
    // update ebook multistep form context state
    updateFormState((currentState) => ({
      ...currentState,
      selectVehicleStep: selectedCar,
    }));
    sessionStorage.setItem('ebookFormState', JSON.stringify({ ...formState, selectVehicleStep: selectedCar }));
    localStorage.setItem('ebookVehicleDetils', JSON.stringify({ transmission: `${selectedVariant?.transmission}`, variantName: `${selectedVariant?.variantName}` }));
    await updateEbookUserSession('selectVehicleStep', payloadData);
    await analyticsFormStepSubmit(payloadData);
    if (direction === 'previous') {
      handleSetActiveRoute('select-vehicle');
    } else {
      handleSetActiveRoute('select-dealer');
    }
  };

  const getExShowRoom = async () => {
    const { apiExShowroomDetail: globalApiUrl,
      defaultForCode,
      publishDomain,
    } = await fetchPlaceholders();
    const url = publishDomain + await globalApiUrl;
    const selectedLocation = JSON.parse(getLocalStorage('selected-location'))?.forCode || defaultForCode;
    const params = `?forCode=${selectedLocation}&channel=${await environmentSelection.getChannel()}&variantInfoRequired=true`;
    const response = await fetch(url + params);
    const data = await response.json();
    try {
      if (!data.error) {
        setExShowRoomList(data.data.models);
      } else {
        throw data.error;
      }
    } catch (err) {
      setExShowRoomList([]);
    }
  };

  const fetchVehicle = async () => {
    try {
      const response = await apiUtils.getModelList('EXC');
      setVehicleList(response);
    } catch (error) {
      setVehicleList([]);
    }
  };

  const fetchVariant = async (modelCd) => {
    try {
      if (!modelCd) {
        setVariantList([]);
        return;
      }
      const response = await apiUtils.getCarVariantsByModelCode(modelCd);
      if (!response) {
        throw new Error('Invalid response from getCarVariantsByModelCode');
      }
      setVariantList(response);
    } catch (error) {
      setVariantList([]);
    }
  };

  const getExShowRoomPrice = (selecteVariantVal) => {
    let variantVal = selecteVariantVal;
    if (variantVal === null) {
      variantVal = selecteVariantVal?.selectedCar?.variantCd;
    }
    exShowRoomList?.forEach((model) => {
      if (model.modelCd === vehicle) {
        model?.exShowroomDetailResponseDTOList.forEach((variants) => {
          if (variants.variantCd === variantVal && colorType === variants.colorType) {
            setExshowroomPrice(variants.exShowroomPrice);
          }
        });
      }
    });
  };

  useEffect(() => {
    if (colorList.length) {
      if (maxColor <= colorList.length) {
        document.querySelector('.cmp-select-vehicle__color-swatches-list .right').classList.remove('disable');
        document.querySelector('.cmp-select-vehicle__color-swatches-list .left').classList.add('disable');
      } else {
        document.querySelector('.cmp-select-vehicle__color-swatches-list .right').classList.add('disable');

        document.querySelector('.cmp-select-vehicle__color-swatches-list .left').classList.add('disable');
      }
    }
  }, [colorList]);
  const fetchColors = (variantCd) => {
    try {
      if (!variantCd) {
        setColorList([]);
        return;
      }
      const selectedVariantJson = variantList.find((v) => v.variantCd === variantCd);
      if (selectedVariantJson && selectedVariantJson.colors) {
        const formattedColors = selectedVariantJson.colors.map((colorJSON) => {
          if (colorJSON.isDefault === 'Yes' && !userSession) {
            setSelectedColorImage(colorJSON?.carColorImage?._dynamicUrl || '');
            setColorName(colorJSON.eColorDesc);
            setColor(colorJSON.colorId);
            setColorType(colorJSON.colorType);
            getExShowRoomPrice(userSession?.selectedCar?.variantCd);
          }
          return {
            code: colorJSON.colorId,
            name: colorJSON.eColorDesc,
            hex: colorJSON.hexCode[0],
            colorType: colorJSON.colorType,
            imageUrl: colorJSON?.carColorImage?._dynamicUrl || '',
            defaultSelected: colorJSON.isDefault === 'Yes',
          };
        });
        setColorList(formattedColors);
      } else {
        setColorList([]);
      }
    } catch (error) {
      setColorList([]);
    }
  };

  const generateUserSession = async (session) => {
    if (session) {
      setVehicle(session?.selectedCar?.modelCd);
      if (session?.selectedCar?.modelCd.trim() !== '') {
        document.querySelector('select[name="vehicle"]')?.classList.add('selected');
      }
      if (session?.selectedCar?.variantCd !== '' && session?.selectedCar?.variantCd) {
        await fetchVehicle();
        fetchColors(session?.selectedCar?.variantCd, session);
        setVariant(session?.selectedCar?.variantCd);
        if (session?.selectedCar?.variantCd.trim() !== '') {
          document.querySelector('select[name="variant"]')?.classList.add('selected');
        }
        getExShowRoomPrice(session?.selectedCar?.variantCd);
        setColor(session?.selectedCar?.cmsColorCode);
        setColorName(session?.selectedCar?.cmsColorDesc);
        setSelectedColorImage(session?.selectedCar?.imageUrl);
        setExshowroomPrice(session?.selectedCar?.exShowroomPrice);
        document.querySelector('.cmp-ebook-journey__booking-amount').classList.add('show');
      }
    }
  };

  const getUserSession = async () => {
    if (!document.querySelector('body').classList.contains('session-stored')) {
      const response = await getUserSessionApi();
      setuserSession(response);
      generateUserSession(response);
      document.querySelector('body').classList.add('session-stored');
    } else {
      console.log(getCleanSessionData()?.SESSION_INFO);
      setuserSession(getCleanSessionData()?.SESSION_INFO);
      generateUserSession(getCleanSessionData()?.SESSION_INFO);
      document.querySelector('body').classList.add('session-stored');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('body').classList.remove('overflow-hidden');
    fetchVehicle();
    getUserSession();
    getExShowRoom();
    utility?.checkCurrentStep(0);
  }, []);

  useEffect(() => {
    if (vehicle) {
      fetchVariant(vehicle);
      const selectedVehicle = vehicleList.find((v) => v.split(':')?.[1] === vehicle);
      setSelectedModel(selectedVehicle || {});
    } else {
      setVariantList([]);
      setColorList([]);
      setSelectedModel({});
      setSelectedVariant({});
    }
  }, [vehicle, vehicleList]);

  useEffect(() => {
    if (variant) {
      fetchColors(variant, userSession);
      getExShowRoomPrice(variant);
      const selectedVariantJSON = variantList.find((v) => v.variantCd === variant);
      setSelectedVariant(selectedVariantJSON || {});
      if (selectedVariantJSON && selectedVariantJSON.carFeatures) {
        const groupedFeatures = selectedVariantJSON.carFeatures.reduce((acc, feature) => {
          const category = acc.find((cat) => cat.category === feature.feature.category);
          if (category) {
            category.items.push(feature.feature);
          } else {
            acc.push({ category: feature.feature.category, items: [feature.feature] });
          }
          return acc;
        }, []);
        setFeatures(groupedFeatures);
      } else {
        setFeatures([]);
      }
    } else {
      setColorList([]);
      setFeatures([]);
    }
  }, [variant, variantList]);

  const handleSelectVehicle = (e) => {
    setVehicle(e.target.value);
    if (e.target.value.trim() !== '') {
      e.target.classList.add('selected');
    }
    setVariant('');
    document.querySelector('select[name="variant"]')?.classList.remove('selected');
    document.querySelector('.cmp-ebook-journey__booking-amount').classList.remove('show');
    setColor('');
    setSelectedVariant({});
  };

  const handleSelectVariant = (e) => {
    const selectedVariantCode = e.target.value;
    if (e.target.value.trim() !== '') {
      e.target.classList.add('selected');
    }
    setVariant(selectedVariantCode);
    document.querySelector('.cmp-ebook-journey__booking-amount').classList.add('show');
    const selectedVariantJSON = variantList.find((v) => v.variantCd === selectedVariantCode);
    setSelectedVariant(selectedVariantJSON || {});
  };

  const handleSelectColor = (colorJSON) => {
    setColor(colorJSON.code);
    setColorName(colorJSON.name);
    setColorType(colorJSON.colorType);
    getExShowRoomPrice(variant);
    setSelectedColorImage(colorJSON?.imageUrl || '');
  };

  const showColors = (direction) => {
    const currentWidth = document.querySelector('.cmp-select-vehicle__color-swatches-container').clientWidth;
    const coveredColor = ((colorList.length + 1) * 48) - 32;
    if (direction === 'next' && ((currrentPosition + maxColor) <= colorList.length || currentWidth + (currrentPosition * 48) <= coveredColor)) {
      setCurrentPosition((current) => current + 1);
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${currrentPosition})`)?.classList.add('hide');
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${currrentPosition})`)?.previousSibling?.classList.add('hide');
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${currrentPosition})`)?.nextElementSibling?.classList.remove('hide');
    } else if (direction === 'prev' && currrentPosition >= 1) {
      setCurrentPosition((current) => {
        let val = current;
        if (val === 1) {
          val = 1;
        } else {
          val -= 1;
        }
        return val;
      });
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${colorList.length - currrentPosition - 1})`)?.classList.remove('hide');
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${currrentPosition - 1})`)?.classList.remove('hide');
      document.querySelector(`.cmp-select-vehicle__color-box:nth-of-type(${currrentPosition - 1})`)?.nextSibling.classList.remove('hide');
    }
    if (currrentPosition + maxColor >= colorList.length && direction === 'next') {
      document.querySelector('.cmp-select-vehicle__color-swatches-list .right').classList.add('disable');
      document.querySelector('.cmp-select-vehicle__color-swatches-list .left').classList.remove('disable');
    } else {
      document.querySelector('.cmp-select-vehicle__color-swatches-list .left').classList.add('disable');
      document.querySelector('.cmp-select-vehicle__color-swatches-list .right').classList.remove('disable');
    }
  };
  return html`
    <${FeaturesModal} isOpen=${modalOpen} onClose=${() => { setModalOpen(false); document.querySelector('body').classList.remove('overflow-hidden'); }} features=${features} selectedModel=${selectedVariant} config=${config} vehicleDetails=${selectedModel} modelDetails=${selectedVariant?.variantName} />
    <div class="cmp-select-vehicle">
      <form ref=${formRef}>
        <${EbookStep} config=${config}/>
        <div class="cmp-select-vehicle__divider"></div>
        <div class="cmp-select-vehicle__container">
          <div class="cmp-select-vehicle__panel cmp-select-vehicle__panel--left">
            <div class="cmp-select-vehicle__panel-container">
              <h2>${hnodeAs(config.headingLabel)}</h2>
              <div class="cmp-select-vehicle__dropdown">
                <select name="vehicle" value=${vehicle} onChange=${handleSelectVehicle}>
                  ${hnodeAs(config.vechileLabel, 'option', { value: '' })}
                  ${vehicleList.map((item, index) => html`
                    <option key=${index} value=${item.split(':')[1]}>
                      ${item.split(':')[0]}
                    </option>
                  `)}
                </select>
              </div>
              <div class="select-variant__dropdown">
                <select name="variant" value=${variant} onChange=${handleSelectVariant}>
                  ${hnodeAs(config.variantLabel, 'option', { value: '' })}
                  ${variantList.map((item, index) => html`
                    <option key=${index} data-name=${item.variantName} value=${item.variantCd}>
                      ${item.variantDesc}
                    </option>
                  `)}
                </select>
              </div>
              <div class="cmp-select-vehicle__color-swatches">
                <span>${hnodeAs(config.colorLabel)} </span>
                <div class="cmp-select-vehicle__color-swatches-list">
                <button type="button" class="left" onclick=${() => showColors('prev')}></button>
                <div class="cmp-select-vehicle__color-swatches-container">
                ${!colorList.length ? [0, 1, 2, 3, 4, 5, 6, 7].map(() => html`<div class="cmp-select-vehicle__color-box empty"></div>`)
    : colorList.map((colorJSON, index) => html`
                  <div
                    class="cmp-select-vehicle__color-box ${colorJSON.code === color ? 'cmp-select-vehicle__color-box--selected' : ''}"
                    onClick=${() => handleSelectColor(colorJSON)}
                    title="${colorJSON.name}"
                    key="${index}"
                    style="background-color: ${colorJSON.hex}">
                    <p>${colorJSON.name}</p>
                  </div>`)}
                </div>
                <button type="button" class="right" onclick=${() => showColors('next')}></button>
                </div>
              </div>
            </div>
          </div>
          <div class="cmp-select-vehicle__panel cmp-select-vehicle__panel--right">
            <div class="cmp-select-vehicle__panel-container">
              ${variant && html`
                <h3>${hnodeAs(config.vehicleHeadingLabel)}</h2>
                <div class="cmp-select-vehicle__vehicle-card">
                  <div class="cmp-select-vehicle__vehicle-info">
                  <div>
                    <div class="cmp-select-vehicle__specs__price-container">
                        <div class="cmp-select-vehicle__specs">
                          <h3>${selectedModel?.split(':')[0]} <span>( ${selectedVariant?.variantName} )</span></h3>
                          <span>${selectedVariant.transmission?.toUpperCase() || 'NA'}</span>
                          <span>${selectedVariant.fuelType?.toUpperCase() || 'FUEL TYPE'}</span>
                        </div>
                        <div class="cmp-select-vehicle__price">
                          <h3>${formatRupeesWithSymbol(exshowroomPrice)}/-</h3>
                          <p>${hnodeAs(config.exshowroomLabel)}</p>
                        </div>
                    </div>
                    <div class="cmp-select-vehicle__feature-links">
                     ${hnodeAs(config.featureDetails, 'a', { href: '#', onClick: (e) => { e.preventDefault(); setModalOpen(true); analyticsLinkClick('Feature Details'); } })}
                     ${hnodeAs(config.downloadBrochure, 'a', { href: selectedVariant.brochure?._dmS7Url, target: '_blank', onClick: () => { analyticsLinkClick('Download Brochure'); } })}
                    </div>
                    </div>
                    <div class="cmp-select-vehicle__car-preview">
                    <img src="${placeholders.publishDomain}${selectedColorImage}" alt="Car Preview" class="cmp-select-vehicle__car-image"/>                 
                    </div>
                  </div>
                </div>
                <${CarInfo} config=${config} selectedVariant=${selectedVariant}  placeholders=${placeholders} />
              `}
              ${!variant && html`
                ${hnodeAs(config.defaultImage, 'picture')}
              `}
            </div>
          </div>
        </div>
        <${BookingStep} config=${config} previousUpdateUserSession=${(e, amount) => updateUserSessionApi('previous', amount)}  nextUpdateUserSession=${(e, amount) => updateUserSessionApi('next', amount)} />
      </form>
    </div>
  `;
}

SelectVehicle.parse = (block) => {
  // eslint-disable-next-line max-len
  const [headingWrapper, colorWrapper, vechileWrapper, variantWrapper, vehicleHeadingWrapper, exshowroomWrapper, featureDetailsWrapper, downloadBrochureWrapper, defaultImageWrapper, topFeaturesWrapper, featuresHeadingWrapper] = [...block.children].map((row) => row.firstElementChild);
  const [headingLabel] = [...headingWrapper.children];
  const [colorLabel] = [...colorWrapper.children];
  const [vehicleHeadingLabel] = [...vehicleHeadingWrapper.children];
  const [exshowroomLabel] = [...exshowroomWrapper.children];
  const [featureDetails] = [...featureDetailsWrapper.children];
  const [downloadBrochure] = [...downloadBrochureWrapper.children];
  const [defaultImage] = [...defaultImageWrapper.children];
  const [vechileLabel] = [...vechileWrapper.children];
  const [variantLabel] = [...variantWrapper.children];
  const [topFeaturesLabel] = [...topFeaturesWrapper.children];
  const [featuresModalHeading] = [...featuresHeadingWrapper.children];
  // eslint-disable-next-line max-len
  return { headingLabel, colorLabel, vehicleHeadingLabel, exshowroomLabel, featureDetails, downloadBrochure, defaultImage, vechileLabel, variantLabel, topFeaturesLabel, featuresModalHeading };
};

SelectVehicle.defaults = {
  headingLabel: html`<p>Select the dream car you wish to purchase.</p>`,
  colorLabel: html`<p>Choose a colour</p>`,
  vehicleHeadingLabel: html`<p>Vechile Details</p>`,
  exshowroomLabel: html`<p>Ex-showroom Price</p>`,
  featureDetails: html`<p>Feature Details</p>`,
  downloadBrochure: html`<p>Download Brochure</p>`,
  defaultImage: html``,
};

export default SelectVehicle;
