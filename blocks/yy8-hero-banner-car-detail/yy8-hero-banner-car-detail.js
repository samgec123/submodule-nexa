import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { getSiteDomain } from '../../commons/scripts/scripts.js';
import { utility, apiUtils, analytics, loadVideoJs, waitForVideoJs } from '../../utility/masterUtil.js';

export default async function decorate(block) {
  const [
    contentEl,
    priceEl,
    disclaimerEl,
    ctaEl,
    specEl,
    customSpecsEl,
    volEl
  ] = Array.from(block.children).map((item) => item.firstElementChild);
  const sitedomain = await getSiteDomain();
  let desktopVideo;
  let mobileVideo;
  let desktopPoster;
  let mobilePoster;
  let logo;
  let logoImage = true;
  [desktopVideo, mobileVideo] = Array.from(contentEl?.querySelectorAll('a')).map((item) => {
    const url = item.href;
    (item?.closest('p') ?? item).remove();
    return url;
  });
  [desktopPoster, mobilePoster, logo] = Array.from(contentEl?.querySelectorAll('picture')).map((item) => {
    item.closest('p')?.remove();
    return item;
  });
  Array.from(contentEl?.querySelectorAll('div')).forEach((el) => {
    if (el.innerHTML === '') {
      el.remove();
    }
  });
  logo?.querySelector('img')?.setAttribute('alt', 'logoAlt');
  const desktopVideoSrc = utility.getDeviceSpecificVideoUrl(desktopVideo);
  const mobileVideoSrc = utility.getDeviceSpecificVideoUrl(mobileVideo);

  let videoCompileUrl;

  if (window.matchMedia('(width > 768px)').matches) {
    videoCompileUrl = desktopVideoSrc;
  } else {
    videoCompileUrl = mobileVideoSrc;
  }
  const deviceVideoUrl = sitedomain + new URL(videoCompileUrl).pathname;
  const title = contentEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList.add('car-hero-banner-title');
  const pretitle = contentEl?.children[0]?.textContent?.trim() || '';
  const tagline = contentEl?.children[1]?.textContent?.trim() || '';
  const [priceLabel, priceText] = Array.from(priceEl?.children)?.map((item) => item.textContent?.trim()) ?? [];
  const disclaimer = disclaimerEl?.innerHTML;
  const [primaryCta, secondaryCta] = Array.from(ctaEl?.querySelectorAll('a')).map((item) => {
    (item?.closest('p') ?? item).remove();
    return item;
  });
  const [primaryTarget, secondaryTarget] = Array.from(ctaEl.children).map((item) => item.textContent?.trim() || '_self');
  primaryCta?.setAttribute('target', primaryTarget);
  secondaryCta?.setAttribute('target', secondaryTarget);
  primaryCta?.classList.add('car-hero-banner-primary-btn', 'cta__new', 'cta__new-primary');
  secondaryCta?.classList.add('car-hero-banner-secondary-btn', 'cta__new', 'cta__new-outlined');
  const cfEl = specEl?.querySelector('a');
  let modelPath = '';
  if (cfEl) {
    modelPath = cfEl?.textContent?.trim();
    (cfEl.closest('p') ?? cfEl)?.remove();
  }

  if (utility.isEditorMode(block)) {
    block.classList.add('yy8-container-height-editor-mode');
  }
  const selectedSpecs = specEl?.textContent?.trim()?.split(',')?.filter((item) => item) ?? [];
  const [
    overrideSpecsEl,
    spec1LabelEl,
    spec1ValueEl,
    spec2LabelEl,
    spec2ValueEl,
    spec3LabelEl,
    spec3ValueEl
  ] = customSpecsEl?.children ?? [];
  const overrideSpecs = (overrideSpecsEl?.textContent?.trim() === 'true');
  let videoUrl = desktopVideo;
  let poster = desktopPoster;
  if (window.matchMedia('(width < 768px)').matches) {
    videoUrl = mobileVideo || desktopVideo;
    poster = mobilePoster || desktopPoster;
  }
  poster?.querySelector('img')?.setAttribute('loading', 'eager');
  let contentHtml = '';
  if (pretitle || title || tagline) {
    contentHtml = `
        ${(pretitle) ? `<h1 class="car-hero-banner-pretitle">${pretitle}</h1>` : ''}
        <div class="car-hero-banner-logo-title">
          ${(logoImage && logo) ? logo.outerHTML : ''}${title? title.outerHTML : ''}
        </div>
        ${(tagline) ? `<h2 class="car-hero-banner-tagline">${tagline}</h2>` : ''}
    `;
  }
  let ctasHtml = '';
  if (primaryCta || secondaryCta) {
    ctasHtml = `
      <div class="car-hero-banner-actions">
        ${(secondaryCta) ? `${secondaryCta.outerHTML}` : ''}
        ${(primaryCta) ? `${primaryCta.outerHTML}` : ''}
      </div>
    `;
  }
  let videoHtml = '';
  if (videoUrl) {
    let posterurl = poster?.querySelector('img')?.src
    posterurl = posterurl.replace('format=jpeg', 'format=webply');
    videoHtml = `
      <div class="car-hero-banner-video">
        ${(poster) ? `${poster.outerHTML}` : ''}
        <video src class="video-js" playsinline autoplay loop muted="muted" preload="auto" poster=${posterurl} width="100%"></video>
      </div>
    `;
  }

  const [
    muteImgEl,
    unmuteImgEl
  ] = volEl?.children ?? [];
  let ismuteIcon = true;
  let isunmuteIcon = true;

  const muteBtn = await checkImageAvailablity(muteImgEl,'mute');
  const unMuteBtn = await checkImageAvailablity(unmuteImgEl,'unmute');

  async function checkImageAvailablity(element,type) {
    const siteDomain = await getSiteDomain();
    if (element?.querySelector('img') || element?.querySelector('a')) {
      const src = element?.querySelector('img')?.outerHTML;
      if(!element?.querySelector('img')) {
        if (type== 'mute') {
          ismuteIcon = false;
        }
        else if (type =='logo') {
          logoImage = false;
        }
        else {
          isunmuteIcon = false;
        }
        const anchor = element.querySelector('a')?.href || '';
        const url = new URL(anchor);
        return (anchor) ? siteDomain + url.pathname + url.search : '';
      }
      return src;
    }
    return '';
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="car-hero-banner-container">
      <div class="car-hero-banner-content">
        <div class="car-hero-banner-top-content">
          ${contentHtml}
        </div>
        <div class="car-hero-banner-bottom-content">
                  
          <div class="car-hero-banner-specs car-hero-banner-bottom-left">
          </div>
          <div class="car-hero-banner-bottom-right">
            <div class="mute-btn-wrapper">
                        <button class="mute-btn-block active" aria-label="mutebtn">${ismuteIcon ? muteBtn : `<picture><img src="${muteBtn}"/></picture>`}</button>
              <button class="unmute-btn-block" aria-label="unmutebtn">${isunmuteIcon ? unMuteBtn : `<picture><img src="${unMuteBtn}"/></picture>`}</button>
            </div>
            ${ctasHtml}
            ${(disclaimer) ? `<div class="car-hero-banner-disclaimer">${disclaimer}</div>` : ''}
          </div>
        </div>
      </div>
      ${videoHtml}
    </div>
  `);
  let modelCd = '';
  const updatePrice = async (forCode) => {
    const price = (await apiUtils.getModelPrice(modelCd, 'EXC', forCode)) ?? '';
    if(block.querySelector('.car-hero-banner-price')){
      block.querySelector('.car-hero-banner-price').innerHTML = '';
    }
    if (price && priceText) {
      block.querySelector('.car-hero-banner-price').innerHTML = `
        ${priceLabel || ''} <b>${priceText?.replace('{price}', utility.formatCurrency(price).replaceAll(',', ' '))}</b>
      `;
    }
  };
  const getCustomSpecs = () => [
    {
      label: spec1LabelEl?.textContent?.trim(),
      value: spec1ValueEl?.textContent?.trim(),
    },
    {
      label: spec2LabelEl?.textContent?.trim(),
      value: spec2ValueEl?.textContent?.trim(),
    },
    {
      label: spec3LabelEl?.textContent?.trim(),
      value: spec3ValueEl?.textContent?.trim(),
    },
  ];
  const getCfSpecs = async (data) => {
    const labelResult = (await apiUtils.getCarLabelsList());
    const specList = [];
    if (labelResult.length > 0) {
      const labels = labelResult[0];
      selectedSpecs.forEach((spec) => {
        switch (spec) {
          case 'displacement':
            if (data.displacement !== null && labels.engineCapacityLabel) {
              specList.push({ label: labels.engineCapacityLabel, value: data.displacement });
            }
            break;
          case 'maxPower':
            if (data.maxPower !== null && labels.maxPowerLabel) {
              specList.push({ label: labels.maxPowerLabel, value: data.maxPower });
            }
            break;
          case 'fuelEfficiency':
            if (data.fuelEfficiency !== null && labels.fuelEfficiencyLabel) {
              specList.push({ label: labels.fuelEfficiencyLabel, value: data.fuelEfficiency });
            }
            break;
          default:
            break;
        }
      });
    }
    return specList;
  };
  async function carModelPathApi() {
    apiUtils.getCarModelByPath(modelPath).then(async (data) => {
      utility.getScrollHighlightsAssetPrefix(modelPath, data);
      modelCd = data.modelCd;
      const forCode = utility.getSelectedLocation()?.forCode ?? '08';
      updatePrice(forCode);
      let specList = [];
      if (overrideSpecs || selectedSpecs.length <= 0) {
        specList = getCustomSpecs();
      } else {
        specList = await getCfSpecs(data);
      }
      const specListContainer = block.querySelector('.car-hero-banner-specs');
      specList.forEach((spec) => {
        if (!spec.label || !spec.value) {
          return;
        }
        const div = document.createElement('div');
        div.classList.add('car-hero-banner-spec-container');
        div.innerHTML = `
          <span class="specs-label">${spec.label}</span>
          <span class="specs-value">${spec.value}</span>
        `;
        specListContainer.insertAdjacentElement('beforeend', div);
      });
    });
  }
  document.addEventListener('updateLocation', (event) => {
    const forCode = event?.detail?.message ?? utility.getSelectedLocation()?.forCode ?? '08';
    updatePrice(forCode);
  });
  block.querySelectorAll('a').forEach((link) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = `${(pretitle) ? `${pretitle} ` : ''}${(title?.textContent?.trim()) ? `${title.textContent.trim()} ` : ''}${(tagline) ? `${tagline} ` : ''}`;
    data.componentType = 'button';
    data.webName = link.textContent?.trim() || '';
    data.linkType = link;
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });

  const registerIntrestTeaserButton = block.querySelector('.car-hero-banner-primary-btn');
  const btnUrl = registerIntrestTeaserButton?.href;
  const compId = btnUrl?.substr(btnUrl.lastIndexOf('#') + 1);
  registerIntrestTeaserButton?.addEventListener('click', (event) => {
    event.preventDefault(); 
    const registerInrestBlocks = document.querySelectorAll('.register-your-interest-container');
    registerInrestBlocks.forEach((registerInrestBlock) => {
      const popupId = registerInrestBlock?.querySelector('.register-your-interest-wrapper')?.querySelector('.modal')?.id || '';
      if (popupId === compId) {
        registerInrestBlock.querySelector('.register-your-interest-wrapper').style.display = 'block';
        const modalBlock = document.querySelector(".modal");
        modalBlock.setAttribute("aria-hidden", false);
        modalBlock.focus();
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const initVideos = async () => {
    const videoPlayers = [];
    const bannerVideo = block.querySelector('.car-hero-banner-video');
    const videoElement = block.querySelector('.video-js');

    const config = {
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      preload: 'auto',
      poster: null,
      loadingSpinner: false
    };

    try {
      const player = await videojs(videoElement, config, function () {
        const muteBtnWrapper = block.querySelector('.mute-btn-block');
        const unmuteBtnWrapper = block.querySelector('.unmute-btn-block');

        muteBtnWrapper?.addEventListener('click', () => {
          if (player) {
            videoMuteUnmute(player, muteBtnWrapper, unmuteBtnWrapper);
          }
        });
        
        unmuteBtnWrapper?.addEventListener('click', () => {
          if (player) {
            videoMuteUnmute(player, muteBtnWrapper, unmuteBtnWrapper);
          }
        });
      });

      player.src(deviceVideoUrl);
      videoPlayers.push(player);

      if (!player) {
        return;
      }
      
      block.querySelector('.car-hero-banner-video video')?.addEventListener('playing',() => {
        block.querySelector('.car-hero-banner-video')?.classList?.add('banner-video-playing');
        block.querySelector('.car-hero-banner-video picture')?.classList?.add('hidden');
      });

      videoPlayers[player.id] = player;
      // Intersection Observer to pause video when scrolling to the next section
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // If section is in view, play the video
              player.play();
            } else {
              // If section is out of view, pause the video
              player.pause();
            }
          });
        },
        {
          root: null, // observing relative to the viewport
          rootMargin: '0px',
          threshold: 0.5, // Trigger when 50% of the section is in view
        }
      );

      observer.observe(bannerVideo); // Start observing the video section
    } catch (error) {
      console.error('Error initializing videojs player:', error);
    }
  };

  function videoMuteUnmute(player, muteBtn, unmuteBtn) {
    if (player.muted()) {
      player.muted(false); // Unmute using videojs API
      muteBtn.classList.remove('active');
      unmuteBtn.classList.add('active');
    } else {
      player.muted(true); // Mute using videojs API
      muteBtn.classList.add('active');
      unmuteBtn.classList.remove('active');
    }
  }

  const initializeVideos = async () => {
    const { publishDomain } = await fetchPlaceholders();
    loadVideoJs(utility.isEditorMode(block) ? publishDomain : '');
    waitForVideoJs().then(() => {
      initVideos();
    }).catch((error) => {
      console.error('Error waiting for videojs:', error);
    });
  };

  if (Window.DELAYED_PHASE) {
    initializeVideos();
    carModelPathApi();
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
      carModelPathApi();
    });
  }
}
