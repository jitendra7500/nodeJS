const nodemailer = require("nodemailer");
module.exports = {
    getOtp(){
        let otp = Math.floor((Math.random()*100000) + 100000);
        return otp;
    },
    sendMail(email, subject, text, callback){
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "abc@gmail.com",
                pass: "Type your password"
            }
        });
        const options = {
            from: "abc@gmail.com",
            to: email,
            subject: subject,
            text: text
        }
        transporter.sendMail(options, (sendMailError, sendMailResult)=>{
            if(sendMailError){
                callback(sendMailError, null);
            } else{
                console.log("Email sent to: "+sendMailResult.response);
                callback(null, sendMailResult.response);
            }
        });
    }
}