import { expect } from "@esm-bundle/chai";
import { readFile } from "@web/test-runner-commands";
import decorate from "../../../blocks/book-test-drive/book-test-drive";

// Mock `getFormData` on `window`
before(() => {
  window.getFormData = async () => ({
    address: {
      id: "address",
      name: "address",
      label: "House No./Street Name/Area",
      placeholderText: "Address",
      requiredMessage: "Address is required",
      validationMessage: "",
      value: [""],
    },
    city: {
      id: "city",
      name: "city",
      label: "",
      placeholderText: "City",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
    dealerCity: {
      id: "dealer-city",
      name: "dealerCity",
      label: "Dealership City",
      placeholderText: "-Select Dealer City-",
      requiredMessage: "Dealership City is required",
      validationMessage: "",
      value: [""],
    },
    dealerCom: {
      id: "dealer-com",
      name: "dealerCom",
      label: "Dealer Communication",
      placeholderText: "Choose File;No file chosen",
      requiredMessage: "",
      validationMessage:
        "Please select correct file format(.jpg, .jpeg, .docx or .pdf).;File size exceeded.",
      value: [""],
    },
    dealerInfo: {
      id: "dealer-info",
      name: "dealerInfo",
      label: "Dealership Name / Dealership Location",
      placeholderText: "-Select Dealer Name-",
      requiredMessage: "Dealership Name is required",
      validationMessage: "",
      value: [""],
    },
    dealerState: {
      id: "dealer-state",
      name: "dealerState",
      label: "Dealership State",
      placeholderText: "-Select Dealer State-",
      requiredMessage: "Dealership State is required",
      validationMessage: "",
      value: [""],
    },
    email: {
      id: "email",
      name: "email",
      label: "E-Mail",
      placeholderText: "E-Mail",
      requiredMessage: "E-Mail is required",
      validationMessage: "Please enter a valid email address",
      value: [""],
    },
    mobile: {
      id: "mobile",
      name: "mobile",
      label: "Mobile No",
      placeholderText: "Mobile",
      requiredMessage: "Mobile is required",
      validationMessage: "Please enter at least 10 characters.",
      value: [""],
    },
    message: {
      id: "message",
      name: "message",
      label: "Message",
      placeholderText: "Upto 4000 characters allowed",
      requiredMessage: "Message is Required",
      validationMessage: "Character left: ",
      value: [""],
    },
    model: {
      id: "model",
      name: "model",
      label: "",
      placeholderText: "Select Vehicle",
      requiredMessage: "Please enter valid Car Model",
      validationMessage: "Please enter valid Car Model",
      value: [""],
    },
    name: {
      id: "name",
      name: "name",
      label: "Name",
      placeholderText: "Name",
      requiredMessage: "Name is required",
      validationMessage: "",
      value: [""],
    },
    otp: {
      id: "otp",
      name: "otp",
      label: "OTP",
      placeholderText: "Type OTP",
      requiredMessage: "OTP is required",
      validationMessage: "Resend OTP in ",
      value: [""],
    },
    state: {
      id: "state",
      name: "state",
      label: "",
      placeholderText: "",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
    selectDay: {
      id: "select-day",
      name: "selectDay",
      label: "DD",
      placeholderText: "DD",
      requiredMessage: "Please select Day",
      validationMessage: "",
      value: [""],
    },
    selectMonth: {
      id: "select-month",
      name: "selectMonth",
      label: "MM",
      placeholderText: "MM",
      requiredMessage: "Please select Month",
      validationMessage: "",
      value: [""],
    },
    transmission: {
      id: "transmission",
      name: "transmission",
      label: "Select Transmission",
      placeholderText: "",
      requiredMessage: "",
      validationMessage: "",
      value: ["Automatic:A", "Manual:M"],
    },
    testDriveAt: {
      id: "test-drive-at",
      name: "testDriveAt",
      label: "Test Drive at",
      placeholderText: "",
      requiredMessage: "",
      validationMessage: "",
      value: ["SHOWROOM:D", "DOORSTEP:C"],
    },
    pincode: {
      id: "pincode",
      name: "pincode",
      label: "Pincode",
      placeholderText: "Pincode",
      requiredMessage: "Please Enter Your Pincode",
      validationMessage: "",
      value: [""],
    },
    fuelType: {
      id: "fuel-type",
      name: "fuelType",
      label: "",
      placeholderText: "Select fuel type ",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
    firstName: {
      id: "first-name",
      name: "firstName",
      label: "",
      placeholderText: "First Name",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
    lastName: {
      id: "last-name",
      name: "lastName",
      label: "",
      placeholderText: "Last Name",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
    phoneNumber: {
      id: "phone-number",
      name: "phoneNumber",
      label: "",
      placeholderText: "Phone Number",
      requiredMessage: "",
      validationMessage: "",
      value: [""],
    },
  });
});

document.write(await readFile({ path: "./book-test-drive.plain.html" }));

describe("Book test drive Block", () => {
  let block;

  beforeEach(async () => {
    block = document.querySelector(".book-test-drive");
    await decorate(block);
  });
  
  afterEach(() => {
    block.innerHTML = "";
  });

  xit("Should render Book test drive", async () => {
    expect(block.querySelectorAll(".container").length).to.equal(1);
    const nextButton = block.querySelector(".next-btn");
    const steps = block.querySelectorAll(".step");

    expect(steps[0].classList.contains("selected")).to.be.true; // Step 1 selected initially
    nextButton.click();
  });

  after(() => {
    // Clean up the mock from `window`
    delete window.getFormData;
  });
});
