import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import Web3 from 'web3';

require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
export const infuraId = process.env.REACT_APP_INFURA_ID;
export const web3 = new Web3(alchemyKey);

export const onMetaMaskConnect = async () => {
  if (window.ethereum) {
    web3.setProvider(window.ethereum)
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: null,
        alert: {
          type: 'error',
          title: 'Error',
          body: err.message,
        }
      };
    }
  } else {
    return {
      address: null,
      alert: {
        type: 'error',
        title: '🦊 Metamask installation required',
        body: null,
        htmlBody: (
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        )
      }
    };
  }
};

export const getConnectedMetaMaskWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
        };
      } else {
        return {
          address: null,
        };
      }
    } catch (err) {
      return {
        address: null,
        alert: {
          type: 'error',
          title: 'Error',
          body: err.message,
        }
      };
    }
  } else {
    return {
      address: null,
      alert: {
        type: 'error',
        title: '🦊 Metamask installation required',
        body: null,
        htmlBody: (
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        )
      }
    };
  }
};