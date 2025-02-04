import utility, { Viewport } from '../../../utility/utility.js';

function updateView(arrowDiv, jcItems, backgroundImage) {
  Viewport.getDeviceType();
  if (Viewport.isTablet()) {
    arrowDiv.style.display = 'block';
  } else {
    arrowDiv.style.display = 'none';
  }
  // move to the first item when view switches
  jcItems.style.transform = 'translateX(0px)';

  if (Viewport.isMobile()) {
    const imageUrl = backgroundImage.querySelector('img').src;
    jcItems.style.backgroundImage = `url(${imageUrl})`;
  } else {
    jcItems.style.backgroundImage = 'none';
  }
}

function addNavigationListeners(arrowDiv, jcItems) {
  const leftArrow = arrowDiv.querySelector('.left-arrow');
  const rightArrow = arrowDiv.querySelector('.right-arrow');
  const jcItemDetails = Array.from(jcItems.querySelectorAll('.jc-item'));
  let currentIndex = 0;

  function updateCarousel() {
    const itemWidth = jcItemDetails[0]?.offsetWidth || 0; // Get the width of one item
    jcItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }

  leftArrow.addEventListener('click', () => {
    if (currentIndex <= 0) {
      currentIndex = jcItemDetails.length - 2; // Move to the last item
    } else {
      currentIndex = (currentIndex - 1 + jcItemDetails.length) % jcItemDetails.length;
    }
    updateCarousel();
  });

  rightArrow.addEventListener('click', () => {
    if (currentIndex >= jcItemDetails.length - 2) {
      currentIndex = 0; // Move to the first item
    } else {
      currentIndex = (currentIndex + 1) % jcItemDetails.length;
    }
    updateCarousel();
  });
}

export default async function decorate(block) {
  const [jcdetailsEl, ...jcItemListEl] = [...block.children];
  const [innerDivJcDetails] = [...jcdetailsEl.children];
  const [backgroundImage,
    commonImage,
    commonTextHeading,
    commonTextNormal] = [...innerDivJcDetails.children];
  let detailsHTML = '';

  if (jcdetailsEl && commonTextHeading && commonTextNormal) {
    detailsHTML = utility.sanitizeHtml(`<div class="jc-details"><div>
      ${backgroundImage.outerHTML}
      ${commonImage.outerHTML}
      <div class="wrapped-content">${commonTextHeading.outerHTML} ${commonTextNormal.outerHTML} </div>
    </div></div>`);
  }

  const itemsHTML = jcItemListEl.map((div, index) => {
    const arrowHTML = index === 0 ? '<div class="jc-arrow"></div>' : '';
    return utility.sanitizeHtml(`
    <div class="jc-item">
      ${arrowHTML}
      <div class="jc-item-details">${div.outerHTML}</div>
      <div class="jc-arrow"></div>
    </div>
  `);
  }).join('');

  const carouselHTML = utility.sanitizeHtml(`
  <div class="carousel-div">
    <div class="jc-items">
      ${itemsHTML}
    </div>
    <div class="arrow-div">
      <div class="left-arrow"></div>
    <div class="right-arrow"></div>
  </div>`);

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', detailsHTML);
  block.insertAdjacentHTML('beforeend', carouselHTML);

  if (Viewport.isMobile()) {
    const imageUrl = backgroundImage.querySelector('img').src;
    const itemsDiv = block.querySelector('.jc-items');
    itemsDiv.style.backgroundImage = `url(${imageUrl})`;
  }

  const arrowDiv = block.querySelector('.arrow-div');
  const jcItems = block.querySelector('.jc-items');
  addNavigationListeners(arrowDiv, jcItems);

  window.addEventListener('resize', () => {
    updateView(arrowDiv, jcItems, backgroundImage);
  });
}
