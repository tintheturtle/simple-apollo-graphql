import { ApolloError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import cryptoRandomString from 'crypto-random-string'
import User from '../schemas/User'
import sendMail from '../utils'

const Query = {
  allUsers: async () => {
    try {
      return await User.find()
    } catch (err) {
      throw new ApolloError(err)
    }
  },
}

// Send email with unique hash link
// sendMail()
// const ses = new AWS.SES({ apiVersion: '2010-12-01' })
// const params1 = {
//   Destination: {
//     ToAddresses: [newUser.email], // Email address/addresses that you want to send your email
//   },
//   Message: {
//     Body: {
//       Html: {
//         // HTML Format of the email
//         Charset: 'UTF-8',
//         Data: `<html><body>
//           <h3>Hello ${newUser.email}</h3>
//           <p style='color:red'></p>
//           <p>Please confirm your account by going to this
//           <a href='https://lovebox.plus/?token=${newUser.userHash}&email=${newUser.email}'>link</a>
//           </p>
//           </body></html>`,
//       },
//       Text: {
//         Charset: 'UTF-8',
//         Data: 'Test email',
//       },
//     },
//     Subject: {
//       Charset: 'UTF-8',
//       Data: 'Your VES-6 Account Registration Confirmation',
//     },
//   },
//   Source: 'tintheturtle@gmail.com',
// }
// const sendEmail1 = ses.sendEmail(params1).promise()
// // Send email with access code
// const params2 = {
//   Destination: {
//     ToAddresses: [newUser.email], // Email address/addresses that you want to send your email
//   },
//   Message: {
//     Body: {
//       Html: {
//         // HTML Format of the email
//         Charset: 'UTF-8',
//         Data: `<html><body>
//           <h3>Hello ${newUser.email} </h3>
//           <p style='color:red'></p>
//           <p>Please confirm your account by entering this code: ${newUser.confirmationCode} at the link sent before.
//           </p>
//           </body></html>`,
//       },
//       Text: {
//         Charset: 'UTF-8',
//         Data: 'Test email',
//       },
//     },
//     Subject: {
//       Charset: 'UTF-8',
//       Data: 'Your VES-6 Account Registration Confirmation',
//     },
//   },
//   Source: 'tintheturtle@gmail.com',
// }
// const sendEmail2 = ses.sendEmail(params2).promise()

// sendEmail1
//   .then(data => {
//     console.log('email submitted to SES', data)
//   })
//   .catch(error => {
//     console.log(error)
//   })
// sendEmail2
//   .then(data => {
//     console.log('email submitted to SES', data)
//   })
//   .catch(error => {
//     console.log(error)
//   })

const Mutation = {
  userCreation: async (root, args) => {
    try {
      // Checks if user exists already
      const { email } = args
      const user = await User.findOne({ 'profile.email': email })
      if (user) {
        return {
          verificationStatus: user.profile.verificationStatus,
        }
      }

      // Initialize hash, access token, and access code to be entered
      const userHash = await jwt.sign({ email }, 'secretlyPrivateKey')
      const accessCode = await cryptoRandomString({ length: 6 })
      // Create a new user and save it

      const newUser = new User({
        emailRoot: email,
        profile: {
          emailProfile: email,
          confirmationCode: accessCode,
          userHash,
        },
      })
      newUser.save()
      sendMail(
        email,
        'Your VES-6 Account Registration Confirmation',
        `<html><body>
                  <h3>Hello ${newUser.emailRoot}</h3>
                  <p style='color:red'></p>
                  <p>Please confirm your account by going to this
                  <a href='https://localhost:3000/${newUser.profile.userHash}'>link</a>
                  </p>
                  </body></html>`,
      )
      sendMail(
        email,
        'Your VES-6 Account Registration Confirmation',
        `<html><body>
      <h3>Hello ${newUser.emailRoot} </h3>
      <p style='color:red'></p>
      <p>Please confirm your account by entering this code: ${newUser.profile.confirmationCode} at the link sent before.
      </p>
      </body></html>`,
      )

      // Return verification status
      return {
        verificationStatus: false,
      }
    } catch (err) {
      throw new ApolloError(err)
    }
  },

  confirmation: async (root, args) => {
    try {
      // Turning args into variables
      const { accessCode, userHash } = args
      // Checks if user exists
      const user = await User.findOne({ 'profile.userHash': userHash })
      if (!user) {
        throw new ApolloError('User does not exist in the database. Please register an account')
      }
      // Checking verification status
      if (user.profile.verificationStatus) {
        throw new ApolloError('User has already been verified.')
      }
      // Checking if passcode entered is correct
      if (user.profile.confirmationCode !== accessCode) {
        throw new ApolloError('Incorrect access code provided.')
      }
      // Initializes user information
      const email = user.emailRoot
      const accessToken = jwt.sign({ email }, 'secretlyPrivateKey', { expiresIn: '1y' })
      // Change verificationStatus to true
      user.profile.verificationStatus = true
      user.save()
      // Return token as a string
      return { token: accessToken }
    } catch (err) {
      throw new ApolloError(err)
    }
  },

  login: async (root, args) => {
    try {
      // Retrieve token from local storage stored on browser
      const { email } = args
      // Find user using token
      const user = await User.findOne({ emailRoot: email })
      if (!user) {
        throw new ApolloError('Please create an account.')
      }
      if (!user.profile.verificationStatus) {
        throw new ApolloError('Please verify your account.')
      }
      // Verify token
      const token = jwt.sign({ email, confirmationCode: user.profile.confirmationCode }, 'secretlyPrivateKey')
      return {
        token,
      }
    } catch (err) {
      throw new ApolloError(err)
    }
  },
  // loginDifferentDevice: async (root, args) => {
  //   try {
  //     // Find user using the email entered
  //     const { email } = args.email
  //     const user = await User.findOne({ email })
  //     if (!user) {
  //       throw new ApolloError('Account not found, please register an account using the email entered.')
  //     }

  //     // Update new passcode to be entered
  //     const newAccessCode = await cryptoRandomString({ length: 6 })
  //     user.confirmationCode = newAccessCode
  //     user.save()
  //     // Send email with new accessCode
  //     const params = {
  //       Destination: {
  //         ToAddresses: [user.email], // Email address/addresses that you want to send your email
  //       },
  //       Message: {
  //         Body: {
  //           Html: {
  //             // HTML Format of the email
  //             Charset: 'UTF-8',
  //             Data: `<html><body>
  //               <h3>Hello ${user.email} </h3>
  //               <p style='color:red'></p> 
  //               <p>Please confirm your account by entering this code: ${user.confirmationCode} through this link 
  //               <a href='https://lovebox.plus/?token=${user.userHash}&email=${user.email}'>link</a>
  //               </p>
  //               </body></html>`,
  //           },
  //           Text: {
  //             Charset: 'UTF-8',
  //             Data: 'Test email',
  //           },
  //         },
  //         Subject: {
  //           Charset: 'UTF-8',
  //           Data: 'Your VES-6 Account Registration Confirmation',
  //         },
  //       },
  //       Source: 'tintheturtle@gmail.com',
  //     }
  //     const ses = new AWS.SES({ apiVersion: '2010-12-01' })
  //     const sendEmail = ses.sendEmail(params).promise()

  //     sendEmail
  //       .then(data => {
  //         console.log('email submitted to SES', data)
  //       })
  //       .catch(error => {
  //         console.log(error)
  //       })

  //     // Return signInStatus as true
  //     return {
  //       differentDevice: true,
  //     }
  //   } catch (err) {
  //     throw new ApolloError(err)
  //   }
  // },
}
const resolvers = {
  Query,
  Mutation,
}
export default resolvers
