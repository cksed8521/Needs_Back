const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:'sendEmail',
        pass:''
    }
})

const sendMail = (subject,image ,html, cb) =>{
    const mailOptions = {
        from: 'sendEmail',
        to: 'who',
        subject,
        image,
        html
    }
    
    transport.sendMail(mailOptions, function(err , data){
        if(err){
           cb(err , null)
        } else {
            cb(null, data)
        }
    })
}

module.exports = sendMail