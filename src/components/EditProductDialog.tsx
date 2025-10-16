// src/components/EditProductDialog.tsx
import React, { useState, ChangeEvent, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  name: string
  sku: string
  category: 'feeds' | 'flour'
  current_stock: number
}

interface Props {
  open: boolean
  product: Product | null // The product data to edit
  onClose(): void
  onSuccess(): void // Called when the mutation is successful
}

// Data shape for the PUT request (only editable fields + id)
interface UpdatedProduct {
  id: string
  name: string
  sku: string
  category: 'feeds' | 'flour'
}

/**
 * Dialog component for editing existing product details (Name, SKU, Category).
 */
export default function EditProductDialog({
  open,
  product,
  onClose,
  onSuccess
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Local state initialized with product data
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [category, setCategory] = useState<'feeds' | 'flour'>(
    product?.category || 'feeds'
  )

  // Sync internal state when a new product prop is passed (i.e., when dialog opens for a different item)
  useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku)
      setCategory(product.category)
    }
  }, [product])

  const queryClient = useQueryClient()
  const editProduct = useMutation<Product, Error, UpdatedProduct>({
    mutationFn: async updatedProduct => {
      // Send PUT request to update the product
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      })
      if (!res.ok) {
        const errorBody = await res.json()
        throw new Error(
          errorBody.error || 'Failed to update product details'
        )
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the DataGrid and Summary dashboard stats
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })

      onSuccess() // Notify parent component (Dashboard) for Snackbar and close
    }
  })

  const handleSave = () => {
    if (!product) return // Should not happen if `open` is true
    editProduct.mutate({
      id: product.id,
      name,
      sku,
      category
    })
  }

  // Form validation: ensure name, sku, and category are not empty
  const isFormValid = name.trim() !== '' && sku.trim() !== ''

  // Combined close handler to reset mutation state on dialog close
  const handleClose = () => {
    editProduct.reset()
    onClose()
  }

  return (
    <Dialog
      // Only open if 'open' is true AND product data is available
      open={open && !!product}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Edit Product: {product?.name || '... '}</DialogTitle>
      <DialogContent
        sx={{
          display: 'grid',
          gap: 2,
          width: fullScreen ? '100%' : 360,
          pt: 1
        }}
      >
        {editProduct.isError && (
          <Alert severity="error">
            Failed to save: {editProduct.error?.message}
          </Alert>
        )}

        {/* Read-only ID field */}
        <TextField
          label="ID (Read Only)"
          value={product?.id || ''}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />

        {/* Name Field */}
        <TextField
          label="Name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          fullWidth
          required
        />

        {/* SKU Field */}
        <TextField
          label="SKU"
          value={sku}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSku(e.target.value)
          }
          fullWidth
          required
        />

        {/* Category Select */}
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCategory(e.target.value as 'feeds' | 'flour')
          }
          fullWidth
          required
        >
          <MenuItem value="feeds">Feeds</MenuItem>
          <MenuItem value="flour">Flour</MenuItem>
        </TextField>

        {/* Read-only Stock field */}
        <TextField
          label="Current Stock (Read Only)"
          value={product?.current_stock}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
          helperText="To change stock, use the Add/Deduct/Move buttons in the dashboard."
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose} disabled={editProduct.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={editProduct.isPending || !isFormValid}
          variant="contained"
        >
          {editProduct.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
