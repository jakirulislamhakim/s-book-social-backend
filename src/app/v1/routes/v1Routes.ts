import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ProfileRoutes } from '../modules/Profile/profile.route';
import { UserBlockRoutes } from '../modules/Block/block.route';
import { PostRoutes } from '../modules/Post/post.route';
import { PostAppealRoutes } from '../modules/PostAppeal/postAppeal.route';
import { FriendRoutes } from '../modules/Friend/friend.route';
import { ReactionRoutes } from '../modules/Reaction/reaction.route';

type TModulesRoutes = {
  path: string;
  route: Router;
};

const router = Router();

const moduleRoutes: TModulesRoutes[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/users/profile',
    route: ProfileRoutes,
  },
  {
    path: '/users/block',
    route: UserBlockRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
  {
    path: '/post-appeals',
    route: PostAppealRoutes,
  },
  {
    path: '/friends',
    route: FriendRoutes,
  },
  {
    path: '/reactions',
    route: ReactionRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const V1ModulesRoutes = router;
