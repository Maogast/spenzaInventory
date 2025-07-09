// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Build a Supabase client that can read the user session
  const supabase = createServerSupabaseClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  const userId = session?.user.id ?? null

  const id = req.query.id as string

  if (req.method === 'PUT') {
    // 1) fetch existing stock
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('current_stock')
      .eq('id', id)
      .single()

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message })
    }

    const newStock = Number(req.body.current_stock)
    const diff     = newStock - (existing?.current_stock ?? 0)

    // 2) update products table with audit fields
    const { data: updatedArr, error: updateErr } = await supabaseAdmin
      .from('products')
      .update({
        current_stock: newStock,
        updated_by:    userId,
        updated_at:    new Date()
      })
      .eq('id', id)
      .select()

    if (updateErr) {
      return res.status(500).json({ error: updateErr.message })
    }
    const updated = updatedArr![0]

    // 3) record movement
    if (diff !== 0) {
      await supabaseAdmin
        .from('stock_movements')
        .insert([{
          product_id:      id,
          quantity_change: diff,
          performed_by:    userId,
          performed_at:    new Date()
        }])
    }

    return res.status(200).json(updated)
  }

  res.setHeader('Allow', ['PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}