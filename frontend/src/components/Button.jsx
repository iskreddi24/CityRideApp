
export default function Button({ children, onClick, type='button', variant='primary', disabled, style }){
  const cls = `btn ${variant==='secondary'?'secondary':''}`
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>{children}</button>
}
