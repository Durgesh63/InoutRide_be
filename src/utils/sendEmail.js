const { EMAIL, PASSWORD } = require("../constant");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

function sendEmail(email, template, subject, attachments = []) {
  try {
    const mailOptions = {
      from: `SpryVoc < ${EMAIL}>`,
      to: email,
      subject: subject,
      html: template,
    };

    if (attachments?.length > 0) {
      mailOptions.attachments = attachments?.map((item) => {
        return {
          filename: item.filename,
          path: __dirname + item.path,
          cid: item.cid,
        };
      });
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(" Email Send :", mailOptions.to);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendEmail;
