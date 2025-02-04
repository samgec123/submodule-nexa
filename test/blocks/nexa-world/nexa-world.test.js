/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/nexa-world/nexa-world.js';

document.write(await readFile({ path: './nexa-world.plain.html' }));

const block = document.querySelector('.nexa-world');
await decorate(block);

describe('Nexa World Block', () => {
  it('Should render nexa world', async () => {
    expect(block.querySelectorAll('.nexa-world__content').length).to.equal(1);
  });
});
