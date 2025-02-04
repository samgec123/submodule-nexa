import utility from '../../utility/utility.js';
import commonApiUtils from '../../commons/utility/apiUtils.js';
import authUtils from '../../commons/utility/authUtils.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const [sectionHeading, testDrivesTitle] = block.children;

  block.classList.add('separator', 'separator-light', 'separator-sm');

  // Initial HTML structure
  block.innerHTML = utility.sanitizeHtml(`
    <section class="section custom-quick-activity-module-wrapper">
      <div class="custom-quick-activity-module-container">
        <div class="custom-quick-activity-module-col custom-quick-activity-module-left-col">
          <h3>${sectionHeading?.textContent?.trim() || ''}</h3>
        </div>
        <div class="custom-quick-activity-module-col custom-quick-activity-module-right-col">
          <ul>
            <li>
              <h4 class="test-drive-count">0</h4>
              <p>${testDrivesTitle?.textContent?.trim() || ''}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  `);

  const { channelId } = await fetchPlaceholders();

  // Function to fetch and update test drive count
  const updateTestDriveCount = async (profile) => {
    try {
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 14);
      const toDateFormatted = toDate.toISOString().split('T')[0];

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 14);
      const pastDateFormatted = pastDate.toISOString().split('T')[0];

      // API call to fetch test drive details
      const response = await commonApiUtils.getTestDriveDetails(
        '8435771435' || profile?.number, // Use profile data if available
        pastDateFormatted,
        toDateFormatted,
        channelId,
      );

      // Filter test drive status
      const testDriveStatus = response?.filter(
        (item) => Object.keys(item).includes('testDriveStatusDescription'),
      ) || [];

      // Update the dynamic count in the DOM
      const countElement = block.querySelector('.test-drive-count');
      if (countElement) {
        countElement.textContent = testDriveStatus.length || 0;
      }

      return testDriveStatus;
    } catch (error) {
      console.error('Error fetching test drive details:', error);
      return [];
    }
  };

  const init = async (profile) => {
    await updateTestDriveCount(profile);
  };

  // Wait for authentication and initialize
  authUtils.waitForAuth().then(async () => {
    try {
      const profile = await authUtils.getProfile();
      if (profile) {
        await init(profile);
      } else {
        console.warn('No profile found.');
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  });

  return block;
}
