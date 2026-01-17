import jwt from 'jsonwebtoken';
import ActiveIndex from '../models/modelIndex.js';
const { User } = ActiveIndex;

export const isAuthenticated = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.get('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Missing or invalid Authorization header' });
    }

    const token = header.split(' ')[1];
    if (!token) {
      return res.status(401).send({ message: 'Missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).send({ message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).send({ message: "User doesn't exist" });
    }
    req.user = user;
    next();
  } 
  catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Internal server error' });
  }
};
