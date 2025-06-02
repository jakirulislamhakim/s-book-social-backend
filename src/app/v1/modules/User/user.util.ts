import { User } from './user.model';

const generateUniqueUsername = async (fullName: string) => {
  let baseUsername = fullName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .slice(0, 15); // Get the first 12 characters

  // Ensure minimum length of 6 characters
  if (baseUsername.length < 6) {
    const padding = 'xyz123'; // fallback padding text
    baseUsername = (baseUsername + padding).slice(0, 6);
  }

  let username = baseUsername;
  let suffix = 0;

  while (await User.exists({ username })) {
    suffix = Math.floor(100 + Math.random() * 900); // 3-digit suffix
    username = `${baseUsername}${suffix}`;
  }

  return username;
};

export const UserUtils = {
  generateUniqueUsername,
};
