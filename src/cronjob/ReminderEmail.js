const cron = require("node-cron");
const { Task } = require("../models/task.models");
const {
  isDateNotExceedCurrent,
  isCurrentDateWithinRange,
} = require("../utils/utils");
const sendEmail = require("../utils/sendEmail");

function sendurgentemail(
  taskname,
  taskDueDate,
  language,
  projectname,
  numdays,
  points,
  firstname
) {
  let subjectlang = "A task is urgent and will expire soon";
  let templateContent = `
        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Task Urgency Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
              <tr>
                  <td style="text-align: center; padding: 20px;">
                      <h2>Task ${taskname} Is Urgent and Will Expire Soon</h2>
                  </td>
              </tr>
              <tr>
                  <td style="text-align: center;">
                      <img src="cid:taskImage" alt="Task Image" style="max-width: 100%; height: auto;">
                  </td>
              </tr>
              <tr>
                  <td style="text-align: left; padding: 0 20px;">
                      <h2>You have ${numdays} days  before the task expires or completes</h2>
                      <p>Hello, ${firstname}</p>
                      <p>Thank you for your participation on ${projectname} so far. A task ${taskname} is now an urgent
                          task and would expire soon. Please log in to the SpryVOC web/app platform to take the task to avoid
                          missing out on earning rewards.</p>
                  </td>
              </tr>
              <tr>
                  <td style="text-align: left; padding: 20px;">
                      <a style="text-decoration: none; color: black;" href="http://cctlabs.in:3003/respondent/login">Login to SpryVOC</a>
                      <br>
                      <br>
                      <p>Deadline: ${taskDueDate}</p>
                      <p>Reward Points: ${points}</p>
                  </td>
              </tr>
          </table>
      
      </body>
      </html>
      
        `;
  if (language == `Arabic`) {
    subjectlang = "المهمة عاجلة وستنتهي قريبًا";
    templateContent = `
           <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تنبيه حول انتهاء المهمة</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
              <tr>
                  <td style="text-align: right; padding: 20px;">
                      <h2>المهمة ${taskname} عاجلة وستنتهي قريبًا</h2>
                  </td>
              </tr>
              <tr>
                  <td style="text-align: right;">
                      <img src="cid:taskImage" alt="Task Image" style="max-width: 100%; height: auto;">
                  </td>
              </tr>
              <tr>
                  <td style="text-align: right; padding: 0 20px;">
                      <h2>لديك ${numdays} قبل انتهاء صلاحية المهمة أو اكتمالها</h2>
                      <p>مرحبًا، ${firstname}</p>
                      <p>شكرًا لك على مشاركتك في ${projectname} حتى الآن. أصبحت المهمة ${taskname} الآن مهمة عاجلة وستنتهي قريبًا، يرجى تسجيل
                          الدخول إلى منصة الويب/التطبيق SpryVOC لتولي المهمة لتجنب فقدان الحصول على المكافآت.</p>
                  </td>
              </tr>
              <tr>
                  <td style="text-align: right; padding: 20px;">
                      <a style="text-decoration: none; color: black;" href="http://cctlabs.in:3003/respondent/login">تسجيل الدخول إلى SpryVOC</a>
                      <br>
                      <br>
                      <p>الموعد النهائي:${taskDueDate}</p>
                      <p>نقاط المكافأة: ${points}</p>
                  </td>
              </tr>
          </table>
      
      </body>
      </html>
      
           `;
  }

  return {
    subjectlang,
    templateContent,
  };
  // const mailOptions = {
  //   from: `Smart Advice < ${process.env.EMAIL}>`, // Replace with your Gmail email
  //   to: useremail,
  //   subject: subjectlang,
  //   html: templateContent,
  //   attachments: [
  //     {
  //       filename: "SaibrLogo.png",
  //       path: __dirname + "/SaibrLogo.png",
  //       cid: "myLogo", // Make sure this matches the CID in the HTML
  //     },
  //     {
  //       filename: "Taskassign.png",
  //       path: __dirname + "/Taskassign.png",
  //       cid: "taskImage", // Make sure this matches the CID in the HTML
  //     },
  //   ],
  //   // You can add HTML and attachments here if needed
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //   }
  // });
}

function reminderEmail() {
  cron.schedule("01 00 * * *", async () => {
    const Alltasks = await Task.find({})
      .populate("projectId")
      .populate({
        path: "Assignment.AssignmentID",
        populate: {
          path: "repondantId",
        },
      })
      .lean();

    Alltasks?.map((item) => {
      if (isDateNotExceedCurrent(item.dueDate)) {
        if (isCurrentDateWithinRange(item.dueDate, item.reminder)) {
          if (item?.Assignment) {
            item.Assignment.forEach((assign) => {
              if (assign.status !== "Completed") {
                let { subjectlang, templateContent } = sendurgentemail(
                  item.name,
                  item.dueDate,
                  assign.AssignmentID.repondantId.language,
                  item.projectId.projectName,
                  item.reminder,
                  item.pointOfTask,
                  assign.AssignmentID.repondantId.firstName
                );

                // if (
                //   assign.AssignmentID.repondantId.email !==
                //   "sangeet.chopra@cybercure.in"
                // ) {
                sendEmail(
                  assign.AssignmentID.repondantId.email,
                  templateContent,
                  subjectlang,
                  [
                    {
                      filename: "Taskassign.png",
                      path: "/Taskassign.png",
                      cid: "taskImage",
                    },
                  ]
                );
                // }
              }
            });
          }
        }
      }
    });
  });
}

module.exports = reminderEmail;
