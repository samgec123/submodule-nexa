import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';
import '../../commons/scripts/splide/splide.js';

export default async function decorate(block) {
  const [idEl, titleEl, descriptionEl, ...carItemsContainer] = Array.from(
    block.children,
  );

  block.classList.add('separator', 'separator-black', 'separator-sm');

  const { ariaLabelPrev, ariaLabelNext } = await fetchPlaceholders();

  const id = idEl?.querySelector('p')?.textContent || null;

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
  if (title) title.classList.add('benefit-cards-title');
  const description = descriptionEl?.children[0]?.innerHTML || '';

  let newContainerHTML = '<div class="card-items-container">';

  carItemsContainer.forEach((item) => {
    const [
      itemTitleEl,,
      itemDescriptionEl,
      itemImageContainer,
      altTextEl,
      itemDetailsEl,
    ] = item.children;
    const itemTitle = itemTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
    itemTitle.classList.add('item-title');

    const itemDescription = itemDescriptionEl?.children[0]?.innerHTML || '';

    const picture = itemImageContainer?.querySelector('picture');

    if (picture) {
      const img = picture.querySelector('img');
      img.removeAttribute('width');
      img.removeAttribute('height');
      const alt = altTextEl?.textContent?.trim() || 'image';
      img.setAttribute('alt', alt);
    }
    const itemDetailsArray = itemDetailsEl?.textContent?.trim().split('\n') || []; // Adjust the delimiter as needed
    const itemDetailsList = itemDetailsArray
      .map((detail) => `<li>${detail.trim()}</li>`)
      .join('');

    const itemDetailsHTML = `<ul>${itemDetailsList}</ul>`;

    item.innerHTML = `
      <div class="card-item">
        ${itemTitle.outerHTML || ''}
        <div class="card-item-description" >${itemDescription}</div>
        <div class="img-list-container">
        <div class="card-item-details" >${itemDetailsHTML}</div>
        <div class="card-item-image">${picture ? picture.outerHTML : ''}</div>
        </div>
        
      </div>`;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });

  newContainerHTML += '</div>';

  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="benefit-cards-list block">
      <div class="container">
        <div class="benefit-cards-heading-container">
          <div class='benefit-cards-list-header'>${title.outerHTML || ''}</div>
          <div class="benefit-cards-list-description">${description}</div>
        </div>
        <div class="benefit-cards_wrapper">
        <div class="mobgradient"></div> 
        <div class="benefit-cards-items">
          ${newContainerHTML}
        </div>
        </div>
        <div class="benefit-cards-ctas-container">
          <div class="carousel-arrow_navigation-container">
            <div class="carousel-arrow_navigation">
              <button class="prev_arrow" aria-label= ${ariaLabelPrev}></button>
              <button class="next_arrow" aria-label= ${ariaLabelNext}></button>
            </div
          </div>
        </div>
      </div>
    </div>
  `);

  const isMobile = utility.isMobileDevice();
  const cardItemsContainer = block.querySelector('.card-items-container');
  const nextBtn = block.querySelector('.next_arrow');
  const prevBtn = block.querySelector('.prev_arrow');
  //   const primaryBtn = block.querySelector(".primary-cta-container");
  let currentIndex = 0;
  const cardNumbers = 1;
  let blockNumbers = 0;

  function createCardsWrapper() {
    const powertrainItems = block.querySelectorAll('.card-item');
    cardItemsContainer.innerHTML = '';
    for (let i = 0; i < powertrainItems.length; i += 1) {
      cardItemsContainer.innerHTML += powertrainItems[i].outerHTML;
      blockNumbers += 1;
    }
  }

  function hideSelectedItem(powerItemContainer) {
    powerItemContainer.forEach((container) => {
      container.classList.remove('selected');
      container.querySelector('.card-item-details').style.display = 'none';
      container.querySelector('.card-item-description').style.display = 'none';
    });
  }

  function updateDesktopCards() {
    const powertrainItems = block.querySelectorAll('.card-item');
    if (powertrainItems.length === 2) {
      powertrainItems[0]?.classList?.add('selected');
      powertrainItems[1]?.classList?.add('selected');
    } else {
      powertrainItems[0]?.classList?.add('selected');
    }
    powertrainItems.forEach((item) => {
      if (item.classList.contains('selected')) {
        item.querySelector('.card-item-details').style.display = 'none';
        item.querySelector('.card-item-description').style.display = 'block';
      } else {
        item.querySelector('.card-item-details').style.display = 'none';
        item.querySelector('.card-item-description').style.display = 'none';
      }
      item.addEventListener('click', (e) => {
        const powerItemContainer = e.target
          .closest('.cardsWrapper')
          .querySelectorAll('.card-item');
        const powertrainItem = e.target.closest('.card-item');
        hideSelectedItem(powerItemContainer);
        powertrainItem.classList.add('selected');
        powertrainItem.querySelector('.card-item-details').style.display = 'none';
        powertrainItem.querySelector('.card-item-description').style.display = 'block';
      });
    });
  }

  function updateArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === blockNumbers - 1;
  }

  function showItem(index) {
    currentIndex = index;
    const powertrainItems = block.querySelectorAll('.card-item');
    powertrainItems.forEach((item, i) => {
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        item.querySelector('.card-item-details').style.display = 'none';
        item.querySelector('.card-item-description').style.display = 'none';
      }
      if (cardNumbers * currentIndex === i) {
        item.classList.add('selected');
        item.querySelector('.card-item-details').style.display = 'block';
        item.querySelector('.card-item-description').style.display = 'block';
      }
    });
    updateArrows();
  }

  function nextSlide() {
    if (currentIndex < blockNumbers - 1) {
      showItem(currentIndex + 1);
      updateArrows();
    }
    const selectedIndex = Array.from(
      document.querySelectorAll('.card-item'),
    ).findIndex((item) => item.classList.contains('selected'));
    if (
      window.innerWidth > 768
      && selectedIndex !== -1
      && selectedIndex < document.querySelectorAll('.card-item').length - 1
    ) {
      document.querySelectorAll('.card-item')[selectedIndex + 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      showItem(currentIndex - 1);
      updateArrows();
    }
    if (
      window.innerWidth > 768
      && document.querySelectorAll('.card-item')[1].classList.contains('selected')
    ) {
      document.querySelectorAll('.card-item')[0].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  function updateMobileArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === block.querySelectorAll('.card-item').length - 1;
  }

  function updateMobileCards() {
    const powertrainItems = block.querySelectorAll('.card-item');
    powertrainItems[0]?.classList?.add('selected');
    powertrainItems.forEach((item) => {
      if (item.classList.contains('selected')) {
        item.querySelector('.card-item-description').style.display = 'block';
      } else {
        item.querySelector('.card-item-description').style.display = 'none';
      }
    });
    updateMobileArrows();
  }

  function updateMobileCardsPosition(index) {
    const items = block.querySelectorAll('.card-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.style.transform = `translateX(-${index * 100}%)`;
        item.style.transition = 'transform 0.9s ease';
      } else {
        item.style.transform = 'translateX(0)';
        item.style.transition = 'transform 0.9s ease';
      }
    });
  }

  function showMobileItem(index) {
    currentIndex = index;

    const powertrainItems = block.querySelectorAll('.card-item');
    powertrainItems.forEach((item, i) => {
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        item.querySelector('.card-item-description').style.display = 'none';
      }
      if (i === currentIndex) {
        item.classList.add('selected');
        item.querySelector('.card-item-description').style.display = 'block';
      }
    });
    updateMobileArrows();
    updateMobileCardsPosition();
  }

  function checkPowertrainItem() {
    const powertrainItems = document.querySelectorAll('.card-item');
    powertrainItems.forEach((item) => {
      if (item.classList.contains('selected')) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkPowertrainItem();
  });

  function nextMobileSlide() {
    if (currentIndex < block.querySelectorAll('.card-item').length) {
      updateMobileCardsPosition(currentIndex);
      showMobileItem(currentIndex + 1);
    }
  }

  function prevMobileSlide() {
    if (currentIndex >= 0) {
      showMobileItem(currentIndex);
      updateMobileCardsPosition();
    }
  }

  if (isMobile) {
    block.querySelector('.carousel-arrow_navigation-container').style.display = 'block';
    updateMobileCards();
    nextBtn.addEventListener('click', () => {
      nextMobileSlide();
      checkPowertrainItem();
    });
    prevBtn.addEventListener('click', () => {
      prevMobileSlide();
      checkPowertrainItem();
    });
  } else {
    const powertrainItems = block.querySelectorAll('.card-item');
    if (powertrainItems.length > cardNumbers) {
      cardItemsContainer
        .closest('.benefit-cards-list')
        .querySelector('.carousel-arrow_navigation-container').style.display = 'flex';
      prevBtn.disabled = true;
    } else {
      cardItemsContainer
        .closest('.benefit-cards-list')
        .querySelector('.carousel-arrow_navigation-container').style.display = 'none';
    }
    createCardsWrapper();
    updateDesktopCards();
  }

  block.addEventListener('click', (e) => {
    const link = e.target?.closest('a');
    if (!link) {
      return;
    }
    const data = {};
    data.componentTitle = block.querySelector('.benefit-cards-title')?.textContent?.trim() || '';
    data.componentName = block.dataset.blockName;
    data.componentType = 'button';
    data.webName = link.textContent?.trim() || '';
    data.linkType = link;
    analytics.setButtonDetails(data);
  });

  return block;
}
