import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      buyerEmail, 
      shippingOrderId, 
      cardCount,
      shippingCost,
      shippingMethod,
      shippingAddress,
      cards
    } = req.body

    if (!buyerEmail || !shippingOrderId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Email to BUYER - Shipping confirmation
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: buyerEmail,
      subject: `Shipping Order Confirmed - ${shippingOrderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2196f3; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .info-box { background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0; }
              .cards-list { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Shipping Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hi,</p>
                
                <p>We've received your shipping payment! Your stored cards will be on their way soon.</p>
                
                <div class="info-box">
                  <strong>Shipping Details:</strong><br>
                  <p style="margin: 10px 0 5px 0;">
                    <strong>Order:</strong> #${shippingOrderId.slice(0, 8)}<br>
                    <strong>Cards:</strong> ${cardCount} ${cardCount === 1 ? 'card' : 'cards'}<br>
                    <strong>Method:</strong> ${shippingMethod.replace(/_/g, ' ')}<br>
                    <strong>Cost:</strong> £${shippingCost.toFixed(2)}
                  </p>
                </div>
                
                ${cards && cards.length > 0 ? `
                  <div class="cards-list">
                    <strong>Cards being shipped:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      ${cards.map((card: any) => `<li>${card.card_title || 'Card'}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                
                <div class="info-box">
                  <strong>📍 Shipping to:</strong><br>
                  ${shippingAddress || 'Address on file'}
                </div>
                
                <p>We'll send you tracking information once your cards are shipped (usually within 1-2 business days).</p>
                
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

    // Wait 600ms to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 600))

    // Email to YOU - Shipping order notification
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: 'support@nozcards.com',
      subject: `📦 Shipping Order - ${shippingOrderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Shipping Order! 📦</h2>
            <p><strong>Order ID:</strong> ${shippingOrderId}</p>
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            <p><strong>Cards:</strong> ${cardCount}</p>
            <p><strong>Method:</strong> ${shippingMethod}</p>
            <p><strong>Cost:</strong> £${shippingCost.toFixed(2)}</p>
            <p><strong>Address:</strong> ${shippingAddress || 'N/A'}</p>
            ${cards && cards.length > 0 ? `
              <p><strong>Cards:</strong></p>
              <ul>
                ${cards.map((card: any) => `<li>${card.card_title || 'Card'} - £${card.price?.toFixed(2) || '0.00'}</li>`).join('')}
              </ul>
            ` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-GB')}</p>
            <hr>
            <p><em>⚠️ Ship these cards within 1-2 business days</em></p>
          </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending shipping email:', error)
    return res.status(500).json({ error: error.message })
  }
}
