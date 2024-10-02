import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ScalableStakingEngine_ABI } from '@/app/abi/ScalableStakingEngine';
import { ERC20_ABI } from '@/app/abi/ERC20';

declare global {
  interface Window {
    ethereum: any;
  }
}

const STAKING_CONTRACT_ADDRESS = '0xffA691763c147dF91e073270e6244ADf94C3Ad43';
const STAKING_TOKEN_ADDRESS = '0xF29945310FB89F2AA76Fb00EE758dEa72a1D8B0d';

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null);
  const [stakingTokenContract, setStakingTokenContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0'); // Native ETH balance
  const [userTokenBalance, setUserTokenBalance] = useState('0'); // Token balance
  const [totalStakedTokens, setTotalStakedTokens] = useState('0');
  const [userStaked, setUserStaked] = useState('0');
  const [apr, setApr] = useState(0);
  const [rewardsEarned, setRewardsEarned] = useState('0');
  const [gasPrice, setGasPrice] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [latestTx, setLatestTx] = useState({ hash: '', status: '' });

  const loadWeb3Data = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request accounts from MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Initialize provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = ethers.utils.formatEther(await provider.getBalance(address)); // ETH balance

        setProvider(provider);
        setSigner(signer);
        setIsConnected(true);
        setAddress(address);
        setBalance(balance);

        // Initialize contracts
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, ScalableStakingEngine_ABI, signer);
        const stakingTokenContract = new ethers.Contract(STAKING_TOKEN_ADDRESS, ERC20_ABI, signer);
        setStakingContract(stakingContract);
        setStakingTokenContract(stakingTokenContract);

        // Fetch initial data
        await fetchStakingData(stakingContract, address);
        await fetchTokenBalance(stakingTokenContract, address); // Fetch token balance
        await checkAllowance(stakingTokenContract, address);
        await fetchGasPrice(provider);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  // Fetch token balance from the staking token contract
  const fetchTokenBalance = async (tokenContract: ethers.Contract, userAddress: string) => {
    try {
      const tokenBalance = await tokenContract.balanceOf(userAddress);
      setUserTokenBalance(ethers.utils.formatEther(tokenBalance));
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  // Fetch staking data (total staked, user staked, APR, rewards)
  const fetchStakingData = async (stakingContract: ethers.Contract, userAddress: string) => {
    try {
      const totalStaked = ethers.utils.formatEther(await stakingContract.getTotalStakedTokens());
      setTotalStakedTokens(totalStaked);

      const userStaked = ethers.utils.formatEther(await stakingContract.getTotalStakedByUser(userAddress));
      setUserStaked(userStaked);

      const apr = await stakingContract.getCurrentProfitPercent();
      setApr(apr.toNumber());

      const rewardsEarned = ethers.utils.formatEther(await stakingContract.totalUnlockedReward(userAddress));
      setRewardsEarned(rewardsEarned);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  };

  // Check the user's token allowance
  const checkAllowance = async (tokenContract: ethers.Contract, userAddress: string) => {
    try {
      const allowance = await tokenContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS);
      setAllowance(ethers.utils.formatEther(allowance));
    } catch (error) {
      console.error('Error checking allowance:', error);
    }
  };

  // Fetch the current gas price from the provider
  const fetchGasPrice = async (provider: ethers.providers.Web3Provider) => {
    try {
      const gasPrice = await provider.getGasPrice();
      setGasPrice(ethers.utils.formatUnits(gasPrice, 'gwei'));
    } catch (error) {
      console.error('Error fetching gas price:', error);
    }
  };

  // Approve tokens for staking
  const approveTokens = async (amount: string) => {
    if (!stakingTokenContract || !signer) return;
    const amountInWei = ethers.utils.parseEther(amount);
    const txApprove = await stakingTokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
    setLatestTx({ hash: txApprove.hash, status: 'pending' });
    await txApprove.wait();
    setLatestTx({ hash: txApprove.hash, status: 'confirmed' });
    checkAllowance(stakingTokenContract, address);
  };

  // Stake tokens
  const stake = async (amount: string) => {
    if (!stakingContract || !signer) return;
    const amountInWei = ethers.utils.parseEther(amount);
    const txStake = await stakingContract.stake(amountInWei);
    setLatestTx({ hash: txStake.hash, status: 'pending' });
    await txStake.wait();
    setLatestTx({ hash: txStake.hash, status: 'confirmed' });
    fetchStakingData(stakingContract, address);
  };

  // Unstake tokens
  const unstake = async (sessionId: number) => {
    if (!stakingContract) return;
    const txUnstake = await stakingContract.unstake(sessionId);
    setLatestTx({ hash: txUnstake.hash, status: 'pending' });
    await txUnstake.wait();
    setLatestTx({ hash: txUnstake.hash, status: 'confirmed' });
    fetchStakingData(stakingContract, address);
  };

  // Withdraw rewards
  const withdrawRewards = async () => {
    if (!stakingContract) return;
    const txWithdraw = await stakingContract.withdrawRewards();
    setLatestTx({ hash: txWithdraw.hash, status: 'pending' });
    await txWithdraw.wait();
    setLatestTx({ hash: txWithdraw.hash, status: 'confirmed' });
    fetchStakingData(stakingContract, address);
  };

  // Auto load data when the hook is first mounted
  useEffect(() => {
    loadWeb3Data();
  }, []);

  return {
    connectWallet: loadWeb3Data,
    isConnected,
    address,
    balance,
    userTokenBalance, // Expose token balance
    totalStakedTokens,
    userStaked,
    apr,
    rewardsEarned,
    allowance,
    gasPrice, // Added gas price
    stake,
    unstake,
    withdrawRewards,
    approveTokens,
    latestTx,
    checkAllowance,
    stakingTokenContract,
    stakingContract,
  };
}
