import { RelationType, Role } from '../helpers/shared';
import Relation from '../models/Relation';
import User from '../models/User';
import AdminService from './AdminService';
import PostService from './PostService';
import bcrypt from 'bcrypt';
import { Like } from 'typeorm';
import HttpException from '../exceptions/HttpException';
import PropertyError from '../exceptions/PropertyError';

const getAll = async (
  username: string,
  onlyTaggable: boolean,
  onlyPublic: boolean
): Promise<User[]> => {
  let whereArgs: any = {
    username: Like(`%${username}%`),
    banned: false,
  };

  if (onlyTaggable) {
    whereArgs = {
      ...whereArgs,
      taggable: true,
    };
  }

  if (onlyPublic) {
    whereArgs = {
      ...whereArgs,
      private: false,
    };
  }

  return (await User.find({ ...whereArgs })).map((user) => {
    delete user.password;
    return user;
  });
};

const create = async (user: User): Promise<User> => {
  const savedUser = await user.save();

  await PostService.createUser(savedUser);
  await AdminService.createUser(savedUser);

  delete savedUser.password;
  return savedUser;
};

const update = async (user: User, attributes: any): Promise<User> => {
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'role' || key === 'banned' || key === 'id') {
      continue;
    }
    if (key === 'username') {
      const otherUser = await User.findOne({ username: value as string });
      if (otherUser && otherUser.id !== user.id) {
        throw new HttpException(404, [new PropertyError('base', 'Username already exists!')]);
      }
    }
    if (key === 'password') {
      user.password = bcrypt.hashSync(value as string, 10);
    } else {
      user[key] = value;
    }
  }

  const updatedUser = await user.save();

  await PostService.updateUser(updatedUser);
  await AdminService.updateUser(updatedUser);
  return updatedUser;
};

const ban = async (user: User): Promise<User> => {
  user.banned = true;
  const updatedUser = await user.save();

  await PostService.updateUser(updatedUser);
  return updatedUser;
};

const approveAgent = async (user: User): Promise<User> => {
  user.role = Role.Agent;
  const updatedUser = await user.save();

  return updatedUser;
};

const createRelation = async (
  subject: User,
  object: User,
  type: RelationType,
  pending: boolean
) => {
  const toSave: Relation = new Relation({ subject, object, type, pending });
  const savedRelation = await toSave.save();

  await PostService.createRelation(savedRelation);
  return savedRelation;
};

const updateRelation = async (
  subject: User,
  object: User,
  type: RelationType,
  pending: boolean
) => {
  const toSave: Relation = new Relation({ subject, object, type, pending });
  const savedRelation = await toSave.save();

  await PostService.updateRelation(savedRelation);
};

const deleteRelation = async (subject: User, object: User, type: RelationType) => {
  const relation = await Relation.findOne({ subject, object, type });
  await Relation.delete({ subject, object, type });
  await PostService.deleteRelation(relation);
};

export default {
  getAll,
  create,
  update,
  ban,
  approveAgent,
  createRelation,
  updateRelation,
  deleteRelation,
};
