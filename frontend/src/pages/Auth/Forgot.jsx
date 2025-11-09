
import { useState } from 'react'
import { api } from '../../services/api'
import Button from '../../components/Button'
import { sendResetEmail } from '../../services/email'

export default function Forgot({ toast }){
  const [email,setEmail]=useState('')
  const [loading,setLoading]=useState(false)

  const submit = async (e)=>{
    e.preventDefault(); setLoading(true)
    try{
      const { data } = await api.post('/auth/forgot', { email })
      await sendResetEmail({
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        toEmail: email,
        resetLink: `${window.location.origin}/reset?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`
      })
      toast('Reset link sent to your email','success')
    }catch(e){ toast(e?.response?.data?.error||'Failed to send','error') } finally{ setLoading(false) }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Forgot password</h2>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <input className="w-full border p-3 rounded" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <Button type="submit" disabled={loading}>{loading?'Sending…':'Send reset link'}</Button>
      </form>
      <div style={{ marginTop:8, fontSize:14 }}><a href="/login">Back to login</a></div>
    </div>
  )
}
