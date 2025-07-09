
// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req

  if (method === 'GET') {
    // parse page & pageSize, default to 0 & 10
    const page     = parseInt(query.page  as string) || 0
    const pageSize = parseInt(query.pageSize as string) || 10
    const from     = page * pageSize
    const to       = from + pageSize - 1

    // fetch slice + exact count
    const { data, count, error } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order('inserted_at', { ascending: false })
      .range(from, to)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data, count })
  }

  if (method === 'POST') {
    const { name, sku, current_stock, category } = body
    const { data: products, error: insertErr } = await supabaseAdmin
      .from('products')
      .insert([{ name, sku, current_stock, category }])
      .select()

    if (insertErr) return res.status(400).json({ error: insertErr.message })
    const newProduct = products![0]

    await supabaseAdmin
      .from('stock_movements')
      .insert([{ product_id: newProduct.id, quantity_change: newProduct.current_stock }])

    return res.status(201).json(newProduct)
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}