import { fetchPlaceholders, getMetadata, loadScript, loadCSS } from '../commons/scripts/aem.js';

/** Utils */

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

  /**
   * Format Price to Lakhs.
   */
  formatToLakhs(num) {
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(2);
      return `${lakhs}`;
    }
    return num.toString();
  },

  isInternalLink(href) {
    return !/^https?:\/\//i.test(href);
  },

  sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  },

  isFieldVisible(element) {
    return element.offsetParent !== null;
  },

  toggleAccordion(block, header) {
    const allContents = block.querySelectorAll('.accordian-content');
    const allHeaders = block.querySelectorAll('.accordian-header');

    allContents.forEach((content) => {
      if (content !== header.nextElementSibling) {
        content.style.maxHeight = null;
        content.classList.remove('open');
      }
    });

    allHeaders.forEach((h) => {
      if (h !== header) {
        h.classList.remove('open');
      }
    });

    const content = header.nextElementSibling;

    if (content.classList.contains('open')) {
      content.style.maxHeight = null;
      content.classList.remove('open');
    } else {
      content.classList.add('open');
      content.style.maxHeight = `${content.scrollHeight}px`;
    }

    header.classList.toggle('open');
  },

  getCookieValue: (cookieName) => {
    const name = `${cookieName}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookie.split(';');

    for (const element of cookiesArray) {
      const cookie = element.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length).replace('MCMID|', '');
      }
    }
    return null;
  },

  setLocalStorage: (data, key) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getLocalStorage: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  isMobileDevice: () => window.matchMedia('(max-width: 768px)').matches,

  getLinkType(linkElement) {
    let url = window.location;
    if (linkElement?.href !== null && linkElement?.href !== undefined && linkElement?.href !== '') {
      url = new URL(linkElement.href);
    }
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

  getSiteSection() {
    let siteSection;
    const url = window.location.href;
    if (url.includes('arena')) {
      siteSection = 'Arena';
    } else if (url.includes('nexa')) {
      siteSection = 'Nexa';
    } else {
      siteSection = 'Nexa';
    }
    return siteSection;
  },
  modifyStringToSentenceCasing(inputString) {
    const words = inputString.split(' ');
    const modifiedWords = words.map((word) => {
      if (/^[A-Z]{2}$/.test(word)) {
        return word.toUpperCase();
      }
      if (/^[A-Z]+(\.)?$/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      if (word.includes('.')) return word.toUpperCase();
      if (word.length === 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return modifiedWords.join(' ');
  },

  formatAddress(dealer) {
    const addressParts = [
      dealer.addr1?.replace(/,$/, ''),
      dealer.addr2?.replace(/,$/, ''),
      dealer.addr3?.replace(/,$/, ''),
    ].filter(Boolean);

    addressParts.forEach((part, partIndex) => {
      if (part.includes(dealer.cityDesc)) {
        const lastCommaIndex = part.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
          const preAddress = addressParts[partIndex].substring(0, lastCommaIndex);
          addressParts[partIndex] = `${preAddress} ${dealer.cityDesc}`;
        } else if (addressParts[partIndex].split(' ').length > 2) {
          const preAddress = addressParts[partIndex].substring(0, addressParts[partIndex].lastIndexOf(' '));
          addressParts[partIndex] = `${preAddress} ${dealer.cityDesc}`;
        } else {
          addressParts[partIndex] = dealer.cityDesc;
        }
      }
      addressParts[partIndex] = addressParts[partIndex].replace(dealer.cityDesc, '').trim();
    });

    let fullAddress = addressParts.join(', ');
    const cityDescPart = dealer.cityDesc;
    const pinPart = dealer.pin;
    let addrLine3 = '';

    if (cityDescPart || pinPart) {
      addrLine3 += `${cityDescPart}${cityDescPart && pinPart ? '-' : ''}${pinPart}.`;
    }

    fullAddress = fullAddress
      .replace(/\s*,\s*/g, ', ')
      .replace(/,\s*,+/g, ', ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    fullAddress = fullAddress.endsWith(',') ? fullAddress : `${fullAddress},`;

    const parts = fullAddress.split(',');
    const midIndex = Math.floor(parts.length / 2);
    let addrLine1 = parts.slice(0, midIndex).join(',').trim();
    let addrLine2 = parts.slice(midIndex).join(',').trim();

    addrLine1 = addrLine1.replace(/,+$/, '').trim();
    addrLine2 = addrLine2.replace(/,+$/, '').trim();

    addrLine1 = `${addrLine1.replace(/\s*,\s*/g, ', ')},`;
    addrLine2 = `${addrLine2.replace(/\s*,\s*/g, ', ')},`;

    const city = `${addrLine3.split('-')[0].trim().toUpperCase()},`;
    if (addrLine2.trim().endsWith(city)) {
      addrLine2 = `${addrLine2.slice(0, -city.length).trim()}`;
    }

    return {
      addrLine1: addrLine1.trim(),
      addrLine2: addrLine2.trim().length > 1 ? addrLine2.trim() : '',
      addrLine3: addrLine3.trim(),
    };
  },
  getSelectedLocation: () => {
    try {
      return JSON.parse(localStorage.getItem('selected-location'));
    } catch (e) {
      return {};
    }
  },
  formatCurrency: (price) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    const formattedPrice = formatter.format(price).replace('', ' ');
    return formattedPrice;
  },
  getScrollHighlightsAssetPrefix: async (modelPath, data) => {
    const obj = window.scrollHighlightsAssetPath ?? {};
    const getPrefix = (path) => path.substring(
      path.lastIndexOf('/'),
      path.lastIndexOf('_') + 1,
    );
    const updateAndGetPrefix = (modelData) => {
      // eslint-disable-next-line no-underscore-dangle
      const path = modelData.scrollHighlightsAssetPath?._dmS7Url || '';
      // eslint-disable-next-line no-underscore-dangle
      const mobilePath = modelData.scrollHighlightsAssetPathMobile?._dmS7Url || path || '';
      obj[modelPath] = {
        prefix: getPrefix(path),
        mobilePrefix: getPrefix(mobilePath),
      };
      window.scrollHighlightsAssetPath = obj;
      return window.scrollHighlightsAssetPath[modelPath];
    };
    if (data) {
      return updateAndGetPrefix(data);
    }
    if (obj[modelPath]?.prefix) {
      return obj[modelPath];
    }
    return updateAndGetPrefix(await apiUtils.getCarModelByPath(modelPath));
  },
  initializeTooltip(block, isMobile) {
    let activeTooltip = null;
    setTimeout(() => {
      block.querySelectorAll('.tooltip-container').forEach((container) => {
        const tooltip = container.querySelector('.tooltip');
        const textElement = container.querySelector('.tooltip-text');
        let rect = textElement.getBoundingClientRect();
        let tooltipRect = tooltip.getBoundingClientRect();
        const isOverflowing = textElement.scrollWidth > textElement.clientWidth;

        const showTooltip = () => {
          if (tooltip.classList.contains('top-start')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - 15}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - 15}px`;
            }
            if (rect.height > tooltipRect.height) {
              tooltip.style.top = `${-rect.height - 5}px`;
            } else {
              tooltip.style.top = `${-tooltipRect.height - 5}px`;
            }
          } else if (tooltip.classList.contains('top-end')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - ((tooltipRect.width * 89) / 100)}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 89) / 100)}px`;
            }
            if (rect.height > tooltipRect.height) {
              tooltip.style.top = `${-rect.height - 5}px`;
            } else {
              tooltip.style.top = `${-tooltipRect.height - 5}px`;
            }
          } else if (tooltip.classList.contains('top-center')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - ((tooltipRect.width * 45) / 100)}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 45) / 100)}px`;
            }
            if (rect.height > tooltipRect.height) {
              tooltip.style.top = `${-rect.height - 5}px`;
            } else {
              tooltip.style.top = `${-tooltipRect.height - 5}px`;
            }
          } else if (tooltip.classList.contains('bottom-start')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - 30}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - 30}px`;
            }
            tooltip.style.top = `${(rect.height) + 10}px`;
          } else if (tooltip.classList.contains('bottom-end')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - ((tooltipRect.width * 85) / 100)}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 85) / 100)}px`;
            }
            tooltip.style.top = `${(rect.height) + 10}px`;
          } else if (tooltip.classList.contains('bottom-center')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${rect.width - tooltipRect.width / 2}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - tooltipRect.width / 2}px`;
            }
            tooltip.style.top = `${(rect.height) + 10}px`;
          } else if (tooltip.classList.contains('left')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${-((tooltipRect.width * 105) / 100)}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) - ((tooltipRect.width * 105) / 100)}px`;
            }
            tooltip.style.top = `${-((rect.height * 30) / 100)}px`;
          } else if (tooltip.classList.contains('right')) {
            if (rect.left === tooltipRect.left) {
              tooltip.style.left = `${(rect.width * 110) / 100}px`;
            } else {
              tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + ((rect.width * 110) / 100)}px`;
            }
            tooltip.style.top = `${-((rect.height * 30) / 100)}px`;
          }

          if (isOverflowing) {
            tooltip.classList.add('show');
          }
        };
        const hideTooltip = (tooltipToRemove) => {
          tooltipToRemove.classList.remove('show');
        };

        if (isMobile) {
          rect = textElement.getBoundingClientRect();
          tooltipRect = tooltip.getBoundingClientRect();
          textElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeTooltip && (activeTooltip !== tooltip)) {
              hideTooltip(activeTooltip);
            }
            if (isOverflowing && (activeTooltip !== tooltip)) {
              tooltip.classList.add('show');
              activeTooltip = tooltip;
            } else {
              hideTooltip(tooltip);
              activeTooltip = null;
            }
            if (tooltip.classList.contains('top-start')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - 15}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - 15}px`;
              }
              if (rect.height > tooltipRect.height) {
                tooltip.style.top = `${-rect.height - 5}px`;
              } else {
                tooltip.style.top = `${-tooltipRect.height - 5}px`;
              }
            } else if (tooltip.classList.contains('top-end')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - ((tooltipRect.width * 83) / 100)}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 83) / 100)}px`;
              }
              if (rect.height > tooltipRect.height) {
                tooltip.style.top = `${-rect.height - 5}px`;
              } else {
                tooltip.style.top = `${-tooltipRect.height - 5}px`;
              }
            } else if (tooltip.classList.contains('top-center')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - ((tooltipRect.width * 45) / 100)}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 45) / 100)}px`;
              }
              if (rect.height > tooltipRect.height) {
                tooltip.style.top = `${-rect.height - 5}px`;
              } else {
                tooltip.style.top = `${-tooltipRect.height - 5}px`;
              }
            } else if (tooltip.classList.contains('bottom-start')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - 30}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - 30}px`;
              }
              tooltip.style.top = `${(rect.height) + 10}px`;
            } else if (tooltip.classList.contains('bottom-end')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - ((tooltipRect.width * 85) / 100)}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - ((tooltipRect.width * 85) / 100)}px`;
              }
              tooltip.style.top = `${(rect.height) + 10}px`;
            } else if (tooltip.classList.contains('bottom-center')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${rect.width - tooltipRect.width / 2}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + rect.width - tooltipRect.width / 2}px`;
              }
              tooltip.style.top = `${(rect.height) + 10}px`;
            } else if (tooltip.classList.contains('left')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${-((tooltipRect.width * 105) / 100)}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) - ((tooltipRect.width * 105) / 100)}px`;
              }
              tooltip.style.top = `${-((rect.height * 30) / 100)}px`;
            } else if (tooltip.classList.contains('right')) {
              if (rect.left === tooltipRect.left) {
                tooltip.style.left = `${(rect.width * 110) / 100}px`;
              } else {
                tooltip.style.left = `${Math.abs(rect.left - tooltipRect.left) + ((rect.width * 110) / 100)}px`;
              }
              tooltip.style.top = `${-((rect.height * 30) / 100)}px`;
            }
          });

          document.addEventListener('click', (event) => {
            if (!event.target.classList.contains('text-element')) {
              hideTooltip(tooltip);
              activeTooltip = null;
            }
          });
        } else {
          textElement.addEventListener('mouseenter', () => showTooltip());
          textElement.addEventListener('mouseleave', () => hideTooltip(tooltip));
        }

        document.addEventListener('click', (event) => {
          if (!container.contains(event.target)) {
            hideTooltip(tooltip);
          }
        });
      });
    }, 1000);
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
  // Check if the user is on a mobile device
  isMobileView: () => {
    // Check screen width (common breakpoint for mobile views)
    const isSmallScreen = window.innerWidth < 768;

    // Check the navigator for a mobile user agent
    const isMobileUserAgent = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Return true if both conditions are met
    return isSmallScreen || isMobileUserAgent;
  },
  isKeyPresent: (data, key) => {
    const hasKey = (item) => Object.hasOwn(item.price, key);
    return Object.values(data).some(hasKey);
  },
  // Check if the user is on a mobile device
  isCarConfigSmView: () => {
    // Check screen width (common breakpoint for mobile views)
    const isSmallScreen = window.innerWidth < 1025;

    // Check the navigator for a mobile user agent
    const isMobileUserAgent = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Return true if both conditions are met
    return isSmallScreen || isMobileUserAgent;
  },
  removeEmpty(obj) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.removeEmpty(obj[key]);
      }
      if (obj[key] === undefined || (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)) {
        delete obj[key];
      }
    });
  },
  createLinkClicksDataLayerObject(params) {
    const result = {
      event: "web.webInteraction.linkClicks",
      producedBy: "EDS",
      _maruti: {
        pageInfo: {
          language: params.selectedLanguage || undefined,
          city: params.cityName || undefined,
        },
        userInfo: {
          authenticatedState: params.authenticatedState || undefined,
        },
        identities: {
          ecid: params.ecid || undefined,
          hashedphoneSHA256: params.hashedphoneSHA256 || undefined,
        },
        clickInfo: {
          componentType: params.componentType || undefined,
          componentName: params.componentName || undefined,
          componentTitle: params.componentTitle || undefined,
        },
      },
      web: {
        webInteraction: {
          name: params.webInteractionName || undefined,
          type: params.webInteractionType || undefined,
        },
        webPageDetails: {
          URL: params.url || undefined,
          name: params.pageName || undefined,
          server: params.server || undefined,
          siteSection: params.siteSection || undefined,
        },
      },
    };

    this.removeEmpty(result);
    return result;
  },
  getSHA256Hash: async (input) => {
    const textAsBuffer = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("");
    return hash;
  },
  getLowestPriceVariant(modelData, priceData) {
    // Extract the list of valid variantCd from modelData
    const validVariants = modelData.variants.map(variant => variant.variantCd);

    // Filter priceData based on the validVariants list
    const filteredPriceData = priceData.filter(item => validVariants.includes(item.variantCd));

    // Find the object with the lowest exShowroomPrice
    return filteredPriceData.reduce((lowest, current) => 
        current.exShowroomPrice < lowest.exShowroomPrice ? current : lowest, 
        { exShowroomPrice: Infinity }
    );
},
supportsTouch () {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0) || ('ongesturestart' in window)
},
addNonBreakingSpace(sentence) {
  // Trim the sentence to remove unnecessary spaces
  const trimmedSentence = sentence.trim();

  // Find the last space in the sentence
  const lastSpaceIndex = trimmedSentence.lastIndexOf(' ');

  // If there is no space or the sentence is too short, return it as is
  if (lastSpaceIndex === -1) {
    return trimmedSentence;
  }

  // Replace the last space with a non-breaking space
  const result =
    trimmedSentence.slice(0, lastSpaceIndex) +
    '&nbsp;' +
    trimmedSentence.slice(lastSpaceIndex + 1);

  return result;
},
toCamelCase(str) {
  return str
    .split(/[\s_\-]+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}
}

/** API Utils */

function toTitleCase(word) {
  if (typeof word !== 'string' || word.length === 0) {
    return word;
  }

  if (/\d/.test(word)) {
    return word.toUpperCase();
  }

  return word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
}

async function fetchDataUsingPost(url, payload) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

function sentenceToTitleCase(sentence) {
  if (!sentence.includes(' ')) {
    return toTitleCase(sentence);
  }

  return sentence
    .split(' ')
    .map((word) => {
      if (/\d/.test(word)) {
        return word.toUpperCase();
      }

      return word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    })
    .join(' ');
}

export function processData(data, config) {
  if (!Array.isArray(data)) {
    return [];
  }
  const itemMap = data.reduce((map, item) => {
    const key = config.getKey(item);
    if (key) {
      const processedItem = config.getProcessedItem(item);
      map[key] = processedItem;
    }
    return map;
  }, {});
  return Object.values(itemMap).map(config.getFormat);
}

const dealerConfig = {
  getKey: (item) => (item.name ? sentenceToTitleCase(item.name) : null),
  getProcessedItem: (item) => ({
    name: sentenceToTitleCase(item.name),
    dealerUniqueCd: item.dealerUniqueCd,
  }),
  getFormat: (info) => `${info.name}:${info.dealerUniqueCd}`,
};

const cityConfig = {
  getKey: (item) => (item.cityDesc ? sentenceToTitleCase(item.cityDesc) : null),
  getProcessedItem: (item) => ({
    cityDesc: sentenceToTitleCase(item.cityDesc),
    cityCode: item.cityCd,
    latitude: item.latitude,
    longitude: item.longitude,
    forCode: item.forCode,
  }),
  getFormat: (info) => `${info.cityDesc}:${info.cityCode}`,
};

const stateConfig = {
  getKey: (item) => (item.STATE_DESC ? sentenceToTitleCase(item.STATE_DESC) : null),
  getProcessedItem: (item) => ({
    stateDesc: sentenceToTitleCase(item.STATE_DESC),
    stateCode: item.STATE_CD,
  }),
  getFormat: (info) => `${info.stateDesc}:${info.stateCode}`,
};

const allModelConfig = {
  getKey: (item) => (item.modelDesc ? sentenceToTitleCase(item.modelDesc) : null),
  getProcessedItem: (item) => ({
    modelDesc: sentenceToTitleCase(item.modelDesc),
    modelCd: item.modelCd,
  }),
  getFormat: (info) => `${info.modelDesc}:${info.modelCd}`,
};

export async function fetchData(url, onError = () => { }) {
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      onError({ status: response.status });
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

function getLocalStorage(key) {
  return localStorage.getItem(key);
}

export function formatCurrency(value) {
  const numericValue = String(value).replace(/[^\d.]/g, '');
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  });
  const formattedValue = formatter.format(numericValue);
  return formattedValue;
}

export const apiUtils = {
  getFormattedDealerCityList: async (stateCd, onError) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=EXC&stateCode=${stateCd}`;
    return fetchData(url, onError).then((data) => processData(data, cityConfig));
  },

  getDealerCityList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerOnlyCities)}?channel=EXC`;
    return fetchData(url).then((data) => data);
  },

  getDealerList: async (cityCd) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiDealerMaster)}?outletType=O&type=S,S3&channel=EXC&cityCd=${cityCd}`;
    return fetchData(url).then((data) => processData(data, dealerConfig));
  },

  getCityList: async (stateCd) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiCityBrief)}?stateCd=${stateCd}`;
    return fetchData(url).then((data) => processData(data, cityConfig));
  },

  getStateList: async (onError) => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url, onError).then((data) => processData(data, stateConfig));
  },

  getAllModelList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiCarModelList)}?channel=EXC`;
    return fetchData(url).then((data) => processData(data, allModelConfig));
  },

  getAllVariantList: async () => {
    const url = `${await fetchPlaceholders().then((p) => p.publishDomain + p.apiStateBrief)}`;
    return fetchData(url).then((data) => processData(data, stateConfig));
  },

  getModelList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarList;channel=EXC;locale=en;?x=0`;
    const result = await fetchData(graphQlEndpoint);
    const models = result?.carModelList?.items || [];
    return models.map((model) => `${model.modelDesc}:${model.modelCd}`);
  },
  getGeoLocation: async (location) => {
    const { publishDomain, apiCityPincode } = await fetchPlaceholders();
    const url = new URL(publishDomain + apiCityPincode);
    if (location.latitude && location.longitude) {
      url.searchParams.append('latitude', location.latitude);
      url.searchParams.append('longitude', location.longitude);
    } else if (location.pinCode) {
      url.searchParams.append('pinCode', location.pinCode);
    } else if (location.cityCd) {
      url.searchParams.append('cityCd', location.cityCd);
    } else {
      throw new Error('Either pinCd, cityCd or latitude and longitude must be provided');
    }
    return fetchData(url.href);
  },
  submitBTDForm: async (payload, tid, requestId, otp) => {
    const { publishDomain, lqsApi } = await fetchPlaceholders();
    const url = `${publishDomain}${lqsApi}`;
    const txnId = btoa(`${requestId}|${otp}`);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      tid,
      'x-txn-id': txnId,
    };

    try {
      return await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return {};
    }
  },
  getVariantList: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/variantDetailsList;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0]?.variants || [];
    return variants.map((variant) => `${variant.variantDesc}:${variant.variantCd}`);
  },
  getVariantFeaturesList: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantFeaturesList;modelCd=${modelCd};locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carModelList?.items[0] || [];
    return variants;
  },

  getVariantsSpecifications: async (variant1, variant2, variant3) => {
    const { publishDomain } = await fetchPlaceholders();
    const variants = [variant1, variant2, variant3].filter(Boolean);
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantsSpecifications;${variants.map((v, i) => `variant${i + 1}=${v}`).join(';')};`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carVariantList?.items || [];
  },

  getCarLabelsList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarLabels;locale=en?x=0`;
    const result = await fetchData(graphQlEndpoint);
    const labels = result?.carLabelsList?.items || [];
    return labels;
  },

  getVariantPrice: async (variantCode) => {
    const urlParams = new URLSearchParams(window.location.search);
    const forCode = urlParams?.get('forCode') || '08';
    const storedVariantPrices = {};
    const storedPrices = getLocalStorage('configuratorPrice') ? JSON.parse(getLocalStorage('configuratorPrice')) : {};

    const { publishDomain, apiExShowroomDetail } = await fetchPlaceholders();

    if (storedPrices[variantCode]?.price[forCode]) {
      const expiryTimestamp = storedPrices[variantCode].timestamp;
      const currentTimestamp = new Date().getTime();
      if (currentTimestamp > expiryTimestamp) { 
        localStorage.removeItem('configuratorPrice');
        return apiUtils.getVariantPrice(variantCode);
      }
     // const storedPrice = storedPrices[variantCode].price[forCode];
      return storedPrices;
    }

    // Perform fetch only if price not already in localStorage
    const apiUrl = `${publishDomain}${apiExShowroomDetail}?forCode=${forCode}&variantCodes=${variantCode}&variantInfoRequired=true`;

    const url = new URL(apiUrl);

    let priceData;
    try {
      const response = await fetch(url.href, {
        method: 'GET',
      });
      priceData = await response.json();
    } catch (error) {
      priceData = {};
    }

    if (priceData?.error === false && priceData?.data) {
   
      const timestamp = new Date().getTime() + 1 * 24 * 60 * 60 * 1000; // 1 day from now
      let storedPrices = {}; 
    
      priceData?.data?.models.forEach((variantList) => {
        variantList.exShowroomDetailResponseDTOList.forEach((obj) => {
        
          const formattedPrice = formatCurrency(obj.exShowroomPrice);
    
    
          if (!storedPrices[obj.variantCd]) {
            storedPrices[obj.variantCd] = {
              price: {},
              timestamp: timestamp
            };
          }
          if (!storedPrices[obj.variantCd].price[obj.forCode]) {
            storedPrices[obj.variantCd].price[obj.forCode] = {};
          }
 
          storedPrices[obj.variantCd].price[obj.forCode][obj.colorType] = formattedPrice;
        });
      });
    
      localStorage.setItem('configuratorPrice', JSON.stringify(storedPrices));
     // return storedPrices[variantCode].price[forCode];
     return storedPrices;
    }
    return '';
  },

  getVariantDetailsByPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantDetailsByPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carVariantByPath?.item;
  },

  getCarDetailsByVariantPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByVariantPath;path=${path}`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items[0] ?? {};
  },

  getCarModelByPath: async (path) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarDetailsByPath;path=${path}`;
    try {
      return (await fetchData(graphQlEndpoint))?.carModelByPath?.item || {};
    } catch (e) {
      return {};
    }
  },
  getActiveVariantList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ActiveVariantList;channel=EXC;locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items;
  },
  getModelPrice: async (modelCode, channel, forCode) => {
    const { publishDomain, apiExShowroomDetail } = await fetchPlaceholders();
    const activeVariantList = await apiUtils.getActiveVariantList();
    const storedPrices = getLocalStorage('modelPrice') ? JSON.parse(getLocalStorage('modelPrice')) : {};
    const currentTime = new Date().getTime();
    const isValid = Object.keys(storedPrices).includes(modelCode) && (Object.values(storedPrices).some((item) => item.timestamp > currentTime && Object.hasOwn(item.price, forCode)));
    if (isValid) {
      return storedPrices[modelCode].price[forCode];
    }
  
    const apiUrl = publishDomain + apiExShowroomDetail;
  
    const params = {
      forCode,
      channel,
    };
  
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    url.searchParams.append("variantInfoRequired",true);
  
    let data;
    try {
      const response = await fetch(url.href, { method: 'GET' });
      data = await response.json();
    } catch (error) {
      data = {};
    }
  
    if (data?.error === false && data?.data) {
      const timestamp = currentTime + (1 * 24 * 60 * 60 * 1000);
      data.data.models.forEach((item) => {
        const { modelCd, lowestExShowroomPrice } = item;
  
        if (!Object.hasOwn(storedPrices, modelCd)) {
          storedPrices[modelCd] = { price: {}, timestamp };
        }
        const variantList = activeVariantList.find(item => item.modelCd === modelCd) || null;  
        const lowestPrice = utility.getLowestPriceVariant(variantList, item.exShowroomDetailResponseDTOList)

        storedPrices[modelCd].price[forCode] = lowestPrice.exShowroomPrice;
        storedPrices[modelCd].timestamp = timestamp;
      });
  
      localStorage.setItem('modelPrice', JSON.stringify(storedPrices));
    }
  
    return storedPrices[modelCode]?.price[forCode] || '';
  },
  getCarVariantsByModelCd: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarVariantByModelCd;modelCd=${modelCd}`;
    const result = await fetchData(graphQlEndpoint);
    const variants = result?.carVariantList?.items || [];
    return variants;
  },
  getCarVariantsColoursByVariantCd: async (variantCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarColorByVariantCode;variantCd=${variantCd}`;
    const result = await fetchData(graphQlEndpoint);
    const colours = result?.carVariantList?.items[0]?.colors || [];
    return colours;
  },
  getCarHotspots: async (modelCd, hotspotId) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarHotspotList;modelCd=${modelCd};locale=en;hotspotId=${hotspotId};`;
    const result = await fetchData(graphQlEndpoint);
    const hotspot = result?.carHotspotList?.items[0] || [];
    return hotspot;
  },
  getCarHighlights: async (modelCd) => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CarHotspotList;modelCd=${modelCd};locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carHotspotList?.items;
  },
  getConfiguratorCarList: async () => {
    const { publishDomain } = await fetchPlaceholders();
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ConfiguratorCarList;channel=EXC;locale=en;`;
    const result = await fetchData(graphQlEndpoint);
    return result?.carModelList?.items;
  },
};

/** Analytics Utils */

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

export const analytics = {

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

/** Video JS */

const VIDEO_JS_SCRIPT = '/blocks/brand-film-carousel/videojs/video.min.js';
const VIDEO_JS_CSS = '/blocks/brand-film-carousel/videojs/video-js.min.css';
const VIDEO_JS_LOAD_EVENT = 'videojs-loaded';

const getVideojsScripts = (publishDomain) => ({
  scriptTag: document.querySelector(`head > script[src="${publishDomain}${VIDEO_JS_SCRIPT}"]`),
  cssLink: document.querySelector(`head > link[href="${publishDomain}${VIDEO_JS_CSS}"]`),
});

export async function waitForVideoJs() {
  return new Promise((resolve) => {
    const { scriptTag, cssLink } = getVideojsScripts('');
    const isJsLoaded = scriptTag?.dataset?.loaded;
    const isCSSLoaded = cssLink?.dataset?.loaded;
    if (isJsLoaded && isCSSLoaded) {
      resolve();
    }

    const successHandler = () => {
      document.removeEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
      resolve();
    };

    document.addEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
  });
}

export const loadVideoJs = async (publishDomain) => {
  const { scriptTag, cssLink } = getVideojsScripts(publishDomain);
  if (scriptTag && cssLink) {
    await waitForVideoJs();
    return;
  }

  await Promise.all([loadCSS(publishDomain + VIDEO_JS_CSS), loadScript(publishDomain + VIDEO_JS_SCRIPT)]);

  const { scriptTag: jsScript, cssLink: css } = getVideojsScripts(publishDomain);
  jsScript.dataset.loaded = true;
  css.dataset.loaded = true;
  document.dispatchEvent(new Event(VIDEO_JS_LOAD_EVENT));
};

/** CTA Utils */

export const ctaUtils = {

  getLink(linkEl, textEl, targetEl, className) {
    const link = linkEl?.querySelector('.button-container a');
    const target = targetEl?.textContent?.trim() || '_self';
    link?.setAttribute('target', target);
    const text = textEl?.textContent?.trim() || '';
    if (link) {
      link.innerHTML = '';
      link.insertAdjacentHTML('beforeend', utility.sanitizeHtml(text));
      if (className && link) {
        link.classList.add(className);
      }
    }
    return link;
  },

};