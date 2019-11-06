import mongoose from 'mongoose'

const { Schema } = mongoose
const BlogSchema = new Schema({
  title: String,
  author: String,
  body: String,
  date: { type: Date, default: Date.now },
})

export default mongoose.model('Blog', BlogSchema)
