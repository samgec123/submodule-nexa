/* eslint-disable no-unused-expressions */
/* global describe it beforeEach afterEach */

// eslint-disable-next-line import/no-unresolved
import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import search from '../../../commons/scripts/search/search.js';
import decorate from '../../../blocks/search-results/search-results.js';

document.write(await readFile({ path: './search-results.plain.html' }));
window.placeholders = {
  default: {
    facetp1: 'P1 Facets test title',
    facetp2: 'P2 Facets test title',
    facetp3: 'P3 Facets test title',
    facetp4: 'P4 Facets test title',
    facetp5: 'P5 Facets test title',
    facetp6: 'P6 Facets test title',
    facetp14: 'P4 Facets test title',
    facetp15: 'P5 Facets test title',
    facetp16: 'P6 Facets test title',
    facetp114: 'P4 Facets test title',
    facetp115: 'P5 Facets test title',
    facetp1116: 'P6 Facets test title',
  },
};
const generateMockResults = (count) => {
  const results = [];
  for (let i = 1; i <= count; i += 1) {
    results.push({
      page_url: `/page${i}`,
      page_title: `Page ${i}`,
      page_description: `Description ${i}`,
      meta_description: `Meta Description ${i}`,
    });
  }
  return results;
};

let block;

beforeEach(async () => {
  // Stub getSearchResults to return mock search results
  sinon.stub(search, 'getSearchResults').resolves({
    error: null,
    total: { value: 20 },
    results: generateMockResults(20),
    tabsItemCount: {
      facetp1: 10,
      facetp2: 10,
      facetp3: 10,
      facetp4: 10,
      facetp5: 10,
      facetp6: 10,
      facetp14: 10,
      facetp15: 10,
      facetp16: 10,
      facetp114: 10,
      facetp115: 10,
      facetp1116: 10,
    },
  });
  block = document.querySelector('.search-results');
  await decorate(block);
});

afterEach(() => {
  // Restore the original behavior
  sinon.restore();
});

describe('Facets Tabs Tests', () => {
  let tabs;
  it('should render facet tabs', async () => {
    const tablist = block.querySelector('[role=tablist].tablist');
    expect(tablist).to.exist;
    tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tabs.length).to.be.greaterThan(0);
  });

  it('should initialize with the first tab selected', async () => {
    tabs = block.querySelectorAll('[role=tab]');
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs[0].tabIndex).to.equal(0);
  });

  it('should change selected tab on click', async () => {
    tabs = block.querySelectorAll('[role=tab]');
    await tabs[1].click();
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs[1].getAttribute('aria-selected')).to.equal('false');
  });

  it('should handle left and right arrow key navigation', async () => {
    tabs = block.querySelectorAll('[role=tab]');
    tabs[0].removeAttribute('disabled');
    tabs[1].removeAttribute('disabled');
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    await tabs[0].dispatchEvent(eventRight);
    expect(document.activeElement).to.equal(tabs[1]);
    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    await tabs[1].dispatchEvent(eventLeft);
    expect(document.activeElement).to.equal(tabs[0]);
  });

  it('should handle Home and End key navigation', async () => {
    tabs = block.querySelectorAll('[role=tab]');
    const lastIndex = tabs.length - 1;
    tabs[0].removeAttribute('disabled');
    tabs[lastIndex].removeAttribute('disabled');
    const eventHome = new KeyboardEvent('keydown', { key: 'Home' });
    await tabs[lastIndex].dispatchEvent(eventHome);
    expect(document.activeElement).to.equal(tabs[0]);
    const eventEnd = new KeyboardEvent('keydown', { key: 'End' });
    await tabs[0].dispatchEvent(eventEnd);
    expect(document.activeElement).to.equal(tabs[lastIndex]);
  });
});
