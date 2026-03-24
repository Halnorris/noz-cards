import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'

type CardData = {
  nozid: string
  title: string
  sport: string
  league: string
  team: string
  set: string
  image_orientation: 'portrait' | 'landscape'
  price: string
  status: string
  image_url: string
  image_back_url: string
  owner_user_id: string
  aiConfidence?: {
    title: boolean
    league: boolean
    team: boolean
    set: boolean
  }
}

export default function UploadCards() {
  const { user } = useAuth()
  const [folderName, setFolderName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const [progress, setProgress] = useState('')

  // Check if user is admin
  const isAdmin = user?.email === 'support@nozcards.com' || user?.email === 'habnorris@gmail.com'

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You must be an admin to access this page.</p>
        </div>
      </div>
    )
  }

  const handleProcessFolder = async () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name')
      return
    }

    setProcessing(true)
    setProgress(`Loading images from ${folderName}...`)

    try {
      // List all files in the folder
      const { data: files, error } = await supabase.storage
        .from('card-scans')
        .list(`New scans/${folderName}`, {
          limit: 1000,
          offset: 0
        })

      console.log('Supabase response:', { files, error, folderName, path: `New scans/${folderName}` })

      if (error) {
        console.error('Error listing files:', error)
        setProgress(`Failed to load folder "${folderName}". Error: ${error.message}`)
        setProcessing(false)
        return
      }

      if (!files || files.length === 0) {
        setProgress(`Folder "${folderName}" is empty or doesn't exist. Received ${files?.length || 0} files.`)
        setProcessing(false)
        return
      }

      setProgress(`Found ${files.length} files. Processing...`)

      // Group files into pairs
      const pairs: { [key: string]: { front?: string; back?: string } } = {}

      files.forEach(file => {
        const filename = file.name.replace(/\.(jpg|jpeg|png)$/i, '')
        
        if (filename.endsWith('a')) {
          const nozid = filename.slice(0, -1)
          if (!pairs[nozid]) pairs[nozid] = {}
          pairs[nozid].back = file.name
        } else {
          const nozid = filename
          if (!pairs[nozid]) pairs[nozid] = {}
          pairs[nozid].front = file.name
        }
      })

      setProgress(`Found ${Object.keys(pairs).length} card pairs. Getting URLs...`)

      const processedCards: CardData[] = []

      for (const [nozid, pair] of Object.entries(pairs)) {
        if (!pair.front) continue

        const frontPath = `New scans/${folderName}/${pair.front}`
        const { data: { publicUrl: frontUrl } } = supabase.storage
          .from('card-scans')
          .getPublicUrl(frontPath)

        let backUrl = ''
        if (pair.back) {
          const backPath = `New scans/${folderName}/${pair.back}`
          const { data: { publicUrl } } = supabase.storage
            .from('card-scans')
            .getPublicUrl(backPath)
          backUrl = publicUrl
        }

        const orientation = await detectOrientation(frontUrl)

        processedCards.push({
          nozid,
          title: '',
          sport: 'Football',
          league: '',
          team: '',
          set: '',
          image_orientation: orientation,
          price: '',
          status: 'pending',
          image_url: frontUrl,
          image_back_url: backUrl,
          owner_user_id: ''
        })
      }

      setCards(processedCards)
      setProgress(`Found ${processedCards.length} cards. Starting AI analysis...`)

      // Run AI
      await processWithAI(processedCards)

    } catch (error) {
      console.error('Processing error:', error)
      setProgress('Processing failed. Check console.')
      setProcessing(false)
    }
  }

  const detectOrientation = (url: string): Promise<'portrait' | 'landscape'> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.width > img.height ? 'landscape' : 'portrait')
      img.onerror = () => resolve('portrait')
      img.src = url
    })
  }

  const processWithAI = async (cardsToProcess: CardData[]) => {
    const updatedCards = [...cardsToProcess]

    for (let i = 0; i < updatedCards.length; i++) {
      const card = updatedCards[i]
      setProgress(`Analyzing ${card.nozid} (${i + 1}/${updatedCards.length})...`)

      try {
        const analysis = await fetch('/api/analyze-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: card.image_url })
        }).then(r => r.json())
        
        updatedCards[i] = {
          ...card,
          title: analysis.title,
          league: analysis.league,
          team: analysis.team,
          set: analysis.set,
          aiConfidence: analysis.confidence
        }
      } catch (error) {
        console.error(`AI failed for ${card.nozid}:`, error)
        updatedCards[i] = {
          ...card,
          title: `[AI FAILED] ${card.nozid}`,
          aiConfidence: { title: false, league: false, team: false, set: false }
        }
      }
    }

    setCards(updatedCards)
    setProcessing(false)
    setProgress(`AI analysis complete! Review and edit below.`)
  }

  const updateCard = (nozid: string, field: keyof CardData, value: any) => {
    setCards(prev => prev.map(c => c.nozid === nozid ? { ...c, [field]: value } : c))
  }

  const downloadCSV = () => {
    if (cards.length === 0) {
      alert('No cards to download')
      return
    }

    const header = 'nozid,title,sport,league,team,set,image_orientation,price,status,image_url,image_back_url,owner_user_id\n'
    const rows = cards.map(card => [
      card.nozid,
      `"${card.title.replace(/"/g, '""')}"`,
      card.sport, card.league, card.team, card.set,
      card.image_orientation, card.price, card.status,
      card.image_url, card.image_back_url, card.owner_user_id
    ].join(',')).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cards_${folderName}_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Card Analyzer</h1>

      <div className="bg-white border border-black/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Step 1: Enter Folder Name</h2>
        <p className="text-sm text-black/70 mb-4">
          Upload your scans to Supabase in <code>New scans/your-folder-name/</code> first, then enter the folder name here.
        </p>

        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="e.g. Test batch"
          className="w-full p-3 border border-black/10 rounded mb-4"
        />

        <button
          onClick={handleProcessFolder}
          disabled={processing || !folderName.trim()}
          className="px-6 py-3 bg-black text-white font-medium hover:bg-black/80 transition disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Analyze Folder with AI'}
        </button>

        {progress && (
          <div className="mt-4 p-4 bg-gray-50 border border-black/10 rounded">
            <p className="text-sm">{progress}</p>
          </div>
        )}
      </div>

      {cards.length > 0 && (
        <div className="bg-white border border-black/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Step 2: Review & Edit ({cards.length} cards)</h2>
            <button onClick={downloadCSV} className="px-4 py-2 bg-brass text-white font-medium hover:bg-brass/80 transition">
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-black/10">
                <tr className="text-left">
                  <th className="p-2">Card</th>
                  <th className="p-2">Preview</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">League</th>
                  <th className="p-2">Team</th>
                  <th className="p-2">Set</th>
                  <th className="p-2">Orient</th>
                  <th className="p-2">Price (£)</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.nozid} className="border-b border-black/5 hover:bg-gray-50">
                    <td className="p-2 font-mono">{card.nozid}</td>
                    <td className="p-2">
                      <img src={card.image_url} alt={card.nozid} className="w-16 h-20 object-cover border border-black/10" />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(card.nozid, 'title', e.target.value)}
                        className={`w-full p-1 border ${card.aiConfidence?.title ? 'border-green-500' : 'border-yellow-500'} rounded text-xs`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={card.league}
                        onChange={(e) => updateCard(card.nozid, 'league', e.target.value)}
                        className={`w-full p-1 border ${card.aiConfidence?.league ? 'border-green-500' : 'border-yellow-500'} rounded text-xs`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={card.team}
                        onChange={(e) => updateCard(card.nozid, 'team', e.target.value)}
                        className={`w-full p-1 border ${card.aiConfidence?.team ? 'border-green-500' : 'border-yellow-500'} rounded text-xs`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={card.set}
                        onChange={(e) => updateCard(card.nozid, 'set', e.target.value)}
                        className={`w-full p-1 border ${card.aiConfidence?.set ? 'border-green-500' : 'border-yellow-500'} rounded text-xs`}
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={card.image_orientation}
                        onChange={(e) => updateCard(card.nozid, 'image_orientation', e.target.value)}
                        className="w-full p-1 border border-black/10 rounded text-xs"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={card.price}
                        onChange={(e) => updateCard(card.nozid, 'price', e.target.value)}
                        className="w-20 p-1 border border-black/10 rounded text-xs"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border border-black/10 rounded">
            <p className="text-xs text-black/70">
              <strong>Green borders</strong> = AI is confident. <strong>Yellow borders</strong> = AI uncertain.
              <br />
              After reviewing, click "Download CSV", add <code>owner_user_id</code> in Excel, then upload to Supabase.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
