import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import type { GridColDef, GridCellParams } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import HistoryIcon from '@mui/icons-material/History'
import MovementDialog from '../components/MovementDialog'
import AddStockDialog from '../components/AddStockDialog'
import DeductStockDialog from '../components/DeductStockDialog'
import AddToStockDialog from '../components/AddToStockDialog'
import StockMovementsDialog from '../components/StockMovementsDialog'

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
  const queryClient = useQueryClient()

  // UI & pagination state
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [moveInfo, setMoveInfo] = useState<{ id: string; stock: number } | null>(null)
  const [deductInfo, setDeductInfo] = useState<{ id: string; stock: number } | null>(null)
  const [addInfo, setAddInfo] = useState<{ id: string; stock: number } | null>(null)
  const [openNew, setOpenNew] = useState<boolean>(false)
  const [historyProductId, setHistoryProductId] = useState<string | null>(null)

  // 1) Fetch one page of products
  const { data: paginated, isLoading, error } = useQuery<PaginatedProducts, Error>({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      fetch(`/api/products?page=${page}&pageSize=${pageSize}`)
        .then(res => {
          if (!res.ok) throw new Error(res.statusText)
          return res.json() as Promise<PaginatedProducts>
        })
  })

  const products = paginated?.data ?? []
  const rowCount = paginated?.count ?? 0

  // 2) Unified mutation for Add/Move/Deduct
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
    onSuccess: updated => {
      queryClient.setQueryData<PaginatedProducts>(
        ['products', page, pageSize],
        prev => {
          if (!prev) return prev
          return {
            count: prev.count,
            data: prev.data.map(p => (p.id === updated.id ? updated : p))
          }
        }
      )
      setMoveInfo(null)
      setDeductInfo(null)
      setAddInfo(null)
    }
  })

  // 3) Supabase real‐time updates
  useEffect(() => {
    let channel: RealtimeChannel
    channel = supabase
      .channel('products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: RealtimePostgresChangesPayload<Product>) => {
          const prod = payload.new as Product
          const oldRec = payload.old as Product | null

          queryClient.setQueryData<PaginatedProducts>(
            ['products', page, pageSize],
            prev => {
              if (!prev) return prev
              const { data, count } = prev
              switch (payload.eventType) {
                case 'INSERT':
                  return {
                    count: count + 1,
                    data: [prod, ...data.slice(0, pageSize - 1)]
                  }
                case 'UPDATE':
                  return {
                    count,
                    data: data.map(p => (p.id === prod.id ? prod : p))
                  }
                case 'DELETE':
                  return {
                    count: count - 1,
                    data: data.filter(p => p.id !== oldRec?.id)
                  }
                default:
                  return prev
              }
            }
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, page, pageSize])

  if (isLoading) return <Typography>Loading…</Typography>
  if (error) return <Alert severity="error">{error.message}</Alert>

  // Low-stock alert
  const lowCount = products.filter(p => p.current_stock < 1000).length

  // Client‐side filter
  const visible = filter
    ? products.filter(p => p.category === filter)
    : products

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product', flex: 1 },
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
      width: 340,
      renderCell: params => {
        const id = params.row.id as string
        const stock = params.row.current_stock as number
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="History">
              <IconButton
                size="small"
                onClick={() => setHistoryProductId(id)}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            <Button size="small" onClick={() => setAddInfo({ id, stock })}>
              Add
            </Button>
            <Button size="small" onClick={() => setMoveInfo({ id, stock })}>
              Move
            </Button>
            <Button
              size="small"
              color="warning"
              onClick={() => setDeductInfo({ id, stock })}
            >
              Deduct
            </Button>
          </Stack>
        )
      }
    }
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Inventory Dashboard</Typography>
        <Button variant="contained" onClick={() => setOpenNew(true)}>
          + New Product
        </Button>
      </Stack>

      {lowCount > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          🚨 {lowCount} product{lowCount > 1 ? 's' : ''} low on stock
        </Alert>
      )}

      <Box mb={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Category Filter</InputLabel>
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            label="Category Filter"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="feeds">Feeds</MenuItem>
            <MenuItem value="flour">Flour</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600 }}>
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
            '.low': { bgcolor: 'rgba(255,82,82,0.1)', color: '#d32f2f' }
          }}
        />
      </Box>

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
          onSaved={ns => updateStock.mutate({ id: moveInfo.id, newStock: ns })}
        />
      )}

      {deductInfo && (
        <DeductStockDialog
          open
          currentStock={deductInfo.stock}
          onClose={() => setDeductInfo(null)}
          onDeduct={ns => updateStock.mutate({ id: deductInfo.id, newStock: ns })}
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
    </Container>
  )
}