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
  Box,
  Paper,
  InputAdornment,
  Alert,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import WarningIcon from '@mui/icons-material/Warning'
import HistoryIcon from '@mui/icons-material/History'
import InventoryIcon from '@mui/icons-material/Inventory'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

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

// --- Enhanced Clock Component ---
const ClockAndDate: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  if (!hasMounted) {
    const initialDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    return (
      <Box sx={{ mb: 4, textAlign: 'center', visibility: 'hidden', height: 120 }}>
        <Typography variant="h3" color="white" sx={{ fontWeight: 700 }}>
          00:00:00 AM
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.8)">
          {initialDate}
        </Typography>
      </Box>
    )
  }

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
      <Typography variant="h3" color="white" sx={{ fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        {time}
      </Typography>
      <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
        {date}
      </Typography>
    </Box>
  )
}

// --- Enhanced Developer Signature ---
const DeveloperSignature: React.FC = () => {
  const signatureText = " | ENGINEERED BY PATRICK NYERERE (BSc EEE/CE) | FULL-STACK DEVELOPMENT | INVENTORY SYSTEM V1.0 | ";
  const repeatedSignature = Array(10).fill(signatureText).join('');
  
  return (
    <>
      <style jsx global>
        {`
          @keyframes signatureScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .ticker-wrap {
            overflow: hidden;
            white-space: nowrap;
          }
          .ticker-text {
            animation: signatureScroll 200s linear infinite; 
            display: inline-block;
          }
        `}
      </style>

      <Box sx={{ 
        mt: 6,
        py: 1.5,
        background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
        borderTop: `2px solid #aeea00`,
        borderBottom: `2px solid #aeea00`,
        borderRadius: 0, 
        boxShadow: `0 4px 15px rgba(0, 0, 0, 0.5)`,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
      className="ticker-wrap"
      >
        <Typography 
          variant="body2"
          color="#aeea00"
          className="ticker-text"
          sx={{ 
            fontFamily: 'monospace', 
            fontWeight: 800, 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase',
            textShadow: `0 0 10px #aeea00`,
            px: 2, 
            fontSize: '0.85rem'
          }}
        >
          {repeatedSignature}
        </Typography>
      </Box>
    </>
  )
}

export default function HomePage() {
  const router = useRouter()
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useQuery<Summary, Error>({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    refetchInterval: 30000,
  })

  const [signatureKey] = useState(Date.now())

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
  const goHistory = () => router.push('/dashboard?history=demo-sku-id', undefined, { shallow: true })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Enhanced Header */}
        <Paper 
          elevation={8}
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            textAlign: 'center',
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <InventoryIcon sx={{ fontSize: 48, color: 'white' }} />
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'white' }}>
              Spenza Stock
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
            Professional Inventory Management System
          </Typography>

          {/* Clock and Date */}
          <ClockAndDate />

          {/* Search Section */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products or SKU..."
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#2c3e50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<DashboardIcon />}
              href="/dashboard"
              sx={{
                minWidth: 200,
                background: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
                fontWeight: 'bold',
                boxShadow: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00917a 0%, #7ba82d 100%)',
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Go to Dashboard
            </Button>
          </Stack>

          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={2}
            justifyContent="center"
          >
            <Button 
              fullWidth={isSmDown} 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={goAdd}
              sx={{
                background: 'linear-gradient(45deg, #2196f3 0%, #21cbf3 100%)',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 0%, #00acc1 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Add New Product
            </Button>
            <Button 
              fullWidth={isSmDown} 
              variant="contained"
              startIcon={<WarningIcon />}
              onClick={goLow}
              sx={{
                background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #e03560 0%, #e63a1f 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              View Low Stock
            </Button>
            <Button 
              fullWidth={isSmDown} 
              variant="contained"
              startIcon={<HistoryIcon />}
              onClick={goHistory}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 0%, #e040fb 100%)',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 0%, #c2185b 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Recent History
            </Button>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        {isLoading || !data ? (
          <Typography variant="h6" sx={{ textAlign: 'center', color: 'white' }}>
            Loading stats…
          </Typography>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load statistics
          </Alert>
        ) : (
          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            {/* Total SKUs Card */}
            <Card 
              sx={{ 
                flex: 1, 
                minWidth: 0,
                background: 'linear-gradient(45deg, #00c853 0%, #64dd17 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: 6
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <InventoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Total SKUs
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.totalSKUs}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Total Stock Card */}
            <Card 
              sx={{ 
                flex: 1, 
                minWidth: 0,
                background: 'linear-gradient(45deg, #2979ff 0%, #00b0ff 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: 6
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Total Stock
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.totalStock.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Low Stock Alerts Card */}
            <Card 
              sx={{ 
                flex: 1, 
                minWidth: 0,
                background: data.lowCount > 0 
                  ? 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)'
                  : 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: 6
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <WarningIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Low Stock Alerts
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {data.lowCount}
                </Typography>
                {data.lowCount > 0 && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Immediate attention required
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Quick Stats Alert */}
        {data && data.lowCount > 0 && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #ff9800 0%, #ff5722 100%)',
              color: 'white',
              fontWeight: 'bold',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            🚨 {data.lowCount} product{data.lowCount !== 1 ? 's' : ''} require immediate stock attention!
          </Alert>
        )}

        {/* Additional Info Section */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            System Features
          </Typography>
          <Stack direction={isSmDown ? 'column' : 'row'} spacing={3} justifyContent="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="#aeea00" gutterBottom>
                📊 Real-time Tracking
              </Typography>
              <Typography variant="body2">
                Live inventory updates with real-time stock movements
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="#aeea00" gutterBottom>
                🔔 Smart Alerts
              </Typography>
              <Typography variant="body2">
                Automatic low-stock notifications and warnings
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="#aeea00" gutterBottom>
                📈 Analytics
              </Typography>
              <Typography variant="body2">
                Comprehensive reporting and stock analytics
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Developer Signature */}
        <DeveloperSignature key={signatureKey} />
      </Container>
    </Box>
  )
}