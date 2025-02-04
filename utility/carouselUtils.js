import CAROUSEL_TYPES from './constant.js';

/**
* Utility for Carousel
*/
const carouselUtils = {
  init: (
    el,
    className,
    carouselType,
    {
      onChange = () => {},
      onReset = () => {},
      onNext = () => {},
      onPrev = () => {},
      showArrows = true,
      showDots = true,
      dotsInteractive = true,
      navigationContainerClassName = '',
    },
  ) => {
    if (!el) {
      return {};
    }

    const navigationContainerEl = (navigationContainerClassName) ? el.querySelector(`.${navigationContainerClassName}`) : null;
    let dotClickFlag = false;
    const getSlideInfo = (direction = 0, position = null) => {
      const currentSlide = el.querySelector('.carousel__slide--active');
      const currentIndex = parseInt(currentSlide.dataset.slideIndex, 10);
      const targetIndex = position ?? (currentIndex + (direction ?? 0));
      const targetSlide = el.querySelector(`.carousel__slide[data-slide-index="${targetIndex}"]`);
      return {
        currentSlide,
        currentIndex,
        targetSlide,
        targetIndex,
      };
    };

    const updateDots = (targetIndex, currentIndex) => {
      const currentDot = el.querySelector('.carousel__dot--active');
      const targetDot = el.querySelector(`.carousel__dot[data-target-index="${targetIndex}"]`);
      currentDot?.classList?.remove('carousel__dot--active');
      targetDot?.classList?.add('carousel__dot--active');
      if (targetIndex > currentIndex) {
        for (let i = currentIndex; i < targetIndex; i += 1) {
          el.querySelector(`.carousel__dot[data-target-index="${i}"]`)?.classList?.add('carousel__dot--visited');
        }
      } else {
        for (let i = currentIndex; i >= targetIndex; i -= 1) {
          el.querySelector(`.carousel__dot[data-target-index="${i}"]`)?.classList?.remove('carousel__dot--visited');
        }
      }
    };

    const updateNavigation = (targetIndex, size) => {
      const prev = el.querySelector('.carousel__navigation .carousel__prev');
      const next = el.querySelector('.carousel__navigation .carousel__next');
      if (targetIndex <= 0) {
        prev?.classList?.add('carousel__nav--disabled');
      } else {
        prev?.classList?.remove('carousel__nav--disabled');
      }
      if (targetIndex >= size - 1) {
        next?.classList?.add('carousel__nav--disabled');
      } else {
        next?.classList?.remove('carousel__nav--disabled');
      }
    };

    const navigateSlide = (slideInfo, direction = 0, isReset = false) => {
      const {
        currentSlide, targetSlide, currentIndex, targetIndex,
      } = slideInfo;
      if (targetSlide) {
        currentSlide.classList.remove('carousel__slide--active');
        targetSlide.classList.add('carousel__slide--active');
        if (carouselType === 'slide' || carouselType === 'infinite') {
          el.querySelector('.carousel__slides').scrollTo(
            {
              top: 0,
              left: targetSlide.offsetLeft,
              behavior: 'smooth',
            },
          );
        }
        if (isReset && typeof onReset === 'function') {
          onReset(currentSlide, targetSlide);
        } else if (typeof onChange === 'function') {
          onChange(currentSlide, targetSlide, direction);
        }
        updateNavigation(targetIndex, el.querySelectorAll('.carousel__slide').length);
        updateDots(targetIndex, currentIndex);
        return true;
      }
      return false;
    };

    const createDot = () => {
      const slidesWrapper = el.querySelector(`.${className}`);
      const dots = document.createElement('ul');
      slidesWrapper.classList.add('carousel__slides');
      [...slidesWrapper.children].forEach((slide, index) => {
        slide.classList.add('carousel__slide');
        slide.dataset.slideIndex = index;
        const dot = document.createElement('li');
        dot.classList.add('carousel__dot');
        dot.dataset.targetIndex = index;
        if (index === 0) {
          slide.classList.add('carousel__slide--active');
          dot.classList.add('carousel__dot--active');
        }
        dots.append(dot);
      });

      el.querySelector(`.${className}`).replaceWith(slidesWrapper);
      if (showDots && el.querySelectorAll('.carousel__slide').length > 1) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel__dots';
        dotsContainer.append(dots);
        if (navigationContainerEl) {
          navigationContainerEl.insertAdjacentElement('beforeend', dotsContainer);
        } else {
          el.insertAdjacentElement('beforeend', dotsContainer);
        }
        if (dotsInteractive) {
          el.querySelectorAll('.carousel__dot')?.forEach((dot) => {
            dot.addEventListener('click', (e) => {
              dotClickFlag = true;
              const targetIndex = parseInt(e.target.dataset.targetIndex, 10);
              const slideInfo = getSlideInfo(0, targetIndex);
              navigateSlide(slideInfo);
            });
          });
        }
      }
    };

    const updateDotsOnSlide = () => {
      const position = null;
      const currentSlide = el.querySelector('.carousel__slide--active');
      const currentIndex = parseInt(currentSlide.dataset.slideIndex, 10);
      const targetIndex = position ?? (currentIndex + 0);
      updateDots(targetIndex, currentIndex);
    };

    const initializeSlideCarousel = () => {
      createDot();

      if (showArrows && el.querySelectorAll('.carousel__slide').length > 1) {
        const slidesWrapper = el.querySelector(`.${className}`);
        const arrowsContainer = document.createElement('div');
        arrowsContainer.className = 'carousel__navigation';
        arrowsContainer.innerHTML = `
            <span class="carousel__prev carousel__nav--disabled"></span>
            <span class="carousel__next ${slidesWrapper?.children.length == 1? 'carousel__nav--disabled' : ''}"></span>
        `;
        if (navigationContainerEl) {
          navigationContainerEl.insertAdjacentElement('beforeend', arrowsContainer);
        } else {
          el.insertAdjacentElement('beforeend', arrowsContainer);
        }
        el.querySelector('.carousel__prev')?.addEventListener('click', () => {
          const slideInfo = getSlideInfo(-1);
          const status = onPrev(slideInfo.currentSlide, slideInfo.targetSlide) ?? true;
          if (status) {
            navigateSlide(slideInfo, -1);
          }
        });
        el.querySelector('.carousel__next')?.addEventListener('click', () => {
          const slideInfo = getSlideInfo(1);
          const status = onNext(slideInfo.currentSlide, slideInfo.targetSlide) ?? true;
          if (status) {
            navigateSlide(slideInfo, 1);
          }
        });
      }
    };

    const initializeInfiniteCarousel = () => {
      const carousel = el.querySelector('.carousel');
      const firstCardWidth = carousel.querySelector('.card').offsetWidth;
      const carouselChildren = [...carousel.children];

      let isDragging = false;
      let startX;
      let startScrollLeft;

      const cardsPerView = Math.round(carousel.offsetWidth / firstCardWidth);

      const dragStart = (e) => {
        isDragging = true;
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
        carousel.classList.add('dragging');
      };

      const dragStop = () => {
        isDragging = false;
        carousel.classList.remove('dragging');
      };

      const dragging = (e) => {
        if (!isDragging) return;

        const distanceDragged = startX - e.pageX;
        carousel.scrollLeft = startScrollLeft + distanceDragged;
      };

      const inifiniteScroll = () => {
        if (carousel.scrollLeft === 0) {
          carousel.classList.add('no-transition');
          carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
          carousel.classList.remove('no-transition');
        } else if (
          carousel.scrollLeft
          === carousel.scrollWidth - carousel.offsetWidth
        ) {
          carousel.classList.add('no-transition');
          carousel.scrollLeft = carousel.offsetWidth;
          carousel.classList.remove('no-transition');
        }
      };

      const manualSlideCarousel = () => {
        const slideInfo = getSlideInfo(1);
        const {
          currentSlide, targetSlide, targetIndex,
        } = slideInfo;
        if (Math.round(carousel.scrollLeft) === 0 && carousel.scrollRight === undefined) {
          carousel.classList.add('no-transition');
          carousel.scrollLeft = 0;
          carousel.scrollRight = carousel.scrollLeft;
          carousel.classList.remove('no-transition');
        }
        if (Math.round(carousel.scrollLeft) === 0 && carousel.scrollRight === carousel.offsetWidth) {
          carousel.classList.add('no-transition');
          carousel.scrollLeft = 0;
          carousel.scrollRight = carousel.scrollLeft;
          carousel.classList.remove('no-transition');
          const position = null;
          const currentSlideEl = el.querySelector('.carousel__slide--active');
          const currentIndexValue = Math.round(currentSlideEl.dataset.slideIndex, 10);
          const targetIndexValue = position ?? (currentIndexValue - 1);
          const targetSlideEl = el.querySelector(`.carousel__slide[data-slide-index="${targetIndexValue}"]`);
          currentSlideEl.classList.remove('carousel__slide--active');
          targetSlideEl.classList.add('carousel__slide--active');
          updateDots(targetIndexValue, currentIndexValue);
        } else if (!dotClickFlag && (Math.round(Math.round(carousel.scrollLeft) / targetIndex) === carousel.offsetWidth
          || Math.round(Math.round(carousel.scrollLeft) / targetIndex) + 1 === carousel.offsetWidth
          || Math.round(Math.round(carousel.scrollLeft) / targetIndex) - 1 === carousel.offsetWidth)) {
          carousel.classList.add('no-transition');
          carousel.scrollRight = Math.round(carousel.scrollLeft);
          carousel.scrollLeft = carousel.scrollRight;
          carousel.classList.remove('no-transition');
          currentSlide.classList.remove('carousel__slide--active');
          targetSlide.classList.add('carousel__slide--active');
          // update dots
          updateDotsOnSlide();
          dotClickFlag = false;
        } else if (carousel.scrollRight - Math.round(carousel.scrollLeft) === carousel.offsetWidth
          || carousel.scrollRight - Math.round(carousel.scrollLeft) - 1 === carousel.offsetWidth
          || carousel.scrollRight - Math.round(carousel.scrollLeft) + 1 === carousel.offsetWidth) {
          carousel.scrollRight = Math.round(carousel.scrollLeft);
          carousel.classList.add('no-transition');
          carousel.classList.remove('no-transition');
          const position = null;
          const currentSlideEl = el.querySelector('.carousel__slide--active');
          const currentIndexValue = Math.round(currentSlideEl.dataset.slideIndex, 10);
          const targetIndexValue = position ?? (currentIndexValue - 1);
          const targetSlideEl = el.querySelector(`.carousel__slide[data-slide-index="${targetIndexValue}"]`);
          currentSlideEl.classList.remove('carousel__slide--active');
          targetSlideEl.classList.add('carousel__slide--active');
          updateDots(targetIndexValue, currentIndexValue);
        }
      };

      const autoPlay = () => {
        setInterval(() => {
          carousel.scrollLeft += firstCardWidth;
        }, 3500);
      };

      carousel.addEventListener('mousedown', dragStart);
      document.addEventListener('mouseup', dragStop);
      carousel.addEventListener('mousemove', dragging);

      if (window.matchMedia('(max-width: 768px)').matches) {
        // insert copies at beginning
        carouselChildren
          .slice(-cardsPerView)
          .reverse()
          .forEach((card) => {
            carousel.insertAdjacentHTML('afterbegin', card.outerHTML);
          });

        // insert copies at end
        carouselChildren.slice(0, cardsPerView).forEach((card) => {
          carousel.insertAdjacentHTML('beforeend', card.outerHTML);
        });

        carousel.addEventListener('scroll', inifiniteScroll);

        autoPlay();
      } else {
        createDot();
        carousel.addEventListener('scroll', manualSlideCarousel);
      }
    };

    switch (carouselType) {
      case CAROUSEL_TYPES.SLIDE:
        el.classList.add('slide-carousel__wrapper');
        initializeSlideCarousel();
        break;
      case CAROUSEL_TYPES.FADE:
        el.classList.add('fade-carousel__wrapper');
        initializeSlideCarousel();
        break;
      case CAROUSEL_TYPES.INFINITE:
        el.classList.add('infinite-carousel__wrapper');
        setTimeout(() => {
          initializeInfiniteCarousel();
        }, 0);
        break;
      default:
        el.classList.add('slide-carousel__wrapper');
        initializeSlideCarousel();
        break;
    }

    const prev = () => navigateSlide(getSlideInfo(-1), -1);
    const next = () => navigateSlide(getSlideInfo(1), 1);
    const reset = () => navigateSlide(getSlideInfo(0, 0), 0, true);

    return {
      prev,
      next,
      reset,
    };
  },
};

export default carouselUtils;
