import { z } from 'zod';
import { STORY_VISIBILITY } from './story.constant';
import { REACTION_TYPE } from '../Reaction/reaction.constant';

const createStorySchema = z.object({
  content: z
    .string({
      invalid_type_error: 'Content must be a string',
    })
    .trim()
    .max(250, 'Story content must not exceed 250 characters')
    .optional(),

  visibility: z
    .enum(
      [
        STORY_VISIBILITY.PRIVATE,
        STORY_VISIBILITY.PUBLIC,
        STORY_VISIBILITY.FRIENDS,
      ],
      {
        invalid_type_error: `Story visibility must be ${Object.values(STORY_VISIBILITY).join(' or ')}`,
      },
    )
    .optional(),
});

const storyReactionSchema = z.object({
  reactionType: z.enum(
    [
      REACTION_TYPE.CARE,
      REACTION_TYPE.DOG,
      REACTION_TYPE.DONG,
      REACTION_TYPE.FALTU,
      REACTION_TYPE.HAHA,
      REACTION_TYPE.LOVE,
      REACTION_TYPE.SAD,
      REACTION_TYPE.SHOE,
    ],

    {
      required_error: 'Reaction type is required',
      invalid_type_error: `Reaction type must be ${Object.values(REACTION_TYPE).join(' or ')}`,
    },
  ),
});

export const StoryValidations = {
  createStorySchema,
  storyReactionSchema,
};
