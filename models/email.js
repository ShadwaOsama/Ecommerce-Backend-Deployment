// const nodemailer = require('nodemailer')

// const sendEmail= async(option)=>{
//     const transporter=nodemailer.createTransport({
//         host:process.env.EMAIL_HOST,
//         port:process.env.EMAIL_PORT,
//         auth:{
//             user:process.env.EMAIL_USER,
//             pass:process.env.EMAIL_PASSWORD
//         }
//     })

//     const emailOptions={
//         from:'Cineflix support<support@cineflix.com>',
//         to:option.email,
//         subject:option.subject,
//         text:option.message
//     }
//    await transporter.sendMail(emailOptions)
// }

const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: "hotmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailOptions = {
      from: "Cineflix support <support@cineflix.com>",
      to: option.email,
      subject: option.subject,
      text: option.message,
    };

    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Rethrow the error to be handled by the calling function
  }
};
module.exports = sendEmail;
