import mongoose from 'mongoose'

const { Schema } = mongoose

// Payment Schema
const PaymentSchema = new Schema({
  emailPayment: String,
  reference: { type: String },
  paymentStatus: Boolean,
})

// Events Schema
const EventSchema = new Schema({
  emailEvent: { type: String },
  year: { type: Number },
  family_questions: [{ type: String }],
})

// PastEvents Schema
const PastEventSchema = new Schema({
  events: [EventSchema],
})

// Profiles Schema
const ProfileSchema = new Schema({
  emailProfile: String,
  confirmationCode: String,
  userHash: String,
  verificationStatus: { type: Boolean, default: false },
})

// Permissions Schema
const PermissionSchema = new Schema({
  attendance: [PastEventSchema],
  paymentStatus: PaymentSchema,
  family_questions: Boolean,
})

// Finalized User Schema
const UserSchema = new Schema({
  emailRoot: String,
  profile: ProfileSchema,
  permission: PermissionSchema,
  event: EventSchema,
  past_events: PastEventSchema,
})

export default mongoose.model('User', UserSchema)
