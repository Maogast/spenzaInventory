// src/pages/index.tsx
import React, { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Typography, Card, CardContent,
  Stack, TextField
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
  const [search, setSearch] = useState<string>('')
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

  // Feature handlers
  const goAdd = () => router.push('/dashboard?new=true', undefined, { shallow: true })
  const goLow = () => router.push('/dashboard?filter=feeds_low', undefined, { shallow: true })
  const goHistory = () =>
    router.push('/dashboard?history=demo-sku-id', undefined, { shallow: true })

  return (
    <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
      <Typography variant="h2" gutterBottom>
        Welcome to Spenza Stock
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        sx={{ mb: 4 }}
      >
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search SKU or name…"
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<DashboardIcon />}
          href="/dashboard"
        >
          Go to Dashboard
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mb: 6 }}
      >
        <Button variant="outlined" onClick={goAdd}>
          + Add New Product
        </Button>
        <Button variant="outlined" onClick={goLow}>
          🚨 View Low-Stock
        </Button>
        <Button variant="outlined" onClick={goHistory}>
          📜 Recent History
        </Button>
      </Stack>

      {/* KPI Cards… */}
      {isLoading || !data ? (
        <Typography>Loading stats…</Typography>
      ) : isError ? (
        <Typography color="error">Failed to load stats</Typography>
      ) : (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6">Total SKUs</Typography>
              <Typography variant="h4">{data.totalSKUs}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6">Total Stock</Typography>
              <Typography variant="h4">{data.totalStock}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
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
    </Box>
  )
}