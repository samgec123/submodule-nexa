/* eslint-disable no-unused-expressions *//*

*/
/* global describe, it *//*


// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/header/header.js';

document.write(await readFile({ path: './header.plain.html' }));

const block = document.querySelector('.header');
await decorate(block);

describe('header Block', () => {
  it('Should render header', async () => {
    expect(block.querySelectorAll('.navbar').length).equal(1);
  });
});
*/
