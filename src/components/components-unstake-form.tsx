'use client'

import { useState } from 'react'
import { Box, VStack, Text, Input, Button, useColorModeValue } from '@chakra-ui/react'
import { ethers } from 'ethers'

interface UnstakeFormProps {
  stakingContract: ethers.Contract;
}

export function UnstakeFormComponent({ stakingContract }: UnstakeFormProps) {
  const [sessionId, setSessionId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  const handleUnstake = async () => {
    if (!sessionId) return
    setIsLoading(true)
    try {
      const unstakeTx = await stakingContract.unstake(sessionId)
      await unstakeTx.wait()
      setSessionId('')
    } catch (error) {
      console.error('Unstaking error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="red.500">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="red.400">Unstake Tokens</Text>
        <Input
          placeholder="Enter session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          borderColor="red.500"
          _hover={{ borderColor: 'red.600' }}
          _focus={{ borderColor: 'red.700' }}
        />
        <Button 
          onClick={handleUnstake} 
          colorScheme="red" 
          width="full"
          isLoading={isLoading}
          loadingText="Unstaking..."
        >
          Unstake
        </Button>
      </VStack>
    </Box>
  )
}