const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Mark Nasser <marknasser20@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '',
  };
  //[3] send the email with nodemailer
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
