import React, { useState } from 'react'
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

interface Props {
  open: boolean
  currentStock: number
  productName: string // Added for better context in confirmation
  onClose(): void
  onSaved(newStock: number): void
}

export default function MovementDialog({
  open, currentStock, productName, onClose, onSaved
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [amount, setAmount] = useState(0)
  const [step, setStep] = useState<'form' | 'confirm'>('form') // Added step state

  // Calculate the resulting stock for display
  const newStock = currentStock + amount
  const isAddition = amount > 0
  const isRemoval = amount < 0

  React.useEffect(() => {
    if (!open) {
      // Reset state when the dialog closes
      setAmount(0)
      setStep('form')
    }
  }, [open])

  const handleClose = () => {
    onClose()
  }

  const handleContinue = () => {
    // Only proceed to confirmation if amount is not zero
    if (amount !== 0) {
      setStep('confirm')
    }
  }

  const handleConfirm = () => {
    // The stock is saved, ensuring it doesn't drop below zero
    onSaved(Math.max(0, newStock))
    handleClose() 
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setAmount(value)
  }

  // --- CONFIRMATION VIEW ---
  if (step === 'confirm') {
    const actionColor = isAddition ? 'success.main' : isRemoval ? 'error.main' : 'text.primary';
    const actionIcon = isAddition ? '+' : isRemoval ? '-' : '±';

    return (
      <Dialog open={open} onClose={() => setStep('form')} fullScreen={fullScreen} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Stock Adjustment</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Reviewing movement for: <strong>{productName || 'Product'}</strong>
          </Typography>
          
          <Stack spacing={2} component={Paper} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Current Stock:</Typography>
              <Typography variant="body1" fontWeight="bold">{currentStock.toLocaleString()}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Quantity to {isAddition ? 'Add' : 'Remove'}:</Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: actionColor }}>
                {actionIcon} {Math.abs(amount).toLocaleString()}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="h6">Final Stock Result:</Typography>
              <Typography variant="h6" fontWeight="bold" color={newStock < 0 ? 'error.main' : 'primary.main'}>
                {Math.max(0, newStock).toLocaleString()}
                {newStock < 0 && (
                    <Typography component="span" color="error.main" sx={{ ml: 1 }}> (Capped at 0)</Typography>
                )}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Click **Confirm Adjustment** to finalize this change in your inventory.
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
            Confirm Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  // --- FORM VIEW (Default) ---
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Adjust Stock</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, width: fullScreen ? '100%' : 360 }}>
        {/* Added Product name field for context */}
        <TextField
          label="Product"
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
          label="Quantity to Add / Remove"
          helperText="Enter positive for addition (receipt) or negative for removal (dispatch)."
          value={amount === 0 ? '' : amount} // Clear input when value is 0 for better UX
          onChange={handleAmountChange}
          fullWidth
          autoFocus
          inputProps={{ step: 1 }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Resulting Stock: **{Math.max(0, newStock).toLocaleString()}**
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleContinue} 
          variant="contained" 
          color="primary"
          disabled={amount === 0}
        >
          Review & Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
