import { fetchPlaceholders } from '../../scripts/aem.js';
import search from '../../scripts/search/search.js';
import { mutationObserver, handleMobileSearch } from './helpers.js';
import renderQuickRecommendations from './quickrecommendations.js';

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const [ghostText, redirection, quickSearch, searchRecommendation] = [
    ...block.children,
  ].map((d) => d.textContent.trim());

  block.innerHTML = `<div class="search-header-page container">
      <div class="menu-header">
        <div class="menu-title"></div>
        <button class="close-icon">
          <span class="sr-only">${search.usei18n('closeSearch', placeholders)}</span>
        </button>
      </div>
      <div class="wrapper">
        ${renderQuickRecommendations(quickSearch, searchRecommendation, redirection)}
        <form class="search-form" method="GET" action="${redirection}">
          <div class="search-input">
            <label>
              <input type="text" class="header-search" name="q" placeholder="${ghostText}" autocomplete="off" />
              <span class="sr-only">${ghostText}</span>
            </label>
            <button type="submit" class="search-icon">
              <span class="sr-only">${search.usei18n('submitSearch', placeholders)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>`;
  block.querySelector('.search-recomm')?.addEventListener('click', (el) => {
    if (el.target.href) {
      sessionStorage.setItem('qr', 'true');
    }
  });
  mutationObserver({
    elementSelector: 'div.header',
    onMutationCallback: () => {
      handleMobileSearch();
      let queryParam = search.getQueryParam('q');
      const searchInputs = document.querySelectorAll('input.header-search');
      if (queryParam && searchInputs.length) {
        queryParam = decodeURIComponent(queryParam);
        searchInputs.forEach((el) => {
          el.value = queryParam;
        });
      }
    },
  });
}
