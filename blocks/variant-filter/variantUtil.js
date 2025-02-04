export default function initCarousel(config) {
  const container = document.querySelector(config.containerSelector);
  const cardList = container.querySelector(config.cardListSelector);
  let cards = Array.from(container.querySelectorAll(config.cardSelector));
  const leftArrow = document.querySelector(config.leftArrowSelector);
  const rightArrow = document.querySelector(config.rightArrowSelector);
  const slideStatus = document.querySelector(config.slideStatusSelector);
  const slideInfoText = slideStatus?.textContent?.trim() || '';
  let currentIndex = 0;

  // Utility function to determine slides per view based on viewport width
  function getSlidesToShow() {
    const width = window.innerWidth;
    if (width < 768) {
      return config.slidesPerViewConfig.mobile;
    }
    if (width < 1024) {
      return config.slidesPerViewConfig.tablet;
    }
    return config.slidesPerViewConfig.desktop;
  }

  // Function to set card widths
  function setCardWidths() {
    const slidesToShow = getSlidesToShow();
    const cardWidth = Math.min(100 / slidesToShow, 100 / slidesToShow); // Never go beyond 33.33% on desktop
    cards.forEach((card) => {
      card.style.width = `${cardWidth}%`;
      card.style.maxWidth = `${cardWidth}%`;
    });
  }

  // Function to update the slide status (e.g., "Showing 1/6 variants")
  function updateSlideStatus() {
    const visibleCards = Array.from(cards).filter((card) => window.getComputedStyle(card).display !== 'none');
    const slidesToShow = getSlidesToShow();
    const showingCount = Math.min(slidesToShow, visibleCards.length - currentIndex);
    slideStatus.textContent = slideInfoText.replace('{count}', `${showingCount + currentIndex}/${visibleCards.length}`);
  }

  // Function to update the arrows' visibility
  function updateArrows() {
    const visibleCards = Array.from(cards).filter((card) => window.getComputedStyle(card).display !== 'none');
    leftArrow.disabled = currentIndex === 0;
    rightArrow.disabled = currentIndex + getSlidesToShow() >= visibleCards.length;
  }

  // Function to move slides
  function moveSlides() {
    const slideWidth = container.clientWidth / getSlidesToShow();
    const offset = slideWidth * currentIndex * -1;
    cardList.style.transform = `translateX(${offset}px)`;
    updateSlideStatus();
    updateArrows();
  }

  const resetCarouselHelper = () => {
    cards = Array.from(container.querySelectorAll(config.cardSelector)).filter((card) => window.getComputedStyle(card).display !== 'none');
    currentIndex = 0; // Reset index
    setCardWidths(); // Set card widths initially
    moveSlides(); // Set initial position
  };

  // Function to reattach observers to cards after every reset
  const observeCardStyleChanges = () => {
    cards.forEach((card) => {
      const styleObserver = new MutationObserver(() => {
        resetCarouselHelper();
        observeCardStyleChanges(); // Reattach observers to the filtered cards
      });
      styleObserver.observe(card, { attributes: true, attributeFilter: ['style'] });
    });
  };

  // Function to reset the carousel
  const resetCarousel = () => {
    resetCarouselHelper();
    observeCardStyleChanges(); // Reattach observers to the filtered cards
  };

  // Event listeners for arrows
  leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= getSlidesToShow();
      moveSlides();
    }
  });

  rightArrow.addEventListener('click', () => {
    const visibleCards = Array.from(cards).filter((card) => window.getComputedStyle(card).display !== 'none');
    if (currentIndex + getSlidesToShow() < visibleCards.length) {
      currentIndex += getSlidesToShow();
      moveSlides();
    }
  });

  // Listen for window resize to adjust slide display
  window.addEventListener('resize', () => {
    resetCarousel();
  });

  // Mutation observer to detect changes in cards (such as filtering with display: none)
  const observer = new MutationObserver(() => {
    resetCarousel();
  });

  observer.observe(cardList, { childList: true, subtree: true });

  // Initialize the carousel
  resetCarousel();
}
