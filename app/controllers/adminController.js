//app/controller/adminController.js

import moment from 'moment';
import dbQuery from '../db/dev/dbQuery';
import {
   hashPassword,
   isValidEmail,
   validatePassword,
   isEmpty,
   generateUserToken,
} from '../helpers/validation';

import {
   errorMessage, successMessage, status,
} from '../helpers/status';

/**
  * Creates an admin 
  * NOTE: async
  * @param {object} req
  * @param {object} res
  * @returns {object} reflection object
  */
const createAdmin = async (req, res) => {
   const {
      email, first_name, last_name, 
      pw,
   } = req.body;

   const { is_admin } = req.user;

   const isAdmin = true;
   // const created_on = moment(new Date());
   // TODO: Why is there a ! here?
   if(!is_admin === false) {
      errorMessage.error = 'Sorry You are unauthorized to create an admin';
      return res.status(status.bad).send(errorMessage);
   }

   if(isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(pw)) {
      errorMessage.error = 'Email, password, first name and last name field cannot be empty';
      return res.status(status.bad).send(errorMessage);
   }
   if(!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage);
   }
   if(!validatePassword(pw)) {
      errorMessage.error = 'Password must be at least 8 characters';
      return res.status(status.bad).send(errorMessage);
   }
   const hashedPassword = hashPassword(pw);
   const createUserQuery = `INSERT INTO
      users(email, first_name, last_name, pw, is_admin)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
   const values = [
      email,
      first_name,
      last_name,
      hashedPassword,
      isAdmin,      
   ];

   try {
      // (a)wait for it.
      const { rows } = await dbQuery.query(createUserQuery, values);
      const dbResponse = rows[0];
      delete dbResponse.password;
      const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      successMessage.data = dbResponse;
      successMessage.data.token = token;
      return res.status(status.created).send(successMessage);
   } catch(error) {
      if(error.routine === '_bt_check_unique') {
         errorMessage.error = 'Admin with that EMAIL already exist';
         return res.status(status.conflict).send(errorMessage);
      }
   }
};

/**
 * Update user to an admin
 * @param {object} req 
 * @param {object} res 
 * @returns {object} updated user
 */
const updateUserToAdmin = async (req, res) => {
   const { id } = req.params;
   const { isAdmin } = req.body;

   const { is_admin } = req.user;
   if(!is_admin === true) {
      errorMessage.error = 'Sorry, you are unauthorized to make user an admin';
      return res.status(status.bad).send(errorMessage);
   }
   if(isAdmin === '') {
      errorMessage.error = 'Admin Status is needed';
      return res.status(status.bad).send(errorMessage);
   }
   const findUserQuery = 'SELECT * FROM users WHERE id=$1';
   const updateUser = `UPDATE users
        SET is_admin=$1 WHERE id=$2 returning *`;
   try {
      // (a)wait for it.
      const { rows } = await dbQuery.query(findUserQuery, [id]);
      const dbResponse = rows[0];
      if(!dbResponse) {
         errorMessage.error = 'User Cannot be found';
         return res.status(status.notfound).send(errorMessage);
      }
      const values = [
         isAdmin,
         id,
      ];
      // (a)wait for it.
      const response = await dbQuery.query(updateUser, values);
      const dbResult = response.rows[0];
      delete dbResult.password;
      successMessage.data = dbResult;
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
   }
};

export {
   createAdmin,
   updateUserToAdmin,
};