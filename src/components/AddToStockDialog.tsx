import React, { useState } from 'react'
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

interface Props {
  open: boolean
  currentStock: number
  onClose(): void
  onAdd(amount: number): void
}

export default function AddToStockDialog({
  open, currentStock, onClose, onAdd
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [amount, setAmount] = useState(0)

  const handleSave = () => {
    if (amount > 0) onAdd(amount)
    setAmount(0)
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
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AddCircleOutlineIcon color="primary" />
          <Typography variant="h6">Add Stock</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
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
            onChange={e => setAmount(Number(e.target.value))}
            inputProps={{ min: 0 }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={amount <= 0}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}