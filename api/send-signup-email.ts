import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userEmail, userName } = req.body

    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Send welcome email to user
    await resend.emails.send({
      from: 'Noz Cards <support@nozcards.com>',
      to: userEmail,
      subject: 'Welcome to Noz Cards! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Noz Cards!</h1>
              </div>
              <div class="content">
                <p>Hi${userName ? ` ${userName}` : ''},</p>
                
                <p>Thanks for signing up! We're excited to have you join our community of sports card collectors.</p>
                
                <p><strong>What you can do now:</strong></p>
                <ul>
                  <li>Browse our marketplace for amazing cards</li>
                  <li>Add cards to your wishlist</li>
                  <li>Submit your own cards for consignment</li>
                  <li>Connect Stripe to sell cards and get paid automatically</li>
                </ul>
                
                <a href="https://nozcards.com/marketplace" class="button">Browse Marketplace</a>
                
                <p>If you have any questions, just reply to this email - we're here to help!</p>
                
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
      subject: '🎉 New User Signup',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New User Signed Up!</h2>
            <p><strong>Email:</strong> ${userEmail}</p>
            ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-GB')}</p>
          </body>
        </html>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error sending signup email:', error)
    return res.status(500).json({ error: error.message })
  }
}
