import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import apiUtils from '../../utility/apiUtils.js';
import { loadVideoJs, waitForVideoJs } from '../brand-film-carousel/loadVideoJs.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    videoCustomFirstEl,
    titleVideoFirstEl,
    descriptionVideoFirstEl,
    videoCustomSecondEl,
    titleVideoSecondEl,
    descriptionVideoSecondEl,
    imgBtnEl,
  ] = children;

  const { publishDomain } = await fetchPlaceholders();

  const title = titleEl || null;
  if (title) {
    title.classList.add('section-title');
  }
  const videoOneUrl = videoCustomFirstEl?.querySelector('a')?.getAttribute('href') || '';
  const deviceVideoUrlOne = utility.getDeviceSpecificVideoUrl(videoOneUrl);

  const videoTitleFirst = titleVideoFirstEl?.textContent?.trim() || '';
  const videoDescriptionFirst = descriptionVideoFirstEl?.textContent?.trim() || '';

  const videoSecondUrl = videoCustomSecondEl?.querySelector('a')?.getAttribute('href') || '';
  const deviceVideoUrlSecond = utility.getDeviceSpecificVideoUrl(videoSecondUrl);
  const videoTitleSecond = titleVideoSecondEl?.textContent?.trim() || '';
  const videoDescriptionSecond = descriptionVideoSecondEl?.textContent?.trim() || '';

  const combinedDeviceVideoUrls = [deviceVideoUrlOne, deviceVideoUrlSecond];

  const playBtn = imgBtnEl?.querySelector('a') || '';
  const videoUrl = `${publishDomain}${videoSecondUrl}`;
  block.innerHTML = utility.sanitizeHtml(`
        <div class="grid-video-wrapper">
                ${title?.outerHTML || '<!-- Title not found -->'}
                <div class="video-card-section">
                    <div class="video-card">
                        <div class="video-section">
                            <button class="play-video-btn">
                                <img src="${playBtn}" alt="play-btn" class="img-fluid"/> 
                            </button>
                            <video src loop muted preload="auto" playsinline width="100%" class="img-fluid"></video>
                            <div class="card-text">
                                <h3>${videoTitleFirst}</h3>
                                <p>${videoDescriptionFirst}</p>
                            </div>
                        </div>
                    </div>
                    <div class="video-card">
                        <div class="video-section">
                            <button class="play-video-btn">
                                <img src="${playBtn}" alt="play-btn" class="img-fluid"/> 
                            </button>
                            <video src playsinline loop muted preload="auto" width="100%" class="img-fluid"></video>
                            <div class="card-text">
                                <h3>${videoTitleSecond}</h3>
                                <p>${videoDescriptionSecond}</p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    `);

  const videoCards = block.querySelectorAll('.video-card');
  videoCards.forEach((card) => {
    let video = card.querySelector('video');
    const playVideoBtn = card.querySelector('.play-video-btn');
    const cardText = card.querySelector('.card-text');

    const isMobileView = window.innerWidth < 768;

    if (isMobileView) {
      playVideoBtn.style.visibility = 'visible';

      playVideoBtn.addEventListener('click', () => {
        video = card.querySelector('video');
        video.play();
        playVideoBtn.style.visibility = 'hidden';
        cardText.style.visibility = 'hidden';
      });
    } else {
      video.addEventListener('mouseenter', () => {
        playVideoBtn.style.visibility = 'hidden';
        cardText.style.visibility = 'hidden';
        video.play();
      });
    }

    video.addEventListener('mouseleave', () => {
      playVideoBtn.style.visibility = 'visible';
      cardText.style.visibility = 'visible';
      video.pause();
      video.currentTime = 0;
    });
  });

  function generateVideoSchema(videoEl, titleElement, descriptionElement) {
    const videoSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
    };

    const src = videoEl?.querySelector('a')?.href;

    const titleEle = titleElement || document.head.querySelector('meta[property="og:title"]').content.trim();
    const description = descriptionElement || document.head.querySelector('meta[name="description"]').content.trim();

    videoSchema.name = titleEle;
    videoSchema.description = description;
    videoSchema.contentUrl = src;
    videoSchema.embedUrl = src;

    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.innerText = JSON.stringify(videoSchema);
    scriptElement.crossOrigin = 'anonymous';

    document.head.appendChild(scriptElement);
  }

  generateVideoSchema(videoCustomFirstEl, videoTitleFirst, videoDescriptionFirst);
  generateVideoSchema(videoCustomSecondEl, videoTitleSecond, videoDescriptionSecond);
  const initVideos = async () => {
    const videoPlayers = [];

    const videoElements = block.querySelectorAll('.video-section video');
    videoElements[0].src = combinedDeviceVideoUrls[0];
    videoElements[1].src = combinedDeviceVideoUrls[1]; 

    const bannerVideo = block.querySelector('.video-section');

    const config = {
      autoplay: false,
      controls: false,
      loop: true,
      muted: true,
      preload: 'auto',
      loadingSpinner: false
    };

    videoElements.forEach((videoElement, index) => {
      try {
        const player = videojs(videoElement, config);
        player.src(combinedDeviceVideoUrls[index]); // Set specific source
        videoPlayers.push(player);
  
        // Intersection Observer logic (if needed)
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                player.play();
              } else {
                player.pause();
              }
            });
          },
          {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
          }
        );
  
        document.addEventListener('DOMContentLoaded', () => {
          const parent = videoElement.parentElement;
          if (parent && parent instanceof Element) {
            observer.observe(parent);
          } else {
            console.error('no parent');
          }
        });
      } catch (error) {
        console.error('Error initializing videojs player:', error);
      }
    });

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
  };

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
