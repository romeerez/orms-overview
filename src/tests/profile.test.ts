import {
  del,
  delPublic,
  get,
  getPublic,
  post,
  postPublic,
  testNotFound,
  testUnauthorized,
} from 'tests/utils/request';
import { profileSchema } from 'tests/utils/schemas';
import { currentUser, userFactory } from 'tests/factories/user.factory';
import { clearDatabaseForUnpatchableOrms } from 'tests/utils/for-unpatchable-orms';

describe('profile endpoints', () => {
  clearDatabaseForUnpatchableOrms();

  describe('GET /profiles/:username', () => {
    test('not found', async () => {
      await testNotFound(getPublic(`/profiles/lalala`));
    });

    test('for unauthorized', async () => {
      const { data } = await getPublic(`/profiles/${currentUser.username}`, {
        schema: profileSchema,
      });

      expect(data.profile.following).toBe(false);
    });

    describe('for authorized', () => {
      test('not following', async () => {
        const notFollowingUser = await userFactory.create();

        const { data } = await get(`/profiles/${notFollowingUser.username}`, {
          schema: profileSchema,
        });

        expect(data.profile.following).toBe(false);
      });

      test('following', async () => {
        const followingUser = await userFactory.create(
          {},
          { transient: { followedBy: [currentUser] } },
        );

        const { data } = await get(`/profiles/${followingUser.username}`, {
          schema: profileSchema,
        });

        expect(data.profile.following).toBe(true);
      });
    });
  });

  describe('POST /api/profiles/:username/follow', () => {
    test('reject unauthorized and not found', async () => {
      await testUnauthorized(postPublic(`/profiles/lalala/follow`));
      await testNotFound(post(`/profiles/lalala/follow`));
    });

    test('follow user', async () => {
      const notFollowingUser = await userFactory.create();

      let { data } = await post(
        `/profiles/${notFollowingUser.username}/follow`,
        {
          schema: profileSchema,
        },
      );
      expect(data.profile.following).toBe(true);

      ({ data } = await get(`/profiles/${notFollowingUser.username}`, {
        schema: profileSchema,
      }));
      expect(data.profile.following).toBe(true);
    });
  });

  describe('DELETE /api/profiles/:username/follow', () => {
    test('reject unauthorized and not found', async () => {
      await testUnauthorized(delPublic(`/profiles/lalala/follow`));
      await testNotFound(del(`/profiles/lalala/follow`));
    });

    test('unfollow user', async () => {
      const followingUser = await userFactory.create(
        {},
        { transient: { followedBy: [currentUser] } },
      );

      let { data } = await del(`/profiles/${followingUser.username}/follow`, {
        schema: profileSchema,
      });
      expect(data.profile.following).toBe(false);

      ({ data } = await get(`/profiles/${followingUser.username}`, {
        schema: profileSchema,
      }));
      expect(data.profile.following).toBe(false);
    });
  });
});
