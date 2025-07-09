import { useEffect } from 'react'
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
  Typography
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

export default function StockMovementsDialog({
  open, productId, onClose
}: Props) {
  const { data, isLoading, error, refetch } = useQuery<Movement[], Error>({
    queryKey: ['movements', productId],
    queryFn: () =>
      fetch(`/api/stock_movements?productId=${productId}`)
        .then(res => {
          if (!res.ok) throw new Error(res.statusText)
          return res.json()
        })
  })

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Stock Movement History
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
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
                  <TableCell>
                    {new Date(m.performed_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {m.quantity_change > 0 ? '+' : ''}
                    {m.quantity_change}
                  </TableCell>
                  <TableCell>{m.performed_by}</TableCell>
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