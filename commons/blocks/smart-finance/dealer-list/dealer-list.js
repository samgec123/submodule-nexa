import utility from '../../../utility/utility.js';
import ctaUtils from '../../../utility/ctaUtils.js';

export default function decorate(block) {
  function initImage(image, altTextEl) {
    const img = image.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img.setAttribute('alt', alt);
  }

  const cards = [...block.children].map((child, i) => {
    const innerDiv = block.children[i].children[0];
    const [
      backgroundImageEl,
      backgroundAltTextEl,
      titleEl,
      ctaLinkEl,
      revealEl,
      hiddenTextEl,
      img1El,
      title1El,
      link1El,
      img2El,
      title2El,
      link2El,
    ] = innerDiv.children;

    const hiddenText = hiddenTextEl?.textContent?.trim() || '';
    const title1 = title1El?.textContent?.trim() || '';
    const img1Element = img1El?.querySelector('img');
    const img1 = img1Element?.getAttribute('src')?.trim() || '';
    const link1 = link1El?.querySelector('a')?.href || '#'; // eslint-disable-line no-unused-vars
    const img2Element = img2El?.querySelector('img');
    const img2 = img2Element?.getAttribute('src')?.trim() || '';
    const title2 = title2El?.textContent?.trim() || '';
    const link2 = link2El?.querySelector('a')?.href || '#'; // eslint-disable-line no-unused-vars
    const reveal = revealEl?.textContent?.trim() === 'true';

    const backgroundImage = backgroundImageEl?.querySelector('picture');
    if (backgroundImage) {
      initImage(backgroundImage, backgroundAltTextEl);
    }

    const title = titleEl?.textContent?.trim();
    const primaryCta = ctaUtils.getLink(ctaLinkEl, '', '__blank', 'primary__btn');

    child.innerHTML = '';
    const link = primaryCta?.href || '#';
    child.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
        <a href="${link}" class="dealer-link" data-reveal="${reveal}" data-hidden-text="${hiddenText}" data-title1="${title1}" data-link1="${link1}" data-link2="${link2} "data-img1="${img1}" data-img2="${img2}" data-title2="${title2}">
          <div class="d-grid-item">
            ${backgroundImage ? `<div class="d-grid-item-icon">${backgroundImage.outerHTML}</div>` : ''}
            ${title ? `<div class="d-grid-item-title"><p>${title}</p></div>` : ''}
          </div>
        </a>
      `),
    );
    return child.outerHTML;
  }).join('');

  block.innerHTML = `
  <div >
      <div class="dealer-menu">
        ${cards}
      </div>
  </div>
  `;
  block.classList.add('grey-bg');
  block.parentElement.classList.add('container');

  // Updated pop-up HTML structure
  const popUpHtml = `
    <div class="popUpmain dealer-list-container" id="miscellaneous-tile-popup" style="display: none;">
      <div class="modal-content">
        <div class="close" id="close-miscellaneous">
          
        </div>
        <div class="modal-body modal-miscellaneous__body">
          <h5 class="modal-miscellaneous-title"></h5>
          <div class="grey-bg modal-miscellaneous__grey-bg">
            <ul class="dealer-menu">
              <div>
                <a href="javascript: void(0)">
                  <div class="d-grid-item">
                    <div class="d-grid-item-icon">
                      <img src="" alt="miscellaneous-icon" title="Miscellaneous">
                    </div>
                    <div class="d-grid-item-title">hi</div>
                  </div>
                </a>
              </div>
              <div>
              <a href="javascript: void(0)">
                <div class="d-grid-item">
                  <div class="d-grid-item-icon">
                    <img src="" alt="miscellaneous-icon" title="Miscellaneous">
                  </div>
                  <div class="d-grid-item-title"></div>
                </div>
              </a>
            </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', popUpHtml);

  // Add event listener to dealer-menu items
  const dealerLinks = block.querySelectorAll('.dealer-link');
  const popUp = document.getElementById('miscellaneous-tile-popup');
  const closeModal = document.getElementById('close-miscellaneous');

  dealerLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const reveal = link.getAttribute('data-reveal') === 'true';
      if (reveal) {
        event.preventDefault(); // Prevent the default action
        const hiddenText = link.getAttribute('data-hidden-text');
        const title1 = link.getAttribute('data-title1');
        const img1 = link.getAttribute('data-img1');
        const title2 = link.getAttribute('data-title2');
        const img2 = link.getAttribute('data-img2');
        const link1 = link.getAttribute('data-link1');
        const link2 = link.getAttribute('data-link2');

        popUp.querySelector('.modal-miscellaneous-title').textContent = hiddenText;
        const popUpItems = popUp.querySelectorAll('.d-grid-item');
        popUpItems[0].querySelector('img').src = img1;
        popUpItems[0].querySelector('.d-grid-item-title').textContent = title1;
        popUpItems[0].closest('a').href = link1;
        popUpItems[1].querySelector('img').src = img2;
        popUpItems[1].querySelector('.d-grid-item-title').textContent = title2;
        popUpItems[1].closest('a').href = link2;

        popUp.style.display = 'flex';
      }
    });
  });

  // Add event listener to close the pop-up
  closeModal.addEventListener('click', () => {
    popUp.style.display = 'none';
  });

  // Close pop-up when clicking outside of the modal content
  window.addEventListener('click', (event) => {
    if (event.target === popUp) {
      popUp.style.display = 'none';
    }
  });
}
