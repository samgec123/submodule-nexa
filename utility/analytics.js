import utility from './utility.js';
import { getMetadata } from '../commons/scripts/aem.js';

const getDigitalData = () => ({
  event: null,
  // eslint-disable-next-line no-underscore-dangle
  _maruti: {
    pageInfo: {
      language: null,
      city: null,
    },
    userInfo: {
      authenticatedState: null,
    },
  },
  web: {
    webPageDetails: {
      URL: null,
      name: null,
      server: null,
      siteSection: null,
    },
    webInteraction: {
      name: null,
      type: null,
    },

  },
});

const analytics = {

  setPageDetails(eventType, pageDetails) {
    const digitalData = getDigitalData();
    const cityName = utility.getLocalStorage('selected-location')?.cityName || document.querySelector('.location-btn')?.dataset?.cityName || 'Delhi';
    const selectedLanguage = getMetadata('language') || 'en';
    const siteSection = utility.getSiteSection();

    digitalData.event = eventType;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.pageInfo.city = cityName;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.pageInfo.language = selectedLanguage;
    if (pageDetails?.userInfo?.authenticatedState === 'authenticated') {
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.userInfo.authenticatedState = 'authenticated';
    } else {
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.userInfo.authenticatedState = 'unauthenticated';
    }
    if (pageDetails?.identities?.hashedphoneSHA256) {
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.identities = {
        hashedphoneSHA256: pageDetails?.identities?.hashedphoneSHA256,
      };
    }

    digitalData.web.webPageDetails.URL = window.location.href;
    digitalData.web.webPageDetails.name = document.title;
    digitalData.web.webPageDetails.server = window.location.hostname;
    digitalData.web.webPageDetails.siteSection = siteSection;

    const linkType = (typeof pageDetails.linkType === 'string') ? pageDetails.linkType : utility.getLinkType(pageDetails.linkType);
    digitalData.web.webInteraction.name = pageDetails.webName.trim();
    digitalData.web.webInteraction.type = linkType;
    digitalData.producedBy = 'EDS';

    if (window.hashedphoneSHA256) {
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.identities = {
        hashedphoneSHA256: window.hashedphoneSHA256,
      };
    }
    return digitalData;
  },

  setClickInfoDetails(data, pageDetails) {
    // eslint-disable-next-line no-underscore-dangle
    data._maruti.clickInfo = {
      componentType: pageDetails.componentType.trim(),
      componentName: pageDetails.componentName.trim(),
    };
  },

  setCarConfigInfo(data, pageDetails) {
    // eslint-disable-next-line no-underscore-dangle
    data._maruti.enquiryInfo = {
      enquiryName: pageDetails.enquiryName.trim(),
      model: pageDetails.model.trim(),
      variant: pageDetails.variant.trim(),
      color: pageDetails.color.trim(),
    };
  },
  setCarConfigSaveInfo(data, pageDetails) {
    // eslint-disable-next-line no-underscore-dangle
    data._maruti.enquiryInfo = {
      enquiryName: pageDetails.enquiryName.trim(),
      model: pageDetails.model.trim(),
      variant: pageDetails.variant.trim(),
      color: pageDetails.color.trim(),
      configuratorAccessories: pageDetails.configuratorAccessories,
      savedCarName: pageDetails?.savedCarName?.trim(),
    };
  },
  setSavedConfigInfo(data, pageDetails) {
    // eslint-disable-next-line no-underscore-dangle
    data._maruti.enquiryInfo = {
      enquiryName: pageDetails.enquiryName.trim(),
      savedCarName: pageDetails.savedCarName.trim(),
    };
  },

  setButtonDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.linkClicks', pageDetails);
    analytics.setClickInfoDetails(digitalData, pageDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo.componentTitle = pageDetails.componentTitle.trim();
    window.adobeDataLayer.push(digitalData);
  },

  setHeaderNavigation(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.headerNavigation', pageDetails);
    analytics.setClickInfoDetails(digitalData, pageDetails);
    window.adobeDataLayer.push(digitalData);
  },

  setFooterNavigation(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.footerNavigation', pageDetails);
    analytics.setClickInfoDetails(digitalData, pageDetails);
    window.adobeDataLayer.push(digitalData);
  },

  setColorChangeDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.carColorChange', pageDetails);
    analytics.setClickInfoDetails(digitalData, pageDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.carInfo = {
      model: pageDetails.carModelName,
      color: pageDetails.carColorName,
    };
    window.adobeDataLayer.push(digitalData);
    // Send the event to Adobe Target with custom data
    const carModelValue = `profile.${pageDetails.carModelName}`;
    alloy('sendEvent', {
      renderDecisions: true,
      xdm: { eventType: 'decisioning.propositionFetch' },
      data: {
        __adobe: {
          target: {
            [carModelValue]: pageDetails.carColorName,
          },
        },
      },
      decisionScopes: ['__view__'],
    }).then((result) => {
      console.log('Event sent successfully:', result);
    }).catch((error) => {
      console.error('Error sending event:', error);
    });
  },

  setEnquiryStartDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.enquiryStart', pageDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.enquiryInfo = {
      enquiryName: pageDetails.formName,
    };
    window.adobeDataLayer.push(digitalData);
  },

  setWebError(pageDetails) {
    const digitalData = this.setPageDetails('web.error', pageDetails);
    const enquiryInfo = {};
    const errorInfo = {};

    if (pageDetails.formName) {
      enquiryInfo.enquiryName = pageDetails.formName;
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.enquiryInfo = enquiryInfo;
    }
    if (pageDetails.errorField) {
      enquiryInfo.errorField = pageDetails.errorField;
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.enquiryInfo = enquiryInfo;
    }
    if (pageDetails.errorType) {
      errorInfo.errorType = pageDetails.errorType;
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.errorInfo = errorInfo;
    }
    if (pageDetails.errorDetails) {
      errorInfo.errorDetails = pageDetails.errorDetails;
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.errorInfo = errorInfo;
    }
    if (pageDetails.errorCode) {
      errorInfo.errorCode = pageDetails.errorCode.toString();
      // eslint-disable-next-line no-underscore-dangle
      digitalData._maruti.errorInfo = errorInfo;
    }
    window.adobeDataLayer.push(digitalData);
  },

  async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  async setEnquirySubmitDetails(pageDetails, enquiryExtras = {}, isStep = false) {
    const hashedPhoneNumber = await this.sha256(pageDetails.phoneNumber);
    let event = 'web.webinteraction.enquirySubmit';
    if (isStep) {
      event = 'web.webinteraction.enquiryStepSubmit';
    }
    const digitalData = this.setPageDetails(event, pageDetails);
    const enquiryInfo = {};
    enquiryInfo.enquiryName = pageDetails.formName;
    if (pageDetails.state) {
      enquiryInfo.state = pageDetails.state;
    }
    if (pageDetails.city) {
      enquiryInfo.city = pageDetails.city;
    }
    if (pageDetails.custName) {
      enquiryInfo.custName = pageDetails.custName;
    }
    if (pageDetails?.customerDetails) {
      digitalData._maruti.customerDetails = pageDetails.customerDetails;
    }
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.enquiryInfo = { ...enquiryInfo, ...enquiryExtras };
    digitalData._maruti.identities = {
        phoneNumber: pageDetails.phoneNumber,
        hashedphoneSHA256: hashedPhoneNumber
    };
    if(pageDetails.email !== undefined) {
        digitalData._maruti.identities.email = pageDetails.email;
    }
    const consents = {
      marketing: {},
    };
    if (pageDetails.whatsapp) {
      const obj = {
        whatsapp: {
          val: pageDetails.whatsapp,
        },
      };
      // eslint-disable-next-line no-underscore-dangle
      consents.marketing._maruti = obj;
      digitalData.consents = consents;
    }
    if (pageDetails.call) {
      consents.marketing.call = {
        val: pageDetails.call,
      };
      digitalData.consents = consents;
    }
    if (pageDetails.sms) {
      consents.marketing.sms = {
        val: pageDetails.sms,
      };
      digitalData.consents = consents;
    }
    window.adobeDataLayer.push(digitalData);
  },

  async setVerifyOtpDetails(pageDetails) {
    const hashedPhoneNumber = await this.sha256(pageDetails.phoneNumber);
    const digitalData = this.setPageDetails('web.webinteraction.verifyOTP', pageDetails);
    this.setClickInfoDetails(digitalData, pageDetails);
    digitalData._maruti.identities = {
        phoneNumber: pageDetails.phoneNumber,
        hashedphoneSHA256: hashedPhoneNumber
    };
    window.adobeDataLayer.push(digitalData);
  },

  setCompareCarsDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.compareCars', pageDetails);
    this.setClickInfoDetails(digitalData, pageDetails);
    digitalData._maruti.compareCarsInfo = {
      variant: pageDetails.selectedCarVariants,
    };
    window.adobeDataLayer.push(digitalData);
  },
  setcustomizeStart(pageDetails) {
    const digitalData = this.setPageDetails('web.webInteraction.carConfigurator', pageDetails);
    analytics.setCarConfigInfo(digitalData, pageDetails);
    window.adobeDataLayer.push(digitalData);
  },
  setCustomizeSave(pageDetails) {
    const digitalData = this.setPageDetails('web.webInteraction.carConfigurator', pageDetails);
    analytics.setCarConfigSaveInfo(digitalData, pageDetails);
    window.adobeDataLayer.push(digitalData);
  },
  setSavedConfigDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webInteraction.carConfigurator', pageDetails);
    analytics.setSavedConfigInfo(digitalData, pageDetails);
    window.adobeDataLayer.push(digitalData);
  },
  setVideoDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.videoPlay', pageDetails);

    const videoInfo = {};
    if (pageDetails.mediaPlatform) {
      videoInfo.mediaPlatform = pageDetails.mediaPlatform;
    }
    if (pageDetails.videoName) {
      videoInfo.videoName = pageDetails.videoName;
    }
    if (pageDetails.milestonePercentage) {
      videoInfo.milestonePercentage = pageDetails.milestonePercentage;
    }

    const clickInfo = {};
    clickInfo.componentTitle = pageDetails.componentTitle.trim();

    digitalData._maruti.videoInfo = videoInfo;
    digitalData._maruti.clickInfo = clickInfo;

    window.adobeDataLayer.push(digitalData);
  },
  setSearchDetails(pageDetails) {
    const digitalData = this.setPageDetails('web.webinteraction.search', pageDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo ??= {};
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo.componentName = pageDetails.componentName;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo.componentType = pageDetails.componentType;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.searchInfo = { searchTerm: pageDetails.searchTerm, numOfSearchResults: pageDetails.numOfSearchResults };
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push(digitalData);
  },
  setSearchItemDetails(searchItemDetails) {
    const { clickInfo, searchResultInfo } = searchItemDetails;
    const digitalData = this.setPageDetails('web.webinteraction.search', searchItemDetails);
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.clickInfo = clickInfo;
    // eslint-disable-next-line no-underscore-dangle
    digitalData._maruti.searchResultInfo = searchResultInfo;
    //  { searchTerm: searchItemDetails.searchTerm, numOfSearchResults: searchItemDetails.numOfSearchResults };
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push(digitalData);
  },
};

export default analytics;
