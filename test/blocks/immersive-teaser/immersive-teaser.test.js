/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/immersive-teaser/immersive-teaser.js';

document.write(await readFile({ path: './immersive-teaser.plain.html' }));

const block = document.querySelector('.immersive-teaser');
await decorate(block);

describe('Immersive Teaser Block', () => {
  it('Should render immersive teaser', async () => {
    expect(block.querySelectorAll('.immersive__content').length).equal(1);
  });
});
