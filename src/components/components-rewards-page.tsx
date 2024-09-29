'use client'

import { useState, useEffect } from 'react'
import { Box, VStack, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { ethers } from 'ethers'

interface RewardsPageProps {
  stakingContract: ethers.Contract;
}

export function RewardsPageComponent({ stakingContract }: RewardsPageProps) {
  const [rewardsAmount, setRewardsAmount] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewards = await stakingContract.totalUnlockedReward(await stakingContract.signer.getAddress())
        setRewardsAmount(ethers.utils.formatEther(rewards))
      } catch (error) {
        console.error('Error fetching rewards:', error)
      }
    }
    fetchRewards()
  }, [stakingContract])

  const handleWithdraw = async () => {
    setIsLoading(true)
    try {
      const withdrawTx = await stakingContract.withdrawRewards()
      await withdrawTx.wait()
      setRewardsAmount('0')
    } catch (error) {
      console.error('Withdrawal error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="yellow.500">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="yellow.400">Withdraw Rewards</Text>
        <Text>Available Rewards: {rewardsAmount} Tokens</Text>
        <Button 
          onClick={handleWithdraw} 
          colorScheme="yellow" 
          width="full"
          isLoading={isLoading}
          loadingText="Withdrawing..."
          isDisabled={parseFloat(rewardsAmount) === 0}
        >
          Withdraw Rewards
        </Button>
      </VStack>
    </Box>
  )
}