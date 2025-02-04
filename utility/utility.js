import apiUtils from './apiUtils.js';

const utility = {
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

export default utility;
