// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string

  if (req.method === 'PUT') {
    // fetch existing stock
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('current_stock')
      .eq('id', id)
      .single()

    if (fetchErr) {
      res.status(500).json({ error: fetchErr.message })
      return
    }

    const newStock = Number(req.body.current_stock)
    const diff = newStock - (existing?.current_stock ?? 0)

    // update product
    const { data: updatedArr, error: updateErr } = await supabaseAdmin
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', id)
      .select()

    if (updateErr) {
      res.status(500).json({ error: updateErr.message })
      return
    }

    const updated = updatedArr![0]

    // record movement
    if (diff !== 0) {
      await supabaseAdmin
        .from('stock_movements')
        .insert([{ product_id: id, quantity_change: diff }])
    }

    res.status(200).json(updated)
    return
  }

  res.setHeader('Allow', ['PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}