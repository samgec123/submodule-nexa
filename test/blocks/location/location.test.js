/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/location/location';
import sinon from 'sinon';

document.write(await readFile({ path: './location.plain.html' }));

const block = document.querySelector('.location');
await decorate(block);

describe('location Block', () => {
    // let sandbox;
    // beforeEach(async () => {
    //     sandbox = sinon.createSandbox();
    //     const dealerCityListJson = await readFile({ path: './dealercitylist.mock.json' });
    //     sandbox.stub(window, 'fetch').callsFake(async (v) => {
    //         console.log("v",v)
    //         if (v.includes('https://dev-nexa.marutisuzuki.com/dms/v1/api/common/msil/dms/dealer-only-cities?channel=EXC')) {
    //             const jsonContent = await readFile({ path: './dealercitylist.mock.json' });
    //             return {
    //                 ok: true,
    //                 json: () => ({
    //                     data: {
    //                         dealersList: JSON.parse(jsonContent), // Parse the JSON string into an object
    //                     },
    //                 }),
    //             };
    //         }
    //         return {
    //             ok: false,
    //             json: () => ({
    //                 limit: 0, offset: 0, total: 0, data: [],
    //             }),
    //             text: () => '',
    //         };
    //     });
    // });


    it('Should render the correct number of cities', async () => {
        console.log("block.querySelectorAll('.selected__top__city') : ", block.querySelectorAll('.selected__top__city'))
        expect(block.querySelectorAll('.selected__top__city').length).to.equal(4);
    });

    it('should render location button with default location', async () => {
        const locationButton = block.querySelector('.location-btn');
        expect(locationButton).to.exist;
        expect(locationButton.textContent.trim()).to.equal('Delhi');
    });


});
