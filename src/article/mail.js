const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:'deri19911010@gmail.com',
        pass:'lpgfmlspifphquij'
    }
})

const sendMail = (subject,image ,html, cb) =>{
    const mailOptions = {
        from: 'deri19911010@gmail.com',
        to: 'cksed8521@gmail.com',
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