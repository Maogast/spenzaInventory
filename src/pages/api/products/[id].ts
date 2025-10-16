import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

// Define a type for the update payload to avoid using 'any' on known fields.
// We use a general index signature for potentially dynamic fields.
interface ProductUpdatePayload {
    name?: string;
    sku?: string;
    category?: 'feeds' | 'flour';
    current_stock?: number;
    updated_by: string | null;
    updated_at: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow other properties if needed (e.g., if Supabase adds more audit fields)
}

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

  // ————— UPDATE STOCK OR DETAILS —————
  if (req.method === 'PUT') {
    // 1. Extract all potential fields
    const { name, sku, category, current_stock } = req.body

    // Initialize the dynamic update payload with audit fields
    // Use the defined interface for better type safety
    const updatePayload: ProductUpdatePayload = {
        updated_by: userId,
        updated_at: new Date()
    }

    let diff = 0
    let isStockUpdate = current_stock !== undefined
    let newStock: number | undefined = undefined

    // 2. Handle stock update logic ONLY if current_stock is present
    if (isStockUpdate) {
        newStock = Number(current_stock)
        updatePayload.current_stock = newStock // Add stock to payload for update

        // Fetch old stock to calculate diff for audit log
        const { data: existing, error: fetchErr } = await supabaseAdmin
            .from('products')
            .select('current_stock')
            .eq('id', id)
            .single()

        if (fetchErr) {
            console.warn(`[Audit Warning] Failed to fetch existing stock for product ${id}: ${fetchErr.message}`)
            // If we can't fetch the old stock, we can't calculate a reliable diff, so we skip the audit log.
            isStockUpdate = false
        } else {
            const existingStock = existing?.current_stock ?? 0
            diff = newStock - existingStock
        }
    }

    // 3. Handle detail updates (Add to payload if present in body)
    // These fields come from the EditProductDialog
    if (name !== undefined) updatePayload.name = name
    if (sku !== undefined) updatePayload.sku = sku
    if (category !== undefined) updatePayload.category = category as 'feeds' | 'flour' // Cast category to match the type


    // Sanity check: Ensure at least one product field was passed besides audit fields
    // Note: TypeScript checks ensure all properties added above match the ProductUpdatePayload interface.
    if (Object.keys(updatePayload).length <= 2) {
      return res.status(400).json({ error: 'No valid fields provided for update.' })
    }

    // 4. Perform the product update with the dynamic payload
    // The Supabase client now properly accepts our typed payload
    const { data: updatedArr, error: updateErr } = await supabaseAdmin
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        
    if (updateErr) return res.status(500).json({ error: updateErr.message })
    const updated = updatedArr![0]

    // 5. Log movement ONLY if it was a successful stock update with a non-zero change
    if (isStockUpdate && diff !== 0) { 
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