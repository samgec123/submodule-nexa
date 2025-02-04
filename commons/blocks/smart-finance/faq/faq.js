import { moveInstrumentation } from '../../../scripts/scripts.js';

export default function decorate(block) {
  const [titleContainer, pictureContainer, buttonContainer, ...faqItems] = block.children;
  titleContainer.classList.add('faq-title');
  pictureContainer.classList.add('faq-picture');

  const viewMoreButtonText = buttonContainer.querySelector('p');
  const viewMoreButton = document.createElement('button');
  viewMoreButton.classList.add('view-more-faq');
  viewMoreButton.append(...viewMoreButtonText.childNodes);
  moveInstrumentation(viewMoreButtonText, viewMoreButton);
  viewMoreButtonText.replaceWith(viewMoreButton);

  const listItems = faqItems.map((item, index) => {
    const [label, body] = item.children;
    body.classList.add('faq-item-body');
    const summary = document.createElement('summary');
    summary.append(...label.childNodes);
    summary.classList.add('faq-item-label');
    const details = document.createElement('details');
    details.append(summary, body);
    details.classList.add('faq-item');
    details.open = index === 0;
    moveInstrumentation(item, details);
    item.remove();
    return details;
  });
  const list = document.createElement('div');
  list.classList.add('faq-list');
  list.append(...listItems);

  const leftContainer = document.createElement('div');
  leftContainer.className = 'faq-content-left';
  leftContainer.append(titleContainer, list, viewMoreButton);
  const rightContainer = document.createElement('div');
  rightContainer.className = 'faq-content-right';
  rightContainer.append(pictureContainer);

  block.replaceChildren(leftContainer, rightContainer);

  document.querySelectorAll('.faq-item').forEach((item) => {
    const body = item.querySelector('.faq-item-body');
    item.addEventListener('toggle', () => {
      body.style.maxHeight = item.open ? 'none' : '0';
    });
    body.addEventListener('transitionend', () => {
      body.style.maxHeight = item.open ? 'none' : '0';
    });
  });

  document.querySelector('.faq-list').addEventListener('click', ({ target }) => {
    const summary = target.closest('summary');
    if (summary) {
      document.querySelectorAll('.faq-list details').forEach((details) => {
        if (details !== summary.parentElement) {
          details.open = false;
          details.querySelector('.faq-item-body').style.maxHeight = '0';
        }
      });
    }
  });

  viewMoreButton.addEventListener('click', () => {
    block.classList.toggle('faq-expanded');
  });
}
