import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useRef,
  useEffect,
  useState,
} from '../../../commons/scripts/vendor/preact-hooks.js';

const VideoCarousle = ({ selectedFeature, featureList, handleChangeFeature }) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const itemWidth = useRef(0); // Store the width of one carousel item

  // Variables for touch gestures
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Function to check and update arrow visibility
  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft + container.offsetWidth < container.scrollWidth,
    );
  };
  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.thumbnail');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth + 10; // Add gap/margin if any
    }
  };
  // Scroll the container to the left or right
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;

    const scrollAmount = itemWidth.current; // Adjust scroll distance
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    updateArrowVisibility();
  };

  // Touch Events for Swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX; // Record start touch position
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX; // Record end touch position
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // Minimum distance for swipe recognition

    if (swipeDistance > swipeThreshold) {
      // Swipe left
      handleScroll('right');
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe right
      handleScroll('left');
    }
  };
  useEffect(() => {
    const container = containerRef.current;
    calculateItemWidth();
    updateArrowVisibility();
    const handleResize = () => {
      calculateItemWidth();
      updateArrowVisibility();
    };
    const handleScrollEvent = () => updateArrowVisibility();
    container.addEventListener('scroll', handleScrollEvent);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScrollEvent);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return html`
    <div class="video-thumbnail-block">
      ${showLeftArrow
      && html`
        <button class="arrow left-arrow" onClick=${() => handleScroll('left')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.3472 17.3075L16.001 11.6538L10.3472 6L9.29348 7.05375L13.8935 11.6538L9.29348 16.2538L10.3472 17.3075Z" fill="white"/>
          </svg>
        </button>
      `}
    
      <div class="carousel-items" ref=${containerRef} onTouchStart=${handleTouchStart}
        onTouchEnd=${handleTouchEnd}>
      ${featureList?.map((feature) => html`
        <div class="thumbnail" onClick=${handleChangeFeature}>
            <div class="thumbnail-label">${feature.name}</div>
            <img src=${feature.thumbnailImage._dmS7Url} />
        </div>
        `)}
      </div>
      ${showRightArrow
      && html`
        <button class="arrow right-arrow" onClick=${() => handleScroll('right')}>
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.3472 17.3075L16.001 11.6538L10.3472 6L9.29348 7.05375L13.8935 11.6538L9.29348 16.2538L10.3472 17.3075Z" fill="white"/>
          </svg>
        </button>
      `}
    </div>
  `;
};

export default VideoCarousle;
