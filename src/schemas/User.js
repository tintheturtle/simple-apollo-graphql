import mongoose from 'mongoose'

const { Schema } = mongoose

// Payment Schema
const PaymentSchema = new Schema({
  email: String,
  referenceID: { type: String, unique: true },
  paymentStatus: Boolean,
})

// Events Schema
const EventSchema = new Schema({
  email: { type: String, unique: true },
  year: { type: Number },
  family_questions: [{ type: String }],
})

// PastEvents Schema
const PastEventSchema = new Schema({
  events: [EventSchema],
})

// Profiles Schema
const ProfileSchema = new Schema({
  email: String,
  confirmationCode: String,
  userHash: String,
  verificationStatus: Boolean,
})

// Permissions Schema
const PermissionSchema = new Schema({
  attendance: [PastEventSchema],
  paymentStatus: PaymentSchema,
  family_questions: Boolean,
})

// Finalized User Schema
const UserSchema = new Schema({
  _id: String,
  profile: ProfileSchema,
  permission: PermissionSchema,
  event: EventSchema,
  past_events: PastEventSchema,
})

export default mongoose.model('User', UserSchema)
