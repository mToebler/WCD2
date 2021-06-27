import moment from 'moment';

import dbQuery from '../db/dev/dbQuery.js';

import * as GALLONS from '../helpers/constants.js';

import {
   isEmpty, empty,
} from '../helpers/validation.js';


import {
   errorMessage, successMessage, status, trip_statuses,
} from '../helpers/status.js';

/**
   * Create usage usageTime is a timestamp or datetime in format 'yyyy-mm-dd hh:mm:ss'
   * ss should be 00.
   * @param {object} req constains usageTime, usageAmount, ?unitId = 1
   * @param {object} res
   * @returns {object} reflection object
   */
const createUsage = async (req, res) => {
   let {
      usageTime, usageAmount, unitId
   } = req.body;

   const { is_admin } = req.user;
   if(!is_admin === true) {
      errorMessage.error = 'Sorry You are unauthorized to add usage';
      return res.status(status.bad).send(errorMessage);
   }

   usageTime = moment(new Date(usageTime));
   unitId = GALLONS;

   if(empty(usageTime) || isEmpty(usageAmount)) {
      errorMessage.error = 'usageTime and usageAmount fields cannot be empty';
      return res.status(status.bad).send(errorMessage);
   }
   const createUsageQuery = `INSERT INTO
           usage(usage_time, usage_amount, unit_id)
           VALUES(timestamp '$1', $2, $3)
           returning *`;
   const values = [
      usageTime, usageAmount, unitId
   ];

   try {
      const { rows } = await dbQuery.query(createUsageQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = 'Unable to create usage';
      return res.status(status.error).send(errorMessage);
   }
};

/**
  * Get Usage
  * @param {object} req
  * @param {object} res
  * @returns {object} usage array
  */
const getUsage = async (req, res) => {
   const getUsageQuery = 'SELECT * FROM usage WHERE usage_time BETWEEN $1 AND $2';
   const {
      usageTimeStart, usageTimeStop
   } = req.body;

   const values = [
      usageTimeStart, usageTimeStop
   ];
   try {
      const { rows } = await dbQuery.query(getUsageQuery, values);
      const dbResponse = rows;
      if(!dbResponse[0]) {
         errorMessage.error = 'There no reported usage';
         return res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
   }
};

/**
  * Get Usage Amount
  * @param {object} req
  * @param {object} res
  * @returns {object} usage amount
  */
const getUsageAmount = async (req, res) => {
   const getUsageQuery = "SELECT SUM(usage_amount) FROM usage WHERE usage_time BETWEEN TIMESTAMP $1 AND TIMESTAMP $2";
   const {
      usageTimeStart, usageTimeStop
   } = req.body;

   const values = [
      usageTimeStart, usageTimeStop
   ];
   try {
      const { rows } = await dbQuery.query(getUsageQuery, values);
      const dbResponse = rows;
      if(!dbResponse[0]) {
         errorMessage.error = 'No reported usage';
         return res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage);
   }
};

export {
   createUsage,
   getUsage,
   getUsageAmount,
};