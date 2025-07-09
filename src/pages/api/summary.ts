// src/pages/api/summary.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // 1) Count total SKUs
  const { count: totalSKUs } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })

  // 2) Sum all stock via SQL RPC
  // SQL function: CREATE FUNCTION sum_stock() RETURNS TABLE(total_stock bigint) AS $$
  //   SELECT SUM(current_stock)::bigint AS total_stock FROM products;
  // $$ LANGUAGE SQL STABLE;
  const { data: sumData } = await supabaseAdmin.rpc('sum_stock')
  const totalStock = sumData?.[0]?.total_stock ?? 0

  // 3) Count low-stock SKUs (<1000)
  const { count: lowCount } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .lt('current_stock', 1000)

  return res.status(200).json({ totalSKUs, totalStock, lowCount })
}