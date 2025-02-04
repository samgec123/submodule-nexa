import utility from '../../utility/utility.js';
//import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import apiUtils from '../../utility/apiUtils.js';
import { loadVideoJs, waitForVideoJs } from '../brand-film-carousel/loadVideoJs.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    videoEl,
    videoPosterEl,
    imgBtnEl,
    muteBtnEl,
    unmuteBtnEl
  ] = children;
  const { ariaLabelFullscreen, publishDomain } = await fetchPlaceholders();
  if (titleEl) {
    titleEl?.classList.add('section-title');
  }
  const description = descriptionEl?.textContent?.trim() || '';
  const imgBtn = imgBtnEl?.querySelector('a') || '';
  const muteBtn = muteBtnEl?.querySelector('img') || '';
  const unmuteBtn = unmuteBtnEl?.querySelector('img') || '';
  const desktopVideo = videoEl?.querySelector('a')?.getAttribute('href') || '';
  const deviceVideoUrl = utility.getDeviceSpecificVideoUrl(desktopVideo);
  const videoPoster = videoPosterEl?.querySelector('img')?.src || '';
  let manualPause = false;

  const videoControls = `
    <div class="video-controls-overlay">
      <div class="top-controls">
        <div class='left-section'>
          <button class="control-button fullscreen-button" aria-label= ${ariaLabelFullscreen} type="button"></button>
        </div>
      </div>
    </div>
  `;

  block.innerHTML = utility.sanitizeHtml(`
    <div class="video-banner-layout">
      <div class="video-banner-wrapper">
        <div class="container">
          <div class="video-content">
              ${titleEl?.outerHTML || '<!-- Title not found -->'}
              <p class="desktop-only">${description} </p>
          </div>
          <div class="video-block-container">
            <div class="video-overlay-container">
              <picture><img src="${videoPoster}"></picture>
              ${videoControls}
              <video  
              class="video-js"
              src
              playsinline 
              loop 
              preload="auto" 
              muted="muted" 
              width="100%">
              </video>
              <button class="play-btn"><img src="${imgBtn}" alt="play-btn" class="img-fluid"/> </button>
            
              <div class="mute-btn-wrapper">
                <button class="mute-block-btn active">${muteBtn.outerHTML}</button>
                <button class="unmute-block-btn">${unmuteBtn.outerHTML}</button>
              </div>
            </div>
          </div>
            <p class="mobile-only">${description} </p>     
        </div>
      </div> 
    </div>`);

  const videoCards = block.querySelectorAll('.video-block-container');

  const initVideos = async () => {
    const config = {
      autoplay: false,
      controls: false,
      loop: true,
      muted: true,
      preload: 'auto',
      poster: null,
      loadingSpinner: false
    };
  
    const autoPlayWrapper = document.querySelector('.yy8-teaser-film .yy8-video-block-wrapper');
  
    videoCards.forEach(async (card) => {
      const videoElement = card.querySelector('.video-js');
      const playBtn = card.querySelector('.play-btn');
      const muteBtnWrapper = card.querySelector('.mute-block-btn');
      const unmuteBtnWrapper = card.querySelector('.unmute-block-btn');
      const fullscreenBtn = card.querySelector('.video-overlay-container .fullscreen-button');
     
  
      try {
        const player = await videojs(videoElement, config, function () {
          // Mute/Unmute logic
          const handleMuteUnmute = () => {
            if (player.muted()) {
              player.muted(false);
              muteBtnWrapper.classList.remove('active');
              unmuteBtnWrapper.classList.add('active');
            } else {
              player.muted(true);
              muteBtnWrapper.classList.add('active');
              unmuteBtnWrapper.classList.remove('active');
            }
          };
  
          muteBtnWrapper.addEventListener('click', handleMuteUnmute);
          unmuteBtnWrapper.addEventListener('click', handleMuteUnmute);
  
          // Auto-play logic
          if (autoPlayWrapper) {
            player.muted(true); // Ensure muted autoplay to prevent browser restrictions
            player.play();
  
            // Handle hover and touch events to maintain auto-play
            autoPlayWrapper.addEventListener('mouseover', () => {
              if (player.paused()) {
                player.play();
              }
            });
  
            autoPlayWrapper.addEventListener('touchmove', () => {
              if (player.paused()) {
                player.play();
              }
            });
          } else {
            // Play button logic
            playBtn.style.display = 'block'; // Show play button initially
            playBtn.addEventListener('click', () => {
              pauseAllVideos(player); // Pause other videos
              player.play();
              playBtn.style.display = 'none';
            });
          }
  
          // Fullscreen button logic
          fullscreenBtn.addEventListener('click', () => {
            const wrapper = card.querySelector('.video-overlay-container ');
            if (wrapper.classList.contains('fullscreen')) {
              wrapper.classList.remove('fullscreen');
              document.body.style.overflow = 'auto';
            } else {
              wrapper.classList.add('fullscreen');
              document.body.style.overflow = 'hidden';
            }
          });
  
          player.on('play', () => {
            playBtn.style.display = 'none';
          });
  
          player.on('pause', () => {
            if (!autoPlayWrapper) {
              playBtn.style.display = 'block';
            }
          });
  
          playBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              playBtn.click();
            }
          });
          videoElement.addEventListener('click', () => {
            if (!player.paused()) {
              player.pause(); 
            } 
          });
        });
  
        player.src(deviceVideoUrl);
        block.querySelector('.video-block-container video')?.addEventListener('playing',() => {
          block.querySelector('.video-block-container picture')?.classList?.add('hidden');
        });
  
        // Intersection observer to pause video when the section is not visible
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                player.pause();
                playBtn.style.display = 'block'; // Show play button when video is paused
              }
            });
          },
          { threshold: 0.1 } // Trigger when 10% of the video section is visible
        );
  
        observer.observe(card);
      } catch (error) {
        console.error('Error initializing videojs player:', error);
      }
    });
  };
  // Function to pause all videos except the one specified
  function pauseAllVideos(exceptPlayer) {
    videoCards.forEach((card) => {
      const video = card.querySelector('.video-js');
      if (video) {
        const player = videojs(video);
        if (player !== exceptPlayer) {
          player.pause();
          const playBtn = card.querySelector('.play-btn');
          if (playBtn) playBtn.style.display = 'block'; // Show play button for paused videos
        }
      }
    });
  }

  const initializeVideos = () => {
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
