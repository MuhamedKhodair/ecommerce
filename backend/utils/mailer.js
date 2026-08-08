const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_SECURE !== 'false',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

function sendMail({ to, subject, html }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error('[mailer] MAIL_USER / MAIL_PASS not configured, skipping send')
    return Promise.resolve()
  }
  return transporter
    .sendMail({
      from: `"ShopNext" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    })
    .catch((err) => {
      console.error('[mailer] send failed:', err.message)
    })
}

module.exports = { sendMail }
