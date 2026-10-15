import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'documents', label: 'Documents' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' }
]

const STATUSES = [
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
  { value: 'claimed', label: 'Claimed' }
]

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: when an `id` is present in the URL, fetch the item and populate the form
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }

    let isMounted = true

    api.get(`/items/${id}`)
      .then(res => {
        if (!isMounted) return
        const item = res.data.item
        if (item) {
          setForm({
            title: item.title || '',
            description: item.description || '',
            category: item.category || 'other',
            status: item.status || 'lost',
            location: item.location || ''
          })
        }
      })
      .catch(err => {
        if (!isMounted) return
        setError(err?.response?.data?.message || 'Failed to load item')
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Update `form` state when any form input or select changes
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Create new item (POST /api/items) or update existing item (PATCH /api/items/:id),
  // then navigate back to /items. On error, display the server's error message.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/items/${id}`, form)
      } else {
        await api.post('/items', form)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />

        <select
          className="input"
          name="status"
          value={form.status}
          onChange={onChange}
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          className="input"
          name="category"
          value={form.category}
          onChange={onChange}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          className="input"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={onChange}
        />

        <textarea
          className="input"
          name="description"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={onChange}
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}
