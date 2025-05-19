const nodemailer = require("nodemailer");
//sending email utility for verification
const sendEmail = async (to,subject,html) =>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
    });
    const mailOptions = {
        from:`"Support Team" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    }
    const info = await transporter.sendMail(mailOptions);
    return info;
}

module.exports = sendEmail;