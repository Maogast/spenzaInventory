import React, { useState, ChangeEvent } from 'react'
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
  useMediaQuery
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ConfirmDialog from './ConfirmDialog'

interface Props {
  open: boolean
  currentStock: number
  onClose: () => void
  onAdd: (amount: number) => void
}

export default function AddToStockDialog({
  open,
  currentStock,
  onClose,
  onAdd
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
    onAdd(amount)
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
            label="Current Stock"
            value={currentStock}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <TextField
            label="Quantity to Add"
            type="number"
            value={amount}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            fullWidth
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={amount <= 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Add Stock"
        content={`Add ${amount} unit${amount > 1 ? 's' : ''} to stock?`}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  )
}