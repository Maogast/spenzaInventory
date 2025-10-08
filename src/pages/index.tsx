// src/pages/index.tsx
import React, { useState, KeyboardEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Container,
  useTheme,
  useMediaQuery,
  Box, // Added Box for the clock container
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'

interface Summary {
  totalSKUs: number
  totalStock: number
  lowCount: number
}

const fetchSummary = async (): Promise<Summary> => {
  const res = await fetch('/api/summary')
  if (!res.ok) throw new Error('Unable to fetch summary')
  return res.json()
}

// --- Updated Clock Component ---
const ClockAndDate: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  // New state to track if the component has mounted on the client side
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // 1. Mark component as mounted (client-side render started)
    setHasMounted(true)

    // 2. Set up the real-time clock interval
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(timerId)
  }, [])

  // If the component has not yet mounted on the client (i.e., this is the server render or before hydration), 
  // render a stable value (like a placeholder or just null) to prevent mismatch.
  if (!hasMounted) {
    // Render a stable value (current date without time to avoid the instant mismatch)
    const initialDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    return (
      <Box sx={{ mb: 4, textAlign: 'center', visibility: 'hidden', height: 100 }}>
        {/* Render placeholder structure to reserve space, but hide content */}
        <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
          00:00:00 AM
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {initialDate}
        </Typography>
      </Box>
    )
  }

  // Once mounted on the client, render the real-time content
  const time = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const date = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
        {time}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary">
        {date}
      </Typography>
    </Box>
  )
}
// ----------------------------

// --- Developer Signature Component (Extracted for modularity and reliability) ---
// Removed React.memo to ensure it re-renders fully when given a new key
const DeveloperSignature: React.FC = () => {
  // Repeated scrolling text for a seamless loop
  const signatureText = " | ENGINEERED BY PATRICK NYERERE (BSc EEE/CE) | FULL-STACK DEVELOPMENT | INVENTORY SYSTEM V1.0 | ";
  // Repeat 10 times to ensure continuous scroll across the screen
  const repeatedSignature = Array(10).fill(signatureText).join('');
  
  return (
    <>
      <style jsx global>
        {`
          /* Animation for TV News Ticker effect */
          @keyframes signatureScroll {
            /* Start off-screen right */
            0% { transform: translateX(100%); } 
            /* End off-screen left */
            100% { transform: translateX(-100%); }
          }

          /* General styling for the text container for the news ticker effect */
          .ticker-wrap {
            overflow: hidden; /* Hide the scrolling content outside this box */
            white-space: nowrap; /* Prevent the text from wrapping */
          }

          /* Style for the text content itself */
          .ticker-text {
            /* Animation duration significantly increased to 200s for a very slow scroll */
            animation: signatureScroll 200s linear infinite; 
            display: inline-block;
          }
        `}
      </style>

      <Box sx={{ 
        mt: 4, // REDUCED MARGIN from 10 to 4 to make it appear sooner
        py: 1.5, 
        // Dark teal/green background
        background: '#004d40', 
        // Hard border using light green/lime
        borderTop: `2px solid #aeea00`,
        borderBottom: `2px solid #aeea00`,
        borderRadius: 0, 
        boxShadow: `0 4px 15px rgba(0, 0, 0, 0.5)`,
        
        // --- Ticker Wrapper Style ---
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
      className="ticker-wrap" // Use class to apply overflow: hidden
      >
        <Typography 
          variant="body2"
          color="#aeea00" // Text color set to lime green for high contrast
          className="ticker-text" // Use class to apply animation
          sx={{ 
            fontFamily: 'monospace', 
            fontWeight: 800, 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase',
            // High-tech glow effect, matching the lime color
            textShadow: `0 0 10px #aeea00`,
            px: 2, 
            fontSize: '0.85rem'
          }}
        >
          {/* Use the repeated signature for a continuous scroll */}
          {repeatedSignature}
        </Typography>
      </Box>
    </>
  )
};
DeveloperSignature.displayName = 'DeveloperSignature';
// ----------------------------


export default function HomePage() {
  const router = useRouter()
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useQuery<Summary, Error>({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    // Refetch every 30 seconds to keep stats fresh
    refetchInterval: 30000, 
  })

  // State to force re-render and reset CSS animation on component mount/remount
  // When HomePage remounts after navigation, this state is re-initialized with a new timestamp, 
  // forcing React to fully recreate the DeveloperSignature component and restart the animation.
  const [signatureKey] = useState(Date.now());


  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(
        { pathname: '/dashboard', query: { search: search.trim() } },
        undefined,
        { shallow: true }
      )
    }
  }

  const goAdd = () => router.push('/dashboard?new=true', undefined, { shallow: true })
  const goLow = () => router.push('/dashboard?filter=feeds_low', undefined, { shallow: true })
  const goHistory = () =>
    router.push('/dashboard?history=demo-sku-id', undefined, { shallow: true })

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      
      {/* 1. Clock and Date Component */}
      <ClockAndDate />

      <Typography variant="h2" gutterBottom>
        Welcome to Spenza Stock
      </Typography>

      <Stack
        direction={isSmDown ? 'column' : 'row'}
        spacing={2}
        justifyContent="center"
        sx={{ mb: 4 }}
      >
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search SKU or name…"
          fullWidth
          sx={{ maxWidth: isSmDown ? '100%' : 300 }}
        />

        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          href="/dashboard"
          fullWidth={isSmDown}
          sx={{ maxWidth: isSmDown ? '100%' : 200 }}
        >
          Go to Dashboard
        </Button>
      </Stack>

      <Stack
        direction={isSmDown ? 'column' : 'row'}
        spacing={2}
        justifyContent="center"
        sx={{ mb: 6 }}
      >
        <Button fullWidth={isSmDown} variant="outlined" onClick={goAdd}>
          + Add New Product
        </Button>
        <Button fullWidth={isSmDown} variant="outlined" onClick={goLow}>
          🚨 View Low-Stock
        </Button>
        <Button fullWidth={isSmDown} variant="outlined" onClick={goHistory}>
          📜 Recent History
        </Button>
      </Stack>

      {isLoading || !data ? (
        <Typography>Loading stats…</Typography>
      ) : isError ? (
        <Typography color="error">Failed to load stats</Typography>
      ) : (
        <Stack
          direction={isSmDown ? 'column' : 'row'}
          spacing={2}
          justifyContent="center"
        >
          {/* Total SKUs Card */}
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6">Total SKUs</Typography>
              <Typography variant="h4">{data.totalSKUs}</Typography>
            </CardContent>
          </Card>
          
          {/* Total Stock Card */}
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6">Total Stock</Typography>
              <Typography variant="h4">{data.totalStock}</Typography>
            </CardContent>
          </Card>
          
          {/* Low Stock Alerts Card */}
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6">Low Stock Alerts</Typography>
              <Typography
                variant="h4"
                color={data.lowCount > 0 ? 'error' : 'success'}
              >
                {data.lowCount}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* 2. Developer Signature - Fancy and Amazing Look with Scrolling Animation */}
      {/* Pass the dynamic key to force component remount and animation reset */}
      <DeveloperSignature key={signatureKey} />
      
    </Container>
  )
}
