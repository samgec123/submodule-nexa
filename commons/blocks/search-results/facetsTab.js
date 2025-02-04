// import { mutationObserver } from '../search-header/helpers.js';
import search from '../../scripts/search/search.js';

export default class FacetsTabs {
  constructor(block, facetChangeEvent) {
    this.block = block;
    this.activatedTab = false;
    this.facetChangeEvent = facetChangeEvent;
    this.tablistNode = block.querySelector('[role=tablist].tablist');
    this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
    // this.tabpanel = this.block.querySelector('[role=tabpanel]');
    this.tabpanels = block.querySelectorAll('[role=tabpanel]');
    this.arrowIcons = this.tablistNode.querySelectorAll('.scrollBtn');

    const selectedTabId = search.getQueryParam('tab');
    const isHasSelectedTabId = this.tabs
      .find((tab) => tab.dataset.filter.toLowerCase() === selectedTabId?.toLowerCase());
    const initialTab = selectedTabId && isHasSelectedTabId
      ? isHasSelectedTabId
      : this.tabs[0];
    this.tabs.forEach((tab) => {
      tab.tabIndex = -1;
      tab.setAttribute('aria-selected', 'false');
      tab.addEventListener('click', this.onClick.bind(this));
      tab.addEventListener('keydown', this.onKeydown.bind(this));
    });

    this.setSelectedTab(initialTab);
    this.handleArrows();
    window.addEventListener('orientationchange', this.handleIconsVisibility.bind(this));
    this.tablistNode.querySelector('ul').addEventListener('scroll', this.handleIconsVisibility.bind(this));
    setTimeout(() => this.handleIconsVisibility(), 0);
  }

  setSelectedTab(currentTab) {
    this.tabs.forEach((tab, i) => {
      const filterValue = tab.dataset.filter?.toLowerCase();
      const isSelected = tab === currentTab;
      tab.parentNode.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected.toString());
      tab.tabIndex = -1;
      const urlParams = new URLSearchParams(window.location.search);
      this.tabpanels[i].setAttribute('aria-hidden', 'true');
      if (isSelected) {
        this.activatedTab = true;
        tab.removeAttribute('tabIndex');
        this.tabpanels[i].setAttribute('aria-hidden', 'false');
        urlParams.set('tab', filterValue);
        if (this.facetChangeEvent) {
          search.dispatchCustomEvent(tab, this.facetChangeEvent, filterValue);
        }
      }
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?${urlParams}`,
      );
    });
  }

  static getFacets(placeholders = {}) {
    const facetList = [
      ...new Set(
        Object.keys(placeholders)
          .filter((key) => key.startsWith('facet'))
          .map((key) => placeholders[key]),
      ),
    ];

    let facets = '';
    let tabpanels = '';
    facetList?.forEach(
      (item, index) => {
        facets += `<li class="${index === 0 ? 'active' : ''}">
         <button
           disabled
           role='tab'
           type='button'
           id='tab-${index + 1}'
           data-filter='${item}'
           class='text-sm-3 text-lg-4 font-weight-400'
           aria-controls='tabpanel-${index + 1}'
           aria-selected='false'>
           ${item} <span class='items-count'></span>
         </button>
       </li>`;
        tabpanels += `<ul 
        id="tabpanel-${index + 1}" 
        role="tabpanel" 
        aria-hidden="true" 
        aria-labelledby="${item.toLowerCase()}"
        class="search-results-cards"></ul>`;
      },
    );
    return { facets, tabpanels };
  }

  // eslint-disable-next-line class-methods-use-this
  moveFocusToTab(currentTab) {
    currentTab.focus();
  }

  moveFocusToAdjacentTab(currentTab, direction) {
    const index = this.tabs.indexOf(currentTab);
    const nextTab = this.tabs[(index + direction + this.tabs.length) % this.tabs.length];
    this.moveFocusToTab(nextTab);
  }

  onKeydown(event) {
    const { key } = event;
    const currentTab = event.currentTarget;
    let flag = false;
    switch (key) {
      case 'ArrowLeft':
        this.moveFocusToAdjacentTab(currentTab, -1);
        flag = true;
        break;
      case 'ArrowRight':
        this.moveFocusToAdjacentTab(currentTab, 1);
        flag = true;
        break;
      case 'Home':
        this.moveFocusToTab(this.tabs[0]);
        flag = true;
        break;
      case 'End':
        this.moveFocusToTab(this.tabs[this.tabs.length - 1]);
        flag = true;
        break;
      default:
    }
    if (flag) {
      this.handleIconsVisibility();
      event.preventDefault();
    }
  }

  onClick(event) {
    this.setSelectedTab(event.currentTarget);
    this.handleIconsVisibility();
  }

  handleIconsVisibility() {
    const tablist = this.tablistNode.querySelector('ul');

    const maxScrollableWidth = tablist.scrollWidth - tablist.clientWidth;
    const { scrollLeft } = tablist;
    if (scrollLeft > 0) {
      this.arrowIcons[0].removeAttribute('hidden');
    } else {
      this.arrowIcons[0].setAttribute('hidden', '');
    }
    if (scrollLeft < maxScrollableWidth) {
      this.arrowIcons[1].removeAttribute('hidden');
    } else {
      this.arrowIcons[1].setAttribute('hidden', '');
    }
  }

  handleArrows() {
    this.arrowIcons.forEach((icon) => {
      let scrollTimer = null;
      icon.addEventListener('click', () => {
        const tablist = this.tablistNode.querySelector('ul');
        const scrollAmount = icon.id === 'left' ? -200 : 200;
        tablist.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          this.handleIconsVisibility();
        }, 100);
      });
    });
  }

  updateTabItemsCount(itemsCountMap = {}) {
    this.tabs.forEach((tab) => {
      const itemsCount = itemsCountMap[tab.dataset.filter.toLowerCase()] || 0;
      if (itemsCount) {
        tab.removeAttribute('disabled');
        tab.querySelector('.items-count').textContent = `(${itemsCount})`;
        if (!this.activatedTab) {
          this.activatedTab = true;
          tab.click();
        }
      }
    });
  }
}
