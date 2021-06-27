//app/middleware/verifyAuth.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
   errorMessage, status,
} from '../helpers/status.js';
/// NOTE: ENV ISSUE
// import env from '../../env.js';
// import env from 'dotenv';

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
      console.log("verifyAuth: no token!!");
      errorMessage.error = 'Token not provided';
      return res.status(status.bad).send(errorMessage);
   }
   try {
      // send token to be verified
      console.log('verifyToken: secret: ', process.env.SECRET);
      console.log('verifyToken: token: ', JSON.parse(token));
      const decoded = jwt.verify(JSON.parse(token), process.env.SECRET);
      // NOTE: TODO: Need to verify from the DB!! No real verification going on here!
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
      console.log('AdminController: ERROR: ', errorMessage, '\nERROR: ', error);
      return res.status(status.unauthorized).send(errorMessage);
   }
};

export default verifyToken;