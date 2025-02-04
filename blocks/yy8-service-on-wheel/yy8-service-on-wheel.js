import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    titleEl,
    descriptionEl,
    videoEl,
    videoTitleCustomEl,
    videoDescriptionEl,
    imgBannerFirstEl,
    imageAltFirstEl,
    imgTitleFirstEl,
    imgDescriptionFirstEl,
    imgBannerSecondEl,
    imageAltSecondEl,
    imgTitleSecondEl,
    imgDescriptionSecondEl,
    imgBannerThirdEl,
    imageAltThirdEl,
    imgTitleThirdEl,
    imgDescriptionThirdEl,
    imgBannerFourthEl,
    imageAltFourthEl,
    imgTitleFourthEl,
    imgDescriptionFourthEl,
    playerImgE1,
  ] = children;

  const { publishDomain } = await fetchPlaceholders();
  const title = titleEl || null;
  if (title) {
    title.classList.add('section-title');
  }
  const description = descriptionEl?.textContent?.trim() || '';
  const desktopVideo = videoEl?.querySelector('a')?.textContent?.trim() || '';

  const videoTitle = videoTitleCustomEl?.textContent?.trim() || '';
  const videoDescription = videoDescriptionEl?.textContent?.trim() || '';
  const imgFirst = imgBannerFirstEl?.querySelector('img')?.src || '';
  const imgFirstAlt = imageAltFirstEl?.textContent?.trim() || '';
  const imgTitleFirst = imgTitleFirstEl?.textContent?.trim() || '';
  const imgDescFirst = imgDescriptionFirstEl?.textContent?.trim() || '';

  const imgSecond = imgBannerSecondEl?.querySelector('picture img')?.src || '';
  const imgSecondAlt = imageAltSecondEl?.textContent?.trim() || '';
  const imgTitleSecond = imgTitleSecondEl?.textContent?.trim() || '';
  const imgDescSecond = imgDescriptionSecondEl?.textContent?.trim() || '';

  const imgThird = imgBannerThirdEl?.querySelector('picture img')?.src || '';
  const imgThirdAlt = imageAltThirdEl?.textContent?.trim() || '';
  const imgTitleThird = imgTitleThirdEl?.textContent?.trim() || '';
  const imgDescThird = imgDescriptionThirdEl?.textContent?.trim() || '';

  const imgFourth = imgBannerFourthEl?.querySelector('picture img')?.src || '';
  const imgFourthAlt = imageAltFourthEl?.textContent?.trim() || '';
  const imgTitleFourth = imgTitleFourthEl?.textContent?.trim() || '';
  const imgDescFourth = imgDescriptionFourthEl?.textContent?.trim() || '';
  const PlayerImgBtn = playerImgE1?.querySelector('img')?.src || '';
  block.innerHTML = utility.sanitizeHtml(`
    
    <div class="Service_on_Wheels">
    <div class="container">
        <div class="header-content">
             ${title?.outerHTML || ''}
            <p class="service-description">${description}</p>
        </div>
          </div>
        <div class="row" id="video-grid">
            <!-- Video Card 1 -->
            <div class="col-md-6 col-sm-6 video-card">
                <div class="video-container">
                <video src="${publishDomain}${desktopVideo}" playsinline autoplay loop muted="muted" preload="metadata" width="100%"></video>
                   <button class="play-slider-btn"><img src="${PlayerImgBtn}"  class="img-fluid"/> </button>  
                <div class="card-body">
                        <h5>${videoTitle}</h5>
                        <p>${videoDescription}</p>
                    </div>
                </div>
            </div>

            <!-- Slider Cards -->
            <div class="col-md-6 col-sm-6 slider-container">
                <div class="slider">
                    <div class="slider-card">
                        <img src="${imgFirst}" alt="${imgFirstAlt}">
                        <div class="caption">
                            <h5>${imgTitleFirst}</h5>
                            <p>${imgDescFirst}</p>
                        </div>
                    </div>
                    <div class="slider-card">
                        <img src="${imgSecond}" alt="${imgSecondAlt}">
                        <div class="caption">
                            <h5>${imgTitleSecond}</h5>
                            <p>${imgDescSecond}</p>
                        </div>
                    </div>
                    <div class="slider-card">
                        <img src="${imgThird}" alt="${imgThirdAlt}">
                        <div class="caption">
                            <h5>${imgTitleThird}</h5>
                            <p>${imgDescThird}</p>
                        </div>
                    </div>
                    <div class="slider-card">
                        <img src="${imgFourth}" alt="${imgFourthAlt}">
                        <div class="caption">
                            <h5>${imgTitleFourth}</h5>
                            <p>${imgDescFourth}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
        <div class="arrow">
        <button class="prev">&#8592;</button>
        <button class="next">&#8594;</button>
        </div>
  </div>
</div>
    `);

  const videoContainer = document.querySelectorAll('.video-container');
  videoContainer.forEach((card) => {
    const video = card.querySelector('video');
    video.addEventListener('mouseenter', () => {
      video.play();
    });

    video.addEventListener('mouseleave', () => {
      video.pause();
    });
  });

  let currentIndex = 0;

  function toggleButtons(totalSlides, visibleCards) {
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= totalSlides - visibleCards;
  }

  function moveSlider(direction) {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slider-card');
    const sliderContainer = document.querySelector('.slider-container');
    const cardWidth = slides[0].offsetWidth + parseFloat(getComputedStyle(slider).gap);
    const visibleCards = Math.floor(sliderContainer.offsetWidth / cardWidth);
    const totalSlides = slides.length;

    if (direction === 'next' && currentIndex < totalSlides - visibleCards) {
      currentIndex += 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      currentIndex -= 1;
    }

    const offset = -currentIndex * cardWidth;
    slider.style.transform = `translateX(${offset}px)`;
    toggleButtons(totalSlides, visibleCards);
  }

  document.querySelector('.prev').addEventListener('click', () => moveSlider('prev'));
  document.querySelector('.next').addEventListener('click', () => moveSlider('next'));

  window.addEventListener('resize', () => moveSlider('init'));
  moveSlider('init');
}
