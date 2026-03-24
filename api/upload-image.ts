import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { file, filename, bucket, path } = req.body

  if (!file || !filename || !bucket || !path) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Decode base64 file
    const buffer = Buffer.from(file, 'base64')

    // Upload to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return res.status(400).json({ error: error.message })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return res.status(200).json({ publicUrl })

  } catch (error: any) {
    console.error('Server error:', error)
    return res.status(500).json({ error: error.message })
  }
}
