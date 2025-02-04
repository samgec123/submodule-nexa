import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import { loadVideoJs, waitForVideoJs } from '../brand-film-carousel/loadVideoJs.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    idEl,
    bannervideoEl,
    bannervideoAltEl,
    titleBannerEl,
    descriptionEl,
    imgPlayBtnEl,
    imgMuteBtnEl,
    thumbnailImgEl,
    videoPosterEl,
    thumbnailVideoFirstTitleEl,
    thumbnailVideoFirstImageEl,
    thumbnailVideoSecondTitleEl,
    thumbnailVideoSecondImageEl,
    thumbnailVideoThirdTitleEl,
    thumbnailVideoThirdImageEl,
    thumbnailVideoFourthTitleEl,
    thumbnailVideoFourthImageEl,
    thumbnailVideoFifthTitleEl,
    thumbnailVideoFifthImageEl,
    thumbnailVideoSixthTitleEl,
    thumbnailVideoSixthImageEl,
    thumbnailVideoSeventhTitleEl,
    thumbnailVideoSeventhImageEl,
    thumbnailVideoEighthTitleEl,
    thumbnailVideoEighthImageEl
  ] = children;

  const { publishDomain } = await fetchPlaceholders();

  function getImageUrl(elem) {
    return elem?.querySelector('picture img')?.src || elem?.querySelector('a')?.href || '';
  }

  const id = idEl?.textContent?.trim() || '';
  const bannerVideo = bannervideoEl?.querySelector('a')?.getAttribute('href') || '';
  const deviceVideoUrl = utility.getDeviceSpecificVideoUrl(bannerVideo);
  const bannerVideoAlt = bannervideoAltEl?.textContent?.trim() || '';
  const title = titleBannerEl;
  title?.classList?.add('heading-text');
  const description = descriptionEl?.textContent?.trim() || '';

  const thumbnailTitles = [
    thumbnailVideoFirstTitleEl?.textContent?.trim() || '',
    thumbnailVideoSecondTitleEl?.textContent?.trim() || '',
    thumbnailVideoThirdTitleEl?.textContent?.trim() || '',
    thumbnailVideoFourthTitleEl?.textContent?.trim() || '',
    thumbnailVideoFifthTitleEl?.textContent?.trim() || '',
    thumbnailVideoSixthTitleEl?.textContent?.trim() || '',
    thumbnailVideoSeventhTitleEl?.textContent?.trim() || '',
    thumbnailVideoEighthTitleEl?.textContent?.trim() || ''
  ];

  const thumbnailImageURL = [
    thumbnailVideoFirstImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoSecondImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoThirdImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoFourthImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoFifthImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoSixthImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoSeventhImageEl?.querySelector('picture img')?.src || '',
    thumbnailVideoEighthImageEl?.querySelector('picture img')?.src || ''
  ];

  const defaultThumbnailImg = `${getImageUrl(thumbnailImgEl)}`;
  const uniqueId = `instance-${Math.random().toString(36).substr(2, 9)}`;

  const dotsContainerId = `${uniqueId}-dots-container`;
  const videoPlayerId = `${uniqueId}-video-player`;
  const thumbnailsContainerId = `${uniqueId}-thumbnails-container`;
  let videoPoster = videoPosterEl?.querySelector('img')?.src || '';
  videoPoster = videoPoster.includes('id=1') ? videoPoster: videoPoster+ '&id=1';
  const playBtn = getImageUrl(imgPlayBtnEl);
  const muteBtn = getImageUrl(imgMuteBtnEl);

  if (id) {
    block.setAttribute('id', id);
  }

  if (utility.isEditorMode(block)) {
    block.classList.add('yy8-container-height-editor-mode');
  }


  const renderThumbnail = (title, thumbnailImageURL, playBtn, muteBtn, uniqueId, timestamp) => {
    if (!title) return '';
    return `
      <div class="thumbnail" data-timestamp="${timestamp}">
        <img class="thumbnail-img" src="${thumbnailImageURL}&id=1" alt="Thumbnail">
        <img class="fa-play play-pause-icon" src="${playBtn}" alt="play-btn" />
        <img class="fa-volume-up mute-icon" src="${muteBtn}" alt="mute-btn" />
        <div class="caption" id="${uniqueId}-caption-${timestamp}">${title}</div>
      </div>
    `;
  };

  const thumbnailsHTML = thumbnailTitles
    .map((title, index) => renderThumbnail(title, thumbnailImageURL[index], playBtn, muteBtn, uniqueId, (index + 1) * 2))
    .join('');

  block.innerHTML = utility.sanitizeHtml(`
    <div class="video-container">
    <video crossorigin="anonymous" src alt="${bannerVideoAlt}" id="${videoPlayerId}" class="video-js vjs-default-skin" playsinline muted preload="auto" width="100%"
      height="auto" poster="${videoPoster}">
    </video>
      <div class="heading-thumbnail">
        <div class="heading">
          ${title?.outerHTML || '<!-- Title not found -->'}
          <p class="description">${description}</p>
        </div>
        <div class="carousel-wrapper">
          <div id="${thumbnailsContainerId}" class="thumbnails">
            ${thumbnailsHTML}
          </div>
        </div>
      </div>
      <div class="carousel-arrows">
        <span class="arrow" id="prev-arrow"><img src="${window.hlx.codeBasePath}/icons/west.svg" alt="Previous" /></span>
        <span class="arrow" id="next-arrow"><img src="${window.hlx.codeBasePath}/icons/east.svg" alt="Next" /></span>
      </div>
      <div class="dots" id="${dotsContainerId}"></div>
    </div>
  `);

  const videoPlayer = block.querySelector(`#${videoPlayerId}`);
  const thumbnailsContainer = block.querySelector(`#${thumbnailsContainerId}`);
  const dotsContainer = block.querySelector(`#${dotsContainerId}`);
  const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
  const prevArrow = block.querySelector('.carousel-arrows #prev-arrow');
  const nextArrow = block.querySelector('.carousel-arrows #next-arrow');
  const playPauseIcons = block.querySelectorAll('.fa-play.play-pause-icon');
  const muteIcons = block.querySelectorAll('.mute-icon');

  const updateThumbnail = (thumbnailEl, thumbnailImgUrl) => {
    const thumbnailImg = thumbnailEl.querySelector('.thumbnail-img');
    if (thumbnailImg) {
      if (thumbnailImgUrl) {
        thumbnailImg.src = thumbnailImgUrl;
      } else {
        thumbnailImg.src = defaultThumbnailImg;
      }
    }
  };

  videoPlayer.addEventListener('canplay', () => {
    videoPlayer.play();
  });

  if (!dotsContainer || thumbnails.length === 0) return;

  const numberOfThumbnails = thumbnails.length;

  if (dotsContainer && numberOfThumbnails > 0) {
    dotsContainer.innerHTML = '';

    thumbnails.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
    if (numberOfThumbnails !== dotsContainer.children.length) {
      console.warn(`Mismatch between number of thumbnails (${numberOfThumbnails}) and dots (${dotsContainer.children.length})`);
    }
  }

  let currentIndex = 0;

  function goToSlide(index) {
    if (index < 0 || index >= dotsContainer.children.length) return;

    const activeDot = dotsContainer.querySelector('.dot.active');
    if (activeDot) activeDot.classList.remove('active');

    const dot = dotsContainer.querySelectorAll('.dot')[index];
    dot.classList.add('active');

    const thumbnail = thumbnails[index];
    const timestamp = parseFloat(thumbnail.getAttribute('data-timestamp'));
    videoPlayer.currentTime = timestamp;

    if(!videoPlayer.src instanceof HTMLVideoElement) {
        videoPlayer.play().catch(error => {
          console.error("Play request interrupted:", error);
        });
    }
    const thumbnailImgUrl = thumbnail.querySelector('.thumbnail-img').src;

    updateThumbnail(thumbnail, thumbnailImgUrl);
    currentIndex = index;
    updateArrows();
  }

  function updateArrows() {
    if (currentIndex === 0) {
      prevArrow.disabled = true;
    } else {
      prevArrow.disabled = false;
    }

    if (currentIndex === dotsContainer.children.length - 1) {
      nextArrow.disabled = true;
    } else {
      nextArrow.disabled = false;
    }
  }

  goToSlide(currentIndex);

  highlightThumbnail(currentIndex);
  function highlightThumbnail(index) {
    thumbnails.forEach(thumbnail => thumbnail.classList.remove('highlight'));

    const currentThumbnail = thumbnails[index];
    if (currentThumbnail) {
      currentThumbnail.classList.add('highlight');
    }
  }

  // Add swipe detection for mobile view
  let startX = 0;
  let endX = 0;

  const carouselWrapper = block.querySelector('.carousel-wrapper');

  carouselWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  carouselWrapper.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  });

  carouselWrapper.addEventListener('touchend', () => {
    if (startX > endX + 50) {
      nextArrow.click();
    } else if (startX < endX - 50) {
      prevArrow.click();
    }
  });

  prevArrow.addEventListener('click', () => {
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = thumbnails.length - 1;
    }
    goToSlide(currentIndex);
    highlightThumbnail(currentIndex);
    updateArrows();

    const thumbnailsContainer = block.querySelector(`#${thumbnailsContainerId}`);
    carouselWrapper.scrollLeft -= thumbnailsContainer.children[0].offsetWidth;
  });

  nextArrow.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= thumbnails.length) {
      currentIndex = 0;
    }
    goToSlide(currentIndex);
    highlightThumbnail(currentIndex);
    updateArrows();

    const thumbnailsContainer = block.querySelector(`#${thumbnailsContainerId}`);
    carouselWrapper.scrollLeft += thumbnailsContainer.children[0].offsetWidth;
  });


  function generateVideoSchema() {
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
    };

    let src = bannervideoEl?.querySelector('a')?.href;

    const titleElement = block.querySelector('.heading-text');
    const descriptionElement = block.querySelector('.description');

    const title = titleElement ? titleElement.innerText : document.head.querySelector('meta[property="og:title"]').content.trim();
    const description = descriptionElement ? descriptionElement.innerText : document.head.querySelector('meta[name="description"]').content.trim();

    videoSchema.name = title;
    videoSchema.description = description;
    videoSchema.thumbnailUrl = videoPoster.trim();
    videoSchema.contentUrl = src;
    videoSchema.embedUrl = src;

    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.innerText = JSON.stringify(videoSchema);
    scriptElement.crossOrigin = "anonymous";

    document.head.appendChild(scriptElement);
  }

  generateVideoSchema();
  const initVideos = async () => {
    const videoPlayers = [];

    const videoElement = block.querySelector('.video-container video');

    const bannerVideo = block.querySelector('.video-container');

    const config = {
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      preload: 'auto',
      loadingSpinner: false
    };

    try {
      const player = await videojs(videoElement, config, function () {
        const muteBtnWrapper = document.querySelector('.fa-volume-up.mute-icon');
        const unmuteBtnWrapper = document.querySelector('.fa-volume-up.mute-icon');

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

      videoPlayers[player.id] = player;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
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

      observer.observe(bannerVideo);
    } catch (error) {
      console.error('Error initializing videojs player:', error);
    }

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
          //          window.scrollTo({
          //            top: targetPosition - offset,
          //            behavior: 'smooth',
          //          });
        }
      });
    });
  };

  // Mute/Unmute video functionality
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

  const initializeVideos = () => {
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