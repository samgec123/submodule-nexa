import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [
    idEl,
    titleEl,
    descriptionEl,
    primaryCtaTextEl,
    primaryCtaLinkEl,
    primaryCtaTargetEl,
    secondaryCtaTextEl,
    secondaryCtaLinkEl,
    secondaryCtaTargetEl,
    ...powertrainItemsContainer
  ] = block.children;
  const { ariaLabelPrev, ariaLabelNext } = await fetchPlaceholders();

  const id = idEl?.querySelector('p')?.textContent || null;
  const {
    allFilterText,
  } = await fetchPlaceholders();

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
  if (title) { title.classList.add('powertrains-title'); }
  const description = descriptionEl?.children[0]?.innerHTML || '';

  const primaryCtaText = primaryCtaTextEl?.querySelector('p')?.textContent?.trim() || '';
  const primaryCtaLink = primaryCtaLinkEl?.querySelector('a')?.href || '#';
  // eslint-disable-next-line no-unused-vars
  const primaryCtaTarget = primaryCtaTargetEl?.querySelector('p')?.textContent?.trim() || '_self';
  const secondaryCtaText = secondaryCtaTextEl?.querySelector('p')?.textContent?.trim() || '';
  const secondaryCtaLink = secondaryCtaLinkEl?.querySelector('a')?.href || '#';
  const secondaryCtaTarget = secondaryCtaTargetEl?.querySelector('p')?.textContent?.trim() || '_self';

  let newContainerHTML = '<div class="powertrain-items-container">';

  powertrainItemsContainer.forEach((item) => {
    const [itemTitleEl, itemVariantsEl, itemDescriptionEl, itemImageContainer, altTextEl, itemDetailsEl, ctaIconEl] = item.children;
    const itemTitle = itemTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
    itemTitle.classList.add('item-title');
    const itemVariants = itemVariantsEl?.children[0]?.innerHTML || '';
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
    const ctaIconHTML = ctaIconEl?.querySelector('img')?.outerHTML || '';

    item.innerHTML = `
      <div class="powertrain-item">
        <div class="clipping"></div>
        ${itemTitle.outerHTML || ''}
        <h4 class="powertrain-item-variants">${itemVariants}</h4>
        <div class="powertrain-item-description" >${itemDescription}</div>
        <div class="img-list-container">
        <div class="powertrain-item-details" >${itemDetailsHTML}</div>
        <div class="powertrain-item-image">${picture ? picture.outerHTML : ''}</div>
        </div>
         <div class="powertrain-item-cta-icon">${ctaIconHTML}</div>
      </div>`;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });
  newContainerHTML += '</div>';

  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="powertrains-list block">
      <div class="container">
        <div class="powertrains-heading-container">
          <div class='powertrains-list-header'>${title.outerHTML || ''}</div>
          <div class="powertrains-list-description">${description}</div>
        </div>
        <div class="powertrains-items">
          ${newContainerHTML}
        </div>
        <div class="powertrains-ctas-container">
          <div class="powertrains-ctas">
            ${primaryCtaText ? `<div class="primary-cta-container"><a class="primary-black-btn" href="${primaryCtaLink}" target="${primaryCtaTarget}">${primaryCtaText}</a></div>` : ''}
            ${secondaryCtaText ? `<div class="secondary-cta-container"><a class="secondary-black-btn" href="${secondaryCtaLink}" target="${secondaryCtaTarget}">${secondaryCtaText}</a></div>` : ''}
          </div>
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

  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  const powerTrainContainer = block.querySelector('.powertrain-items-container');
  const nextBtn = block.querySelector('.next_arrow');
  const prevBtn = block.querySelector('.prev_arrow');
  const primaryBtn = block.querySelector('.primary-cta-container');
  let currentIndex = 0;
  const cardNumbers = 3;
  let blockNumbers = 0;
  let variantText = '';

  // wrap block in a div
  function createCardsWrapper() {
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    powerTrainContainer.innerHTML = '';
    let isCard1SelectedInSlide0 = false;
    for (let i = 0; i < powertrainItems.length; i += cardNumbers) {
      let cardWrapper = `<div class="cardsWrapper slide-${i / cardNumbers}">`;

      // Check if this is the first slide (i.e., index 0)
      if (i === 0) {
        // Check if card 1 (index 0 in this slide) is selected
        const card1 = powertrainItems[i];
        if (card1.classList.contains('selected')) {
          isCard1SelectedInSlide0 = true;
        }
      }
      // Add the cards to the wrapper
      let cardCount = 0;
      for (let j = i; j < i + 3 && j < powertrainItems.length; j += 1) {
        cardWrapper += powertrainItems[j].outerHTML;
        cardCount++;
      }


      cardWrapper += '</div>';
      powerTrainContainer.innerHTML += cardWrapper;
      blockNumbers += 1;

       // If the current wrapper is slide0 and there is only one or two cards, disable click and select them
    const currentSlide = powerTrainContainer.querySelector(`.cardsWrapper.slide-${i / cardNumbers}`);
    if (currentSlide && i === 0) {
      const cardsInWrapper = currentSlide.querySelectorAll('.powertrain-item');

      // If there are only 1 or 2 cards in slide0, disable interactions and select them
      if (cardCount === 1 || cardCount === 2) {
        cardsInWrapper.forEach(card => {
          card.classList.add('selected'); // Mark as selected
          card.style.pointerEvents = 'none'; // Disable clicks
          card.style.cursor = 'not-allowed'; // Change cursor to not-allowed
        });
      }
    }
    }

    // Disable interaction on slide1 if card1 is not selected in slide0
    if (!isCard1SelectedInSlide0) {
      const slide1 = powerTrainContainer.querySelector('.cardsWrapper.slide-1');
      if (slide1) {
        slide1.style.pointerEvents = 'none';  // Disable interactions on slide1
        slide1.style.cursor = 'not-allowed';  // Change cursor to indicate it's disabled
      }
    }

    const arrowCta = block.querySelector('.carousel-arrow_navigation-container');
    variantText = document.createElement('div');
    variantText.classList.add('showing_variants');
    variantText.textContent = `SHOWING 3/${powertrainItems.length} VARIANTS`;
    arrowCta.append(variantText);
  }

  function hideSelectedItem(powerItemContainer) {
    powerItemContainer.forEach((container) => {
      container.classList.remove('selected');
      container.querySelector('.powertrain-item-details').style.height = '0';
      container.querySelector('.powertrain-item-description').style.height = '0';
      if (isMobile) {
        container.querySelector('.powertrain-item-cta-icon').style.display = 'block';
      }
    });
  }

  function updateDesktopCards() {
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    if (powertrainItems.length === 2) {
      powertrainItems[0]?.classList?.add('selected');
      powertrainItems[1]?.classList?.add('selected');
    } else {
      powertrainItems[0]?.classList?.add('selected');
    }
    powertrainItems.forEach((item) => {
      if (!(item.classList.contains('selected'))) {
        item.querySelector('.powertrain-item-details').style.height = '0';
        item.querySelector('.powertrain-item-description').style.height = '0';
      }
      item.addEventListener('click', (e) => {
        const powerItemContainer = e.target.closest('.cardsWrapper').querySelectorAll('.powertrain-item');
        const powertrainItem = e.target.closest('.powertrain-item');
        hideSelectedItem(powerItemContainer);
        powertrainItem.classList.add('selected');
        const descHeight = `${item.querySelector('.powertrain-item-description').scrollHeight}px`;
        const detailHeight = `${item.querySelector('.powertrain-item-details').scrollHeight}px`;
        item.querySelector('.powertrain-item-details').style.height = detailHeight;
        item.querySelector('.powertrain-item-description').style.height = descHeight;
      });
    });
  }

  function updateArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === blockNumbers - 1;
  }

  function updateCardsPosition() {
    const cardSpacing = 20; // Amount of visible next card
    const translateX = -currentIndex * (powerTrainContainer.clientWidth - cardSpacing);
    powerTrainContainer.style.transform = `translateX(${translateX}px)`;
  }

  // Function to update styles based on slide index
  function updateMarginLeft(slideIndex) {
    const selectedItems = document.querySelectorAll('.powertrain-item.selected');
    const isDesktop = window.innerWidth >= 768;

    selectedItems.forEach(item => {
      if (slideIndex !== 0 && isDesktop) {
        item.style.marginLeft = '4rem';
      }
    });
  }


  function showItem(index) {
    const isDesktop = window.innerWidth >= 768;
    currentIndex = index;
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    powertrainItems.forEach((item, i) => {
      if (item.classList.contains('selected')) {
        item.classList.remove('selected');
        if (isDesktop) {
          item.style.marginLeft = '';
        }
        item.querySelector('.powertrain-item-details').style.height = '0';
        item.querySelector('.powertrain-item-description').style.height = '0';
      }
      if ((cardNumbers * (currentIndex)) === i) {
        const switchIndexContainer = item.closest('.cardsWrapper').querySelectorAll('.powertrain-item');
        item.classList.add('selected');
        const descHeight = `${item.querySelector('.powertrain-item-description').scrollHeight}px`;
        const detailHeight = `${item.querySelector('.powertrain-item-details').scrollHeight}px`;
        item.querySelector('.powertrain-item-details').style.height = detailHeight;
        item.querySelector('.powertrain-item-description').style.height = descHeight;
        variantText.textContent = `SHOWING ${switchIndexContainer.length}/${powertrainItems.length} VARIANTS`;
      }
    });
    updateMarginLeft(currentIndex)
    updateArrows();
  }

  function nextSlide() {
    if (currentIndex < blockNumbers - 1) {
      showItem(currentIndex + 1);
      updateCardsPosition();
      updateArrows();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      showItem(currentIndex - 1);
      updateCardsPosition();
      updateArrows();
    }
  }

  function updateLinks() {
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    let noOfItems = 0; let
      selectedItem;
    powertrainItems.forEach((item) => {
      if (item.classList.contains('selected')) {
        noOfItems += 1;
        selectedItem = item;
      }
    });
    const powertrainsConatiner = block.querySelector('.powertrains-ctas-container');
    if (noOfItems > 1) {
      const url = new URL(primaryCtaLink);
      url.searchParams.append('filter', allFilterText);
      powertrainsConatiner.querySelector('.primary-cta-container>.cta-button').setAttribute('href', url.href);
    } else {
      const selectedSingleBlock = selectedItem.querySelector('.item-title').innerHTML;
      const url = new URL(primaryCtaLink);
      const selectedBlockCamelCase = selectedSingleBlock.includes('-')
        ? selectedSingleBlock
        : selectedSingleBlock
          .toLowerCase()
          .replace(/\b\w/g, (match) => match.toUpperCase());
      url.searchParams.append('filter', selectedBlockCamelCase);
      powertrainsConatiner.querySelector('.primary-cta-container>.primary-black-btn').setAttribute('href', url.href);
    }
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  primaryBtn.addEventListener('mouseenter', updateLinks);

  function updateMobileCards() {
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    powertrainItems[0]?.classList?.add('selected');
    powertrainItems.forEach((item) => {
      if (!(item.classList.contains('selected'))) {
        item.querySelector('.powertrain-item-details').style.height = '0';
        item.querySelector('.powertrain-item-description').style.height = '0';
      }
      const belowBtn = item.querySelector('.powertrain-item-cta-icon');
      belowBtn.addEventListener('click', (e) => {
        const powerItemContainer = e.target.closest('.powertrain-items-container').querySelectorAll('.powertrain-item');
        const powertrainItem = e.target.closest('.powertrain-item');
        hideSelectedItem(powerItemContainer);
        powertrainItem.classList.add('selected');
        const descHeight = `${item.querySelector('.powertrain-item-description').scrollHeight}px`;
        const detailHeight = `${item.querySelector('.powertrain-item-details').scrollHeight}px`;
        item.querySelector('.powertrain-item-details').style.height = detailHeight;
        item.querySelector('.powertrain-item-description').style.height = descHeight;
        powertrainItem.querySelector('.powertrain-item-cta-icon').style.display = 'none';
      });
    });
  }

  if (isMobile) {
    block.querySelector('.carousel-arrow_navigation-container').style.display = 'none';
    updateMobileCards();
  } else {
    const powertrainItems = block.querySelectorAll('.powertrain-item');
    powertrainItems.forEach((item) => {
      item.querySelector('.powertrain-item-cta-icon').style.display = 'none';
    });
    if (powertrainItems.length > cardNumbers) {
      powerTrainContainer.closest('.powertrains-list').querySelector('.carousel-arrow_navigation-container').style.display = 'flex';
      prevBtn.disabled = true;
    } else {
      powerTrainContainer.closest('.powertrains-list').querySelector('.carousel-arrow_navigation-container').style.display = 'none';
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
    data.componentTitle = block.querySelector('.powertrains-title')?.textContent?.trim() || '';
    data.componentName = block.dataset.blockName;
    data.componentType = 'button';
    data.webName = link.textContent?.trim() || '';
    data.linkType = link;
    analytics.setButtonDetails(data);
  });

  return block;
}
