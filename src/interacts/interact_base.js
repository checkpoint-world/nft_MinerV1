import { createAlchemyWeb3 } from '@alch/alchemy-web3';
require('dotenv').config();

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const web3 = createAlchemyWeb3(alchemyKey);
const contractABIErc721 = require('../abis/erc721-abi.json');
const contractABIIerc20 = require('../abis/ierc20-abi.json');
const contractABINftFactory = require('../abis/nft-factory-abi.json');

// export const contractAddressErc721 = "0xe8eE012BF57c8d2e170Ff0481936068f73d58D9E";
//export const contractAddressNftFactory = "0x0753bE65Aff2F1f9465A0dDd3566eB6910e8B868";
export const contractAddressErc721 = "0xBF3e27995D48fb79c12d16d2671c5e6246b79F9d";
export const contractAddressNftFactory = "0x792bcd7a8487E65bc866916AAc16994e81194495";
export const contractAddressErc20Test = "0xE462b3Ed2e3331F9d3A2c4CF554136B27a398744";

export const ContractErc721 = new web3.eth.Contract(
  contractABIErc721,
  contractAddressErc721
);

export const ContractNftFactory = new web3.eth.Contract(
  contractABINftFactory,
  contractAddressNftFactory
);

export const ContractIERC20 = new web3.eth.Contract(
  contractABIIerc20,
  contractAddressErc20Test
);

export const isValidAddress = (address) => web3.utils.isAddress(address);