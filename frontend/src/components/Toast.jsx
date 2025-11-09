
export default function Toast({ message, type='info' }){
  if (!message) return null
  const bg = type==='success'?'#16a34a':type==='error'?'#dc2626':type==='warn'?'#ca8a04':'#111827'
  return <div style={{position:'fixed',right:16,bottom:16,background:bg,color:'#fff',padding:'12px 16px',borderRadius:12}}>{message}</div>
}
