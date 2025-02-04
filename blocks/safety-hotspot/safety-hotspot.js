import utility from '../../utility/utility.js';

export default function decorate(block) {
  const [idEl, titleEl, subtitleEl, imageEl, ...hotspotsEl] = block.children;
  const isMobile = window.matchMedia('(max-width : 767px)').matches;

  function createHotspotsHTML(hotspotsElement) {
    return hotspotsElement
      .map((point, index) => {
        // Assuming each el is structured as a <div> with three <p> elements
        const [leftPercent, topPercent, title, description] = Array.from(
          point.querySelectorAll('p'),
        ).map((p) => p?.textContent?.trim() || '');

        const newDiv = point.cloneNode(true);
        newDiv.innerHTML = `
            <div class="circle open-top" style="top: ${topPercent || 1}%; left: ${leftPercent || 1}%" data-hotspot="${index}">
              <div class="text-container">
              ${title ? `<div class ="hotspot__title">${title}</div>` : ''}
              ${description ? ` <div class ="hotspot__description">${description}</div>` : ''}
              </div>
            </div>
          `;
        return newDiv.outerHTML;
      })
      .join('');
  }

  function createHotspotTabs(hotspotsElement) {
    const titles = hotspotsElement.map((point, index) => {
      const title = point.querySelector('p:nth-child(3)')?.textContent?.trim() || '';
      if (title) {
        const activeClass = index === 0 ? 'active' : '';
        return `<li class="switch-list-item ${activeClass}" data-tab="${index}">${title || ''}</li>`;
      }
    }).join('');

    if (titles) {
      return `<div class="switch-list-section"><ul class="switch-list">${titles}</ul></div>`;
    }
    return '<div class="switch-list-section"></div>';
  }
  function initializeArrows(container) {
    const switchListSection = container.querySelector('.switch-list-section');
    const switchListBlock = switchListSection?.querySelector('.switch-list');
    const prevBtn = document.createElement('div');
    const nextBtn = document.createElement('div');

    prevBtn.classList.add('prev-btn');
    nextBtn.classList.add('next-btn');

    // Insert buttons before and after the switch list block
    switchListSection.insertAdjacentElement('beforebegin', prevBtn);
    switchListSection.insertAdjacentElement('afterend', nextBtn);

    // Set initial translation value
    let translateX = 0;
    let moveDistance = 0;

    // Calculate move distance after rendering
    function calculateMoveDistance() {
      if (switchListSection.offsetWidth > 0) {
        moveDistance = switchListSection.offsetWidth / 3; // Adjust as needed
        // eslint-disable-next-line
        updateButtons();
      } else {
        // Retry calculation on the next animation frame if the width is 0
        requestAnimationFrame(calculateMoveDistance);
      }
    }
    requestAnimationFrame(calculateMoveDistance);

    function updateButtons() {
      const maxTranslateX = -(switchListBlock.scrollWidth - switchListSection.offsetWidth);

      // Show or hide buttons based on translateX position
      if (isMobile) {
        if (translateX >= 0) {
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'block';
        } else if (translateX <= maxTranslateX) {
          nextBtn.style.display = 'none';
          prevBtn.style.display = 'block';
        } else {
          prevBtn.style.display = 'block';
          nextBtn.style.display = 'block';
        }
      } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
    }

    // Slide functionality
    prevBtn.addEventListener('click', () => {
      if (translateX < 0) {
        translateX += moveDistance;
        if (translateX > 0) translateX = 0; // Prevent overshooting
        switchListBlock.style.transform = `translateX(${translateX}px)`;
        updateButtons();
      }
    });

    nextBtn.addEventListener('click', () => {
      const maxTranslateX = -(switchListBlock.scrollWidth - switchListSection.offsetWidth);
      if (translateX > maxTranslateX) {
        translateX -= moveDistance;
        if (translateX < maxTranslateX) translateX = maxTranslateX; // Prevent overshooting
        switchListBlock.style.transform = `translateX(${translateX}px)`;
        updateButtons();
      }
    });

    // Initial button state update
    updateButtons();
  }

  function initializeHotspotExpansion(blockClone) {
    const circles = blockClone.querySelectorAll('.circle');
    const tabs = blockClone.querySelectorAll('.switch-list .switch-list-item');

    // Function to draw lines from old position to new position
    function drawLines(circle, oldRect, newRect, containerRect, isMobile) {
      if (isMobile) {
        // Draw horizontal line
        const horizontalLine = document.createElement('div');
        horizontalLine.classList.add('line', 'horizontal-line');
        horizontalLine.style.top = `${oldRect.top - containerRect.top + oldRect.height / 2}px`;

        if (oldRect.left < newRect.left) {
          horizontalLine.style.left = `${oldRect.left + oldRect.width - containerRect.left}px`;
          horizontalLine.style.width = `${Math.abs(newRect.left - oldRect.left - oldRect.width + newRect.width / 2 - 3)}px`;
          horizontalLine.dataset.circle = circle.dataset.circle;
        } else if (oldRect.left === newRect.left) {
          horizontalLine.style.left = '0';
          horizontalLine.style.width = '0';
        } else {
          horizontalLine.style.left = `${newRect.left - containerRect.left + 5}px`;
          horizontalLine.style.width = `${Math.abs(newRect.left - oldRect.left - oldRect.width + newRect.width / 2 - 3)}px`;
          horizontalLine.dataset.circle = circle?.dataset?.circle;
        }

        // Draw vertical line
        const verticalLine = document.createElement('div');
        verticalLine.classList.add('line', 'vertical-line');
        verticalLine.style.left = `${newRect.left - containerRect.left + 5}px`;
        verticalLine.style.top = `${-68}px`;
        verticalLine.style.height = `${Math.abs(oldRect.bottom - newRect.bottom - 0.5)}px`;
        verticalLine.dataset.circle = circle.dataset.circle;

        circle.parentElement.appendChild(horizontalLine);
        circle.parentElement.appendChild(verticalLine);
      } else {
        // Draw vertical line
        const verticalLine = document.createElement('div');
        verticalLine.classList.add('line', 'vertical-line');
        verticalLine.style.left = `${oldRect.left - containerRect.left + 5 + 12}px`;
        verticalLine.style.top = `${-68}px`;
        verticalLine.style.height = `${oldRect.bottom - containerRect.top + 68}px`;
        verticalLine.dataset.circle = circle?.dataset?.circle;

        circle?.parentElement?.appendChild(verticalLine);
      }
    }

    // Function to close all hotspots
    function closeAllHotspots() {
      circles.forEach((circle) => {
        circle.style.top = circle?.dataset?.originalTop;
        circle.style.left = circle?.dataset?.originalLeft;
        const lines = circle.parentElement.querySelectorAll(`.line[data-circle="${circle?.dataset?.circle}"]`);
        lines.forEach((line) => line.remove());
        circle.querySelector('.text-container').style.display = 'none';
        circle.classList.remove('moved');
      });
      tabs.forEach((tab) => tab.classList.remove('active'));
    }

    function isTextContainerOutsideParent(circle) {
      const textRect = circle?.getBoundingClientRect();
      const textContainer = circle?.querySelector('.text-container');
      const textContainerWidth = textContainer ? parseFloat(getComputedStyle(textContainer)?.width) : 0;
      const textContainerMargin = textContainer ? parseFloat(getComputedStyle(textContainer)?.left) : 0;

      const hotspotWrapperRect = blockClone.querySelector('.safetyComponentItem')?.getBoundingClientRect();

      if (!hotspotWrapperRect) {
        return false;
      }

      const isOutside = (
        (textRect.right + textContainerWidth + textContainerMargin) > hotspotWrapperRect.right // Check if the right edge is outside
      );

      return isOutside;
    }

    // Function to expand a specific hotspot
    function expandHotspot(circle) {
      const rect = circle?.getBoundingClientRect();
      const containerRect = blockClone.querySelector('.hotspots')?.getBoundingClientRect();
      const textContainer = circle?.querySelector('.text-container');

      // Save original position
      if (!circle.dataset?.originalTop) {
        circle.dataset.originalTop = circle?.style?.top;
      }
      if (!circle.dataset.originalLeft) {
        circle.dataset.originalLeft = circle?.style?.left;
      }
      circle.dataset.circle = `${Math.random().toString(36).substring(2, 9)}`;

      const isMobile = window.matchMedia('(max-width: 400px)').matches;
      const isTablet = window.matchMedia('(min-width: 401px) and (max-width: 767px)').matches;
      let newLeft;

      if (isMobile) {
        // Center position for mobile
        newLeft = '20%';
      } else if (isTablet) {
        newLeft = '40%';
      } else {
        newLeft = `${rect.left - containerRect.left + 12}px`;
      }

      // Move circle to the new position
      const newTop = 'calc(0% - 68px - 10px)';
      circle.style.top = newTop;
      circle.style.left = newLeft;
      textContainer.style.top = '0';
      textContainer.style.left = '15px';

      if (isTextContainerOutsideParent(circle) && !isMobile && !isTablet) {
        const textContainerWidth = textContainer ? parseFloat(getComputedStyle(textContainer)?.width) : 0;
        const textContainerMargin = textContainer ? parseFloat(getComputedStyle(textContainer)?.left) : 0;

        textContainer.style.left = `-${textContainerWidth + textContainerMargin}px`;
      }

      const newRect = circle.getBoundingClientRect();

      drawLines(circle, rect, newRect, containerRect, isMobile || isTablet);

      circle.classList.add('moved');
      textContainer.style.display = 'block';
    }
    // Add click event listener to each circle
    circles.forEach((circle) => {
      circle.addEventListener('click', function handleClick() {
        if (circle.classList.contains('moved')) {
          closeAllHotspots();
        } else {
          closeAllHotspots();
          expandHotspot(this);
        }

        // Activate the corresponding tab
        const allTabs = blockClone.querySelectorAll('.switch-list-item');
        allTabs.forEach((tab) => {
          if (tab.dataset.tab === circle.dataset.hotspot) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      });
    });

    // Add click event listener to each tab
    tabs.forEach((tab) => {
      tab.addEventListener('click', function handleTabClick() {
        const index = this.dataset.tab;

        closeAllHotspots();

        // Expand the corresponding hotspot
        const circle = blockClone.querySelector(`.circle[data-hotspot="${index}"]`);
        if (circle) {
          expandHotspot(circle);
        }

        // Activate the clicked tab
        this.classList.add('active');
      });
    });

    function expandBefaultHotspot() {
      setTimeout(() => {
        expandHotspot(circles[0]);
      }, 800);
    }

    // Close all hotspots on window resize
    window.addEventListener('resize', () => {
      closeAllHotspots();
      expandBefaultHotspot();
    });
    expandBefaultHotspot();
  }

  const hotspotsHTML = createHotspotsHTML(hotspotsEl);
  const hotspotTabs = createHotspotTabs(hotspotsEl);

  const id = idEl?.textContent?.trim() || null;

  const image = imageEl?.querySelector('picture');
  if (image) {
    const img = image.querySelector('img');
    const alt = image.querySelector('img').alt || 'Image Description';
    img.classList.add('hotspot-img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.setAttribute('alt', alt);
  }

  const subtitle = subtitleEl?.textContent?.trim() || '';
  if (titleEl) {
    titleEl.classList.add('title');
  }

  const newHTML = utility.sanitizeHtml(`
            <div class="safetyComponentItem">
            ${(titleEl || subtitle)
    ? `
               <div class="text-section">
                  ${titleEl ? titleEl.outerHTML : ''}
                  ${subtitle ? ` <div class="description"><p>${subtitle}</p></div>` : ''} 
              </div>
              ` : ''}
             
              ${(hotspotTabs || image || hotspotsHTML) ? `
                <div class="hotspots-wrapper">
                ${hotspotTabs || ''} 
                <div class="hotspots">
                  ${image ? image.outerHTML : ''}
                  ${hotspotsHTML || ''}
                </div>
              </div>
                ` : ''}
            </div>    
          `);

  block.innerHTML = utility.sanitizeHtml(`${newHTML ? `<div class="safetyComponentItems-container">${newHTML}</div>` : ''}`);

  initializeArrows(block);
  initializeHotspotExpansion(block);

  if (id) {
    block.setAttribute('id', id);
  }

  return block;
}
