const toggleClass = async (elSelector, className) => {
  const element = document.querySelector(elSelector);

  // Check if the element exists
  if (element) {
    element.classList.toggle(className); // Toggle the class
  }
};

const trimTextForMobile = (originalText, trimNumber) => {
  const isMobile = window.innerWidth <= 768;
  return isMobile ? originalText.slice(0, trimNumber) : originalText;
};

const createTooltip = () => {
  // Check if tooltip already exists in the body
  let tooltip = document.querySelector('.custom-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.classList.add('custom-tooltip');
    document.body.appendChild(tooltip);
  }

  const tooltipTargets = document.querySelectorAll('.tooltip-target');
  tooltipTargets.forEach((target) => {
    // Check if listeners are already attached
    if (!target._listenersAttached) {
      // Show tooltip on mouseenter tooltip-no-target
      target.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('tooltip-no-target')) {
          return;
        }
        const tooltipText = target.getAttribute('tooltip-target');
        tooltip.textContent = tooltipText;
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-75px) translateX(-40px)';
      });

      // Update tooltip position on mousemove
      target.addEventListener('mousemove', (event) => {
        if (event.target.classList.contains('tooltip-no-target')) {
          return;
        }
        const offset = 10; // Offset for positioning
        tooltip.style.left = `${event.pageX + offset}px`;
        tooltip.style.top = `${event.pageY + offset}px`;
      });

      // Hide tooltip on mouseleave
      target.addEventListener('mouseleave', (e) => {
        if (e.target.classList.contains('tooltip-no-target')) {
          return;
        }
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-5px)';
      });

      // Mark listeners as attached
      target._listenersAttached = true;
    }
  });
};

export default {
  toggleClass,
  trimTextForMobile,
  createTooltip,
};
