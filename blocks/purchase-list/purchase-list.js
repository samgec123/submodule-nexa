import utility from '../../utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [
    idEl,
    titleEl,
    descriptionEl,
    ...purchaseItemsContainer] = block.children;

  const id = idEl?.textContent?.trim() || null;

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)') || '';
  const description = descriptionEl?.children[0]?.innerHTML || '';

  let newContainerHTML = '<div class="purchase-cards">';
  purchaseItemsContainer?.forEach((item) => {
    const [itemTitleEl, itemDescriptionEl, itemCtaTextEl, itemCtaLinkEl, itemCtaTargetEl] = item.children;
    const itemTitle = itemTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || '';
    const itemDescription = itemDescriptionEl?.children[0]?.innerHTML || '';
    const ctaText = itemCtaTextEl?.querySelector('p')?.textContent?.trim() || '';
    const ctaLink = itemCtaLinkEl?.querySelector('a')?.href || '';
    const ctaTarget = itemCtaTargetEl?.querySelector('p')?.textContent?.trim() || '_self';
    item.innerHTML = `
      <div class="purchase-card">
        ${(itemTitle) ? `<h3 class="purchase-card-title">${itemTitle.innerHTML}</h3>` : ''}
        ${(itemDescription) ? `<div class="purchase-card-description">${itemDescription}</div>` : ''}
        ${ctaLink ? `
          <div class="purchase-card_btn">
            <a class ="purchase_card_link" href="${ctaLink}" target="${ctaTarget}">
              ${ctaText}
            </a>
          </div>
        ` : ''}
      </div>`;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });
  newContainerHTML += '</div>';

  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="purchase-list block">
      <div class="car-details_purchase">
        <div class="purchase-text">
          ${(title) ? `<h2 class='purchase_title'> ${title.innerHTML || ''} </h2>` : ''}
          ${(description) ? `<div class="purchase_description">${description}</div>` : ''}
        </div>
        ${(newContainerHTML) ? `<div class="purchase-items-container">${newContainerHTML}</div>` : ''}
      </div>
    </div>
  `);

  block.querySelectorAll('.purchase_card_link').forEach((link) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = block.querySelector('.purchase_title')?.textContent?.trim() || '';
    data.componentType = 'button';
    data.webName = link.textContent?.trim() || '';
    data.linkType = link;
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });
}
