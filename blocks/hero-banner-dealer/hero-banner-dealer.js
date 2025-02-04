import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import utility from '../../utility/utility.js';
import { dispatchHeroBannerDealerEvent } from '../../scripts/customEvents.js';

export default function decorate(block) {
  const [
    pretitleEl,
  ] = block.children;

  const pretitle = pretitleEl?.textContent?.trim() || '';
  let currentIndex = 0;

  function generateImageContainer(item, index) {
    const [, imageEl,
      altTextEl, ,
    ] = item.children;

    const picture = imageEl?.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      img.removeAttribute('width');
      img.removeAttribute('height');
      const alt = altTextEl?.textContent?.trim() || 'image';
      img.setAttribute('alt', alt);
      img.classList.add('hero-banner-dealer__image-container');
    }

    const newHTML = `${picture ? picture.outerHTML : ''}`;
    item?.classList?.add('hero-banner-dealer__image', `index-${index}`);
    item.innerHTML = newHTML;
    return item?.outerHTML;
  }

  function generateSubTextContainer(item, index) {
    const [, , ,
      subtitleEl,
    ] = item.children;

    const tabtitle = Array.from(subtitleEl?.querySelectorAll('p'))?.map((p) => p.outerHTML).join('') || '';

    const newHTML = `${(tabtitle) ? `<div class="hero-banner-item-title index-${index}">${tabtitle}</div>` : ''}`;
    // newHTML?.classList.add('hero-banner-item-title', `index-${index}`);
    // item.innerHTML = newHTML;
    return newHTML;
  }

  function generateCtasContainer(item, index) {
    const [
      ctaEl, , , , idEl,
    ] = item.children;

    const tabtitle = ctaEl?.textContent?.trim() || '';

    const li = document.createElement('li');
    li.dataset.eventId = idEl?.textContent?.trim() || '';
    li.classList.add('ctaList', `index-${index}`);
    li.innerHTML = `<span class="scroll-bar"></span><a class="cta-text">${tabtitle}</a>`;
    moveInstrumentation(ctaEl, li);
    const svgElement = `<span class="arrow"><svg class="double-arrow" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24.0001 41.269L15.6541 32.923L17.8231 30.754L24.0001 36.931L30.1771 30.754L32.3461 32.923L24.0001 41.269ZM17.8231 17.369L15.6541 15.2L24.0001 6.854L32.3461 15.2L30.1771 17.369L24.0001 11.192L17.8231 17.369Z" fill="#F2F2F2"/>
    </svg></span>`;
    li.innerHTML += svgElement;
    return li.outerHTML;
  }

  const blockClone = block.cloneNode(true);
  const imageListElements = Array.from(block.children).slice(1);
  const imageItemsHTML = imageListElements
    .map((imageItems, index) => generateImageContainer(imageItems, index)).join('');

  const listElements = Array.from(blockClone.children).slice(1);
  const ctaItemsHTML = listElements
    .map((ctaItems, index) => generateCtasContainer(ctaItems, index)).join('');

  const textItemsHTML = listElements
    .map((textItems, index) => generateSubTextContainer(textItems, index))
    .join('');

  block.innerHTML = utility.sanitizeHtml(`
  <div class="hero-banner-dealer__container right-seperator">
    <div class="hero-banner-dealer__container">
      <div class="hero-banner-dealer__section">
      <div class="hero-banner-dealer-image_text-container">
        <div class="hero-banner-dealer__image-container">
          ${imageItemsHTML}
        </div>
        <div class="hero-banner-dealer__overlay">
          <div class="hero-banner-dealer__content">
            <p class="pre-title">${pretitle}</p>
          </div>
          <div class="hero-banner_content-container">
            <div class="hero-banner-dealer__action">
              <ul class="list-container">
                ${ctaItemsHTML}
              </ul>
            </div>
            <div class="hero-banner-dealer__description">
              ${textItemsHTML}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
`);

  // Function to toggle highlights based on the index
  const toggleHighlight = (index) => {
    const ctaElements = block.querySelectorAll('.cta-text');
    const scrollBars = block.querySelectorAll('.scroll-bar');
    ctaElements.forEach((cta, i) => {
      const isActive = i === index;
      currentIndex = index;
      if (isActive) {
        cta.closest('li').classList.add('ctaList-active');
        sessionStorage.setItem('selectedHeroBannerCTA', index);
      } else {
        cta.closest('li').classList.remove('ctaList-active');
      }
      cta.classList.toggle('highlight', isActive);
      scrollBars[i].classList.toggle('highlight', isActive);
    });
  };

  function setupScrollHighlight() {
    const ctaElements = block.querySelectorAll('.cta-text');
    const scrollBars = block.querySelectorAll('.scroll-bar');
    const imageItems = block.querySelectorAll('.hero-banner-dealer__image');
    const textItems = block.querySelectorAll('.hero-banner-item-title');

    // Initialize highlights if elements are present
    if (ctaElements.length > 0 && scrollBars.length > 0) {
      ctaElements[0].classList.add('highlight');
      scrollBars[0].classList.add('highlight');
      imageItems[0].style.display = 'block';
      textItems[0].style.display = 'block';
      imageItems[1].style.display = 'none';
      textItems[1].style.display = 'none';
    }
    const ctaNumber = sessionStorage.getItem('selectedHeroBannerCTA');
    if(ctaNumber){
      toggleHighlight(parseInt(ctaNumber.trim(),10));
    }
    else{
      toggleHighlight(0);
    }
    
  }

  // Call the function to initialize
  setupScrollHighlight();

  const dealerTabs = block.querySelector('.list-container');

  function changeHighlightedCta(event, clickedIndex) {
    const dealerTabItem = event.target.closest('.ctaList');
    const index = clickedIndex ?? Array.from(dealerTabs.children).indexOf(dealerTabItem);

    const imageItems = block.querySelectorAll('.hero-banner-dealer__image');
    const textItems = block.querySelectorAll('.hero-banner-item-title');
    const ctaLists = block.querySelectorAll('.ctaList');

    if (imageItems.length > 0) {
      imageItems.forEach((imageItem) => {
        imageItem.style.display = 'none';
      });
    }
    if (textItems.length > 0) {
      textItems.forEach((textItem) => {
        textItem.style.display = 'none';
      });
    }
    if (imageItems.length > index) {
      imageItems[index].style.display = 'block';
    }
    if (textItems.length > index) {
      textItems[index].style.display = 'block';
    }
    toggleHighlight(index);
    dispatchHeroBannerDealerEvent(ctaLists[index].dataset.eventId);
  }

  dealerTabs.addEventListener('click', (event) => {
    changeHighlightedCta(event);
  });
  block.querySelectorAll('.double-arrow').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      changeHighlightedCta(event, 1 - currentIndex);
    });
  });
  
  return block;
}
