import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { useState, useEffect, useRef } from '../../../commons/scripts/vendor/preact-hooks.js';
import {
  CloseIcon, ArrowBackward, ArrowForward, AddIcon, RemoveIcon, AddRemoveAccSvg,
} from '../Icons.js';
import utility from '../../../utility/utility.js';

const InfoPopup = ({
  infoAccessory,
  handleAddAccessory,
  handleCloseInfoPopup,
  publishDomain,
  addBtnLabelEl,
  removeBtnLabelEl,
  isAccessoryAdded,
  handleRemoveAccessory,
  addedAccessories,
}) => {
  const containerRef = useRef(null);
  const itemWidth = useRef(0); // Store the width of one carousel item
  const itemDot = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [enableleftArrow, setEnableLeftArrow] = useState(false);
  const [enableRightArrow, setEnableRightArrow] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;
    setEnableLeftArrow(container.scrollLeft > 0);
    setEnableRightArrow(
      container.scrollLeft + container.offsetWidth < container.scrollWidth,
    );
  };

  const calculateItemWidth = () => {
    const firstItem = containerRef.current?.querySelector('.carousel-thumbnail');
    if (firstItem) {
      itemWidth.current = firstItem.offsetWidth + 20; // Add gap/margin if any
    }
  };

  const handleScroll = (direction) => {
    const container = containerRef.current;
    if (!container || itemWidth.current === 0) return;
    // Calculate the new index before updating the state
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(carouselIndex - 1, 0); // Prevent going below 0
      container.scrollBy({ left: -itemWidth.current, behavior: 'smooth' });
    } else {
      newIndex = Math.min(carouselIndex + 1, itemDot.current.length - 1); // Prevent exceeding the last dot
      container.scrollBy({ left: itemWidth.current, behavior: 'smooth' });
    }

    // Update the state and highlight the correct dot
    setCarouselIndex(newIndex);

    // Update the dots immediately
    itemDot.current.forEach((dot, index) => {
      dot.className = index === newIndex ? 'carousel-dot active' : 'carousel-dot';
    });
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

  useEffect(() => {
    const container = containerRef.current;
    calculateItemWidth();
    updateArrowVisibility();
    const handleResize = () => {
      calculateItemWidth();
      updateArrowVisibility();
    };
    const handleScrollEvent = () => updateArrowVisibility();
    container?.addEventListener('scroll', handleScrollEvent);
    window.addEventListener('resize', handleResize);

    return () => {
      container?.removeEventListener('scroll', handleScrollEvent);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = utility.isMobileView();
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState(null);
  const [selectedMobileThumbnailUrl, setSelectedMobileThumbnailUrl] = useState(null);

  const addBtnLabel = addBtnLabelEl?.textContent?.trim() || '';
  const removeBtnLabel = removeBtnLabelEl?.textContent?.trim() || '';

  const handleNext = () => {
    const totalItems = desktopCarouselUrls.length;
    const itemWidth = 72;
    const visibleItems = 4;
    const totalWidth = totalItems * itemWidth;
    const visibleWidth = visibleItems * itemWidth;
    const maxTranslateX = Math.min(0, visibleWidth - totalWidth);
    setCurrentTranslateX((prevTranslateX) => {
      const nextTranslateX = prevTranslateX - itemWidth;
      return Math.max(nextTranslateX, maxTranslateX);
    });
  };

  const handleNextMobile = () => {
    const totalItems = mobileCarouselUrls.length;
    const itemWidth = 72;
    const visibleItems = 4;
    const totalWidth = totalItems * itemWidth;
    const visibleWidth = visibleItems * itemWidth;
    const maxTranslateX = Math.min(0, visibleWidth - totalWidth);
    setCurrentTranslateX((prevTranslateX) => {
      const nextTranslateX = prevTranslateX - itemWidth;
      return Math.max(nextTranslateX, maxTranslateX);
    });
  };

  const handlePrevious = () => {
    setCurrentTranslateX((prevTranslateX) => {
      const nextTranslateX = prevTranslateX + 100;
      return Math.min(nextTranslateX, 0);
    });
  };

  const desktopThumbnailUrl = infoAccessory?.ccImageUrls?.find((url) => url.includes('desktop/324x243'));
  const desktopCarouselUrls = infoAccessory?.ccImageUrls?.filter((url) => url.includes('desktop/72x54'));

  const mobileThumbnailUrl = infoAccessory?.ccImageUrls?.find((url) => url.includes('mobile/276x207'));
  const mobileCarouselUrls = infoAccessory?.ccImageUrls?.filter((url) => url.includes('mobile/72x54'));

  const handleDesktopCarouselClick = (imgUrl) => {
    const newThumbnailUrl = imgUrl.replace('desktop/72x54/', 'desktop/324x243/');
    const correspondingMainThumbnail = infoAccessory?.ccImageUrls?.find((url) => url.includes(newThumbnailUrl));
    setSelectedThumbnailUrl(correspondingMainThumbnail || desktopThumbnailUrl);
  };

  const displayedThumbnailUrl = selectedThumbnailUrl || desktopThumbnailUrl;

  const handleMobileCarouselClick = (imgUrl) => {
    const newThumbnailUrl = imgUrl.replace('mobile/72x54/', 'mobile/276x207/');
    const correspondingMainThumbnail = infoAccessory?.ccImageUrls?.find((url) => url.includes(newThumbnailUrl));
    setSelectedMobileThumbnailUrl(correspondingMainThumbnail || mobileThumbnailUrl);
  };

  const displayedMobileThumbnailUrl = selectedMobileThumbnailUrl || mobileThumbnailUrl;

  return html`
    <div class="popup-overlay">
      <div class="info-popup-container">
      ${isMobile ? html` <div><div class="info-popup-mobile-first-section">
        <div class="item-info-title">${infoAccessory?.partDesc}</div>
          <div class="close-button" onClick=${(e) => {
    e.stopPropagation();
    handleCloseInfoPopup();
  }}>
          <${CloseIcon} />
          </div>
        </div>

    <div class="price-block">
        <div class="item-price">₹ ${infoAccessory?.price}</div>
        <div class="count-container">
            ${isAccessoryAdded(infoAccessory)
    ? html`<${AddRemoveAccSvg} />
                    <div class="count-ctrl">
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleRemoveAccessory(infoAccessory);
  }}
                    >
                      -
                    </button>
                    <div class="accessory-vertical-separator"></div>
                    <span class="count-action">${addedAccessories.find((item) => item.partNum === infoAccessory.partNum)?.qty || 0}</span>
                    <div class="accessory-vertical-separator"></div>
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleAddAccessory(infoAccessory);
  }}
                    >
                      +
                    </button>
                    </div>`
    : html`<button class="accessory-action" onClick=${(e) => {
      e.stopPropagation();
      handleAddAccessory(infoAccessory);
    }}>
                      <div class="add-text">${addBtnLabel}</div>
                      <div class="add-icon"><${AddIcon} />
                      </div>
                      </button>
                      `
}                
        </div>
      </div>
      <div class="thumbnail-img">
        ${
  displayedMobileThumbnailUrl && html`<img src=${publishDomain}${displayedMobileThumbnailUrl} />`
}
      </div>
      <div class="image-carousel">
        <div
          class="carousel-row"
            onTouchStart=${handleTouchStart}
            onTouchEnd=${handleTouchEnd}
          ref=${containerRef}
          style=${{
    transform: `translateX(${currentTranslateX}px)`,
    transition: 'transform 0.3s ease-in-out',
  }}
        >
        ${mobileCarouselUrls?.map(
    (imgUrl) => html`
                    <div
                      class=${`carousel-thumbnail ${displayedMobileThumbnailUrl === imgUrl.replace('mobile/72x54/', 'mobile/276x207/') ? 'active' : ''}`}
                      onClick=${() => handleMobileCarouselClick(imgUrl)}
                    >
                      <img src=${publishDomain}${imgUrl} />
                    </div>`,
  )}
        </div>
        ${isMobile ? html`
          <div class="carousel-dots">
          ${desktopCarouselUrls?.map((el, index) => html`<button  ref=${(el) => { itemDot.current[index] = el; }} class="carousel-dot ${index === '0' ? 'active' : ''}" aria-label="Go to slide 0"></button>`)}
        </div>` : html`
        <div class="carousel-ctrl">
          <button class=${`carousel-left-arrow ${enableleftArrow ? '' : 'disabled'}`}
           onClick=${() => handleScroll('left')}><${ArrowBackward} /></button>
          <button class=${`carousel-right-arrow ${enableRightArrow ? '' : 'disabled'}`}
           onClick=${() => handleScroll('left')}><${ArrowForward} /></button>
        </div>`}
       
        
      </div>
      </div>
      ` : html`<div class="info-popup-first-section">
          <div class="thumbnail-img">
            ${
  displayedThumbnailUrl && html`<img src=${publishDomain}${displayedThumbnailUrl} />`
}
          </div>
          <div class="price-block">
            <div class="item-price">₹ ${infoAccessory?.price}</div>
              <div class="count-container">
                  ${isAccessoryAdded(infoAccessory)
    ? html`<${AddRemoveAccSvg} />
                    <div class="count-ctrl">
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleRemoveAccessory(infoAccessory);
  }}
                    >
                      -
                    </button>
                    <div class="accessory-vertical-separator"></div>
                    <span class="count-action">${addedAccessories.find((item) => item.partNum === infoAccessory.partNum)?.qty || 0}</span>
                    <div class="accessory-vertical-separator"></div>
                    <button 
                      class="count-action"
                      onClick=${(e) => {
    e.stopPropagation();
    handleAddAccessory(infoAccessory);
  }}
                    >
                      +
                    </button>
                    </div>`
    : html`<button class="accessory-action" onClick=${(e) => {
      e.stopPropagation();
      handleAddAccessory(infoAccessory);
    }}><div class="add-text">${addBtnLabel}</div><div class="add-icon"><${AddIcon} /></div></button>`
}                
            </div>
          </div>
        </div>
        <div class="info-popup-second-section">
          <div class="item-info-title">${infoAccessory?.partDesc}</div>
          <div class="image-carousel">
            <!-- div class="carousel-gradient-left"></div>
            <div class="carousel-gradient-right"></div -->
            <div 
              ref=${containerRef} 
              class="carousel-row"
              onTouchStart=${handleTouchStart}
              onTouchEnd=${handleTouchEnd}
              style=${{
    transform: `translateX(${currentTranslateX}px)`,
    transition: 'transform 0.3s ease-in-out',
  }}
            >
              ${desktopCarouselUrls?.map(
    (imgUrl) => html`
                    <div 
                      class=${`carousel-thumbnail ${displayedThumbnailUrl === imgUrl?.replace('desktop/72x54/', 'desktop/324x243/') ? 'active' : ''}`}
                      onClick=${() => handleDesktopCarouselClick(imgUrl)}
                    > 
                      <img src=${publishDomain}${imgUrl} />  
                    </div>`,
  )}
                    
            </div>
            ${isMobile ? html`
             <div class="carousel-dots">
          ${desktopCarouselUrls?.map((el, index) => html`<button  ref=${(el) => { itemDot.current[index] = el; }}  class="carousel-dot ${index === '0' ? 'active' : ''}" aria-label="Go to slide 0"></button>`)}
        </div>` : html`
        <div class="carousel-ctrl">
              <button className=${`carousel-left-arrow ${enableleftArrow ? '' : 'disabled'}`} 
              onClick=${() => handleScroll('left')}><${ArrowBackward} /></button>
              <button className=${`carousel-right-arrow ${enableRightArrow ? '' : 'disabled'}`}
               onClick=${() => handleScroll('right')}><${ArrowForward} /></button>
            </div>
        `}
          </div>

        </div>
        <div class="close-button" onClick=${(e) => {
    e.stopPropagation();
    handleCloseInfoPopup();
  }}>
          <${CloseIcon} />
        </div>
        `} 
      </div>
    </div>
  `;
};

export default InfoPopup;
