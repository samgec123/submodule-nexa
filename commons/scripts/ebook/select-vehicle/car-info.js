/* eslint-disable no-underscore-dangle */
import { html } from '../../vendor/htm-preact.js';
import { useEffect } from '../../vendor/preact-hooks.js';
import { hnodeAs } from '../multi-step-form.js';

const CarInfo = ({ config, selectedVariant, placeholders }) => {
  useEffect(async () => {
  }, []);
  return html`<div class="cmp-select-vehicle__two-column-cards">
      <div class="cmp-select-vehicle__card">
        <h3>About</h3>
        <img src="${placeholders.publishDomain}${selectedVariant?.variantImage?._dynamicUrl}" alt="About Image"/>
        <p>Labelled as stylish and Powerful Compact SUV for the Flauntist who is wicked!</p>
        <div class="cmp-select-vehicle__tag">#off-road adventures</div>
      </div>
      <div class="cmp-select-vehicle__card">
        <h3>Design</h3>
        <img src="${placeholders.publishDomain}${selectedVariant?.variantImage?._dynamicUrl}" alt="Design Image"/>
        <p>Characterised by contemporary and bold design with robust stance and stylish exterior.</p>
        <div class="cmp-select-vehicle__tag">
          <span>SUV</span>
          <span>Hybrid</span>
        </div>
      </div>
    </div>
    <div class="cmp-select-vehicle__two-column-container">
      <div class="cmp-select-vehicle__card">
        ${hnodeAs(config.topFeaturesLabel, 'h3')}
        <ul>
          ${selectedVariant?.highlightFeatures?.map(
    (feature) => html`<li>${feature}</li>`,
  )}
        </ul>
        <div class="cmp-select-vehicle__tag">
          ${selectedVariant?.highlightFeaturesIcon?.map((feature) => html`<span>${feature.featureName}</span>`)}
        </div>
      </div>
      <div class="cmp-select-vehicle__card">
        <h3>Pricing</h3>
        <p>Labelled as stylish and Powerful Compact SUV for the Flauntist who is wicked!</p>
        <div class="cmp-select-vehicle__tag">04-14 Lakhs</div>
      </div>
    </div>`;
};

export default CarInfo;
