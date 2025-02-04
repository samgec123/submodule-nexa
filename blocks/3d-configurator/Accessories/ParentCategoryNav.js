import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { GradientRightArrowIcon } from '../Icons.js';
import {
  useRef,
  useEffect,
  useState,
} from '../../../commons/scripts/vendor/preact-hooks.js';

const ParentCategoryNav = ({ parentCategories, selectedParentCategory, handleParentCategoryClick }) => {
  const scrollAmount = 0;
  const containerRef = useRef(null);
  const itemWidth = useRef(0); // Store the width of one carousel item
  // Variables for touch gestures
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [enableLeftArrow, setDEnableShowLeftArrow] = useState(false);
  const [enableRightArrow, setEnableShowRightArrow] = useState(true);
  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;
    setDEnableShowLeftArrow(container.scrollLeft > 0);
    setEnableShowRightArrow(
      container.scrollLeft + container.offsetWidth < container.scrollWidth,
    );
  };
  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;

    const scrollAmount = itemWidth.current + 50; // Adjust scroll distance
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    updateArrowVisibility();
  };
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
  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.nav-item');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth; // Add gap/margin if any
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
    <div class="horizontal-line">
        <div class="nav-container">
          <button onClick=${() => handleScroll('left')} class="arrow-btn left-arrow ${enableLeftArrow ? '' : 'disabled hidden'}" id="leftArrow">
              <${GradientRightArrowIcon} />
          </button>
          <div class="nav-wrapper">
            <ul class="nav-menu" id="navMenu" ref=${containerRef} onTouchStart=${handleTouchStart}
        onTouchEnd=${handleTouchEnd}>
              <li class="nav-item ${selectedParentCategory === 'ALL' ? 'active' : ''}" 
              onClick=${() => handleParentCategoryClick('ALL')}>
                <label class="nav-label">All</label>
              </li>
              ${parentCategories?.map((parentCategory) => html`
                <li class="nav-item ${selectedParentCategory === parentCategory.parentCategoryCd ? 'active' : ''}" 
                onClick=${() => handleParentCategoryClick(parentCategory.parentCategoryCd)}>
                    <label class="nav-label">${parentCategory.parentCategoryDesc}</label>                 
                </li>
              `)}
            </ul>
          </div>
          <button class="arrow-btn right-arrow ${enableRightArrow ? '' : 'disabled'}" id="rightArrow" onClick=${() => {
  setDEnableShowLeftArrow(true);
  handleScroll('right');
}}>
              <${GradientRightArrowIcon} />
          </button>
        </div>
    </div>
  `;
};

export default ParentCategoryNav;
