import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, HTML, from }) => {
    try {

        const opction = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure:false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // tls: {
            //     ciphers: "SSLv3",
            //     rejectUnauthorized: false,
            // },
            // debug: true,
            // logger: true,
        }

        const transporter = nodemailer.createTransport(opction);
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: HTML,
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
          console.log(error, 'smtp error')
        throw error;
    }
};