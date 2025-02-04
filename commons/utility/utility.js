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
export default utility;
