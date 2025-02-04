import { html } from '../../vendor/htm-preact.js';
import { hnodeAs } from '../multi-step-form.js';

const LoginStepsInfo = ({ config }) => html`
    <div class="cmp-login--steps-info">
        <div class="cmp-login--steps-info__description">
            ${hnodeAs(config.stepsInfoTitle, 'h3')}
            ${hnodeAs(config.StepsInfoDescription, 'p')}
        </div>
        <div class="cmp-login--steps-info__steps">
            <div class="cmp-login--steps-info__card">
                <div class="cmp-login--steps-info__card--heading">
                    ${hnodeAs(config.firstNumber, 'h3')}
                    ${hnodeAs(config.firstTitle, 'h4')}
                </div>
                ${hnodeAs(config.firstDescription, 'p')}
            </div>
            <div class="cmp-login--steps-info__card">
                <div class="cmp-login--steps-info__card--heading">
                     ${hnodeAs(config.secondNumber, 'h3')}
                    ${hnodeAs(config.secondTitle, 'h4')}
                </div>  
                ${hnodeAs(config.secondDescription, 'p')}
            </div>
            <div class="cmp-login--steps-info__card">
                <div class="cmp-login--steps-info__card--heading">
                     ${hnodeAs(config.thirdNumber, 'h3')}
                    ${hnodeAs(config.thirdTitle, 'h4')}
                </div>
                ${hnodeAs(config.thirdDescription, 'p')}
            </div>
        </div>
    </div>
  `;

export default LoginStepsInfo;
