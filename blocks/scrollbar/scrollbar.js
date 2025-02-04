import utility from '../../commons/utility/utility.js';

export default async function decorateScroll(block) {
  const { children } = block.children[0].children[0];
  const [textEl] = children;

  const text = textEl?.textContent?.trim();

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('scrollBtn__container');

  const scrollButton = document.createElement('div');
  scrollButton.classList.add('scroll-btn');

  const sIcon = document.createElement('div');
  sIcon.classList.add('scroll-icon');
  sIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none">
  <rect x="1" y="1" width="18" height="28" rx="8" stroke="#fff" stroke-width="2"></rect>
  <circle cx="10" cy="20" r="2" fill="#fff"><animate attributeName="cy" values="20;20;20;12;10;10;10;18;20;" dur="2s" repeatCount="indefinite" /></circle>
</svg>
`;

  const scrollText = document.createElement('div');
  scrollText.textContent = text || '';
  scrollText.classList.add('scroll-text');

  scrollButton.appendChild(sIcon);
  scrollButton.appendChild(scrollText);
  mainContainer.appendChild(scrollButton);

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(mainContainer.outerHTML));

  const scrollIcon = block.querySelector('.scroll-icon');
  if (scrollIcon) {
    scrollIcon.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
