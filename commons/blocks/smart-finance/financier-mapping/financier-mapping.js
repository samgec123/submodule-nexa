import utility from '../../../utility/utility.js';

function getStatusClass(value) {
  if (value === 'Yes') return 'success';
  if (value === 'Not Live') return 'warning';
  if (value === 'No') return 'danger';
  return '';
}

async function getFinancierMapping(formsff) {
  const mspinToken = sessionStorage.getItem('mspin_token');
  const dealerId = sessionStorage.getItem('dealer_id');

  const activeDetailResponse = await fetch(`${formsff.apiDomain}/app-service/api/v1/financier-journey-mapping/${dealerId}`, {
    method: 'POST',
    headers: {
      'x-dealer-Authorization': mspinToken,
      'Content-Type': 'application/json',
    },
  });
  return activeDetailResponse;
}

function createTable(financier, preApprovedValues, custom, seWipValues) {
  const tableBody = document.querySelector('.dealer_mapping_list');

  financier.forEach((fin, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
              <td>${index + 1}</td>
              <td>${fin}</td>
              <td class="${getStatusClass(preApprovedValues[index])}">${preApprovedValues[index]}</td>
              <td class="${getStatusClass(custom[index])}">${custom[index]}</td>
              <td class="${getStatusClass(seWipValues[index])}">${seWipValues[index]}</td>
          `;
    tableBody.appendChild(row);
  });
}

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const formsff = await utility.fetchFormSf('placeholders-sf.json', 'default');
  const [
    yesTitleEl,
    yesTestEl,
    noTitleEl,
    noTextEl,
    liveTitleEl,
    liveTextEl,
    sNoEl,
    financierEl,
    preApprovedEl,
    customEl,
    selfEmployeEl,
    journeyTitleEl,
    homeTitleEl,
    backTitleE1,
  ] = innerDiv.children;

  const finYesTitle = yesTitleEl?.textContent?.trim() || '';
  const finYesText = yesTestEl?.textContent?.trim() || '';
  const finNoTitle = noTitleEl?.textContent?.trim() || '';
  const finNoText = noTextEl?.textContent?.trim() || '';
  const finLiveTitle = liveTitleEl?.textContent?.trim() || '';
  const finLiveText = liveTextEl?.textContent?.trim() || '';
  const finSno = sNoEl?.textContent?.trim() || '';
  const finFinancier = financierEl?.textContent?.trim() || '';
  const finPreApproved = preApprovedEl?.textContent?.trim() || '';
  const finCustom = customEl?.textContent?.trim() || '';
  const finSelfEmploye = selfEmployeEl?.textContent?.trim() || '';
  const finJourney = journeyTitleEl?.textContent?.trim() || '';
  const finHome = homeTitleEl?.textContent?.trim() || '';
  const finBack = backTitleE1?.textContent?.trim() || '';

  const activeDetailResponse = await getFinancierMapping(formsff);

  if(activeDetailResponse.ok){
  const activeDetailData = await activeDetailResponse.json();
  const dealer = activeDetailData.dealer;
  const financier = activeDetailData.mapping.map((item) => item.financier_name);
  const preApprovedValues = activeDetailData.mapping.map((item) => item.journey.pre_approved);
  const custom = activeDetailData.mapping.map((item) => item.journey.custom);
  const seWipValues = activeDetailData.mapping.map((item) => item.journey['SE-WIP']);

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(`
  <div class="container">
        <ul class="cd_breadcrumb">
            <li>
                <a href=${finHome}>
                    <div class="home-icon"></div>
                </a>
            </li>
            <li>
                <a href=${finBack} class="back-icon">
                    Back
                </a>
            </li>
        </ul>
        <div class="grey-bg pt-3">
            <div class="financer-header">
                <h2 class="financer-header--title deale_mapping_title">${dealer.outlet_name}</h2>
                <ul class="list-unstyled financer-header__list deale_mapping_head">
                  <li class="financer-header__list-item">Channel:<span class="financer-header--sub-title">${dealer.channel}</span></li>
                  <li class="financer-header__list-item">Zone:<span class="financer-header--sub-title">${dealer.zone}</span></li>
                  <li class="financer-header__list-item">Region:<span class="financer-header--sub-title">${dealer.region}</span></li>
                  <li class="financer-header__list-item">Outlet code:<span class="financer-header--sub-title">${dealer.outlet_code}</span></li>
                  <li class="financer-header__list-item">City:<span class="financer-header--sub-title">${dealer.city}</span></li></ul>
                <ul class="list-unstyled financer-mapping">
                    <li class="financer-mapping__list">
                        <span class="financer-mapping__list--item financer-mapping__list--item-success">${finYesTitle}</span>
                        : ${finYesText}
                    </li>
                    <li class="financer-mapping__list">
                        <span class="financer-mapping__list--item financer-mapping__list--item-danger">${finNoTitle}</span>
                        : ${finNoText}
                    </li>
                    <li class="financer-mapping__list">
                        <span class="financer-mapping__list--item financer-mapping__list--item-warning">${finLiveTitle}</span>
                        : ${finLiveText}
                    </li>
                </ul>
            </div>
            <div class="journey-type">
                <hr class="journey-type__hr">
                <span class="journey-type__text">${finJourney}</span>
            </div>
            <div class="table-scrolly">
                <table class="w-100 table-financer">
                    <caption></caption>
                    <thead>
                        <tr>
                            <th style="width: 114px;">${finSno}</th>
                            <th style="width: 291px;">${finFinancier}</th>
                            <th style="width: 190px;">${finPreApproved}</th>
                            <th style="width: 190px;">${finCustom}</th>
                            <th style="width: 190px;">${finSelfEmploye}</th>
                        </tr>
                    </thead>
                    <tbody class="dealer_mapping_list">
                    
                    </tbody>
                </table>
            </div>
        </div>
    </div>`));
  createTable(financier, preApprovedValues, custom, seWipValues);
  }
}


