import mongoose from 'mongoose'

const { Schema, model } = mongoose

const UserSchema = new Schema({
  userName: String,
  confirmationToken: String,
  confirmed: { type: Boolean, default: false },
  email: String,
  webToken: { type: String, default: null },
})

const User = model('User', UserSchema)
export { User, UserSchema }
