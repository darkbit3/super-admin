import React, { useState, useEffect } from 'react'
import { client } from '../api/client'

const Credit = () => {
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ customer: '', amount: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({ total_credits: 0, total_amount: 0, total_paid: 0, total_remaining: 0 })

  useEffect(() => {
    loadCredits()
    loadStats()
  }, [])

  const loadCredits = async () => {
    try {
      setLoading(true)
      const res = await client.get('/api/credits/owner')
      setCredits(res.data?.data || [])
    } catch (error) {
      console.error('Failed to load credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await client.get('/api/credits/owner/stats')
      setStats(res.data?.data || {})
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customer.trim() || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      await client.post('/api/credits/record', {
        customer: formData.customer.trim(),
        amount: parseFloat(formData.amount),
        note: formData.note.trim() || null,
      })
      setFormData({ customer: '', amount: '', note: '' })
      setShowForm(false)
      await loadCredits()
      await loadStats()
    } catch (error) {
      alert('Failed to record credit: ' + (error.response?.data?.message || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Issue Credit'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Credits</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_credits || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_amount || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_remaining || 0)}</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Issue New Credit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Optional note about this credit"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {submitting ? 'Saving...' : 'Save Credit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Credits List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Credits</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Loading credits...</p>
            </div>
          ) : credits.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No credits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Remaining</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Issued By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((credit) => (
                    <tr key={credit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{credit.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(credit.total_amount)}</td>
                      <td className="px-6 py-4 text-sm text-green-600">{formatCurrency(credit.total_paid)}</td>
                      <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(credit.total_amount - credit.total_paid)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {credit.cashier_name || 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(credit.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Credit
