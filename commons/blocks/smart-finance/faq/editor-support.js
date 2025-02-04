function openFaq(element) {
  const details = element?.closest('details');
  if (details) {
    details.parentElement.querySelectorAll('details').forEach((el) => {
      el.open = false;
    });
    details.open = true;
  }
}

export function getState(block) {
  // return the data-aue-resource for the first open FAQ
  return block.querySelector('details[open]')?.dataset.aueResource;
}

export function setState(block, state) {
  if (state) {
    openFaq(block.querySelector(`details[data-aue-resource="${state}"]`));
  }
}

export function handleSelection(element) {
  openFaq(element);
}
