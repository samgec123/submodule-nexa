/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/faq-list/faq-list.js';

document.write(await readFile({ path: './faq-list.plain.html' }));

const block = document.querySelector('.faq-list');
await decorate(block);

describe('Faq List Block', () => {
  it('Should render faq list', async () => {
    expect(block.querySelectorAll('.faq-items-container').length).to.equal(1);
  });

  it('Should render FAQ items correctly', async () => {
    const faqItems = block.querySelectorAll('.faq-item');
    expect(faqItems.length).to.equal(6);
  });

  it('Should collapse other FAQ descriptions when one is clicked', async () => {
    const secondFaqTitle = block.querySelectorAll('.faq-item-title')[1];
    secondFaqTitle.click();

    const allDescriptions = block.querySelectorAll('.faq-item-description');
    expect(allDescriptions[0].classList.contains('active')).to.be.false;
    expect(allDescriptions[1].classList.contains('active')).to.be.true;
  });
});
