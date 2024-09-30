import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/hooks/useWeb3';

export function StakeFormComponent() {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const {
    allowance,
    approveTokens,
    stake,
    checkAllowance,
    stakingTokenContract,
    address,
    balance,
    userStaked,
    apr,
  } = useWeb3();

  useEffect(() => {
    if (stakingTokenContract && address) {
      checkAllowance(stakingTokenContract, address);
    }
  }, [stakingTokenContract, address, checkAllowance]);

  const handleStake = () => {
    if (!amount) return;
    onOpen();
  };

  const handleApprove = () => {
    setIsApproving(true);
    approveTokens(amount)
      .catch((error:any) => {
        console.error('Approval error:', error);
      })
      .finally(() => {
        setIsApproving(false);
      });
  };

  const handleConfirm = () => {
    setIsStaking(true);
    stake(amount)
      .catch((error:any) => {
        console.error('Staking error:', error);
      })
      .finally(() => {
        setAmount('');
        setIsStaking(false);
        onClose();
      });
  };

  const hasEnoughAllowance = ethers.utils.parseEther(allowance).gte(ethers.utils.parseEther(amount || '0'));
  const hasEnoughBalance = ethers.utils.parseEther(balance).gte(ethers.utils.parseEther(amount || '0'));

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="blue.500" borderRadius="md" width="100%" maxWidth="500px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="blue.400" textAlign="center">
          Stake Tokens
        </Text>

        <HStack justify="space-between">
          <Stat>
            <StatLabel>Your Balance</StatLabel>
            <StatNumber>{parseFloat(balance).toFixed(4)}</StatNumber>
            <StatHelpText>Available to stake</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Your Staked</StatLabel>
            <StatNumber>{parseFloat(userStaked).toFixed(4)}</StatNumber>
            <StatHelpText>Currently staking</StatHelpText>
          </Stat>
        </HStack>

        <FormControl>
          <FormLabel>Amount to Stake</FormLabel>
          <Input
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            borderColor="blue.500"
            _hover={{ borderColor: 'blue.600' }}
            _focus={{ borderColor: 'blue.700' }}
            type="number"
            step="0.01"
          />
          <FormHelperText>Current APR: {apr > 0 ? `${apr}%` : 'Loading...'}</FormHelperText>
        </FormControl>

        <Button
          onClick={handleStake}
          colorScheme="blue"
          width="full"
          isDisabled={!amount || !hasEnoughBalance || !hasEnoughAllowance}
        >
          Stake
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Confirm Staking</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>You are about to stake {amount} tokens.</Text>
              {!hasEnoughAllowance && (
                <Text color="yellow.500">Insufficient allowance. Please approve first.</Text>
              )}
              {!hasEnoughBalance && (
                <Text color="red.500">Insufficient balance. Please enter a lower amount.</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4}>
              {!hasEnoughAllowance && (
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={isApproving}
                  loadingText="Approving..."
                >
                  Approve
                </Button>
              )}
              <Button
                colorScheme="blue"
                onClick={handleConfirm}
                isDisabled={!hasEnoughAllowance || !hasEnoughBalance}
                isLoading={isStaking}
                loadingText="Staking..."
              >
                Confirm Stake
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
