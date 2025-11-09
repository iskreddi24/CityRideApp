import { useState } from 'react'
import { api } from '../../services/api'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'

export default function Signup({ onSuccess, toast }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/signup', { name, email, password, role })
      toast('Account created successfully', 'success')
      onSuccess && onSuccess()
    } catch (e) {
      toast(e?.response?.data?.error || 'Signup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Create Account</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="w-full border p-3 rounded" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="w-full border p-3 rounded" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-3 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label style={{ fontSize: 12 }}>Choose Role</label>
        <select className="w-full border p-3 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Commuter</option>
          <option value="owner">Ride Owner (Share rides)</option>
        </select>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </Button>
      </form>
      <div style={{ marginTop: 8, fontSize: 14 }}>
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  )
}
