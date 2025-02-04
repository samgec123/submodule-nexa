/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/contact/contact.js';

document.write(await readFile({ path: './contact.plain.html' }));

const block = document.querySelector('.contact');
await decorate(block);

describe('contact Block', () => {
  it('Should render contact', async () => {
    expect(block.querySelectorAll('.user__contact').length).equal(1);
  });
});
