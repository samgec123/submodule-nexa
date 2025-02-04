import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';

export default async function decorate(block) {
  const [
    desktopImageEl,
    mobileImageEl,
    startingLabelEl,
    primaryTextEl,
    primaryTargetEl,
    secondaryTextEl,
    secondaryLinkEl,
    secondaryTargetEl,
    termsAndConditionsTextEl,
  ] = block.children;
  block.innerHTML = '';
  const desktopImage = desktopImageEl?.querySelector('img')?.src || '';
  const mobileImage = mobileImageEl?.querySelector('img')?.src || desktopImage || '';
  const startingLabel = utility.textContentChecker(startingLabelEl);
  const termsAndConditionsText = utility.textContentChecker(termsAndConditionsTextEl);
  const primaryCtaText = utility.textContentChecker(primaryTextEl);
  const primaryTarget = primaryTargetEl?.textContent?.trim() || '_self';
  const secondaryCtaText = utility.textContentChecker(secondaryTextEl);
  const secondaryLink = secondaryLinkEl?.querySelector('.button-container a')?.href;
  const secondaryTarget = secondaryTargetEl?.textContent?.trim() || '_self';

  const {
    publishDomain, apiExShowroomDetail, cfPrefix, ariaLabelPrev, ariaLabelNext, ariaLabelCarouselDot,
  } = await fetchPlaceholders();

  let forCode = utility.getSelectedLocation()?.forCode ?? '08';
  let cars = [];

  const isMobile = window.matchMedia('(max-width:768px)').matches;

  block.innerHTML = `
    <div class="carousel-container">
      <div class="carousel">
        <div class="carousel-slide_container">
          <div class="carousel-slide active">
              <div class="hero__video-container">
                  <video src="" width="100%" muted autoplay loop playsinline preload="none" poster="${(isMobile) ? mobileImage : desktopImage}"></video>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="carousel-arrow_navigation">
      <button class="prev_arrow"></button>
      <button class="next_arrow"></button>
    </div>
  `;

  // Utility to format currency
  async function formatCurrency(price) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    });

    return `₹ ${formatter.format(price).replaceAll(',', ' ')}`;
  }

  async function getLocalStorage(key) {
    return localStorage.getItem(key);
  }

  async function fetchPricesForAllModels() {
    
    const storedPrices = await getLocalStorage('modelPrice') ? JSON.parse(await getLocalStorage('modelPrice')) : {};
    const activeVariantList = await apiUtils.getActiveVariantList();
    const currentTime = new Date().getTime();
    const isValid = Object.values(storedPrices).some(
      (item) => item.timestamp > currentTime && Object.hasOwn(item.price, forCode),
    );
    if (isValid) {
      return;
    }
    const channel = 'EXC';
    const apiUrl = publishDomain + apiExShowroomDetail;

    const params = {
      forCode,
      channel,
    };

    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    url.searchParams.append("variantInfoRequired",true)
    let data;
    try {
      const response = await fetch(url.href, { method: 'GET' });
      data = await response.json();
    } catch {
      data = {};
    }
    if (data?.error === false && data?.data) {
      const timestamp = currentTime + (1 * 24 * 60 * 60 * 1000); // 1 day from now
      data.data.models.forEach((item) => {
        const { modelCd, lowestExShowroomPrice } = item;
        if (!Object.hasOwn(storedPrices, modelCd)) {
          storedPrices[modelCd] = { price: {}, timestamp };
        }
        const variantList = activeVariantList.find(item => item.modelCd === modelCd) || null;      
        const lowestPrice = utility.getLowestPriceVariant(variantList, item.exShowroomDetailResponseDTOList)
        storedPrices[modelCd].price[forCode] = lowestPrice.exShowroomPrice;
        storedPrices[modelCd].timestamp = timestamp;
      });

      localStorage.setItem('modelPrice', JSON.stringify(storedPrices));
    }
  }

  // Fetch price for a specific model using local storage
  async function fetchPrice(modelCode) {
    const storedPrices = await getLocalStorage('modelPrice') ? JSON.parse(await getLocalStorage('modelPrice')) : {};
    if (storedPrices[modelCode]?.price[forCode]) {
      return storedPrices[modelCode].price[forCode];
    }
    return null;
  }

  async function initializePrices() {
    await fetchPricesForAllModels();
  }

  function initCarousel(slides) {
    let currentSlide = 0;
    const totalSlides = slides.length;
    const carousel = block.querySelector('.carousel');
    const carouselNavigation = block.querySelector('.carousel-arrow_navigation');
    if (totalSlides > 1){
      carouselNavigation.style.display = 'flex';
    } else {
      carouselNavigation.style.display = 'none';
    }

    const nextBtn = block.querySelector('.next_arrow');
    nextBtn?.setAttribute('aria-label', `${ariaLabelNext}`);
    const prevBtn = block.querySelector('.prev_arrow');
    prevBtn?.setAttribute('aria-label', `${ariaLabelPrev}`);

    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('carousel-dots');
    const dots = [];

    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.disabled = true;
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });

    block.appendChild(dotsContainer);

    function updateActiveSlide() {
      slides.forEach((slide, index) => {
        const isActive = index === currentSlide;
        slide.classList.toggle('active', isActive);

        const video = slide.querySelector('video');
        if (video) {
          if (isActive) {
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }

    function updateCarouselPosition() {
      const translateX = -currentSlide * carousel.clientWidth;
      carousel.style.transform = `translateX(${translateX}px)`;
    }

    function updateArrows() {
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    function showSlide(index) {
      currentSlide = index;
      updateActiveSlide();
      updateCarouselPosition();
      updateArrows();
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
    }

    let autoRotateInterval;

    function startAutoplay() {
      autoRotateInterval = setInterval(nextSlide, 10000);
    }

    function stopAutoplay() {
      clearInterval(autoRotateInterval);
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

    showSlide(currentSlide);
    startAutoplay();
    window.addEventListener('resize', () => {
      updateCarouselPosition();
    });
  }

  function initTooltip() {
    block.querySelectorAll('.info-icon').forEach((icon) => {
      const tooltipText = icon.closest('.overlay-container').querySelector('.tooltip-text');

      if (isMobile) {
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          tooltipText.classList.toggle('hidden');
        });

        document.addEventListener('click', () => tooltipText.classList.add('hidden'));
      } else {
        icon.addEventListener('mouseenter', () => tooltipText.classList.remove('hidden'));
        icon.addEventListener('mouseleave', () => tooltipText.classList.add('hidden'));
      }
    });
  }

  // Generate HTML for each variant
  async function getVariantHtml(car, index) {
    const price = await fetchPrice(car.modelCd) || car.exShowroomPrice; // Fallback to exShowroomPrice if price not found
    const formattedPrice = await formatCurrency(price);
    const videoUrl = isMobile ? car?.mobileVideo?._publishUrl : car?.desktopVideo?._publishUrl;
    const posterImage = isMobile ? publishDomain + (car?.mobilePosterImage?._dynamicUrl ?? '') : publishDomain + (car?.desktopPosterImage?._dynamicUrl ?? '');
    const modelDesc = car.modelDesc || 'Model Description';
    const modelTagline = car.modelTagline || 'Model Tagline';
    const tooltipText = car.tooltipText || 'Tooltip Text';
    return `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <div class="hero__video-container">
                   <video src="${videoUrl}" width="100%" muted autoplay loop playsinline preload="none" poster="${posterImage}"></video>
                </div>
                <div class="overlay-container">
                    <div class="model-tag">
                     <h2 class="model-description">${modelDesc}</h2>
                     <p class="model-tagline">${modelTagline}</p>
                    </div>
                    <div class="middle-container">
                    <div class="price">
                     <h2 class="price-label">${startingLabel}</h2>
                     <p class="exshowroom-price" data-target-index=${index}>${formattedPrice}**</p>
                     <span class="info-icon">
                      i
                      <p class="tooltip-text hidden">${tooltipText}</p>
                     </span>
                    </div>
                    <div class="cta-btns">
                      <a href="${car.carDetailsPagePath?._path?.replace(cfPrefix, '') ?? '#'}" target="${primaryTarget}" class="cta__new cta__new-primary">${primaryCtaText}</a>
                      <a href="${car?.configuratorPagePath?._path?.replace(cfPrefix, '') ?? '#'}" target="${secondaryTarget}" class="cta__new cta__new-outlined">${secondaryCtaText}</a>
                    </div>
                    </div>
                    <p class="terms">Smart Hybrid Variant Shown | <span class="termsCondition">${termsAndConditionsText}</span></p>
                </div>
            </div>
        `;
  }

  async function finalBlock() {
    const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/BannerList`;
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    try {
      const response = await fetch(graphQlEndpoint, requestOptions);
      const data = await response.json();
      cars = data?.data?.carModelList?.items || [];

      await initializePrices();

      const carousel = block.querySelector('.carousel');
      const promiseMap = cars.map(async (car, index) => (getVariantHtml(car, index)));

      const slides = await Promise.all([...promiseMap]);
      slides.forEach((slideHtml, index) => {
        const slide = document.createElement('div');
        slide.innerHTML = slideHtml;
        slide.className = 'carousel-slide_container';
        if (index === 0) {
          block.querySelector('video').src = slide.querySelector('video').src;
          block.querySelector('.carousel-slide')?.insertAdjacentElement('beforeend', slide.querySelector('.overlay-container'));
        } else {
          carousel.insertAdjacentElement('beforeend', slide);
        }
      });

      initCarousel(block.querySelectorAll('.carousel-slide'));
      initTooltip();
    } catch (error) {
      console.error('Error loading car models:', error);
    }
  }
  finalBlock();

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};
    pageDetails.componentName = block.getAttribute('data-block-name');
    pageDetails.componentTitle = e.target.closest('.overlay-container').querySelector('.model-description')?.textContent;
    pageDetails.componentType = 'button';
    pageDetails.webName = e.target?.textContent;
    pageDetails.linkType = e.target;

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.cta__new')) {
      setLinkDetails(e);
    }
  });

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await fetchPricesForAllModels();
    block.querySelectorAll('.exshowroom-price').forEach(async (e) => {
      const index = parseInt(e.dataset.targetIndex, 10);
      const price = await fetchPrice(cars[index].modelCd);
      e.textContent = await formatCurrency(price);
    });
  });
}
