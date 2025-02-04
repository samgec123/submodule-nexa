import analytics from '../../utility/analytics.js';
import HighlightUtils from '../../utility/highlightUtils.js';
import utility from '../../utility/utility.js';
import {
  fetchPlaceholders,
} from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const highlightItemButtons = {};
  const [idEl, clippingEl, themeTypeEl, preTitleEl, titleEl, subtitleEl] = block.children;

  const id = idEl?.textContent?.trim() || '';
  const clipping = clippingEl?.textContent?.trim() || '';
  const themeType = themeTypeEl?.textContent?.trim() || '';
  const preTitle = preTitleEl?.textContent?.trim() || '';

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList?.add('yy8-highlight-tabs__title');
  const subtitle = subtitleEl?.textContent?.trim() || '';

  if (id) {
    block.setAttribute('id', id);
  }

  const {
    publishDomain,
  } = await fetchPlaceholders();

  async function fetchPop(popupId) {
    try {
      const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/PopupListById;popupId=${popupId};locale=en`;
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(graphQlEndpoint, requestOptions);
      const result = await response.json();
      const { popups } = result.data.popupListModelList.items[0];

      let innerHTML = '';
      popups.forEach((popup) => {
        const p = `
          <div class="img-section">
            <div class="left">
              <h1>${popup?.popupTitle}</h1>
              <p>${popup?.popupDescription}</p>
            </div>
            <div class="right">
              ${popup?.imageOrVideoLink?._dynamicUrl
            ? `<img src="${publishDomain}${popup.imageOrVideoLink._dynamicUrl}" alt="${popup.popupTitle}" />`
            : ''}

               ${popup?.imageOrVideoLink?._path
            ? `<video controls>
                    <source src="${publishDomain}${popup.imageOrVideoLink._path}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>`
            : ''}
            </div>
            </div>
          </div>
        `;

        innerHTML += p;
      });

      return innerHTML;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error(error);
    }
  }
  if (utility.isEditorMode(block)) {
    block.classList.add('yy8-container-height-editor-mode');
  }
  function generateHighlightItemHTML(highlightItem, index) {
    const [
      imageEl,
      altTextEl,
      tabNameEl,
      descriptionEl,
      descriptionExEl,
      expandDescriptionEl,
      collapseDescriptionEL,
      variationForReadMoreEl,
      variationUrlEl,
      closeIconEl,
      closeIconAltEl,
      scrollDownIconEl,
      scrollDownIconAltEl
    ] = highlightItem.children;

    const image = imageEl?.querySelector('picture');
    if (image) {
      const img = image.querySelector('img');
      img?.classList?.add('yy8-highlightItem-img');
      img?.removeAttribute('width');
      img?.removeAttribute('height');
      img?.removeAttribute('loading');
      const alt = altTextEl?.textContent?.trim() || 'Image Description';
      img?.setAttribute('alt', alt);
      image.querySelector('img').innerHTML = img;
    }
    descriptionEl?.classList.add('more-content');
    descriptionExEl?.classList.add('more-content-expanded');
    descriptionExEl.style.display = 'none';

    const expandDescription = expandDescriptionEl?.textContent?.trim() || '';
    const collapseDescription = collapseDescriptionEL?.textContent?.trim() || '';

    const variationForReadMore = variationForReadMoreEl?.textContent?.trim() || '';
    const variationUrl = variationUrlEl?.textContent?.trim() || '';

    const tabName = tabNameEl?.textContent?.trim() || '';    

    const closeIcon = closeIconEl?.querySelector('picture');
    const closeIconAlt = closeIconAltEl?.textContent?.trim() || '';
    if (closeIcon) {
      const img = closeIcon.querySelector('img');
      img?.setAttribute('alt', closeIconAlt);
    }

    const scrollDownIcon = scrollDownIconEl?.querySelector('picture');
    const scrollDownIconAlt = scrollDownIconAltEl?.textContent?.trim() || '';
    if (closeIcon) {
      const img = scrollDownIcon.querySelector('img');
      img?.setAttribute('alt', scrollDownIconAlt);
    }

    let variationHTML = '';
    let popupHTML = '';

    function createUniquePopupId() {
      return `${new Date().getTime()}`;
    }

    if (variationForReadMore === 'forPopUp') {
      const uniquePopupId = createUniquePopupId();

      let tabNameWithHyphen = tabName.replaceAll(' ', '-');

      variationHTML = `<a href="#" onclick="popupFn(event, '${tabNameWithHyphen}', '${uniquePopupId}')" class="read-more ${tabNameWithHyphen}">${expandDescription} <img src="${window.hlx.codeBasePath}/icons/read-more.svg" alt="" /></a>`;
      popupHTML = `<div id="overlay-${tabNameWithHyphen}-${uniquePopupId}" class=""></div>
         <div id="popupDialog-${tabNameWithHyphen}-${uniquePopupId}" class="">
             <div class="popupInner">
                 <button class="close" onclick="closeFn(event, '${tabNameWithHyphen}', '${uniquePopupId}')">
                 ${closeIcon?.innerHTML}
                 </button>
                 <div class="scrollable-container ${tabNameWithHyphen}">

                 </div>
             </div>
             <div class="scroll-icon popup-scroll-icon">
             ${scrollDownIcon?.querySelector('img')?.outerHTML}
             </div>
         </div>
      `;
    } else if (variationForReadMore === 'forUrl') {
      variationHTML = `<a href="${variationUrl}" class="read-more">${expandDescription}  <img src="${window.hlx.codeBasePath}/icons/read-more.svg" alt="" /></a>`;
    }

    highlightItemButtons[index] = {
      expandBtn: expandDescription,
      collapseBtn: collapseDescription,
    };

    const tabNameMobile = document.createElement('span');
    tabNameMobile.textContent = tabNameEl?.textContent?.trim();
    const extendedDescription = descriptionEl?.querySelector('p');
    extendedDescription?.insertBefore(tabNameMobile,extendedDescription.firstChild);
    const newHTML = utility.sanitizeHtml(`
          ${(image) ? image.outerHTML : ''}
          <div class="yy8-highlightItem-content">
          ${(descriptionEl) ? `${descriptionEl.outerHTML}` : ''}
          ${(descriptionExEl) ? descriptionExEl.outerHTML : ''}
          ${variationHTML}
          </div>
    `);

    highlightItem?.classList?.add('yy8-highlightItem', `switch-index-${index}`);
    highlightItem.innerHTML = newHTML + utility.sanitizeHtml(`${popupHTML}`);

    return highlightItem?.outerHTML;
  }

  function initializeHighlightItem(highlightItem, index) {
    const moreContent = highlightItem.querySelector('.more-content');
    const moreContentExpanded = highlightItem.querySelector('.more-content-expanded');
    const readMoreButton = highlightItem.querySelector('.read-more');
  }

  function initializeHighlightItems(highlightItems) {
    highlightItems.forEach((highlightItem, index) => {
      initializeHighlightItem(highlightItem, index);
    });
  }

  Array.from(document.getElementsByClassName('read-more')).forEach((element) => {
    if (!element.hasAttribute('data-listener-attached')) {
      element.addEventListener('click', async (event) => {
        const className = event.target.classList[1];
        try {
          const popupsHTML = await fetchPop(className);
          const container = document.querySelector(`.scrollable-container.${className}`);
          if (container) {
            container.innerHTML = popupsHTML;
          }
        } catch (error) {
          console.error('Error loading popups:', error);
        }
      });
      element.setAttribute('data-listener-attached', 'true');
    }
  });

  const blockClone = block.cloneNode(true);

  const highlightItemListElements = Array.from(block.children).slice(6);
  const highlightItemListElementsClone = Array.from(blockClone.children).slice(6);
  if (clipping === 'Y') {
    block.closest('.yy8-highlight-tabs-wrapper')?.classList?.add('allow-clipping');
  }
  if (themeType === 'variation2') {
    block.closest('.yy8-highlight-tabs-wrapper')?.classList?.add('no-zoomin-effect');
  } else {
    block.closest('.yy8-highlight-tabs-wrapper')?.classList?.add('zoomin-effect');
  }

  const highlightItemsHTML = highlightItemListElements
    .map((highlightItem, index) => generateHighlightItemHTML(highlightItem, index)).join('');
  const switchListHTML = HighlightUtils
    .generateSwitchListHTML(highlightItemListElementsClone, (highlightItem) => {
      const [, , tabNameEl] = highlightItem.children;
      return tabNameEl?.textContent?.trim() || '';
    });

  const highlightItemsContainer = document.createElement('div');
  highlightItemsContainer?.classList?.add('yy8-highlightItems-container');
  highlightItemsContainer.innerHTML = highlightItemsHTML;
  block.innerHTML = utility.sanitizeHtml(`
    <div class="text-section">
      
      ${(title) ? `<div class="top-left"> 
        ${(preTitle) ? `<span class="car-highlight-pretitle">${preTitle}</span>` : ''}
            ${title.outerHTML}
            </div>` : ''}
      ${(subtitle) ? `<div class="top-right"> <p>${subtitle}</p> </div>` : ''}
    </div>
    <div class="yy8-highlighItem-switchList-container">
      ${(highlightItemsHTML) ? `<div class="yy8-highlightItems-container"> ${highlightItemsHTML} </div>` : ''}
      ${(switchListHTML) ? `<div class="switch-list-container"> 
        <p class="switchList-prev-arrow"></p> 
        ${switchListHTML}
        <p class="switchList-next-arrow"></p> 
      </div>` : ''}

      <div class="slider-controls">
        <div class="slider-dots"></div>
        <div class="slider-arrows">
          <span class="arrow prev-arrow">
            <img src="${window.hlx.codeBasePath}/icons/west.svg" alt="Previous" />
          </span>
          <span class="arrow next-arrow">
            <img src="${window.hlx.codeBasePath}/icons/east.svg" alt="Next" />
          </span>
      </div>
    </div>
    </div>`);

  const prevArrow = block.querySelector('.arrow.prev-arrow');
  const nextArrow = block.querySelector('.arrow.next-arrow');
  const sliderContent = block.querySelector('.yy8-highlightItems-container');
  const slides = block.querySelectorAll('.yy8-highlightItem');
  const sliderDotsContainer = block.querySelector('.slider-dots');
  let touchstartX = 0;
  let touchendX = 0;
  let currentIndex = 0;

  const updateSliderPosition = () => {
    toggleSwitchIndexDisplay(currentIndex);
    updateActiveDot(currentIndex);

    prevArrow.classList.toggle('disabled', currentIndex === 0);
    nextArrow.classList.toggle('disabled', currentIndex === slides.length - 1);
  };

  const addSliderDots = () => {
    const numberOfDots = slides.length;

    sliderDotsContainer.innerHTML = '';

    for (let i = 0; i < numberOfDots; i++) {
      const dot = document.createElement('span');
      dot.classList.add('slider-dot');
      dot.dataset.index = i;

      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        goToSlide(index);
      });

      sliderDotsContainer.appendChild(dot);
    }

    updateActiveDot(0);
  };

  const updateActiveDot = (index) => {
    const dots = sliderDotsContainer.querySelectorAll('.slider-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) {
      dots[index].classList.add('active');
    }
  };

  const goToSlide = (index) => {
    currentIndex = index;
    updateSliderPosition();
  };

  prevArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
      toggleSwitchIndexDisplay(currentIndex);
    } else {
      console.log('Prev Arrow Clicked: Already at the first slide');
    }
  });
  
  nextArrow.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateSliderPosition();
      toggleSwitchIndexDisplay(currentIndex);
    } else {
      console.log('Next Arrow Clicked: Already at the last slide');
    }
  });

  sliderContent.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;    
  }, false);

  sliderContent.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
   if (touchendX === event.changedTouches[0].screenX) {
      handleGesture();
    }
  }, false);

  function handleGesture() {
    if (touchendX < touchstartX) {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        updateSliderPosition();
        toggleSwitchIndexDisplay(currentIndex);
      }
    }

    if (touchendX > touchstartX) {
      if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
        toggleSwitchIndexDisplay(currentIndex);
      }
    }
  }

  function toggleSwitchIndexDisplay(index) {
    const highlightItems = block.querySelectorAll('.yy8-highlightItem');
    
    highlightItems.forEach((item, i) => {
      const itemClass = item.classList.contains(`switch-index-${index}`) ? 'flex' : 'none';
      item.style.display = itemClass === 'flex' ? 'flex' : 'none';
    });
  }

  addSliderDots();
  updateSliderPosition();
  toggleSwitchIndexDisplay(currentIndex);

  const nextBtn = block.querySelector('.switchList-next-arrow');
  const prevBtn = block.querySelector('.switchList-prev-arrow');

  nextBtn.addEventListener('click', () => {
    const activeIndex = getActiveIndex();
    const nextIndex = (activeIndex + 1) % highlightItemListElements.length;
    goToSlide(nextIndex);
  });

  prevBtn.addEventListener('click', () => {
    const activeIndex = getActiveIndex();
    const prevIndex = (activeIndex - 1 + highlightItemListElements.length) % highlightItemListElements.length;
    goToSlide(prevIndex);
  });

  function getActiveIndex() {
    const switchListContainer = block.querySelector('.switch-list');
    const activeSlide = Math.round(switchListContainer.scrollLeft / switchListContainer.clientWidth);
    return activeSlide;
  }

  initializeHighlightItems(block.querySelectorAll('.yy8-highlightItem-content'));
  HighlightUtils.setupTabs(block, 'yy8-highlightItem');

  function hideReadMoreText(highlighItems) {
    highlighItems.forEach((item) => {
      item.querySelector('.read-more').style.display = 'none';
      item.querySelector('.more-content-expanded').style.display = 'none';
    });
  }

  const switchListContainer = block.querySelector('.switch-list');
  let switchListItemsLength = block.querySelectorAll('.switch-list-item').length;
  const switchListItem = block.querySelectorAll('.switch-list-item');
  const highlightItems = block.querySelectorAll('.yy8-highlightItem');

  switchListItem.forEach((element,index) => {
    element.addEventListener('click', () => {
      setTimeout(() => {
        highlightItems.forEach(image => {
          image.querySelector('img').classList.remove('zoom');
        });
        highlightItems[index]?.querySelector('img').classList.add('zoom')
      }, 300);
    });
  });

  if (themeType === 'variation2') {
    switchListItemsLength = (switchListItemsLength - 1) * 2;
    const highlighItems = block.querySelectorAll('.yy8-highlightItem');
  } else {
    switchListItemsLength *= 2;
  }
  // switchListContainer.style.top = `-${switchListItemsLength}rem`;

  function nextSlide() {
    switchListContainer.scrollBy({
      left: switchListContainer.clientWidth,
      behavior: 'smooth',
    });
    prevBtn.style.display = 'block';
    prevBtn.classList.remove('hidden');
    if (Math.round(switchListContainer.scrollLeft) + Math.round(switchListContainer.clientWidth) >= switchListContainer.scrollWidth - Math.round(switchListContainer.clientWidth)) {
      nextBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
    }
  }

  function prevSlide() {
    switchListContainer.scrollBy({
      left: -switchListContainer.clientWidth,
      behavior: 'smooth',
    });
    nextBtn.classList.remove('hidden');
    if (Math.round(switchListContainer.scrollLeft) - Math.round(switchListContainer.clientWidth) <= 0) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  function updateButtonVisibility() {
    if (switchListContainer.scrollLeft > 0) {
      prevBtn.style.display = 'block';
    } else {
      prevBtn.style.display = 'none';
    }
    if (switchListContainer.scrollLeft + switchListContainer.clientWidth < switchListContainer.scrollWidth - 8) {
      nextBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'none';
    }
  }

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    prevBtn.style.display = 'none';
    switchListContainer.addEventListener('scroll', updateButtonVisibility);
  } else {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  document.querySelectorAll('.yy8-highlight-tabs-wrapper').forEach((div) => {
    let hovered = false;
    div.addEventListener('mouseenter', () => {
      const image = div.querySelector('.yy8-highlightItem-img');
      if (!hovered) {
        image.classList.add('zoom');
        hovered = true;
        setTimeout(() => {
          image.classList.remove('zoom');
        }, 1000);
      }
    });
  });

  block.querySelectorAll('.read-more').forEach((item) => {
    const title = block.querySelector('.yy8-highlight-tabs__title')?.textContent?.trim() || '';
    item.addEventListener('click', (e) => {
      const data = {};
      data.componentName = block.dataset.blockName;
      data.componentTitle = ((title) ? `${title}|` : '') + block.querySelector('.switch-list-item.active')?.textContent?.trim() || '';
      data.componentType = 'button';
      data.webName = e.target?.textContent?.trim() || '';
      data.linkType = e.target;
      analytics.setButtonDetails(data);
    });
  });
}

window.popupFn = function (event, title, uniquePopupId) {
  event.preventDefault();
  document.getElementById(
    `overlay-${title}-${uniquePopupId}`,
  ).style.display = 'block';
  document.getElementById(
    `popupDialog-${title}-${uniquePopupId}`,
  ).style.display = 'block';


  const data = {};
  data.componentName = event?.target?.innerHTML.trim();
  data.componentTitle = `${title}`;
  data.componentType = 'button';
  data.webName = 'PopUp';
  event.target.addEventListener('click', () => {
    analytics.setButtonDetails(data);
  });

  document.addEventListener('keyup', function(e) {
    if (e.keyCode == 27) {
      closepopup(title, uniquePopupId);
    }
});

};

window.closeFn = function (event, title, uniquePopupId) {
  closepopup(title, uniquePopupId);
};
function closepopup(title, uniquePopupId) {
  document.getElementById(
    `overlay-${title}-${uniquePopupId}`,
  ).style.display = 'none';
  document.getElementById(
    `popupDialog-${title}-${uniquePopupId}`,
  ).style.display = 'none';
  }