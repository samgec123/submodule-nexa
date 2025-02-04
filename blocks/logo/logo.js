import utility from '../../utility/utility.js';

export default function decorate(block) {
  const link = block.querySelector('div a')?.getAttribute('href') || '#';
  const altText = block.querySelector('div:nth-child(2) div')?.textContent?.trim() || 'logo';
  const picture = block.querySelector('div picture');

  picture?.querySelector('img')?.setAttribute('alt', altText);
  let logoName = 'Maruti Suzuki'; 

  const logoImage = picture?.querySelector('img');
  if (logoImage && logoImage.alt.toLowerCase().includes('nexa')) {
    logoName = 'Nexa';
  }

  const htmlLiteral = `
            <span>
                <a class="logo__picture" href="${link}" data-logo-name="${logoName}">
                    ${picture?.outerHTML || ''}
                </a>
            </span>
        `;
  block.innerHTML = utility.sanitizeHtml(htmlLiteral);
}
