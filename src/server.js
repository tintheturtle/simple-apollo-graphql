import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import mongoose from 'mongoose'

// Import resolvers and typeDefs
import resolvers from './resolvers'
import typeDefs from './typeDefs'

dotenv.config()

// Setting up express
const app = express()
const port = process.env.PORT || 4000
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

// Setting up Mongo database
const mongoUrl = 'mongodb://127.0.0.1:27017/userCreation'
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect(mongoUrl)

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // debug: process.env.NODE_ENV === 'DEVELOPMENT',

  // Copied this context from Tri's LoveBoxPlus
  context: async ({ req }) => {
    let authToken = null
    let user = null

    try {
      authToken = req.headers.authorization
      if (authToken) {
        user = jwt.verify(authToken.replace('Bearer ', ''), process.env.JWT_SECRET)
      }
    } catch (e) {
      console.warn(`Unable to authenticate using auth token: ${authToken}`)
    }

    return { user }
  },
})

server.applyMiddleware({ app })

const httpServer = createServer(app)

server.installSubscriptionHandlers(httpServer)

httpServer.listen({ port }, () => {
  // eslint-disable-next-line
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
  // eslint-disable-next-line
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
})
