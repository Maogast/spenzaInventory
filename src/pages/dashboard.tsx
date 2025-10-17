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
  Divider,
  TextField,
  InputAdornment
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HistoryIcon from '@mui/icons-material/History'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InventoryIcon from '@mui/icons-material/Inventory'
import RemoveIcon from '@mui/icons-material/Remove'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import LogoutIcon from '@mui/icons-material/Logout'

import MovementDialog from '../components/MovementDialog'
import AddProductDialog from '../components/AddProductDialog'
import DeductStockDialog from '../components/DeductStockDialog'
import AddToStockDialog from '../components/AddToStockDialog'
import StockMovementsDialog from '../components/StockMovementsDialog'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'
import EditProductDialog from '../components/EditProductDialog'

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

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // UI state
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [moveInfo, setMoveInfo] = useState<{ id: string; stock: number } | null>(
    null
  )
  const [deductInfo, setDeductInfo] = useState<{
    id: string
    stock: number
  } | null>(null)
  const [addInfo, setAddInfo] = useState<{ id: string; stock: number } | null>(
    null
  )
  const [openNew, setOpenNew] = useState<boolean>(false)
  const [historyProductId, setHistoryProductId] = useState<string | null>(null)
  const [deleteInfo, setDeleteInfo] = useState<{
    id: string
    name: string
  } | null>(null)
  const [editProductInfo, setEditProductInfo] = useState<Product | null>(null)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('')

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', severity: 'success' })

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('authenticated') === 'true'
    setIsAuthenticated(authStatus)
    
    if (!authStatus) {
      router.push('/auth/signin')
    }
  }, [router])

  const showMsg = (
    message: string,
    severity: typeof snackbar.severity = 'success'
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const closeMsg = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Handle sign out
  const handleSignOut = () => {
    sessionStorage.removeItem('authenticated')
    sessionStorage.removeItem('user')
    router.push('/auth/signin')
  }

  // Debounce effect for search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce delay

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Deep-link handling (kept as is)
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

  // 1) Fetch products (kept as is)
  const { data, isLoading, error } = useQuery<PaginatedProducts, Error>({
    queryKey: ['products', page, pageSize],
    queryFn: () =>
      fetch(`/api/products?page=${page}&pageSize=${pageSize}`).then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
  })

  const products = data?.data ?? []
  const rowCount = data?.count ?? 0

  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = filter ? product.category === filter : true
    const matchesSearch = debouncedSearchTerm 
      ? product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      : true
    
    return matchesCategory && matchesSearch
  })

  // Statistics for filtered products
  const lowCount = filteredProducts.filter(p => p.current_stock < 1000).length

  // Clear search function
  const handleClearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }

  // 2) Stock update mutation (kept as is)
  const updateStock = useMutation<
    Product,
    Error,
    { id: string; newStock: number }
  >({
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

  // 3) Delete mutation (kept as is)
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

  // 4) Real-time subscription (kept as is)
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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="white">
          Checking authentication...
        </Typography>
      </Box>
    )
  }

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  // Enhanced DataGrid columns with proper typing
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Product', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params: GridCellParams) => (
        <Typography fontWeight="600" color="#2c3e50">
          {params.value as string}
        </Typography>
      )
    },
    { 
      field: 'sku', 
      headerName: 'SKU', 
      width: 130,
      renderCell: (params: GridCellParams) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            fontFamily: 'monospace'
          }}
        >
          {params.value as string}
        </Box>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120,
      renderCell: (params: GridCellParams) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: (params.value as string) === 'feeds' ? '#e8f5e8' : '#fff3e0',
            color: (params.value as string) === 'feeds' ? '#2e7d32' : '#ef6c00',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'capitalize'
          }}
        >
          {params.value as string}
        </Box>
      )
    },
    {
      field: 'current_stock',
      headerName: 'Stock',
      type: 'number',
      width: 130,
      renderCell: (params: GridCellParams) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <InventoryIcon 
            fontSize="small" 
            sx={{ 
              color: (params.value as number) < 1000 ? '#ff4444' : '#4caf50',
              opacity: 0.8
            }} 
          />
          <Typography 
            fontWeight="bold"
            color={(params.value as number) < 1000 ? '#d32f2f' : '#2e7d32'}
            sx={{
              fontSize: '0.9rem'
            }}
          >
            {(params.value as number).toLocaleString()}
          </Typography>
        </Box>
      ),
      cellClassName: (params: GridCellParams) =>
        (params.value as number) < 1000 ? 'low' : ''
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isSmDown ? 300 : 450,
      renderCell: (params: GridCellParams) => {
        const id = params.row.id as string
        const stock = params.row.current_stock as number
        const name = params.row.name as string

        return (
          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={1}
            alignItems={isSmDown ? 'stretch' : 'center'}
          >
            {/* Enhanced Edit Button */}
            <Tooltip title="Edit Product Details">
              <IconButton
                size="small"
                onClick={() => setEditProductInfo(params.row as Product)}
                sx={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#1976d2',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                  boxShadow: 2
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Enhanced History Button */}
            <Tooltip title="View Stock History">
              <IconButton 
                size="small" 
                onClick={() => setHistoryProductId(id)}
                sx={{
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#7b1fa2',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                  boxShadow: 2
                }}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Enhanced Action Buttons */}
            <Button
              size="small"
              onClick={() => setAddInfo({ id, stock })}
              fullWidth={isSmDown}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(45deg, #00c853 0%, #64dd17 100%)',
                fontWeight: 'bold',
                minWidth: 80,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00a844 0%, #4caf00 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s',
                boxShadow: 2
              }}
            >
              Add
            </Button>

            <Button
              size="small"
              onClick={() => setMoveInfo({ id, stock })}
              fullWidth={isSmDown}
              variant="contained"
              startIcon={<TrendingUpIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2979ff 0%, #00b0ff 100%)',
                fontWeight: 'bold',
                minWidth: 80,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 0%, #0091ea 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s',
                boxShadow: 2
              }}
            >
              Move
            </Button>

            <Button
              size="small"
              onClick={() => setDeductInfo({ id, stock })}
              fullWidth={isSmDown}
              variant="contained"
              startIcon={<RemoveIcon />}
              sx={{
                background: 'linear-gradient(45deg, #ff9100 0%, #ffd600 100%)',
                fontWeight: 'bold',
                minWidth: 90,
                '&:hover': {
                  background: 'linear-gradient(45deg, #e65100 0%, #ffab00 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: 4
                },
                transition: 'all 0.2s',
                boxShadow: 2
              }}
            >
              Deduct
            </Button>

            {/* Enhanced Delete Button */}
            <Tooltip title="Delete Product">
              <IconButton
                size="small"
                onClick={() => setDeleteInfo({ id, name })}
                sx={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: '#d32f2f',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s',
                  boxShadow: 2
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  // Loading & error UI
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Skeleton height={40} sx={{ mb: 2 }} width="100%" />
        <Skeleton height={500} width="100%" />
      </Box>
    )
  }
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Alert severity="error">{error.message}</Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        p: { xs: 2, sm: 4 },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      {/* Enhanced Header */}
      <Paper 
        elevation={6} 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 },
            justifyContent: 'space-between',
            flexDirection: isSmDown ? 'column' : 'row'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
              Inventory Dashboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: isSmDown ? 2 : 0 }}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => router.push('/')}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Home
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Sign Out
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenNew(true)}
              startIcon={<AddIcon />}
              sx={{ 
                minWidth: 160,
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
              New Product
            </Button>
          </Stack>
        </Toolbar>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          {lowCount > 0 && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              🚨 {lowCount} low-stock item{lowCount > 1 ? 's' : ''} need attention!
            </Alert>
          )}

          <Stack
            direction={isSmDown ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack 
              direction={isSmDown ? 'column' : 'row'} 
              spacing={2} 
              alignItems={isSmDown ? 'stretch' : 'center'}
              sx={{ flex: 1 }}
            >
              {/* Search Field */}
              <TextField
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  minWidth: 250,
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
                  '& .MuiInputBase-input': {
                    color: '#2c3e50',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#2c3e50' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ color: '#2c3e50' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Category Filter */}
              <FormControl 
                sx={{ 
                  minWidth: 200, 
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2
                  }
                }}
              >
                <InputLabel sx={{ color: 'white' }}>Filter Category</InputLabel>
                <Select
                  value={filter}
                  onChange={(e: SelectChangeEvent) => setFilter(e.target.value)}
                  label="Filter Category"
                  sx={{
                    color: '#2c3e50',
                    '& .MuiSelect-icon': { color: '#2c3e50' }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="feeds">Feeds</MenuItem>
                  <MenuItem value="flour">Flour</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Statistics Cards */}
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Paper 
                sx={{ 
                  p: 2, 
                  minWidth: 120,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {filteredProducts.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Showing
                </Typography>
              </Paper>
              <Paper 
                sx={{ 
                  p: 2, 
                  minWidth: 120,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                  {lowCount}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Low Stock
                </Typography>
              </Paper>
            </Stack>
          </Stack>

          {/* Search Results Info */}
          {debouncedSearchTerm && (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {`Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} matching "${debouncedSearchTerm}"`}
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleClearSearch}
                sx={{ ml: 1, color: 'white' }}
              >
                Clear
              </Button>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Enhanced DataGrid Container */}
      <Paper
        elevation={6}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 3,
          background: 'white',
          '& .MuiDataGrid-root': {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#2c3e50',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: 'rgba(52, 152, 219, 0.08)',
              },
              '&:nth-of-type(even)': {
                backgroundColor: 'rgba(245, 245, 245, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(52, 152, 219, 0.08)',
                },
              }
            },
            '& .low': {
              backgroundColor: 'rgba(255, 82, 82, 0.1)',
              color: '#d32f2f',
              fontWeight: 'bold',
            }
          }
        }}
      >
        <DataGrid
          rows={filteredProducts}
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
          pageSizeOptions={[10, 25, 50, 80, 100]}
          loading={isLoading}
          sx={{
            '& .MuiDataGrid-loadingOverlay': {
              backgroundColor: 'rgba(255,255,255,0.7)',
            },
            '& .MuiTablePagination-root': {
              fontWeight: 'bold',
            }
          }}
        />
      </Paper>

      {/* Rest of your dialogs and components remain the same */}
      {addInfo && (
        <AddToStockDialog
          open
          currentStock={addInfo.stock}
          productName={products.find(p => p.id === addInfo.id)?.name || 'Unknown Product'}
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
          productName={products.find(p => p.id === moveInfo.id)?.name || 'Unknown Product'}
          onClose={() => setMoveInfo(null)}
          onSaved={ns => updateStock.mutate({ id: moveInfo.id, newStock: ns })}
        />
      )}
      {deductInfo && (
        <DeductStockDialog
          open
          currentStock={deductInfo.stock}
          productName={products.find(p => p.id === deductInfo.id)?.name || 'Unknown Product'}
          onClose={() => setDeductInfo(null)}
          onDeduct={ns =>
            updateStock.mutate({ id: deductInfo.id, newStock: ns })
          }
        />
      )}
      <AddProductDialog 
        open={openNew} 
        onClose={() => setOpenNew(false)}
        onSuccess={(newProduct) => {
          showMsg(`Product "${newProduct.name}" added successfully.`, 'success')
        }}
      />
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

      <EditProductDialog
        open={!!editProductInfo}
        product={editProductInfo}
        onClose={() => setEditProductInfo(null)}
        onSuccess={() => {
          showMsg(
            `Product "${editProductInfo?.name}" updated successfully.`,
            'success'
          )
          setEditProductInfo(null)
        }}
      />

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

      {/* Enhanced Footer */}
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center', 
          mt: 2,
          background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
          borderRadius: 3,
          color: 'white'
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Developed by Patrick Nyerere
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Inventory Management System v1.0
        </Typography>
      </Box>
    </Box>
  )
}