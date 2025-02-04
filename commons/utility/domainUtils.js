import { fetchPlaceholders } from '../scripts/aem.js';

const sdkDetails = {
  dev: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  qa: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  int: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  uat: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  stage: '4a2l0s76d0ghrp5rpgmpv3q4u4',
  prod: '12qn3n7ll2rlh2obhtc72aooqh',
};

const configuration = {
  dev: {
    apiUrl: 'https://jn0nyy4gc1.execute-api.ap-south-1.amazonaws.com/common-crm/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  qa: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  int: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  uat: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  stage: {
    apiUrl: 'https://a0xgq4nm9a.execute-api.ap-south-1.amazonaws.com/common-crm-qa/api/ebook/',
    paymentGateWayUrl: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'ATEL90HB40AO02LEOA',
    datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
    profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  },
  prod: {
    apiUrl: 'https://www.cf.msilcrm.co.in/ebook-prod/api/ebook/',
    paymentGateWayUrl: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    transactionAccessCode: 'AVVO65LB90CC10OVCC',
    datastreamId: '1659483b-5319-4e87-a570-63c9e3ad2eab',
    profileEnabledDataStreamId: '896efaa8-a071-41a5-b150-20fe3faafbd5',
  },

};

const environements = {
  dev: ['localhost', 'msildigital.aem.live', 'dev-arena.marutisuzuki.com', 'dev-nexa.marutisuzuki.com'],
  qa: ['qa-arena.marutisuzuki.com', 'qa-nexa.marutisuzuki.com'],
  int: ['int-arena.marutisuzuki.com', 'int-nexa.marutisuzuki.com'],
  uat: ['uat-arena.marutisuzuki.com', 'uat-nexa.marutisuzuki.com'],
  stage: ['stage-arena.marutisuzuki.com', 'stage-nexa.marutisuzuki.com'],
  prod: ['prod-nexa.marutisuzuki.com', 'nexaexperience.com'],
};

const keyword = Object.keys(environements);
const url = window.location.href;
const environmentSelection = {
  /**
   * To get the SDK key which is used for AWS Amplify setup
   * This is required for regester and login functionality
   * @returns {SDK Number} string
   */
  getSdkNumber: () => {
    const keyValue = environmentSelection.getEnvironment();
    return sdkDetails[keyValue];
  },
  /**
   * To get the current channel id whether it is nexa or arena
   * @returns {channel id} string
   */
  getChannel: async () => {
    const { channelId } = await fetchPlaceholders();
    return (channelId);
  },
  /**
  * To get the details of the requested value based on environment
  * @param {keyword to get the value} param
  * @returns {requested value} string
  */
  getConfiguration: (param) => {
    let config = '';
    keyword.forEach((value) => {
      environements[value].forEach((val1) => {
        if (environements[value].includes(val1) && url.includes(val1)) {
          config = configuration[value];
        }
      });
    });
    return config[param];
  },
  /**
   * To get the environemnt name on request
   * @returns {environemnt value} string
   */
  getEnvironment: () => {
    let env = '';
    keyword.forEach((value) => {
      environements[value].forEach((val1) => {
        if (environements[value].includes(val1) && url.includes(val1)) {
          env = value;
        }
      });
    });
    return env;
  },
};

export default environmentSelection;
