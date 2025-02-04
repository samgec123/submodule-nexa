/* global before, after, describe, it,beforeEach, afterEach */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/footer/footer.js';
// import { describe, beforeEach, afterEach, it } from 'mocha';

let block;
const footerFragment = '/com/in/en/common/footer';
describe('Footer Block', () => {
  // eslint-disable-next-line no-console

  before(async () => {
    window.noload = true;
    window.hlx = window.hlx || {};
    window.hlx.commonsBlocks = ['cards', 'columns', 'fragment', 'hero'];
    window.hlx.codeBasePath = '';
    window.hlx.commonsCodeBasePath = `${window.hlx.codeBasePath}/commons`;
  });

  after(() => {
    window.noload = false;
    window.index = {}; // Reset cache
  });
  let meta;
  let mainTag;
  beforeEach(async () => {
    meta = document.createElement('meta');
    meta.name = 'footer';
    meta.content = footerFragment;

    mainTag = document.createElement('main');
    mainTag.innerHTML = await readFile({ path: './footer.plain.html' });

    document.head.appendChild(meta);
    document.body.appendChild(mainTag);

    await sinon.stub(window, 'fetch').callsFake(async (v) => {
      const fragmentPath = `${footerFragment}.plain.html`;
      if (v.startsWith(fragmentPath)) {
        const htmlContent = await readFile({ path: './footerfragment.plain.html' });
        return {
          ok: true,
          json: () => ({
            limit: 0, offset: 0, total: 0, data: [],
          }),
          text: () => htmlContent,
        };
      }
      return {
        ok: false,
        json: () => ({
          limit: 0, offset: 0, total: 0, data: [],
        }),
        text: () => '',
      };
    });
    block = document.querySelector('.footer');
    await decorate(block);
  });

  afterEach(() => {
    // Remove the meta tag
    document.head.removeChild(meta);

    // Remove the main tag
    document.body.removeChild(mainTag);
    sinon.restore();
  });

  it('renders footer columns', async () => {
    expect(block.querySelectorAll('.footer__columns').length).to.equal(1);
  });
});
