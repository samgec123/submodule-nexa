/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../vendor/htm-preact.js';
import LoginForm from './login-form.js';
/*  ${hnodeAs(config.bannerImage, 'picture')} */

function Banner({ config }) {
  return html`
    <div class="cmp-login--banner">
      <${LoginForm} config=${config} />
    </div> 
  `;
}

export default Banner;
