'use client';

import { useState } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { NavigationComponent } from '@/components/components-navigation';
import { WalletStatusComponent } from '@/components/components-wallet-status';
import { TransactionStatusComponent } from '@/components/components-transaction-status';
import { GasPriceComponent } from '@/components/components-gas-price';
import { DashboardComponent } from '@/components/components-dashboard';
import { StakeFormComponent } from '@/components/components-stake-form';
import { UnstakeFormComponent } from '@/components/components-unstake-form';
import { StakingSessionsComponent } from '@/components/components-staking-sessions';
import { StakingStatsComponent } from '@/components/components-staking-stats';
import { RewardsPageComponent } from '@/components/components-rewards-page';
import { WalletConnectModalComponent } from '@/components/components-wallet-connect-modal';
import { useWeb3 } from '@/hooks/useWeb3';
import { Contract } from 'ethers'; // Ensure ethers Contract type is imported

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.100',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '0',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: '0',
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '0',
      },
    },
  },
});

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode} size="sm">
      {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isConnected,
    address,
    balance,
    latestTx,
    gasPrice,
    connectWallet,
    stakingContract,
    stakingTokenContract,
    totalStakedTokens,
    userStaked,
    apr,
    rewardsEarned,
  } = useWeb3();

  // Define the props types in each component
  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return (
          <DashboardComponent
            //totalStaked={totalStakedTokens}
           // userStaked={userStaked}
            // apr={apr}
            // rewardsEarned={rewardsEarned}
          />
        );
      case 'Stake':
        return stakingContract && stakingTokenContract ? (
          <StakeFormComponent
        //   stakingContract={stakingContract}
          //  stakingTokenContract={stakingTokenContract}
          />
        ) : (
          <Text>Loading staking contracts...</Text>
        );
      case 'Unstake':
        return stakingContract ? <UnstakeFormComponent stakingContract={stakingContract} /> : <Text>Loading...</Text>;
      case 'Sessions':
        return stakingContract ? <StakingSessionsComponent stakingContract={stakingContract} /> : <Text>Loading...</Text>;
      case 'Stats':
        return stakingContract ? <StakingStatsComponent stakingContract={stakingContract} /> : <Text>Loading...</Text>;
      case 'Rewards':
        return stakingContract ? <RewardsPageComponent stakingContract={stakingContract} /> : <Text>Loading...</Text>;
      default:
        return (
          <DashboardComponent
            // totalStaked={totalStakedTokens}
            // userStaked={userStaked}
            // apr={apr}
            // rewardsEarned={rewardsEarned}
          />
        );
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Flex minH="100vh" direction={['column', 'row']}>
        <NavigationComponent currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <Box flex={1} p={4}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="2xl" fontWeight="bold">
                Scalable Staking Engine
              </Text>
              <HStack>
                <WalletStatusComponent
                  isConnected={isConnected}
                  address={address}
                  balance={balance}
                  onConnect={onOpen}
                />
                <ColorModeToggle />
              </HStack>
            </HStack>
            <HStack justify="space-between">
              <TransactionStatusComponent txHash={latestTx.hash} status={latestTx.status} />
             {/* <GasPriceComponent price={gasPrice} /> */}
            </HStack>
            {renderPage()}
          </VStack>
        </Box>
      </Flex>
      <WalletConnectModalComponent isOpen={isOpen} onClose={onClose} onConnect={connectWallet} />
    </ChakraProvider>
  );
}
