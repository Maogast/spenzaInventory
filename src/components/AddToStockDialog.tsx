import React, { useState, ChangeEvent, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Box
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
// Removed import of ConfirmDialog, as logic is now integrated

interface Props {
  open: boolean
  currentStock: number
  productName: string // Added for confirmation context
  onClose: () => void
  onAdd: (amount: number) => void
}

export default function AddToStockDialog({
  open,
  currentStock,
  productName,
  onClose,
  onAdd
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [amount, setAmount] = useState(0)
  const [step, setStep] = useState<'form' | 'confirm'>('form') // State for form/confirm view

  const resultingStock = currentStock + amount

  useEffect(() => {
    if (!open) {
      // Reset state when the dialog closes
      setAmount(0)
      setStep('form')
    }
  }, [open])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    // Ensure amount is non-negative
    setAmount(val < 0 ? 0 : val)
  }

  const handleContinue = () => {
    if (amount > 0) {
      setStep('confirm') // Move to confirmation step
    }
  }

  const handleConfirm = () => {
    onAdd(amount)
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
        <DialogTitle>Confirm Stock Receipt</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            You are adding stock to: <strong>{productName || 'Product'}</strong>
          </Typography>
          
          <Stack spacing={2} component={Paper} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Current Stock:</Typography>
              <Typography variant="body1" fontWeight="bold">{currentStock.toLocaleString()}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Quantity to Add:</Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                + {amount.toLocaleString()}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="h6">Final Stock Result:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {resultingStock.toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Click **Confirm Receipt** to finalize this addition to your inventory.
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
            Confirm Receipt
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
          <AddCircleOutlineIcon color="primary" />
          <Typography variant="h6">Add Stock</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'grid',
          gap: 2,
          width: fullScreen ? '100%' : 360
        }}
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
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          label="Quantity to Add"
          type="number"
          value={amount === 0 ? '' : amount}
          onChange={handleChange}
          inputProps={{ min: 0 }}
          fullWidth
          autoFocus
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Resulting Stock: **{resultingStock.toLocaleString()}**
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={amount <= 0}
        >
          Review & Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
