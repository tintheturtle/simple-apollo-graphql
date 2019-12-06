import { ApolloError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
import cryptoRandomString from 'crypto-random-string'
import User from '../schemas/User'

AWS.config.update({
  accessKeyId: 'AKIAI7EOQ2Y7OQOBSFRA',
  secretAccessKey: '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',
  region: 'us-east-1',
})

const Query = {
  allUsers: async () => {
    try {
      return await User.find()
    } catch (err) {
      throw new ApolloError(err)
    }
  },
}

const Mutation = {
  userCreation: async (root, args) => {
    try {
      // Checks if user exists already
      const { email } = args.email
      const user = await User.findOne({ email })
      if (user) {
        return {
          verificationStatus: user.verificationStatus,
        }
      }
      // Initialize hash, access token, and access code to be entered
      const userHash = await cryptoRandomString({ length: 15 })
      const accessToken = jwt.sign({ email }, 'secretlyPrivateKey', { expiresIn: '1y' })
      const accessCode = await cryptoRandomString({ length: 6 })
      const verificationStatus = false
      // Create a new user and save it
      const newUser = new User({
        email,
        userHash,
        accessToken,
        verificationStatus,
        confirmationCode: accessCode,
      })
      newUser.save()
      // Send email with access code using hash
      const params = {
        Destination: {
          ToAddresses: [newUser.email], // Email address/addresses that you want to send your email
        },
        Message: {
          Body: {
            Html: {
              // HTML Format of the email
              Charset: 'UTF-8',
              Data: `<html><body>
                <h3>Hello ${newUser.email} </h3>
                <p style='color:red'></p> 
                <p>Please confirm your account by entering this code: ${newUser.confirmationCode} through this link 
                <a href='https://lovebox.plus/?token=${newUser.userHash}&email=${newUser.email}'>link</a>
                </p>
                </body></html>`,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'Test email',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Your VES-6 Account Registration Confirmation',
          },
        },
        Source: 'tintheturtle@gmail.com',
      }
      const ses = new AWS.SES({ apiVersion: '2010-12-01' })
      const sendEmail = ses.sendEmail(params).promise()

      sendEmail
        .then(data => {
          console.log('email submitted to SES', data)
        })
        .catch(error => {
          console.log(error)
        })

      // Return verification status
      return {
        verificationStatus,
      }
    } catch (err) {
      throw new ApolloError(err)
    }
  },

  confirmation: async (root, args) => {
    try {
      // Checks if user exists
      const user = await User.findOne({ userHash: args.userHash })
      if (!user) {
        throw new ApolloError('User does not exist in the database. Please register an account')
      }
      // Checks if the passcode entered is correct
      if (args.accessCode !== user.confirmationCode) {
        throw new ApolloError('Incorrect access code provided.')
      }
      // Verify jwt and set verification status to true
      jwt.verify(user.accessToken, 'secretlyPrivateKey')
      // Sending token and updating user
      const { accessToken } = user.accessToken
      console.log(accessToken)
      user.verificationStatus = true
      user.save()
      // Return token as a string
      return { token: accessToken }
    } catch (err) {
      throw new ApolloError(err)
    }
  },

  login: async (root, args, context, req) => {
    try {
      // Retrieve token from local storage stored on browser
      const accessToken = req.headers.authorization

      // Find user using token
      const user = await User.findOne({ accessToken })
      if (!user) {
        throw new ApolloError('Please create an account.')
      }
      if (!user.verificationStatus) {
        throw new ApolloError('Please verify your account.')
      }
      // Verify token
      // const token = jwt.verify(accessToken,'secretlyPrivateKey')
      // Return signInStatus as true
      return {
        signInStatus: true,
      }
    } catch (err) {
      throw new ApolloError(err)
    }
  },
  loginDifferentDevice: async (root, args) => {
    try {
      // Find user using the email entered
      const { email } = args.email
      const user = await User.findOne({ email })
      if (!user) {
        throw new ApolloError('Account not found, please register an account using the email entered.')
      }

      // Update new passcode to be entered
      const newAccessCode = await cryptoRandomString({ length: 6 })
      user.confirmationCode = newAccessCode
      user.save()
      // Send email with new accessCode
      const params = {
        Destination: {
          ToAddresses: [user.email], // Email address/addresses that you want to send your email
        },
        Message: {
          Body: {
            Html: {
              // HTML Format of the email
              Charset: 'UTF-8',
              Data: `<html><body>
                <h3>Hello ${user.email} </h3>
                <p style='color:red'></p> 
                <p>Please confirm your account by entering this code: ${user.confirmationCode} through this link 
                <a href='https://lovebox.plus/?token=${user.userHash}&email=${user.email}'>link</a>
                </p>
                </body></html>`,
            },
            Text: {
              Charset: 'UTF-8',
              Data: 'Test email',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Your VES-6 Account Registration Confirmation',
          },
        },
        Source: 'tintheturtle@gmail.com',
      }
      const ses = new AWS.SES({ apiVersion: '2010-12-01' })
      const sendEmail = ses.sendEmail(params).promise()

      sendEmail
        .then(data => {
          console.log('email submitted to SES', data)
        })
        .catch(error => {
          console.log(error)
        })

      // Return signInStatus as true
      return {
        differentDevice: true,
      }
    } catch (err) {
      throw new ApolloError(err)
    }
  },
}
const resolvers = {
  Query,
  Mutation,
}
export default resolvers
