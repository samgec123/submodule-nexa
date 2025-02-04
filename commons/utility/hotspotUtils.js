import utility from './utility.js';

const hotspot = {
  getHotspot(block, index) {
    const [titleEl, subtitleEl, imageEl] = block.children;
    const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    const subtitle = subtitleEl.querySelector('p')?.textContent?.trim();
    const picture = imageEl.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    if (title) {
      title.className = 'modal-title';
    }
    const newHTML = `
        <div class="hotspot-${index} hotspot-carousel">
        <div class="slide-count"></div>
          ${title?.outerHTML}
           <p class="modal-subtitle">${subtitle}</p>
          ${picture?.outerHTML}
        </div>
      `;
    block.innerHTML = utility.sanitizeHtml(newHTML);
    return block;
  },
};
export default hotspot;
