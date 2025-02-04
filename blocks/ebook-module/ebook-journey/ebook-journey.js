import decorateMultiStepFom from '../../../commons/scripts/ebook/multi-step-form.js';
import Login from '../../../commons/scripts/ebook/login/login.js';
import SelectVehicle from '../../../commons/scripts/ebook/select-vehicle/select-vehicle.js';
import SelectDealer from '../../../commons/scripts/ebook/select-dealer/select-dealer.js';
import Summary from '../../../commons/scripts/ebook/summary/summary.js';
import { loadCSS } from '../../../commons/scripts/aem.js';

export default async function decorate(block) {
  block.classList.add('nexa');
  loadCSS(`${window.hlx.codeBasePath}/blocks/ebook-module/ebook-journey/select-vehicle.css`);
  loadCSS(`${window.hlx.codeBasePath}/blocks/ebook-module/ebook-journey/summary.css`);
  await decorateMultiStepFom(block, {
    login: Login,
    'select-vehicle': SelectVehicle,
    'select-dealer': SelectDealer,
    summary: Summary,
  });
}
