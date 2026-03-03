const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, required: true, enum: ['signup', 'forgot_password'], index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Automatically delete expired OTP records.
emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOTP', emailOTPSchema);
