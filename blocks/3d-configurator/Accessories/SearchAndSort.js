import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { SearchIcon, SortIcon } from '../Icons.js';

const SearchAndSort = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  searchPlaceholderLabelEl,
  priceLabelEl,
  priceFilterOneLabelEl,
  priceFilterTwoLabelEl,
}) => {
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleSortClick = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const priceLabel = priceLabelEl?.textContent?.trim() || '';
  const priceFilterOneLabel = priceFilterOneLabelEl?.textContent?.trim() || '';
  const priceFilterTwoLabel = priceFilterTwoLabelEl?.textContent?.trim() || '';

  return html`
    <div class="search-sort-div">
        <div class="search-box">
          <input 
            type="text" 
            placeholder=${searchPlaceholderLabelEl?.textContent?.trim()}
            value=${searchTerm}
            onInput=${handleSearchChange}
          />
          <button class="search-icon" id="searchIcon">
              <${SearchIcon} />
          </button>
        </div>
        <div class="sort-box">  
          <div class="sort-label">${priceLabel}: ${sortOrder === 'asc' ? priceFilterOneLabel : priceFilterTwoLabel} </div> 
          ${sortOrder === 'asc' ? html`<button class="sort-btn-asc" onClick=${handleSortClick}>
              <${SortIcon} />          
          </button>`
    : html`<button class="sort-btn" onClick=${handleSortClick}>
              <${SortIcon} />          
          </button>`}
        </div>
      </div>
  `;
};

export default SearchAndSort;
