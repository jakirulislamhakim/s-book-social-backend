import { model, Schema } from 'mongoose';
import { REACTION_TYPE } from '../Reaction/reaction.constant';
import { STORY_VISIBILITY } from './story.constant';
import { TStory, TStoryView } from './story.interface';

const storySchema = new Schema<TStory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: '',
      trim: true,
    },

    mentions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Profile',
        },
      ],
      default: [],
    },

    visibility: {
      type: String,
      enum: Object.values(STORY_VISIBILITY),
      default: STORY_VISIBILITY.PUBLIC,
    },

    viewCounts: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

const storyViewSchema = new Schema<TStoryView>(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },

    reactionType: {
      type: String,
      enum: [...Object.values(REACTION_TYPE), ''],
      default: '',
    },

    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

storySchema.index({ userId: 1, expiresAt: 1, createdAt: -1 });
storySchema.index({ userId: 1, expiresAt: 1, visibility: 1, createdAt: -1 });

storyViewSchema.index({ storyId: 1, userId: 1 }, { unique: true });

// models
export const Story = model('Story', storySchema);
export const StoryView = model('StoryView', storyViewSchema, 'story_views');
