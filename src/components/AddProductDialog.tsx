// src/components/AddProductDialog.tsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Paper
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Product {
  name: string
  sku: string
  current_stock: number
  category: 'feeds' | 'flour'
}

interface AddProductDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
}

const addProduct = async (productData: Omit<Product, 'id'>) => {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })
  if (!res.ok) {
    const errorBody = await res.json()
    throw new Error(errorBody.error || 'Failed to add product')
  }
  return res.json() as Promise<Product>
}

export default function AddProductDialog({
  open,
  onClose,
  onSuccess
}: AddProductDialogProps) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState(0)
  const [category, setCategory] = useState<'feeds' | 'flour'>('feeds')
  const [step, setStep] = useState<'form' | 'confirm'>('form')

  const queryClient = useQueryClient()

  const addProductMutation = useMutation<Product, Error, Omit<Product, 'id'>>({
    mutationFn: addProduct,
    onSuccess: newProduct => {
      // Invalidate the main product list and summary queries to show the new product immediately
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })

      onSuccess(newProduct) // Call the success handler in the parent (dashboard)
      handleClose()
    }
  })

  useEffect(() => {
    if (!open) {
      // Reset state when the dialog closes
      setName('')
      setSku('')
      setStock(0)
      setCategory('feeds')
      setStep('form')
      addProductMutation.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]) // Intentionally excluding addProductMutation to prevent infinite loops

  const handleClose = () => {
    onClose()
  }

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setCategory(e.target.value as 'feeds' | 'flour')
  }

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setStock(isNaN(value) ? 0 : value)
  }

  const handleCreateClick = () => {
    if (name.trim() && sku.trim()) {
      setStep('confirm')
    }
  }

  const handleConfirm = () => {
    addProductMutation.mutate({ 
      name: name.trim(), 
      sku: sku.trim(), 
      current_stock: stock, 
      category 
    })
  }

  if (addProductMutation.isPending) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={4}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Creating product...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === 'confirm') {
    return (
      <Dialog open={open} onClose={() => setStep('form')} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm New Product Creation</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to create the following new product?
          </Typography>
          <Stack spacing={1} component={Paper} elevation={1} sx={{ p: 2 }}>
            <Typography>
              <strong>Name:</strong> {name}
            </Typography>
            <Typography>
              <strong>SKU:</strong> {sku}
            </Typography>
            <Typography>
              <strong>Initial Stock:</strong> {stock}
            </Typography>
            <Typography>
              <strong>Category:</strong> {category}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStep('form')} color="secondary">
            Back to Edit
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={addProductMutation.isPending}
          >
            Confirm & Create
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {addProductMutation.isError && (
            <Alert severity="error">
              {addProductMutation.error.message}
            </Alert>
          )}
          <TextField
            label="Product Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
            required
            error={!name.trim()}
            helperText={!name.trim() ? "Product name is required" : ""}
          />
          <TextField
            label="SKU (Stock Keeping Unit)"
            value={sku}
            onChange={e => setSku(e.target.value)}
            fullWidth
            required
            error={!sku.trim()}
            helperText={!sku.trim() ? "SKU is required" : ""}
          />
          <TextField
            label="Initial Stock Quantity"
            type="number"
            value={stock}
            onChange={handleStockChange}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
          <FormControl fullWidth required>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="feeds">Feeds</MenuItem>
              <MenuItem value="flour">Flour</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleCreateClick}
          variant="contained"
          color="primary"
          disabled={!name.trim() || !sku.trim()}
        >
          Create Product
        </Button>
      </DialogActions>
    </Dialog>
  )
}