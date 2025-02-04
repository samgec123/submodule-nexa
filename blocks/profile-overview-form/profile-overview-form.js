import utility from "../../utility/utility.js";
import mockData from "./profile-overview-form-mock.js";
import apiUtils from "../../commons/utility/apiUtils.js";

export default async function decorate(block) {
  if (!block || !block.children || block.children.length < 5) {
    return;
  }

  block.classList.add('separator', 'separator-grey', 'separator-sm');

  const firstTitle = block.children[0]?.children[0];
  const aboutText = firstTitle?.querySelector("p")?.textContent.trim();
  const secondTitle = block.children[1]?.children[0];
  const addressText = secondTitle?.querySelector("p")?.textContent.trim();
  const thirdTitle = block.children[2]?.children[0];
  const eventText = thirdTitle?.querySelector("p")?.textContent.trim();

  let fields;
  const response = await apiUtils.fetchCustomerData();
  fields = response.data[0].customer;

  const htmlLiteral = `
    <div class="profile-form-overview-block">
        <form class="profile-form-overview-container" method="post" action="/save">

            <!-- About You Section -->
            <div class="profile-form-overview-section">
            <div class="profile-form-overview-section-header">
                <p><span>1/3</span> ${aboutText}</p>
            </div>
            <div class="field-group">
                <input type="text" name="name" value="${fields.title || ""} ${
    fields.customerName
  }">
                <input type="tel" name="phone" value="${fields.mobileNo || ""}">
                <input type="email" name="email" value="${
                  fields.emailId || ""
                }">
            </div>
            </div>

            <!-- Address Section -->
            <div class="profile-form-overview-section">
            <div class="profile-form-overview-section-header">
                <p><span>2/3</span>${addressText}</p>
            </div>
            <div class="field-group-for-two-col">
                <input type="text" name="address_line1" value="${
                  fields.residentialAddressSale.addressLine1 || ""
                }">
                <input type="text" name="state" value="${
                  fields.residentialAddressSale.cityDesc || ""
                }">
                <input type="text" name="address_line2" value="${
                  fields.residentialAddressSale.addressLine2 || ""
                }">
                <input type="text" name="city" value="${
                  fields.residentialAddressSale.districtName || ""
                }">
                <input type="text" name="landmark" value="${
                  fields.residentialAddressSale.addressLine3 || ""
                }">
                <input type="text" name="postal_code" value="${
                  fields.residentialAddressSale.pinCode || ""
                }">
            </div>
            </div>

            <!-- Events Section -->
            <div class="profile-form-overview-section no-margin-bottom">
            <div class="profile-form-overview-section-header">
                <p><span>3/3</span>${eventText}</p>
            </div>
            <div class="field-group-for-two-col">
                <input type="text" name="dob" value="${
                  fields.dateOfBirth || ""
                }">
                <input type="text" name="event" value="${
                  fields.dateOfAnniversary || ""
                }">
            </div>
            </div>
        </form>
    </div>
`;

  block.innerHTML = utility.sanitizeHtml(htmlLiteral);
}
