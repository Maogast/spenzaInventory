// src/components/AddStockDialog.tsx
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props {
  open: boolean
  onClose(): void
}

export default function AddStockDialog({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState<'feeds' | 'flour'>('feeds')
  const [stock, setStock] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const qc = useQueryClient()

  const addProduct = useMutation({
    mutationFn: (newProduct: {
      name: string
      sku: string
      category: 'feeds' | 'flour'
      current_stock: number
    }) =>
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add product')
        return res.json()
      }),
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await addProduct.mutateAsync({
        name,
        sku,
        category,
        current_stock: stock,
      })
      // Refresh the list
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    } catch (err) {
      console.error(err)
      // optionally show an error toast here
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Product / Stock</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, width: 300 }}>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          label="SKU"
          value={sku}
          onChange={e => setSku(e.target.value)}
        />
        <TextField
          select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value as any)}
        >
          <MenuItem value="feeds">Feeds</MenuItem>
          <MenuItem value="flour">Flour</MenuItem>
        </TextField>
        <TextField
          type="number"
          label="Initial Stock"
          value={stock}
          onChange={e => setStock(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
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