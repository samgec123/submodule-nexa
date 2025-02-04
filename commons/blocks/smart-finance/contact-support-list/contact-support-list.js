import utility from '../../../utility/utility.js';

export default async function decorate(block) {
  const [mainDiv, ...childDiv] = block.children;

  // Extract values from mainDiv
  const [titleEl, pretitleEl, backButtonEl, homeButtonEl] = mainDiv.children[0]?.children || [];
  const supportTitle = titleEl?.textContent?.trim() || '';
  const supportPreTitle = pretitleEl?.textContent?.trim() || '';
  const supportBackButton = backButtonEl?.textContent?.trim() || '';
  const supportHomeButton = homeButtonEl?.textContent?.trim() || '';

  // Assuming childDiv contains all the parent divs
  if (childDiv.length > 0) {
    // Array to store all titles and descriptions
    const extractedData = [];

    // Iterate over each parent div
    childDiv.forEach((parentDiv) => {
      const childNodes = Array.from(parentDiv.childNodes);

      // Extract Description Node
      const descriptionNode = childNodes.find((node) => node.nodeName === 'DIV' && node.textContent.trim());

      if (descriptionNode) {
        // Extract Title: First <p> tag inside the descriptionNode
        const titleNode = descriptionNode.querySelector('p');
        const titleValue = titleNode?.textContent.trim() || '';

        // Extract Description: All <li> tags inside the <ul> within the descriptionNode
        const descriptionItems = descriptionNode.querySelectorAll('ul > li');
        const description = Array.from(descriptionItems).map(
          (li) => `<li>${li.textContent.trim()}</li>`,
        ).join('');

        // Store the extracted title and description
        extractedData.push({ titleValue, description });
      }
    });

    // Construct HTML structure
    let contactSupportHTML = `
            <div class="container">
                <ul class="cd_breadcrumb">
                    <li>
                        <a href="${supportHomeButton}">
                            <div class="home-icon"></div>
                        </a>
                    </li>
                    <li>
                        <a href="${supportBackButton}" class="back-icon">
                            Back
                        </a>
                    </li>
                </ul>
                <div class="grey-bg pt-3">
                    <div class="financer-header">
                        <h2 class="financer-header--title deale_mapping_title">${supportTitle}</h2>
                    </div>
                    <div class="contact-support-container">
                        <ul class="custom-list">
                            <li>${supportPreTitle}</li>
                        </ul>                      
        `;
    // Append dynamically generated content for each title and description
    extractedData.forEach(({ titleValue, description }) => {
      contactSupportHTML += `
            <div class="contact-support-wrapper">
                <div class="mb-4">
                    <p>${titleValue}</p>
                    <ul class="contact-support-items-list">
                        ${description}
                    </ul>
                </div>
            </div>    
            `;
    });

    // Close the wrapper div
    contactSupportHTML += `                    
                </div>
            </div>
        </div>
    `;

    // Inject sanitized HTML
    block.innerHTML = utility.sanitizeHtml(contactSupportHTML);
  }
}
