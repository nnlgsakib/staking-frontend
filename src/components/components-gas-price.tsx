'use client';

import { HStack, Text } from '@chakra-ui/react';
import { useWeb3 } from '@/hooks/useWeb3';

export function   GasPriceComponent() {
  const { gasPrice } = useWeb3(); // Use the hook to get the gas price

  return (
    <HStack>
      <Text fontSize="sm">Gas Price:</Text>
      <Text fontSize="sm" fontWeight="bold">{gasPrice !== '0' ? `${gasPrice} Gwei` : 'Loading...'}</Text>
    </HStack>
  );
}
