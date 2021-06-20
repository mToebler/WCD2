//app/controllers/busControllers.js

import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import {
   empty,
} from '../helpers/validations';


import {
   errorMessage, successMessage, status,
} from '../helpers/status';


/**
   * Add an event
   * @param {object} req
   * @param {object} res
   * @returns {object} created object record
   */
const addEventDetails = async (req, res) => {
   const {
      zone_id, start_time, stop_time, total_usage
   } = req.body;

   //   const = moment(new Date());
   if(empty(total_usage)) total_usage = null;
   if(empty(zone_id) || empty(start_time) || empty(stop_time)) {
      errorMessage.error = 'Zone_id, start_time and stop_time are required values.';
      return res.status(status.bad).send(errorMessage);
   }
   const createEventQuery = `INSERT INTO
          event(zone_id, start_time, stop_time, total_usage)
          VALUES($1, $2, $3, $4)
          returning *`;
   const values = [
      zone_id,
      start_time,
      stop_time,
      total_usage,
   ];

   try {
      const { rows } = await dbQuery.query(createEventQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = `Event for ${zone_id} was not added.`;
      return res.status(status.error).send(errorMessage);
   }
};

/**
   * Add an event
   * @param {object} req
   * @param {object} res
   * @returns {object} created object record
   */
  const updateEventDetails = async (req, res) => {
   const {
      id, totalUsage
   } = req.body;

   //   const = moment(new Date());
   if(empty(zone_id) || empty(start_time) || empty(stop_time)) {
      errorMessage.error = 'id and totalUsage are required values.';
      return res.status(status.bad).send(errorMessage);
   }
   const createEventQuery = `UPDATE
          event SET total_usage = $1 WHERE id = $2
          returning *`;
   const values = [
      totalUsage,
      id
   ];

   try {
      const { rows } = await dbQuery.query(createEventQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = `Event for ${id} was not updated.`;
      return res.status(status.error).send(errorMessage);
   }
};


/**
   * Get Event Range. Returns array of events overlapping the supplied times 
   * Some tips: It may be best to grab by zone by day. Day is interpretted here
   * as a cycle
   * @param {object} req 
   * @param {object} res 
   * @returns {object} event array
   */
const getEventRange = async (req, res) => {
   const {
      start_time, stop_time
   } = req.body;
   
   if(empty(start_time) || empty(stop_time)) {
      errorMessage.error = 'Start_time and stop_time are required values for getEventRange.';
      return res.status(status.bad).send(errorMessage);
   }

   const values = [start_time, stop_time];
   const getRangeQuery = 'SELECT * FROM event WHERE start_time <= $1 AND stop_time >= $2 ORDER BY stop_time ASC';
   try {
      const { rows } = await dbQuery.query(getRangeQuery, values);
      const dbResponse = rows;
      if(dbResponse[0] === undefined) {
         successMessage.data = [];
         return res.status(status.notfound).send(successMessage);
      }
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'An error Occured';
      return res.status(status.error).send(errorMessage);
   }
};


export {   
   getEventRange,
   addEventDetails,
   updateEventDetails,
};