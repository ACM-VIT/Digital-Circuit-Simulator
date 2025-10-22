'use client'

import React, { useState } from 'react'
import { Play, Share2, Copy } from 'lucide-react'

interface CircuitLoadingTestProps {
  onTestLoad: () => void
}

const CircuitLoadingTest: React.FC<CircuitLoadingTestProps> = ({ onTestLoad }) => {
  const [copied, setCopied] = useState(false)

  const generateTestUrl = () => {
    const testCircuitId = 'test-circuit-123'
    const url = `${window.location.origin}/circuit?load=${testCircuitId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-w-sm">
      <h3 className="text-white font-semibold mb-2">Circuit Loading Test</h3>
      <p className="text-white/70 text-sm mb-3">
        Test the enhanced circuit loading with URL parameters and UI rendering.
      </p>
      
      <div className="space-y-2">
        <button
          onClick={onTestLoad}
          className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          Test Modal Load
        </button>
        
        <button
          onClick={generateTestUrl}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
        >
          {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'URL Copied!' : 'Generate Test URL'}
        </button>
      </div>
      
      <div className="mt-3 text-xs text-white/50">
        <div>✅ URL parameter loading</div>
        <div>✅ Enhanced UI rendering</div>
        <div>✅ Circuit previews</div>
        <div>✅ Share functionality</div>
        <div>✅ URL updates with circuit ID</div>
        <div>✅ New circuit button</div>
        <div>✅ Currently loaded indicator</div>
      </div>
    </div>
  )
}

export default CircuitLoadingTest
