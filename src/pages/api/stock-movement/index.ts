import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const productId = req.query.productId as string | undefined

  let builder = supabaseAdmin
    .from('stock_movements')
    .select('id, product_id, quantity_change, performed_by, performed_at')
    .order('performed_at', { ascending: false })

  if (productId) {
    builder = builder.eq('product_id', productId)
  }

  const { data, error } = await builder

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  return res.status(200).json(data)
}