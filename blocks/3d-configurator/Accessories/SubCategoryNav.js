import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import { AddNavIcon, CrossNavIcon } from '../Icons.js';
import { useState, useEffect, useRef } from '../../../commons/scripts/vendor/preact-hooks.js';
import utility from '../../../utility/utility.js';

const SubCategoryNav = ({ selectedSubCategories, selectedSubCategory, handleSubCategoryClick }) => {
  const [showMore, setShowMore] = useState(false);
  const [needsShowMore, setNeedsShowMore] = useState(false);
  const subCategoryContainerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (subCategoryContainerRef.current && itemRefs.current.length > 0) {
        const containerWidth = subCategoryContainerRef.current.offsetWidth;
        let totalWidth = 0;
        const currentRowItems = [];

        itemRefs.current.forEach((subCategory, index) => {
          const itemRect = itemRefs.current[index]?.getBoundingClientRect();
          const itemWidth = itemRect?.width || 0;
          const reducedContainerWidth = utility.isCarConfigSmView() ? containerWidth * 0.35 : containerWidth * 0.30;

          if (!showMore) {
            // If not showing all items, calculate visible items
            if (totalWidth + itemWidth <= (containerWidth - reducedContainerWidth) * 2) {
              totalWidth += itemWidth;
              currentRowItems.push(index);
              itemRefs.current[index]?.classList.add('show');
              itemRefs.current[index]?.classList.remove('hide-item');
            } else {
              itemRefs.current[index]?.classList.remove('show');
              itemRefs.current[index]?.classList.add('hide-item');
            }
          } else {
            // Show all items
            itemRefs.current[index]?.classList.add('show');
            itemRefs.current[index]?.classList.remove('hide-item');
          }
        });
        setNeedsShowMore(currentRowItems.length < selectedSubCategories.length);
      }
    };

    calculateVisibleItems();
  }, [selectedSubCategories, showMore]); // Recalculate when selectedSubCategories or showMore changes

  useEffect(() => {
    setShowMore(false);
  }, [selectedSubCategories]);

  return html`
    <div class="subcategories-container" ref=${subCategoryContainerRef}>
      <ul class="subcategories-list">
        <li
          class="subcategories-item ${selectedSubCategory === 'ALL' ? 'active' : ''}"
          onClick=${() => handleSubCategoryClick('ALL')}
        >
          All
        </li>

        ${selectedSubCategories?.map((subCategory, index) => html`
          <li
            ref=${(el) => (itemRefs.current[index] = el)}
            class="subcategories-item ${subCategory.l2CatgName === selectedSubCategory ? 'active' : ''}" 
            onClick=${() => handleSubCategoryClick(subCategory)}
          >
            ${subCategory.l2CatgName}
          </li>
        `)}
        ${needsShowMore
        && html`<li
          class="add-icon-subnav"
          onClick=${() => setShowMore(!showMore)}
        >
          ${showMore
    ? html`<${CrossNavIcon} />`
    : html`<${AddNavIcon} />`}
        </li>`}
      </ul>
    </div>
  `;
};

export default SubCategoryNav;
