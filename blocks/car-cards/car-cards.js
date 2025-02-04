import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';

export default function decorate(block) {
  const [titleEl, ...ItemsContainer] = block.children;
  const title = titleEl?.textContent?.trim() || '';
  block.innerHTML = '';

  // Function to fetch and format price using Promises
  const fetchPrice = (modelCode) => {
    const forCode = utility.getSelectedLocation()?.forCode ?? '08';
    return apiUtils.getModelPrice(modelCode, 'EXC', forCode)
      .then((price) => (price ? utility.formatCurrency(price).replaceAll(',', ' ') : null))
      .catch(() => null); // Handle potential errors gracefully
  };

  const cardPromises = ItemsContainer.map((child) => {
    // Extract fields from the child structure
    const modelCodeEl = child.querySelector('p:nth-of-type(1)');
    const pretitleEl = child.querySelector('div:nth-of-type(2) > p:nth-of-type(3)');
    const imgEl = child.querySelector('p.button-container picture img');
    const titleElNew = child.querySelector('div:nth-of-type(2) > p:nth-of-type(1)');
    const taglineEl = child.querySelector('div:nth-of-type(2) > p:nth-of-type(2)');
    const pricelabelEl = child.querySelector('div:nth-of-type(3) > p:nth-of-type(1)');

    // Extract data
    const modelCode = modelCodeEl?.textContent?.trim() || '';
    const pretitle = pretitleEl?.textContent?.trim() || '';
    const imgCard = imgEl?.src || '';
    const imgAlt = imgEl?.alt || '';
    const titleNew = titleElNew?.textContent?.trim() || '';
    const tagline = taglineEl?.textContent?.trim() || '';
    const pricelabel = pricelabelEl?.textContent?.trim() || '';
    // Fetch price and return the card HTML as a Promise
    return fetchPrice(modelCode).then((price) => {
      const titleMarkup = pretitle
        ? `
          <p class="car-pretitle">${pretitle}</p>
          <strong class="car-title">${titleNew}</strong>
          ${tagline ? `<p class="car-tagline">${tagline}</p>` : ''}
        `
        : `
          <strong class="car-title">${titleNew}</strong>
          ${tagline ? `<p class="car-tagline">${tagline}</p>` : ''}
        `;

      // Generate card HTML
      return `
        <div class="clip">
          <div>
            <div class="car-card">
              <div class="car-card-content">
                <div class="car-details">
                  ${titleMarkup}
                </div>
                ${window.innerWidth <= 767
                  ? `<div class="car-inn-mob">
                        <div class="car-price">
                          <p>${pricelabel}<br> <b> Rs. ${price || 'N/A'}/-</b></p>
                        </div>
                        <div class="car-image">
                          <img src="${imgCard}" alt="${imgAlt}">
                        </div>
                      </div>`
                  : `<div class="car-image">
                        <img src="${imgCard}" alt="${imgAlt}">
                      </div>
                      <div class="car-price">
                        <p>${pricelabel}<br> <b> Rs. ${price || 'N/A'}/-</b></p>
                      </div>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
    });
  });

  // Render all cards when all Promises resolve
  Promise.all(cardPromises).then((renderedCards) => {
    const finalHTML = `
      <div class="card-wrapper">
        <div class="card-clip">
          <div class="container">
            <div class="title">
              ${title}
            </div>
            <div class="card-section">
              ${renderedCards.join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(finalHTML));
  });
}
