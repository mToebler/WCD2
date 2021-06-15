//app/middleware/verifyAuth.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
   errorMessage, status,
} from '../helpers/status';

import env from '../../env';

dotenv.config();

/**
   * Verify Token: verifies the user token when accessing a protected route.
   * @param {object} req 
   * @param {object} res 
   * @param {object} next
   * @returns {object|void} response object 
   */

const verifyToken = async (req, res, next) => {
   // get the token from the request header
   const { token } = req.headers;
   if(!token) {
      errorMessage.error = 'Token not provided';
      return res.status(status.bad).send(errorMessage);
   }
   try {
      // send token to be verified
      const decoded = jwt.verify(token, process.env.SECRET);
      // NOTE: TODO: Need to verify from the DB!!
      req.user = {
         email: decoded.email,
         user_id: decoded.user_id,         
         first_name: decoded.first_name,
         last_name: decoded.last_name,
         is_admin: decoded.is_admin,
      };
      // Pass control over to the next request handler, middleware
      next();
   } catch(error) {
      errorMessage.error = 'Authentication Failed';
      return res.status(status.unauthorized).send(errorMessage);
   }
};

export default verifyToken;