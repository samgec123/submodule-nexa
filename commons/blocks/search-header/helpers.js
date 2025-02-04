export function handleMobileSearch() {
  const mobMenuElement = document.querySelector('header .menu-list');
  const menuItemSearch = mobMenuElement.querySelector('.search');
  const panelSearch = mobMenuElement.querySelector('.search + .panel');
  if (menuItemSearch && panelSearch && !panelSearch.dataset.eventAttached) {
    panelSearch.dataset.eventAttached = 'attached';
    menuItemSearch.classList.remove('accordion', 'nav-link');

    // update popup title from the menu item clicked by user
    const popupTitle = mobMenuElement.querySelector('.menu-title')?.textContent || '';
    panelSearch.querySelector('.menu-title').innerHTML = popupTitle;

    menuItemSearch.addEventListener('click', (event) => {
      // Toggle the 'mob-popupsearch' class and panel visibility.
      // Using inline-styles to override header code inline styles
      document.querySelector('header')?.classList.toggle('lift-up');
      document.documentElement.classList.toggle('no-scroll');
      if (panelSearch.style.display === 'block') {
        panelSearch.style.display = 'none';
        panelSearch.classList.remove('mob-popupsearch');
        panelSearch.style.maxHeight = null;
      } else {
        panelSearch.style.display = 'block';
        panelSearch.classList.add('mob-popupsearch');
        panelSearch.style.maxHeight = '100vh';
        // Add click event listener to the menu item
      }
      event.stopPropagation();
    });

    // Add event listener for the close icon inside the search panel
    panelSearch.querySelector('.close-icon').addEventListener('click', (event) => {
      panelSearch.style.display = 'none';
      panelSearch.classList.remove('mob-popupsearch');
      panelSearch.style.maxHeight = null;
      menuItemSearch.focus();
      // Stop the event from propagating (so that the document click listener is not triggered)
      event.stopPropagation();
    });
  }
}

export function mutationObserver({ elementSelector = '', onMutationCallback = null }) {
  let found = false;
  const targetNode = document.querySelector(elementSelector);
  // Callback function to execute when mutations are observed
  const configOptions = { subtree: true, childList: true };
  const callback = (mutationList, observer) => {
    mutationList.forEach((mutation) => {
      const check = mutation && mutation.target
        && mutation.target.classList.contains('menu-list')
        && [...mutation.addedNodes].some((an) => an.classList.contains('search'));
      if (mutation.type === 'childList' && check && !found) {
        found = true;
        observer.disconnect();
        if (onMutationCallback) {
          onMutationCallback(mutation);
        }
      }
    });
  };
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, configOptions);
}

export default { handleMobileSearch };
