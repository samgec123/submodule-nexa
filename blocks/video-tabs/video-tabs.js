import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

function pauseAllVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((vid) => {
    if (!vid.paused) {
      vid.pause();
      vid.muted = true;
      const playBtn = vid.closest('.video-block-container').querySelector('.play-btn');
      if (playBtn) {
        playBtn.style.display = 'block';
      }
    }
  });
}
export default async function decorate(block) {
  block.classList.add('separator', 'separator-dark', 'separator-sm');
  const [titleEl1, descriptionEl1, ...videoCardsEl1] = block.children;
  const { ariaLabelFullscreen, publishDomain } = await fetchPlaceholders();
  videoCardsEl1.forEach((video) => {
    const { children } = video.children[0];
    const [titleEl, descriptionEl, videoEl, videoPosterEl, imgBtnEl] = children;

    if (titleEl) {
      titleEl.classList.add('video-title');
    }
    if (descriptionEl) {
      descriptionEl.classList.add('video-desc');
    }
    const imgBtn = imgBtnEl?.querySelector('a') || '';
    const desktopVideo = videoEl?.querySelector('a')?.textContent?.trim() || '';
    const videoPoster = videoPosterEl?.querySelector('img')?.src || '';

    const videoControls = `
      <div class="video-controls-overlay">
        <div class="top-controls">
          <div class='left-section'>
            <button class="control-button fullscreen-button" aria-label=${ariaLabelFullscreen} type="button"></button>
          </div>
        </div>
      </div>
    `;

    video.innerHTML = `
      <div class="video-banner-layout">
        <div class="video-banner-wrapper">
          <div class="container">
            <div class="video-block-container">
              <div class="video-overlay-container">
                ${videoControls}
                <video
                  src="${publishDomain}${desktopVideo}"
                  playsinline
                  loop
                  preload="auto"
                  muted="muted"
                  width="100%"
                  poster="${videoPoster}">
                </video>
                <button class="play-btn"><img src="${imgBtn}" alt="play-btn" class="img-fluid"/> </button>
              </div>
            </div>
            <div class="video-content">
              ${titleEl?.outerHTML || ''}
              ${descriptionEl?.outerHTML || ''}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  block.innerHTML = utility.sanitizeHtml(`
    <div class="video-wrapper">
      <div class="video-wrapper-title">
        ${titleEl1?.innerHTML}
      </div>
      <div class="video-wrapper-description">
        ${descriptionEl1?.outerHTML}
      </div>
    </div>
    <div class="video-wrapper-item">
       ${videoCardsEl1.map((element) => element?.outerHTML).join('')}
    </div>
  `);

  const videoCards = block.querySelectorAll('.video-block-container');

  videoCards.forEach((card) => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.play-btn');

    playBtn.addEventListener('click', () => {
      pauseAllVideos();

      if (video.paused) {
        video.play();
        video.muted = false;
        playBtn.style.display = 'none';
      } else {
        video.pause();
        video.muted = true;
        playBtn.style.display = 'block';
      }
    });

    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        video.muted = false;
        playBtn.style.display = 'none';
      } else {
        video.pause();
        video.muted = true;
        playBtn.style.display = 'block';
      }
    });

    video.addEventListener('timeupdate', () => {
      if (video.currentTime === video.duration) {
        playBtn.style.display = 'block';
      }
    });
  });

  const fullscreenBtn = block.querySelector('.video-controls-overlay .fullscreen-button');
  fullscreenBtn.addEventListener('click', () => {
    const wrapper = block.querySelector('.video-block-container');
    if (wrapper.classList.contains('fullscreen')) {
      wrapper.classList.remove('fullscreen');
      document.body.style.overflow = 'auto';
    } else {
      wrapper.classList.add('fullscreen');
      document.body.style.overflow = 'hidden';
    }
  });

  block.querySelectorAll('a').forEach((link) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = `${titleEl1.textContent.trim()}`;
    data.componentType = 'button';
    data.webName = link.textContent?.trim() || '';
    data.linkType = link;
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });
}
