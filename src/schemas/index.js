import { gql } from 'apollo-server-express'

const typeDefs = gql`
  type Query {
    findBlog(id: ID!): Blog
    findBlogs: [Blog]
  }

  type Mutation {
    addBlog(input: BlogInput!): Blog
  }

  type Blog {
    _id: ID!
    title: String
    author: String
    body: String
    date: String
  }

  input BlogInput {
    title: String
    author: String
    body: String
  }
`

export default typeDefs
