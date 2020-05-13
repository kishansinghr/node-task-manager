const sgMail = require('@sendgrid/mail')

console.log(process.env.SENDGRID_API_KEY)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'krathore@argusoft.com',
        replyTo: 'krathore@argusoft.com',
        subject: 'Welcome to Task-manager',
        text: `Welcome ${name}, Hope you have a great journey with us.`
    })
}

const sendAccountTerminationMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'krathore@argusoft.com',
        replyTo: 'krathore@argusoft.com',
        subject: 'Good Bye',
        text: `Good Bye ${name}, Please provide us small feedback about your journey with us.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendAccountTerminationMail
}