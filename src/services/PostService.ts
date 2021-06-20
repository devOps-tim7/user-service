import Relation from '../models/Relation';
import axios from 'axios';
import User from '../models/User';

const BASE = 'http://gateway:8000';

const createRelation = async (relation: Relation) => {
  const toSend = {
    subject: relation.subject_id,
    object: relation.object_id,
    type: relation.type,
    pending: relation.pending,
  };
  await axios.post(`${BASE}/api/posts/relation`, toSend);
};

const updateRelation = async (relation: Relation) => {
  const toSend = {
    subject: relation.subject.id,
    object: relation.object.id,
    type: relation.type,
    pending: relation.pending,
  };
  await axios.put(`${BASE}/api/posts/relation`, toSend);
};

const deleteRelation = async (relation: Relation) => {
  const deleteRequest = {
    subject: relation.subject_id,
    object: relation.object_id,
    type: relation.type,
  };
  await axios.post(`${BASE}/api/posts/relation/delete`, deleteRequest);
};

const createUser = async (user: User) => {
  const toSend = {
    id: user.id,
    gender: user.gender,
    birthDate: user.birthDate,
    banned: user.banned,
    username: user.username,
  };
  await axios.post(`${BASE}/api/posts/user`, toSend);
};

const updateUser = async (user: User) => {
  const toSend = {
    id: user.id,
    gender: user.gender,
    birthDate: user.birthDate,
    banned: user.banned,
    username: user.username,
  };
  await axios.put(`${BASE}/api/posts/user`, toSend);
};

export default {
  createRelation,
  updateRelation,
  deleteRelation,
  createUser,
  updateUser,
};
