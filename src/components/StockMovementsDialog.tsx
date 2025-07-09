// src/components/StockMovementsDialog.tsx
import React, { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useQuery } from '@tanstack/react-query'

interface Movement {
  id: string
  product_id: string
  quantity_change: number
  performed_by: string
  performed_at: string
}

interface Props {
  open: boolean
  productId: string
  onClose(): void
}

export default function StockMovementsDialog({ open, productId, onClose }: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const { data, isLoading, error, refetch } = useQuery<Movement[], Error>({
    queryKey: ['movements', productId],
    queryFn: () =>
      fetch(`/api/stock-movement?productId=${productId}`)
        .then(res => {
          if (!res.ok) throw new Error(res.statusText)
          return res.json()
        })
  })

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Stock Movement History
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: fullScreen ? 1 : 3, py: fullScreen ? 1 : 2 }}>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error: {error.message}</Typography>
        ) : data && data.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(m => (
                <TableRow key={m.id}>
                  <TableCell sx={{ minWidth: 120 }}>
                    {new Date(m.performed_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {m.quantity_change > 0 ? '+' : ''}
                    {m.quantity_change}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{m.performed_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>No movements yet.</Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}