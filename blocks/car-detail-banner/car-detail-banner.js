import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const componentIdEL = block.children[0].children[0];

  const {
    ariaLabelPrev, ariaLabelNext, ariaLabelCarouselDot,
  } = await fetchPlaceholders();

  const componentId = componentIdEL?.textContent?.trim();
  if (componentId) {
    block.setAttribute('id', componentId);
  }

  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'variant_carousel_container';

  for (let i = 1; i < block.children.length; i += 1) {
    const innerDiv = block.children[i];

    const [
      titleEl,
      subtitleEl,
      descriptionEl,
      desktopImageEl,
      mobileImageEl,
      altTextEl,
      primaryCtaTextEl,
      primaryCtaLinkEl,
      primaryCtaLinkTargetEl,
      secondaryCtaTextEl,
      secondaryCtaLinkEl,
      secondaryCtaLinkTargetEl,
    ] = innerDiv.children;

    const title = titleEl?.innerHTML || '';

    const subtitle = subtitleEl?.innerHTML || '';
    const description = descriptionEl?.innerHTML || '';
    const desktopImageSrc = desktopImageEl?.querySelector('img')?.src || '';
    const mobileImageSrc = mobileImageEl?.querySelector('img')?.src || '';
    const altText = altTextEl?.textContent?.trim() || 'icon';
    const primaryCtaText = primaryCtaTextEl?.textContent?.trim() || '';
    const primaryLink = primaryCtaLinkEl?.querySelector('.button-container a')?.href || '';
    const primaryTarget = primaryCtaLinkTargetEl?.textContent?.trim() || '_self';
    const secondaryCtaText = secondaryCtaTextEl?.textContent?.trim() || '';
    const secondaryLink = secondaryCtaLinkEl?.querySelector('.button-container a')?.href || '';
    const secondaryTarget = secondaryCtaLinkTargetEl?.textContent?.trim() || '_self';

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
     block.children[i].classList.add(`slide-${i}`, 'variant_slide');
    block.children[i].innerHTML = `
      <div class="image-container">
        <img src="${isMobile ? mobileImageSrc : desktopImageSrc}" alt="${altText} class="variant_image">
        <div class="variant_slide-data">
          <div class="variant_slide-textContainer">
            
          ${title? 
              `<div class="variant_slide-title">
                ${title}
                </div>` : ''
              }
            
              ${subtitle? 
                `<div class="variant_slide-subtitle">
                  ${subtitle}
                  </div>` : ''
                }
              
                ${description? 
                  `<div class="variant_slide-description">
                    ${description}
                    </div>` : ''
                  }  
          </div>
          <div class="variant_slide-actionContainer">
              <a href="${primaryLink}" target="${primaryTarget}" class="cta__new cta__new-primary">${primaryCtaText}</a>
              <a href="${secondaryLink}" target="${secondaryTarget}" class="cta__new cta__new-outlined">${secondaryCtaText}</a>
          </div>
        </div>
      </div>
    `;
    carouselContainer.innerHTML += block.children[i].outerHTML;
  }

  const navigationContainer = document.createElement('div');
  navigationContainer.classList.add('nav-container');
  navigationContainer.innerHTML = `
    <div class="variant_slide_arrow-navigation">
      <button class="prev_arrow" aria-label="${ariaLabelPrev}"></button>
      <button class="next_arrow" aria-label="${ariaLabelNext}"></button>
    </div>
    <div class="carousel_dots"></div>
  `;

  block.innerHTML = utility.sanitizeHtml(`<div class="variant-banner">
  <div class="variant_carousel">
  ${carouselContainer?.outerHTML}
  </div>
  ${navigationContainer?.outerHTML}
  </div>`);

  const updatedCarouselContainer = block.querySelector('.variant_carousel_container');
  const carouselChildren = [...updatedCarouselContainer.children];
  const cardsPerView = 1;

  // insert copies at beginning
  carouselChildren
    .slice(-cardsPerView)
    .reverse()
    .forEach((card) => {
      updatedCarouselContainer.insertAdjacentHTML('afterbegin', card.outerHTML);
      card.classList.add('variant_slide_clone');
    });

  // insert copies at end
  carouselChildren.slice(0, cardsPerView).forEach((card) => {
    updatedCarouselContainer.insertAdjacentHTML('beforeend', card.outerHTML);
    card.classList.add('variant_slide_clone');
  });

  function initCarousel() {
    const slides = block.querySelectorAll('.variant_slide');
    const totalSlides = slides.length;
    let currentSlide = 0;

    const nextBtn = block.querySelector('.next_arrow');
    const prevBtn = block.querySelector('.prev_arrow');
    const dotsContainer = block.querySelector('.carousel_dots');

    if (totalSlides <= 3) { 
      nextBtn.disabled = true;
      prevBtn.disabled = true;
      return;
    }

    slides.forEach((slide, index) => {
      if (!slide.classList.contains('variant_slide_clone')) {
        const dot = document.createElement('button');
        dot.classList.add('carousel_dot');
        dot.setAttribute('aria-label', `${ariaLabelCarouselDot} ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
      }
    });

    const dots = dotsContainer.querySelectorAll('.carousel_dot');

    function updateActiveSlide() {
      dots.forEach((dot, index) => {
        if (currentSlide === totalSlides - 2) {
          dot.classList.toggle('active', index === 0);
        } else {
          dot.classList.toggle('active', index === currentSlide);
        }
      });
    }

    function updateCarouselPosition() {
      updatedCarouselContainer.style.transition = 'transform 0.5s ease';
      updatedCarouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      updateActiveSlide();

      // Reset to the first real slide after last cloned slide
      if (currentSlide === totalSlides - 1) {
        setTimeout(() => {
          updatedCarouselContainer.style.transition = 'none'; // Disable transition for instant jump
          currentSlide = 1; // Reset to the first real slide
          updatedCarouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
          updateActiveSlide();
        }, 300);
      }
    }

    function showSlide(index) {
      currentSlide = index;
      updateCarouselPosition();
    }

    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        showSlide(currentSlide + 1);
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        showSlide(currentSlide - 1);
      }
      if (currentSlide === 0) {
        setTimeout(() => {
          updatedCarouselContainer.style.transition = 'none'; // Disable transition for instant jump
          currentSlide = totalSlides - 2; // Reset to the last real slide
          updatedCarouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
          updateActiveSlide();
        }, 300);
      }
    }

    let autoRotateInterval;
    function stopAutoplay() {
      clearInterval(autoRotateInterval);
    }

    function startAutoplay() {
      autoRotateInterval = setInterval(() => {
        nextSlide();
      }, 8000);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    window.addEventListener('resize', () => {
      updateCarouselPosition();
    });
    showSlide(currentSlide);
    // Start autoplay
    startAutoplay();

    block.addEventListener('click', (e) => {
      const link = e.target?.closest('a');
      if (!link) {
        return;
      }
      const data = {};
      data.componentName = block.dataset.blockName;
      data.componentTitle = link.closest('.variant_slide')?.querySelector('.variant_slide-subtitle')?.textContent?.trim() || '';
      data.componentType = 'button';
      data.webName = link.textContent?.trim() || '';
      data.linkType = link;
      analytics.setButtonDetails(data);
    });
  }

  initCarousel();
}
