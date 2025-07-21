import { User } from '../User/user.model';

const extractMentionsFromContent = (content: string) => {
  const rawUsernames = [...content.matchAll(/@([a-z0-9._]{3,20})/g)];
  return rawUsernames.map((match) => match[1]);
};

const getMentionsUserIds = async (mentionUsernames: string[]) => {
  const mentionUserIds = await Promise.all(
    mentionUsernames.map(async (username) => {
      const user = await User.findOne({ username }).select('_id').lean();
      return user?._id;
    }),
  );

  const validMentionUserIds = mentionUserIds.filter((id) => id !== undefined);

  return validMentionUserIds;
};

export const CommentUtils = {
  extractMentionsFromContent,
  getMentionsUserIds,
};
