'use client'

import { useState, useEffect } from 'react'
import { Box, Text, HStack, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react'
import { ethers } from 'ethers'

interface StakingStatsProps {
  stakingContract: ethers.Contract;
}

export function StakingStatsComponent({ stakingContract }: StakingStatsProps) {
  const [stats, setStats] = useState({
    totalStaked: '0',
    activeSessionCount: 0,
    totalRewards: '0',
    totalPenalties: '0',
  })
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalStaked, activeSessionCount, totalRewards, totalPenalties] = await Promise.all([
          stakingContract.getTotalStakedTokens(),
          stakingContract.getActiveSessionCount(await stakingContract.signer.getAddress()),
          stakingContract.totalUnlockedReward(await stakingContract.signer.getAddress()),
          stakingContract.getTotalPenaltiesCollected(),
        ])
        setStats({
          totalStaked: ethers.utils.formatEther(totalStaked),
          activeSessionCount: activeSessionCount.toNumber(),
          totalRewards: ethers.utils.formatEther(totalRewards),
          totalPenalties: ethers.utils.formatEther(totalPenalties),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [stakingContract])

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="green.500">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="green.400">Staking Statistics</Text>
      <HStack spacing={8} justify="center" flexWrap="wrap">
        <Stat>
          <StatLabel>Total Staked</StatLabel>
          <StatNumber>{stats.totalStaked}</StatNumber>
          <StatHelpText>Tokens</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Active Sessions</StatLabel>
          <StatNumber>{stats.activeSessionCount}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Total Rewards</StatLabel>
          <StatNumber>{stats.totalRewards}</StatNumber>
          <StatHelpText>Tokens</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Penalties</StatLabel>
          <StatNumber>{stats.totalPenalties}</StatNumber>
          <StatHelpText>Tokens</StatHelpText>
        </Stat>
      </HStack>
    </Box>
  )
}