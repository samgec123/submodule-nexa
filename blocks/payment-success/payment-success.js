import paymentSuccessDecorator from '../../commons/blocks/payment-success/payment-success.js';

export default async function decorate(block) {
  paymentSuccessDecorator(block);
}
