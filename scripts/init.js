/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { environmentSelection } from '../commons/utility/masterUtil.js';

/* eslint-env browser */
window.hlx = window.hlx || {};

// Declare the blocks that are to be used from commons
window.hlx.commonsBlocks = ['cards', 'columns', 'fragment', 'hero'];
// eslint-disable-next-line max-len
window.hlx.sfBlocks = ['model-selection', 'variant-detail', 'user-profile', 'personal-details', 'price-summary', 'pre-approved', 'loan-compare', 'filter-form', 'login-page', 'customer-detail', 'dealer-list', 'sf-journey-start', 'loan-application', 'loan-status', 'financier-mapping', 'journey-carousel', 'collapsible-text', 'faq', 'image-carousel', 'sf-dealer-locator', 'contact-support-list'];
window.hlx.lcpBlocks = ['hero-banner-car-detail', 'hero-banner', 'hero-banner-dealer', 'image-carousel', 'banner-carousel', 'profile-hero-banner', 'yy8-hero-banner-car-detail', 'yy8-technology-banner', 'yy8-banner', 'yy8-banner-teaser'];
window.hlx.ebookModuleBlocks = ['ebook-journey'];

window.hlx.alloyConfig = {
  datastreamId: environmentSelection.getConfiguration('datastreamId'),
  profileEnabledDataStreamId: environmentSelection.getConfiguration('profileEnabledDataStreamId'),
  thirdPartyCookiesEnabled: false,
};

function setCodeBasePath() {
  window.hlx.codeBasePath = '';
  window.hlx.commonsCodeBasePath = '';
  const scriptEl = document.querySelector('script[src$="/scripts/init.js"]');
  if (scriptEl) {
    try {
      const scriptURL = new URL(scriptEl.src, window.location);
      if (scriptURL.host === window.location.host) {
        [window.hlx.codeBasePath] = scriptURL.pathname.split('/scripts/init.js');
      } else {
        [window.hlx.codeBasePath] = scriptURL.href.split('/scripts/init.js');
      }
      window.hlx.commonsCodeBasePath = `${window.hlx.codeBasePath}/commons`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}

window.hlx.apiDomainForLocalhost = 'https://dev-nexa.marutisuzuki.com/';

document.addEventListener('DOMContentLoaded', () => {
  if(document.head.querySelector('meta[name="header-variation"]')?.getAttribute('content') === 'yy8') {
    document.body.classList.add('yy8-body');
  }
});

setCodeBasePath();
