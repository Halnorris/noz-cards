import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      orderId,
      trackingNumber,
      trackingCarrier,
      shippingMethod,
      shippingAddress,
    } = req.body

    if (!orderId || !trackingNumber || !trackingCarrier) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get order details and buyer email
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total,
        order_type,
        order_items(
          card_title,
          card_nozid,
          card_image_url
        )
      `)
      .eq('id', orderId)
      .single()

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Get buyer email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', order.user_id)
      .single()

    const buyerEmail = profile?.email

    if (!buyerEmail) {
      return res.status(404).json({ error: 'Buyer email not found' })
    }

    // Just use the carrier name as entered (e.g., "Royal Mail")
    const carrierName = trackingCarrier

    const isShippingOrder = order.order_type === 'shipping'
    const cardCount = order.order_items?.length || 0

    // Send tracking email to buyer
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: buyerEmail,
      subject: `📦 Your Order Has Shipped! - ${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4caf50; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .tracking-box { background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0; text-align: center; }
              .tracking-number { font-family: monospace; font-size: 24px; font-weight: bold; color: #2e7d32; margin: 10px 0; }
              .button { display: inline-block; padding: 15px 30px; background: #4caf50; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
              .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
              .card-item { border: 1px solid #ddd; border-radius: 6px; padding: 8px; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Your Order Has Shipped!</h1>
              </div>
              <div class="content">
                <p>Great news! Your order is on its way.</p>
                
                <div class="tracking-box">
                  <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Tracking Number</div>
                  <div class="tracking-number">${trackingNumber}</div>
                  <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">Carrier: ${carrierName}</div>
                </div>

                <h3 style="margin-top: 30px;">Order Details</h3>
                <div class="info-row">
                  <strong>Order ID:</strong> #${orderId.slice(0, 8)}
                </div>
                ${!isShippingOrder && cardCount > 0 ? `
                  <div class="info-row">
                    <strong>Cards Shipped:</strong> ${cardCount} ${cardCount === 1 ? 'card' : 'cards'}
                  </div>
                  ${order.order_items && order.order_items.length > 0 ? `
                    <div style="margin: 15px 0;">
                      <strong>Your Cards:</strong>
                      <div class="card-grid">
                        ${order.order_items.slice(0, 6).map((item: any) => `
                          <div class="card-item">
                            ${item.card_image_url ? `
                              <img src="${item.card_image_url}" style="width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 4px; margin-bottom: 4px;" alt="${item.card_title || 'Card'}">
                            ` : ''}
                            <div style="font-weight: bold; font-family: monospace; font-size: 10px;">${item.card_nozid || 'N/A'}</div>
                            <div style="opacity: 0.7; font-size: 9px;">${(item.card_title || 'Card').substring(0, 30)}</div>
                          </div>
                        `).join('')}
                        ${order.order_items.length > 6 ? `
                          <div class="card-item" style="display: flex; align-items: center; justify-content: center; opacity: 0.6;">
                            +${order.order_items.length - 6} more
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  ` : ''}
                ` : ''}
                <div class="info-row">
                  <strong>Shipping Method:</strong> ${shippingMethod?.replace(/_/g, ' ') || 'Standard'}
                </div>
                <div class="info-row">
                  <strong>Shipping To:</strong><br>
                  ${shippingAddress || 'Address on file'}
                </div>

                <p style="margin-top: 30px;">Your package should arrive within the estimated delivery time for your selected shipping method.</p>
                
                <p>If you have any questions about your shipment, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>The Noz Cards Team</p>
              </div>
              <div class="footer">
                <p>Noz Cards | support@nozcards.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending tracking email:', error)
    return res.status(500).json({ error: error.message })
  }
}
