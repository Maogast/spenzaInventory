// src/pages/index.tsx
import React, { useState, KeyboardEvent } from 'react'
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
  useMediaQuery
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

export default function HomePage() {
  const router = useRouter()
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useQuery<Summary, Error>({
    queryKey: ['summary'],
    queryFn: fetchSummary
  })

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
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6">Total SKUs</Typography>
              <Typography variant="h4">{data.totalSKUs}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="h6">Total Stock</Typography>
              <Typography variant="h4">{data.totalStock}</Typography>
            </CardContent>
          </Card>
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
    </Container>
  )
}