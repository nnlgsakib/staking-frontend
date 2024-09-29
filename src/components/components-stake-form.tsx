'use client'

import { useState } from 'react'
import { Box, VStack, Text, Input, Button, useColorModeValue } from '@chakra-ui/react'
import { ethers } from 'ethers'

interface StakeFormProps {
  stakingContract: ethers.Contract;
  stakingTokenContract: ethers.Contract;
}

export function StakeFormComponent({ stakingContract, stakingTokenContract }: StakeFormProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  const handleStake = async () => {
    if (!amount) return
    setIsLoading(true)
    try {
      const amountWei = ethers.utils.parseEther(amount)
      const approveTx = await stakingTokenContract.approve(stakingContract.address, amountWei)
      await approveTx.wait()
      const stakeTx = await stakingContract.stake(amountWei)
      await stakeTx.wait()
      setAmount('')
    } catch (error) {
      console.error('Staking error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="blue.500">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="blue.400">Stake Tokens</Text>
        <Input
          placeholder="Enter amount to stake"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          borderColor="blue.500"
          _hover={{ borderColor: 'blue.600' }}
          _focus={{ borderColor: 'blue.700' }}
        />
        <Button 
          onClick={handleStake} 
          colorScheme="blue" 
          width="full"
          isLoading={isLoading}
          loadingText="Staking..."
        >
          Stake
        </Button>
      </VStack>
    </Box>
  )
}