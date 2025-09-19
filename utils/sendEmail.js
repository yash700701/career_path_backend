import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text: message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
