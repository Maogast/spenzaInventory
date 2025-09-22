// src/components/DeductStockDialog.tsx
import React, { useState, ChangeEvent } from 'react'
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
import ConfirmDialog from './ConfirmDialog'

interface Props {
  open: boolean
  currentStock: number
  onClose: () => void
  onDeduct: (newStock: number) => void
}

export default function DeductStockDialog({
  open,
  currentStock,
  onClose,
  onDeduct
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [amount, setAmount] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setAmount(val < 0 ? 0 : val)
  }

  const handleSave = () => {
    if (amount > 0) {
      setConfirmOpen(true)
    }
  }

  const handleConfirm = () => {
    const newStock = Math.max(0, currentStock - amount)
    onDeduct(newStock)
    setConfirmOpen(false)
    setAmount(0)
    onClose()
  }

  const handleCancel = () => {
    setConfirmOpen(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Deduct Stock</DialogTitle>
        <DialogContent
          sx={{ display: 'grid', gap: 2, width: fullScreen ? '100%' : 360 }}
        >
          <TextField
            label="Current Stock"
            value={currentStock}
            disabled
            fullWidth
          />
          <TextField
            type="number"
            label="Quantity to Remove"
            value={amount}
            onChange={handleChange}
            inputProps={{ min: 0, max: currentStock }}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={amount <= 0 || amount > currentStock}
          >
            Deduct
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Deduct Stock"
        content={`Remove ${amount} unit${amount > 1 ? 's' : ''}?`}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  )
}