import mongoose from 'mongoose'

const { Schema } = mongoose

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  userHash: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  verificationStatus: {
    type: Boolean,
    default: false,
  },
  confirmationCode: {
    type: String,
  },
})

export default mongoose.model('OldUser', UserSchema)
