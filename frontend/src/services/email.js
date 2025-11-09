
import emailjs from "@emailjs/browser";

export async function sendResetEmail({ serviceId, templateId, publicKey, toEmail, resetLink }){
  const vars = { to_email: toEmail, reset_link: resetLink }
  return emailjs.send(serviceId, templateId, vars, publicKey)
}
