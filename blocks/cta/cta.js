import ctaUtils from '../../utility/ctaUtils.js';
import utility from '../../utility/utility.js';

export default function decorate(block) {
  const [ctaTextEl, ctaLinkEl, ctaTargetEl] = block.children;
  const cta = ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl, 'cta__link');
  block.innerHTML = utility.sanitizeHtml(`
    ${(cta) ? `${cta.outerHTML}` : ''}
  `);
}
