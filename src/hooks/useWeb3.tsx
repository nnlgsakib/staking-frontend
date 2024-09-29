import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
// import ScalableStakingEngineABI from '@/abi/ScalableStakingEngine.json'
// import ERC20ABI from '@/abi/ERC20.json'

const STAKING_CONTRACT_ADDRESS = '0x...' // Replace with actual contract address
const STAKING_TOKEN_ADDRESS = '0x...' // Replace with actual token address

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null)
  const [stakingTokenContract, setStakingTokenContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [network, setNetwork] = useState('')
  const [latestTx, setLatestTx] = useState({ hash: '', status: '' })
  const [gasPrice, setGasPrice] = useState('0')
  const [totalStaked, setTotalStaked] = useState('0')
  const [userStaked, setUserStaked] = useState('0')
  const [apr, setApr] = useState(0)
  const [rewardsEarned, setRewardsEarned] = useState('0')

  const connectWallet = async (walletType: string) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        const balance = ethers.utils.formatEther(await provider.getBalance(address))
        const network = (await provider.getNetwork()).name

        setProvider(provider)
        setSigner(signer)
        setIsConnected(true)
        setAddress(address)
        setBalance(balance)
        setNetwork(network)

        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, ScalableStakingEngineABI, signer)
        const stakingTokenContract = new ethers.Contract(STAKING_TOKEN_ADDRESS, ERC20ABI, signer)

        setStakingContract(stakingContract)
        setStakingTokenContract(stakingTokenContract)

        // Fetch initial data
        updateStakingData(stakingContract, address)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
        alert('Please install a Web3 wallet like MetaMask to connect')
    }
  }

  const updateStakingData = async (stakingContract: ethers.Contract, userAddress: string) => {
    try {
      // Fetch total staked amount in the contract
      const totalStaked = ethers.utils.formatEther(await stakingContract.totalStaked())
      setTotalStaked(totalStaked)

      // Fetch user's staked amount
      const userStaked = ethers.utils.formatEther(await stakingContract.stakedBalanceOf(userAddress))
      setUserStaked(userStaked)

      // Fetch APR (Annual Percentage Rate)
      const apr = await stakingContract.getApr() // Assume APR is returned as an integer
      setApr(apr)

      // Fetch rewards earned by the user
      const rewardsEarned = ethers.utils.formatEther(await stakingContract.earned(userAddress))
      setRewardsEarned(rewardsEarned)
    } catch (error) {
      console.error('Failed to update staking data:', error)
    }
  }

  const fetchGasPrice = async () => {
    try {
      const gasPrice = await provider?.getGasPrice()
      setGasPrice(ethers.utils.formatUnits(gasPrice || '0', 'gwei'))
    } catch (error) {
      console.error('Failed to fetch gas price:', error)
    }
  }

  useEffect(() => {
    if (isConnected && provider) {
      // Fetch gas price periodically
      const gasPriceInterval = setInterval(fetchGasPrice, 10000) // Fetch every 10 seconds
      return () => clearInterval(gasPriceInterval)
    }
  }, [isConnected, provider])

  return {
    connectWallet,
    isConnected,
    address,
    balance,
    network,
    gasPrice,
    totalStaked,
    userStaked,
    apr,
    rewardsEarned,
    latestTx,
  }
}
