import { model, Query, Schema } from 'mongoose';
import { TUser } from './user.interface';
import { USER_ROLE, USER_STATUS } from './user.constant';

const userSchema = new Schema<TUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    passwordChangeAt: {
      type: Date,
      default: Date.now(),
    },
    lastLoginAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// set password field "" when created user done
userSchema.post('save', function () {
  this.password = '';
});

// Pre middleware to filter out deleted users
userSchema.pre<Query<TUser[], TUser>>(/^find/, function (next) {
  // 'this' refers to the current query
  this.where({ status: { $ne: USER_STATUS.PERMANENT_DELETED } });
  next();
});

export const User = model<TUser>('User', userSchema);
