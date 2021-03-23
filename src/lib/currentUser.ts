import { User } from 'app/user/user.types';
import { verifyToken } from 'lib/jwt';
import { Request } from 'types';

export const getCurrentUserAndToken = async (
  request: Request,
): Promise<{ user: User; token: string } | undefined> => {
  try {
    let token = request.headers.authorization;
    if (!token) return;

    if (token?.startsWith('Bearer ')) {
      token = token.slice(7);
    } else if (token?.startsWith('Token ')) {
      token = token.slice(6);
    }

    const { id } = <{ id: number }>verifyToken(token);
    const user = await request.orm.userRepo.findById(id);
    if (!user) return;

    delete user.password;
    return { user, token };
  } catch (error) {}
};

export const getCurrentUser = async (
  request: Request,
): Promise<User | undefined> => {
  const result = await getCurrentUserAndToken(request);
  if (result) return result.user;
};
