import { fetchPlaceholders } from '../../scripts/aem.js';
import search from '../../scripts/search/search.js';
import FacetsTabs from './facetsTab.js';
import paginate, { removePagination } from './pagination.js';

function renderSearchResults(block, domParser) {
  const blockHTML = `
  <div class="tablist" role="tablist">
    <nav class="search-results-nav">
      <button type="button" tabindex="0" aria-label="Previous" hidden id="left" class="scrollBtn prevBtn"></button>
        <ul role='tabs' class="tabs"></ul>
      <button tabindex="0" type="button" aria-label="Next" hidden id="right" class="scrollBtn nextBtn"></button>
    </nav>
    <h2 class="section-heading search-results-title text-sm-2 text-lg-2 font-weight-500"></h2>
    <h2 class="section-heading priority-car-listing text-sm-2 text-lg-2 font-weight-500"></h2>
    <h2 class='section-heading related-results-title text-sm-2 text-lg-2 font-weight-500 hidden'></h2>
    <div class="tabpanel-container"></div>
    <ul class="search-results-cards shimmer-container">
      <li class="card-blurred">
        <div class="search-results-card">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-2">Temporary title</h3>
            <span class="cta-link" />
          </div>
          <p class="text-sm-3 text-lg-3">Temporary description</p>
        </div>
      </li>
      <li class="card-blurred">
        <div class="search-results-card">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-2">Temporary title</h3>
            <span class="cta-link" />
          </div>
          <p class="text-sm-3 text-lg-3">Temporary description</p>
        </div>
      </li>
      <li class="card-blurred">
        <div class="search-results-card">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-2">Temporary title</h3>
            <span class="cta-link" />
          </div>
          <p class="text-sm-3 text-lg-3">Temporary description</p>
        </div>
      </li>
    </ul>
    <div class="pagination-container"></div>
  <div>
  `;
  const doc = domParser.parseFromString(blockHTML, 'text/html');
  block.appendChild(doc.body.firstChild);
}

const getFrom = (currentPage, PAGE_SIZE) => (currentPage - 1) * PAGE_SIZE;

export default async function decorate(block) {
  let currentPage = 1;
  let searchResults = [];
  let priorityCarListing = null;
  let initialRenderCalled = false;
  let transitionedToRelatedItem = false;
  let relatedResultsLabelRendered = false;
  const parser = new DOMParser();
  const pageChangeEvent = 'SEARCH_RESULTS_PAGINATION_CHANGED';
  const facetChangeEvent = 'SEARCH_RESULTS_FACET_CHANGED';
  const [placehloderText = '', noResultsText = '', ...priorityCarModelCodes] = [...block.children].map(
    (el, index) => {
      let result = '';
      const elCopy = el.querySelector('p');
      if (index === 1) {
        // receiving authored content from rte input field
        result = elCopy.innerHTML.trim();
      } else {
        // receiving authored content from text input field
        result = elCopy.textContent.trim();
      }
      el.remove();
      return result;
    },
  );
  renderSearchResults(block, parser);
  // const placeholders = await fetchPlaceholders();
  // querying search query param and page number query param
  const pageNumber = search.getQueryParam('p');
  let PAGE_SIZE = search.getQueryParam('size');
  let searchTerm = search.getQueryParam('q') || '';
  let selectedFacet = search.getQueryParam('tab') || 'all';
  if (searchTerm) {
    searchTerm = decodeURIComponent(searchTerm);
  }
  if (pageNumber) {
    currentPage = Number(pageNumber);
  }
  if (PAGE_SIZE) {
    PAGE_SIZE = Number(PAGE_SIZE);
  } else {
    PAGE_SIZE = 10;
  }
  const searchOptions = {
    searchTerm,
    size: PAGE_SIZE,
    facet: selectedFacet,
    from: getFrom(currentPage, PAGE_SIZE),
  };

  const placeholders = await fetchPlaceholders();
  const tabsContainer = block.querySelector('.tablist .tabs');
  const { facets, tabpanels } = FacetsTabs.getFacets(placeholders, 0);
  tabsContainer.innerHTML = facets;
  const tabpanelsContainer = block.querySelector('.tabpanel-container');
  tabpanelsContainer.innerHTML = tabpanels;
  tabpanelsContainer.addEventListener('click', search.handleSearchItemClick);
  const facetsTabs = new FacetsTabs(block, facetChangeEvent);
  const priorityCarListingHeading = block.querySelector('.priority-car-listing');
  const tabpanelshimer = block.querySelector('.search-results-cards.shimmer-container');
  const relatedResultsTitleElem = block.querySelector('.related-results-title');
  priorityCarListingHeading.textContent = search.usei18n('priorityCarListingHeading', placeholders);
  const { relatedResultsLabel = '' } = placeholders;
  relatedResultsTitleElem.append(relatedResultsLabel);

  const renderCards = () => {
    const currentPanel = block.querySelector(`[role="tabpanel"][aria-labelledby="${selectedFacet}"]`);
    [...currentPanel.querySelectorAll('li')].forEach((li) => { li.remove(); });
    let prevCat = [];
    const carCards = [];
    const otherCards = [];
    let carCardsItems = '';
    let otherCardsWithHeading = '';
    searchResults.forEach((item, index) => {
      if (!relatedResultsLabelRendered) {
        transitionedToRelatedItem = search
          .checkRelatedResults(item.main_nav_categories, prevCat, index);
        if (transitionedToRelatedItem) {
          relatedResultsLabelRendered = true;
        }
      }
      const cardRenderer = search.getCardRenderer(item);
      const card = cardRenderer(item, placeholders);
      if (transitionedToRelatedItem) {
        if (index === 0) {
          transitionedToRelatedItem = false;
          relatedResultsTitleElem?.classList.remove('hidden');
        }
        otherCards.push(card);
      } else {
        carCards.push(card);
      }
      prevCat = item.main_nav_categories;
    });
    if (otherCards.length) {
      if (carCards.length) {
        carCardsItems = `<li><ul>${carCards.join('')}</ul></li>`;
        if (transitionedToRelatedItem) {
          transitionedToRelatedItem = false;
          otherCardsWithHeading = `<li><h2 class='section-heading related-results-title text-sm-2 text-lg-2 font-weight-500'>${relatedResultsLabel}</h2><ul>${otherCards.join('')}</ul></li>`;
        } else {
          otherCardsWithHeading = `<li><ul>${otherCards.join('')}</ul></li>`;
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (transitionedToRelatedItem) {
          transitionedToRelatedItem = false;
          otherCardsWithHeading = `<h2 class='section-heading related-results-title text-sm-2 text-lg-2 font-weight-500'>${relatedResultsLabel}</h2>${otherCards.join('')}`;
        } else {
          otherCardsWithHeading = otherCards.join('');
        }
      }
    } else if (carCards.length) {
      carCardsItems = carCards.join('');
    }
    currentPanel.classList.remove('hidden');
    const doc = parser.parseFromString(`${carCardsItems}${otherCardsWithHeading}`, 'text/html');
    [...doc.body.children].forEach((el) => { currentPanel.appendChild(el); });
  };

  const renderUpdatedData = async (apiResponse) => {
    let totalPages = 1;
    priorityCarListingHeading.classList.add('hidden');
    if (!apiResponse.error) {
      facetsTabs.updateTabItemsCount(apiResponse.tabsItemCount);
      if (apiResponse?.results) {
        const totalItems = apiResponse.total.value;
        searchResults = apiResponse.results;
        if (!initialRenderCalled) {
          const qr = sessionStorage.getItem('qr');
          const webName = qr ? 'quick-searches' : 'search-icon';
          search.updateDataLayer('searchEvent', { searchTerm, numOfSearchResults: totalItems, webName });
          sessionStorage.removeItem('qr');
          initialRenderCalled = true;
        }
        totalPages = Math.ceil(totalItems / PAGE_SIZE);
      }
    }
    const apiError = apiResponse.error;
    const noResults = searchResults.length === 0;
    if (!priorityCarListing && noResults && !apiError
      && priorityCarModelCodes && priorityCarModelCodes.length === 3) {
      const response = await search
        .getSearchResults({ carModels: priorityCarModelCodes }, 'priorityCars');
      if (!response.error && response.results) {
        priorityCarListing = search
          .sortPriorityCarsResponse(priorityCarModelCodes, response.results);
      }
    }

    tabpanelshimer.classList.add('hidden');
    const searchApiErrorText = search.usei18n('searchApiError', placeholders);
    const searchResultsTitle = search.getSearchPlaceholderText(
      placehloderText,
      noResultsText,
      searchApiErrorText,
      searchTerm,
      { noResults, apiError },
    );
    const searchResultsTitleElem = block.querySelector('.search-results-title');
    if (searchResultsTitleElem && !!searchTerm) {
      searchResultsTitleElem.classList.remove('error');
      if (noResults || apiError) {
        searchResultsTitleElem.classList.add('error');
      }
      const span = `<span>${searchResultsTitle}</span>`;
      const doc = parser.parseFromString(span, 'text/html');
      while (searchResultsTitleElem.firstElementChild) {
        searchResultsTitleElem.firstElementChild.remove();
      }
      searchResultsTitleElem.appendChild(doc.body.firstChild);
    }

    if (noResults && !apiError && priorityCarListing) {
      // currentPage = 1;
      searchResults = priorityCarListing;
      priorityCarListingHeading.classList.remove('hidden');
    }

    if (searchResults.length) {
      // if the page number is greater than total pages reset current page to 1
      // update the page number query param also
      if (currentPage > totalPages) {
        currentPage = 1;
      }
      if (!noResults && !apiError) {
        search.updateQueryParam('p', currentPage);
      } else {
        // remove p query param from url
      }
      renderCards();
      const maxVisiblePages = totalPages >= 8 ? 8 : totalPages;
      paginate(block, currentPage, totalPages, maxVisiblePages, placeholders, pageChangeEvent);
    }
  };

  if (!searchTerm) {
    renderUpdatedData({ error: null, results: [], total: { value: 0 } });
    return;
  }

  const apiResponseInitial = await search.getSearchResults(searchOptions);
  renderUpdatedData(apiResponseInitial);

  document.addEventListener(pageChangeEvent, async (event) => {
    currentPage = Number(event.detail);
    tabpanelshimer.classList.remove('hidden');
    relatedResultsTitleElem?.classList.add('hidden');
    searchResults = [];
    searchOptions.from = getFrom(currentPage, PAGE_SIZE);
    const updatedResults = await search.getSearchResults(searchOptions);
    if (currentPage === 1) {
      relatedResultsLabelRendered = false;
    }
    renderUpdatedData(updatedResults);
    block.querySelector('[role="tab"]')?.focus();
  });

  document.addEventListener(facetChangeEvent, async (event) => {
    if (event.detail && event.detail.toLowerCase() !== selectedFacet.toLowerCase()) {
      tabpanelshimer.classList.remove('hidden');
      relatedResultsTitleElem?.classList.add('hidden');
      searchResults = [];
      const prevFacet = selectedFacet;
      selectedFacet = event.detail;
      currentPage = 1;
      searchOptions.from = 0;
      searchOptions.facet = selectedFacet;
      const activePanel = block.querySelector(`[role="tabpanel"][aria-labelledby="${prevFacet}"]`);
      activePanel?.classList.add('hidden');
      removePagination(block);
      const updatedResults = await search.getSearchResults(searchOptions);
      relatedResultsLabelRendered = false;
      renderUpdatedData(updatedResults);
    }
  });
}
