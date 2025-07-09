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
  title: string
  content: string
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({
  open,
  title,
  content,
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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ px: fullScreen ? 2 : 3, py: fullScreen ? 1 : 2 }}>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" variant="contained" onClick={onConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}