import utility from '../../utility/utility.js';
import { moveInstrumentation } from '../../commons/scripts/scripts.js'; // Importing the moveInstrumentation function

export default function decorate(block) {
  let newSecondaryContainerHTML = '<div class="secondaryNav-items-container">';

  [...block.children]?.forEach((item) => {
    const [titleEl, idEl, iconEl, altTextEl] = item.firstElementChild.children;

    const itemTitle = titleEl?.textContent || 'No title found';
    const itemId = idEl?.textContent?.trim() || '';
    const imgElement = iconEl?.querySelector('img')?.src || 'No image found';
    const itemAlt = altTextEl?.textContent?.trim() || 'No alt text found';

    const sanitizedItemId = itemId.replace(/\s+/g, '-').toLowerCase();

    const newNavItem = document.createElement('div');
    newNavItem.className = 'secondaryNav-item';
    newNavItem.setAttribute('data-target-id', sanitizedItemId);

    const anchor = document.createElement('a');
    anchor.href = `#${sanitizedItemId}`;
    anchor.className = 'secondaryNav-item-title';
    anchor.textContent = itemTitle;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'secondaryNav-item-iconImg';

    const img = document.createElement('img');
    img.src = imgElement;
    img.alt = itemAlt;

    iconDiv.appendChild(img);
    newNavItem.appendChild(anchor);
    newNavItem.appendChild(iconDiv);

    // Applying instrumentation between elements
    moveInstrumentation(item, newNavItem);

    newSecondaryContainerHTML += newNavItem.outerHTML;
  });

  newSecondaryContainerHTML += '</div>';

  block.innerHTML = utility.sanitizeHtml(`
    <div class="secondaryNav block">
      <div class="container">
        <div class="secondaryNav-heading">
          ${newSecondaryContainerHTML}
        </div>
      </div>
    </div>
  `);

  const navItems = block.querySelectorAll('.secondaryNav-item a');
  navItems.forEach((navItem) => {
    navItem.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default anchor behavior

      const targetId = navItem.getAttribute('href').substring(1);
      const targetBlock = document.getElementById(targetId);

      if (targetBlock) {
        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.error('Target block not found:', targetId);
      }
    });
  });
  return block;
}
