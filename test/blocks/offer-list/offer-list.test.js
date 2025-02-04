/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/offer-list/offer-list.js';

document.write(await readFile({ path: './offer-list.plain.html' }));

const block = document.querySelector('.offer-list');
await decorate(block);

describe('Offer List Block', () => {
  it('Should render Offer List Block', async () => {
    expect(block.querySelectorAll('.deals-offers-container').length).equal(1);
  });
});
