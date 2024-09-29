'use client'

import { Box, Text, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react'

interface DashboardProps {
  totalStaked: string;
  userStaked: string;
  apr: number;
  rewardsEarned: string;
}

export function DashboardComponent({ totalStaked, userStaked, apr, rewardsEarned }: DashboardProps) {
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="blue.500">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="blue.400">Dashboard</Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem>
          <Stat>
            <StatLabel>Total Staked</StatLabel>
            <StatNumber>{totalStaked} Tokens</StatNumber>
            <StatHelpText>Across all users</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Your Staked Amount</StatLabel>
            <StatNumber>{userStaked} Tokens</StatNumber>
            <StatHelpText>Your current stake</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Current APR</StatLabel>
            <StatNumber>{apr}%</StatNumber>
            <StatHelpText>Annual Percentage Rate</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Rewards Earned</StatLabel>
            <StatNumber>{rewardsEarned} Tokens</StatNumber>
            <StatHelpText>Your total rewards to date</StatHelpText>
          </Stat>
        </GridItem>
      </Grid>
    </Box>
  )
}