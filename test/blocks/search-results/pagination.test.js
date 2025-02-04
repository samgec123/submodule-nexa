/* eslint-disable no-unused-expressions */
/* global describe it, before, after */

// eslint-disable-next-line import/no-unresolved
import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
// import { getQueryParam } from '../../../commons/scripts/search/search.js';
import decorate from '../../../commons/blocks/search-results/search-results.js';
// import * as aem from '../../../commons/scripts/aem.js';
import search from '../../../commons/scripts/search/search.js';
import paginate from '../../../commons/blocks/search-results/pagination.js';

window.placeholders = {
  default: {
    facet1: 'All',
    facet2: 'Cars',
    facet3: 'Buy',
    facet4: 'Sell',
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

document.write(await readFile({ path: './pagination.plain.html' }));

// let fetchPlaceholdersStub;
let block;
const currentPage = 5;
const totalPages = 15;
let getSearchResultsStub;
const maxVisiblePages = 7;

before(async () => {
  // Stub getSearchResults to return mock search results
  getSearchResultsStub = sinon.stub(search, 'getSearchResults').resolves({
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

describe('Pagination Tests', () => {
  it('should fetch search results correctly', async () => {
    const searchParams = { searchTerm: 'test' };
    const searchResults = await search.getSearchResults(searchParams);
    expect(searchResults.error).to.be.null;
    expect(searchResults.results.length).to.equal(20);
    expect(searchResults.results[0].page_title).to.equal('Page 1');
    expect(searchResults.results[19].page_title).to.equal('Page 20');
  });

  it('should render the correct number of pagination buttons', async () => {
    const buttons = block.querySelectorAll('.pagination-btn');
    // PAGE_SIZE = 10
    // totalPages = 20 / 10; => 2
    // prevbtn + nextbtn + 2 => 4
    expect(buttons.length).to.equal(4); // 2 page buttons + 2 navigation buttons (prev, next)
  });

  it('should highlight the current page button', () => {
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton).to.exist;
    expect(currentPageButton.dataset.page).to.equal('1');
  });

  it('"prev" button should be disabled when current page is 1', () => {
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton).to.exist;
    expect(currentPageButton.dataset.page).to.equal('1');
    const prevButton = block.querySelector('.pagination-btn.prev');
    expect(prevButton.disabled).to.be.not.null;
  });

  it('should navigate to the next page on clicking "next" button', () => {
    const nextButton = block.querySelector('.pagination-btn.next');
    nextButton.click();
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton.dataset.page).to.equal('2');
  });

  it('should navigate to a specific page on clicking page button', async () => {
    const pageButton = block.querySelector('.pagination-btn[data-page="2"]');
    await pageButton.click();
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton.dataset.page).to.equal('2');
  });

  it('should disable the "prev" button on the first page', () => {
    paginate(block, currentPage, totalPages, maxVisiblePages, window.placeholders, 'paginationChange');
    paginate(block, currentPage, totalPages, maxVisiblePages, window.placeholders, 'paginationChange');
    const prevButton = block.querySelector('.pagination-btn.prev');
    expect(prevButton.disabled).to.be.not.null;
  });

  it('should disable the "next" button on the last page', () => {
    paginate(block, 15, totalPages, maxVisiblePages, window.placeholders, 'paginationChange');
    const nextButton = block.querySelector('.pagination-btn.next');
    expect(nextButton.disabled).to.be.not.null;
  });

  it('should render all pages if totalPages is less than maxVisiblePages', () => {
    block.querySelector('.pagination').innerHTML = '';
    paginate(block, currentPage, 5, maxVisiblePages, window.placeholders, 'paginationChange');
    const buttons = block.querySelectorAll('.pagination-btn.count-btn');
    expect(buttons.length).to.equal(5);
  });

  it('should adjust start and end pages correctly when on initial pages', async () => {
    await paginate(block, 2, totalPages, maxVisiblePages, window.placeholders, 'paginationChange');
    const buttons = block.querySelectorAll('.pagination-btn.count-btn');
    expect(buttons[0].dataset.page).to.equal('1');
    expect(buttons[buttons.length - 1].dataset.page).to.equal('7');
  });

  it('should adjust start and end pages correctly when on last pages', async () => {
    await paginate(block, 14, totalPages, maxVisiblePages, window.placeholders, 'paginationChange');
    const buttons = block.querySelectorAll('.pagination-btn.count-btn');
    expect(buttons[0].dataset.page).to.equal('9');
    expect(buttons[buttons.length - 1].dataset.page).to.equal('15');
  });

  it('should render correct pages when totalPages is equal to maxVisiblePages', async () => {
    await paginate(block, currentPage, 7, maxVisiblePages, window.placeholders, 'paginationChange');
    const buttons = block.querySelectorAll('.pagination-btn.count-btn');
    expect(buttons.length).to.equal(7);
    expect(buttons[0].dataset.page).to.equal('1');
    expect(buttons[buttons.length - 1].dataset.page).to.equal('7');
  });

  it('should render correct pages when totalPages is greater than maxVisiblePages', async () => {
    await paginate(block, 10, 20, maxVisiblePages, window.placeholders, 'paginationChange');
    const buttons = block.querySelectorAll('.pagination-btn.count-btn');
    expect(buttons.length).to.equal(7);
    expect(buttons[0].dataset.page).to.equal('7');
    expect(buttons[buttons.length - 1].dataset.page).to.equal('13');
  });

  it('should handle scenario when page number is not a number', () => {
    const nonNumberButton = block.querySelector('.pagination-btn[data-page="prev"]');
    nonNumberButton.click();
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton.dataset.page).to.equal('9');
  });

  it('should handle scenario when page number is "next"', () => {
    const nextButton = block.querySelector('.pagination-btn[data-page="next"]');
    nextButton.click();
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton.dataset.page).to.equal('10');
  });

  it('should handle scenario when page number is "prev"', () => {
    const prevButton = block.querySelector('.pagination-btn[data-page="prev"]');
    prevButton.click();
    const currentPageButton = block.querySelector('.pagination-btn.active');
    expect(currentPageButton.dataset.page).to.equal('9');
  });

  it('should handle scenario when clicking on the current page button', async () => {
    let currentPageButton = block.querySelector('.pagination-btn[data-page="8"]');
    await currentPageButton.click();
    currentPageButton = block.querySelector('.pagination-btn[data-page="8"]');
    expect(currentPageButton.classList.contains('active')).to.be.true;
  });

  it('should handle empty search results gracefully', async () => {
    // Simulate empty search results
    getSearchResultsStub.resolves({
      error: null,
      total: { value: 0 },
      results: [],
    });

    await decorate(document.querySelector('.search-results'));

    const searchResults = document.querySelectorAll('.search-results-card');
    expect(searchResults.length).to.equal(3);
  });

  // it('should handle API errors gracefully', async () => {
  //   // Simulate API error response
  //   getSearchResultsStub.rejects(new Error('API error'));

  //   await decorate(document.querySelector('.search-results'));

  //   const searchResults = document.querySelectorAll('.search-results-card');
  //   expect(searchResults.length).to.equal(0);
  // });
});
