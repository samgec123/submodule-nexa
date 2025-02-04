import utility from '../../utility/utility.js';

export default async function decorate(block) {
  const [sectionHeading, tollFreeLabel, tollFreeIcon, tollFreeNumber1, tollFreeNumber2, emailLabel, emailIcon, emailId, whatsappLabel, whatsappIcon, whatsappNumber] = block.children;

  block.innerHTML = utility.sanitizeHtml(`
    <section class="quick-connect-module-wrapper">
        <div class="quick-connect-module-container">
            <div class="quick-connect-module-col quick-connect-module-left-col">
                <h3>${sectionHeading?.textContent?.trim() || ''}</h3>
            </div>
            <div class="quick-connect-module-col quick-connect-module-right-col">
                <ul>
                    <li>
                        <h4>${tollFreeLabel?.textContent?.trim() || ''}</h4>
                        <p>
                            <span>
                                <img src=${tollFreeIcon?.querySelector('img')?.src || ''}>
                                ${tollFreeNumber1?.textContent?.trim() || ''}
                            </span>
                            <span>
                                <img src=${tollFreeIcon?.querySelector('img')?.src || ''}>
                                ${tollFreeNumber2?.textContent?.trim() || ''}
                            </span>
                        </p>
                    </li>
                    <li>
                        <h4>${emailLabel?.textContent?.trim() || ''}</h4>
                        <p>
                            <span>
                                <img src=${emailIcon?.querySelector('img')?.src || ''}>
                                ${emailId?.textContent?.trim() || ''}
                            </span>
                        </p>
                    </li>
                    <li>
                        <h4>${whatsappLabel?.textContent?.trim() || ''}</h4>
                        <p>
                            <span>
                                <img src=${whatsappIcon?.querySelector('img')?.src || ''}>
                                ${whatsappNumber?.textContent?.trim() || ''}
                            </span>
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </section>
  `);

  return block;
}
