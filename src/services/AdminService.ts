import axios from 'axios';
import User from '../models/User';

const BASE = 'http://gateway:8000';

const createUser = async (user: User) => {
  const toSend = {
    id: user.id,
    banned: user.banned,
    fullName: user.fullName,
  };

  await axios.post(`${BASE}/api/admin/users`, toSend);
};

const updateUser = async (user: User) => {
  const toSend = {
    id: user.id,
    banned: user.banned,
    fullName: user.fullName,
  };
  await axios.put(`${BASE}/api/admin/users`, toSend);
};

export default { createUser, updateUser };
