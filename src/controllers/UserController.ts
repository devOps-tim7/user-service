import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import PropertyError from '../exceptions/PropertyError';
import HttpException from '../exceptions/HttpException';
import { CustomRequest } from '../middleware/Auth';
import { RelationType, Role } from '../helpers/shared';
import UserService from '../services/UserService';
import Relation from '../models/Relation';
import { Not } from 'typeorm';

const register = async (req: Request, res: Response) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (await User.findOne({ username: req.body.username })) {
    throw new HttpException(422, [new PropertyError('username', 'Username already exists!')]);
  }

  const newUser: User = new User({ ...req.body, password: hashedPassword, role: Role.User });
  const savedUser = await UserService.create(newUser);
  res.status(201).send(savedUser);
};

const registerAdmin = async (req: Request, res: Response) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (await User.findOne({ username: req.body.username })) {
    throw new HttpException(422, [new PropertyError('username', 'Username already exists!')]);
  }

  const newUser: User = new User({ ...req.body, password: hashedPassword, role: Role.Admin });
  const savedUser = await UserService.create(newUser);
  res.status(201).send(savedUser);
};

const update = async (req: CustomRequest, res: Response) => {
  const attributes = { ...req.body };
  let user = await User.findOne(req.user.id);

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  const updatedUser = await UserService.update(user, attributes);
  res.status(200).send(updatedUser);
};

const ban = async (req: CustomRequest, res: Response) => {
  let user = await User.findOne(req.params.id);

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  const updatedUser = await UserService.ban(user);
  res.status(200).send(updatedUser);
};

const approveAgent = async (req: CustomRequest, res: Response) => {
  let user = await User.findOne(req.params.id);

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  const updatedUser = await UserService.approveAgent(user);
  res.status(200).send(updatedUser);
};

const getAll = async (req: CustomRequest, res: Response) => {
  const username = req.query.username || '';
  const onlyPublic = !!req.query.public;

  const users = await UserService.getAll(username as string, false, onlyPublic);
  res.status(200).send(users);
};

const get = async (req: CustomRequest, res: Response) => {
  const username = req.params.username;
  const user = await User.findOne({ username, banned: false });

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  delete user.password;
  res.status(200).send(user);
};

const getMyProfile = async (req: CustomRequest, res: Response) => {
  const id = req.user.id;
  let user = await User.findOne({ id, banned: false });

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  user.password = '';
  res.status(200).send(user);
};

const getForAuth = async (req: CustomRequest, res: Response) => {
  const username = req.params.username;
  const user = await User.findOne({ username });

  if (!user) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  res.status(200).send(user);
};

const getForTagging = async (req: CustomRequest, res: Response) => {
  const userId = req.user.id;

  const followedByUserIds = (
    await Relation.find({
      where: { subject_id: userId, type: RelationType.Follow },
      relations: ['subject', 'object'],
    })
  ).map((user) => user.object.id);

  const blockedByUserIds = (
    await Relation.find({
      where: { subject_id: userId, type: RelationType.Block },
    })
  ).map((relation) => relation.object_id);

  const hasBlockedUserIds = (
    await Relation.find({
      where: { object_id: userId, type: RelationType.Block },
    })
  ).map((relation) => relation.subject_id);

  const taggable = await User.find({
    where: { taggable: true, banned: false, role: Not(Role.Admin) },
  });
  const filtered = taggable.filter((user) => {
    if (user.id === userId) {
      return false;
    }
    if ([...blockedByUserIds, ...hasBlockedUserIds].includes(user.id)) {
      return false;
    }
    if (user.private) {
      if (followedByUserIds.includes(user.id)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  });

  res.status(200).send(filtered);
};

const ping = async (_req: CustomRequest, res: Response) => {
  res.status(200).send('pong');
};

export default {
  ping,
  register,
  registerAdmin,
  update,
  ban,
  approveAgent,
  getAll,
  get,
  getMyProfile,
  getForAuth,
  getForTagging,
};
