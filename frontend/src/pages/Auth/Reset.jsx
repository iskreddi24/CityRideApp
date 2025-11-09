
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Button from '../../components/Button'

export default function Reset({ toast }){
  const [token,setToken]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [ok,setOk]=useState(false)
  useEffect(()=>{
    const p = new URLSearchParams(window.location.search)
    setToken(p.get('token')||''); setEmail(p.get('email')||''); setOk(!!p.get('token'))
  },[])
  const submit = async (e)=>{
    e.preventDefault()
    try{ await api.post('/auth/reset', { email, token, password }); toast('Password reset','success'); window.location.href='/login' }
    catch(e){ toast(e?.response?.data?.error||'Reset failed','error') }
  }
  if(!ok) return <div className="card" style={{maxWidth:420, margin:'40px auto'}}>Invalid reset link</div>
  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Set a new password</h2>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <input className="w-full border p-3 rounded" placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <Button type="submit">Reset password</Button>
      </form>
    </div>
  )
}
