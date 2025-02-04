import { utility, loadVideoJs, waitForVideoJs } from '../../utility/masterUtil.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { getSiteDomain } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    videoEl,
    videoPosterEl,
    mobileVideoEl,
    mobileVideoPosterEl,
    imgBtnEl,
    videoTitleE1,
    videoDescriptionEl,
    muteBtnEl,
    logoEl,
    mobilelogoEl,
    logoAltEl,
    unmuteBtnEl,
  ] = children;

  const title = titleEl || null;
  if (title) {
    title.classList.add('section-title');
  }
  if (utility.isEditorMode(block)) {
    block.classList.add('yy8-container-height-editor-mode');
  }

  const siteDomain = await getSiteDomain();

  async function checkImageAvailablity(element) {
    if (element?.querySelector('img')) {
      return element?.querySelector('img')?.src;
    }
    const el = element?.querySelector('a');
    if (el) {
      return (siteDomain + el?.getAttribute('href'));
    }
  }

  const description = descriptionEl?.textContent?.trim() || '';
  const videoTitle = videoTitleE1 || null;
  const videoDescription = videoDescriptionEl?.textContent?.trim() || '';
  const imgBtn = imgBtnEl?.querySelector('a') || '';
  const bannerVideo = utility.getDeviceSpecificVideoUrl(videoEl?.querySelector('a')?.href);
  const muteBtn = muteBtnEl?.querySelector('img') || '';
  const logo = await checkImageAvailablity(logoEl) || null;
  const mobileLogo = await checkImageAvailablity(mobilelogoEl) || null;
  const desktopVideoPoster = videoPosterEl?.querySelector('picture') || '';
  const logoAlt = logoAltEl?.textContent?.trim() || '';
  const unmuteBtn = unmuteBtnEl?.querySelector('img') || '';
  const mobileBannerVideo = utility.getDeviceSpecificVideoUrl(mobileVideoEl?.querySelector('a')?.href);
  const mobileVideoPoster = mobileVideoPosterEl?.querySelector('picture') || '';
  const videoPoster = window.innerWidth < 768 ? mobileVideoPoster : desktopVideoPoster;
  let deviceVideoUrl = window.innerWidth < 768 ? bannerVideo : mobileBannerVideo;
  deviceVideoUrl = siteDomain + new URL(deviceVideoUrl).pathname;
  block.innerHTML = utility.sanitizeHtml(`
           <div class="video-banner-wrapper">
           <div class="content-wrapper">
           ${logo
    ? `<div class="logo-wrapper">
                   <img src="${logo}" alt="${logoAlt}" class="desktop-logo">
                     <img src="${mobileLogo}" alt="${logoAlt}" class="mobile-logo">
             </div>`
    : ''
}
            <div class="video-content">          
                ${title?.outerHTML || '<!-- Title not found -->'}
                <p>${description} </p>
            </div>
            </div>
                <div class="video-block-container">
       <div class="banner-video-block" >
       <div class="video-wrapper">
       ${(videoPoster) ? `${videoPoster.outerHTML}` : ''}
       <video  
              class="video-js"
              src
              playsinline
              loop
              preload="auto"
              muted="muted"
              width="100%">
              </video>
           </div>
       </div>
         <div class="video-banner-overlay">
           <div class="container">
            ${videoTitle?.outerHTML || '<!-- Title not found -->'}
            <p>${videoDescription}</p>
            </div>
            <div class="mute-button-wrapper">
            <button class="mute-btn active">${muteBtn.outerHTML}</button>
              <button class="unmute-btn">${unmuteBtn.outerHTML}</button>
            </div>
         </div>
          </div> 

        </div> `);
  
  function videoMuteUnmute(player, muteBtnimg, unmuteBtnimg) {
    if (player.muted()) {
      player.muted(false); 
      muteBtnimg.classList.remove('active');
      unmuteBtnimg.classList.add('active');
    } else {
      player.muted(true); 
      muteBtnimg.classList.add('active');
      unmuteBtnimg.classList.remove('active');
    }
  }
  const initVideos = async () => {
    const videoPlayers = [];
    const videoElement = block.querySelector('.banner-video-block .video-wrapper video');

    const config = {
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      loadingSpinner: false,
      preload: 'auto',
      loadingSpinner: false,
      poster: null
    };

    try {
      const player = await videojs(videoElement, config, () => {
        const muteBtnWrapper = document.querySelector('.mute-btn');
        const unmuteBtnWrapper = document.querySelector('.unmute-btn');

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
      });

      player.src(deviceVideoUrl);
      videoPlayers.push(player);

      if (!player) {
        return;
      }

      block.querySelector('.yy8-technology-banner-container video')?.addEventListener('playing',() => {
        block.querySelector('.video-wrapper')?.classList?.add('banner-video-playing');
        block.querySelector('.video-wrapper picture')?.classList?.add('hidden');
      });

      videoPlayers[player.id] = player;
      // Intersection Observer to pause video when scrolling to the next section
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const threshold = isMobile ? 0.2 : 0.5;
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
          threshold, // Trigger when 50% of the section is in view
        },
      );

      observer.observe(videoElement); // Start observing the video section
    } catch (error) {
      console.error('Error initializing videojs player:', error);
    }
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

  if (window.DELAYED_PHASE) {
    initializeVideos();
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
    });
  }
}
