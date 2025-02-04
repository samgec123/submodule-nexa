import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import carouselUtils from '../../utility/carouselUtils.js';
import utility from '../../utility/utility.js';
import { loadVideoJs, waitForVideoJs } from './loadVideoJs.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default async function decorate(block) {
  const [titleEl, subTitleEl, descriptionEl, thumbnailEl , ...videosEl] = block.children;
  const { ariaLabelPip, ariaLabelFullscreen, publishDomain } = await fetchPlaceholders();

  const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6');
  title?.classList?.add('brand-film__title');

  const subTitle = subTitleEl.textContent?.trim();
  const thumbnail = thumbnailEl.querySelector('img');

  const description = Array.from(descriptionEl.querySelectorAll('h2'))
    .map((el) => {
      el.classList.add('brand-film__description-text');
      return el.outerHTML;
    })
    .join('');

  const videoControls = `
    <div class="video-controls-overlay">
      <div class="top-controls">
        <div class='left-section'>
          <button class="control-button pip-button" aria-label= ${ariaLabelPip}  type="button"></button>
          <button class="control-button fullscreen-button" aria-label= ${ariaLabelFullscreen} type="button"></button>
        </div>
        <div class='right-section'>
          <button class="control-button top sound-button" type="button"></button>
          <button class="control-button close-button" aria-label= 'close icon' type="button"></button>
        </div>
      </div>
      <div class="bottom-controls">
        <div class="left-section">
          <button class="control-button play-pause-button" type="button"></button>
          <button class="control-button sound-button" type="button"></button>
          <div class="video-timer">
            <p class="current-time">00:00</p>
            <p class="separator" role="separator">/</p>
            <p class="video-duration">00:00</p>
          </div>
        </div>
        <div class="right-section">
          <div class="progress-bar-container">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  block.innerHTML = utility.sanitizeHtml(`
    <div class="brand-film__container">
      ${description ? `<div class="brand-film__description">${description}</div>` : ''}
      <div class="brand-film__wrapper">
        <div class="brand-film__asset brand-film__asset--paused">
          ${videoControls}
          <div class="brand-film__slides brand-film__video--paused"></div>
        </div>
      </div>
      <div class="brand-film__content">
        <div class="brand-film__info">
          ${title ? title.outerHTML : ''}
          ${subTitle ? `<p class="brand-film__subtitle">${subTitle}</p>` : ''}
        </div>
        <div class="brand-film__navigation-wrapper">
        </div>
      </div>
    </div>
  `);

  let initalPlay = false;
  function isVisible(ele) {
    const { top, bottom } = ele.getBoundingClientRect();
    const vHeight = (window.innerHeight || document.documentElement.clientHeight);

    return (
      (top > 0 || bottom > 0)
      && (top + vHeight * 0.6) < vHeight
    );
  }

  const initVideos = async () => {
    const videoPlayers = [];
    const videosContainer = block.querySelector('.brand-film__slides');

    await videosEl.forEach(async (videoEl) => {
      const src = utility.getDeviceSpecificVideoUrl(videoEl?.querySelector('a')?.href);
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('brand-film__video-container');

      moveInstrumentation(videoEl, videoContainer);
      const video = document.createElement('video');
      video.classList.add('video-js', 'brand-film__video');
      video.id = `video-${Math.random().toString(36).substr(2, 9)}`;
      video.setAttribute('playsinline', '');
      videoContainer.append(video);

      // center play button
      const playBtn = document.createElement('span');
      playBtn.classList.add('brand-film__play-btn');
      videoContainer.append(playBtn);

      videosContainer.append(videoContainer);

      const config = {
        autoplay: false,
        fill: true,
        hasCustomPlayButton: false,
        loop: false,
        muted: true,
        poster: null,
        preload: 'auto',
        controls: false,
      };

      // eslint-disable-next-line no-undef
      const player = await videojs(video, config);
      player.src(src);
      videoPlayers.push(player);
    });

    const onChange = (currentSlide, targetSlide, direction) => {
      const currentVideo = currentSlide.querySelector('video');
      currentVideo?.pause();
      const video = targetSlide.querySelector('video');
      video?.play().then(() => {
        if (direction !== 0) {
          currentVideo.currentTime = 0;
        }
      });
    };

    const controller = carouselUtils.init(block.querySelector('.brand-film__container'), 'brand-film__slides', 'fade', {
      onChange,
      onReset: onChange,
      showArrows: true,
      showDots: false,
      navigationContainerClassName: 'brand-film__navigation-wrapper',
    });

    let isPlayed = false;
    let isEnded = false;

    const initPlay = () => {
      if (!isPlayed) {
        block.querySelectorAll('.brand-film__video-container video')?.forEach((vd) => {
          vd.removeAttribute('preload');
          vd.removeAttribute('poster');
        });
        isPlayed = true;
      }
    };

    const playPauseVideo = (player) => {
      isEnded = false;
      if (player?.paused()) {
        player?.play();
        player?.on('play', initPlay);
      } else {
        player?.pause();
      }
    };

    const formatVideoTime = (time) => {
      let seconds = Math.floor(time % 60);
      let minutes = Math.floor(time / 60);
      let hours = Math.floor(time / 3600);

      seconds = seconds < 10 ? `0${seconds}` : seconds;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      hours = hours < 10 ? `0${hours}` : hours;

      if (+hours === 0) {
        return `${minutes}:${seconds}`;
      }
      return `${hours}:${minutes}:${seconds}`;
    };

    const mouseDrag = {
      handleDrag: (e) => {
        const assetContainer = block.querySelector('.brand-film__wrapper');
        const size = assetContainer.getBoundingClientRect();
        assetContainer.style.left = `${e.clientX - size.width / 2}px`;
        assetContainer.style.top = `${e.clientY - size.height / 2}px`;
      },
      removeListeners: () => {
        document.removeEventListener('mousemove', mouseDrag.handleDrag);
        document.removeEventListener('mouseup', mouseDrag.removeListeners);
      },
      initDrag: () => {
        document.addEventListener('mouseup', mouseDrag.removeListeners);
        document.addEventListener('mousemove', mouseDrag.handleDrag);
      },
      reset: () => {
        block.querySelector('.brand-film__wrapper').removeEventListener('mousedown', mouseDrag.initDrag);
      },
      apply: () => {
        mouseDrag.reset();
        block.querySelector('.brand-film__wrapper').addEventListener('mousedown', mouseDrag.initDrag);
      },
    };

    const touchDrag = {
      handleDrag: (e) => {
        e.preventDefault();
        const assetContainer = block.querySelector('.brand-film__wrapper');
        const size = assetContainer.getBoundingClientRect();
        assetContainer.style.left = `${e.touches[0].clientX - size.width / 2}px`;
        assetContainer.style.top = `${e.touches[0].clientY - size.height / 2}px`;
      },
      removeListeners: () => {
        document.removeEventListener('touchmove', touchDrag.handleDrag);
        document.removeEventListener('touchend', touchDrag.removeListeners);
      },
      initDrag: () => {
        document.addEventListener('touchend', touchDrag.removeListeners);
        document.addEventListener('touchmove', touchDrag.handleDrag, {
          passive: false,
        });
      },
      reset: () => {
        block.querySelector('.brand-film__wrapper').removeEventListener('touchstart', touchDrag.initDrag);
      },
      apply: () => {
        touchDrag.reset();
        block.querySelector('.brand-film__wrapper').addEventListener('touchstart', touchDrag.initDrag);
      },
    };

    const resetPip = () => {
      const wrapper = block.querySelector('.brand-film__wrapper');
      wrapper.classList.remove('pip');
      wrapper.style.left = null;
      wrapper.style.top = null;
      mouseDrag.reset();
      touchDrag.reset();
    };

    const getCurrentPlayer = () => {
      const currentVideo = block.querySelector('.brand-film__video-container.carousel__slide--active');
      const currentPlayer = videoPlayers[currentVideo?.dataset?.slideIndex];
      return currentPlayer;
    };

    const playBtn = block.querySelector('.video-controls-overlay .play-pause-button');
    const soundBtns = block.querySelectorAll('.video-controls-overlay .sound-button');
    const fullscreenBtn = block.querySelector('.video-controls-overlay .fullscreen-button');
    const pipBtn = block.querySelector('.video-controls-overlay .pip-button');
    const closeBtn = block.querySelector('.video-controls-overlay .close-button');
    const progressBar = block.querySelector('.video-controls-overlay .progress-bar');
    const currentVideoTime = block.querySelector('.video-controls-overlay .current-time');
    const videoDuration = block.querySelector('.video-controls-overlay .video-duration');

    block.querySelectorAll('.brand-film__video-container')?.forEach((el) => {
      const video = el.querySelector('video');

      if (video) {
        el.addEventListener('click', () => {
          // eslint-disable-next-line no-undef
          const player = videojs.getPlayer(video?.id);
          playPauseVideo(player);
        });

        video.addEventListener('ended', () => {
          isEnded = true;
          block.querySelector('.brand-film__slides').classList.remove('brand-film__video--paused');
          block.querySelector('.brand-film__asset').classList.remove('brand-film__asset--paused');
          if (!controller.next()) {
            controller.reset();
          }
          const currentPlayer = getCurrentPlayer();
          if (video.muted) {
            currentPlayer.muted(true);
            block.querySelector('.brand-film__asset').classList.add('brand-film__asset--muted');
          } else {
            currentPlayer.muted(false);
            block.querySelector('.brand-film__asset').classList.remove('brand-film__asset--muted');
          }
        });

        video.addEventListener('playing', () => {
          isEnded = false;
          if (!block.querySelector('.carousel__slide--active video').paused) {
            block.querySelector('.brand-film__slides').classList.remove('brand-film__video--paused');
            block.querySelector('.brand-film__asset').classList.remove('brand-film__asset--paused');
          }
          initPlay();
        });

        video.addEventListener('pause', () => {
          isEnded = parseFloat(video.currentTime) === parseFloat(video.duration);
          if (!isEnded) {
            if (block.querySelector('.carousel__slide--active video').paused) {
              block.querySelector('.brand-film__slides').classList.add('brand-film__video--paused');
              block.querySelector('.brand-film__asset').classList.add('brand-film__asset--paused');
            }
          }
        });

        video.addEventListener('waiting', () => {
          block.querySelector('.brand-film__slides').classList.remove('brand-film__video--paused');
          block.querySelector('.brand-film__asset').classList.remove('brand-film__asset--paused');
        });

        video.addEventListener('timeupdate', (e) => {
          const { currentTime, duration } = e.target;
          const percent = (currentTime / duration) * 100;
          progressBar.style.width = `${percent}%`;

          currentVideoTime.innerText = formatVideoTime(currentTime);
          videoDuration.innerText = formatVideoTime(duration);
        });

        video.addEventListener('volumechange', () => {
          if (video.muted) {
            block.querySelector('.brand-film__asset').classList.add('brand-film__asset--muted');
          } else {
            block.querySelector('.brand-film__asset').classList.remove('brand-film__asset--muted');
          }
        });
      }
    });

    playBtn.addEventListener('click', () => {
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer) {
        playPauseVideo(currentPlayer);
      }
    });

    soundBtns.forEach((soundBtn) => {
      soundBtn.addEventListener('click', () => {
        const currentPlayer = getCurrentPlayer();
        if (currentPlayer.muted()) {
          currentPlayer.muted(false);
        } else {
          currentPlayer.muted(true);
        }
      });
    });

    fullscreenBtn.addEventListener('click', () => {
      const wrapper = block.querySelector('.brand-film__wrapper');

      if (wrapper.classList.contains('fullscreen')) {
        wrapper.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
      } else {
        wrapper.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        resetPip();
      }
    });

    pipBtn.addEventListener('click', () => {
      const wrapper = block.querySelector('.brand-film__wrapper');

      if (wrapper.classList.contains('pip')) {
        resetPip();
      } else {
        wrapper.classList.add('pip');
        mouseDrag.apply();
        touchDrag.apply();
        wrapper.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
      }
    });

    closeBtn.addEventListener('click', () => {
      const wrapper = block.querySelector('.brand-film__wrapper');
      resetPip();
      wrapper.classList.remove('fullscreen');
      document.body.style.overflow = 'auto';
    });

    if (!initalPlay && isVisible(block.querySelector('.brand-film__wrapper'))) {
      const player = getCurrentPlayer();
      if (player?.paused()) {
        player?.play();
      }
      initalPlay = true;
    } else {
      window.addEventListener('scroll', () => {
        if (!initalPlay && isVisible(block.querySelector('.brand-film__wrapper'))) {
          initalPlay = true;
          const player = getCurrentPlayer();
          if (player?.paused()) {
            player?.play();
          }
        }
      });
    }
  };

  const initializeVideos = () => {
    loadVideoJs(utility.isEditorMode(block) ? publishDomain : '');
    waitForVideoJs().then(() => {
      initVideos();
    });
  };

  if (Window.DELAYED_PHASE) {
    initializeVideos();
  } else {
    document.addEventListener('delayed-phase', () => {
      initializeVideos();
    });
  }

  function generateVideoSchema() {
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
    };

    let src;
    videosEl.forEach((videoEl) => {
      src = videoEl?.querySelector('a')?.href;
    });
        
    const titleElement = block.querySelector('.brand-film__title');
    const subtitleElement = block.querySelector('.brand-film__subtitle');

    const title = titleElement ? titleElement.innerText : document.head.querySelector('meta[property="og:title"]').content.trim();
    const subtitle = subtitleElement ? subtitleElement.innerText : document.head.querySelector('meta[name="description"]').content.trim();

    videoSchema.name = title;
    videoSchema.description = subtitle;
    videoSchema.thumbnailUrl = thumbnail.src.trim();
    videoSchema.contentUrl = src;
    videoSchema.embedUrl = src;
  
    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.innerText = JSON.stringify(videoSchema);
    scriptElement.crossOrigin = "anonymous";
  
    document.head.appendChild(scriptElement);
  }

  generateVideoSchema();
}
