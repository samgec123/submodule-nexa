import utility from '../../utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [
    titleEl,
    ...faqItemsContainer
  ] = block.children;
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  if (title) {
    title.classList.add('faq-list-title');
  }

  let newContainerHTML = '<div class="faq-items-container">';

  // Build the FAQ items dynamically
  faqItemsContainer.forEach((item, index) => {
    const [collapseDescriptionEl, descriptionExEl] = item.children;

    const collapseDescription = collapseDescriptionEl?.innerHTML?.trim() || '';
    const descriptionEx = descriptionExEl?.innerHTML?.trim() || '';

    const innerHTML = `
    <div class="faq-item" ${index > 0 ? 'style="display: none;"' : ''}>
      ${(collapseDescription) ? `<div class="faq-item-title">${collapseDescription}<span class="toggle_icon"></span></div>` : ''}
      ${(descriptionEx) ? `<div class="faq-item-description">${descriptionEx}</div>` : ''}
    </div>`;
    item.innerHTML = innerHTML;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });

  newContainerHTML += '</div>';

  block.innerHTML = utility.sanitizeHtml(`
    <div class="faq-list block">
        <div class="faq-container">
          ${(title) ? `<h2 class='faq-list-title'> ${title.innerHTML || ''} </h2>` : ''}
            <div class="faq-items-button-container">
            ${(newContainerHTML) ? ` <div class="faq-items">${newContainerHTML}</div>
            <button class="faq-toggle-button">
              View More FAQs
              <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.24342 6.95521L10.2882 15L18.333 6.95521L17.1503 5.7725L10.2882 12.6348L3.42613 5.7725L2.24342 6.95521Z" fill="white"/>
              </svg>
            </button>` : ''}
          </div>
        </div>  
    </div>
  `);

  const toggleAccordion = (clickedTitle) => {
    const faqItem = clickedTitle?.closest('.faq-item');
    const description = faqItem?.querySelector('.faq-item-description');
    const itemTitle = faqItem?.querySelector('.faq-item-title');
    const toggleIcon = itemTitle?.querySelector('.toggle_icon');
    const isOpen = clickedTitle?.classList.contains('active');

    block.querySelectorAll('.faq-item-title').forEach((item) => item?.classList.remove('active'));
    block.querySelectorAll('.faq-item-title .toggle_icon').forEach((icon) => icon?.classList.remove('active'));
    block.querySelectorAll('.faq-item-description').forEach((desc) => {
      if (desc) {
        desc.style.height = '0';
        desc.classList.remove('active');
      }
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

  const faqTitles = block.querySelectorAll('.faq-item-title');
  faqTitles.forEach((faqTitle) => {
    faqTitle.addEventListener('click', () => toggleAccordion(faqTitle));
  });

  if (faqTitles.length > 0) {
    requestAnimationFrame(() => toggleAccordion(faqTitles[0]));
  }

  // Add event listener to the button for toggle functionality
  document.querySelector('.faq-toggle-button').addEventListener('click', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    const toggleButton = document.querySelector('.faq-toggle-button');
    const isCollapsed = [...faqItems].some(item => item.style.display === 'none');

    if (isCollapsed) {
      // Show all FAQ items and change the button to "Show Less"
      faqItems.forEach(item => item.style.display = 'block');
      toggleButton.innerHTML = `
        View less FAQ
        <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.24342 13.0448L10.2882 5L18.333 13.0448L17.1503 14.2275L10.2882 7.36521L3.42613 14.2275L2.24342 13.0448Z" fill="white"/>
        </svg>`;
    } else {
      // Hide all FAQ items except the first and change the button to "View More FAQs"
      faqItems.forEach((item, index) => {
        item.style.display = index === 0 ? 'block' : 'none';
      });
      toggleButton.innerHTML = `
        View More FAQs
        <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.24342 6.95521L10.2882 15L18.333 6.95521L17.1503 5.7725L10.2882 12.6348L3.42613 5.7725L2.24342 6.95521Z" fill="white"/>
        </svg>`;
    }
  });

  function generateFAQSchema() {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };

    faqItems.forEach(item => {
      const questionElement = item.querySelector('.faq-item-title h2');
      const answerElement = item.querySelector('.faq-item-description p');

      const question = questionElement ? questionElement.innerText : '';
      const answer = answerElement ? answerElement.innerHTML : '';

      if (question && answer) {
        faqSchema.mainEntity.push({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        });
      }
    });

    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    scriptElement.innerText = JSON.stringify(faqSchema);
    scriptElement.crossOrigin = "anonymous";

    document.head.appendChild(scriptElement);
  }

  generateFAQSchema();

  return block;
}
