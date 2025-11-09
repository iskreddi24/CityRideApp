
import { useState } from 'react'
import { api } from '../services/api'
import Button from '../components/Button'

export default function RoleSelection({ user, onDone, toast }){
  const [name,setName]=useState(user?.name||'')
  const [role,setRole]=useState('user')
  const [loading,setLoading]=useState(false)

  const save = async ()=>{
    setLoading(true)
    try{ await api.post('/auth/profile', { name, role }); toast('Profile saved','success'); onDone && onDone(role) }
    catch(e){ toast(e?.response?.data?.error||'Failed to save','error') } finally{ setLoading(false) }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Complete your profile</h2>
      <input className="w-full border p-3 rounded" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
      <select className="w-full border p-3 rounded" value={role} onChange={e=>setRole(e.target.value)} style={{ marginTop:8 }}>
        <option value="user">Commuter</option>
        <option value="owner">Ride Owner</option>
        <option value="admin">Admin (requires approval)</option>
      </select>
      <Button onClick={save} disabled={loading} style={{ marginTop:12 }}>{loading?'Saving…':'Save'}</Button>
    </div>
  )
}
