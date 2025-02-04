import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  wrapTextNodes,
  buildBlock,
  updateSectionsStatus,
  fetchPlaceholders,
  getMetadata,
  decorateBlock,
  loadBlock,
} from './aem.js';
import {
  martechLoadedPromise,
  martechEager,
  martechLazy,
  martechDelayed,
} from './martech-loader.js';
import { utility, seoUtils, authUtils  } from '../utility/masterUtil.js'

const LCP_BLOCKS = [...(window.hlx?.lcpBlocks || [])]; // add your common LCP blocks to the list
const DELIVERY_ASSET_IDENTIFIER = '/adobe/assets/urn:aaid:aem:';
const DELIVERY_VIDEO_IDENTIFIER = '/play';
const DELIVERY_IMAGE_IDENTIFIER = '/as/';
const LOAD_MARTECH_PARAM = 'loadMartech';
let siteDomain = null;

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter(
        (attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'),
      ),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function buildMultiStepForms(main) {
  const multiStepForms = ['sf-journey-start', 'loan-application', 'ebook-journey'];
  multiStepForms.forEach((form) => {
    const formStepClassName = `${form}-step`;
    const formStepSelector = `.${formStepClassName}`;
    // multi-step forms are sections that have a least one step
    main
      .querySelectorAll(
        `:scope > div:not([data-section-status]):has(${formStepSelector})`,
      )
      .forEach((formSection) => {
        const firstStep = formSection.querySelector(formStepSelector);
        const previousElement = firstStep.previousElementSibling;
        // wrap all consecutive steps in a new block
        const steps = [];
        let step = firstStep;
        do {
          step.classList.remove(formStepClassName);
          wrapTextNodes(step);
          steps.push([step]);
          step = step.nextElementSibling;
        } while (step?.matches(formStepSelector));
        // remove any remaining out-of-order steps
        formSection
          .querySelectorAll(formStepSelector)
          .forEach((s) => s.remove());
        // create a new block and replace the first step with it
        const block = buildBlock(form, steps);
        if (previousElement) previousElement.after(block);
        else formSection.prepend(block);
      });
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks(main) {
  try {
    buildMultiStepForms(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// if the link passed is relative, this will return false
function isExternalLink(url) {
  const parsedUrl = new URL(url, window.location.href);
  return parsedUrl.origin !== window.location.origin;
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {string} [alt] The image alternative text
 * @param {boolean} [eager] Set loading attribute to eager
 * @param {Array} [breakpoints] Breakpoints and corresponding params (eg. width)
 * @returns {Element} The picture element
 */
function createOptimizedPictureWithDeliveryUrls(
  src,
  alt = '',
  eager = false,
  breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
) {
  const url = new URL(src, window.location.href);
  const width = url.searchParams.get('width');
  const height = url.searchParams.get('height');
  const picture = document.createElement('picture');
  // DM open api smart imaging
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    const dmUrl = new URL(url.href);
    dmUrl.href = `${dmUrl.href.substring(0, dmUrl.href.lastIndexOf('.'))}.png`;
    dmUrl.searchParams.set('width', br.width);
    dmUrl.searchParams.set('id', '1');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('srcset', dmUrl.href);
    if (height) {
      source.setAttribute('height', height);
    }
    if (width) {
      source.setAttribute('width', width);
    }
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    const fallbackUrl = new URL(url.href); // Clone original URL
    fallbackUrl.searchParams.set('width', br.width);

    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', fallbackUrl.href);
      if (height) {
        source.setAttribute('height', height);
      }
      if (width) {
        source.setAttribute('width', width);
      }
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      img.setAttribute('src', fallbackUrl.href);
      if (height) {
        img.setAttribute('height', height);
      }
      if (width) {
        img.setAttribute('width', width);
      }
      picture.appendChild(img);
    }
  });

  return picture;
}

export async function getSiteDomain() {
  if (siteDomain === null) {
    const currUrl = window.location.href;
    if (currUrl.includes('localhost') || currUrl.includes('aem.live') || currUrl.includes('aem.page') || currUrl.includes('author')) {
      const placeholder = await fetchPlaceholders();
      const { sitedomain } = placeholder;
      siteDomain = sitedomain;
    } else {
      siteDomain = window.location.origin;
    }
  }
  return siteDomain;
}

/**
 * Decorates delivery assets by replacing anchor elements with optimized pictures.
 * @param {HTMLElement} main - The main element containing the anchor elements.
 */
export async function decorateDeliveryImages(main) {
  const anchors = Array.from(main.getElementsByTagName('a'));
  siteDomain = await getSiteDomain();
  const deliveryUrls = anchors.filter((anchor) => anchor.href
    .includes(DELIVERY_ASSET_IDENTIFIER) && anchor.href.includes(DELIVERY_IMAGE_IDENTIFIER));
  if (deliveryUrls.length > 0) {
    deliveryUrls.forEach((anchor) => {
      let deliveryUrl = new URL(anchor.href);
      if (!isExternalLink(deliveryUrl) && siteDomain) {
        deliveryUrl = siteDomain + deliveryUrl.pathname + deliveryUrl.search;
      }
      const altText = anchor.title;
      const picture = createOptimizedPictureWithDeliveryUrls(deliveryUrl, altText);
      anchor.replaceWith(picture);
    });
  }
}

// Function to convert the existing div structure
export function createVideoElement(videoUrl, posterImageUrl, assetName) {
  const videoDiv = document.createElement('div');
  const newAnchor = document.createElement('a');
  newAnchor.href = videoUrl;
  newAnchor.textContent = assetName;
  if (posterImageUrl) {
    const picture = createOptimizedPictureWithDeliveryUrls(posterImageUrl);
    videoDiv.appendChild(picture);
  }
  videoDiv.appendChild(newAnchor);
  return videoDiv;
}

export async function decorateDeliveryVideos(main) {
  const anchors = Array.from(main.getElementsByTagName('a'));
  siteDomain = await getSiteDomain();
  const urls = anchors.filter((anchor) => anchor.href
    .includes(DELIVERY_ASSET_IDENTIFIER) && anchor.href.includes(DELIVERY_VIDEO_IDENTIFIER));
  if (urls.length > 0) {
    urls.forEach((anchor) => {
      const url = new URL(anchor.href);
      const videoName = url.searchParams.get('assetname');
      const options = anchor.title;
      const videoMainDiv = anchor.closest('.video');
      const posterUrlAnchor = videoMainDiv?.querySelector('div p:nth-of-type(2) a');
      let videoUrl = '';
      if (!isExternalLink(url) && siteDomain) {
        videoUrl = `${siteDomain}${url.pathname.split('?')[0]}`;
      } else {
        videoUrl = `${url.origin}${url.pathname.split('?')[0]}`;
      }

      let posterImageUrl = '';
      if (posterUrlAnchor && !isExternalLink(posterUrlAnchor.href) && siteDomain) {
        const posterurl = new URL(posterUrlAnchor.href);
        const relativepath = posterurl.pathname + posterurl.search;
        posterImageUrl = `${siteDomain}${relativepath}`;
      } else if (posterUrlAnchor && isExternalLink(posterUrlAnchor.href)) {
        posterImageUrl = posterUrlAnchor.href;
      }
      const video = createVideoElement(videoUrl, posterImageUrl, videoName);
      if (videoMainDiv && options) {
        const videoOptions = options.split(',');
        videoOptions.forEach((option) => {
          const trimmedOption = option.trim();
          if (encodeURI(trimmedOption) !== anchor.href) {
            videoMainDiv.classList.add(trimmedOption);
          }
        });
      }
      anchor.parentElement.replaceWith(video);
    });
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateDeliveryVideos(main);
  decorateDeliveryImages(main);
  decorateBlocks(main);
}

function getMartechDelayParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(LOAD_MARTECH_PARAM) ?? 'delayed';
}

function ensureRelForBlankLinks() {
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach((link) => {
    const currentRel = link.getAttribute('rel') || '';
    const relSet = new Set(currentRel.split(' ').filter(Boolean));
    relSet.add('noopener');
    relSet.add('noreferrer');
    link.setAttribute('rel', Array.from(relSet).join(' '));
  });
}
/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await Promise.all([
      // wait for Target to run
      martechLoadedPromise.then(martechEager),
      waitForLCP(LCP_BLOCKS),
    ]);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }

}

async function loadYY8Header(header) {
  const headerBlock = buildBlock('yy8-header', '');
  if (headerBlock) {
    header.append(headerBlock);
    decorateBlock(headerBlock);
  }
  return loadBlock(headerBlock);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  if (!main) return; // Add null check for main element
  updateSectionsStatus(main);
  document.documentElement.classList.add('no-scroll');
  if(getMetadata('header-variation') === 'yy8') {
    loadYY8Header(doc.querySelector('header'));
  } else {
    loadHeader(doc.querySelector('header'));
  }
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));
  if (!authUtils.isAuthPage()) {
    try {
      await authUtils.handleRedirect();
    } catch (error) {
    }
  }
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  await martechLazy();
  setDataLayer();
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
  ensureRelForBlankLinks();
  const observer = new MutationObserver(() => {
    ensureRelForBlankLinks();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  seoUtils.getJSON();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    // run the launch container
    martechDelayed();
    import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}
function removeEmpty(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeEmpty(obj[key]);
    }
    if (obj[key] === undefined || (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)) {
      delete obj[key];
    }
  });
}

function createPageLoadDataLayerObject(params) {
  const result = {
    // event: params.event || undefined,
    producedBy: 'EDS',
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
      carInfo: {
        model: params.model || undefined,
        color: params.color || undefined,
        carType: params.carType || undefined,
      },
    },
    web: {
      webPageDetails: {
        URL: params.url || undefined,
        name: params.pageName || undefined,
        server: params.server || undefined,
        siteSection: params.siteSection || undefined,
        isErrorPage: params.isErrorPage || false,
      },
    },
  };

  removeEmpty(result);
  return result;
}
function getLocalStorage(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function getCookieValue(cookieName) {
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookiesArray = decodedCookie.split(';');

  for (let i = 0; i < cookiesArray.length; i += 1) {
    const cookie = cookiesArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length).replace('MCMID|', '');
    }
  }
  return null;
}

async function setDataLayer() {
  const { corporatepage } = await fetchPlaceholders();
  const ecid = getCookieValue('AMCV_BC401D6765FB06150A495FF7@AdobeOrg');
  const { hostname: server, pathname: currentPagePath, href: url } = document.location;
  const pageName = document.title;
  const cityName = getLocalStorage('selected-location')?.cityName || 'Delhi';
  const selectedLanguage = getMetadata('language') || 'en';
  // const event = 'web.webPageDetails.pageViews';
  let authenticatedState = 'unauthenticated';
  let hashedphoneSHA256 = undefined;
  const profile = await (authUtils.getProfile());
  if(profile) {
    authenticatedState = 'authenticated';
    hashedphoneSHA256 = await utility.sha256(profile.number);
    window.hashedphoneSHA256 = hashedphoneSHA256;
  }
  const isErrorPage = document.querySelector('main')?.classList?.contains('error') ?? false;
  const modelName = getMetadata('car-model-name');
  let siteSection = '';
  if (url.includes('arena')) {
    siteSection = 'Arena';
  } else if (url.includes('nexa')) {
    siteSection = 'Nexa';
  }

  if (url.includes(corporatepage)) {
    const data = {
      // event,
      authenticatedState,
      ecid,
      url,
      pageName,
      server,
      siteSection,
      isErrorPage,
      hashedphoneSHA256,
    };
    window.adobeDataLayer.push(createPageLoadDataLayerObject(data));
  } else if (modelName) {
    const data = {
      // event,
      cityName,
      selectedLanguage,
      authenticatedState,
      ecid,
      url,
      pageName,
      server,
      siteSection,
      isErrorPage,
      model: modelName,
      hashedphoneSHA256,
    };
    window.adobeDataLayer.push(createPageLoadDataLayerObject(data));
  } else {
    const data = {
      // event,
      cityName,
      selectedLanguage,
      authenticatedState,
      ecid,
      url,
      pageName,
      server,
      siteSection,
      isErrorPage,
      hashedphoneSHA256,
    };
    window.adobeDataLayer.push(createPageLoadDataLayerObject(data));
  }
}

async function loadPage() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  if (authUtils.isAuthPage() && !(await authUtils.handleRedirect())) {
    try {
        await authUtils.login();
    } catch(error) {
      const { authDefaultFallbackRedirect } = await fetchPlaceholders();
      window.location.href = authDefaultFallbackRedirect;
    }
  }
  loadFonts();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

export function mergeImagesForArtDirection(img, imgMobile) {
  const removeInstrumentation = (of) => {
    const attributes = [...of.attributes].filter(
      ({ nodeName }) => nodeName.startsWith('data-aue-')
      || nodeName.startsWith('data-richtext-'),
    );
    if (attributes.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const { nodeName } of attributes) of.removeAttribute(nodeName);
      // eslint-disable-next-line max-len
      return attributes.reduce(
        (prev, { nodeName, nodeValue }) => ({ ...prev, [nodeName]: nodeValue }),
        {},
      );
    }
    return null;
  };
  const applyDynamicInstrumentation = () => {
    const dynamicInstrumentation = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of [[img, 'min-width: 600px'], [imgMobile]]) {
      const [element, mediaQuery = ''] = entry;
      const instrumentation = removeInstrumentation(element);
      if (!instrumentation) {
        return;
      }
      dynamicInstrumentation[mediaQuery] = instrumentation;
    }
    imgMobile.dataset.dynamicInstrumentation = JSON.stringify(
      dynamicInstrumentation,
    );
  };

  if (imgMobile) {
    const pictureMobile = imgMobile.parentElement;
    // merge the imgMobile into the img:
    // the sources have min-width media queries for desktop,
    // we select the one without a media query which is for mobile
    const pictureMobileMobileSource = pictureMobile.querySelector(
      'source:not([media])',
    );
    if (pictureMobileMobileSource) {
      const pcitureMobileSource = img.parentElement.querySelector(
        'source:not([media])',
      );
      if (pcitureMobileSource) pcitureMobileSource.replaceWith(pictureMobileMobileSource);
      else img.before(pictureMobileMobileSource);
    } else {
      // create a source if there are non (authoring specific case)
      const source = document.createElement('source');
      source.srcset = img.src;
      source.media = '(min-width: 600px)';
      img.before(source);
    }
    // the fallback image should also be the mobile one itself is also mobile so replace it
    img.replaceWith(imgMobile);
    // remove picture mobile
    const p = pictureMobile.parentElement;
    pictureMobile.remove();
    if (p.children.length === 0 && !p.textContent.trim()) p.remove();
    // the instrumentation depends on the viewport size, so we remove it
    applyDynamicInstrumentation();
  }
}

loadPage();
