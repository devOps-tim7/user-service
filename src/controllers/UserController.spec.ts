import supertest from 'supertest';
import { createServer } from '../../server';
import connection from '../helpers/Connection';
import { Gender, RelationType, Role } from '../helpers/shared';
import User from '../models/User';
import PostService from '../services/PostService';
import AdminService from '../services/AdminService';
import { loggedIn } from '../middleware/Auth';
import { mocked } from 'ts-jest/utils';
import Relation from '../models/Relation';

jest.mock('../middleware/Auth');

const app = createServer();

const defaultUser = {
  username: 'user',
  password: 'user',
  fullName: 'User User',
  email: 'user@email.com',
  phone: '069123456',
  gender: Gender.Male,
  birthDate: new Date(),
  description: '',
  website: '',
  private: false,
  taggable: true,
  role: Role.User,
};

describe('UserController test test', () => {
  describe('registration', () => {
    const user = new User(defaultUser);

    describe('when user exists', () => {
      it('doesnt create a user', async () => {
        await connection.clear();
        await user.save();
        const response = await supertest(app).post('/api/users').send(user);
        expect(response.statusCode).toBe(422);
        expect(response.body.errors[0].username).toBe('Username already exists!');
      });
    });

    describe('when user doesnt exist', () => {
      it('creates a user', async () => {
        const adminSpy = jest.spyOn(PostService, 'createUser').mockResolvedValue();
        const postSpy = jest.spyOn(AdminService, 'createUser').mockResolvedValue();

        await connection.clear();
        const response = await supertest(app).post('/api/users').send(user);
        expect(response.statusCode).toBe(201);
        expect(response.body.username).toBe(user.username);
        expect(response.body.password).toBeUndefined();
        expect(adminSpy).toHaveBeenCalledTimes(1);
        expect(postSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getForTagging', () => {
    let user1;
    let user2;
    let user3;
    let user4;

    beforeEach(async () => {
      connection.clear();
      user1 = await new User({ ...defaultUser, username: 'user1' }).save();

      mocked(loggedIn, true).mockImplementation((req, _res, next) => {
        req.user = user1;
        next();
      });
    });

    describe('when everyone is public', () => {
      it('shows all 3 users', async () => {
        user2 = await new User({ ...defaultUser, username: 'user2' }).save();
        user3 = await new User({ ...defaultUser, username: 'user3' }).save();
        user4 = await new User({ ...defaultUser, username: 'user4' }).save();

        const response = await supertest(app).get('/api/users/forTagging');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(3);
        expect(response.body[0].username).toBe(user2.username);
        expect(response.body[1].username).toBe(user3.username);
        expect(response.body[2].username).toBe(user4.username);
      });
    });

    describe('when user4 is private', () => {
      beforeEach(async () => {
        user2 = await new User({ ...defaultUser, username: 'user2' }).save();
        user3 = await new User({ ...defaultUser, username: 'user3' }).save();
        user4 = await new User({ ...defaultUser, username: 'user4', private: true }).save();
      });

      describe('when user 1 follows user4', () => {
        describe('when follow is pending', () => {
          it('does not show user4', async () => {
            await new Relation({
              subject: user1,
              object: user4,
              type: RelationType.Follow,
              pending: true,
            }).save();
            const response = await supertest(app).get('/api/users/forTagging');
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].username).toBe(user2.username);
            expect(response.body[1].username).toBe(user3.username);
          });
        });
        describe('when follow is not pending', () => {
          it('shows all 3 users', async () => {
            await new Relation({
              subject: user1,
              object: user4,
              type: RelationType.Follow,
              pending: false,
            }).save();
            const response = await supertest(app).get('/api/users/forTagging');
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(3);
            expect(response.body[0].username).toBe(user2.username);
            expect(response.body[1].username).toBe(user3.username);
            expect(response.body[2].username).toBe(user4.username);
          });
        });
      });

      describe('when user 1 does not follow user 4', () => {
        it('does not show user4', async () => {
          const response = await supertest(app).get('/api/users/forTagging');
          expect(response.statusCode).toBe(200);
          expect(response.body.length).toBe(2);
          expect(response.body[0].username).toBe(user2.username);
          expect(response.body[1].username).toBe(user3.username);
        });
      });
    });

    describe('when user2 is blocked by user1', () => {
      it('doesnt show user2', async () => {
        user2 = await new User({ ...defaultUser, username: 'user2' }).save();
        user3 = await new User({ ...defaultUser, username: 'user3' }).save();
        user4 = await new User({ ...defaultUser, username: 'user4' }).save();
        await new Relation({
          subject: user1,
          object: user2,
          type: RelationType.Block,
          pending: false,
        }).save();

        const response = await supertest(app).get('/api/users/forTagging');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].username).toBe(user3.username);
        expect(response.body[1].username).toBe(user4.username);
      });
    });

    describe('when user1 is blocked by user4', () => {
      it('doesnt show user4', async () => {
        user2 = await new User({ ...defaultUser, username: 'user2' }).save();
        user3 = await new User({ ...defaultUser, username: 'user3' }).save();
        user4 = await new User({ ...defaultUser, username: 'user4' }).save();
        await new Relation({
          subject: user4,
          object: user1,
          type: RelationType.Block,
          pending: false,
        }).save();

        const response = await supertest(app).get('/api/users/forTagging');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].username).toBe(user2.username);
        expect(response.body[1].username).toBe(user3.username);
      });
    });
  });
});
