const dotenv = require('dotenv')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const bodyParser = require('body-parser')
const { createServer } = require('http')

const resolvers = './resolvers'
const typeDefs = './schemas'

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
