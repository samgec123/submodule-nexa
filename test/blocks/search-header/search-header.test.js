/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import search from '../../../commons/scripts/search/search.js';
import decorate from '../../../commons/blocks/search-header/search-header.js';
import { handleMobileSearch, mutationObserver } from '../../../commons/blocks/search-header/helpers.js';

document.write(await readFile({ path: './search-header.plain.html' }));
document.querySelector('.search-header').innerHTML = `
          <div>
            <div>Search cars, pages &#x26; blocks</div>
          </div>
          <div>
            <div></div>
          </div>`;
const block = document.querySelector('.search-header');
await decorate(block);

describe('Search Header Tests', () => {
  it('should render the search form with the correct placeholder text', async () => {
    const input = block.querySelector('.header-search');
    await expect(input).to.exist;
    await expect(input.placeholder).to.equal('Search cars, pages & blocks');
  });

  it('should have a functional close button', async () => {
    const mobMenuElement = document.querySelector('header .menu-list');
    const menuItemSearch = mobMenuElement.querySelector('.search');
    menuItemSearch.click();
    const closeButton = block.querySelector('.close-icon');
    await expect(closeButton).to.exist;
    closeButton.click();
    const panel = block.closest('.search');
    await expect(panel.style.display).to.equal('');
  });

  it('should handle mobile search correctly', async () => {
    handleMobileSearch();
    const mobMenuElement = document.querySelector('header .menu-list');
    const menuItemSearch = mobMenuElement.querySelector('.search');
    const panelSearch = mobMenuElement.querySelector('.search + .panel');
    menuItemSearch.click();
    panelSearch.querySelector('.close-icon').click();
    menuItemSearch.click();
    menuItemSearch.click();
    await expect(panelSearch.dataset.eventAttached).to.equal('attached');
  });

  it('should correctly get query parameter', async () => {
    const paramValue = search.getQueryParam('q');
    await expect(paramValue).to.be.null; // Assuming no query param is set in the test environment
  });

  it('should observe mutations correctly', async () => {
    const mutationCallback = (mutation) => {
      expect(mutation.type).to.equal('attributes');
      expect(mutation.attributeName).to.equal('data-block-status');
    };

    mutationObserver({
      elementSelector: 'div.header',
      onMutationCallback: mutationCallback,
    });

    const headerBlock = document.querySelector('div.header');
    headerBlock.setAttribute('data-block-status', 'loaded');
  });
});
