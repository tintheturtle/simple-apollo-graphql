/* eslint-disable prettier/prettier */
const { google } = require('googleapis')
const MailComposer = require('nodemailer/lib/mail-composer')

class CreateMail {
    constructor(auth, to, sub, body, task) {
        this.me = 'joseph.pham280996@gmail.com'
        this.task = task
        this.auth = auth
        this.to = to
        this.sub = sub
        this.body = body
        this.gmail = google.gmail({ version: 'v1', auth })
    }

    makeBody() {
        // Mail Body is created.
        const mail = new MailComposer({
            from: 'do-not-reply <joseph.pham280996@gmail.com>',
            to: this.to,
            html: this.body,
            subject: this.sub,
            textEncoding: 'base64',
        })

        // Compiles and encodes the mail.
        mail.compile().build((err, msg) => {
            if (err) {
                return console.log(`Error compiling email ${err}`)
            }

            const encodedMessage = Buffer.from(msg)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '')

            this.sendMail(encodedMessage)
        })
    }

    sendMail(encodedMessage) {
        this.gmail.users.messages.send(
            {
                userId: this.me,
                resource: {
                    raw: encodedMessage,
                },
            },
            (err, result) => {
                if (err) {
                    return console.log(`NODEMAILER - The API returned an error: ${err}`)
                }

                console.log('NODEMAILER - Sending email reply from server:', result.data)
            },
        )
    }
}
export default CreateMail
