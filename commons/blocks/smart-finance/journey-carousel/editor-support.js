export default function handleSelection(element, isSelected) {
  const block = element.parentElement?.closest('.block') || element?.closest('.block');
  // check if it is a carousel view
  if (block && block.querySelector('.arrow-div').style.display === 'block' && isSelected) {
    const jcitemDetails = Array.from(block.querySelectorAll('.jc-item-details>div'));
    let currentIndex = jcitemDetails.indexOf(element);
    if (currentIndex === jcitemDetails.length - 1) {
      currentIndex = jcitemDetails.length - 2;
    }
    const itemWidth = jcitemDetails[0]?.offsetWidth || 0;
    const jcItems = block.querySelector('.jc-items');
    jcItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }
}
