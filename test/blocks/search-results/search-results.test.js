/* eslint-disable no-unused-expressions */
/* global describe it before after */

// eslint-disable-next-line import/no-unresolved
import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import search from '../../../commons/scripts/search/search.js';
import decorate from '../../../commons/blocks/search-results/search-results.js';

document.write(await readFile({ path: './search-results.plain.html' }));

window.placeholders = {
  default: {
    facet1: 'All',
    facet2: 'Cars',
    facet3: 'Buy',
  },
};

// Function to generate mock search results
const generateMockResults = (count) => {
  const results = [];
  for (let i = 1; i <= count; i += 1) {
    results.push({
      page_url: `/page${i}`,
      page_title: `Page ${i}`,
      page_description: `Description ${i}`,
      meta_description: `Meta Description ${i}`,
      main_nav_categories: ['all', 'cars'],
    });
  }
  return results;
};

let block;

before(async () => {
  // Stub getSearchResults to return mock search results
  sinon.restore();
  sinon.stub(search, 'getSearchResults').resolves({
    error: null,
    total: { value: 20 },
    results: generateMockResults(20),
  });

  // Initialize the block
  const fakeURL = 'http://localhost:2000?q=swift&tab=all';
  window.history.pushState({}, 'Test Page', fakeURL);
  block = document.querySelector('.search-results');
  await decorate(block);
});

after(() => {
  // Restore the original behavior
  sinon.restore();
});

describe('Search Results Tests', () => {
  it('should have a nav with role tablist', async () => {
    const nav = block.querySelector('.tablist[role="tablist"]');
    await expect(nav).to.exist;
  });

  it('should have an active tab button', async () => {
    const activeTab = block.querySelector('li.active button[role="tab"]');
    await expect(activeTab).to.exist;
    const ariaSelected = activeTab.getAttribute('aria-selected');
    await expect(ariaSelected).to.be.equal('true');
  });

  it('should have a heading with the search query', async () => {
    const heading = block.querySelector('h2');
    await expect(heading).to.exist;
    const headingTextContent = heading.textContent;
    await expect(headingTextContent).to.be.equal("Here are your results for 'swift'");
  });

  it('should correctly get query parameter from URL', () => {
    const paramValue = search.getQueryParam('q');
    expect(paramValue).to.equal('swift');
  });

  it('should have 20 search result cards', async () => {
    const cards = block.querySelectorAll('a.search-results-card');
    await expect(cards).to.have.lengthOf(20);
  });

  it('each card should have a header and a paragraph', async () => {
    const cards = block.querySelectorAll('.search-results-card');
    cards.forEach((card) => {
      const header = card.querySelector('.card-header');
      const paragraph = card.querySelector('p');
      expect(header).to.exist;
      expect(paragraph).to.exist;
    });
  });

  it('each card header should contain an anchor link', async () => {
    const cards = block.querySelectorAll('.search-results-card');
    cards.forEach((card) => {
      const link = card.querySelector('.card-header .cta-link');
      expect(link).to.exist;
    });
  });

  it('the role="tabpanel" should be initially visible', async () => {
    const tabpanel = block.querySelector('ul[role="tabpanel"]');
    await expect(tabpanel).to.exist;
    const ariaHidden = tabpanel.getAttribute('aria-hidden');
    await expect(ariaHidden).to.be.equal('false');
  });
});
