'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Carrier {
  id: string
  name: string
  matchScore: number
  estimatedPremium: number
  commissionNew: number
  responseTime: string
  mitchPartner: boolean
  amBestRating: string
}

export default function PlacementWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([])
  const [naicsCodes, setNaicsCodes] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    clientName: '',
    contactEmail: '',
    contactPhone: '',
    province: 'ON',
    naicsCode: '541511',
    revenue: '',
    employees: '',
    yearsInBusiness: '',
    lossHistory: 'clean'
  })

  useEffect(() => {
    fetch('/api/naics')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch NAICS codes')
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setNaicsCodes(data)
        }
      })
      .catch(err => {
        console.error('Error fetching NAICS codes:', err)
      })
  }, [])

  const findCarriers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/placements/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to match carriers')
      }
      
      const data = await response.json()
      setCarriers(data || [])
      setStep(3)
    } catch (error) {
      console.error('Error finding carriers:', error)
      alert('Error finding carriers. Please try again.')
    }
    setLoading(false)
  }

  const submitPlacements = async () => {
    setLoading(true)
    console.log('Submitting to carriers:', selectedCarriers)
    setStep(4)
    setLoading(false)
  }

  const toggleCarrier = (carrierId: string) => {
    if (selectedCarriers.includes(carrierId)) {
      setSelectedCarriers(selectedCarriers.filter(id => id !== carrierId))
    } else {
      setSelectedCarriers([...selectedCarriers, carrierId])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-2">🍁</span>
            <h1 className="text-2xl font-bold text-blue-600">New Placement</h1>
          </div>

          <div className="flex mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 ${s <= step ? 'bg-blue-600' : 'bg-gray-200'} ${
                  s < 4 ? 'mr-2' : ''
                } rounded`}
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    placeholder="ABC Company Ltd."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="contact@company.ca"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="(416) 555-0100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Province</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                  >
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                onClick={() => setStep(2)}
                disabled={!formData.clientName || !formData.contactEmail}
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Business Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Industry (NAICS)</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.naicsCode}
                    onChange={(e) => setFormData({...formData, naicsCode: e.target.value})}
                  >
                    <option value="541511">Custom Computer Programming</option>
                    <option value="541110">Offices of Lawyers</option>
                    <option value="541211">Offices of CPAs</option>
                    <option value="541330">Engineering Services</option>
                    <option value="238210">Electrical Contractors</option>
                    <option value="238220">Plumbing & HVAC Contractors</option>
                    <option value="236220">Commercial Building Construction</option>
                    <option value="445110">Supermarkets and Grocery</option>
                    <option value="722511">Full-Service Restaurants</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Annual Revenue (CAD)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    placeholder="1000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Employees</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={formData.employees}
                    onChange={(e) => setFormData({...formData, employees: e.target.value})}
                    placeholder="25"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years in Business</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={formData.yearsInBusiness}
                    onChange={(e) => setFormData({...formData, yearsInBusiness: e.target.value})}
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loss History</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.lossHistory}
                    onChange={(e) => setFormData({...formData, lossHistory: e.target.value})}
                  >
                    <option value="clean">No claims (5+ years)</option>
                    <option value="minor">Minor claims only</option>
                    <option value="moderate">Some claims</option>
                    <option value="major">Significant claims</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 space-x-3">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  onClick={findCarriers}
                  disabled={!formData.revenue || !formData.employees || loading}
                >
                  {loading ? 'Finding...' : 'Find Carriers'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Carrier Matches</h2>
              {carriers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No carriers found matching your criteria.</p>
                  <button
                    type="button"
                    className="mt-4 bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                    onClick={() => setStep(2)}
                  >
                    Back to Edit
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">Select carriers to submit to:</p>
                  
                  <div className="space-y-3">
                    {carriers.map((carrier) => (
                      <div
                        key={carrier.id}
                        className={`border rounded-lg p-4 cursor-pointer ${
                          selectedCarriers.includes(carrier.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300'
                        }`}
                        onClick={() => toggleCarrier(carrier.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {carrier.name}
                              {carrier.mitchPartner && (
                                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
                                  MITCH PARTNER
                                </span>
                              )}
                            </h3>
                            <div className="text-sm text-gray-600 mt-1">
                              Rating: {carrier.amBestRating} | Commission: {carrier.commissionNew}% | 
                              Response: {carrier.responseTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {carrier.matchScore}%
                            </div>
                            <div className="text-sm text-gray-600">
                              Est. ${carrier.estimatedPremium?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-x-3">
                    <button
                      type="button"
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      onClick={submitPlacements}
                      disabled={selectedCarriers.length === 0 || loading}
                    >
                      Submit to {selectedCarriers.length} Carrier(s)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-4">Successfully Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your placement has been sent to {selectedCarriers.length} carrier(s).
                <br />
                Expected response time: 2-6 hours
              </p>
              <div className="bg-gray-50 rounded p-4 mb-6 text-left max-w-md mx-auto">
                <div className="text-sm space-y-2">
                  <div><strong>Client:</strong> {formData.clientName}</div>
                  <div><strong>Revenue:</strong> ${parseInt(formData.revenue || '0').toLocaleString()}</div>
                  <div><strong>Carriers:</strong> {selectedCarriers.length} selected</div>
                  <div><strong>Reference:</strong> MPL-{Date.now()}</div>
                </div>
              </div>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                onClick={() => router.push('/')}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
