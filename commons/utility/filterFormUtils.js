function addTableHeading(columnName) {
  return (columnName ? `<th>${columnName}</th>` : '');
}
const filterForm = {

  getNewFinance(placeholders) {
    let html = '';
    html += addTableHeading(placeholders.serialNum);
    html += addTableHeading(placeholders.dmsEnquiry);
    html += addTableHeading(placeholders.userName);
    html += addTableHeading(placeholders.phoneNum);
    html += addTableHeading(placeholders.model);
    html += addTableHeading(placeholders.variant);
    html += addTableHeading(placeholders.enquiryCreationDate);
    html += addTableHeading(placeholders.createdBy);
    html += addTableHeading(placeholders.stat);
    html += addTableHeading(placeholders.referenceId);
    html += addTableHeading(placeholders.action);
    return html;
  },
  getCustomerRequestHeader(placeholders) {
    let html = '';
    html += addTableHeading(placeholders.serialNum);
    html += addTableHeading(placeholders.dmsEnquiry);
    html += addTableHeading(placeholders.userName);
    html += addTableHeading(placeholders.phoneNum);
    html += addTableHeading(placeholders.model);
    html += addTableHeading(placeholders.variant);
    html += addTableHeading(placeholders.stat);
    html += addTableHeading(placeholders.action);
    return html;
  },
  getArchivedDisbursedLoansHeader(placeholders) {
    let html = '';
    html += addTableHeading(placeholders.serialNum);
    html += addTableHeading(placeholders.dmsEnquiry);
    html += addTableHeading(placeholders.userName);
    html += addTableHeading(placeholders.phoneNum);
    html += addTableHeading(placeholders.model);
    html += addTableHeading(placeholders.variant);
    html += addTableHeading(placeholders.enquiryCreationDate);
    html += addTableHeading(placeholders.fiReference);
    html += addTableHeading(placeholders.action);
    return html;
  },

  getNewFinanceData(item, index, startIndex, placeholders) {
    const row = document.createElement('tr');
    row.setAttribute('row-index', startIndex + index);
    row.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${item.dms_enquiry_id}</td>
          <td>${item.customer_name}</td>
          <td>${item.mobile}</td>
          <td>${item.model_desc}</td>
          <td>${item.variant_desc}</td>
          <td>${item.created_date}</td>
          <td>${item.created_by}</td>
          <td>${item.enq_status}</td>
          <td>${item.reference_id}</td>
          ${placeholders.launchFinance ? `<td><button type="button" class="btn btn-dealer btn--primary-solid launch_deal_btn_new_finance">${placeholders.launchFinance}</button></td>` : ''}
        `;
    return row;
  },

  getCustomerRequestData(item, index, startIndex, placeholders) {
    const row = document.createElement('tr');
    row.setAttribute('row-index', startIndex + index);
    row.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${item.dms_enquiry_id}</td>
          <td>${item.customer_name}</td>
          <td>${item.mobile}</td>
          <td>${item.model_desc}</td>
          <td>${item.variant_desc}</td>
          <td>${item.enq_status}</td>
          ${placeholders.viewForm && placeholders.uploadDocument ? `<td><div class="btn-wrapper"><button type="button" class="btn btn-dealer btn-dealer-white">${placeholders.viewForm}</button>
            <button type="button" class="btn btn-dealer btn--primary-solid launch_deal_btn upload_doc">${placeholders.uploadDocument}</button></div></td>` : ''}
        `;
    return row;
  },
  getTrackFinanceData(item, index, startIndex, placeholders) {
    const row = document.createElement('tr');
    row.setAttribute('row-index', startIndex + index);
    row.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${item.dms_enquiry_id}</td>
          <td>${item.customer_name}</td>
          <td>${item.mobile}</td>
          <td>${item.model_desc}</td>
          <td>${item.variant_desc}</td>
          <td>${item.created_date}</td>
          <td>${item.created_by}</td>
          <td>${item.enq_status}</td>
          <td>${item.reference_id}</td>
          ${placeholders.trackStatus ? `<td><button type="button" class="btn btn-dealer btn--primary-solid launch_deal_btn">${placeholders.trackStatus}</button></td>` : ''}
        `;
    return row;
  },

  getClarificationData(item, index, startIndex, placeholders) {
    const row = document.createElement('tr');
    row.setAttribute('row-index', startIndex + index);
    row.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${item.dms_enquiry_id}</td>
          <td>${item.customer_name}</td>
          <td>${item.mobile}</td>
          <td>${item.model_desc}</td>
          <td>${item.variant_desc}</td>
          <td>${item.created_date}</td>
          <td>${item.created_by}</td>
          <td>${item.enq_status}</td>
          <td>${item.reference_id}</td>
          ${placeholders.resolve ? `<td><button type="button" class="btn btn-dealer btn--primary-solid launch_deal_btn">${placeholders.resolve}</button></td>` : ''}
        `;
    return row;
  },

  getArchivedDisbursedLoansData(item, index, startIndex, placeholders) {
    const row = document.createElement('tr');
    row.setAttribute('row-index', startIndex + index);
    row.innerHTML = `
        <td>${startIndex + index + 1}</td>
        <td>${item.dms_lead_id}</td>
        <td>${item.customer_name}</td>
        <td>${item.mobile}</td>
        <td>${item.model}</td>
        <td>${item.variant}</td>
        <td>${item.creation_date}</td>
        <td>${item.loan_application_id}</td>
        ${placeholders.raiseMr ? `<td><button type="button" class="btn btn-dealer btn--primary-solid launch_deal_btn">${placeholders.raiseMr}</button></td>` : ''}
      `;
    return row;
  },

};

export default filterForm;
