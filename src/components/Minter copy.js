import * as React from 'react';
import { useEffect, useState } from "react";
import { 
  Box, Card, CardContent, CardMedia, Slide,
  Typography, Button, Chip, Alert, AlertTitle, Stack,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,
  Tooltip, CircularProgress, TableContainer, Paper, Table, TableBody, TableCell, TableRow,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Collapse, Link, InputLabel, Select, MenuItem,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckIcon from '@mui/icons-material/Check';
import MintIcon from '@mui/icons-material/Autorenew';
import FaceIcon from '@mui/icons-material/FaceOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import dayjs from 'dayjs';
import Countdown from "react-countdown";
import WalletConnectProvider from '@walletconnect/web3-provider';

import avatar from '../assets/images/nft-avatar.png';
import { onMetaMaskConnect, getConnectedMetaMaskWallet, infuraId, web3 } from "../auth";
import { mintNFT } from '../interacts/interactNftFactory';
import { getNftFactoryMetaData } from '../interacts/interactNftFactory';
import { approve } from '../interacts/interactIERC20';
import { isValidAddress } from '../interacts/interact_base';
import WalletConnectIcon from '../assets/images/walletconnect.svg';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const MINT_ACTION = 'MINT';
const APPROVE_ACTION = 'APPROVE';

const MINTER_ME = 'ME';
const MINTER_OTHER = 'OTHER';


const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState(null);
  const [open, setOpen] = useState(false);
  const [nftMetaData, setNFTMetaData] = useState(null);
  const [mintDate, setMintDate] = useState(null);
  const [mintable, setMintable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [action, setAction] = useState(null);
  const [limit, setLimit] = useState(1);
  const [minter, setMinter] = useState(MINTER_ME);
  const [minterAddress, setMinterAddress] = useState(null);
  const [isValidMinterAddress, setIsValidMinterAddress] = useState(true);
  const [response, setResponse] = useState(null);
  const [provider, setWalletProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [network, setNetwork] = useState(null);
 
  function addMetaMaskListeners() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setLoading(true);
          setWallet(accounts[0]);
        } else {
          resetApp();
        }
      });
    } else {
      setResponse({
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
      })
    }
  }

  const resetApp = () => {
    setWallet(null);
    setResponse(null);
    setNFTMetaData(null);
    setMintDate(null);
    setAction(null);
  }

  useEffect(async () => {
    let response = await getConnectedMetaMaskWallet();
    if (!response.address) {
      response = await getConnectedWalletConnect();
      if (!response.address) {
        setLoading(false);
      }
    }
    setWallet(response.address)
    setResponse(response);
    addMetaMaskListeners();
  }, []);


  useEffect(async () => {
    // Fetch NFT metadata
    if (walletAddress) {
      const nftMetaData = await getNftFactoryMetaData(walletAddress);
      console.log(nftMetaData);
      const currentTimeStamp = dayjs().unix();
      const mintTimeStamp = nftMetaData.data.START_MINT_DATE;
      setNFTMetaData(nftMetaData.data);
      setMintDate(dayjs.unix(mintTimeStamp).format('DD/MM/YYYY HH:mm'));
      if (currentTimeStamp < mintTimeStamp) {
        setMintable(false);
      }
      setLoading(false);
    }
    
  }, [walletAddress]);


  const onMetaMaskPressed = async () => {
    const response = await onMetaMaskConnect();
    setResponse(response);
    setWallet(response.address);
  };

  const getConnectedWalletConnect = async () => {
    //  Create WalletConnect Provider
    const provider = new WalletConnectProvider({
      infuraId: infuraId,
    });
    try {
      setWalletProvider(provider);
      // await provider.disconnect();
      if (provider.connector.connected) {
        //  Enable session (triggers QR Code modal)
        await provider.enable();
        web3.setProvider(provider);
        const accounts = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        const networkId = await web3.eth.net.getId();
        setChainId(chainId);
        setNetwork(networkId);
        if(accounts.length > 0) {
          return {
            address: accounts[0]
          }
        }
        return {
          address: null
        }
      } 
      return {
        address: null
      };
    }
    catch(error) {
      return {
        address: null
      };
    }
  }

  const onWalletConnectPressed = async () => {   
    try {
      //  Enable session (triggers QR Code modal)
      await provider.enable();

      // await provider.disconnect();
      web3.setProvider(provider);
      
      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setLoading(true)
          setWallet(accounts[0]);
        }
        else {
          resetApp();
        }
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        setChainId(chainId);
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        resetApp();
      });
    }
    catch(error) {
    }
  };

  // const onApprovePressed = () => {
  //   setAction(APPROVE_ACTION);
  //   setOpen(true);
  // };

  const onMintPressed = () => {
    setAction(MINT_ACTION);
    setOpen(true);
  };

  const handleClose = () => {
    setAction(null);
    setOpen(false);
    setIsValidMinterAddress(true);
    setMinterAddress(null);
    setMinter(MINTER_ME);
  };

  const onSubmitDialog = async () => {
    setLoading(true);
    if( action === MINT_ACTION ) {
      let response;
      if (minter === MINTER_OTHER) {
        if (!minterAddress || !isValidAddress(minterAddress)) {
          setIsValidMinterAddress(false);
          setLoading(false);
          return false;
        }
        response = await mintNFT(limit, minterAddress);
      }
      else {
        response = await mintNFT(limit, walletAddress);
      }

      setResponse(response);
    }
    else {
      const balance = parseFloat(nftMetaData.ERC20_BALANCE.slice(0, -(parseInt(nftMetaData.ERC20_DECIMAL))))
      const response = await approve(walletAddress, nftMetaData.ERC20_ADDRESS, balance);
      setResponse(response);
    }
    handleClose();
    setLoading(false);
  }

  const formatAmount = (_amount, _decimal) => {
    if (parseFloat(_amount) === 0) {
      return 0;
    }

    return parseFloat(_amount.slice(0, -(parseInt(_decimal))));
  }

  // Renderer callback with condition
  const counterRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      if (!mintable) {
        setMintable(true);
      }
      return mintDate;
    } else {
      return (
        <Alert severity={'info'}>
          <AlertTitle>Minting is available in </AlertTitle>
          {days}<b>days</b> {hours}<b>h</b> {minutes}<b>m</b> {seconds}<b>s</b>
        </Alert>
      );
    }
  };

  const alert = response?.alert;
  return (
    <div className="minter">
      {alert && 
        <Alert severity={alert.type} sx={{marginBottom: 3}}>
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.htmlBody ?? alert.body}
        </Alert>
      }
      <Card sx={{ 
        display: 'flex', 
        position: 'relative', 
        overflow: 'hidden', 
        boxShadow: 3,
      }}>
        <CardMedia
          component="img"
          sx={{ width: '50%', minHeight: 280, objectFit: 'cover' }}
          image={avatar}
          alt="Live from space album cover"
        />
        {
          (loading && !nftMetaData) || loggingOut ?
          <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>:
          <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            {
              !nftMetaData ?
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                flex: 1,
                padding: 3
              }}>
                <Stack spacing={3} alignItems='center' textAlign='center'>
                  <Stack>
                    <Typography variant="h5" gutterBottom color={'#000'}>
                      Connect your Wallet
                    </Typography>
                    <Typography variant="body1" gutterBottom color={'grey'}>
                      In order to start Minting NFTs, you have to connect your Wallet.
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    <Button variant="contained" size="large" onClick={onMetaMaskPressed}>
                    🦊 MetaMask
                    </Button>
                    <Button variant="contained" size="large" onClick={onWalletConnectPressed}>
                      <img src={WalletConnectIcon} style={{
                        marginRight: 5,
                        height: 12,
                      }} />
                      WalletConnect
                    </Button>
                  </Stack>
                </Stack>
              </Box>:
              <>
                <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}> 
                    <Tooltip arrow placement='top' title={'Connected: ' + walletAddress}>
                      <Chip icon={<FaceIcon />} color="success" label={
                        String(walletAddress).substring(0, 6) +
                        "..." +
                        String(walletAddress).substring(38)
                      } variant="outlined" />
                    </Tooltip>
                    {
                      provider && provider.connector.connected &&
                      <IconButton color='error' onClick={async () => {
                        setLoggingOut(true);
                        setTimeout(async() => {
                          resetApp();
                          await provider.disconnect();
                          setLoggingOut(false);
                        }, 1000)
                      }}>
                        <LogoutIcon />
                      </IconButton>
                    }
                  </Stack>
                </Box>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                      <TableBody>
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            1 NFT
                          </TableCell>
                          <TableCell align="right">{formatAmount(nftMetaData.AMOUNT_PER_UNIT, nftMetaData.ERC20_DECIMAL)} {nftMetaData.ERC20_SYMBOL}</TableCell>
                        </TableRow>
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            Name
                          </TableCell>
                          <TableCell align="right">{nftMetaData.ERC20_NAME}</TableCell>
                          <TableCell align="right">{nftMetaData.ERC20_NAME}</TableCell>
                        </TableRow>
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            Balance
                          </TableCell>
                          <TableCell align="right">{formatAmount(nftMetaData.ERC20_BALANCE, nftMetaData.ERC20_DECIMAL)} {nftMetaData.ERC20_SYMBOL}</TableCell>
                        </TableRow>
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            Mint Date
                          </TableCell>
                          <TableCell align="right">
                            <Countdown date={parseInt(nftMetaData.START_MINT_DATE)} renderer={counterRenderer}  />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>

                {
                  formatAmount(nftMetaData.ERC20_BALANCE, nftMetaData.ERC20_DECIMAL) > 0 ? 
                  <Box padding={2}>
                    {/* {
                      nftMetaData.ERC20_IS_APROUVED === "0" &&
                      <Alert severity="success">
                        <AlertTitle>Approve</AlertTitle>
                        You already can approve the contract !
                      </Alert>
                    } */}
                    <Stack direction='row' sx={{ justifyContent: 'flex-end', marginTop: 3 }} spacing={2}>
                      {/* <Button
                        color="success" 
                        variant="outlined" 
                        style={{borderWidth: 3}} 
                        onClick={onApprovePressed} 
                        startIcon={<CheckIcon />}
                        disabled={nftMetaData.ERC20_IS_APROUVED !== "0"}
                      >
                        {nftMetaData.ERC20_IS_APROUVED !== "0" ? 'Approved' : 'Approve'}
                      </Button> */}
                      <FormControl>
                        <InputLabel id="mint-limit">Limit</InputLabel>
                        <Select
                          labelId="mint-limit"
                          sx={{width: 100}}
                          value={limit}
                          label="Limit"
                          onChange={({target}) => setLimit(target.value)}
                        >
                          {
                            Array(parseInt(nftMetaData.LIMIT_PER_TRASAC)).fill(1).map((value, index) => (
                              <MenuItem value={value + index}>{value + index}</MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                      
                      <Button
                        variant="contained" 
                        onClick={onMintPressed} 
                        startIcon={<MintIcon />}
                        disabled={!mintable}
                      >
                        Mint
                      </Button>
                    </Stack>
                  </Box>:
                  <Box padding={2}>
                    <Alert severity="error" sx={{marginBottom: 3}}>
                      <AlertTitle>Empty balance</AlertTitle>
                      Your current balance is empty, you have to swap before being able to start Minting.
                    </Alert>
                    <Button fullWidth variant='outlined' rel="noreferrer" href="https://app.uniswap.org/#/swap?chain=mainnet" target="_blank">
                      SWAP NOW
                    </Button>
                  </Box>
                }
                
                <Dialog
                  open={open}
                  TransitionComponent={Transition}
                  keepMounted
                  onClose={handleClose}
                  aria-describedby="alert-dialog-slide-description"
                  fullWidth
                >
                  <DialogTitle>{action === MINT_ACTION ? "NFT Minting" : "Contract Approval"}</DialogTitle>
                  <DialogContent>
                    {action === MINT_ACTION ?
                      <Box
                        component="form"
                        sx={{
                          '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                      >
                        <Stack spacing={3} direction='column'>
                          <Typography>
                            You are going to mint {limit}X NFT for a total of: {formatAmount(nftMetaData.AMOUNT_PER_UNIT, nftMetaData.ERC20_DECIMAL) * limit} {nftMetaData.ERC20_SYMBOL}
                          </Typography>
                          <FormControl>
                            <FormLabel id="demo-radio-buttons-group-label">For whom you're going to mint ?</FormLabel>
                            <RadioGroup
                              aria-labelledby="demo-radio-buttons-group-label"
                              value={minter}
                              name="radio-buttons-group"
                              onChange={({target}) => setMinter(target.value)}
                            >
                              <FormControlLabel value={MINTER_ME} control={<Radio />} label="Me" />
                              <FormControlLabel value={MINTER_OTHER} control={<Radio />} label="Other" />
                            </RadioGroup>
                          </FormControl>
                         
                          <Collapse direction="up" in={minter === MINTER_OTHER} mountOnEnter unmountOnExit>
                            <FormControl fullWidth>
                              <FormLabel id="other-address">Fill in the Address</FormLabel>
                              <TextField
                                required
                                id="other-address"
                                label="Address"
                                placeholder='0xc1912fee45d61c87cc5ea59dae31190fffff232d'
                                style={{width: '100%', marginLeft: 0}}
                                onChange={({target}) => setMinterAddress(target.value)}
                                value={minterAddress || ''}
                                error={!isValidMinterAddress}
                                helperText={!isValidMinterAddress && 'Please enter a valid address (Ex: 0xc1912fee45d61c87cc5ea59dae31190fffff232d).'}
                              />
                            </FormControl>
                          </Collapse>
                        </Stack>
                      </Box> :
                      <DialogContentText id="alert-dialog-slide-description">
                        Do you really want to approve the contract ?
                      </DialogContentText>
                    }
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    
                    <LoadingButton
                      loading={loading}
                      onClick={onSubmitDialog}
                    >
                      Accept & Submit
                    </LoadingButton>
                  </DialogActions>
                </Dialog>
              </>
            }
          </Box>
        }
      </Card>
    </div>
  );
};

export default Minter;
