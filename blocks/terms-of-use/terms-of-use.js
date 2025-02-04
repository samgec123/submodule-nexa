import utility from '../../utility/utility.js';

export default function decorate(block) {    
    const [
        titleEl,
        descriptionEl
    ] = block.children;
  
    const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    const description = descriptionEl.innerHTML || '';

    title.classList.add('heading');

    block.innerHTML = utility.sanitizeHtml(`
        <div class="terms-of-use__container">
          <div class="header">
            ${title.outerHTML}
          </div>
          <div class="body">
            <div class="content">
              ${description}
            </div>
          </div>
        </div>
    `);
}