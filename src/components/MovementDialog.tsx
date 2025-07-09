// src/components/MovementDialog.tsx
import { useState } from 'react'
import {
  Dialog, DialogTitle,
  DialogContent, DialogActions,
  TextField, Button
} from '@mui/material'

interface Props {
  open: boolean
  currentStock: number
  onClose(): void
  onSaved(newStock: number): void
}

export default function MovementDialog({
  open, currentStock, onClose, onSaved
}: Props) {
  const [amount, setAmount] = useState(0)

  const handleSave = () => {
    const newStock = currentStock + amount
    onSaved(newStock > 0 ? newStock : 0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adjust Stock</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, width: 300 }}>
        <TextField
          label="Current Stock"
          value={currentStock}
          disabled
        />
        <TextField
          type="number"
          label="Quantity to Add / Remove"
          helperText="Use negative to remove"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={amount === 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}