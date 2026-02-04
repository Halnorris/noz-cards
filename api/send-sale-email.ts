import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      buyerEmail, 
      sellerEmail, 
      orderId, 
      cardTitle, 
      cardPrice, 
      cardImageUrl,
      shippingMethod,
      shippingAddress,
      sellerPayout,
      allCards,
      adminEmail
    } = req.body

    if (!buyerEmail || !orderId || !cardTitle || !cardPrice) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Email to BUYER - Order confirmation
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: buyerEmail,
      subject: `Order Confirmation - ${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .card-preview { display: flex; gap: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0; }
              .card-image { width: 120px; height: 160px; object-fit: cover; border-radius: 6px; background: #fff; }
              .price { font-size: 24px; font-weight: bold; color: #000; }
              .info-box { background: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #4caf50; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed! 🎉</h1>
              </div>
              <div class="content">
                <p>Hi,</p>
                
                <p>Thanks for your order! Your payment has been confirmed.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 15px 0;">Order #${orderId.slice(0, 8)}</h3>
                  
                  ${allCards && allCards.length > 0 ? `
                    ${allCards.map((card: any) => `
                      <div style="display: flex; gap: 15px; padding: 15px; background: white; border-radius: 6px; margin-bottom: 10px;">
                        ${card.card_image_url ? `
                          <img src="${card.card_image_url}" alt="${card.card_title}" style="width: 80px; height: 107px; object-fit: cover; border-radius: 4px;">
                        ` : ''}
                        <div style="flex: 1;">
                          <div style="font-weight: 500; margin-bottom: 5px;">${card.card_title}</div>
                          <div style="color: #666; font-size: 14px;">£${card.price?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    `).join('')}
                    
                    <div style="border-top: 2px solid #ddd; margin-top: 15px; padding-top: 15px;">
                      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                        <span>Total</span>
                        <span style="color: #000;">£${cardPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ` : `
                    <div style="padding: 15px; background: white; border-radius: 6px;">
                      <h3 style="margin: 0 0 10px 0;">${cardTitle}</h3>
                      <div style="font-size: 24px; font-weight: bold;">£${cardPrice.toFixed(2)}</div>
                    </div>
                  `}
                </div>
                
                ${shippingMethod === 'store' ? `
                  <div class="info-box">
                    <strong>📦 Your ${allCards && allCards.length > 1 ? 'cards are' : 'card is'} being stored</strong><br>
                    You chose to store ${allCards && allCards.length > 1 ? 'these cards' : 'this card'} for later shipment. We'll hold ${allCards && allCards.length > 1 ? 'them' : 'it'} securely until you're ready to ship!
                  </div>
                ` : `
                  <div class="info-box">
                    <strong>📦 Shipping to:</strong><br>
                    ${shippingAddress || 'Address on file'}
                  </div>
                  <p>Your ${allCards && allCards.length > 1 ? 'cards' : 'card'} will be shipped within 1-2 business days. You'll receive tracking information once ${allCards && allCards.length > 1 ? "they're" : "it's"} on ${allCards && allCards.length > 1 ? 'their' : 'its'} way!</p>
                `}
                
                <p>If you have any questions about your order, just reply to this email.</p>
                
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

    // Wait 600ms to avoid rate limit (Resend: 2 emails/second)
    await new Promise(resolve => setTimeout(resolve, 600))

    // Email to SELLER - Your card sold!
    if (sellerEmail) {
      await resend.emails.send({
        from: 'Noz Cards <support@nozcards.com>',
        to: sellerEmail,
        subject: `🎉 Your Card Sold! - ${cardTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4caf50; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
                .card-preview { display: flex; gap: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0; }
                .card-image { width: 120px; height: 160px; object-fit: cover; border-radius: 6px; background: #fff; }
                .payout-box { background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .payout-amount { font-size: 36px; font-weight: bold; color: #4caf50; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Congrats! Your Card Sold! 🎉</h1>
                </div>
                <div class="content">
                  <p>Great news!</p>
                  
                  <p>Your card just sold on Noz Cards!</p>
                  
                  <div class="card-preview">
                    ${cardImageUrl ? `<img src="${cardImageUrl}" alt="${cardTitle}" class="card-image">` : ''}
                    <div>
                      <h3 style="margin: 0 0 10px 0;">${cardTitle}</h3>
                      <p style="margin: 5px 0; color: #666;">Sale Price: £${cardPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  ${sellerPayout ? `
                    <div class="payout-box">
                      <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Payout (85%)</div>
                      <div class="payout-amount">£${sellerPayout.toFixed(2)}</div>
                      <div style="font-size: 14px; color: #666; margin-top: 10px;">
                        This will be transferred to your Stripe account within 2-7 business days
                      </div>
                    </div>
                  ` : `
                    <div class="payout-box">
                      <p><strong>⚠️ Connect Stripe to receive payouts!</strong></p>
                      <p style="font-size: 14px; margin-top: 10px;">
                        Go to your account settings and connect Stripe to start receiving automatic payouts.
                      </p>
                    </div>
                  `}
                  
                  <p>Thank you for selling with Noz Cards!</p>
                  
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
    }

    // Wait 600ms to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 600))

    // Email to YOU - Sale notification
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: 'support@nozcards.com',
      subject: `💰 Card Sold - Order #${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Card Sale! 💰</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Card:</strong> ${cardTitle}</p>
            <p><strong>Price:</strong> £${cardPrice.toFixed(2)}</p>
            ${sellerPayout ? `<p><strong>Seller Payout:</strong> £${sellerPayout.toFixed(2)}</p>` : '<p><strong>Seller Payout:</strong> N/A (no Stripe account)</p>'}
            <p><strong>Buyer:</strong> ${buyerEmail}</p>
            ${sellerEmail ? `<p><strong>Seller:</strong> ${sellerEmail}</p>` : ''}
            <p><strong>Shipping:</strong> ${shippingMethod === 'store' ? 'Stored' : shippingMethod}</p>
            ${shippingAddress ? `<p><strong>Address:</strong> ${shippingAddress}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-GB')}</p>
            <hr>
            ${shippingMethod !== 'store' ? '<p><em>⚠️ Ship this card within 1-2 business days</em></p>' : '<p><em>Card is being stored - no immediate action needed</em></p>'}
          </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending sale email:', error)
    return res.status(500).json({ error: error.message })
  }
}
