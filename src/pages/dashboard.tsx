// src/pages/dashboard.tsx

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload
} from '@supabase/supabase-js'
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Toolbar,
  Divider
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HistoryIcon from '@mui/icons-material/History'
import DeleteIcon from '@mui/icons-material/Delete'

import MovementDialog from '../components/MovementDialog'
import AddStockDialog from '../components/AddStockDialog'
import DeductStockDialog from '../components/DeductStockDialog'
import AddToStockDialog from '../components/AddToStockDialog'
import StockMovementsDialog from '../components/StockMovementsDialog'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'

interface Product {
  id: string
  name: string
  sku: string
  current_stock: number
  category: 'feeds' | 'flour'
}

interface PaginatedProducts {
  data: Product[]
  count: number
}

export default function Dashboard() {
  const router = useRouter()
  const { query } = router
  const qc = useQueryClient()
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  // UI state
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [moveInfo, setMoveInfo] = useState<{ id: string; stock: number } | null>(null)
  const [deductInfo, setDeductInfo] = useState<{ id: string; stock: number } | null>(null)
  const [addInfo, setAddInfo] = useState<{ id: string; stock: number } | null>(null)
  const [openNew, setOpenNew] = useState<boolean>(false)
  const [historyProductId, setHistoryProductId] = useState<string | null>(null)
  const [deleteInfo, setDeleteInfo] = useState<{ id: string; name: string } | null>(null)

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', severity: 'success' })

  const showMsg = (
    message: string,
    severity: typeof snackbar.severity = 'success'
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const closeMsg = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Deep‐link handling
  useEffect(() => {
    if (query.new === 'true') {
      setOpenNew(true)
      router.replace('/dashboard', undefined, { shallow: true })
    }
    if (typeof query.filter === 'string') {
      setFilter(query.filter === 'feeds_low' ? 'feeds' : query.filter)
      router.replace('/dashboard', undefined, { shallow: true })
    }
    if (typeof query.history === 'string') {
      setHistoryProductId(query.history)
      router.replace('/dashboard', undefined, { shallow: true })
    }
  }, [query, router])

  // 1) Fetch products
  const { data, isLoading, error } = useQuery<PaginatedProducts, Error>({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
        .then(res => {
          if (!res.ok) throw new Error(res.statusText)
          return res.json()
        })
  })

  const products = data?.data ?? []
  const rowCount = data?.count ?? 0

  // 2) Stock update mutation
  const updateStock = useMutation<Product, Error, { id: string; newStock: number }>({
    mutationFn: async ({ id, newStock }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_stock: newStock })
      })
      if (!res.ok) throw new Error(res.statusText)
      return res.json() as Promise<Product>
    },
    onSuccess(updated) {
      qc.setQueryData<PaginatedProducts>(
        ['products', page, pageSize],
        prev => {
          if (!prev) return prev
          return {
            count: prev.count,
            data: prev.data.map(p => (p.id === updated.id ? updated : p))
          }
        }
      )
      showMsg(`Stock updated for "${updated.name}"`, 'success')
      setMoveInfo(null)
      setDeductInfo(null)
      setAddInfo(null)
    },
    onError(err) {
      showMsg(err.message, 'error')
    }
  })

  // 3) Delete mutation
  const deleteProduct = useMutation<void, Error, { id: string; name: string }>({
    mutationFn: async ({ id }) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload.error || 'Delete failed')
      }
    },
    onSuccess(_data, { name }) {
      qc.invalidateQueries({ queryKey: ['products', page, pageSize] })
      showMsg(`Deleted "${name}"`, 'info')
      setDeleteInfo(null)
    },
    onError(err) {
      showMsg(err.message, 'error')
    }
  })

  // 4) Real-time subscription
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: RealtimePostgresChangesPayload<Product>) => {
          const prod = payload.new as Product
          const oldRec = payload.old as Product | null
          qc.setQueryData<PaginatedProducts>(
            ['products', page, pageSize],
            prev => {
              if (!prev) return prev
              const arr = [...prev.data]
              switch (payload.eventType) {
                case 'INSERT':
                  return {
                    count: prev.count + 1,
                    data: [prod, ...arr.slice(0, pageSize - 1)]
                  }
                case 'UPDATE':
                  return {
                    count: prev.count,
                    data: arr.map(p => (p.id === prod.id ? prod : p))
                  }
                case 'DELETE':
                  return {
                    count: prev.count - 1,
                    data: arr.filter(p => p.id !== oldRec?.id)
                  }
              }
              return prev
            }
          )
        }
      )
      .subscribe()

    return () => void supabase.removeChannel(channel)
  }, [qc, page, pageSize])

  // Loading & error UI
  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Skeleton height={40} sx={{ mb: 2 }} />
        <Skeleton height={500} />
      </Container>
    )
  }
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error.message}</Alert>
      </Container>
    )
  }

  // Filters & statistics
  const lowCount = products.filter(p => p.current_stock < 1000).length
  const visible = filter
    ? products.filter(p => p.category === filter)
    : products

    // 5) Define DataGrid columns
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product', flex: 1, minWidth: 120 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'category', headerName: 'Category', width: 120 },
    {
      field: 'current_stock',
      headerName: 'Stock',
      type: 'number',
      width: 120,
      cellClassName: (params: GridCellParams) =>
        (params.value as number) < 1000 ? 'low' : ''
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isSmDown ? 280 : 400,
      renderCell: params => {
        const id = params.row.id as string
        const stock = params.row.current_stock as number
        const name = params.row.name as string

        return (
          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={1}
            alignItems={isSmDown ? 'stretch' : 'center'}
          >
            <Tooltip title="History">
              <IconButton size="small" onClick={() => setHistoryProductId(id)}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>

            <Button
              size="small"
              onClick={() => setAddInfo({ id, stock })}
              fullWidth={isSmDown}
            >
              Add
            </Button>

            <Button
              size="small"
              onClick={() => setMoveInfo({ id, stock })}
              fullWidth={isSmDown}
            >
              Move
            </Button>

            <Button
              size="small"
              color="warning"
              onClick={() => setDeductInfo({ id, stock })}
              fullWidth={isSmDown}
            >
              Deduct
            </Button>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteInfo({ id, name })}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  // 6) Render
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Toolbar
          disableGutters
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 },
            justifyContent: 'space-between',
            flexDirection: isSmDown ? 'column' : 'row'
          }}
        >
          <Typography variant="h4" sx={{ mb: isSmDown ? 1 : 0 }}>
            Inventory Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => router.push('/')}
            >
              Home
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenNew(true)}
              sx={{ minWidth: 140 }}
            >
              + New Product
            </Button>
          </Stack>
        </Toolbar>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          {lowCount > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              🚨 {lowCount} low-stock item{lowCount > 1 ? 's' : ''}
            </Alert>
          )}

          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <FormControl sx={{ minWidth: 180 }} fullWidth={isSmDown}>
              <InputLabel>Filter Category</InputLabel>
              <Select
                value={filter}
                onChange={(e: SelectChangeEvent) => setFilter(e.target.value)}
                label="Filter Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="feeds">Feeds</MenuItem>
                <MenuItem value="flour">Flour</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ height: `calc(100vh - ${isSmDown ? 360 : 400}px)` }}>
            <DataGrid
              rows={visible}
              columns={columns}
              getRowId={row => row.id}
              pagination
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={({ page, pageSize }) => {
                setPage(page)
                setPageSize(pageSize)
              }}
              pageSizeOptions={[10, 25, 50]}
              loading={isLoading}
              sx={{
                '.low': {
                  bgcolor: 'rgba(255,82,82,0.1)',
                  color: '#d32f2f'
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Dialogs */}
      {addInfo && (
        <AddToStockDialog
          open
          currentStock={addInfo.stock}
          onClose={() => setAddInfo(null)}
          onAdd={amt =>
            updateStock.mutate({ id: addInfo.id, newStock: addInfo.stock + amt })
          }
        />
      )}
      {moveInfo && (
        <MovementDialog
          open
          currentStock={moveInfo.stock}
          onClose={() => setMoveInfo(null)}
          onSaved={ns =>
            updateStock.mutate({ id: moveInfo.id, newStock: ns })
          }
        />
      )}
      {deductInfo && (
        <DeductStockDialog
          open
          currentStock={deductInfo.stock}
          onClose={() => setDeductInfo(null)}
          onDeduct={ns =>
            updateStock.mutate({ id: deductInfo.id, newStock: ns })
          }
        />
      )}
      <AddStockDialog open={openNew} onClose={() => setOpenNew(false)} />
      {historyProductId && (
        <StockMovementsDialog
          open
          productId={historyProductId}
          onClose={() => setHistoryProductId(null)}
        />
      )}
      {deleteInfo && (
        <DeleteConfirmDialog
          open
          productName={deleteInfo.name}
          onClose={() => setDeleteInfo(null)}
          onConfirm={() =>
            deleteProduct.mutate({
              id: deleteInfo.id,
              name: deleteInfo.name
            })
          }
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={closeMsg}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  )
}