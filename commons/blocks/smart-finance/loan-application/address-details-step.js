/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import {getBankName} from '../../../utility/bankFormUtils.js';
import { useContext, useState, useEffect, useRef } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext, htmlStringToPreactNode } from './multi-step-form.js';
import formDataUtils from '../../../utility/formDataUtils.js';
import utility from '../../../utility/utility.js';
import { validateFormOnSubmit, mergeValidationRules, attachValidationListeners } from '../../../utility/validation.js';
import { verifyPincode, getAddrDetailStates, saveAddressLoanApplication, getAddrDetailCities, saveDraftLoanApplication, branchSearch, cityBranch, fetchOldBranchCities, branchDetail, ifscBranchDetail, standardStateSearch, standardBranchSearch, fetchCities, loanApplicantBranch } from '../../../utility/smart-finance/sfLoanApplicationUtils.js';

function AddressDetails({ config }) {
  const { addressLabel,
    currentLabel,
    permanentLabel,
    workLabel,
    check,
    branchSelectionLabel,
    searchStateLabel,
    searchSelectStateLabel,
    searchCityLabel,
    searchSelectCityLabel,
    searchBranchLabel,
    getDetailsLabel,
    ifscLabel,
    orText,
    searchIfscLabel,
    ifscPlaceholder,
    ifscErrorMessage,
    ifscPopupErrorText,
    ifscPopupErrorMessage,
    ifscPopupErrorOKText,
    cancelLabel,
    submitLabel,
    oldBranchSearchLabel,
    oldPlaceholderText } = config;
  const { handleSetActiveRoute, bankResponse, saveDraftRequestBody } = useContext(MultiStepFormContext);
  const [data, setData] = useState(null);
  const [permanentWorkCondition, setPermanentWorkCondition] = useState(null);
  const [workCondition, setWorkCondition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const formRef = useRef();

  const newFinancierIds = ["280021", "280020", "280029", "280019", "280018"];
  const oldFinancierIds = ["280024", "280028", "280022", "280025", "280009"];

  const customValidationRules = {
    pinCode: /^[1-9]\d{5}$/,
  };
  const mergedRules = mergeValidationRules(customValidationRules);
  const [stateList, setStateList] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let financerData;
        let fields;
        switch (bankResponse.financier_id) {
          case '280001':
            financerData = await formDataUtils.fetchSfFormData('icici-se');
            break;
          case '280003':
            financerData = await formDataUtils.fetchSfFormData('hdfc-se');
            break;
          default:
            // common form SE
            financerData = await formDataUtils.fetchSfFormData('common-fields');
            if (bankResponse.employmentType === '200002') {
              fields = await formDataUtils.fetchBankFieldMap('se-address-fieldmap');
            } else if (bankResponse.employmentType === '200001') {
              fields = await formDataUtils.fetchBankFieldMap('sal-address-fieldmap');
            }
            setPermanentWorkCondition(fields?.permanentAddress[getBankName(bankResponse.financier_id)] === 'N' ? false : true);
            setWorkCondition(fields?.workAddress[getBankName(bankResponse.financier_id)] === 'N' ? false : true);
        };
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
        setData(financerData);
        const resp = await getAddrDetailStates();
        const stateListt = resp.data.state_list.map((state) => `${state.state}:${state.id}`);
        setStateList(stateListt);
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return 'Loading...';
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      handleSetActiveRoute('applicant-details-step'); // Redirect to address-details-step.js
    } catch (error) {
      // do nothing
    }
  };

  const updateDropdown = (dropdown, list, initialHtml, processText = (text) => text) => {
    if (!dropdown) return;
    const uniqueItems = new Map();
    list.forEach((item) => {
      const [text, value] = item.split(':');
      if (text && value) uniqueItems.set(text, value);
    });
    let optionsHtml = initialHtml;
    optionsHtml += Array.from(uniqueItems)
      .sort(([textA], [textB]) => textA.localeCompare(textB))
      .map(([text, value]) => `<option value="${value}">${processText(text)}</option>`)
      .join('');
    dropdown.innerHTML = optionsHtml;
  };

  const handleStateChange = async (event) => {
    const stateValue = event.target.value;

    // Find the corresponding city dropdown based on the parent form-group ID
    const formGroup = event.target.closest('.form-group'); // Get the closest parent form-group
    const cityDropdown = formGroup.nextElementSibling.querySelector('.dropdown-city-dealer'); // Get the next sibling city dropdown

    if (event.target.classList.contains('dropdown-state-user')) {
      const cityPlaceholder = cityDropdown.getAttribute('data-placeholder');
      const response = await getAddrDetailCities(stateValue, '280003', 'true');
      if (response.success) {
        const cityList = response.data.city_list.map((city) => `${city.city}:${city.id}`);
        const initialHtml = `<option value="" disabled selected>${cityPlaceholder}</option>`;
        updateDropdown(cityDropdown, cityList, initialHtml);
      } else {
        cityDropdown.innerHTML = cityPlaceholder
          ? `<option value="" disabled selected>${cityPlaceholder}</option>`
          : '';
      }
    }
  };

  async function populateCityList(stateValue, cityDropdown){
    const cityPlaceholder = cityDropdown.getAttribute('data-placeholder');
    const response = await getAddrDetailCities(stateValue, bankResponse.financier_id, 'true');
    if (response.success) {
      const cityList = response.data.city_list.map((city) => `${city.city}:${city.id}`);
      const initialHtml = `<option value="" disabled selected>${cityPlaceholder}</option>`;
      updateDropdown(cityDropdown, cityList, initialHtml);
    } else {
      cityDropdown.innerHTML = cityPlaceholder
        ? `<option value="" disabled selected>${cityPlaceholder}</option>`
        : '';
    }
  }

  const handleBlurCurrent = async () => {
    const city = formRef.current.querySelector('.currentAddress .dropdown-city-dealer').value;
    const pincode = formRef.current.querySelector('.currentAddress .trim-pincode').value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        document.getElementById('pincode_error_popup').style.display = 'block';
        formRef.current.querySelector('.currentAddress .trim-pincode').value = '';
      }
    }
  };
  const handleBlurPermanent = async () => {
    const city = formRef.current.querySelector('.permAddress .dropdown-city-dealer')?.value;
    const pincode = formRef.current.querySelector('.permAddress .trim-pincode')?.value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        document.getElementById('pincode_error_popup').style.display = 'block';
        formRef.current.querySelector('.permAddress .trim-pincode').value = '';
      }
    }
  };
  const handleBlurWork = async () => {
    const city = formRef.current.querySelector('.workAddress .dropdown-city-dealer')?.value;
    const pincode = formRef.current.querySelector('.workAddress .trim-pincode')?.value;

    if (city && pincode) {
      const resp = await verifyPincode(city, pincode);
      if (resp.data.status === 'failure') {
        document.getElementById('pincode_error_popup').style.display = 'block';
        formRef.current.querySelector('.workAddress .trim-pincode').value = '';
      }
    }
  };
  function saveAddressData(address, addressTypeData) {
    address.address_details1 = addressTypeData.querySelector('#current-address-one').value;
    address.address_details2 = addressTypeData.querySelector('#current-address-two').value;
    address.landmark = addressTypeData.querySelector('#land-mark').value;
    address.state = addressTypeData.querySelector('#state').value;
    address.city = addressTypeData.querySelector('#city').value;
    address.pin_code = addressTypeData.querySelector('#pin-code').value;
  }
  function saveAddressDetails() {
    const currentAddressDetail = document.getElementById('current-detail');
    const officeDetails = document.getElementById('office-detail');
    const permanentAddressDetail = document.getElementById('permanent-detail');
    let addressTypeData;
    saveDraftRequestBody.address.forEach((address) => {
      if(address.address_type === '170001'){
        addressTypeData = currentAddressDetail;
        saveAddressData(address, addressTypeData);
        address.staying_since = addressTypeData.querySelector('#residence-since').value;
      }else if(permanentAddressDetail && address.address_type === '170002'){
        if(document.querySelector('input[name=\'SameasPresent\']').checked){
          addressTypeData = currentAddressDetail;
        }else{
          addressTypeData = permanentAddressDetail;
        }
        saveAddressData(address, addressTypeData);
      }else if(officeDetails && address.address_type === '170003'){
        addressTypeData = officeDetails;
        saveAddressData(address, addressTypeData);
      }
    })
  }
  useEffect(() => {
    // Fetch states when the component mounts

    // Adding event listener for state change
    const dealerStateDropdowns = formRef.current.querySelectorAll('.dropdown-state-user');
    dealerStateDropdowns.forEach((dropdown) => {
      dropdown.addEventListener('change', handleStateChange);
    });
    document.getElementById('close-pincode-error-popup').addEventListener('click', function() {
      document.getElementById('pincode_error_popup').style.display = 'none';
    })
    document.getElementById('pincode-close-popup-btn').addEventListener('click', function() {
      document.getElementById('pincode_error_popup').style.display = 'none';
    })
    const currentAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    currentAddrPincodeElement.addEventListener('blur', handleBlurCurrent);

    const permAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    permAddrPincodeElement.addEventListener('blur', handleBlurPermanent);

    const workAddrPincodeElement = formRef.current.querySelector('.currentAddress .trim-pincode');
    workAddrPincodeElement.addEventListener('blur', handleBlurWork);

    return () => {
      dealerStateDropdowns.forEach((dropdown) => {
        dropdown.removeEventListener('change', handleStateChange);
      });
    };
  }, []);
  let submitBranchPopupPayload = {
    "city": "",
    "branch_name": "",
    "branch_address": "",
    "branch_code": "",
    "state": "",
    "rah_name": null,
    "pin_code": "",
    "rah_dp_code": null,
    "branch_ifsc_code": "",
    "enquiry_id": "",
    "financier_id": bankResponse.financier_id
  };
  const continueToProceed = async (e) => {
    e.preventDefault();
    try {
      let isOverallFormValid = false;
      let isCurrentAddressValid = false;
      let isPermanentAddressValid = false;
      let isWorkAddressValid = false;
      const currentAddressDetail = document.querySelector('#current-detail');
      const officeDetails = document.querySelector('#office-detail');
      const permanentAddressDetail = document.querySelector('#permanent-detail');
      const selectedElem = document.querySelector('.form-control.selected');
      const selectedElemId = selectedElem.getAttribute('id');

      const isCheckboxChecked = document.querySelector('input[name=\'SameasPresent\']').checked;
      if (selectedElemId === 'cur_Add') {
        isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {});
        if (isCurrentAddressValid) {
          if (isCheckboxChecked) {
            if(officeDetails===null){
              isOverallFormValid = true;
            }
            else{
              isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
              if (!isWorkAddressValid) {
                // Select work address tab
                document.querySelector('#off_Add').click();
              }
            }
          } else {
            if(officeDetails===null && permanentAddressDetail===null){
              isOverallFormValid = true;
            }else{
              isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {}, true);
              if (!isPermanentAddressValid) {
                isOverallFormValid = false;
                // Select permanent address tab
                document.querySelector('#per_Add').click();
              } else {
                if(officeDetails===null){
                  isOverallFormValid = true;
                }else{
                  isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
                  if (!isWorkAddressValid) {
                    document.querySelector('#off_Add').click();
                  }
                  isOverallFormValid = !!isWorkAddressValid;
                }
              }
            }
          }
        }
      } else if (selectedElemId === 'per_Add') {
        // code to validate the perm add fields first
        isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {});
        if (isPermanentAddressValid) {
          isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
          if (!isCurrentAddressValid) {
            // select current address tab
            document.querySelector('#cur_Add').click();
          } else {
            isWorkAddressValid = validateFormOnSubmit(officeDetails, {}, true);
            if (isWorkAddressValid) {
              isOverallFormValid = !!isWorkAddressValid;
            } else {
              document.querySelector('#off_Add').click();
            }
          }
        }
      } else {
        isWorkAddressValid = validateFormOnSubmit(officeDetails, {});
        if (isWorkAddressValid) {
          // validate permanent add if checkbox is unchecked
          if (!isCheckboxChecked) {
            isPermanentAddressValid = validateFormOnSubmit(permanentAddressDetail, {}, true);
            if (!isPermanentAddressValid) {
              document.querySelector('#per_Add').click();
            } else {
              isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
              if (!isCurrentAddressValid) {
                document.querySelector('#cur_Add').click();
              }
            }
          } else {
            // validate current add tab
            isPermanentAddressValid = true;
            isCurrentAddressValid = validateFormOnSubmit(currentAddressDetail, {}, true);
            if (!isCurrentAddressValid) {
              document.querySelector('#cur_Add').click();
            }
          }
          isOverallFormValid = isWorkAddressValid
            && isCurrentAddressValid
            && isPermanentAddressValid;
        }
      }
      let stdBranchRuleId = '';

      function addDefaultSelectLabel(list, label) {
        const p = document.createElement("p");
        p.textContent = label;
        list.appendChild(p);
      }

      function toggleClassOnSelection(list, selectedValue) {
        const pList = list.getElementsByTagName("p");
        for (let i = 0; i < pList.length; i++) {
          if (pList[i].textContent === selectedValue) {
            pList[i].classList.add("selected-value");
            pList[i].focus();
          } else {
            pList[i].classList.remove("selected-value");
          }
        }
      }

      function selectItem(selectedItem, inputField, listElement, searchInputElement, nextDropdownFunction) {
        stdBranchRuleId = selectedItem.rule_id;
        inputField.value = getTextContent(selectedItem);
        toggleClassOnSelection(listElement, inputField.value);
        listElement.style.display = "none";
        if (searchInputElement) {
          searchInputElement.style.display = "none";
        }
        if (nextDropdownFunction) {
          nextDropdownFunction(getTextContent(selectedItem));
        }
      }

      function getTextContent(item) {
        if (typeof item === 'string') {
          return item;
        }
        if (item.branch_name && item.branch_address && item.ifsc_code) {
          return `${item.branch_name} (${item.branch_address}, IFSC Code: ${item.ifsc_code})`;
        }
        return '';
      }

      function populateList(data, container, clickHandler, selectLabel) {
        container.innerHTML = "";
        if (selectLabel && submitBranchPopupPayload.state === "" && submitBranchPopupPayload.city === "" && submitBranchPopupPayload.branch_name === "") {
          addDefaultSelectLabel(container, selectLabel);
          toggleClassOnSelection(container, selectLabel);
        }
        data.forEach(item => {
          const pEl = document.createElement("p");
          pEl.textContent = getTextContent(item);
          pEl.addEventListener("click", () => clickHandler(item));
          container.appendChild(pEl);
        });
      }
      
      if (isOverallFormValid) {
        saveAddressDetails();
        const saveLoanApplicantData = await saveAddressLoanApplication(saveDraftRequestBody);
        if(saveLoanApplicantData.success){
          if (newFinancierIds.includes(bankResponse.financier_id)) {
            const std_getDetails = document.getElementById("std_getDetails");
            const ifscBtn = document.getElementById("ifsc_btn");
            document.getElementById('branch_popup').classList.add('fade-in');
            document.getElementById('branch_popup').style.display = 'flex';
            document.getElementById('ifsc_cancel_button').addEventListener("click", () => {
              document.getElementById('branch_popup').style.display = 'none';
            })
            document.getElementById('close-branch-popup').addEventListener("click", () => {
              document.getElementById('branch_popup').style.display = 'none';
            })
            const standardStateList = await standardStateSearch({ financier_id: bankResponse.financier_id })
            const states = standardStateList.data.state;
  
            const stateSearchDiv = document.getElementById("state-search-input");
            const statesList = document.getElementById("statesList");
            const searchInput = document.getElementById("searchInput");
            const selectSearchInput = document.getElementById("selectSearchInput");
  
            const citySearchDiv = document.getElementById("city-search-input");
            const citySearchInput = document.getElementById("citySearchInput");
            const citySelectSearchInput = document.getElementById("selectCitySearchInput");
            const cityList = document.getElementById("cityList");
  
  
            const branchSearchDiv = document.getElementById("branch-search-input");
            const branchSearchInput = document.getElementById("branchSearchInput");
            const branchSelectSearchInput = document.getElementById("selectBranchSearchInput");
            const branchList = document.getElementById("branchList");
  
            if (submitBranchPopupPayload.state === "" && submitBranchPopupPayload.city === "" && submitBranchPopupPayload.branch_name === "") {
              addDefaultSelectLabel(statesList, searchSelectStateLabel.props.children[0]);
              searchInput.value = searchSelectStateLabel.props.children[0];
              toggleClassOnSelection(statesList, searchSelectStateLabel.props.children[0]);
  
              addDefaultSelectLabel(cityList, searchSelectCityLabel.props.children[0]);
              citySearchInput.value = searchSelectCityLabel.props.children[0];
              toggleClassOnSelection(cityList, searchSelectCityLabel.props.children[0]);
  
              addDefaultSelectLabel(branchList, searchBranchLabel.props.children[0]);
              branchSearchInput.value = searchBranchLabel.props.children[0];
              toggleClassOnSelection(branchList, searchBranchLabel.props.children[0]);
            }
            const branchDetailEl = document.querySelector(".branch_detail_by_ifsc");
            const selectedBranch = document.getElementById("std-selected-branch");
            const popupSubmit = document.getElementById("popup_submit_button");
  
            async function createCityDropDown(state) {
              const standardCityList = await fetchCities({ financier_id: bankResponse.financier_id, state: state })
              populateList(standardCityList.data.cities, cityList, selectCity, searchSelectCityLabel.props.children[0]);
            }
  
            async function createBranchDropDown(city) {
              const selectedState = document.getElementById('searchInput').value;
              const standardBranchData = await standardBranchSearch({ financier_id: bankResponse.financier_id, state: selectedState, city: city });
              const branches = standardBranchData.data.branches;
              populateList(branches, branchList, selectBranch, searchBranchLabel.props.children[0]);
            }
  
            function filterData(value, pList) {
              const filter = value.toUpperCase();
              const dataItems = pList.getElementsByTagName("p");
              for (let i = 0; i < dataItems.length; i++) {
                const txtValue = dataItems[i].textContent || dataItems[i].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                  dataItems[i].style.display = "";
                } else {
                  dataItems[i].style.display = "none";
                }
              }
            }
  
            selectSearchInput.addEventListener('input', () => {
              filterData(selectSearchInput.value, statesList);
            });
  
            citySelectSearchInput.addEventListener('input', () => {
              filterData(citySelectSearchInput.value, cityList);
            });
  
            branchSelectSearchInput.addEventListener('input', () => {
              filterData(branchSelectSearchInput.value, branchList);
            });
            searchInput.addEventListener("keydown", (event) => { event.preventDefault(); });
            stateSearchDiv.addEventListener("click", () => {
              selectSearchInput.style.display = "block";
              statesList.style.display = "block";
              citySelectSearchInput.style.display = "none";
              cityList.style.display = "none";
              branchSelectSearchInput.style.display = "none";
              branchList.style.display = "none";
            });
            citySearchInput.addEventListener("keydown", (event) => { event.preventDefault(); });
            citySearchDiv.addEventListener("click", () => {
              citySelectSearchInput.style.display = "block";
              cityList.style.display = "block";
              selectSearchInput.style.display = "none";
              statesList.style.display = "none";
              branchSelectSearchInput.style.display = "none";
              branchList.style.display = "none";
            });
            branchSearchInput.addEventListener("keydown", (event) => { event.preventDefault(); });
            branchSearchDiv.addEventListener("click", () => {
              branchSelectSearchInput.style.display = "block";
              branchList.style.display = "block";
              selectSearchInput.style.display = "none";
              statesList.style.display = "none";
              citySelectSearchInput.style.display = "none";
              cityList.style.display = "none";
            });
  
            function selectState(state) {
              selectItem(state, searchInput, statesList, selectSearchInput, createCityDropDown);
            }
  
            function selectCity(city) {
              selectItem(city, citySearchInput, cityList, citySelectSearchInput, createBranchDropDown);
            }
  
            function selectBranch(branch) {
              selectItem(branch, branchSearchInput, branchList, branchSelectSearchInput, null);
            }
  
            populateList(states, statesList, selectState, searchSelectStateLabel.props.children[0]);
  
            std_getDetails.addEventListener("click", async () => {
              if (branchSearchInput.value && citySearchInput.value && searchInput.value) {
                const standardBranchSearchData = await branchDetail({ financier_id: bankResponse.financier_id, rule_id: stdBranchRuleId});
                const branchDetails = standardBranchSearchData.data.branch_detail;
                submitBranchPopupPayload.city = branchDetails.city;
                submitBranchPopupPayload.state = branchDetails.state;
                submitBranchPopupPayload.branch_name = branchDetails.branch_name;
                submitBranchPopupPayload.branch_address = branchDetails.branch_address;
                submitBranchPopupPayload.branch_code = branchDetails.branch_code;
                submitBranchPopupPayload.pin_code = branchDetails.pin_code;
                submitBranchPopupPayload.branch_ifsc_code = branchDetails.branch_ifsc_code;
                selectedBranch.textContent = `(${branchDetails.branch_code}) ${branchDetails.branch_name}, ${branchDetails.branch_address}, ${branchDetails.city}, ${branchDetails.state}, ${branchDetails.pin_code}, ${ifscLabel.props.children[0]}-${branchDetails.branch_ifsc_code}`;
                selectedBranch.style.display = "block";
                if(popupSubmit.classList.contains('disabled')){
                  popupSubmit.classList.remove('disabled');
                  popupSubmit.classList.add('enabled');
                }
              }
            });
            function validateIFSC(ifscCode) {
              const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
              return ifscRegex.test(ifscCode);
            }
            const ifsc = document.getElementById("ifsc__input");
            ifsc.addEventListener("input", async () => {
              branchDetailEl.style.display = "none";
              const ifscValue = ifsc.value;
              const ifscError = document.getElementById("ifsc-error");
              if (validateIFSC(ifscValue)) {
                ifscError.style.display = "none";
              }
              else {
                ifscError.style.display = "block";
              }
            })
            ifscBtn.addEventListener("click", async () => {
              const invalidIFSCError = document.getElementById("invalid_ifsc_popup");
              const closeButton = document.getElementById("close-invalid_ifsc-popup");
              const errorOKButton = document.getElementById("error_ok_button");
              closeButton.addEventListener("click", () => {
                invalidIFSCError.style.display = "none";
              })
              errorOKButton.addEventListener("click", () => {
                invalidIFSCError.style.display = "none";
              })
              if (validateIFSC(ifsc.value)) {
                const branchData = await ifscBranchDetail({ financier_id: bankResponse.financier_id, ifsc_code: ifsc.value });
                if (!branchData.success) {
                  invalidIFSCError.style.display = "block";
                  branchDetailEl.style.display = "none";
                  branchDetailEl.textContent = "";
                  if(popupSubmit.classList.contains('enabled')){
                    popupSubmit.classList.remove('enabled');
                    popupSubmit.classList.add('disabled');
                  }
                } else if (branchData.success) {
                  const branchDetailData = branchData.data.branch_detail;
                  branchDetailEl.textContent = `(${branchDetailData.branch_code}) ${branchDetailData.branch_name}, ${branchDetailData.branch_address}, ${branchDetailData.city}, ${branchDetailData.state}, ${branchDetailData.pin_code}, ${ifscLabel.props.children[0]}-${ifsc.value}`;
                  branchDetailEl.style.display = "block";
                  invalidIFSCError.style.display = "none";
                  if(popupSubmit.classList.contains('disabled')){
                    popupSubmit.classList.remove('disabled');
                    popupSubmit.classList.add('enabled');
                  }
                }
              }
            })
  
            popupSubmit.addEventListener("click", async() => {
                const loanApplicantBranchData = await loanApplicantBranch(submitBranchPopupPayload);
                if(loanApplicantBranchData.success){
                  document.getElementById('branch_popup').style.display = 'none';
                  handleSetActiveRoute('upload-documents-step');
                }
            })
          }
          else if (oldFinancierIds.includes(bankResponse.financier_id)) {
             document.getElementById('old_branch_popup').classList.add('fade-in');
             document.getElementById('old_branch_popup').style.display = 'flex';
             document.getElementById('old_branch_details_cancel').addEventListener("click", () => {
               document.getElementById('old_branch_popup').style.display = 'none';
             })
             document.getElementById('close-old-branch-popup').addEventListener("click", () => {
               document.getElementById('old_branch_popup').style.display = 'none';
             })
            const oldBranchSelectTextEl = document.getElementById("old_branch_select_text");
            const oldPopupSubmit = document.getElementById("old_branch_details_submit");
            async function selectOldItem(selectedItem, inputField, listElement){
              inputField.value = `${selectedItem.branch_name}-${selectedItem.ifsc_code}`;
              const branchSelectData = await cityBranch({ financier_id: bankResponse.financier_id, rule_id: selectedItem.offer_id });
              const oldBranchDetails = branchSelectData.data.branch_detail;
              oldBranchSelectTextEl.innerHTML = `(${oldBranchDetails.branch_code}) ${oldBranchDetails.branch_name}, ${oldBranchDetails.branch_address}, ${oldBranchDetails.city}, ${oldBranchDetails.state}, ${oldBranchDetails.pin_code}`;
              submitBranchPopupPayload.city = oldBranchDetails.city;
              submitBranchPopupPayload.state = oldBranchDetails.state;
              submitBranchPopupPayload.branch_name = oldBranchDetails.branch_name;
              submitBranchPopupPayload.branch_address = oldBranchDetails.branch_address;
              submitBranchPopupPayload.branch_code = oldBranchDetails.branch_code;
              submitBranchPopupPayload.pin_code = oldBranchDetails.pin_code;
              submitBranchPopupPayload.branch_ifsc_code = oldBranchDetails.branch_ifsc_code;
              listElement.style.display = "none";
              if(oldPopupSubmit.classList.contains('disabled')){
                oldPopupSubmit.classList.remove('disabled');
                oldPopupSubmit.classList.add('enabled');
              }
            }
            function populateOldBranchList( data, container, clickHandler) {
              container.innerHTML = "";
              data.forEach(item => {
                const pEl = document.createElement("p");
                pEl.textContent = `${item.branch_name}-${item.ifsc_code}`;
                pEl.addEventListener("click", () => clickHandler(item));
                container.appendChild(pEl);
              });
            }
            const oldCitySearchInput = document.getElementById("old_branch_city");
            const oldCityList = document.getElementById("old_branch_cityautocomplete-list");
  
            const oldBranchSearchInput = document.getElementById("old_branch_input");
            const oldBranchList = document.getElementById("old_branchautocomplete-list");
  
            function selectOldCity(city) {
              selectItem(city, oldCitySearchInput, oldCityList, null, null);
            }
  
            function selectOldBranch(branch) {
              selectOldItem(branch, oldBranchSearchInput, oldBranchList);
            }
  
            oldCitySearchInput.addEventListener("focus", () => {
              oldCityList.style.display = "block";
            });
  
            oldCitySearchInput.addEventListener("input", async() => {
              if(oldCitySearchInput.value.length >= 3) {
                const citiesList = await fetchOldBranchCities({ financier_id: bankResponse.financier_id , search_text: oldCitySearchInput.value });
                populateList(citiesList.data, oldCityList, selectOldCity, null);
                oldCityList.style.display = "block";
              }
            })
  
            oldBranchSearchInput.addEventListener("input", async() => {
              if(oldCitySearchInput.value){
                if(oldBranchSearchInput.value.length >= 3) {
                  const oldBranchData = await branchSearch({ financier_id: bankResponse.financier_id , search_text: oldCitySearchInput.value , city: oldCitySearchInput.value });
                  populateOldBranchList(oldBranchData.data.branch_names, oldBranchList, selectOldBranch);
                  oldBranchList.style.display = "block";
                }
              }else{
                oldBranchSearchInput.value = "";
              }
            })
  
  
            oldPopupSubmit.addEventListener("click", async() => {
              if(oldBranchSelectTextEl.textContent) {
                const loanApplicantBranchData = await loanApplicantBranch(submitBranchPopupPayload);
                if(loanApplicantBranchData.success){
                  document.getElementById('old_branch_popup').style.display = 'none';
                  handleSetActiveRoute('upload-documents-step');
                }
              }
            })
          }
          else{
            handleSetActiveRoute('upload-documents-step');
          }
        }
      }
    } catch (error) {
      console.error('Error saving loan application', error);
    }
  };

  // Function to handle textarea click
  const addTextareaClickListener = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        // Get all sections
        let isValid = true;
        const currentAddressDetail = document.getElementById('current-detail');
        const officeDetails = document.getElementById('office-detail');
        const permanentAddressDetail = document.getElementById('permanent-detail');
        const selectedElem = document.querySelector('.form-control.selected');
        const selectedElemId = selectedElem.getAttribute('id');
        if (selectedElemId === 'cur_Add') {
          isValid = validateFormOnSubmit(currentAddressDetail, {});
        } else if (selectedElemId === 'per_Add') {
          isValid = validateFormOnSubmit(permanentAddressDetail, {});
        } else {
          isValid = validateFormOnSubmit(officeDetails, {});
        }

        if (isValid) {
          // Reset all sections to hidden
          currentAddressDetail.style.display = 'none';
          if(officeDetails)officeDetails.style.display = 'none';
          if(permanentAddressDetail)permanentAddressDetail.style.display = 'none';
          // remove and add black border
          selectedElem.classList.remove('selected');
          element.classList.add('selected');
          // Show section based on clicked textarea
          if (elementId === 'per_Add') {
            // Show the permanent address section
            permanentAddressDetail.style.display = 'block';
          } else if (elementId === 'off_Add') {
            // Show the office details section
            officeDetails.style.display = 'block';
          } else if (elementId === 'cur_Add') {
            // Show the current address section by default
            currentAddressDetail.style.display = 'block';
          }
        }
      });
    }
  };

  // Add click listeners for all relevant textareas
  useEffect(() => {
    addTextareaClickListener('cur_Add');
    addTextareaClickListener('per_Add');
    addTextareaClickListener('off_Add');
  }, []);

  // Function to handle checkbox toggle for the per_Add textarea
  const addCheckboxListener = (checkboxName) => {
    const checkbox = document.querySelector(`input[name='${checkboxName}']`);
    const textarea = document.getElementById('per_Add');

    if (checkbox && textarea) {
      checkbox.addEventListener('change', function togglePermAddressVisibility() {
        if (this.checked) {
          // Hide the textarea and uncheck the checkbox
          textarea.style.display = 'none';
          textarea.value = ''; // Clear the textarea if hidden
          // check if which text area is selected if permanent is selected ..
          // hide it and select current address text area
          const selectedElem = document.querySelector('.form-control.selected');
          const selectedTextareaId = selectedElem?.getAttribute('id');
          if (selectedTextareaId === 'per_Add') {
            const currentAddressDetail = document.getElementById('current-detail');
            const permanentAddressDetail = document.getElementById('permanent-detail');
            selectedElem?.classList.remove('selected');
            document.querySelector('#cur_Add').classList.add('selected');
            currentAddressDetail.style.display = 'block';
            permanentAddressDetail.style.display = 'none';
          }
        } else {
          // Show the textarea
          textarea.style.display = 'block';
        }
      });
    }
  };
  // Add checkbox listener for the 'SameasPresent' checkbox
  useEffect(() => {
    addCheckboxListener('SameasPresent');
    attachValidationListeners(document.querySelector('form'), mergedRules, () => { }, false);
    const pinCodeEle = document.querySelectorAll('.trim-pincode');
    pinCodeEle.forEach((element) => {
      element.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 6).replace(/\D/g, '');
      });
    });
  }, []);

  useEffect(() => {
    document.getElementById('ok-save-popup-button').addEventListener('click', function() {
      document.getElementById('success-popup').style.display = 'none';
    });
    document.getElementById('close-successe-popup').addEventListener('click', function() {
      document.getElementById('success-popup').style.display = 'none';
    });
    // Define the click handler for the Save buttons
    const handleSaveClick = async (event) => {
      event.preventDefault();
      try {
        saveAddressDetails();
        const response = await saveDraftLoanApplication(saveDraftRequestBody);
        if(response.success){
          document.getElementById('success-popup').style.display = 'block';
        }
      } catch (error) {
        console.error('Error saving loan application', error);
      }
    };

    const saveButtons = document.querySelectorAll('.blackButton .btn1.SAVE');
    saveButtons.forEach((button) => button.addEventListener('click', handleSaveClick));

    return () => {
      saveButtons.forEach((button) => button.removeEventListener('click', handleSaveClick));
    };
  }, []);

  useEffect(() => {
    const reverseResidenceTypeMapping = {
      '230001':'Self/Family Owned',
      '230002':'Rented',
    };
    const reverseResidentSinceMapping = {
      '260003':'2+year',
      '260002':'1-2years',
      '260001':'<1 year'
    };
    const reverseAddressTypeMapping = {
      '170001':'Current',
      '170002':'Permament',
      '170003':'Work',
    }
    // Fetch dealer customer data when the component mounts
    const fetchDealerCustomerData = async () => {
      async function getAddressDetails(element, address) {
        if(!element){
          return null;
        }
        if(element.querySelector('#current-address-one'))
          element.querySelector('#current-address-one').value = address.address_details1?address.address_details1: '';
        if(element.querySelector('#current-address-two'))
          element.querySelector('#current-address-two').value = address.address_details2?address.address_details2: '';
        if(element.querySelector('#land-mark'))
          element.querySelector('#land-mark').value = address.landmark?address.landmark: '';
        if(element.querySelector('#state')){
          element.querySelector('#state').value = address.state?address.state: '';
        }
        if(element.querySelector('#city') && element.querySelector('#state').value !== ''){
          await populateCityList(address.state, element.querySelector('#city'));
          element.querySelector('#city').value = address.city?address.city: '';
        }
        if(element.querySelector('#pin-code'))
          element.querySelector('#pin-code').value = address.pin_code?address.pin_code: '';
        if(element.querySelector('#residence-since')){
          element.querySelector('#residence-since').value = saveDraftRequestBody.staying_since?saveDraftRequestBody.staying_since: '';
        }
      }
      const addressData = saveDraftRequestBody.address;
      if(addressData && addressData.length>0){
        for(const address of addressData){
          if (address && address.address_type === '170001') {
            const currentAddressDetail = document.getElementById('current-detail');
            await getAddressDetails(currentAddressDetail, address);
          }else if(address.address_type && address.address_type === '170002'){
            const permanentAddressDetail = document.getElementById('permanent-detail');
            await getAddressDetails(permanentAddressDetail, address);
          }else if(address.address_type && address.address_type === '170003'){
            const officeDetails = document.getElementById('office-detail');
            await getAddressDetails(officeDetails, address);
          }
        };
      }
    };

    // Fetch and populate data on component mount
    fetchDealerCustomerData();
  }, []);
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
               <div class="title">
                  ${formData?.application}
                  <br/>
                  ${formData?.details}
               </div>
            </div>
         </li>
         <li class="active">
            <span>2</span>
            <div class="content">
               <div class="image">
                  <div class="step-2"></div>
               </div>
               <div class="title">
                  ${formData?.address}
                  <br/>
                  ${formData?.details}
               </div>
            </div>
         </li>
         <li>
            <span>3</span>
            <div class="content">
               <div class="image">
                  <div class="step-3"></div>
               </div>
               <div class="title">
                  ${formData?.upload}
                  <br/>
                  ${formData?.documents}
               </div>
            </div>
         </li>
         <li>
            <span>4</span>
            <div class="content">
               <div class="image">
                  <div class="step-4"></div>
               </div>
               <div class="title">
                  ${formData?.finalize}
                  <br/>
                  ${formData?.loan}
               </div>
            </div>
         </li>
      </ul>
      <form ref=${formRef} action="" class="form_financeloan" id="form-loanapplication-hdb" novalidate="novalidate">
         <div class="employerFormBox addressDetailSec" id="step2" style="display: block;">
            <div class="addressDetailForm addressDetailForm1">
               <div class="formWrap">
                  <div class="left">
                     <h6>${addressLabel.props.children[0]}</h6>
                     <div class="form-group cAddress">
                        <textarea id="cur_Add" class="form-control selected" placeholder=" ${currentLabel.props.children[0]}*"
                           readonly=""></textarea>
                     </div>
                     <div class="form-group margin-b-0 cAddress">
                        <textarea id="per_Add" class="form-control" name="permaAdd"
                           placeholder="${permanentLabel.props.children[0]}*" readonly="" style=${!permanentWorkCondition ? "display:none;" : "display:block;"}></textarea>
                     </div>
                     <div class="form-group margin-b-0">
                        <div class="checkBox" style=${!permanentWorkCondition ? "display:none;" : "display:block;"}>
                           <label class="customCheckBox">
                           <input type="checkbox" name="SameasPresent" tabindex="47"></>
                           <span>${check.props.children[0]}</span>
                           </label>
                        </div>
                     </div>
                     <div class="form-group office">
                        <textarea id="off_Add" class="form-control" placeholder="${workLabel.props.children[0]}*"
                           readonly="" style=${!workCondition ? "display:none;" : "display:block;"}></textarea>
                     </div>
                  </div>
                  <div class="right">
                     <div class="currentAddress" id="current-detail" style="display: block;">
                        <h6>${currentLabel.props.children[0]}</h6>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid', 'error invalid-feedback')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        ${bankResponse?.financier_id === '280001' ? html`
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressThree, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>` : html``}
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceSince, 'full-width', true, { required: true })))}
                        </div>
                        ${bankResponse?.financier_id === '280001' ? html`
                        <div class="form-group">
                          ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceOwnershipType, 'full-width', true, { required: true })))}
                        </div>
                        <div class="form-group">
                          ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceType, 'full-width', true, { required: true })))}
                        </div>
                        ` : html``}
                     </div>
                     ${permanentWorkCondition ? html`<div class="permAddress" id="permanent-detail" style="display: none;">
                        <h6>${permanentLabel.props.children[0]}</h6>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group" id='two'>
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                        </div>
                     </div>` : html``}
                     ${workCondition ? html`<div class="workAddress" id="office-detail" style="display: none;">
                        <h6>${workLabel.props.children[0]}</h6>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressOne, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.currentAddressTwo, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.landMark, 'full-width', 'text', {}, '', 'form-control is-invalid')))}
                        </div>
                        <div class="form-group" id='three'>
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdownFromArray(data.state, stateList, '', 'dropdown-state-user', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createEmptyDropdown(data.city, '', 'dropdown-city-dealer', true, {}, '', false)))}
                        </div>
                        <div class="form-group">
                           ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createInputField(data.pinCode, 'full-width', 'number', {}, '', 'form-control is-invalid trim-pincode')))}
                        </div>
                        ${bankResponse?.financier_id === '280024' ? html`
                          <div class="form-group">
                             ${htmlStringToPreactNode(utility.sanitizeHtml(formDataUtils.createDropdown(data.residenceSince, 'full-width', true, { required: true })))}
                          </div>
                          ` : html``}
                     </div>` : html``}
                  </div>
                  <div class="mobileFooter goToUplod">
                     <div class="whiteButton btn1">
                        <div class="back-icon" onClick=${handleOnSubmit}></div>
                     </div>
                     <div class="blackButton btn2">
                        <button type="button" class="btn1 SAVE">Save</button>
                     </div>
                     <div class="blackButton btn3">
                        <a href="javascript:;" class="btn1 next_step_mobile" onClick=${continueToProceed}>${formData?.continueToProceed}</a>
                     </div>
                     <div class="blackButton btn3">
                        <button type="button" class="btn1 next_step_mobile_next" style="display: none;">
                        Next
                        </button>
                     </div>
                     <div class="blackButton btn3" style="display: none;">
                        <a href="javascript:;" class="btn1 next_step_edit">Edit</a>
                     </div>
                  </div>
               </div>
               <div class="employerBtn">
                  <div class="whiteButton">
                     <a href="javascript:;" class="btn1 SAVE" onClick=${handleOnSubmit}>${formData?.back}</a>
                  </div>
                  <div class="blackButton">
                     <button type="button" class="btn1 SAVE">Save</button>
                  </div>
                  <div class="blackButton">
                     <button type="button" class="btn1 next_step doc_upload" onClick=${continueToProceed}>${formData?.continueToProceed}
                     </button>
                  </div>
               </div>
            </div>
            <div class="popUpmain fade-in" id="success-popup" style="display: none;">
        <div class="modal-content">
            <div class="close" id="close-successe-popup" aria-label="Close">
            </div>
            <div class="popupContent green">
               <h2><div class="icon-img"></div>${formData?.successTitle}</h2>
               <p>${formData?.successDesc}</p>
               <div class="btn-container">
                  <div class="blackButton" id="ok-save-popup-button"><button type="button">${formData?.btnOk}</button></div>
                  <div></div>
               </div>
            </div>
        </div>
     </div>
      <div class="popUpmain fade-in" id="pincode_error_popup" style="display: none;">
                          <div class="modal-content">
                            <div class="close" id="close-pincode-error-popup"></div>
                            <div class="popupContent red">
                                <h2><div class="icon-img "></div>Error</h2>
                                <p>${formData.pincodeError}</p>
                                <div class="btn-container">
                                    <div class="blackButton"><button type="button" id="pincode-close-popup-btn">${formData.okBtn}</button></div>
                                </div>
                            </div>
                          </div>
                        </div>
         </div>
      </form>
      <div id="branch_popup" class="popUpmain fade-in" style="display:none">
         <div class="modal-content">
            <div class="close" id="close-branch-popup">
            </div>
            <div class="modal-body modal-body-branch">
               <h1 class="modal-title modal-branch-title">${branchSelectionLabel.props.children[0]}</h1>
               <form id="branch_validate" novalidate="novalidate">
                  <div class="row no-gutters row15">
                     <div class="col-md mb-3 mb-md-0" style="position: relative;">
                     <div class="div-wrapper">
                        <label class="label-branch" for="stateDropdown">${searchStateLabel.props.children[0]}*</label>
                        <div id="state-search-input">
                          <input class="std-state-dropdown" type="text" id="searchInput"/>
                          <span class="select-selection__arrow" ></span>
                        </div>
                        </div>
                        <div class="std-state-dropdown resuts">
                           <input type="text" id="selectSearchInput" style="display: none;"/>
                           <div class="dropdown-list" id="statesList" style="display: none;">
                           </div>
                        </div>
                     </div>
                     <div class="col-md mb-3 mb-md-0" style="position: relative;">
                      <div class="div-wrapper">
                        <label class="label-branch" for="cityDropdown">${searchCityLabel.props.children[0]}*</label>
                        <div id="city-search-input">
                          <input class="std-city-dropdown" type="text" id="citySearchInput"/>
                          <span class="select-selection__arrow" ></span>
                        </div>
                        </div>
                        <div class="std-city-dropdown resuts">
                           <input type="text" id="selectCitySearchInput" style="display: none;"/>
                           <div class="dropdown-list" id="cityList" style="display: none;">
                           </div>
                        </div>
                     </div>
                     <div class="col-md mb-3 mb-md-0" style="position: relative;">
                      <div class="div-wrapper">
                        <label class="label-branch" for="branchDropdown">${searchBranchLabel.props.children[0]}</label>
                        <div id="branch-search-input">
                        <input class="std-branch-dropdown" type="text" id="branchSearchInput" />
                         <span class="select-selection__arrow" ></span>
                         </div>
                        </div>
                        <div class="std-branch-dropdown resuts">
                           <input type="text" id="selectBranchSearchInput" style="display: none;"/>
                           <div class="dropdown-list" id="branchList" style="display: none;">
                           </div>
                        </div>
                     </div>
                     <div class="col-md-auto details-wrapper">
                        <label for="" class="label label-branch d-block"></label>
                        <div class="blackButton">
                           <a href="javascript:void(0)"
                              class="btn1 get_branch_details btn-dark-custom btn-get-detail" id="std_getDetails">
                           ${getDetailsLabel.props.children[0]}
                           </a>
                        </div>
                      
                     </div>
                  </div>
               </form>
               <p class="modal-branch-text branch_detail_by_name" id="std-selected-branch" style="display: none;"></p>
               <div class="or-breaker">
                  ${orText}
               </div>
               <div class="row justify-content-center no-gutters row15">
                  <div class="col-md-4">
                     <label for="" class="label label-branch">${searchIfscLabel.props.children[0]}*</label>
                     <input type="text" maxlength="11" minlength="11" name="ifsc" id="ifsc__input" style="width:100%"
                        class="form-control branch-form-control" placeholder="${ifscPlaceholder.props.children[0]}" tabindex="95"/>
                     <em id="ifsc-error" class="error invalid-feedback">${ifscErrorMessage.props.children[0]}</em>
                  </div>
                  <div class="col-md-auto details-wrapper">
                     <label for="" class="label label-branch d-block"></label>
                     <div class="blackButton">
                        <a href="javascript:void(0)"
                           class="btn1 get_branch_details_ifsc btn-dark-custom btn-get-detail" id="ifsc_btn">
                        ${getDetailsLabel.props.children[0]}
                        </a>
                     </div>
                  </div>
               </div>
               <p class="modal-branch-text text-center branch_detail_by_ifsc"></p>
               <div class="modal-branch-button text-right">
                  <div class="whiteButton">
                     <a href="javascript:;" class="modal-branch-btn-outline" data-dismiss="modal" id="ifsc_cancel_button">${cancelLabel.props.children[0]}</a>
                  </div>
                  <div class="blackButton">
                     <a href="javascript:void(0)" class="btn1 submit_branch_new btn-dark-custom btn-get-detail disabled" id="popup_submit_button">${submitLabel.props.children[0]}</a>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <div class="popUpmain fade-in" id="invalid_ifsc_popup" style="display: none;">
         <div class="modal-content">
            <div class="close" id="close-invalid_ifsc-popup"></div>
            <div class="popupContent red">
               <h2>
                  <div class="icon-img "></div>
                  ${ifscPopupErrorText.props.children[0]}
               </h2>
               <p>${ifscPopupErrorMessage.props.children[0]}</p>
               <div class="btn-container">
                  <div class="blackButton"><button type="button" id="error_ok_button">${ifscPopupErrorOKText.props.children[0]}</button></div>
                  <div></div>
               </div>
            </div>
         </div>
      </div>
      <div class="popUpmain fade-in" id="old_branch_popup" style="display:none">
         <div class="modal-content">
            <div class="close" id="close-old-branch-popup"></div>
            <div class="popupContent">
               <div class="branchSelectContent">
                  <h2>${branchSelectionLabel.props.children[0]}</h2>
                  <div class="formfieldRow splitName">
                     <div class="formInputBx">
                        <p class="title_branch">${searchCityLabel.props.children[0]}*</p>
                        <div class="old-city-dropdown">
                           <input autocomplete="off" placeholder="${oldPlaceholderText.props.children[0]}" id="old_branch_city" name="branch_city"
                              type="text" value="" tabindex="74"/>
                           <div id="old_branch_cityautocomplete-list" class="autocomplete-items"></div>
                        </div>
                     </div>
                     <div class="formInputBx">
                        <p class="title_branch">${oldBranchSearchLabel.props.children[0]}*</p>
                        <div class="autocomplete_fmp">
                           <input autocomplete="off" placeholder="${oldPlaceholderText.props.children[0]}" id="old_branch_input" name="branch"
                              type="text" value=""  tabindex="75"/>
                           <div id="old_branchautocomplete-list" class="autocomplete-items" style="display: none;"></div>
                        </div>
                     </div>
                     <p id="old_branch_select_text"></p>
                  </div>
                  <div class="branchSelectAdd">
                     <p class="branch_detail"></p>
                     <div class="btnsMain">
                        <div class="whiteButton"><a href="#" class="clse" id="old_branch_details_cancel">${cancelLabel.props.children[0]}</a></div>
                        <div class="blackButton"><a href="javascript:void(0)" class="submit_branch" id="old_branch_details_submit">${submitLabel.props.children[0]}</a></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>
    `;
}

AddressDetails.parse = (block) => {
  const innerDiv = block.children[0].children[0];
  const [
    addressLabel,
    currentLabel,
    permanentLabel,
    workLabel,
    check,
    branchSelectionLabel,
    searchStateLabel,
    searchSelectStateLabel,
    searchCityLabel,
    searchSelectCityLabel,
    searchBranchLabel,
    getDetailsLabel,
    ifscLabel,
    orText,
    searchIfscLabel,
    ifscPlaceholder,
    ifscErrorMessage,
    ifscPopupErrorText,
    ifscPopupErrorMessage,
    ifscPopupErrorOKText,
    cancelLabel,
    submitLabel,
    oldBranchSearchLabel,
    oldPlaceholderText
  ] = innerDiv.children;

  return {
    addressLabel,
    currentLabel,
    permanentLabel,
    workLabel,
    check,
    branchSelectionLabel,
    searchStateLabel,
    searchSelectStateLabel,
    searchCityLabel,
    searchSelectCityLabel,
    searchBranchLabel,
    getDetailsLabel,
    ifscLabel,
    orText,
    searchIfscLabel,
    ifscPlaceholder,
    ifscErrorMessage,
    ifscPopupErrorText,
    ifscPopupErrorMessage,
    ifscPopupErrorOKText,
    cancelLabel,
    submitLabel,
    oldBranchSearchLabel,
    oldPlaceholderText
  };
};

export default AddressDetails;
