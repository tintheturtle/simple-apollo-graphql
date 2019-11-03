import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import bodyParser from 'body-parser'
import { createServer } from 'http'

// import b from './resolvers/resolvers'
// import resolvers from './resolvers/resolvers'
// import typeDefs from './schemas/schemas'

import resolvers from './resolvers'
import typeDefs from './schemas'

dotenv.config()

const app = express()

const port = process.env.PORT || 4000

// app.use(bodyParser.urlencoded({ extended: false, limit: '7mb' }));
// app.use(bodyParser.json({ limit: '7mb' }));

app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: process.env.NODE_ENV === 'DEVELOPMENT',
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
