// pages/api/summary.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Create the updated Supabase client
  const supabaseAdmin = createPagesServerClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
    }
  )

  try {
    // 1) Count total SKUs
    const { count: totalSKUs, error: skuError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })

    if (skuError) {
      console.error('Error counting total SKUs:', skuError)
      return res.status(500).json({ error: 'Failed to count total SKUs' })
    }

    // 2) Sum all stock via SQL RPC
    const { data: sumData, error: sumError } = await supabaseAdmin.rpc('sum_stock')
    
    if (sumError) {
      console.error('Error summing stock:', sumError)
      return res.status(500).json({ error: 'Failed to sum total stock' })
    }

    const totalStock = sumData?.[0]?.total_stock ?? 0

    // 3) Count low-stock SKUs (<1000)
    const { count: lowCount, error: lowError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lt('current_stock', 1000)

    if (lowError) {
      console.error('Error counting low stock:', lowError)
      return res.status(500).json({ error: 'Failed to count low stock items' })
    }

    // Return original format for backward compatibility
    return res.status(200).json({ 
      totalSKUs: totalSKUs || 0, 
      totalStock, 
      lowCount: lowCount || 0 
    })

  } catch (error) {
    console.error('Summary API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}