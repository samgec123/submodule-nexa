
import { fetchPlaceholders, getMetadata } from "../scripts/aem.js";

/** Domain Utils */

const sdkDetails = {
  dev: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  qa: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  int: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  uat: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  stage: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  prod: '12qn3n7ll2rlh2obhtc72aooqh',
};

const configuration = {
  dev: {
    apiUrl: 'https://jn0nyy4gc1.execute-api.ap-south-1.amazonaws.com/common-crm/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  qa: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  int: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  uat: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  stage: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  prod: {
    apiUrl: 'https://www.cf.msilcrm.co.in/ebook-prod/api/ebook/',
    paymentGateWayUrl: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'AVVO65LB90CC10OVCC',
    datastreamId: '1659483b-5319-4e87-a570-63c9e3ad2eab',
    profileEnabledDataStreamId: '896efaa8-a071-41a5-b150-20fe3faafbd5',
  },

};

const environements = {
  dev: ['localhost', 'msildigital.aem.live', 'dev-arena.marutisuzuki.com', 'dev-nexa.marutisuzuki.com'],
  qa: ['qa-arena.marutisuzuki.com', 'qa-nexa.marutisuzuki.com'],
  int: ['int-arena.marutisuzuki.com', 'int-nexa.marutisuzuki.com'],
  uat: ['uat-arena.marutisuzuki.com', 'uat-nexa.marutisuzuki.com'],
  stage: ['stage-arena.marutisuzuki.com', 'stage-nexa.marutisuzuki.com'],
  prod: ['prod-nexa.marutisuzuki.com', 'nexaexperience.com'],
};

const keyword = Object.keys(environements);
const url = window.location.href;
export const environmentSelection = {
  /**
   * To get the SDK key which is used for AWS Amplify setup
   * This is required for regester and login functionality
   * @returns {SDK Number} string
   */
  getSdkNumber: () => {
    const keyValue = environmentSelection.getEnvironment();
    return sdkDetails[keyValue];
  },
  /**
   * To get the current channel id whether it is nexa or arena
   * @returns {channel id} string
   */
  getChannel: async () => {
    const { channelId } = await fetchPlaceholders();
    return (channelId);
  },
  /**
  * To get the details of the requested value based on environment
  * @param {keyword to get the value} param
  * @returns {requested value} string
  */
  getConfiguration: (param) => {
    let config = '';
    keyword.forEach((value) => {
      environements[value].forEach((val1) => {
        if (environements[value].includes(val1) && url.includes(val1)) {
          config = configuration[value];
        }
      });
    });
    return config[param];
  },
  /**
   * To get the environemnt name on request
   * @returns {environemnt value} string
   */
  getEnvironment: () => {
    let env = '';
    keyword.forEach((value) => {
      environements[value].forEach((val1) => {
        if (environements[value].includes(val1) && url.includes(val1)) {
          env = value;
        }
      });
    });
    return env;
  },
};

/** Auth Utils */

export const authUtils = {
    isAuthPage: () => {
        return getMetadata("isauthenticationrequired") === "true";
    },
    policies: async () => {
        const { authSusiFlow, authIssuer } = await fetchPlaceholders();
        return {
            signUpSignInPolicy: authSusiFlow,
            issuer: authIssuer
        }
    },
    config: async () => {
        const { authClientId, authAuthority, authKnownAuthorities, authRedirectUri } = await fetchPlaceholders();
        return {
            auth: {
                clientId: authClientId,
                authority: authAuthority,
                knownAuthorities: authKnownAuthorities?.split(','),
                redirectUri: authRedirectUri,
                navigateToLoginRequestUrl: localStorage.getItem('isLoginPageFlow') !== 'true',
                postLogoutRedirectUri: location.pathname
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false,
            }
        }
    },
    getInstance: async () => {
        if(window.authInstance) {
            return window.authInstance;
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${window.hlx.codeBasePath}/commons/scripts/vendor/msal-browser.min.js`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = async () => {
                try {
                    const instance = await (msal.PublicClientApplication.createPublicClientApplication(await authUtils.config()));
                    window.authInstance = instance;
                    resolve(instance);
                } catch(error) {
                    reject();
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    login: async (isLoginPage = false) => {
        try {
            if(!isLoginPage) {
                localStorage.removeItem('isLoginPageFlow');
                localStorage.removeItem('loginPageFlowRedirectUri');
            }
            const instance = await authUtils.getInstance();
            if(!(await instance.getActiveAccount())) {
                await instance.loginRedirect();
            }
        } catch(error) {
            throw new Error("Error logging in");
        }
    },
    getToken: async (isInteractionRequired = false) => {
        try {
            const instance = await authUtils.getInstance();
            const account = await instance.getActiveAccount();
            if(!account) {
                return null;
            }
            if(Date.now() < (account.idTokenClaims.exp * 1000)) {
               return account.idToken;
            }
            const request = {};
            try {
                const response = await instance.acquireTokenSilent(request);
                if (!response.idToken || response.idToken === "") {
                    throw new msal.InteractionRequiredAuthError;
                } else {
                    return response.idToken;
                }
            } catch(error) {
                if (error instanceof msal.InteractionRequiredAuthError && isInteractionRequired) {
                    return instance.acquireTokenRedirect(request)
                }
            }
        } catch(error) {
            return null;
        }
        return null;
    },
    getProfile: async () => {
        try {
            const instance = await authUtils.getInstance();
            const claims = (await instance.getActiveAccount())?.idTokenClaims;
            const names = claims.name?.trim()?.split(' ') ?? [];
            return (claims) ? {
                city: claims.City,
                state: claims.State,
                email: claims.EmailAddress?.pop(),
                number: (claims.phoneNumber?.length > 10) ? claims.phoneNumber.replace(/\+91/g, '') : claims.phoneNumber,
                fname: (names[0] === 'unknown') ? '' : names[0] || '',
                lname: (names.length > 1) ? names[names.length - 1] : '',
            } : null;
        } catch(error) {
            return null;
        }
    },
    handleRedirect: async () => {
        const setAuthReady = () => {
            window.AUTH_READY = true;
            document.dispatchEvent(new Event('authready'));
        }
        try {
            const instance = await authUtils.getInstance();
            try {
                const response = await instance.handleRedirectPromise();
                if(response?.account) {
                    await instance.setActiveAccount(response.account);
                    setAuthReady();
                    return response.account;
                }
            } catch(error) {
                setAuthReady();
                return null;
            }
            const accounts = instance.getAllAccounts();
            if(accounts.length <= 0) {
                setAuthReady();
                return null;
            } else if(accounts.length >= 1) {
                await instance.setActiveAccount(accounts[0]);
            } else {
                const policies = await authUtils.policies();
                const config = await authUtils.config();
                const currentAccounts = accounts.filter(account =>
                    account.homeAccountId.toUpperCase().includes(policies.signUpSignInPolicy.toUpperCase())
                    && account.idTokenClaims.iss.toUpperCase().includes(policies.issuer.toUpperCase())
                    && account.idTokenClaims.aud === config.auth.clientId);
                if (currentAccounts.length > 1) {
                    if (currentAccounts.every(account => account.localAccountId === currentAccounts[0].localAccountId)) {
                        await instance.setActiveAccount(currentAccounts[0]);
                    } else {
                        authUtils.logout();
                    };
                } else if (currentAccounts.length === 1) {
                    await instance.setActiveAccount(currentAccounts[0]);
                }
            }
            setAuthReady();
            return (await instance.getActiveAccount());
        } catch(error) {
            setAuthReady();
            return null;
        }
    },
    logout: async () => {
        try {
            const instance = await authUtils.getInstance();
            await instance.logout();
            return true;
        } catch(error) {
            return false;
        }
    },
    waitForAuth: async () => {
        return new Promise((resolve) => {
            if(window.AUTH_READY) {
                resolve();
            } else {
                const handler = () => {
                    resolve();
                    document.removeEventListener('authready', handler);
                };
                document.addEventListener('authready', handler);
            }
        });
    }
}

/** Utility */

export const utility = {
  mobileLazyLoading(element, imgSelector) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const imgElement = element.querySelector(imgSelector);
    if (isMobile && imgElement) {
      imgElement.setAttribute('loading', 'lazy');
    } else if (!isMobile && imgElement) {
      imgElement.setAttribute('loading', 'eager');
    }
  },
  isInternalLink(href) {
    return !/^https?:\/\//i.test(href);
  },

  checkCurrentStep(index) {
    setTimeout(() => {
      const url = new URL(window.location.href);
      const steps = ['select-vehicle', 'select-dealer', 'summary'];
      document.querySelector(`.cmp-ebook-journey__steps__container > span[data-step="${index + 1}"]`)?.classList.add('cmp-ebook-journey__steps--active');
      if (steps.indexOf(url.searchParams.get('step')) === index) {
        for (let i = 0; i <= index; i += 1) {
          document.querySelector(`.cmp-ebook-journey__steps__container > span[data-step="${i}"]`)?.classList.add('cmp-ebook-journey__steps--completed');
        }
        return true;
      }
      return false;
    }, 100);
  },

  sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  },
  formatIndianRupees(number) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });

    const formattedNumber = formatter.format(number);
    const formattedWithSpaces = formattedNumber.replace(/₹/, '₹ '); // Add space after the currency symbol
    return formattedWithSpaces.replace(/,/g, ' '); // Replace commas with spaces
  },
  extractNumber(str) {
    const cleanedString = str?.replace(/\D/g, ''); // Remove non-digits
    return Number(cleanedString);
  },
  isFieldVisible(element) {
    return element.offsetParent !== null;
  },
  toCamelCase(str) {
    return str?.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, (match) => match.toLowerCase());
  },
  async fetchFormSf(file, prefix = 'default') {
    window.formsSf = window.formsSf || {};

    if (!window.formsSf[prefix]) {
      try {
        let url = null;
        if (file) {
          url = `${prefix === 'default' ? '' : prefix}/${file}`;
        } else {
          url = `${prefix === 'default' ? '' : prefix}/form-sf.json`;
        }
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }

        const json = await response.json();
        const formsSf = {};

        // Apply toCamelCase function to each key in the fetched JSON data
        json.data
          .filter((placeholder) => placeholder.Key)
          .forEach((placeholder) => {
            // Log the transformation for debugging purposes

            formsSf[this.toCamelCase(placeholder.Key)] = placeholder.Text;
          });

        window.formsSf[prefix] = formsSf;
        return formsSf;
      } catch (error) {
        window.formsSf[prefix] = {};
        return {};
      }
    }

    return window.formsSf[prefix];
  },

  /**
   * Format Price to Lakhs.
   */
  formatToLakhs(num) {
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(2);
      return `${lakhs} lakhs`;
    }
    return num?.toString();
  },
  formatINR(number) {
    const numStr = Math.floor(number).toString();
    const { length } = numStr;

    if (length <= 3) {
      return numStr;
    }

    const lastThree = numStr.substring(length - 3);
    let rest = numStr.substring(0, length - 3);
    const parts = [];

    while (rest.length > 2) {
      parts.push(rest.substring(rest.length - 2));
      rest = rest.substring(0, rest.length - 2);
    }

    if (rest.length > 0) {
      parts.push(rest);
    }

    const formattedRest = parts.reverse().join(',');
    const formattedNumber = `${formattedRest},${lastThree}`;

    return formattedNumber;
  },
  extractIntegerPart(value) {
    if (value.toString().includes('.')) {
      return Math.floor(value);
    } return value;
  },
  initImage(image, altTextEl) {
    const img = image.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img.setAttribute('alt', alt);
  },
  debounce: (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  addRemoveScrollBarBody: (isAdd) => {
    document.body.style.overflowY = isAdd ? '' : 'hidden';
  },
  setLocalStorage: (data, key) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  getLocalStorage: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  isMobileDevice: () => window.matchMedia('(max-width: 768px)').matches,
  showOverlay() {
    document.querySelector('.menu__bgoverlay').style.display = 'block';
  },
  hideOverlay() {
    document.querySelector('.menu__bgoverlay').style.display = 'none';
  },
  getLinkType(linkElement) {
    const url = new URL(linkElement.href);
    const isDownloadable = linkElement.hasAttribute('download') || /\.(pdf|zip|docx|jpg|png|mp4)$/i.test(url.pathname);
    const isExternal = url.origin !== window.location.origin;
    let linkType;

    if (isDownloadable) {
      linkType = 'download';
    } else if (isExternal) {
      linkType = 'exit';
    } else {
      linkType = 'other';
    }
    return linkType;
  },
  getLocation() {
    return this.getLocalStorage('selected-location')?.cityName || 'Delhi';
  },
  getLanguage(currentPagePath) {
    return currentPagePath.includes('en') ? 'en' : null;
  },
  getSpecificationValue: (data, searchKey) => {
    let result = null;
    data.forEach((category) => {
      category.specificationAspect.forEach((aspect) => {
        if (Object.prototype.hasOwnProperty.call(aspect, searchKey)) {
          result = aspect[searchKey];
        }
      });
    });
    return result;
  },
  getDeviceSpecificVideoUrl: (videoUrl) => {
    const { userAgent } = navigator;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = (/Safari/i).test(userAgent) && !(/Chrome/i).test(userAgent) && !(/CriOs/i).test(userAgent) && !(/Android/i).test(userAgent) && !(/Edg/i).test(userAgent);

    const manifest = (isIOS || isSafari) ? 'manifest.m3u8' : 'manifest.mpd';
    return videoUrl?.replace(/manifest\.mpd|manifest\.m3u8|play/, manifest);
  },
  isEditorMode: (block) => [...block.attributes].find((item) => item.nodeName.startsWith('data-aue-')),
  textContentChecker(text) {
    const textContent = text?.textContent?.trim() || '';
    return textContent;
  },
  async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },
};

export const Viewport = (function initializeViewport() {
  let deviceType;

  const breakpoints = {
    mobile: window.matchMedia('(max-width: 47.99rem)'),
    tablet: window.matchMedia('(min-width: 48rem) and (max-width: 63.99rem)'),
    desktop: window.matchMedia('(min-width: 64rem)'),
  };

  function getDeviceType() {
    if (breakpoints.mobile.matches) {
      deviceType = 'Mobile';
    } else if (breakpoints.tablet.matches) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }
    return deviceType;
  }
  getDeviceType();

  function isDesktop() {
    return deviceType === 'Desktop';
  }
  function isMobile() {
    return deviceType === 'Mobile';
  }
  function isTablet() {
    return deviceType === 'Tablet';
  }
  return {
    getDeviceType,
    isDesktop,
    isMobile,
    isTablet,
  };
}());

/** SEO Utils */

export const seoUtils = {
  getJSON: async () => {
    const carModelName = getMetadata("carmodelname");
    const vin = "XYZ12345VIN";
    const imageUrl = getMetadata("imageurl");
    const carUrl = "pageUrl";
    const price = "1234";
    const priceCurrency = getMetadata("pricecurrency");
    const brandName = getMetadata("brandname");
    const trim = getMetadata("trim");
    const modelYear = getMetadata("modelyear");
    const unitCode = "KM";
    const color = "Red";
    const interiorColor = "Beige";
    const interiorType = "Leather";
    const bodyType = "SUV";
    const fuelType = "Petrol";
    const transmissionType = getMetadata("transmissiontype");
    const numberOfDoors = 5;
    const seatingCapacity = 7;

    // Construct the JSON-LD data with dynamic values
    let jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": carModelName
    };

    // Inject the JSON-LD data into the document
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLdData);
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = reject;
      // document.head.appendChild(script);
      resolve();
    });
  }
};
