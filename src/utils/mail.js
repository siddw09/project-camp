import Mailgen from "mailgen"
import nodemailer from "nodemailer"

//  for sending email, you need this much of the code part.
const sendEmail = async(options) => {
    const mailGenerator =  new Mailgen({
        theme: "default",
        product: {
            name:"Task Manager",
            link: "https://localhost:3000"
        }
    })

    const emailTextual= mailGenerator.generatePlaintext(options,mailgenContent)
    const emailHTML = mailGenerator.generate(options,mailgenContent)

    const transporter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from : "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    }


    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service faild silently, this might have happen bcoz of credentials , make sure you have provided you r MAILTRAP credentials in your .env file")
        console.error("Error: ", error)
    }
}



const emailVerificationMailgenContent = (username, verificationUrl) =>{
    return {
        body:{
            name: username,
            intro:"Welcome to our app! We are excited to have you onboard!",
            action: {
                instruction:"To verify th email, please click on the following button.",
                button:{
                    color: "#2ad72a",
                    text: "Verify the email",
                    link: verificationUrl
                },
            },
            outro: "If you need any help or have any doubts please reply here."
        
        }
    }
}


const passwordResetMailgenContent = (username, passwordResetUrl) =>{
    return {
        body:{
            name: username,
            intro:"We got a request to reset the password of your account.",
            action: {
                instruction:"To change your password, click on following button or link.",
                button:{
                    color: "#2ad72a",
                    text: "Reset Password",
                    link: passwordResetUrl
                },
            },
            outro: "If this is not you, please contact us."
        
        }
    }
}

export {
    emailVerificationMailgenContent,
    passwordResetMailgenContent,
    sendEmail
}