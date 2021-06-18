import { Response } from 'express';
import User from '../models/User';
import PropertyError from '../exceptions/PropertyError';
import HttpException from '../exceptions/HttpException';
import { CustomRequest } from '../middleware/Auth';
import { RelationType } from '../helpers/shared';
import UserService from '../services/UserService';
import Relation from '../models/Relation';

const getAll = async (req: CustomRequest, res: Response) => {
  const subject = await User.findOne(req.user.id);
  const type: RelationType = isNaN(+req.query.type) ? 1 : +req.query.type;

  const relations = await Relation.find({
    where: { subject, type, pending: false },
    relations: ['object'],
  });
  res.status(200).send(relations);
};

const createRelation = async (req: CustomRequest, res: Response) => {
  let subject = await User.findOne(req.user.id);
  let object = await User.findOne(req.body.id);
  const type: RelationType = req.body.type;

  if (!object) {
    throw new HttpException(404, [new PropertyError('base', 'User not found!')]);
  }

  const pending = object.private;

  const savedRelation = await UserService.createRelation(subject, object, type, pending);
  res.status(201).send(savedRelation);
};

const acceptRequest = async (req: CustomRequest, res: Response) => {
  let subject = await User.findOne(req.body.id);
  let object = await User.findOne(req.user.id);

  await UserService.updateRelation(subject, object, RelationType.Follow, false);
  await UserService.createRelation(object, subject, RelationType.Follow, false);
  res.status(204).end();
};

const rejectRequest = async (req: CustomRequest, res: Response) => {
  let subject = await User.findOne(req.body.id);
  let object = await User.findOne(req.user.id);
  const type: RelationType = req.body.type;

  await UserService.deleteRelation(subject, object, type);

  res.status(204).end();
};

export default {
  getAll,
  createRelation,
  acceptRequest,
  rejectRequest,
};
