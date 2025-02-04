import { html } from '../../../commons/scripts/vendor/htm-preact.js';

const Loader = () => html`  <div className="loading-screen">
      <div className="loading-text">Loading your Background..</div>
      <div className="loading-bar-container">
        <div className="loading-bar"></div>
      </div>
    </div>`;

export default Loader;
