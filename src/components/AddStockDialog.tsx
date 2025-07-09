import React, { useState, ChangeEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props { open: boolean; onClose(): void }
interface NewProduct {
  name: string
  sku: string
  category: 'feeds' | 'flour'
  current_stock: number
}
interface Product extends NewProduct { id: string }

export default function AddStockDialog({ open, onClose }: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState<'feeds' | 'flour'>('feeds')
  const [stock, setStock] = useState(0)
  const [saving, setSaving] = useState(false)
  const qc = useQueryClient()

  const addProduct = useMutation<Product, Error, NewProduct>({
    mutationFn: newProduct =>
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).then(r => {
        if (!r.ok) throw new Error('Failed to add product')
        return r.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await addProduct.mutateAsync({
        name, sku, category, current_stock: stock
      })
      onClose()
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
          onChange={e => setCategory(e.target.value as any)}
          fullWidth
        >
          <MenuItem value="feeds">Feeds</MenuItem>
          <MenuItem value="flour">Flour</MenuItem>
        </TextField>
        <TextField
          type="number"
          label="Initial Stock"
          value={stock}
          onChange={e => setStock(Number(e.target.value))}
          inputProps={{ min: 0 }}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}