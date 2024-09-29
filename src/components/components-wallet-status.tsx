'use client'

import { HStack, Button, Avatar, VStack, Text } from '@chakra-ui/react'

interface WalletStatusProps {
  isConnected: boolean;
  address: string;
  balance: string;
  onConnect: () => void;
}

export function WalletStatusComponent({ isConnected, address, balance, onConnect }: WalletStatusProps) {
  return (
    <HStack>
      {isConnected ? (
        <>
          <Avatar size="sm" name={address} />
          <VStack align="start" spacing={0}>
            <Text>{`${address.slice(0, 6)}...${address.slice(-4)}`}</Text>
            <Text fontSize="xs" color="gray.500">{`Balance: ${balance} ETH`}</Text>
          </VStack>
        </>
      ) : (
        <Button onClick={onConnect} colorScheme="blue">
          Connect Wallet
        </Button>
      )}
    </HStack>
  )
}