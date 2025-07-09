import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material'

interface Props {
  open: boolean
  productName: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmDialog({
  open,
  productName,
  onClose,
  onConfirm
}: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent
        sx={{
          px: fullScreen ? 2 : 3,
          py: fullScreen ? 1 : 2
        }}
      >
        <Typography>
          Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}