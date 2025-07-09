// src/components/AddStockDialog.tsx
import React, { useState, ChangeEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props {
  open: boolean
  onClose(): void
}

interface NewProduct {
  name: string
  sku: string
  category: 'feeds' | 'flour'
  current_stock: number
}

interface Product extends NewProduct {
  id: string
}

export default function AddStockDialog({ open, onClose }: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState<'feeds' | 'flour'>('feeds')
  const [stock, setStock] = useState(0)
  const [saving, setSaving] = useState(false)

  const queryClient = useQueryClient()
  const addProduct = useMutation<Product, Error, NewProduct>({
    mutationFn: async newProduct => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })
      if (!res.ok) throw new Error('Failed to add product')
      return res.json()
    },
    onSuccess: () => {
      // v4 requires an options object
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await addProduct.mutateAsync({
        name,
        sku,
        category,
        current_stock: stock
      })
      onClose()
      // reset
      setName('')
      setSku('')
      setCategory('feeds')
      setStock(0)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Add New Product / Stock</DialogTitle>
      <DialogContent
        sx={{
          display: 'grid',
          gap: 2,
          width: fullScreen ? '100%' : 360
        }}
      >
        <TextField
          label="Name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          label="SKU"
          value={sku}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSku(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCategory(e.target.value as 'feeds' | 'flour')
          }
          fullWidth
        >
          <MenuItem value="feeds">Feeds</MenuItem>
          <MenuItem value="flour">Flour</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Initial Stock"
          value={stock}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setStock(Math.max(0, Number(e.target.value)))
          }
          inputProps={{ min: 0 }}
          fullWidth
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}