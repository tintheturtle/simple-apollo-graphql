import { gql } from 'apollo-server-express'

const typeDefs = gql`
  type Query {
    allUsers: [User]
  }
  type Mutation {
    userCreation(email: String!): userCreationBoolean
    confirmation(userHash: String!, accessCode: String!): confirmationBoolean
    login(email: String!): loginString
    loginDifferentDevice(email: String!): differentDevice
  }
  type userCreationBoolean {
    verificationStatus: Boolean
  }
  type confirmationBoolean {
    token: String
  }
  type loginString {
    newAccessCode: String
  }
  type differentDevice {
    differentDevice: Boolean
  }
  type User {
    _id: ID!
    email: String!
    date: String
  }
  input UserInput {
    email: String
  }
`
export default typeDefs
