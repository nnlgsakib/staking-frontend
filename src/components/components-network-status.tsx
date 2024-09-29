'use client'

import { HStack, Box, Text } from '@chakra-ui/react'

interface NetworkStatusProps {
  network: string;
}

export function NetworkStatusComponent({ network }: NetworkStatusProps) {
  const networkColor = network === 'Mainnet' ? 'green' : 'orange'
  
  return (
    <HStack>
      <Box w={2} h={2} borderRadius="full" bg={`${networkColor}.500`} />
      <Text fontSize="sm">{network}</Text>
    </HStack>
  )
}