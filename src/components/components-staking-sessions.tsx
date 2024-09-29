'use client'

import { useState, useEffect } from 'react'
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Progress, useDisclosure } from '@chakra-ui/react'
import { ethers } from 'ethers'

interface StakingSessionsProps {
  stakingContract: ethers.Contract;
}

interface Session {
  id: number;
  amount: string;
  startTime: string;
  duration: string;
  remainingTime: string;
  profitPercent: number;
}

export function StakingSessionsComponent({ stakingContract }: StakingSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionCount = await stakingContract.getActiveSessionCount(await stakingContract.signer.getAddress())
        const fetchedSessions = []
        for (let i = 0; i < sessionCount; i++) {
          const session = await stakingContract.getStakeSessionBySessionId(await stakingContract.signer.getAddress(), i)
          const { duration, remainingTime } = await stakingContract.getRemainingDate(i)
          fetchedSessions.push({
            id: i,
            amount: ethers.utils.formatEther(session.amount),
            startTime: new Date(session.startTime.toNumber() * 1000).toLocaleString(),
            duration,
            remainingTime,
            profitPercent: session.sessionProfitPercent.toNumber()
          })
        }
        setSessions(fetchedSessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
      }
    }
    fetchSessions()
  }, [stakingContract])

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    onOpen()
  }

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="purple.500">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="purple.400">Your Staking Sessions</Text>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Session ID</Th>
            <Th>Amount</Th>
            <Th>Start Time</Th>
            <Th>Duration</Th>
            <Th>Remaining Time</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sessions.map((session) => (
            <Tr key={session.id} onClick={() => handleSessionClick(session)} cursor="pointer" _hover={{ bg: 'purple.700' }}>
              <Td>{session.id}</Td>
              <Td>{session.amount}</Td>
              <Td>{session.startTime}</Td>
              <Td>{session.duration}</Td>
              <Td>{session.remainingTime}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Session Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSession && (
              <VStack align="start" spacing={2}>
                <Text><strong>Session ID:</strong> {selectedSession.id}</Text>
                <Text><strong>Amount Staked:</strong> {selectedSession.amount}</Text>
                <Text><strong>Start Time:</strong> {selectedSession.startTime}</Text>
                <Text><strong>Duration:</strong> {selectedSession.duration}</Text>
                <Text><strong>Remaining Time:</strong> {selectedSession.remainingTime}</Text>
                <Text><strong>Profit Percent:</strong> {selectedSession.profitPercent}%</Text>
                <Text><strong>Estimated Rewards:</strong> {(parseFloat(selectedSession.amount) * selectedSession.profitPercent / 100).toFixed(2)}</Text>
                <Progress value={(parseInt(selectedSession.remainingTime) / parseInt(selectedSession.duration)) * 100} colorScheme="purple" width="100%" />
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}