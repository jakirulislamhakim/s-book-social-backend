import { z } from 'zod';
import { REACTION_TYPE } from '../Reaction/reaction.constant';
import { STORY_VISIBILITY } from './story.constant';
import { Types } from 'mongoose';
import { StoryValidations } from './story.validation';

export type TStory = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  image: string;
  content: string;
  mentions: Types.ObjectId[];
  visibility: (typeof STORY_VISIBILITY)[keyof typeof STORY_VISIBILITY];
  viewCounts: number;
  createdAt: Date;
  expiresAt: Date;
};

export type TStoryView = {
  _id: Types.ObjectId;
  storyId: Types.ObjectId;
  userId: Types.ObjectId;
  reactionType: (typeof REACTION_TYPE)[keyof typeof REACTION_TYPE] | '';
  viewedAt: Date;
};

export type TStoryCreate = {
  userId: Types.ObjectId;
  media: string;
} & z.infer<typeof StoryValidations.createStorySchema>;

export type TStoryReacting = z.infer<
  typeof StoryValidations.storyReactionSchema
>;
