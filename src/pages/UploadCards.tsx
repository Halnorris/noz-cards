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
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      setFiles(fileList)
    }
  }

  const handleUploadAndProcess = async () => {
    if (files.length === 0) {
      alert('Please select files first')
      return
    }

    setUploading(true)
    setProgress('Uploading images to Supabase...')

    try {
      // Group files into pairs (front and back)
      const pairs: { [key: string]: { front?: File; back?: File } } = {}

      files.forEach(file => {
        const filename = file.name.replace(/\.(jpg|jpeg|png)$/i, '')
        
        if (filename.endsWith('a')) {
          // Back image
          const nozid = filename.slice(0, -1)
          if (!pairs[nozid]) pairs[nozid] = {}
          pairs[nozid].back = file
        } else {
          // Front image
          const nozid = filename
          if (!pairs[nozid]) pairs[nozid] = {}
          pairs[nozid].front = file
        }
      })

      setProgress(`Found ${Object.keys(pairs).length} card pairs. Uploading...`)

      const uploadedCards: CardData[] = []

      for (const [nozid, pair] of Object.entries(pairs)) {
        if (!pair.front) {
          console.warn(`No front image for ${nozid}`)
          continue
        }

        setProgress(`Uploading ${nozid}...`)

        // Upload front image
        const frontPath = `New scans/${nozid}.jpg`
        const { error: frontError } = await supabase.storage
          .from('card-scans')
          .upload(frontPath, pair.front, {
            upsert: true,
            contentType: 'image/jpeg'
          })

        if (frontError) {
          console.error(`Error uploading front ${nozid}:`, frontError)
          continue
        }

        const { data: { publicUrl: frontUrl } } = supabase.storage
          .from('card-scans')
          .getPublicUrl(frontPath)

        // Upload back image if exists
        let backUrl = ''
        if (pair.back) {
          const backPath = `New scans/${nozid}a.jpg`
          const { error: backError } = await supabase.storage
            .from('card-scans')
            .upload(backPath, pair.back, {
              upsert: true,
              contentType: 'image/jpeg'
            })

          if (!backError) {
            const { data: { publicUrl } } = supabase.storage
              .from('card-scans')
              .getPublicUrl(backPath)
            backUrl = publicUrl
          }
        }

        // Detect orientation from front image
        const orientation = await detectOrientation(pair.front)

        uploadedCards.push({
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

      setCards(uploadedCards)
      setUploading(false)
      setProgress(`Upload complete! ${uploadedCards.length} cards ready for AI processing.`)

      // Automatically start AI processing
      await processWithAI(uploadedCards)

    } catch (error) {
      console.error('Upload error:', error)
      setProgress('Upload failed. Check console for errors.')
      setUploading(false)
    }
  }

  const detectOrientation = async (file: File): Promise<'portrait' | 'landscape'> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve(img.width > img.height ? 'landscape' : 'portrait')
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const processWithAI = async (cardsToProcess: CardData[]) => {
    setProcessing(true)
    setProgress('Running AI analysis on cards...')

    const updatedCards = [...cardsToProcess]

    for (let i = 0; i < updatedCards.length; i++) {
      const card = updatedCards[i]
      setProgress(`Analyzing ${card.nozid} (${i + 1}/${updatedCards.length})...`)

      try {
        // Call our serverless function to analyze the card
        const analysis = await analyzeCardImage(card.image_url)
        
        updatedCards[i] = {
          ...card,
          title: analysis.title,
          league: analysis.league,
          team: analysis.team,
          set: analysis.set,
          aiConfidence: {
            title: analysis.confidence.title,
            league: analysis.confidence.league,
            team: analysis.confidence.team,
            set: analysis.confidence.set
          }
        }

      } catch (error) {
        console.error(`AI analysis failed for ${card.nozid}:`, error)
        updatedCards[i] = {
          ...card,
          title: `[AI FAILED] ${card.nozid}`,
          aiConfidence: {
            title: false,
            league: false,
            team: false,
            set: false
          }
        }
      }
    }

    setCards(updatedCards)
    setProcessing(false)
    setProgress(`AI analysis complete! Review and edit the results below.`)
  }

  const analyzeCardImage = async (imageUrl: string) => {
    // Call our serverless function
    const response = await fetch('/api/analyze-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    })

    if (!response.ok) {
      throw new Error('Failed to analyze card')
    }

    const result = await response.json()
    return result
  }

  const updateCard = (nozid: string, field: keyof CardData, value: any) => {
    setCards(prev =>
      prev.map(card =>
        card.nozid === nozid ? { ...card, [field]: value } : card
      )
    )
  }

  const downloadCSV = () => {
    if (cards.length === 0) {
      alert('No cards to download')
      return
    }

    // Create CSV header
    const header = 'nozid,title,sport,league,team,set,image_orientation,price,status,image_url,image_back_url,owner_user_id\n'
    
    // Create CSV rows
    const rows = cards.map(card => {
      return [
        card.nozid,
        `"${card.title.replace(/"/g, '""')}"`, // Escape quotes
        card.sport,
        card.league,
        card.team,
        card.set,
        card.image_orientation,
        card.price,
        card.status,
        card.image_url,
        card.image_back_url,
        card.owner_user_id
      ].join(',')
    }).join('\n')

    const csv = header + rows

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cards_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload & Process Cards</h1>

      {/* Upload Section */}
      <div className="bg-white border border-black/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Step 1: Select Card Scans</h2>
        <p className="text-sm text-black/70 mb-4">
          Select all front and back images. Front images should be named like <code>1101.jpg</code>, back images like <code>1101a.jpg</code>
        </p>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="mb-4"
        />

        {files.length > 0 && (
          <p className="text-sm mb-4">Selected {files.length} files</p>
        )}

        <button
          onClick={handleUploadAndProcess}
          disabled={uploading || processing || files.length === 0}
          className="px-6 py-3 bg-black text-white font-medium hover:bg-black/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : processing ? 'Processing with AI...' : 'Upload & Process'}
        </button>

        {progress && (
          <div className="mt-4 p-4 bg-gray-50 border border-black/10 rounded">
            <p className="text-sm">{progress}</p>
          </div>
        )}
      </div>

      {/* Review Table */}
      {cards.length > 0 && (
        <div className="bg-white border border-black/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Step 2: Review & Edit ({cards.length} cards)</h2>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-brass text-white font-medium hover:bg-brass/80 transition"
            >
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
              <strong>Green borders</strong> = AI is confident. <strong>Yellow borders</strong> = AI is uncertain, please review.
              <br />
              After reviewing, click "Download CSV", then add <code>owner_user_id</code> column in Excel before uploading to Supabase.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
