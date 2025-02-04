/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
import search from '../../../commons/scripts/search/search.js';
import { handleMobileSearch, mutationObserver } from '../../../commons/blocks/search-header/helpers.js';

describe('Helpers Tests', () => {
  it('should correctly get query parameter from URL', () => {
    const fakeURL = 'http://localhost:2000?q=test';
    window.history.pushState({}, 'Test Page', fakeURL);
    const paramValue = search.getQueryParam('q');
    expect(paramValue).to.equal('test');
  });

  it('should handle mobile search correctly', () => {
    document.body.innerHTML = `
      <header class="header">
        <div class="menu-list">
          <div class="search"></div>
          <div class="search + .panel"></div>
        </div>
      </header>
    `;

    handleMobileSearch();
    const mobMenuElement = document.querySelector('header .menu-list');
    const menuItemSearch = mobMenuElement.querySelector('.search');
    const panelSearch = mobMenuElement.querySelector('.search + .panel');
    menuItemSearch.click();
    if (panelSearch) {
      panelSearch.querySelector('.close-icon').click();

      menuItemSearch.click();
      menuItemSearch.click();
      expect(panelSearch.dataset.eventAttached).to.equal('attached');
    }
  });

  it('should observe mutations correctly', (done) => {
    document.body.innerHTML = '<div id="header-div" class="header" data-block-status="loading"></div>';
    mutationObserver({
      elementSelector: 'div.header',
      onMutationCallback: (mutation) => {
        expect(mutation.type).to.equal('childList');
        done();
      },
    });
    const menuList = document.createElement('ul');
    menuList.classList.add('menu-list');
    const searchListItem = document.createElement('li');
    searchListItem.classList.add('search');
    document.querySelector('#header-div').appendChild(menuList);
    menuList.appendChild(searchListItem);
  });
});
