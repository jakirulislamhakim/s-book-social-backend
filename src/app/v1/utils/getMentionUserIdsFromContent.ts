import { User } from '../modules/User/user.model';

export const getMentionUserIdsFromContent = async (content: string) => {
  const mentionUsernames = [...content.matchAll(/@([a-z0-9._]{3,20})/g)].map(
    (match) => match[1],
  );

  //* i can also prevent mention in comment if author and mentions user is not friend

  const mentionUserIds = await Promise.all(
    mentionUsernames.map(async (username) => {
      const user = await User.findOne({ username }).select('_id').lean();
      return user?._id;
    }),
  );

  return mentionUserIds.filter((id) => id !== undefined);
};
