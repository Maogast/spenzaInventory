// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  const userId = session?.user.id ?? null

  // normalize id
  const id = Array.isArray(req.query.id)
    ? req.query.id[0]
    : (req.query.id as string)

  // ————— UPDATE STOCK —————
  if (req.method === 'PUT') {
    // fetch old stock
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('current_stock')
      .eq('id', id)
      .single()
    if (fetchErr) return res.status(500).json({ error: fetchErr.message })

    const newStock = Number(req.body.current_stock ?? 0)
    const diff = newStock - (existing?.current_stock ?? 0)

    // update product + audit
    const { data: updatedArr, error: updateErr } = await supabaseAdmin
      .from('products')
      .update({
        current_stock: newStock,
        updated_by: userId,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
    if (updateErr) return res.status(500).json({ error: updateErr.message })
    const updated = updatedArr![0]

    // log movement
    if (diff !== 0) {
      await supabaseAdmin.from('stock_movements').insert([
        {
          product_id: id,
          quantity_change: diff,
          performed_by: userId,
          performed_at: new Date()
        }
      ])
    }

    return res.status(200).json(updated)
  }

  // ————— DELETE PRODUCT —————
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing product ID' })

    const { error: deleteErr } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
    if (deleteErr) return res.status(500).json({ error: deleteErr.message })

    return res.status(204).end()
  }

  // ————— FALLBACK —————
  res.setHeader('Allow', ['PUT', 'DELETE'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}