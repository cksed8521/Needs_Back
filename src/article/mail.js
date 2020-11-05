const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')

const auth ={
    auth: {
        api_key:'pubkey-bd349108c6dba13feb02a9db8b75f420',
        domain:'sandbox386a177f29cf4fd3923d116dca4a380c.mailgun.org'
    }
}

const transport = nodemailer.createTransport(mailGun(auth))

const mailOptions = {
    from: 'deri19911010@gmail.com',
    tp: 'cksed8521@gmail.com',
    subject:'test',
    text:'woo'
}

transport.sendMail(mailOptions, function(err , data){
    if(err){
       console.log('error occurs')
    } else {
        console.log('message send')
    }
})

// const sendMail = (email, title, text, cb) =>{

// }

// module.exports = sendMail