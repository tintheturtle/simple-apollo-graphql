import { ApolloError } from 'apollo-server-express'
import Blog from '../models/Blog'

const Query = {
  findBlog: async (_, args) => {
    try {
      const blog = await Blog.findById(args.id)
      return blog
    } catch (err) {
      throw new ApolloError(err)
    }
  },
}

const Mutation = {
  addBlog: async (root, args) => {
    try {
      // might wants to validate input before creating Blog
      const newBlog = new Blog({
        ...args.input,
      })
      return await newBlog.save()
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
