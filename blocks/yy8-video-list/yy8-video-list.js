import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { loadVideoJs, waitForVideoJs } from '../brand-film-carousel/loadVideoJs.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const [titleEl, showMoreCTALabelEl, showLessCTALabelEl, imgBtnEl, ...videoListEl] = block.children;
  const { publishDomain } = await fetchPlaceholders();

  const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6');
  title?.classList?.add('heading');
  const showMoreCTALabel = showMoreCTALabelEl?.textContent?.trim() || '';
  const showLessCTALabel = showLessCTALabelEl?.textContent?.trim() || '';
  const imgBtn = imgBtnEl?.querySelector('a') || '';

  let videoCardsHTML = '';
  videoListEl.forEach((item, index) => {
    const [videoEl, videoThumbnailEl, titleVideoEl, descriptionVideoEl] = item.children;
    const bannerVideo = utility.getDeviceSpecificVideoUrl(videoEl?.querySelector('a')?.href);
    const deviceVideoUrl = bannerVideo;
    const itemTitle = titleVideoEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
    const itemDescription = descriptionVideoEl?.children[0]?.innerHTML || '';
    const isHidden = index >= 3 ? 'more-video' : '';
    const videoThumbnail = videoThumbnailEl?.querySelector('img')?.src || '';

    item.innerHTML = utility.sanitizeHtml(`
      <div class="col-md-4 col-sm-6 video-card ${isHidden}" style="${index >= 3 ? 'display: none;' : ''}">
        <div class="video-container">
          <video
            src
            playsinline
            preload="auto"
            muted="muted"
            poster="${videoThumbnail}"
            width="100%">
          </video>
          <button class="play-btn"><img src="${imgBtn}" alt="play-btn" class="img-fluid"/></button>
        </div>
        <div class="card-body">
          ${itemTitle?.outerHTML || '<!-- Title not found -->'}
          <p>${itemDescription}</p>
        </div>
      </div>
    `);
    moveInstrumentation(item, item.firstElementChild);
    videoCardsHTML += item.innerHTML;

    const initVideos = async () => {
      const videoElements = block.querySelectorAll('.video-container video');
      const videoContainers = block.querySelectorAll('.video-container');
      const videoPlayers = [];
      const config = {
        autoplay: false,
        controls: false,
        loop: false,
        muted: true,
        preload: 'auto',
        loadingSpinner: false
      };

      videoElements.forEach((videoElement, index_1) => {
        if(index === index_1) {
            try {
              const player = videojs(videoElement, config);
              player.src(deviceVideoUrl);
              videoPlayers.push(player);

              const videoContainer = videoContainers[index_1];
              const playBtn = videoContainer?.querySelector('.play-btn img');
              const spinner = document.createElement('div');
              spinner.className = 'video-spinner';
              spinner.style.display = 'none';
              videoContainer?.appendChild(spinner);
              const isMobileView = window.innerWidth < 768;
              if (isMobileView) {
                playBtn?.addEventListener('click', () => {
                  // video = card.querySelector('video');
                  videoContainers.forEach((container,i )=> {
                    const video = container?.querySelector('video');
                    const playbtns = block?.querySelectorAll('.play-btn img');
                    if (index === i) {
                      video.play();
                      playbtns[index].style.opacity = '0';
                    }
                    else {
                      playbtns[i].style.opacity = '1';
                      video.pause();
                    }
                  });
                });
              }else {
                videoContainer?.addEventListener('mouseenter', () => {
                  videoPlayers.forEach((otherPlayer) => {
                    if (otherPlayer !== player) {
                      otherPlayer.pause();
                    }
                  });
                  player.play();
                  playBtn.style.opacity = '0';
                });
  
                videoContainer?.addEventListener('mouseleave', () => {
                  player.pause();
                  playBtn.style.opacity = '1';
                });
              }
            player.on('waiting', () => {
              spinner.style.display = 'block';
            });
            player.on('ended', () => {
              playBtn.style.opacity = '1';
            });
            player.on('playing', () => {
              spinner.style.display = 'none';
            });

            } catch (error) {
              console.error('Error initializing videojs player:', error);
            }
        }
      });

      videoPlayers.forEach((player) => {
        player.pause();
      });
    };

    const initializeVideos = () => {
      loadVideoJs(utility.isEditorMode(block) ? publishDomain : '');
      waitForVideoJs()
        .then(() => {
          initVideos();
        })
        .catch((error) => {
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
  });

  block.innerHTML = utility.sanitizeHtml(`
    <div class="video-list-wrapper">
      ${title?.outerHTML || '<!-- Title not found -->'}
      <div class="row g-4" id="video-grid">
        ${videoCardsHTML}
      </div>

      <div class="center-button-container">
        <button class="show-more-btn btn btn-secondary" id="show-more-btn">
          <a>${showMoreCTALabel} <span class="arrow-down"><img src="/icons/arrow-down-white.svg"/></span></a>
        </button>
        <button class="show-less-btn btn btn-secondary" id="show-less-btn" style="display: none;">
          <a>${showLessCTALabel}<span class="arrow-up"><img src="/icons/arrow-up-white.svg"/></span></a>
        </button>
      </div>
    </div>
  `);

  document.querySelectorAll('.center-button-container').forEach((buttonContainer) => {
    const showButton = document.querySelector('.center-button-container');
    const showMoreBtn = buttonContainer.querySelector('.show-more-btn');
    const showLessBtn = buttonContainer.querySelector('.show-less-btn');
    const videoGrid = buttonContainer.closest('.video-list-wrapper').querySelectorAll('.more-video');
    const totalVideos = buttonContainer.closest('.video-list-wrapper').querySelectorAll('.video-card').length;
    let scrollTopButton;
    
    if (totalVideos <= 3) {
      showMoreBtn.style.display = 'none';
      showLessBtn.style.display = 'none';
      showButton.style.display = 'none';
    } else {
      showMoreBtn.addEventListener('click', () => {
        videoGrid.forEach((video) => {
          video.style.display = 'block';
        });
        scrollTopButton = window.scrollY;      
        showMoreBtn.style.display = 'none';
        showLessBtn.style.display = 'inline-block';
      });

      showLessBtn.addEventListener('click', () => {
        videoGrid.forEach((video) => {
          video.style.display = 'none';
        });
        window.scrollTo(0,scrollTopButton);
        showMoreBtn.style.display = 'inline-block';
        showLessBtn.style.display = 'none';
      });
    }
  });

  block.querySelectorAll('a').forEach((link) => {
    const data = {
      componentName: block.dataset.blockName,
      componentTitle: `${title.textContent.trim()}`,
      componentType: 'CTA',
      webName: link.textContent.trim() || '',
      linkType: link,
    };
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });
}
