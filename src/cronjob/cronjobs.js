// const cron = require("node-cron");
// const Assignment = require('../models/Assignmentschema')
// const Task = require('../models/Task')
// const User = require('../models/User')
// const initializeCronJobs = () => {
//   // Run a task every day at a specific time (e.g., 2:30 AM)
//   cron.schedule("26 11 * * *", async() => {

//     const currentDate = new Date();
//     let allassignments = await Assignment.find();
//     let listtasktosend = [];
//     let taskid=[];
//     allassignments.forEach(assignment => {
// taskid.push(assignment.task_id)
//     })

//     taskid.forEach(async(taskid) => {
//         let currtask = await Task.findById(taskid)
//         let taskd = new Date(currtask.dueDate)
//         if(taskd==new Date()){
//             listtasktosend.push(taskid)
//         }
//     })

//     let listofresp=[];
//     listtasktosend.forEach(async(taskid) => {
//         let assignmnents = await Assignment.findById({task_id:taskid})
//         assignmnents.forEach(assignment=>{
//             listofresp.push(assignment.repondant_id)
//         })
//     })

// let listofemails = [];
// listofresp.forEach(async(resid)=>{
//     let respondants = await User.findById(resid)
//     respondants.forEach(resp=>{
//         listofemails.push(resp.email)
//     })
// })

//   });

//   // Add more cron jobs if needed
//   // cron.schedule("*/5 * * * *", () => {
//   //   // Another task
//   // });
// };

// // Export the initialization function
// module.exports = initializeCronJobs;
const cron = require("node-cron");
const Assignment = require("../models/Assignmentschema");
const Task = require("../models/Task");
const User = require("../models/User");
// const Expiredimg = require('../images/ExpiredEmail.png')

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "smartadvise65@gmail.com", // Replace with your Gmail email
    pass: "umkquabxjymbnntn", // Replace with the generated app password
  },
});

function sendurgentemail(
  useremail,
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
                    task and would expire soon. Please log in to the SAIbr web/app platform to take the task to avoid
                    missing out on earning rewards.</p>
            </td>
        </tr>
        <tr>
            <td style="text-align: left; padding: 20px;">
                <a style="text-decoration: none; color: black;" href="http://cctlabs.in:3000/respondent/login">Login to SAIbr</a>
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
                    الدخول إلى منصة الويب/التطبيق SAIbr لتولي المهمة لتجنب فقدان الحصول على المكافآت.</p>
            </td>
        </tr>
        <tr>
            <td style="text-align: right; padding: 20px;">
                <a style="text-decoration: none; color: black;" href="http://cctlabs.in:3000/respondent/login">تسجيل الدخول إلى SAIbr</a>
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
  const mailOptions = {
    from: `Smart Advice < ${process.env.EMAIL}>`, // Replace with your Gmail email
    to: useremail,
    subject: subjectlang,
    html: templateContent,
    attachments: [
      {
        filename: "SaibrLogo.png",
        path: __dirname + "/SaibrLogo.png",
        cid: "myLogo", // Make sure this matches the CID in the HTML
      },
      {
        filename: "Taskassign.png",
        path: __dirname + "/Taskassign.png",
        cid: "taskImage", // Make sure this matches the CID in the HTML
      },
    ],
    // You can add HTML and attachments here if needed
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
    }
  });
}

function sendEmail(
  username,
  taskname,
  projectname,
  tosendemail,
  taskpoints,
  language
) {
  let templateContent = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h2 style="text-align: center;">Uh Oh! Sorry, You Missed a Chance to Earn Rewards</h2>
    <div style="text-align: center;">

        <img src="cid:myImg" height="150"  alt="" srcset="">
    </div>
    <h3 style="text-align: center;">The Task  {{taskname}}  From  {{projectname}}  has expired</h3>
    <h4>Hello  {{username}}</h4>
    
     <h4>Sorry to see you missed your chance to earn rewards on the above task. All our tasks have a
        deadline, and we encourage our participants to respond ASAP to avoid missing out on chances to
        earn rewards. DO NOT WORRY, there are going to be plenty more tasks which are coming up for
        you. Please do respond as soon as you get intimations, or you can login to SAIbr to find out other
        active tasks that can help you earn more points.</h4>
        <div style="text-align: center;">
            <br>
            <br>
            <a style="text-decoration: none;color: black;" href="http://cctlabs.in:3000/respondent/login">Login to SAIbr</a>
        </div>
        <br/>
        <br/>
        <div style="text-align: center;">
            <img src="cid:myLogo" height="50" alt="" srcset="">
        </div>
        <br>
        <div style="text-align: center; margin-top: 20px;">
        <div style="display: inline-block; padding: 0 10px; border-right: 1px solid black;">Home</div>
        <div style="display: inline-block; padding: 0 10px; border-right: 1px solid black;">About</div>
        <div style="display: inline-block; padding: 0 10px;">Contact</div>
    </div>
       </div>
</body>
</html>`;
  if (language == "Arabic") {
    templateContent = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h2 style="text-align: center;">نحن متحمسون لتكليفك بمشروع جدي</h2>
    <div style="text-align: center;">

        <img src="cid:myImg" height="150"  alt="" srcset="">
    </div>
    <h3 style="text-align: center;">تم تخصيص مشروع جديد {{projectname}} لك</h3>
    <h4 style="text-align:end;">{{username}}الأول&gt;</h4>
    
     <h4>شكرًا لك على كونك مشاركًا قيمًا في SAIbr. لقد ساعدت العلامات التجارية في إنشاء منتجات/خدمات أفضل لك وللمجتمع الأكبر. يسعدنا أن
     نعلمك أنك مؤهل لمشروع جديد. حان الوقت للحصول على المزيد من نقاط المكافآت من خلال المشاركة في المهام التي سيتم تكليفك بها كجزء
     من هذا المشروع. يرجى تسجيل الدخول إلى منصة الويب/التطبيق SAIbr للتحقق من جميع المهام في المشروع الجديد</h4>
        <div style="text-align: center;">
            <br>
            <br>
            <a style="text-decoration: none;color: black;" href="http://cctlabs.in:3000/respondent/login">تسجيل الدخول إلى SAIbr</a>
        </div>
        <br/>
        <br/>
        <div style="text-align: center;">
            <img src="cid:myLogo" height="50" alt="" srcset="">
        </div>
        <br>
        <div style="text-align: center; margin-top: 20px;">
        <div style="display: inline-block; padding: 0 10px; border-right: 1px solid black;">بيت</div>
        <div style="display: inline-block; padding: 0 10px; border-right: 1px solid black;">عن</div>
        <div style="display: inline-block; padding: 0 10px;">اتصال</div>
    </div>
       </div>
</body>
</html>`;
  }
  // const templateContent = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <title>Task Expired</title>
  // </head>
  // <body>
  // <h2>Uh Oh! Sorry, You Missed a Chance to Earn Rewards</h2>
  // <img src="cid:myImg" alt="not able to fetch image" width="150" height="150" />
  //   <h1>Hello, {{username}}</h1>
  //   <p>This is to inform you that the task <strong>{{taskname}}</strong> belonging to project <strong>{{projectname}}</strong> has expired.</p>
  //   <p>The assigned points for this task were <strong>{{taskpoints}}</strong>.</p>
  //   <br>
  //   Please take necessary action to address this expired task.
  // </body>
  // </html>`;

  // Replace variables
  const content = templateContent
    .replace("{{username}}", username)
    .replace("{{taskname}}", taskname)
    .replace("{{projectname}}", projectname)
    .replace("{{taskpoints}}", taskpoints);
  const mailOptions = {
    from: "smartadvise65@gmail.com",
    to: tosendemail,
    // to: "kushagra.sharma@cybercure.in",
    subject: "Task Expired",
    // text:`Hello ${username} The Task  ${taskname}  From  ${projectname}  has expired points ${taskpoints}`
    html: content,
    attachments: [
      {
        filename: "ExpiredEmail.png",
        path: __dirname + "/ExpiredEmail.png",
        cid: "myImg", // Make sure this matches the CID in the HTML
      },
      {
        filename: "SaibrLogo.png",
        path: __dirname + "/SaibrLogo.png",
        cid: "myLogo", // Make sure this matches the CID in the HTML
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
    }
  });
}

const sendonedaybefore = async (
  taskid,
  taskDueDate,
  taskname,
  projectname,
  numericvalue,
  points
) => {
  console.log("below task ids need to send the email a day before");
  let assignments = await Assignment.find({ task_id: taskid });
  let useremaillist = [];
  for (const assignment of assignments) {
    if (assignment.status != "completed") {
      useremaillist.push(assignment.repondant_email);
    }
  }
  for (const useremail of useremaillist) {
    let curruser = await User.findOne({ email: useremail });
    sendurgentemail(
      useremail,
      taskname,
      taskDueDate,
      curruser.language,
      projectname,
      numericvalue,
      points,
      curruser.first_name
    );
  }
};

const initializeCronJobs = () => {
  // Run a task every day at a specific time (e.g., 11:26 AM)

  cron.schedule("01 00 * * *", async () => {
    const myObject = {};
    const residemail = {};
    try {
      const currentDate = new Date();
      const allassignments = await Assignment.find();
      const alltasks = await Task.find();
      const listtasktosend = [];
      const listofresp = [];

      for (const task of alltasks) {
        let endDate = new Date(task.dueDate);
        let currDate = new Date();
        const taskstring = taskdetail.reminder;
        const firstCharacter = taskstring.charAt(0);
        const numericValue = parseInt(firstCharacter, 10);

        if (
          currDate.getTime() + 1 * 24 * 60 * 60 * 1000 === endDate.getTime() ||
          currDate.getTime() + numericValue * 24 * 60 * 60 * 1000 ===
            endDate.getTime()
        ) {
          sendonedaybefore(
            task._id,
            task.dueDate,
            task.taskName,
            task.projectname,
            numericValue,
            task.pointOfTask
          );
        }
      }

      for (const assignment of allassignments) {
        const currtask = await Task.findById(assignment.task_id);
        const taskDueDate = new Date(currtask.dueDate);
        let tduedate = taskDueDate.toISOString().split("T")[0];
        let cdate = currentDate.toISOString().split("T")[0];
        let tduef = new Date(tduedate);
        let cduef = new Date(cdate);

        // Convert string dueDate to Date object

        if (tduedate === cdate) {
          //
          if (assignment.status != "completed") {
            listtasktosend.push(assignment.task_id);
            listofresp.push(assignment.repondant_id);
            myObject[assignment.repondant_id] = assignment.task_id;
          }
        }
      }

      const listofemails = [];

      for (const resid of listofresp) {
        const respondant = await User.findById(resid);

        if (respondant != null) {
          listofemails.push(respondant.email);

          residemail[respondant._id] = respondant.email;
        }
      }

      //
      //
      //
      //

      for (const resid in myObject) {
        const taskid = myObject[resid];

        let curruser = await User.findById(resid);
        let curremail = "";
        let currtaskname = "";
        let currprojectname = "";
        let currusername = "";
        let taskpoints = "";
        let currlang = "";
        if (curruser != null) {
          curremail = curruser.email;
          currlang = curruser.language;
          let currtask = await Task.findById(taskid);
          currprojectname = currtask.projectname;
          currtaskname = currtask.taskName;
          currusername = `${curruser.first_name} ${curruser.last_name}`;
          taskpoints = currtask.pointOfTask;
        }
        if (
          curremail != "" &&
          currtaskname != "" &&
          currprojectname != "" &&
          currusername != "" &&
          taskpoints != "" &&
          currlang != ""
        ) {
          sendEmail(
            currusername,
            currtaskname,
            currprojectname,
            curremail,
            taskpoints,
            currlang
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};

// Export the initialization function
module.exports = initializeCronJobs;
