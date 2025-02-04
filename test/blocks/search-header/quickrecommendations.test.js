/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
import renderQuickRecommendations from '../../../commons/blocks/search-header/quickrecommendations.js';

describe('Quick Recommendations Tests', () => {
  it('should render quick recommendations correctly', () => {
    const quickSearch = 'Quick searches';
    const searchRecomm = 'NEXA cars under 5 lakh,CNG cars under 5 lakh';
    const redirection = '/en/search';

    const html = renderQuickRecommendations(quickSearch, searchRecomm, redirection);
    const container = document.createElement('div');
    container.innerHTML = html;

    const items = container.querySelectorAll('.search-recomm-list-item');
    expect(items.length).to.equal(2);
    expect(items[0].getAttribute('href')).to.equal('/en/search?q=NEXA cars under 5 lakh');
    expect(items[1].getAttribute('href')).to.equal('/en/search?q=CNG cars under 5 lakh');
  });

  it('should not render quick recommendations if searchRecomm is empty', () => {
    const quickSearch = 'Quick searches';
    const searchRecomm = '';
    const redirection = '/en/search';

    const html = renderQuickRecommendations(quickSearch, searchRecomm, redirection);
    expect(html).to.be.empty;
  });
});
