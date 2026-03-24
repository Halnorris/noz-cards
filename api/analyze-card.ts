import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl } = req.body

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' })
  }

  try {
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl
                }
              },
              {
                type: 'text',
                text: `Analyze this football card image and extract the following information. Respond ONLY with valid JSON, no markdown formatting:

{
  "player": "Player name",
  "team": "Team name",
  "league": "League name (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, etc.)",
  "set": "Card set name (Topps Chrome, Panini Prizm, Obsidian, etc.)",
  "year": "Year or season (e.g., 2023-24)",
  "parallel": "Parallel type if any (Gold, Silver, Refractor, etc.)",
  "numbered": "Serial number if visible (e.g., /50, /99)",
  "auto": true/false,
  "relic": true/false,
  "title": "Complete card description"
}

Be as accurate as possible. If you're unsure about something, still make your best guess.`
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return res.status(response.status).json({ error: 'Failed to analyze card', details: data })
    }

    const textContent = data.content.find((c: any) => c.type === 'text')?.text || '{}'
    
    // Remove markdown code fences if present
    const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const aiResponse = JSON.parse(cleanJson)

    // Build title and return structured data
    const result = {
      title: aiResponse.title || `${aiResponse.year || ''} ${aiResponse.set || ''} ${aiResponse.player || ''} ${aiResponse.parallel || ''}`.trim(),
      league: aiResponse.league || '',
      team: aiResponse.team || '',
      set: aiResponse.set || '',
      player: aiResponse.player || '',
      year: aiResponse.year || '',
      parallel: aiResponse.parallel || '',
      numbered: aiResponse.numbered || '',
      auto: aiResponse.auto || false,
      relic: aiResponse.relic || false,
      confidence: {
        title: Boolean(aiResponse.title),
        league: Boolean(aiResponse.league),
        team: Boolean(aiResponse.team),
        set: Boolean(aiResponse.set)
      }
    }

    return res.status(200).json(result)

  } catch (error: any) {
    console.error('Error analyzing card:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
