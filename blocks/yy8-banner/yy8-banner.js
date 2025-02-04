import { utility, analytics, ctaUtils, loadVideoJs, waitForVideoJs } from '../../utility/masterUtil.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { moveInstrumentation, getSiteDomain } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    ctaTextFirstEl,
    ctaLinkFirstEl,
    ctaTargetFirstEl,
    ctaTextSecondEl,
    ctaLinkSecondEl,
    ctaTargetSecondEl,
    videoEl,
    videoPosterEl,
    mobileVideoEl,
    mobileVideoPosterEl,
    muteBtnEl,
    unmuteBtnEl,
    logoEl,
    mobilelogoEl,
    logoAltEl,
  ] = children;
  
  const siteDomain = await getSiteDomain();
  const title = titleEl || null;
  let ismuteIcon = true;
  let isunmuteIcon = true;

  if (title) {
    title.classList.add('section-title');
  }

  if (utility.isEditorMode(block)) {
    block.classList.add('yy8-container-height-editor-mode');
  }

  const description = descriptionEl?.textContent?.trim() || '';
  const primaryCta = ctaUtils.getLink(
    ctaLinkFirstEl,
    ctaTextFirstEl,
    ctaTargetFirstEl,
  );
  const secondaryCta = ctaUtils.getLink(
    ctaLinkSecondEl,
    ctaTextSecondEl,
    ctaTargetSecondEl,
  );

  async function getImageSource(element) {
    if (element?.querySelector('img')) {
      return element?.querySelector('img')?.src;
    }
    const el = element?.querySelector('a');
    if (el) {
      return (siteDomain + el?.getAttribute('href'));
    }
  }

  const bannerVideoURL = utility.getDeviceSpecificVideoUrl(videoEl?.querySelector('a')?.href);
  const bannerMobileVideoURL = utility.getDeviceSpecificVideoUrl(mobileVideoEl?.querySelector('a')?.href);
  const videoThumbnail = videoPosterEl?.querySelector('picture') || null;
  const mobileVideoThumbnail = mobileVideoPosterEl?.querySelector('picture') || null;
  let deviceVideoUrl = window.innerWidth < 768 ? bannerMobileVideoURL : bannerVideoURL;
  const deviceVideoThumbnail = window.innerWidth < 768 ? mobileVideoThumbnail : videoThumbnail;
  const logo = await getImageSource(logoEl) || null;
  const mobileLogo = await getImageSource(mobilelogoEl) || null;
  const logoAlt = logoAltEl?.textContent?.trim() || '';
  deviceVideoUrl = siteDomain + new URL(deviceVideoUrl).pathname;

  async function checkImageAvailablity(element, type) {
    const siteDomain = await getSiteDomain();
    if (element?.querySelector('img') || element?.querySelector('a')) {
      const src = element?.querySelector('img')?.outerHTML;
      if (!element?.querySelector('img')) {
        if (type === 'mute') {
          ismuteIcon = false;
        } else {
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

  const muteBtn = await checkImageAvailablity(muteBtnEl, 'mute');
  const unmuteBtn = await checkImageAvailablity(unmuteBtnEl, 'unmute');

  block.innerHTML = utility.sanitizeHtml(`
    <div class="banner-wrapper">
      ${deviceVideoThumbnail ? deviceVideoThumbnail?.outerHTML : ''}
      <div class="banner-video"></div> 
      <div class="banner-content">
        <div>
          ${logo ? `<div class="logo-wrapper"><img src="${logo}" alt="${logoAlt}" class="desktop-logo">
             <img src="${mobileLogo}" alt="${logoAlt}" class="mobile-logo">
            </div>`
      : ''}
          ${title?.outerHTML || '<!-- Title not found -->'}
          <p>${description}</p>
        </div>
        <div class="btn-wrapper">
          ${primaryCta ? `<div class="primary-btn-wrapper"><button class="btn btn-primary"><span>${primaryCta.outerHTML}</span></button></div>` : ''}
          ${secondaryCta ? `<div class="secondary-btn-wrapper"><button class="btn btn-secondary">${secondaryCta.outerHTML}</button></div>` : ''}
        </div>
      </div>
      <div class="mute-btn-wrapper">
        <button class="mute-btn active" aria-label="mutebtn">${ismuteIcon ? muteBtn : `<picture><img src="${muteBtn}"/></picture>`}</button>
        <button class="unmute-btn" aria-label="unmutebtn">${isunmuteIcon ? unmuteBtn : `<picture><img src="${unmuteBtn}"/></picture>`}</button>
      </div>
    </div>
  `);

  const initVideos = async () => {
    const videoPlayers = [];
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-wrapper');
    moveInstrumentation(videoEl, videoContainer);

    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js');
    videoElement.id = `video-${Math.random().toString(36).substr(2, 9)}`;
    videoElement.playsInline = true;
    videoElement.preload = 'auto';
    videoElement.loop = true;
    videoElement.width = '100%';
    // if (deviceVideoThumbnail) {
    //   const thumbnailImg = deviceVideoThumbnail.querySelector('img')?.src || '';
    //   videoElement.poster = thumbnailImg;
    // }
    videoContainer?.appendChild(videoElement);

    const bannerVideo = block.querySelector('.banner-video');
    if (bannerVideo) {
      bannerVideo.appendChild(videoContainer);
    }

    const config = {
      autoplay: false,
      fill: true,
      hasCustomPlayButton: false,
      loop: false,
      muted: true,
      preload: 'auto',
      controls: false,
      loadingSpinner: false,
      poster: null
    };

    // Mute/Unmute video functionality
    function videoMuteUnmute(player, muteBtnIcon, unmuteBtnIcon) {
      if (player.muted()) {
        player.muted(false);
        muteBtnIcon.classList.remove('active');
        unmuteBtnIcon.classList.add('active');
      } else {
        player.muted(true);
        muteBtnIcon.classList.add('active');
        unmuteBtnIcon.classList.remove('active');
      }
    }

    try {
      const player = await videojs(videoElement, config);
      player.src(deviceVideoUrl);
      videoPlayers.push(player);

      if (!player) {
        return;
      }

      const muteBtnWrapper = block.querySelector('.mute-btn');
      const unmuteBtnWrapper = block.querySelector('.unmute-btn');

      muteBtnWrapper.addEventListener('click', () => {
        if (player) {
          videoMuteUnmute(player, muteBtnWrapper, unmuteBtnWrapper);
        }
      });

      unmuteBtnWrapper.addEventListener('click', () => {
        if (player) {
          videoMuteUnmute(player, muteBtnWrapper, unmuteBtnWrapper);
        }
      });

      block.querySelector('.banner-wrapper video')?.addEventListener('playing',() => {
        block.querySelector('.banner-video')?.classList?.add('banner-video-playing');
        block.querySelector('.banner-wrapper picture')?.classList?.add('hidden');
      });

      videoPlayers[player.id] = player;
      // Intersection Observer to pause video when scrolling to the next section
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
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
        },
      );

      observer.observe(bannerVideo); // Start observing the video section
    } catch (error) {
      console.error('Error initializing videojs player:', error);
    }

    // Scroll functionality for CTA buttons
    block.querySelectorAll('a').forEach((link) => {
      const data = {};
      data.componentName = block.dataset.blockName;
      data.componentTitle = `${title.textContent.trim()}`;
      data.componentType = 'button';
      data.webName = link.textContent?.trim() || '';
      data.linkType = link;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        analytics.setButtonDetails(data);
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const targetPosition = targetElement.offsetTop;
          const offset = 10;
          window.scrollTo({
            top: targetPosition - offset,
            behavior: 'smooth',
          });
        }
      });
    });
    const initCtaButtons = () => {
      const primaryBtn = block.querySelector('.btn-primary');
      const secondaryBtn = block.querySelector('.btn-secondary');

      if (primaryBtn) {
        primaryBtn.addEventListener('click', (event) => {
          event.preventDefault();
          const targetId = primaryCta?.href; 
    
          if (targetId && targetId.startsWith('#')) {  
            const targetElement = document.querySelector(targetId); 
            if (targetElement) {
              const targetPosition = targetElement.offsetTop; 
              const offset = 10; 
              window.scrollTo({
                top: targetPosition - offset,  
                behavior: 'smooth', 
              });
            }
          }
        });
      }
      if (secondaryBtn) {
        secondaryBtn.addEventListener('click', (event) => {
          event.preventDefault();
          const secondaryCtaLink = secondaryCta?.href;

          if (secondaryCtaLink) {
            window.location.href = secondaryCtaLink;
          }
        });
      }
    };

    initCtaButtons();

  };

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
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
    });
  }
}