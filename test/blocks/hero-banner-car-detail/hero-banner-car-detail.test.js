/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/hero-banner-car-detail/hero-banner-car-detail.js';

document.write(await readFile({ path: './hero-banner-car-detail.plain.html' }));

const block = document.querySelector('.hero-banner-car-detail');
await decorate(block);

describe('hero-banner-car-detail Block', () => {
  it('Should render hero-banner-car-detail', async () => {
    expect(block.querySelectorAll('.car-hero-banner-container').length).equal(1);
  });
});
