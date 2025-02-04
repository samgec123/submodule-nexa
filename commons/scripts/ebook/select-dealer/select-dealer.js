import { html } from '../../vendor/htm-preact.js';
import {
  useContext,
  useEffect,
  useState,
} from '../../vendor/preact-hooks.js';
import { MultiStepFormContext } from '../multi-step-form.js';
import initMethod from './initMap.js';
import apiUtils, { updateEbookUserSession } from '../../../utility/apiUtils.js';
import { loadCSS } from '../../aem.js';
import EbookStep from '../ebook-steps.js';
import BookingStep from '../booking-step.js';
import analytics from '../../../../utility/analytics.js';
import utility from '../../../utility/utility.js';
import util from '../../../../utility/utility.js';

const radiusData = [5, 10, 15, 20, 25];

function SelectDealer({ config }) {
  loadCSS(
    `${window.hlx.commonsCodeBasePath}/scripts/ebook/select-dealer/select-dealer.css`,
  );

  const {
    dealerTitle,
    dealerTitle2,
    pincodeTitle,
    cityTitle,
    radiusTitle,
    dealerErrorMsg,
  } = config;
  const {
    formState, updateFormState, handleSetActiveRoute, getUserSessionApi,
  } = useContext(MultiStepFormContext);
  const [cityList, setCityList] = useState('');
  const [statesList, setStatesList] = useState([]);
  const [pinCode, setPinCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [dealerList, setDealerList] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [showDetails, setShowDetails] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toggleInfo] = useState({});
  const [distance, setDistance] = useState(5);

  const getUserSession = async () => {
    if (!document.querySelector('body').classList.contains('session-stored')) {
      await getUserSessionApi();
      document.querySelector('body').classList.add('session-stored');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    getUserSession();
    utility.checkCurrentStep(1);
  }, []);

  const fetchCities = async () => {
    try {
      const response = await apiUtils.getCitiesList();
      if (response) {
        setCityList(response);
      }
    } catch (error) {
      console.log('error..', error);
    }
  };
  async function analyticsLinkClick() {
    const details = {};
    details.componentName = 'Ebook Dealer';
    details.componentTitle = 'Dealer';
    details.componentType = 'link';
    details.webName = 'Directions';
    details.linkType = 'other';
    details.userInfo = {
      authenticatedState: 'authenticated',
    };
    const phoneNumber = localStorage.getItem('ebookNumber');
    if (phoneNumber) {
      details.identities = {
        hashedphoneSHA256: await util.getSHA256Hash(phoneNumber),
      };
    }
    analytics.setButtonDetails(details);
  }
  async function analyticsFormStepSubmit() {
    const localGetSessionApiData = JSON.parse(
      sessionStorage.getItem('ebookPostState'),

    );
    const details = {};
    details.formName = 'E-Book';
    details.webName = 'Next';
    details.linkType = 'other';
    details.userInfo = {
      authenticatedState: 'authenticated',
    };
    if (localGetSessionApiData?.sessionInfo?.userProfile?.phoneNumber) {
      details.identities = {
        // eslint-disable-next-line max-len
        hashedphoneSHA256: await util.getSHA256Hash(localGetSessionApiData?.sessionInfo?.userProfile?.phoneNumber),
      };
    }
    const dataLayerObj = {
      enquiryStepName: 'Dealer',
      custName: localGetSessionApiData?.sessionInfo?.userProfile?.name || '',
      model: localGetSessionApiData?.sessionInfo?.selectedCar.modelDesc || '',
      variant: localGetSessionApiData?.sessionInfo?.selectedCar.variantDesc || '',
      color: localGetSessionApiData?.sessionInfo?.selectedCar.cmsColorDesc || '',
      dealer: localGetSessionApiData?.sessionInfo?.selectedDealer.name || '',
      state: localGetSessionApiData?.sessionInfo?.selectedDealer.address?.stateName || '',
      city: localGetSessionApiData?.sessionInfo?.selectedDealer.address?.cityName || '',
      pincode: localGetSessionApiData?.sessionInfo?.selectedDealer.address?.pincode || '',
      radius: localGetSessionApiData?.sessionInfo?.userDealerPreference.radius || '',
      fuelType: localGetSessionApiData?.sessionInfo?.selectedCar?.fuelType || '',
      bookingAmount: localGetSessionApiData?.sessionInfo?.selectedCar?.bookingAmount,
    };
    analytics.setEnquirySubmitDetails(details, dataLayerObj, true);
  }
  const fetchStates = async () => {
    try {
      const response = await apiUtils.getDealerStateList();
      if (response) {
        setStatesList(response);
      }
    } catch (error) {
      console.log('error..', error);
    }
  };

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      script.async = true;
      document.head.appendChild(script);
    });
  }

  useEffect(async () => {
    let InitCurrentCity;
    await fetchStates();
    await fetchCities();
    loadScript('https://apis.mappls.com/advancedmaps/api/42aae41575509fec2b3d3a42760a81db/map_sdk?layer=vector&v=3.0&callback=initMap1').then(() => {
      initMethod(28.61275005371764, 77.23087398009862, []);
    })
      .catch(() => {
        console.log('error');
      });

    const locationInterval = setInterval(async () => {
      if (document.querySelector('.location-btn') !== null) {
        InitCurrentCity = document
          .querySelector('.location-btn')
          .textContent.trim();
        setSelectedCity(InitCurrentCity.toUpperCase());
        setCurrentCity(InitCurrentCity.toUpperCase());
        clearInterval(locationInterval);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const getCurrentCity = async () => {
      const latiResp = cityList.find(
        (entry) => entry.cityDesc === currentCity,
      )?.latitude;
      setLatitude(latiResp);
      const longResp = cityList.find((entry) => entry.cityDesc === currentCity)?.longitude;
      setLongitude(longResp);
      const dealersState = cityList.find(
        (entry) => entry.cityDesc === currentCity,
      )?.stateDesc;
      setSelectedState(dealersState);
      const location = { latitude: latiResp, longitude: longResp, pinCode: null };
      try {
        const response = await apiUtils.getGeoLocation(location);
        if (response) {
          setPinCode(response[0]?.pinCd);
        }
      } catch (error) {
        console.log('error..', error);
      }
    };
    if (cityList.length > 0 && currentCity) {
      getCurrentCity();
    }
  }, [cityList, currentCity]);

  const handleDealerList = async (radius) => {
    const dist = radius * 1000;
    const radios = document.querySelectorAll('input[name="options"]');
    const dealerType = 'S';
    // eslint-disable-next-line no-return-assign
    radios.forEach((radio) => (radio.checked = false));
    try {
      const response = await apiUtils.getNearestDealers(
        latitude,
        longitude,
        dist,
        dealerType,
      );
      if (response.length > 0) {
        setDealerList(response);
        const addr = response.map((entry) => [
          entry.name,
          entry.distance,
          entry.addr1 + entry.addr2 + entry.addr3,
          entry.phone,
          entry.latitude,
          entry.longitude,
          entry.superMail,
          entry.dealerUniqueCd,
        ]);
        setAddress(addr);
        const latLongArray = response.map((entry) => [
          parseFloat(entry.latitude),
          parseFloat(entry.longitude),
        ]);
        initMethod(latLongArray[0][0], latLongArray[0][1], latLongArray);
      } else if (radius < 25) {
        setDistance(radius + 5);
        handleDealerList(radius + 5);
      }
    } catch (error) {
      console.log('error..', error);
    }
  };

  useEffect(() => {
    if (latitude && longitude && isInitialLoad) {
      handleDealerList(distance);
      setIsInitialLoad(false);
    }
  }, [latitude, longitude]);

  const handlePrevious = async () => {
    handleSetActiveRoute('select-vehicle');
  };

  // eslint-disable-next-line consistent-return
  const handleNext = async (e) => {
    e.preventDefault();
    const errorNext = document.querySelector('.error-next');
    errorNext.style.visibility = 'hidden';
    const selectedData = document.querySelector(
      "input[name='options']:checked",
    )?.value;

    if (selectedData === undefined) {
      errorNext.style.visibility = 'visible';
    } else {
      const selectedDealerDetails = dealerList.find(
        (entry) => entry.dealerUniqueCd === selectedData,
      );
      const name = localStorage.getItem('ebookUserName');
      const nextDistance = document.getElementById('radius').value;
      const localGetSessionApiData = JSON.parse(
        sessionStorage.getItem('ebookPostState'),
      );
      const { modelDesc } = localGetSessionApiData.sessionInfo.selectedCar;
      const { variantDesc } = localGetSessionApiData.sessionInfo.selectedCar;
      const phone = localGetSessionApiData.mobileNumber;

      const LQSdata = {
        name,
        phone,
        model: modelDesc,
        variant: variantDesc,
        dealerCode: selectedDealerDetails.forCd,
        dealerForCode: selectedDealerDetails.dealerUniqueCd,
        sourceIdentifier: 'BRAND',
      };
      const apiUrl = 'https://jn0nyy4gc1.execute-api.ap-south-1.amazonaws.com/common-crm/api/ebook/delegate/v1/lqs-portal/saveLQSDataApi';

      const token = localStorage.getItem('ebookToken');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token,
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(LQSdata),
        });
        if (!response.ok) {
          throw new Error('Api response was not ok');
        }
        await response.json();
      } catch (error) {
        return error || null;
      }

      const addr1 = selectedDealerDetails.addr1 != null ? selectedDealerDetails.addr1 : '';
      const addr2 = selectedDealerDetails.addr2 != null ? selectedDealerDetails.addr2 : '';
      const addr3 = selectedDealerDetails.addr3 != null ? selectedDealerDetails.addr3 : '';

      const selectedDealer = {
        selectedDealer: {
          id: selectedDealerDetails.dealerUniqueCd,
          code: selectedDealerDetails.consgCd,
          name: selectedDealerDetails.name,
          email: selectedDealerDetails.superMail,
          address: {
            addressLine1: addr1,
            addressLine2: addr2,
            addressLine3: addr3,
            stateCode: selectedDealerDetails.stateCd,
            stateName: selectedDealerDetails.stateDesc,
            cityCode: selectedDealerDetails.cityCd,
            cityName: selectedDealerDetails.cityDesc,
            pincode: selectedDealerDetails.pin,
            latitude: selectedDealerDetails.latitude,
            longitude: selectedDealerDetails.longitude,
            completeAddress:
              selectedDealerDetails.addr1
              + selectedDealerDetails.addr2
              + selectedDealerDetails.addr1,
          },
          phone: selectedDealerDetails.phone,
          forCode: selectedDealerDetails.forCd,
          mapCd: selectedDealerDetails.mapCd,
          locCd: selectedDealerDetails.locCd,
          parentGrp: selectedDealerDetails.parentGrp,
          mainOutletAccountId: selectedDealerDetails.dealerUniqueCd,
          tsmEmail: null,
        },
        userDealerPreference: {
          radius: nextDistance,
          latitude: selectedDealerDetails.latitude,
          longitute: selectedDealerDetails.longitude,
        },
        lqsLastRequestDate: Date.now(),
        lqsSelectedDealerId: selectedDealerDetails.dealerUniqueCd,
      };

      const payloadData = {
        SESSION_INFO: selectedDealer,
      };

      // update ebook multistep form context state
      updateFormState((currentState) => ({
        ...currentState,
        selectDealerStep: selectedDealer,
      }));
      sessionStorage.setItem(
        'ebookFormState',
        JSON.stringify({
          ...formState,
          selectDealerStep: selectedDealer,
        }),
      );
      await updateEbookUserSession('selectDealerStep', payloadData);
      await analyticsFormStepSubmit(payloadData);
      handleSetActiveRoute('summary');
    }
  };

  const toggleData = (addressId) => {
    const arrowDir = document.getElementById(`arrow-toggle${addressId}`);
    arrowDir.classList.toggle('transform0');
    setShowDetails(!showDetails);

    if (toggleInfo[addressId]) {
      toggleInfo[addressId] = false;
    } else {
      toggleInfo[addressId] = true;
    }
  };

  const handleSelectCity = async (e) => {
    setSelectedCity(e.target.value);
    const latiResp = cityList.find(
      (entry) => entry.cityDesc === e.target.value,
    )?.latitude;
    setLatitude(latiResp);
    const longResp = cityList.find(
      (entry) => entry.cityDesc === e.target.value,
    )?.longitude;
    setLongitude(longResp);
    const dealersState = cityList.find(
      (entry) => entry.cityDesc === e.target.value,
    )?.stateDesc;
    setSelectedState(dealersState);
    const location = { latitude: latiResp, longitude: longResp, pinCode: null };
    try {
      const response = await apiUtils.getGeoLocation(location);
      if (response) {
        setPinCode(response[0].pinCd);
      }
    } catch (error) {
      console.log('error..', error);
    }
  };

  const getCity = async (pinCode1) => {
    const pin = pinCode1 || document.getElementById('pinCode').value;
    const errorMessage = document.getElementById('errorMessage');
    if (pin.length === 6) {
      errorMessage.style.display = 'none';
      const location = { pinCode: pin };
      try {
        const response = await apiUtils.getGeoLocation(location);
        if (response) {
          setSelectedCity(response[0].cityDesc);
          setPinCode(response[0].pinCd);
          setLatitude(response[0].latitude);
          setLongitude(response[0].longitude);
          const dealersState = cityList.find(
            (entry) => entry.cityDesc === response[0].cityDesc,
          )?.stateDesc;
          setSelectedState(dealersState);
        }
      } catch (error) {
        console.log('error..', error);
      }
    } else {
      errorMessage.style.display = 'block';
    }
  };
  const getLoc = async (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const posLatitude = position.coords.latitude;
          const posLongitude = position.coords.longitude;
          const location = {
            latitude: posLatitude.toString(),
            longitude: posLongitude.toString(),
            pinCode: null,
          };
          try {
            const response = await apiUtils.getGeoLocation(location);
            if (response) {
              setPinCode(response[0].pinCd);
              getCity(response[0].pinCd);
            }
          } catch (error) {
            console.log('error..', error);
          }
        },
        (error) => {
          console.error(`Error Code: ${error.code}, Message: ${error.message}`);
        },
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };

  const handlePointDealer = (lat, long) => {
    initMethod(lat, long, [[lat, long]]);
  };

  return html`
    <${EbookStep} />
    <div class="select-dealer-container">
      <div class="form-container">
        <form>
          <div class="form-left">
            <div class="select-dealer-step-title">
              <div class="page-title">
              ${dealerTitle}<p> ${address.length} </p>${dealerTitle2}
              </div>
            </div>
          </div>
          <div class="form-right">
            <div class="select-city-container">
              <div class="ebook-select" id="pinId">
                <p>${pincodeTitle}</p>
                <div class="pin-text">
                  <input
                    type="text"
                    id="pinCode"
                    class="pinCode"
                    name="pincode"
                    maxlength="6"
                    pattern="\d{6}"
                    value=${pinCode}
                    onChange=${() => getCity()}
                  />
                  <button id="locator" onClick=${(e) => getLoc(e)}></button>
                </div>
                  <span id="errorMessage" style="color: red; display: none;font-size:10px">Please enter exactly correct pincode</span>
              </div>
              <div class="separator"></div>
              <div class="ebook-select">
                <p>STATE</p>
                <select
                  name="states"
                  id="dealerStates"
                  value="${selectedState || statesList[0]?.STATE_DESC}"
                >
                  ${statesList.length > 0
                  && statesList.map(
                    (item, index) => html`
                      <option key="${index}" value="${item.STATE_DESC}">
                        ${item.STATE_DESC}
                      </option>
                    `,
                  )}
                </select>
              </div>
              <div class="separator"></div>
              <div class="ebook-select">
                <p>${cityTitle}</p>
                <select
                  name="cities"
                  id="dealerCity"
                  value="${selectedCity || cityList[0]?.cityDesc}"
                  onChange=${(e) => handleSelectCity(e)}
                >
                  ${cityList.length > 0
                  && cityList.map(
                    (item, index) => html`
                      <option key="${index}" value="${item.cityDesc}">
                        ${item.cityDesc}
                      </option>
                    `,
                  )}
                </select>
              </div>
              <div class="separator"></div>
              <div class="ebook-select">
                <p>${radiusTitle}</p>
                <select name="radius" value="${distance}" id="radius">
                  ${radiusData.length
                  && radiusData.map(
                    (item) => html`
                      <option key="${item}" value="${item}" onClick="${() => setDistance(item)}">${item} Km</option>
                    `,
                  )}
                </select>
              </div>
              <div class="search-button-container">
                <button
                  type="button"
                  onClick=${() => handleDealerList(distance)}
                  class="searchButton"
                ></button>
              </div>
            </div>
            <div class="search-button-container-mobile">
                <button
                  type="button"
                  onClick=${() => handleDealerList(distance)}
                  class="searchButtonMobile"
                >Search</button>
              </div>
          </div>
        </form>
        <div class="addressContainer">
          <div class="addressSection">
            ${address.length
    ? address.map(
      (item) => html`
                    <div>
                      <section class="display-flex">
                        <label class="display-flex"
                          ><input
                            type="radio"
                            class="dealer-radio"
                            name="options"
                            value=${item[7]}
                            onClick=${() => analyticsLinkClick()}
                          />
                          <h6 class="dealerName" onClick="${() => handlePointDealer((item[5]), (item[4]))}">${item[0]}</h6></label
                        >
                      </section>
                      <p class="dealerDistance">${(item[1] / 1000).toFixed(2)} Km Away</p>
                      <p class="dealerAddress"> ${item[2].split('null').filter((addr) => addr.trim() !== '').join(', ')}</p>
                      <section class="phone-section">
                        <section class="center-align-items">
                          <span class="phone-icon"></span>
                          <a href="tel:${item[3]}" class="dealerPhone"
                            >${item[3]}</a
                          >
                        </section>
                        <section>
                          <a
                            href="https://www.google.com/maps/dir/current+location/${item[4]},${item[5]}"
                            target="_blank"
                            >Directions</a
                          >
                          <span class="arrow-icon"></span>
                        </section>
                      </section>

                      ${toggleInfo[item[7]]
                      && html` <section
                        id="time-section"
                        class="center-align-items"
                      >
                        <span class="time-icon"></span>
                        <p class="dealerTime">
                          <span class="green-color">Open</span> | Till 10PM
                        </p>
                      </section>`}

                      <section class="arrow-section">
                        <span
                          onClick=${() => toggleData(item[7])}
                          id=${`arrow-toggle${item[7]}`}
                          class="address-arrow"
                        ></span>
                      </section>
                    </div>
                  `,
    )
    : null}
          </div>
          <div id="map" class="mmi-map"></div>
        </div>
      </div>
      <span class="error-next">${dealerErrorMsg}</span>
      <${BookingStep}
        display="true"
        config=${config}
        previousUpdateUserSession=${(e) => handlePrevious(e)}
        nextUpdateUserSession=${(e) => handleNext(e)}
      />
    </div>
  `;
}

SelectDealer.parse = (block) => {
  const [buttonsWrapper,
    dealerWrapper,
    dealerWrapper2,
    pincodeTitleWrapper,
    cityTitleWrapper,
    directionsWrapper,
    radiusTitleWrapper,
    dealerErrorMsgWrapper] = [...block.children].map(
    (row) => row.firstElementChild,
  );

  const [dealerTitle] = [...dealerWrapper.children];
  const [dealerTitle2] = [...dealerWrapper2.children];
  const [pincodeTitle] = [...pincodeTitleWrapper.children];
  const [cityTitle] = [...cityTitleWrapper.children];
  const [radiusTitle] = [...radiusTitleWrapper.children];
  const [directions] = [...directionsWrapper.children];
  const [dealerErrorMsg] = [...dealerErrorMsgWrapper.children];

  const [
    prevButton,
    submitButton,
  ] = [...buttonsWrapper.children];

  return {
    dealerTitle,
    dealerTitle2,
    pincodeTitle,
    cityTitle,
    radiusTitle,
    directions,
    dealerErrorMsg,
    submitButton,
    prevButton,
  };
};

SelectDealer.defaults = {
  dealerTitle: html`<p>Select a Dealership from the </p>`,
  dealerTitle2: html` <p> Dealerships near you</p>`,
  pincodeTitle: html`<p>PINCODE</p>`,
  cityTitle: html`<p>CITY</p>`,
  radiusTitle: html`<p>WITHIN A RADIUS OF</p> `,
  directions: html`<p>Directions</p> `,
  dealerErrorMsg: html`<p> Dealer is not selected</p> `,
  prevButton: html`<p>Previous</p> `,
  submitButton: html`<p>Next</p> `,
};

export default SelectDealer;
