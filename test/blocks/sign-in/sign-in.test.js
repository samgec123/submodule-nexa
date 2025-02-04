/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/sign-in/sign-in.js';

document.write(await readFile({ path: './sign-in.plain.html' }));

const block = document.querySelector('.sign-in');
await decorate(block);

describe('sign-in Block', () => {
  it('Should render sign-in Block', async () => {
    // Check if the container for sign-in items is present
    expect(block.querySelectorAll('.user__dropdown').length).equal(1);
  });
});
