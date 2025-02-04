/* eslint-disable no-unused-expressions */
/// * global describe, it */

// eslint-disable-next-line import/no-unresolved
// import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/car-filter/car-filter.js';

document.write(await readFile({ path: './car-filter.plain.html' }));

const block = document.querySelector('.car-filter');
await decorate(block);
