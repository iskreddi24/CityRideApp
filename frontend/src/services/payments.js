
export async function loadRazorpay(){
  if (window.Razorpay) return
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'
    s.onload=resolve; s.onerror=()=>reject(new Error('Razorpay load failed')); document.body.appendChild(s)
  })
}
