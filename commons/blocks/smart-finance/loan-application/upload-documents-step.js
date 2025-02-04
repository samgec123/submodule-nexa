/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext } from './multi-step-form.js';
import utility from '../../../utility/utility.js';
import { getDocsByEmpType, uploadDocument, collateDocument, fetchOCRStatus } from '../../../utility/smart-finance/sfLoanApplicationUtils.js';

function UploadDocuments({ config }) {
  const { uploadLabel,
    userLabel,
    dealerLabel, dealerJourney } = config;
  const { handleSetActiveRoute,
    saveDraftRequestBody, bankResponse } = useContext(MultiStepFormContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isIdPopupVisible, setIsIdPopupVisible] = useState(false);
  const [isIncomePopupVisible, setIsIncomePopupVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Track popup visibility
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isDealerUpload, setIsDealerUpload] = useState(false);
  const [isDocumentUploadPopupVisible, setIsDocumentUploadPopupVisible] = useState(false);
  const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);
  const [isValidationPopupVisible, setIsValidationPopupVisible] = useState(false);
  const [formDataa, setFormData] = useState(null);
  const [showRadioSection, setShowRadioSection] = useState(dealerJourney.props.children[0] === 'customer');
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);
  const [errorPopupText, setErrorPopupText] = useState('');
  const [ocrErrorPopupText, setOcrErrorPopupText] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Update the visibility of the .docRadioBtn section based on dealerJourney
    setShowRadioSection(dealerJourney.props.children[0] === 'customer');
  }, [dealerJourney]);

  if (isLoading) {
    return 'Loading...';
  }

  let docIdPOA;
  let subDocId;

  // Helper functions to set values and log them
  const setDocIdPOA = (value) => {
    docIdPOA = value;
  };

  const setSubDocId = (value) => {
    subDocId = value;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxSizeMB = 5 * 1024 * 1024; // 5 MB in bytes

    if (file) {
      if (file.size > maxSizeMB) {
        setShowPopup(true);
        return;
      }

      // Fetch the selected radio button
      const selectedRadioButton = document.querySelector('input[name="ID_proof"]:checked');
      if (selectedRadioButton) {
        (async () => {
          try {
            const response = await getDocsByEmpType(
              saveDraftRequestBody.financier_id,
              saveDraftRequestBody.employment_type,
              saveDraftRequestBody.sub_employment_type,
              saveDraftRequestBody.residence_type,
            );
            if (response.success && response.data) {
              const proofType = selectedRadioButton.parentElement.textContent.trim();
              const docTypeList = response.data.doc_type_list;

              Object.keys(docTypeList).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(docTypeList, key)) {
                  const docList = docTypeList[key];
                  const matchedDoc = docList.find((doc) => doc.name === proofType);

                  if (matchedDoc) {
                    const subDocCount = matchedDoc.sub_doc_count;
                    if (subDocCount > 0) {
                      subDocId = response.data.sub_doc_type_list[subDocCount - 1];
                      setSubDocId(subDocId);
                      sessionStorage.setItem('subDocId', subDocId);
                    }

                    if (key === 'POA') {
                      docIdPOA = matchedDoc.id;
                      setDocIdPOA(docIdPOA);
                      sessionStorage.setItem('docIdPOA', docIdPOA);
                    }
                  }
                }
              });

              // Create constants to store values when making the API call
              const finalDocIdPOA = docIdPOA; // Get the latest value of docIdPOA
              const finalSubDocId = subDocId; // Get the latest value of subDocId

              // Create form data with final values
              const formDataApi = new FormData();
              formDataApi.append('file', file);
              formDataApi.append('doc_type_id', finalDocIdPOA); // Use the final value
              formDataApi.append('enquiry_id', saveDraftRequestBody.enquiry_id);
              formDataApi.append('sub_doc_type_id', finalSubDocId); // Use the final value
              formDataApi.append('employment_type_id', saveDraftRequestBody.employment_type);
              formDataApi.append('subemployment_type_id', saveDraftRequestBody.sub_employment_type);
              formDataApi.append('applicant_id', bankResponse.loanId);
              formDataApi.append('customer_type', '480001');
              formDataApi.append('financierId', saveDraftRequestBody.financier_id);
              formDataApi.append('X-channel', `${formDataa?.sfChannelId}`);

              try {
                const responseData = await uploadDocument(formDataApi);

                if (responseData.success) {
                  return {
                    success: true,
                    message: responseData.data.message,
                    enquiryId: responseData.data.enquiry_id,
                  };
                }
                setErrorPopupVisible(true);
                setErrorPopupText(responseData.message);
              } catch (error) {
                setErrorPopupText('Something went wrong. Please try later.');
              }
            }
          } catch (error) {
            return { success: false, message: '', error };
          }
          return { success: false, message: '' };
        })();
      } else {
        // nothing
      }

      setSelectedFile(file);

      const formData = new FormData();
      formData.append('file', file);

      if (file.type === 'application/pdf') {
        const mockApiResponse = {
          ocr_doc_id: '646b3f08d0bf05000aeb3bc9',
          ocr_status: 'No Document exists with this OCR ID',
          proof_type_id: null,
          message: null,
        };
        setOcrStatus(mockApiResponse.ocr_status);
      }

      setIsFileUploaded(true);
    }
  };

  const handleUploadProceedClick = () => {
    // Retrieve the stored values for docIdPOA and subDocId
    const docIdPOAData = sessionStorage.getItem('docIdPOA') || ''; // Get docIdPOA from sessionStorage
    const subDocIdData = sessionStorage.getItem('subDocId') || ''; // Get subDocId from sessionStorage

    if (isFileUploaded && ocrStatus) {
      // upload form-data
      const formData = new FormData();
      formData.append('doc_type_id', docIdPOAData);
      formData.append('enquiry_id', saveDraftRequestBody.enquiry_id);
      formData.append('sub_doc_type_id', subDocIdData);
      formData.append('file', new File([''], ''));
      formData.append('employment_type_id', saveDraftRequestBody.employment_type);
      formData.append('subemployment_type_id', saveDraftRequestBody.sub_employment_type);
      formData.append('applicant_id', bankResponse.loanId);
      formData.append('customer_type', '480001');
      formData.append('X-channel', `${formDataa?.sfChannelId}`);

      // collate form-data
      const formDataCollate = new FormData();
      formDataCollate.append('enquiry_id', saveDraftRequestBody.enquiry_id);
      formDataCollate.append('doc_type_id', docIdPOAData);
      formDataCollate.append('is_document_reupload', 'Y');
      formDataCollate.append('applicant_id', bankResponse.loanId);
      formDataCollate.append('customer_type', '480001');
      formDataCollate.append('is_ocr_enable', 'Y');

      setIsDocumentUploadPopupVisible(true);
    } else if (isFileUploaded && !ocrStatus) {
      setIsSuccessPopupVisible(true);
    } else {
      setIsValidationPopupVisible(true);
    }
  };

  const getIconClass = () => {
    if (isFileUploaded && ocrStatus) {
      return 'cross-error';
    }
    if (isFileUploaded && !ocrStatus) {
      return 'big-tick';
    }
    return 'plus';
  };

  const closeProceedPopup = () => {
    setIsDocumentUploadPopupVisible(false);
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupVisible(false);
  };

  const closeValidationPopup = () => {
    setIsValidationPopupVisible(false);
  };

  const triggerFileInput = (event) => {
    event.preventDefault();
    document.getElementById('file_input').click();
  };

  const showPopupp = (event) => {
    event.preventDefault();
    setIsPopupVisible(true);
  };

  const closePopup = async (event) => {
    event.preventDefault();

    // Close the popup
    setIsPopupVisible(false);

    // Prepare the formData for the collateDocument API
    const docIdPoaValue = sessionStorage.getItem('docIdPOA');

    const formData = new FormData();
    formData.append('enquiry_id', saveDraftRequestBody.enquiry_id);
    formData.append('doc_type_id', docIdPoaValue);
    formData.append('is_document_reupload', 'Y');
    formData.append('applicant_id', bankResponse.loanId);
    formData.append('customer_type', '480001');
    formData.append('is_ocr_enable', 'Y');

    try {
      // Call the collateDocument API
      const response = await collateDocument(formData);

      if (response.success) {
        // Extract the OCR document ID from the response
        const ocrDocId = response.data?.ocr_result?.ocr_id;

        if (ocrDocId) {
          // Fetch OCR status using the ocrDocId
          const ocrResponse = await fetchOCRStatus(ocrDocId);

          if (ocrResponse.success) {
            const ocrStatusApi = ocrResponse.data.ocr_status;
            setOcrErrorPopupText(ocrStatusApi);
          }
          return { success: false, message: ocrResponse.message };
        }
        return { success: false, message: '' };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: '', error };
    }
  };

  const handleFileDelete = (event) => {
    event.preventDefault();
    setSelectedFile(null);
    setIsFileUploaded(false);
    setOcrStatus('');
    setOcrErrorPopupText('');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const deleteFileElement = document.querySelector('.deletefile');
    if (deleteFileElement) {
      deleteFileElement.addEventListener('click', handleFileDelete);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (deleteFileElement) {
        deleteFileElement.removeEventListener('click', handleFileDelete);
      }
    };
  }, [isFileUploaded]);

  const showIdPopup = () => {
    setIsIdPopupVisible(true);
  };
  const showInputPopup = () => {
    setIsIncomePopupVisible(true);
  };

  const hideIdPopup = () => {
    setIsIdPopupVisible(false);
    setIsIncomePopupVisible(false);
  };

  const hideIncomePopup = () => {
    setIsIncomePopupVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const popup = document.getElementById('id-popup');
      const modalContent = popup.querySelector('.modal-content');
      if (popup && !modalContent.contains(event.target)) {
        // Hide popup if the click is outside
      }
    };

    if (isIdPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isIdPopupVisible]);

  async function fetchAndPopulateDocuments() {
    try {
      const DocResponse = await getDocsByEmpType(
        saveDraftRequestBody.financier_id,
        saveDraftRequestBody.employment_type,
        saveDraftRequestBody.sub_employment_type,
        saveDraftRequestBody.residence_type,
      );
      if (DocResponse.success) {
        const { data } = DocResponse;
        // Function to populate document names for a specific category
        const populateDocs = (docList, elementId) => {
          const docNames = docList.map((doc) => doc.name).join(', ');
          document.getElementById(elementId).textContent = docNames;
        };

        // Populate document names for each category
        populateDocs(data.doc_type_list.POA, 'poa-docs');
        populateDocs(data.doc_type_list.FORM_16, 'form16-docs');
        populateDocs(data.doc_type_list.POI, 'poi-docs');
        populateDocs(data.doc_type_list.PAN, 'pan-docs');
        populateDocs(data.doc_type_list.BANK_STATEMENT, 'bank-statement-docs');
      }
    } catch (error) {
      // do nothing
    }
  }
  fetchAndPopulateDocuments();

  const handleRadioChange = (event) => {
    const { value } = event.target;
    setIsDealerUpload(value === 'dealerUpload');
    if (value === 'dealerUpload') {
      console.log('Dealer Notification Api is not Available at this Moment!');
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      handleSetActiveRoute('address-details-step'); // Redirect to address-details-step.js
    } catch (error) {
      // do nothing
    }
  };

  const continueToProceed = async (e) => {
    e.preventDefault();
    try {
      handleSetActiveRoute('finalize-loan-step'); // Redirect to address-details-step.js
    } catch (error) {
      // do nothing
    }
  };

  // Example `kycDocument` for testing
  const kycDocument = '0'; // Adjust this for testing purposes

  // Determine visibility for documents
  const visibleDocuments = (() => {
    if (kycDocument === '0') {
      return [
        'dl',
        'voterId',
        'passport',
        'jobCard',
        'populationRegister',
        'aadharCard',
      ];
    }
    if (kycDocument === '420005') return ['dl'];
    if (kycDocument === '420008') return ['voterId'];
    if (kycDocument === '420007') return ['passport'];
    return [];
  })();

  return html`
    <section class="employerFormSec">
      <div class="container">
        <ul class="steps">
          <li class="active">
            <span>1</span>
            <div class="content">
              <div class="image">
                <div class="step-1"></div>
              </div>
              <div class="title">Application <br/> Details</div>
            </div>
          </li>
          <li class="active">
            <span>2</span>
            <div class="content">
              <div class="image">
                <div class="step-2"></div>
              </div>
              <div class="title">Address <br/> Details</div>
            </div>
          </li>
          <li class="active">
            <span>3</span>
            <div class="content">
              <div class="image">
                <div class="step-3"></div>
              </div>
              <div class="title">Upload <br/> Documents</div>
            </div>
          </li>
          <li>
            <span>4</span>
            <div class="content">
              <div class="image">
                <div class="step-4"></div>
              </div>
              <div class="title">Finalize <br/> Loan</div>
            </div>
          </li>
        </ul>
        <form action="" class="form_financeloan" id="form-loanapplication-hdb" novalidate="novalidate">
           <div class="employerFormBox" id="step3" style="display: block;">
               <div class="tab-content" id="myTabContent">
                  <div class="tab-pane fade show active" id="applicant-doc" role="tabpanel" aria-labelledby="applicant-tab">
                     <div class="uploadDocumentForm">
                        <h6>${uploadLabel}</h6>
                        ${showRadioSection && html`
                        <div class=" askdocUpload">
                          <div class="docRadioBtn">
                            <label class="customRadioBtn">
                               <input type="radio" value="userUpload"  checked=${!isDealerUpload}     name="role_user"tabindex="62"
                                 onChange=${handleRadioChange} class="radio-style"/>
                                 ${userLabel}
                            </label>
                            <label class="customRadioBtn">
                                <input type="radio" value="dealerUpload" name="role_user"
                                   tabindex="63"  checked=${isDealerUpload}
                                   onChange=${handleRadioChange} class="radio-style"/>
                                   ${dealerLabel}
                            </label>
                          </div>
                        </div>
                        `}
                        <ul>
                          <li class="id-pop ${getIconClass()}">
                            <span class="uploadDocumentForm-card is-upload">
                                <a href="javascript:;" id="id-btn"
                                  onClick=${showIdPopup}>${formDataa?.idProof}
                                </a>
                                <p id="poi-docs"></p>
                            </span>                          
                            <span class="c-error">
                              ${ocrErrorPopupText}
                            </span> 
                          </li>
                          <li class="address-pop active ${getIconClass()}">
                            <span class="uploadDocumentForm-card">
                              <a href="javascript:;" id="address-btn"
                                onClick=${showIdPopup}>${formDataa?.addressProof}
                              </a>
                              <p id="poa-docs"></p>
                            </span>                          
                            <span class="c-error">
                            ${ocrErrorPopupText}
                            </span>
                          </li>
                          <li class="income-pop ${getIconClass()}">
                            <span class="uploadDocumentForm-card">
                               <a href="javascript:;" id="income-btn"
                                 onClick=${showInputPopup}>${formDataa?.incomeProofs}
                               </a>
                               <p id="form16-docs"></p>
                               <p id="pan-docs"></p>
                               <p id="bank-statement-docs"></p>
                            </span>                          
                            <span class="c-error">
                             ${ocrErrorPopupText}
                            </span>
                          </li>
                        </ul>
                        <div class="employerBtn">
                          <div class="linkBtn">
                             <div class="whiteButton" id="back-btn">
                                <a href="javascript:;"
                                 onClick=${handleOnSubmit}>${formDataa?.back}
                                </a>
                             </div>
                             <div class="blackButton">
                                <a href="javascript:;" id="upload-btn"
                                 onClick=${handleUploadProceedClick}
                                 style="display: ${isDealerUpload ? 'none' : 'block'};">
                                   ${formDataa?.uploadProccedBtn}
                                </a>
                             </div>
                             <div class="blackButton">
                                <a href="javascript:;" id="submit-btn-dealer"
                                  onClick=${handleUploadProceedClick}
                                  style="display: ${isDealerUpload ? 'block' : 'none'};">
                                   ${formDataa?.submitDealerBtn}
                                </a>
                             </div>
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
           </div>
        </form>
      </div>
    </section>
    <div class="popUpmain" id="doc_validation_popup" style=${showPopup ? 'display: block;' : 'display: none;'}>
       <div class="modal-content">
          <div class="close" id="close-doc-popup" onClick=${handleClosePopup}>
          </div>
          <div class="popupContent blue">
              <h2><span class="info-icon"/>${formDataa?.infoPopup}</h2>
              <p>${formDataa?.infoDescSize}</p>
              <div class="btn-container">
                  <div class="blackButton"><button type="button"
                    onClick=${handleClosePopup}>${formDataa?.btnOk}</button></div>
                  <div></div>
              </div>
          </div>
       </div>
    </div>
    ${isDocumentUploadPopupVisible && html`
     <div class="popUpmain" id="incorrect_doc_validation_popup" style="display: flex;">
         <div class="modal-content">
            <div class="close" id="close-doc-validation-popup" onClick=${closeProceedPopup}>
            </div>
            <div class="popupContent">
              <h2 class="modal-reupload-msg-title d-flex align-items-center justify-content-center">
              <span class="warning-icon"/>
                  ${formDataa?.proceedPopupTitle}
              </h2>
              <p class="modal-reupload-msg-text">
                 System has noted upload of incorrect documents. This may lead to rejection of loan application from financer. Please go back and reupload the correct documents.
                  <br/><br/>If the correct documents are uploaded, you can Proceed Anyway.
              </p>
              <div style="display: flex;justify-content: center; gap:1.25rem">
                 <div class="whiteButton">
                    <a href="javascript:;" id="reupload_btn"
                      onClick=${closeProceedPopup}>${formDataa?.proceedPopupBack}
                    </a>
                 </div>
                 <div class="blackButton">
                    <a href="javascript:;"
                      onClick=${continueToProceed}>${formDataa?.proceedPopupNext}
                    </a>
                 </div>
              </div>
            </div>
         </div>
     </div>
     `}
     ${isValidationPopupVisible && html`
     <div class="popUpmain" id="doc_validation_popup" style="display: flex;" >
        <div class="modal-content">
            <div class="close" id="close-doc-popup" onClick=${closeValidationPopup}>
            </div>
            <div class="popupContent blue">
               <h2><span class="info-icon"/>
                   ${formDataa?.infoPopup}</h2>
               <p>${formDataa?.infoDescValidation}</p>
               <div class="btn-container">
                  <div class="blackButton"><button type="button" onClick=${closeValidationPopup}>
                    ${formDataa?.btnOk}</button>
                  </div>
                  <div></div>
               </div>
            </div>
        </div>
     </div>
     `}
     ${isSuccessPopupVisible && html`
      <div class="popUpmain fade-in" id="success-popup" style="display: flex;">
        <div class="modal-content">
            <div class="close" id="close-successe-popup" aria-label="Close" onClick=${closeSuccessPopup}>
            </div>
            <div class="popupContent green">
               <h2><div class="icon-img"></div>${formDataa?.successTitle}</h2>
               <p>${formDataa?.successDesc}</p>
               <div class="btn-container">
                  <div class="blackButton"><button type="button"
                    onClick=${continueToProceed}>${formDataa?.btnOk}</button></div>
                  <div></div>
               </div>
            </div>
        </div>
     </div>
     `}

    ${isPopupVisible ? html`
    <div class="popUpmain uploadSelectDocMain" id="uploadSelectDocMain-popup" style="display: flex;" >
        <div class="modal-content">
           <div class="popupContent">
              <div class="nfuploadDocBox form-loanapplication-au">
                 <h3>${formDataa?.uploadPopupTitle}</h3>
                 <ul class="doc_list_merge">
                    <li class="deletefile_merge">
                      <a href="javascript:;">
                      </a>
                    </li>
                 </ul>
                 <div class="slectFileBtn">
                   <div class="whiteButton">
                      <a href="javascript:;" id="selectFil"  onClick=${triggerFileInput}>
                        ${formDataa?.uploadBtn}
                      </a>
                         <input type="file" id="file_input" style="display: none;"
                           accept=".jpg,.png,.jpeg,.pdf" onChange=${handleFileChange} />
                   </div>
                   <a id="nfUploadDocInfo" href="#">
                      <div class="info-icon"></div>
                   </a>
                 </div>
                 <div class="blackButton">
                    <a href="javascript:;" class="merge_doc" onClick=${closePopup}>
                      ${formDataa?.selectBtn}
                    </a>
                 </div>
              </div>
           </div>
        </div>
    </div>
    ` : null}
    ${isIdPopupVisible && html`
    <div class="popUpmain uploadPopup fade-in" id="id-popup" style="display: flex;">
      <div class="modal-content">
          <div class="close" id="close-id-popup"  onClick=${hideIdPopup}>
          </div>
          <div class="popupContent">
             <h6>${formDataa?.selectProof}</h6>
             <div class="docRadioBtn">
             ${visibleDocuments.includes('dl')
             && html`
               <label class="customRadioBtn">
                  <input type="radio" checked="checked" name="ID_proof"
                    tabindex="52" class="radio-style"/>${formDataa?.dl}
               </label>
               `}
               ${visibleDocuments.includes('voterId') && html`
               <label class="customRadioBtn">
                 <input type="radio" name="ID_proof" tabindex="54"
                   class="radio-style"/>${formDataa?.voterId}
               </label>
                `}
                ${visibleDocuments.includes('passport')
               && html`
               <label class="customRadioBtn">
               <input type="radio" name="ID_proof" tabindex="54"
                 class="radio-style"/>Passport
             </label>
              `}
              ${visibleDocuments.includes('jobCard')
                && html`
               <label class="customRadioBtn">
                 <input type="radio" name="ID_proof" tabindex="54"
                   class="radio-style"/>${formDataa?.jobCard}
               </label>
                `}
                ${visibleDocuments.includes('populationRegister')
                && html`
               <label class="customRadioBtn">
                 <input type="radio" name="ID_proof" tabindex="54"
                      class="radio-style"/>${formDataa?.populationRegister}
               </label>
                `}
                ${visibleDocuments.includes('aadharCard')
                && html`
               <label class="customRadioBtn">
                 <input type="radio" name="ID_proof" tabindex="54"
                     class="radio-style"/>${formDataa?.aadharCard}
               </label>
                `}
             </div>
             <div class="dropImageBoxMain IDProof">
             ${!isFileUploaded ? html`
               <div class="dropImageBox ProofPAN" style="min-height: 286px;">
                  <div class="dropImage"></div>
                  <div class="heading">
                    <a href="javascript:;" class="ingredient_file" id="upload_btn"
                     onClick=${showPopupp}> Upload</a>
                 </div>
                 <p>Allowed files extensions and file sizes: .jpg, .bmp, .png, .gif,
                  .jpeg (5 MB), .pdf 1.5 MB)
                 </p>
               </div>
               ` : html`
               <div class="dropImageBox" style="display: block;">
                  <div class="uploadedImg">
                  <div class="uploaded-doc"/>
                    <a href="javascript:void(0);" class="deletefile" onClick=${handleFileDelete}>
                      <div class="delete-icon" />
                    </a>
                  </div>
                  <p>${selectedFile.name}</p>
                  <p id="preview_doc">
                    <a href="${selectedFile ? URL.createObjectURL(selectedFile) : '#'}" target="_blank" rel="noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18px" height="18px" fill="rgb(133, 133, 133)"> <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                    </a>
                  </p>
               </div>
               `}
             </div>
          </div>
      </div>
    </div>
    `}
    ${isIncomePopupVisible && html`
    <div class="popUpmain uploadPopup fade-in" id="income-popup" style="display: flex;" >
       <div class="modal-content">
           <div class="close" id="close-income-popup" onClick=${hideIncomePopup}>
           </div>
           <div class="popupContent">
              <div class="uploadIncomeSec">
                 <h6>${formDataa?.incomeTitle}</h6>
                 <div class="dropImageList">
                    <div class="dropImageWrap">
                      <div class="title">
                        <label class="customRadioBtn">
                          <input type="radio" checked="checked" name="ITR" tabindex="69"
                           class="radio-style"/>
                             ${formDataa?.bankStatement}
                        </label>
                      </div>
                      ${!isFileUploaded ? html`
                      <div class="dropImageBox ProofPAN" style="min-height: 286px;">
                         <div class="dropImage"></div>
                         <div class="heading">
                           <a href="javascript:;" class="ingredient_file" id="upload_btn"
                            onClick=${showPopupp}> Upload</a>
                        </div>
                        <p>Allowed files extensions and file sizes: .jpg, .bmp, .png, .gif,
                         .jpeg (5 MB), .pdf 1.5 MB)
                        </p>
                      </div>
                      ` : html`
                      <div class="dropImageBox" style="display: block;">
                         <div class="uploadedImg">
                         <div class="uploaded-doc"/>
                           <a href="javascript:void(0);" class="deletefile" onClick=${handleFileDelete}>
                           <div class="delete-icon" />
                           </a>
                         </div>
                         <p>${selectedFile.name}</p>
                         <p id="preview_doc">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18px" height="18px" fill="rgb(133, 133, 133)"> <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>

                         </p>
                      </div>
                      `}
                    </div>
                    <div class="dropImageWrap">
                      <div class="title">
                          <label class="customRadioBtn">
                              <input type="radio" checked="checked" name="ITR" tabindex="69"
                               class="radio-style"/>${formDataa?.salarySlip}
                          </label>
                      </div>
                      ${!isFileUploaded ? html`
                      <div class="dropImageBox ProofPAN" style="min-height: 286px;">
                         <div class="dropImage"></div>
                         <div class="heading">
                           <a href="javascript:;" class="ingredient_file" id="upload_btn"
                            onClick=${showPopupp}> Upload</a>
                        </div>
                        <p>Allowed files extensions and file sizes: .jpg, .bmp, .png, .gif,
                         .jpeg (5 MB), .pdf 1.5 MB)
                        </p>
                      </div>
                      ` : html`
                      <div class="dropImageBox" style="display: block;">
                         <div class="uploadedImg">
                         <div class="uploaded-doc"/>
                           <a href="javascript:void(0);" class="deletefile" onClick=${handleFileDelete}>
                           <div class="delete-icon" />
                           </a>
                         </div>
                         <p>${selectedFile.name}</p>
                         <p id="preview_doc">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18px" height="18px" fill="rgb(133, 133, 133)"> <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                         </p>
                      </div>
                      `}
                    </div>
                 </div>
                 <div class="docRadioBtn">
                    <label class="customRadioBtn">
                       <input type="radio" checked="checked" name="ITR" tabindex="69"
                         class="radio-style"/>
                         ${formDataa?.itr}<small>${formDataa?.itrYear}</small>
                    </label>
                 </div>
                 <div class="dropImageBoxMain form16_itr">
                      <div class="dropImageBox">
                        <div class="dropImage"></div>
                          <div class="heading">
                            <a href="javascript:;" class="ingredient_file" onClick=${showPopupp}> Upload</a>
                          </div>
                          <p>Allowed files extensions and file sizes: .jpg, .bmp, .png, .gif,
                             .jpeg (5 MB), .pdf (1.5MB)
                          </p>
                      </div>
                 </div>
              </div>
           </div>
       </div>
    </div>
    `}
    ${errorPopupVisible ? html`
    <div class="popUpmain fade-in" id="email_error_popup" style="display:block;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
          <div class="close" id="close-email-error-popup" onClick=${() => setErrorPopupVisible(false)}></div>
          <div class="popupContent red">
              <h2>
               <span class="error-icon"></span>Error
              </h2>
              <p>${errorPopupText}</p>
              <div class="btn-container">
                <div class="blackButton">
                    <button type="button" onClick=${() => setErrorPopupVisible(false)}>ok</button>
                </div>
              </div>
          </div>
       </div>
    </div>
  </div>
  ` : null}
  `;
}

UploadDocuments.parse = (block) => {
  const [
    uploadDetailsLabelEl,
    userUploadLabelEl,
    dealerUploadLabelEl,
    uploadDocumentSelectJourneyEl,
  ] = block.children;

  const elementsToHide = [
    uploadDetailsLabelEl,
    userUploadLabelEl,
    dealerUploadLabelEl,
    uploadDocumentSelectJourneyEl,
  ];
  elementsToHide.forEach((el) => el?.classList.add('hide'));

  const uploadLabel = uploadDetailsLabelEl.children[0].children[0];
  const userLabel = userUploadLabelEl.children[0].children[0];
  const dealerLabel = dealerUploadLabelEl.children[0].children[0];
  const dealerJourney = uploadDocumentSelectJourneyEl.children[0].children[0];

  return {
    uploadLabel,
    userLabel,
    dealerLabel,
    dealerJourney,
  };
};

UploadDocuments.defaults = {
  uploadLabel: html`Documents to Upload`,
  userLabel: html`I Will Upload my Documents`,
  dealerLabel: html`Let Dealer Upload my Documents`,
  dealerJourney: html``,
};

export default UploadDocuments;
