'use client'

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, Button, Text, useColorModeValue } from '@chakra-ui/react'

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

export function WalletConnectModalComponent({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const bgColor = useColorModeValue('white', 'gray.800')

  const wallets = [
    { name: 'MetaMask', icon: '🦊' },
    { name: 'WalletConnect', icon: '🔗' },
    { name: 'Coinbase Wallet', icon: '🏦' },
  ]

  const handleConnect = (walletName: string) => {
    onConnect(walletName)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Connect Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {wallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                width="full"
                leftIcon={<Text fontSize="2xl">{wallet.icon}</Text>}
              >
                {wallet.name}
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}