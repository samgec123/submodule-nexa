/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/dealer-locator/dealer-locator.js';

document.write(await readFile({ path: './dealer-locator.plain.html' }));

const block = document.querySelector('.dealer-locator');
await decorate(block);

describe('Dealer Locator Block', () => {
  it('Should render dealer locator', async () => {
    expect(block.querySelectorAll('.dealersLocator-content').length).equal(1);
  });
});
