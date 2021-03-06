import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import GALLONS from '../helpers/constants';

import Event from '../model/event';

import updateEventDetails from './eventController';

import {
   isEmpty, empty,
} from '../helpers/validations';


import {
   errorMessage, successMessage, status
} from '../helpers/status';


/**
  * Store Usage By Event
  * @param {object} req
  * @param {object} res
  * @returns {object} usage array
  */
const storeUsageByEvent = async (req, res) => {
   const getUsageQuery = "SELECT SUM(usage_amount) FROM usage WHERE usage_time BETWEEN TIMESTAMP $1 AND TIMESTAMP $2";
   // get value and store in eventController.updateEventDetails
//    const {
//       eventId
//    } = req.body;

//    const values = [
//       usageTimeStart, usageTimeStop
//    ];
//    try {
//       const { rows } = await dbQuery.query(getUsageQuery, values);
//       const dbResponse = rows;
//       if(!dbResponse[0]) {
//          errorMessage.error = 'No reported usage';
//          return res.status(status.notfound).send(errorMessage);
//       }
//       successMessage.data = dbResponse;
//       return res.status(status.success).send(successMessage);
//    } catch(error) {
//       errorMessage.error = 'Operation was not successful';
//       return res.status(status.error).send(errorMessage);
//    }
   return null;
};


///// TODO: NEED TO RESOLVE HOW TOTAL USAGE GETS STORED!!!! SEEMS TO BE CIRCUITOUS RIGHT NOW.

export { storeUsageByEvent };