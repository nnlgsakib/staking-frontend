'use client'

import { Box, VStack, Button, useColorModeValue } from '@chakra-ui/react'

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function NavigationComponent({ currentPage, setCurrentPage }: NavigationProps) {
  const bgColor = useColorModeValue('gray.200', 'gray.800')
  const activeColor = useColorModeValue('blue.500', 'blue.200')

  const pages = ['Dashboard', 'Stake', 'Unstake', 'Sessions', 'Stats', 'Rewards']

  return (
    <Box bg={bgColor} w={['full', '200px']} p={4} borderRight="1px" borderColor="gray.600">
      <VStack spacing={4} align="stretch">
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            variant="ghost"
            justifyContent="flex-start"
            fontWeight={currentPage === page ? 'bold' : 'normal'}
            color={currentPage === page ? activeColor : 'inherit'}
            _hover={{ bg: 'gray.700' }}
          >
            {page}
          </Button>
        ))}
      </VStack>
    </Box>
  )
}