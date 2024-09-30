import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ScalableStakingEngine_ABI } from '@/app/abi/ScalableStakingEngine';
import { ERC20_ABI } from '@/app/abi/ERC20';

declare global {
  interface Window {
    ethereum: any;
  }
}

const STAKING_CONTRACT_ADDRESS = '0xAc86D91BC732b00568Baf551470122da98f38fb9';
const STAKING_TOKEN_ADDRESS = '0xF29945310FB89F2AA76Fb00EE758dEa72a1D8B0d';

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [wsProvider, setWsProvider] = useState<ethers.providers.WebSocketProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null);
  const [stakingTokenContract, setStakingTokenContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState('');
  const [totalStakedTokens, setTotalStakedTokens] = useState('0');
  const [userStaked, setUserStaked] = useState('0');
  const [apr, setApr] = useState(0);
  const [rewardsEarned, setRewardsEarned] = useState('0');
  const [gasPrice, setGasPrice] = useState('0');
  const [latestTx, setLatestTx] = useState({ hash: '', status: '' });
  const [allowance, setAllowance] = useState('0');

  const loadWeb3Data = () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: any) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const wsProvider = new ethers.providers.WebSocketProvider('wss://seednode.mindchain.info/ws');
          const signer = provider.getSigner();
          signer.getAddress().then((address: string) => {
            provider.getBalance(address).then((balance: any) => {
              const formattedBalance = ethers.utils.formatEther(balance);
              provider.getNetwork().then((network: any) => {
                setProvider(provider);
                setWsProvider(wsProvider);
                setSigner(signer);
                setIsConnected(true);
                setAddress(address);
                setBalance(formattedBalance);
                setNetwork(network.name);

                // Initialize contracts
                const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, ScalableStakingEngine_ABI, signer);
                const stakingTokenContract = new ethers.Contract(STAKING_TOKEN_ADDRESS, ERC20_ABI, signer);
                setStakingContract(stakingContract);
                setStakingTokenContract(stakingTokenContract);

                // Fetch all required data
                fetchStakingData(stakingContract, address);
                checkAllowance(stakingTokenContract, address);
              });
            });
          });
        });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install a Web3 wallet like MetaMask to connect');
    }
  };

  const fetchStakingData = (stakingContract: ethers.Contract, userAddress: string) => {
    stakingContract.getTotalStakedTokens().then((totalStaked: any) => {
      setTotalStakedTokens(ethers.utils.formatEther(totalStaked));

      stakingContract.getTotalStakedByUser(userAddress).then((userStaked: any) => {
        setUserStaked(ethers.utils.formatEther(userStaked));

        stakingContract.getCurrentapr().then((apr: any) => {
          setApr(apr.toNumber());
          stakingContract.totalUnlockedReward(userAddress).then((rewards: any) => {
            setRewardsEarned(ethers.utils.formatEther(rewards));
          });
        });
      });
    }).catch((error: any) => {
      console.error('Error fetching staking data:', error);
    });
  };

  const checkAllowance = (tokenContract: ethers.Contract, userAddress: string) => {
    tokenContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS).then((allowance: any) => {
      setAllowance(ethers.utils.formatEther(allowance));
    }).catch((error: any) => {
      console.error('Error checking allowance:', error);
    });
  };

  const stake = (amount: string) => {
    if (!stakingContract || !signer) return;
    const amountInWei = ethers.utils.parseEther(amount);
    stakingContract.stake(amountInWei).then((txStake: any) => {
      setLatestTx({ hash: txStake.hash, status: 'pending' });
      txStake.wait().then(() => {
        setLatestTx({ hash: txStake.hash, status: 'confirmed' });
        fetchStakingData(stakingContract, address);
      }).catch((error: any) => {
        console.error('Error staking tokens:', error);
        setLatestTx({ hash: '', status: 'failed' });
      });
    });
  };

  const unstake = (sessionId: number) => {
    if (!stakingContract) return;
    stakingContract.unstake(sessionId).then((txUnstake: any) => {
      setLatestTx({ hash: txUnstake.hash, status: 'pending' });
      txUnstake.wait().then(() => {
        setLatestTx({ hash: txUnstake.hash, status: 'confirmed' });
        fetchStakingData(stakingContract, address);
      }).catch((error: any) => {
        console.error('Error unstaking tokens:', error);
        setLatestTx({ hash: '', status: 'failed' });
      });
    });
  };

  const withdrawRewards = () => {
    if (!stakingContract) return;
    stakingContract.withdrawRewards().then((txWithdraw: any) => {
      setLatestTx({ hash: txWithdraw.hash, status: 'pending' });
      txWithdraw.wait().then(() => {
        setLatestTx({ hash: txWithdraw.hash, status: 'confirmed' });
        fetchStakingData(stakingContract, address);
      }).catch((error: any) => {
        console.error('Error withdrawing rewards:', error);
        setLatestTx({ hash: '', status: 'failed' });
      });
    });
  };

  const approveTokens = (amount: string) => {
    if (!stakingTokenContract || !signer) return;
    const amountInWei = ethers.utils.parseEther(amount);
    stakingTokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei).then((txApprove: any) => {
      setLatestTx({ hash: txApprove.hash, status: 'pending' });
      txApprove.wait().then(() => {
        setLatestTx({ hash: txApprove.hash, status: 'confirmed' });
        checkAllowance(stakingTokenContract, address);
      }).catch((error: any) => {
        console.error('Error approving tokens:', error);
        setLatestTx({ hash: '', status: 'failed' });
      });
    });
  };

  // Load data when component mounts
  useEffect(() => {
    loadWeb3Data();
  }, []);

  return {
    connectWallet: loadWeb3Data, // Reuse loadWeb3Data to reconnect
    isConnected,
    address,
    balance,
    network,
    gasPrice,
    totalStakedTokens,
    userStaked,
    apr,
    rewardsEarned,
    latestTx,
    allowance,
    stake,
    unstake,
    withdrawRewards,
    approveTokens,
    checkAllowance, // Ensure checkAllowance is returned
    stakingContract,
    stakingTokenContract,
  };
}
