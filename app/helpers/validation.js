//app/helpers/validation.js

import env from '../../env.js';
// NOTE: hailmary! ENV ISSUE
// import env from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// env.config();
/**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
const isValidEmail = (email) => {
   const regEx = /\S+@\S+\.\S+/;
   return regEx.test(email);
};

/**
   * validatePassword helper method
   * @param {string} password
   * @returns {Boolean} True or False
   */
const validatePassword = (password) => {
   if(password.length <= 8 || password === '') {
      return false;
   } return true;
};
/**
   * isEmpty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
const isEmpty = (input) => {
   if(input === undefined || input === '') {
      return true;
   }
   // weed out the space only cases
   if(input.replace(/\s/g, '').length) {
      return false;
   } return true;
};

/**
   * empty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
const empty = (input) => {
   if(input === undefined || input === '') {
      return true;
   }
};

/**
 * Generate User Token: Takes the supplied info and encodes & binhexes. 
 * super secret. Consider changing to a true environmental value using 
 * the command line.
 * @param {string} email 
 * @param {integer} id 
 * @param {Boolean} is_admin 
 * @param {string} first_name 
 * @param {string} last_name 
 */
const generateUserToken = (email, id, is_admin, first_name, last_name) => {
   const token = jwt.sign({
      email,
      user_id: id,      
      first_name,
      last_name,
      is_admin,
   },
      env.secret, { expiresIn: '3d' });   
   return token;
};

/**
 * Hash Password
 * @param {string} pw 
 * @returns hashed pw
 */
const hashPassword = (pw) => {
   console.log('hashPassword: env.secret is ', env.secret);
   // return bcrypt.hashSync(pw, env.secret);
   return bcrypt.hashSync(pw, bcrypt.genSaltSync(12));
}

/**
 *  Returns the result of a bcrypt compare
 * @param {string} submittedHash 
 * @param {string} savedHash 
 * @returns {Boolean}
 */
const comparePassword = (submittedHash, savedHash) => {
   return bcrypt.compareSync(submittedHash, savedHash);
}

export {
   isValidEmail,
   validatePassword,
   isEmpty,
   empty,
   generateUserToken,
   hashPassword,
   comparePassword
};