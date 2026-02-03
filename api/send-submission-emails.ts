import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userEmail, referenceNumber, quantity, cardDescription } = req.body

    if (!userEmail || !referenceNumber) {
      return res.status(400).json({ error: 'Email and reference number are required' })
    }

    // Send confirmation email to seller
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: userEmail,
      subject: `Submission Received - ${referenceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .reference { background: #f5f5f5; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
              .reference-number { font-size: 24px; font-weight: bold; color: #000; }
              .info-box { background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0; }
              .steps { background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; }
              .step { margin: 10px 0; padding-left: 30px; position: relative; }
              .step::before { content: "✓"; position: absolute; left: 0; color: #4caf50; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Submission Received! 📦</h1>
              </div>
              <div class="content">
                <p>Hi,</p>
                
                <p>We've received your card submission! Here are the details:</p>
                
                <div class="reference">
                  <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Reference Number</div>
                  <div class="reference-number">${referenceNumber}</div>
                </div>
                
                <p><strong>Submission Details:</strong></p>
                <ul>
                  <li>Number of cards: <strong>${quantity}</strong></li>
                  ${cardDescription ? `<li>Description: ${cardDescription}</li>` : ''}
                  <li>Submission time: ${new Date().toLocaleString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</li>
                </ul>
                
                <div class="info-box">
                  <strong>📍 Our Address:</strong><br>
                  Noz Cards<br>
                  [YOUR ADDRESS HERE]<br>
                  [POSTCODE]<br>
                  United Kingdom
                </div>
                
                <div class="steps">
                  <h3 style="margin-top: 0;">What happens next?</h3>
                  <div class="step">Pack your cards safely in protective sleeves</div>
                  <div class="step">Include your reference number (${referenceNumber}) in the package</div>
                  <div class="step">Send to the address above using tracked shipping</div>
                  <div class="step">We'll photograph your cards and send pricing suggestions</div>
                  <div class="step">Once approved, your cards go live and you get paid when they sell!</div>
                </div>
                
                <div class="info-box">
                  <strong>⚠️ Important Reminders:</strong>
                  <ul style="margin: 10px 0;">
                    <li>Cards must be in good condition</li>
                    <li>Damaged cards will be returned at your expense</li>
                    <li>For weekend collection, email us at support@nozcards.com</li>
                  </ul>
                </div>
                
                <p>If you have any questions, just reply to this email!</p>
                
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

    // Send notification to you
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: 'support@nozcards.com',
      subject: `📦 New Submission - ${referenceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Card Submission!</h2>
            <p><strong>Reference:</strong> ${referenceNumber}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Quantity:</strong> ${quantity} cards</p>
            ${cardDescription ? `<p><strong>Description:</strong> ${cardDescription}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-GB')}</p>
            <hr>
            <p><em>Awaiting cards to be sent by seller</em></p>
          </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending submission email:', error)
    return res.status(500).json({ error: error.message })
  }
}
