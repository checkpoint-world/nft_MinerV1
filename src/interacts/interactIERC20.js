import { contractAddressErc20Test, ContractIERC20 } from "./interact_base";

export const approve = async (_address, _ierc20address, _amount) => {
  try {
    const transactionParameters = {
      to: contractAddressErc20Test,
      from: _address,
      data: ContractIERC20.methods.approve(_ierc20address, _amount).encodeABI(),
    };
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    })
    return {
      data: txHash,
      contract: contractAddressErc20Test,
      hash: txHash,
      alert: {
        type: 'success',
        title: 'Congrats',
        body: 'Contract approved successfully'
      }
    };
  } catch (error) {
    return {
      status: false,
      data: error,
      contract: contractAddressErc20Test,
      alert: {
        type: 'error',
        title: 'Error',
        body: `Something went wrong: ${error.message}`
      }
    };
  };
};