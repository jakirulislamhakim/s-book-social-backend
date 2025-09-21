import { deleteUsersJob } from './deleteUser.job';

export const initializeJobs = () => {
  // Initialize jobs
  deleteUsersJob.start();
};
