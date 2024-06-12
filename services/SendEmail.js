const nodemailer = require("nodemailer");
const path = require("path");

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vstrapy@gmail.com',
    pass: 'fyokbtjwbpvwbnpk'
  }
});

async function sendmail(mail, subject, text) {
  var mailOptions = {
    from: 'vstrapy@gmail.com',
    to: mail,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendMailWithAttachment(mail, subject, text, filePath) {
  var mailOptions = {
    from: 'vstrapy@gmail.com',
    to: mail,
    subject: subject,
    text: text,
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath
      }
    ]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email with attachment sent: ' + info.response);
    }
  });
}

module.exports = {
  sendmail,
  sendMailWithAttachment
}
