// app/page.tsx
'use client'

import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Loader2 } from 'lucide-react'

export default function Home() {
  const [formData, setFormData] = useState({
    serviceType: '',
    staffName: '',
    specific: '',
    improvement: ''
  })
  
  const [apiKey, setApiKey] = useState('')
  const [generatedReview, setGeneratedReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const generateReview = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          formData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate review')
      }

      setGeneratedReview(data.review)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Failed to generate review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReview)
      alert('Review copied to clipboard!')
    } catch (err) {
      alert('Failed to copy review. Please try selecting and copying manually.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">AI Review Generator</h1>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="mt-1 font-mono"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from platform.openai.com
              </p>
            </div>
            
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                placeholder="e.g., Carpet Cleaning"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="staffName">Staff Name</Label>
              <Input
                id="staffName"
                name="staffName"
                value={formData.staffName}
                onChange={handleInputChange}
                placeholder="e.g., Mike Smith"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="specific">What impressed you?</Label>
              <Textarea
                id="specific"
                name="specific"
                value={formData.specific}
                onChange={handleInputChange}
                placeholder="e.g., They were very thorough"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="improvement">What made it special?</Label>
              <Textarea
                id="improvement"
                name="improvement"
                value={formData.improvement}
                onChange={handleInputChange}
                placeholder="e.g., They went above and beyond"
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={generateReview}
              disabled={isLoading || !apiKey.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Review...
                </>
              ) : (
                'Generate AI Review'
              )}
            </Button>
            
            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            {generatedReview && (
              <div className="mt-6">
                <Label htmlFor="generatedReview">Generated AI Review:</Label>
                <div className="relative mt-1">
                  <Textarea 
                    id="generatedReview"
                    value={generatedReview}
                    readOnly
                    className="min-h-[150px]"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2"
                    size="icon"
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}