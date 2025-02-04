import utility from '../../utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [
    titleEl, MobileEl, ImageEl,
    ...faqItemsContainer
  ] = block.children;
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  if (title) {
    title.classList.add('accordion-banner-title');
  }
  const mobileImgSrc = MobileEl?.querySelector('img')?.src || '';
  const desktopImgSrc = ImageEl?.querySelector('img')?.src || '';
  const desktopImgAlt = ImageEl?.querySelector('img')?.alt || 'Accordion Banner Image';

  let newContainerHTML = '<div class="accordion-banner-items-container">';

  // Build the FAQ items dynamically
  faqItemsContainer.forEach((item, index) => {
    const [collapseDescriptionEl, descriptionExEl] = item.children;

    const collapseDescription = collapseDescriptionEl?.innerHTML?.trim() || '';
    const descriptionEx = descriptionExEl?.innerHTML?.trim() || '';

    const innerHTML = `
    <div class="accordion-banner-item" ${index < 0 ? 'style="display: none;"' : ''}>
      ${(collapseDescription) ? `<div class="accordion-banner-item-title">${collapseDescription}<span class="toggle_icon"></span></div>` : ''}
      ${(descriptionEx) ? `<div class="accordion-banner-item-description">${descriptionEx}</div>` : ''}
    </div>`;
    item.innerHTML = innerHTML;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });

  newContainerHTML += '</div>';
  block.innerHTML = utility.sanitizeHtml(`
    <div class="accordion-banner block">
        <div class="accordion-banner-container">
            <div class='image-container'>
                <picture>
                <source srcset='${desktopImgSrc}' media='(min-width: 999px)'>
                <source srcset="${mobileImgSrc}" media="(max-width: 999px)">
                <img src='${desktopImgSrc}' alt='${desktopImgAlt}' class='' />
                </picture>
            </div>
            <div class='text-container'>
            ${(title) ? `<h2 class='accordion-banner-title'> ${title.innerHTML || ''} </h2>` : ''}
            ${(newContainerHTML) ? `<div class="accordion-banner-items">${newContainerHTML}</div>` : ''}
            </div>
        </div>
    </div>
  `);

  const toggleAccordion = (clickedTitle) => {
    const faqItem = clickedTitle?.closest('.accordion-banner-item');
    const description = faqItem?.querySelector('.accordion-banner-item-description');
    const itemTitle = faqItem?.querySelector('.accordion-banner-item-title');
    const toggleIcon = itemTitle?.querySelector('.toggle_icon');

    const isOpen = clickedTitle?.classList.contains('active');
    block.querySelectorAll('.accordion-banner-item-title').forEach((item) => item?.classList.remove('active'));
    block.querySelectorAll('.accordion-banner-item-description').forEach((desc) => {
      if (desc) {
        desc.style.height = '0';
        desc.classList.remove('active');
      }
    });
    block.querySelectorAll('.toggle_icon').forEach((icon) => {
      icon?.classList.remove('active');
    });
    if (!isOpen) {
      if (description) {
        description.classList.add('active');
        description.style.height = `${description.scrollHeight}px`;
      }
      itemTitle?.classList.add('active');
      toggleIcon?.classList.add('active');
    }
  };

  const faqTitles = block.querySelectorAll('.accordion-banner-item-title');
  if (window.innerWidth > 768) {
    faqTitles.forEach((faqTitle) => {
      faqTitle.addEventListener('click', () => toggleAccordion(faqTitle));
    });

    // Automatically expand the first FAQ item on page load
    if (faqTitles.length > 0) {
      requestAnimationFrame(() => toggleAccordion(faqTitles[0]));
    }
  }

  // Mobile View Adjustments
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  if (mediaQuery.matches) {
    // Show all descriptions and remove toggle icon for mobile view
    const items = block.querySelectorAll('.accordion-banner-item');
    items.forEach((item) => {
      const description = item.querySelector('.accordion-banner-item-description');
      const toggleIcon = item.querySelector('.toggle_icon');
      if (description) {
        description.style.display = 'block';
      }
      if (toggleIcon) {
        toggleIcon.style.display = 'none';
      }
    });

    // Add carousel behavior
    const carouselContainer = document.createElement('div');
    carouselContainer.classList.add('accordion-carousel');
    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-prev');
    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-next');

    carouselContainer.appendChild(block.querySelector('.accordion-banner-items'));
    carouselContainer.appendChild(prevButton);
    carouselContainer.appendChild(nextButton);

    block.querySelector('.accordion-banner-container').appendChild(carouselContainer);

    const itemsList = carouselContainer.querySelectorAll('.accordion-banner-item');
    let currentIndex = 0;
    const updateCarousel = () => {
      itemsList.forEach((item, index) => {
        item.style.display = index === currentIndex ? 'block' : 'none';
      });
    };

    prevButton.addEventListener('click', () => {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : itemsList.length - 1;
      updateCarousel();
    });

    nextButton.addEventListener('click', () => {
      currentIndex = currentIndex < itemsList.length - 1 ? currentIndex + 1 : 0;
      updateCarousel();
    });
    // Initialize the carousel
    updateCarousel();
  }

  return block;
}
