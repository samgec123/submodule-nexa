import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';
import HighlightUtils from '../../utility/highlightUtils.js';
import utility from '../../utility/utility.js';

export default function decorate(block) {
  if (utility.isEditorMode(block)) {
    block.classList.add('highlightItems-container-editor-mode');
  }

  const [idEl, clippingEl, themeTypeEl, titleEl, subtitleEl] = block.children;

  const id = utility.textContentChecker(idEl);
  const clipping = utility.textContentChecker(clippingEl);
  const themeType = utility.textContentChecker(themeTypeEl);

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList?.add('highlight-tabs__title');
  const subtitle = utility.textContentChecker(subtitleEl);

  const webName = '';
  let ACTIVE_INDEX = 0;

  if (id) {
    block.setAttribute('id', id);
  }

  const blockClone = block.cloneNode(true);
  const highlightItemListElements = Array.from(block.children).slice(5);
  const highlightItemListElementsClone = Array.from(blockClone.children).slice(5);

  if (clipping === 'Y') {
    block.closest('.highlight-tabs')?.classList?.add('allow-clipping');
  }
  if (themeType === 'variation2') {
    block.closest('.highlight-tabs')?.classList?.add('no-zoomin-effect');
  } else {
    block.closest('.highlight-tabs')?.classList?.add('zoomin-effect');
  }

  const highlightImages = highlightItemListElements.map((item, index) => {
    const [imageEl, altTextEl] = item.children;
    const image = imageEl?.querySelector('picture');
    if (image) {
      const img = image.querySelector('img');
      img?.classList?.add('highlightItem-img');
      if (themeType === 'variation1') {
        img?.classList?.add('zoom');
      }
      img?.removeAttribute('width');
      img?.removeAttribute('height');
      img?.removeAttribute('loading');
      const alt = altTextEl?.textContent?.trim() || 'Image Description';
      img?.setAttribute('alt', alt);
    }
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    imageContainer.dataset.index = index;
    if(!(index === ACTIVE_INDEX)) {
      imageContainer.classList.add('hidden');
    }
    imageContainer.innerHTML = image?.outerHTML || '';
    moveInstrumentation(item, imageContainer);
    return imageContainer.outerHTML;
  });

  const contentCards = highlightItemListElements.map((item, index) => {
    const [, , , lessContentEl, moreContentEl, readMoreEl] = item.children;

    const readMoreLabel = readMoreEl?.textContent?.trim() || '';

    lessContentEl?.classList.add('less-content');
    moreContentEl?.classList.add('more-content', 'hidden');

    const cardHtml = `
      <div class='content-card collapsed ${
  index === ACTIVE_INDEX ? '' : 'hidden'
}'>
        ${lessContentEl?.outerHTML}
        ${moreContentEl?.outerHTML}
        ${readMoreLabel ? '<button class="expand-collapse-button" type="button">Read more</button>' : ''}
      </div>
    `;

    return cardHtml;
  });

  const switchListHTML = HighlightUtils.generateSwitchListHTML(
    highlightItemListElementsClone,
    (highlightItem) => {
      const [, , tabNameEl] = highlightItem.children;
      return utility.textContentChecker(tabNameEl);
    },
  );

  block.innerHTML = `
    <div class='content-overlay'>
      <div class='content-header'>
        <div class='left-section'>
          ${title.outerHTML}
        </div>
        <div class='right-section'>
          <p class='subtitle'>
            ${subtitle}
          </p>
        </div>
      </div>
      <div class='content-body'>
        <div class='switch-list-container'>
          <button class="icon-button prev-btn" type='button'></button>
          ${switchListHTML}
          <button class="icon-button next-btn" type='button'></button>
        </div>
        <div class='images-container'>
          <div class="gradient-overlay"></div>
          ${highlightImages?.join('')}
        </div>
        <div class='cards-container'>
          ${contentCards?.join('')}
        </div>
      </div>
    </div>
    <div class='images-container-desktop'>
      ${highlightImages?.join('')}
    </div>
  `;

  const prevBtn = block.querySelector('.prev-btn');
  const nextBtn = block.querySelector('.next-btn');
  const switchListContainer = block.querySelector('.switch-list-section');
  const switches = switchListContainer.querySelectorAll('.switch-list-item');
  const images = block.querySelectorAll('.images-container .image-container');
  const desktopImages = block.querySelectorAll(
    '.images-container-desktop .image-container',
  );
  const cards = block.querySelectorAll('.content-card');

  function updateImage() {
    images.forEach((image) =>{
      image.classList.add('hidden');
      image.querySelector('img').classList.remove('zoom')
    })
    images[ACTIVE_INDEX]?.classList.remove('hidden');
    setTimeout(() => {
      images[ACTIVE_INDEX]?.querySelector('img').classList.add('zoom')
    }, 300);

    desktopImages.forEach((image) =>{
      image.classList.add('hidden');
      image.querySelector('img').classList.remove('zoom')
    })
    desktopImages[ACTIVE_INDEX]?.classList.remove('hidden');
    setTimeout(() => {
      desktopImages[ACTIVE_INDEX]?.querySelector('img').classList.add('zoom')
    }, 300);
    // desktopImages.forEach((image) => image.classList.add('hidden'));
    // desktopImages[ACTIVE_INDEX]?.classList.remove('hidden');
  }

  function updateCard() {
    cards.forEach((card) => card.classList.add('hidden'));
    cards[ACTIVE_INDEX]?.classList.remove('hidden');
  }

  function animateCard(currentHeight, targetHeight, target) {
    target.style.height = `${currentHeight}px`;

    setTimeout(() => {
      target.style.height = `${targetHeight}px`;
    }, 0);

    target.addEventListener('transitionend', function handler() {
      target.style.height = 'auto';
      target.removeEventListener('transitionend', handler);
    });
  }

  // first tab active initially
  switches[ACTIVE_INDEX].classList.add('active');

  prevBtn?.addEventListener('click', () => {
    switchListContainer.scrollBy({
      left: -100,
      behavior: 'smooth',
    });
  });

  nextBtn?.addEventListener('click', () => {
    switchListContainer.scrollBy({
      left: 100,
      behavior: 'smooth',
    });
  });

  switches?.forEach((sw, index) => {
    sw.addEventListener('click', (e) => {
      if (!sw.classList.contains('active')) {

        // Collapse all cards before switching
      cards?.forEach((card) => {
        const readMoreButton = card.querySelector('.expand-collapse-button');
        const lessContent = card.querySelector('.less-content');
        const moreContent = card.querySelector('.more-content');

        // Reset the "Read more" content state and collapse the card
        if(readMoreButton){
          lessContent.classList.remove('hidden');
          moreContent.classList.add('hidden');
          readMoreButton.textContent = 'Read more';
          card.classList.add('collapsed');
        }
      });

        switches.forEach((s) => s.classList.remove('active'));
        sw.classList.add('active');
        ACTIVE_INDEX = index;
        updateImage();
        updateCard();
      }
    });
  });

  

  cards?.forEach((card) => {
    const readMoreButton = card.querySelector('.expand-collapse-button');
    const lessContent = card.querySelector('.less-content');
    const moreContent = card.querySelector('.more-content');

    let currentHeight; let
      targetHeight;

    readMoreButton?.addEventListener('click', () => {
      if (card.classList.contains('collapsed')) {
        currentHeight = lessContent.offsetHeight;
        lessContent.classList.add('hidden');

        moreContent.classList.remove('hidden');
        targetHeight = moreContent.offsetHeight;

        readMoreButton.textContent = 'Read less';
        card.classList.remove('collapsed');

        animateCard(currentHeight, targetHeight, moreContent);
      } else {
        lessContent.classList.remove('hidden');
        targetHeight = lessContent.offsetHeight;

        currentHeight = moreContent.offsetHeight;
        moreContent.classList.add('hidden');

        readMoreButton.textContent = 'Read more';
        card.classList.add('collapsed');

        animateCard(currentHeight, targetHeight, lessContent);
      }
    });
  });

  function updateButtonVisibility() {
    if (switchListContainer.scrollLeft > 0) {
      prevBtn.style.visibility = 'visible';
    } else {
      prevBtn.style.visibility = 'hidden';
    }

    // hide and show next button
    if (
      switchListContainer.scrollLeft + switchListContainer.clientWidth
      === switchListContainer.scrollWidth
    ) {
      nextBtn.style.visibility = 'hidden';
    } else {
      nextBtn.style.visibility = 'visible';
    }
  }

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    switchListContainer.addEventListener('scroll', updateButtonVisibility);
  }

  // zoomin effect on first hover
  if (themeType === 'variation1') {
    document.querySelectorAll('.highlight-tabs').forEach((div) => {
      let hovered = false;
      const image = div.querySelector('.highlightItem-img');
      image?.classList?.remove('zoom');
      div.addEventListener('mouseenter', () => {
        if (!hovered) {
          hovered = true;
          setTimeout(() => {
            image?.classList?.add('zoom');
          }, 300);
        }
      });
    });
  }

  block.querySelectorAll('.read-more')?.forEach((item) => {
    const tabTitle = utility.textContentChecker(
      block.querySelector('.highlight-tabs__title'),
    );
    item?.addEventListener('click', (e) => {
      const data = {};
      const subtext1 = tabTitle ? `${tabTitle}|` : '';
      const subtext2 = utility.textContentChecker(
        block.querySelector('.switch-list-item.active'),
      );
      data.componentName = block.dataset.blockName;
      data.componentTitle = subtext1 + subtext2;
      data.componentType = 'link';
      data.webName = webName;
      data.linkType = e.target;
      analytics.setButtonDetails(data);
    });
  });
}
