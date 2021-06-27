//app/controller/usersController.js

import moment from 'moment';
import env from '../../env.js';
import dotenv from 'dotenv';
dotenv.config();  
import dbQuery from '../db/dev/dbQuery.js';

import {
   hashPassword,
   comparePassword,
   isValidEmail,
   validatePassword,
   isEmpty,
   generateUserToken,
} from '../helpers/validation.js';

import {
   errorMessage, successMessage, status,
} from '../helpers/status.js';

// const DEBUG = !!process.env.DEBUG ;
const DEBUG = false;
/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
const createUser = async (req, res) => {
   // change to const
   var {
      email, first_name, last_name, pw,
   } = req.body;
   
   
   if(DEBUG) {
      email = 'test@test.com';
      first_name = 'test';
      last_name = 'user';
      pw = 'testytest';
   }
   console.log('usersController: DEBUG: ', DEBUG);
   console.log('usersController: email: ', email);
   
   
   // const created_on = moment(new Date());
   if(isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(pw)) {
      errorMessage.error = 'Email, password, first name and last name field cannot be empty';
      return res.status(status.bad).send(errorMessage);
   }
   if(!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage);
   }
   if(!validatePassword(pw)) {
      errorMessage.error = 'Password must be _more_ than eight (8) characters';
      return res.status(status.bad).send(errorMessage);
   }
   const hashedPassword = hashPassword(pw);
   if(DEBUG) {console.log('UsersController: hashedPassword: ', hashedPassword);}
   const createUserQuery = `INSERT INTO
      users(email, first_name, last_name, pw)
      VALUES($1, $2, $3, $4)
      returning *`;
   const values = [
      email,
      first_name,
      last_name,
      hashedPassword
   ];
   if(DEBUG) {console.log('UsersController: trying db insert with: ', createUserQuery, values);}
   try {
      const { rows } = await dbQuery.query(createUserQuery, values);
      const dbResponse = rows[0];
      delete dbResponse.password;
      const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      successMessage.data = dbResponse;
      successMessage.data.token = token;
      return res.status(status.created).send(successMessage);
   } catch(error) {
      if(error.routine === '_bt_check_unique') {
         errorMessage.error = 'That email is already registered. Password recovery module pending.';
         return res.status(status.conflict).send(errorMessage);
      }
      errorMessage.error = 'Operation was not successful';
      console.log('UserController: ERROR: ', errorMessage, '\nERROR: ', error);
      return res.status(status.error).send(errorMessage);
   }
};

/**
   * Login / Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
const authUser = async (req, res) => {
   const { email, password } = req.body;
   if(isEmpty(email) || isEmpty(pw)) {
      errorMessage.error = 'Please provide non-empty values for both email and password.';
      return res.status(status.bad).send(errorMessage);
   }
   if(!isValidEmail(email) || !validatePassword(pw)) {
      errorMessage.error = 'Please provide a valid email address and password (one of them is not valid).';
      return res.status(status.bad).send(errorMessage);
   }
   const selectUserByEmail = 'SELECT * FROM users WHERE email = $1';
   try {
      const { rows } = await dbQuery.query(selectUserByEmail, [email]);
      const dbResponse = rows[0];
      if(!dbResponse) {
         errorMessage.error = 'That email is not registered.';
         return res.status(status.notfound).send(errorMessage);
      }
      if(!comparePassword(dbResponse.password, password)) {
         errorMessage.error = 'Incorrect password';
         return res.status(status.bad).send(errorMessage);
      }
      const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      delete dbResponse.password;
      successMessage.data = dbResponse;
      successMessage.data.token = token;
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
   }
};

export {
   createUser,
   authUser,
};