export default function decorate(block) {
  const icons = block.querySelectorAll('.icontitle picture');
  const titleElement = block.querySelector('div:nth-child(1) > p');

  if (!titleElement) {
    return;
  }

  const title = titleElement.textContent.trim();
  const iconImages = block.querySelectorAll('.icontitle img');

  iconImages.forEach((img) => {
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.setAttribute('alt', title);
  });

  const icon = icons[0] ? icons[0].outerHTML : '';
  const iconClicked = icons[1] ? icons[1].outerHTML : '';

  block.innerHTML = `
        <h2>${title}</h2>
        <div class='icon'>${icon}</div>
        <div class='iconClicked'>${iconClicked}</div>
    `;
}
