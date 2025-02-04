import { fetchPlaceholders } from '../aem.js';
import { formatCurrency } from '../../../utility/apiUtils.js';
import analytics from '../../../utility/analytics.js';

const getSearchQuery = (searchOptions) => {
  const {
    facet,
    from = 0,
    size = 10,
    searchTerm,
  } = searchOptions;
  return {
    from,
    size,
    query: {
      bool: {
        should: [{
          multi_match: {
            query: searchTerm,
            fields: [
              'page_title',
              'page_description',
              'body_content',
            ],
          },
        },
        ],
        minimum_should_match: 1,
      },
    },
    aggs: {
      main_nav_categories: {
        terms: {
          field: 'main_nav_categories',
        },
      },
    },
    sort: [
      {
        sort_order: {
          order: 'asc',
        },
      },
    ],
    post_filter: {
      term: {
        main_nav_categories: facet,
      },
    },
  };
};

const getPriorityCarListingQuery = (searchOptions) => JSON.stringify({
  query: {
    bool: {
      must: [
        {
          terms: {
            model_cd: searchOptions.carModels,
          },
        },
      ],
      must_not: [
        {
          term: {
            main_nav_categories: 'related',
          },
        },
      ],
    },
  },
});

// Hardcoded for DEMO, should be removed once DEMO is done.
const tempSearchQueriesForMVP1 = (searchOptions) => {
  let query;
  const type = searchOptions.searchTerm?.toLowerCase() || '';
  switch (type) {
    case 'nexa cars under 15 lakhs': query = {
      query: {
        range: {
          ex_showroom_price: {
            lte: 1500000,
          },
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    case 's-cng cars under 10 lakhs': query = {
      query: {
        bool: {
          filter: [
            {
              match: {
                fuel_types: 'S-CNG',
              },
            },
            {
              range: {
                ex_showroom_price: {
                  lte: 1000000,
                },
              },
            },
          ],
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    case 'automatic cars under 8 lakhs': query = {
      query: {
        bool: {
          filter: [
            {
              match: {
                transmission_types: 'Automatic',
              },
            },
            {
              range: {
                ex_showroom_price: {
                  lte: 800000,
                },
              },
            },
          ],
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    case 'sedans under 10 lakhs': query = {
      query: {
        bool: {
          filter: [
            {
              match: {
                body_type: 'Sedan',
              },
            },
            {
              range: {
                ex_showroom_price: {
                  lte: 1000000,
                },
              },
            },
          ],
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    case 'nexa hatchbacks': query = {
      query: {
        match: {
          body_type: 'Hatchback',
        },
      },
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    case 'nexa suvs': query = {
      query: {
        match: {
          body_type: 'SUV',
        },
      },
      aggs: {
        main_nav_categories: {
          terms: {
            field: 'main_nav_categories',
          },
        },
      },
      sort: [
        {
          sort_order: {
            order: 'asc',
          },
        },
      ],
      post_filter: {
        term: {
          main_nav_categories: 'all',
        },
      },
      from: searchOptions.from,
      size: searchOptions.size,
    };
      break;
    default:
      query = getSearchQuery(searchOptions);
  }
  return query;
};

const search = {
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  usei18n(key, placeholders) {
    return placeholders?.[key] || key;
  },
  getSearchHeaders(apiKey) {
    return {
      Authorization: `ApiKey ${apiKey}`,
      'Content-Type': 'application/json',
    };
  },
  getSearchBody(searchOptions) {
    // const basicQuery = getSearchQuery(searchOptions);
    // return JSON.stringify(basicQuery);
    const query = tempSearchQueriesForMVP1(searchOptions);
    return JSON.stringify(query);
  },
  async makeAPICall(url, options, responseType = 'json') {
    try {
      const response = await fetch(url, options);
      const parsedResponse = await response[responseType]();
      return { error: null, data: parsedResponse };
    } catch (ex) {
      return { error: ex };
    }
  },
  getResultsMapCallback({ _source: source }) {
    return source;
  },
  getTabsItemCount(response) {
    if (response?.aggregations?.main_nav_categories?.buckets) {
      return response.aggregations.main_nav_categories.buckets.reduce((acc, cur) => {
        acc[cur.key.toLowerCase()] = cur.doc_count;
        return acc;
      }, {});
    }
    return {};
  },
  async getSearchResults(searchParams, requestType = 'search') {
    try {
      const { searchApiKey = '', searchApiEndpoint = '' } = await fetchPlaceholders();
      const headers = search.getSearchHeaders(searchApiKey);
      const body = requestType === 'search' ? search.getSearchBody(searchParams) : getPriorityCarListingQuery(searchParams);
      const options = {
        body,
        headers,
        method: 'POST',
      };
      const searchResults = await search.makeAPICall(searchApiEndpoint, options, 'text');
      if (!searchResults.error) {
        const parsed = JSON.parse(searchResults.data);
        // eslint-disable-next-line no-underscore-dangle
        const { hits = [], total = {} } = parsed?.hits || {};
        const results = hits.map(search.getResultsMapCallback) || [];
        const response = {
          total,
          results,
          error: searchResults.error,
          tabsItemCount: search.getTabsItemCount(parsed),
        };
        return response;
      }
      return searchResults;
    } catch (error) {
      return { error };
    }
  },
  updateQueryParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState(null, '', url.toString());
  },
  getListButton(pageNumber, btnLabel, isActive, disabled, hideTextContent) {
    const li = document.createElement('li');
    const btn = document.createElement('button');

    const srOnlySpan = document.createElement('span');
    srOnlySpan.classList.add('sr-only');
    srOnlySpan.textContent = btnLabel;

    const btnContentSpan = document.createElement('span');
    btnContentSpan.ariaHidden = true;
    btnContentSpan.textContent = pageNumber;

    btn.appendChild(srOnlySpan);
    btn.classList.add('pagination-btn', 'text-sm-2', 'text-lg-3');
    btn.dataset.page = pageNumber;
    if (hideTextContent) {
      btn.classList.add(pageNumber);
    } else {
      btn.appendChild(btnContentSpan);
      btn.classList.add('count-btn');
    }
    if (isActive) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }
    if (disabled) {
      btn.setAttribute('disabled', '');
    }
    li.appendChild(btn);
    return li;
  },
  getSearchPlaceholderText(
    searchTemplate,
    noResultsTemplate,
    errorMessage,
    searchTerm,
    errorTypes,
  ) {
    const { noResults, apiError } = errorTypes;
    const template = noResults ? noResultsTemplate : searchTemplate;
    if (apiError) {
      return errorMessage;
    }
    if (noResults) {
      return template.replace('{{searchterm}}', `"${searchTerm}"`);
    }
    return template.replace('{{searchterm}}', `<strong>'${searchTerm}'</strong>`);
  },
  customEvent(eventType, detail) { return new CustomEvent(eventType, { detail, bubbles: true }); },
  dispatchCustomEvent(targetElement, customEventType, customData) {
    targetElement.dispatchEvent(search.customEvent(customEventType, customData));
  },
  getDefaultDetailsCard(cardDetail) {
    const {
      page_title: title = '',
      page_url: pageUrl = '',
      page_description: description = '',
    } = cardDetail;
    return `<li>
        <a href="${pageUrl}" class="search-results-card">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-1">${title}</h3>
            <span class="cta-link" />
          </div>
          <p class="description text-sm-4 text-lg-4 font-weight-400">${description}</p>
        </a>
      </li>`;
  },
  getRelatedCard(cardDetail) {
    const {
      car_name: carName = '',
      anchor_title: anchorTitle = '',
      page_url: pageUrl = '',
      page_description: description = '',
    } = cardDetail;
    return `<li>
        <a href="${pageUrl}" class="search-results-card search-results-related">
          <div class="card-header">
            <h3 class="text-sm-2 text-lg-1">${carName}&nbsp;-&nbsp;<span class="text-sm-3 text-lg-1 italic font-weight-400">${anchorTitle}</span></h3>
            <span class="cta-link" />
          </div>
          <p class="description text-sm-4 text-lg-4 font-weight-400">${description}</p>
        </a>
      </li>`;
  },
  getCarDetailsCard(carDetail, placeholders) {
    const {
      car_name: carName = '',
      page_url: pageUrl = '',
      image_url: imageUrl = '',
      fuel_types: fuelTypes = [],
      starting_price: startingPrice = '',
      page_description: description = '',
      transmission_types: transmissionTypes = [],
    } = carDetail;
    let transmissionTypesArray = [];
    if (Array.isArray(transmissionTypes)) {
      transmissionTypesArray = transmissionTypes;
    }
    const formattedStartingPrice = formatCurrency(startingPrice).replaceAll(',', ' ');
    const rupeesLabel = search.usei18n('rupeesLabel', placeholders);
    const fuelTypesLabel = search.usei18n('fuelTypesLabel', placeholders);
    const startingAtLabel = search.usei18n('startingAtLabel', placeholders);
    const carDetailsLabel = search.usei18n('carDetailsLabel', placeholders);
    const transmissionTypesLabel = search.usei18n('transmissionTypesLabel', placeholders);
    const startingAtPriceFormatted = `${rupeesLabel} ${formattedStartingPrice}/-`;
    return `<li>
      <a href="${pageUrl}" class="search-results-card media-card">
        <div class="image-container">
          <img class='car-image' src="${imageUrl}" alt="${description}" />
        </div>
        <div class="search-results-card details-section">
          <div class="card-header-wrapper">
            <div class="card-header">
              <h3 class="text-sm-2 text-lg-1">${carName}<span class='hyphen-separator'>-</span><span class="text-sm-2 text-lg-1 italic break-word font-weight-400">${carDetailsLabel}</span></h3>
              <span class="cta-link"></span>
            </div>
            <p class="starting-price text-sm-4 text-lg-3 font-weight-400 ${search.hideVisibility(startingPrice)}" aria-hidden="${!startingPrice}">
              ${startingAtLabel} <span class="font-weight-500">${startingAtPriceFormatted}</span>
            </p>
          </div>
          <div class="car-details">
            <div class="fuel-types car-details-specs ${search.hideVisibility(fuelTypes.length)}" aria-hidden="${!fuelTypes.length}">
              <span class="text-sm-4 text-lg-5 font-weight-400">
                ${fuelTypesLabel}
              </span>
              <span class="text-sm-3 text-lg-3 font-weight-500 break-word">
                ${fuelTypes.filter((f) => !!f).join(' | ').trim()}
              </span>
            </div>
            <div class="transmission-type car-details-specs ${search.hideVisibility(transmissionTypesArray.length)}" aria-hidden="${!transmissionTypesArray.length}">
              <span class="text-sm-4 text-lg-5 font-weight-400">
                ${transmissionTypesLabel}
              </span> 
              <span class="text-sm-3 text-lg-3 font-weight-500 break-word">
                ${transmissionTypesArray.filter((t) => !!t).join(' | ').trim()}
              </span>
            </div>
          </div>
        </div>
      </a>
    </li>`;
  },
  getCardRenderer(item) {
    const relatedItem = item?.main_nav_categories?.includes('related');
    const carDetailsItem = item?.main_nav_categories?.includes('cars');
    if (relatedItem) {
      return search.getRelatedCard;
    // eslint-disable-next-line no-else-return
    } else if (carDetailsItem) {
      return search.getCarDetailsCard;
    }
    return search.getDefaultDetailsCard;
  },
  updateDataLayer(eventType, params) {
    if (eventType === 'searchEvent') {
      const searchDetails = {
        searchTerm: params.searchTerm,
        numOfSearchResults: params.numOfSearchResults,
        componentName: 'Search',
        componentType: 'button',
        webName: params.webName,
        linkType: 'other',
      };
      analytics.setSearchDetails(searchDetails);
    } else if (eventType === 'searchItemClick') {
      const searchItemClicked = {
        linkType: 'other',
        webName: params.itemTitle,
        clickInfo: params.clickInfo,
        searchResultInfo: params.searchResultInfo,
      };
      analytics.setSearchItemDetails(searchItemClicked);
    }
  },
  handleSearchItemClick(event) {
    if (event.target.href || event.target.closest('a[href]')) {
      let element;
      if (event.target.href) {
        element = event.target;
      } else {
        element = event.target.closest('a[href]');
      }
      const selectedFacet = search.getQueryParam('tab');
      const resultPageNumber = search.getQueryParam('p');
      const itemTitle = element?.querySelector('h3')?.textContent.trim() || '';
      const searchResultInfo = {
        resultPageNumber: Number(resultPageNumber),
      };
      const clickInfo = {
        componentType: 'Button',
        componentTitle: selectedFacet,
        componentName: 'Search Result',
      };
      search.updateDataLayer('searchItemClick', { itemTitle, clickInfo, searchResultInfo });
    }
  },
  checkRelatedResults(curr, prev, index) {
    const check1 = index === 0 && curr.includes('related');
    const check2 = curr.includes('related') && !prev.includes('related');
    return check1 || check2;
  },
  hideVisibility(check) {
    return !check ? 'hide-visibility' : '';
  },
  sortPriorityCarsResponse(carModels, priorityCars) {
    const carModelsCopy = [...carModels];
    return carModelsCopy.reduce((acc, cur) => {
      const index = priorityCars.findIndex((car) => car.model_cd === cur);
      if (index !== -1) {
        acc.push(priorityCars.splice(index, 1)[0]);
      }
      return acc;
    }, []);
  },
};

export default search;
