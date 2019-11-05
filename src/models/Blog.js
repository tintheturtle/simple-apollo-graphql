import { Schema } from 'mongoose'

const BlogSchema = new Schema({
  title: String,
  author: String,
  body: String,
  date: { type: Date, default: Date.now },
})

export default BlogSchema
