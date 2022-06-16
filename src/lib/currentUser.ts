import { User } from 'app/user/user.types';
import { verifyToken } from 'lib/jwt';
import { FastifyRequest } from 'fastify';

export const getCurrentUserAndToken = async (
  request: FastifyRequest,
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
    const user = await request.orm.userRepo.findById(id, request.meta);
    if (!user) return;

    return { user, token };
  } catch (error) {
    console.error(error);
  }
};

export const getCurrentUser = async (
  request: FastifyRequest,
): Promise<User | undefined> => {
  const result = await getCurrentUserAndToken(request);
  if (result) return result.user;
};
