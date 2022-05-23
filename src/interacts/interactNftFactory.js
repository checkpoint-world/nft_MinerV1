import { contractAddressNftFactory, ContractNftFactory } from "./interact_base";

export const getNftFactoryMetaData = async (_address) => {
  try {
      const data1 = await ContractNftFactory.methods.getMetadata().call({ from: _address });
      const data2 = [];
      data1.value.forEach((element, index) => {
          data2[data1.key[index]] = element;
      });
      return {
          data: data2,
          contract: contractAddressNftFactory,
          status: true
      };
  } catch (error) {
      return {
          status: false,
          contract: contractAddressNftFactory,
          data: error
      };
  };
};

// NFT Factory Mint => Error not a function
export const mintNFT = async (_amount, _address) => {

  const _valueHex = (_amount*1000000000000000000).toString(16);
  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddressNftFactory, // Required except during contract publications.
    from: _address,
    data: ContractNftFactory.methods.mintNft(_amount).encodeABI(), //make call to NFT smart contract 
    value: _valueHex,
  };

  //sign transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters], 
    });
    return {
      alert: {
        type: 'success',
        title: 'Congrats',
        body: `Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/${txHash}`
      }
    }
  } catch (error) {
    return {
      alert: {
        type: 'error',
        title: 'Error',
        body: `Something went wrong: ${error.message}`
      }
    }
  }
};
