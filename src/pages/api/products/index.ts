import type { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Replace createServerSupabaseClient with createPagesServerClient
  const supabase = createPagesServerClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }
  )
  
  const {
    data: { session }
  } = await supabase.auth.getSession()
  const userId = session?.user.id ?? null

  const { method, query, body } = req

  if (method === 'GET') {
    const page     = parseInt(query.page  as string) || 0
    const pageSize = parseInt(query.pageSize as string) || 10
    const from     = page * pageSize
    const to       = from + pageSize - 1

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

    // Create product with audit fields
    const { data: products, error: insertErr } = await supabaseAdmin
      .from('products')
      .insert([{
        name,
        sku,
        current_stock,
        category,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()

    if (insertErr) return res.status(400).json({ error: insertErr.message })
    const newProduct = products![0]

    // Record initial stock movement
    await supabaseAdmin
      .from('stock_movements')
      .insert([{
        product_id:      newProduct.id,
        quantity_change: newProduct.current_stock,
        performed_by:    userId,
        performed_at:    new Date()
      }])

    return res.status(201).json(newProduct)
  }

  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${method} Not Allowed`)
}