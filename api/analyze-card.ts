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
  "player": "Player full name",
  "team": "Team name",
  "league": "League name (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, etc.)",
  "set": "Card set name (Panini Prizm, Topps Chrome, Obsidian, etc.)",
  "year": "Year or season in format YY/YY (e.g., 24/25 for 2024-25 season)",
  "variant": "Colour and variant type (e.g., Pink Breakaway, Gold Refractor, Silver, etc.)",
  "numbered": "Serial number if visible (e.g., /99, /50, /199)",
  "auto": true/false,
  "relic": true/false
}

CRITICAL INSTRUCTIONS FOR YEAR:
- Look for the season year printed on the card (usually top corner or near team logo)
- Common formats: "2024-25", "24-25", "2024/25" - convert ALL to YY/YY format (e.g., 24/25)
- If you see "2024-25" convert to "24/25"
- If you see "2023-24" convert to "23/24"
- Recent cards are typically 23/24, 24/25, or 25/26 (we're currently in 2024-25 season)
- DO NOT guess old years like 21/22 unless clearly printed on the card

VARIANT EXTRACTION:
- Extract the exact colour and variant name (e.g., "Pink Breakaway", "Gold Refractor", "Silver", "Orange Wave", "Blue Shimmer")
- Look for shimmer, refractor, wave, breakaway, cracked ice, etc. patterns

Be as accurate as possible. If unsure about the year, look for ANY printed date on the card.`
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

    // Build title in format: {year} {player} {numbered} {variant} {set} {team}
    // Example: 24/25 Bryan Mbuemo /99 Pink Breakaway Panini Prizm Brentford
    const titleParts = [
      aiResponse.year,
      aiResponse.player,
      aiResponse.numbered,
      aiResponse.variant,
      aiResponse.set,
      aiResponse.team
    ].filter(Boolean) // Remove empty values
    
    const result = {
      title: titleParts.join(' '),
      league: aiResponse.league || '',
      team: aiResponse.team || '',
      set: aiResponse.set || '',
      player: aiResponse.player || '',
      year: aiResponse.year || '',
      variant: aiResponse.variant || '',
      numbered: aiResponse.numbered || '',
      auto: aiResponse.auto || false,
      relic: aiResponse.relic || false,
      confidence: {
        title: Boolean(aiResponse.year && aiResponse.player && aiResponse.team),
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
