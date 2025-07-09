import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
  useMediaQuery
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
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [amount, setAmount] = useState(0)

  const handleSave = () => {
    const newStock = currentStock + amount
    onSaved(Math.max(0, newStock))
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Adjust Stock</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, width: fullScreen ? '100%' : 360 }}>
        <TextField
          label="Current Stock"
          value={currentStock}
          disabled
          fullWidth
        />
        <TextField
          type="number"
          label="Quantity to Add / Remove"
          helperText="Use negative to remove"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={amount === 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}