export default async function decorate(block) {
  const [carsImg, headingTitle, description, buttonLabel, targetedPath] = [
    ...block.children,
  ].map((d) => {
    if (d.querySelector('picture')) {
      return d.querySelector('picture');
    }
    return d.textContent.trim();
  });
  block.innerHTML = `<div class="compare-cars-header g-container block-margin align-item">
            <div class='g-row'>
              <div class=" g-lg-5 g-md-3 image-wrapper">
                    ${carsImg.outerHTML}
              </div>
              <div class="g-lg-7 g-md-5 d-flex">
                <div class="text-wrapper">
                    <div class="content">
                      <h2 class="text-lg-2 font-weight-500">${headingTitle}</h2>
                      <p class="font-weight-400">${description}</p>
                    </div>
                </div>
                <div class="redirect-anchor d-flex">
                  <a href='${targetedPath}'>${buttonLabel}</a>
                  <span class="anchor-icon"></span>
                </div>
              </div> 
            </div>
    </div>`;

  function mutationObserver({ elementSelector = '', onMutationCallback = null }) {
    const targetNode = document.querySelector(elementSelector);
    // Callback function to execute when mutations are observed
    const configOptions = { attributes: true, attributeFilter: ['data-block-status'] };
    const callback = (mutationList, observer) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'data-block-status') {
            if (onMutationCallback) {
              onMutationCallback(mutation);
              observer.disconnect();
            }
          }
        }
      });
    };
      // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, configOptions);
  }

  mutationObserver({
    elementSelector: 'div.header',
    onMutationCallback: () => {
      const navElement = document.querySelector('.nav-link.compare');
      const anchorEle = document.createElement('li');
      anchorEle.classList.add('nav-link', 'compare');
      anchorEle.innerHTML = `<a href='${targetedPath}'> ${navElement.innerHTML} </a>`;
      navElement.replaceWith(anchorEle);
      const navPanel = anchorEle.nextElementSibling;
      if (!navPanel.classList.contains('desktop-panel')) {
        navPanel.remove();
      }
    },
  });
}
