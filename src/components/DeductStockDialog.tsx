import React, { useState, ChangeEvent, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
  Stack,
  Paper,
  Box
} from '@mui/material'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
// Removed import of ConfirmDialog, as logic is now integrated

interface Props {
  open: boolean
  currentStock: number
  productName: string // Added for confirmation context
  onClose: () => void
  onDeduct: (newStock: number) => void
}

export default function DeductStockDialog({
  open,
  currentStock,
  productName,
  onClose,
  onDeduct
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [amount, setAmount] = useState(0)
  const [step, setStep] = useState<'form' | 'confirm'>('form') // State for form/confirm view

  const resultingStock = currentStock - amount
  const finalStock = Math.max(0, resultingStock);

  useEffect(() => {
    if (!open) {
        // Reset state when the dialog closes
        setAmount(0)
        setStep('form')
    }
  }, [open])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    // Ensure amount is non-negative and not greater than currentStock
    const cappedVal = Math.min(Math.max(0, val), currentStock)
    setAmount(cappedVal)
  }

  const handleContinue = () => {
    if (amount > 0 && amount <= currentStock) {
      setStep('confirm') // Move to confirmation step
    }
  }

  const handleConfirm = () => {
    // onDeduct receives the final calculated stock
    onDeduct(finalStock) 
    handleClose()
  }

  const handleClose = () => {
    // Reset state and close the dialog
    setAmount(0)
    setStep('form')
    onClose()
  }

  // --- CONFIRMATION VIEW ---
  if (step === 'confirm') {
    return (
      <Dialog open={open} onClose={() => setStep('form')} fullScreen={fullScreen} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Stock Deduction</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            You are removing stock from: <strong>{productName || 'Product'}</strong>
          </Typography>
          
          <Stack spacing={2} component={Paper} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Current Stock:</Typography>
              <Typography variant="body1" fontWeight="bold">{currentStock.toLocaleString()}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Quantity to Remove:</Typography>
              <Typography variant="body1" fontWeight="bold" color="error.main">
                - {amount.toLocaleString()}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="h6">Final Stock Result:</Typography>
              <Typography variant="h6" fontWeight="bold" color={finalStock === 0 ? 'error.main' : 'primary.main'}>
                {finalStock.toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Click **Confirm Deduction** to finalize this removal from your inventory.
          </Typography>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStep('form')} color="secondary">
            Back to Edit
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
          >
            Confirm Deduction
          </Button>
        </DialogActions>
      </Dialog>
    )
  }


  // --- FORM VIEW ---
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <RemoveCircleOutlineIcon color="error" />
          <Typography variant="h6">Deduct Stock</Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent
        sx={{ display: 'grid', gap: 2, width: fullScreen ? '100%' : 360 }}
      >
        <TextField
            label="Product Name"
            value={productName || 'N/A'}
            disabled
            fullWidth
        />
        <TextField
          label="Current Stock"
          value={currentStock.toLocaleString()}
          disabled
          fullWidth
        />
        <TextField
          type="number"
          label="Quantity to Remove"
          value={amount === 0 ? '' : amount}
          onChange={handleChange}
          inputProps={{ min: 0, max: currentStock }}
          fullWidth
          autoFocus
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Resulting Stock: **{finalStock.toLocaleString()}**
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleContinue}
          variant="contained"
          color="primary"
          disabled={amount <= 0 || amount > currentStock}
        >
          Review & Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
