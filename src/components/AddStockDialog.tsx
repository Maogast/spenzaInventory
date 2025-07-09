// src/components/AddStockDialog.tsx
import React, { useState, ChangeEvent } from 'react'
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

interface NewProduct {
  name: string
  sku: string
  category: 'feeds' | 'flour'
  current_stock: number
}

interface Product {
  id: string
  name: string
  sku: string
  category: 'feeds' | 'flour'
  current_stock: number
}

export default function AddStockDialog({ open, onClose }: Props) {
  const [name, setName] = useState<string>('')
  const [sku, setSku] = useState<string>('')
  const [category, setCategory] = useState<'feeds' | 'flour'>('feeds')
  const [stock, setStock] = useState<number>(0)
  const [saving, setSaving] = useState<boolean>(false)
  const qc = useQueryClient()

  const addProduct = useMutation<Product, Error, NewProduct>({
    mutationFn: newProduct =>
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add product')
        return res.json() as Promise<Product>
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
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
    } catch {
      // handle error
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <TextField
          label="SKU"
          value={sku}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSku(e.target.value)}
        />
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCategory(e.target.value as 'feeds' | 'flour')
          }
        >
          <MenuItem value="feeds">Feeds</MenuItem>
          <MenuItem value="flour">Flour</MenuItem>
        </TextField>
        <TextField
          type="number"
          label="Initial Stock"
          value={stock}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setStock(Number(e.target.value))
          }
          inputProps={{ min: 0 }}
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