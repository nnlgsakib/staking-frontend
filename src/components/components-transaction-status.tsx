'use client'

import { HStack, Box, Text } from '@chakra-ui/react'

interface TransactionStatusProps {
  txHash: string;
  status: string;
}

export function TransactionStatusComponent({ txHash, status }: TransactionStatusProps) {
  const statusColor = status === 'success' ? 'green' : status === 'pending' ? 'yellow' : 'red'
  
  return (
    <HStack>
      <Text fontSize="sm">Latest TX:</Text>
      <Text fontSize="sm" color={`${statusColor}.500`}>{`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}</Text>
      <Box w={2} h={2} borderRadius="full" bg={`${statusColor}.500`} />
    </HStack>
  )
}