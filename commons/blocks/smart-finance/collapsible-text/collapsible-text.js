import utility from '../../../utility/utility.js';
import { fetchPlaceholders } from '../../../scripts/aem.js';

export default async function decorate(block) {
  function updateHtml() {
    const textBlock = [...block.children].map((child) => {
      const [titleEl, subtitleEl, contentEl, toggleButtonEl] = [...child.children[0].children];

      const title = titleEl?.textContent?.trim();
      const subtitle = subtitleEl?.textContent?.trim();
      const toggleButton = toggleButtonEl?.textContent?.trim();
      const displayText = contentEl.innerHTML.replace(/<\/?p>/gi, '');
      child.innerHTML = '';
      child.insertAdjacentHTML(
        'beforeend',
        utility.sanitizeHtml(`
          <div>
           <h2 class="ct-text-title">${title}</h2>
           <p class="ct-text-subtitle">${subtitle}</p>
           <p class="ct-text-content">${displayText}</p>
           <p class="toggle-read-button">${toggleButton}</p>
          </div>
        `),
      );
      return child.outerHTML;
    }).join('');
    block.innerHTML = utility.sanitizeHtml(textBlock);
  }

  async function initializeEventListeners() {
    const contentEl = document.querySelector('.ct-text-content');
    const toggleButtonEl = document.querySelector('.toggle-read-button');
    const { readMore, readLess } = await fetchPlaceholders();
    toggleButtonEl.addEventListener('click', () => {
      if (contentEl.classList.contains('expanded')) {
        contentEl.classList.remove('expanded');
        toggleButtonEl.textContent = readMore;
      } else {
        contentEl.classList.add('expanded');
        toggleButtonEl.textContent = readLess;
      }
    });
  }

  updateHtml();
  await initializeEventListeners();
}
