'use client'

import { HStack, Text } from '@chakra-ui/react'

interface GasPriceProps {
  price: string;
}

export function GasPriceComponent({ price }: GasPriceProps) {
  return (
    <HStack>
      <Text fontSize="sm">Gas Price:</Text>
      <Text fontSize="sm" fontWeight="bold">{price} Gwei</Text>
    </HStack>
  )
}