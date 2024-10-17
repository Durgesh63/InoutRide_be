const bcrypt = require("bcrypt");
const checkVaoidEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const isValidPassowrd = async (password, dbPassword) => {
  return await bcrypt.compare(password, dbPassword);
};

function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const otpTemplate = (otp, language) => {
  if ((language = "eng")) {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" width="100%">
                <tr>
                    <td style="text-align: left; padding: 20px;">
                        <img src="cid:verificationLogo" alt="Verification Logo" height="100" style="max-width: 100%; height: auto;">
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left;">
                        <h2>Email Verification OTP</h2>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 0 20px;">
                        <p>Please use the verification code below to verify your email and sign in to continue participating across research tasks and earn rewards.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left;">
                        <p style="font-size: 24px; font-weight: bold; margin-left:10px;">${otp}</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 0 20px;">
                        <p>If you didn’t request this, please report to <a href="mailto:help@Spryvoc.com">help@Spryvoc.com</a>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 20px;">
                        <p>Thanks,<br>Spryvoc Team</p>
                    </td>
                </tr>
            </table>
        
        </body>
        </html>`;
  } else if (language == "Arabic") {
    return `<!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>التحقق من البريد الإلكتروني</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; direction: rtl;">
        
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right" width="100%">
                <tr>
                    <td style="text-align: right; padding: 20px;">
                        <img src="cid:verificationLogo" alt="شعار التحقق" height="100" style="max-width: 100%; height: auto;">
                    </td>
                </tr>
                <tr>
                    <td style="text-align: right;">
                        <h2>التحقق من البريد الإلكتروني OTP</h2>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: right; padding: 0 20px;">
                        <p>يرجى استخدام رمز التحقق أدناه للتحقق من البريد الإلكتروني وتسجيل الدخول لمواصلة المشاركة في المهام البحثية وكسب المكافآت.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: right;">
                        <p style="font-size: 24px; font-weight: bold; margin-left: 10px;">${otp}</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: right; padding: 0 20px;">
                        <p>إذا لم تطلب ذلك يرجى الإبلاغ على <a href="mailto:help@Spryvoc.com">help@Spryvoc.com</a>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: right; padding: 20px;">
                        <p>شكرًا،<br>فريق سايبر</p>
                    </td>
                </tr>
            </table>
        
        </body>
        </html>`;
  }
};

function checkDateRange(startDate, endDate) {
  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (currentDate < start) {
    return "To Do";
  } else if (currentDate >= start && currentDate <= end) {
    return "In Progress";
  } else {
    return "Complete";
  }
}

function isDateNotExceedCurrent(dateString) {
  const currentDate = new Date().toISOString().split("T")[0];
  return dateString >= currentDate;
}

function isCurrentDateWithinRange(givenDateString, n) {
  const givenDate = new Date(givenDateString);
  const currentDate = new Date();

  const lowerBoundDate = new Date(givenDate);
  lowerBoundDate.setDate(givenDate.getDate() - n);

  return currentDate >= lowerBoundDate && currentDate <= givenDate;
}

module.exports = {
  checkVaoidEmail,
  isValidPassowrd,
  generateOTP,
  otpTemplate,
  checkDateRange,
  isDateNotExceedCurrent,
  isCurrentDateWithinRange,
};
