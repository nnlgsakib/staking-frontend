'use client';

import { Box, Text, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react';
import { useWeb3 } from '@/hooks/useWeb3';

export function DashboardComponent() {
  const bgColor = useColorModeValue('gray.100', 'gray.700');

  // Get data from the Web3 hook
  const { totalStakedTokens, userStaked, apr, rewardsEarned, isConnected } = useWeb3();

  // Fallback if data is not loaded yet
  const totalStakedDisplay = isConnected && totalStakedTokens !== '0' ? `${totalStakedTokens} Tokens` : 'Loading...';
  const userStakedDisplay = isConnected && userStaked !== '0' ? `${userStaked} Tokens` : 'Loading...';
  const aprDisplay = isConnected && apr !== 0 ? `${apr}%` : 'Loading...';
  const rewardsEarnedDisplay = isConnected && rewardsEarned !== '0' ? `${rewardsEarned} Tokens` : 'Loading...';

  return (
    <Box bg={bgColor} p={6} borderWidth={2} borderColor="blue.500">
      <Text fontSize="2xl" fontWeight="bold" mb={4} color="blue.400">Dashboard</Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem>
          <Stat>
            <StatLabel>Total Staked</StatLabel>
            <StatNumber>{totalStakedDisplay}</StatNumber>
            <StatHelpText>Across all users</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Your Staked Amount</StatLabel>
            <StatNumber>{userStakedDisplay}</StatNumber>
            <StatHelpText>Your current stake</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Current APR</StatLabel>
            <StatNumber>{aprDisplay}</StatNumber>
            <StatHelpText>Annual Percentage Rate</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat>
            <StatLabel>Rewards Earned</StatLabel>
            <StatNumber>{rewardsEarnedDisplay}</StatNumber>
            <StatHelpText>Your total rewards to date</StatHelpText>
          </Stat>
        </GridItem>
      </Grid>
    </Box>
  );
}
