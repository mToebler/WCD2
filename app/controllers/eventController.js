//app/controllers/eventController.js

import moment from 'moment';

import dbQuery from '../db/dev/dbQuery.js';
import env from '../../env.js';

import {
   empty,
} from '../helpers/validation.js';


import {
   errorMessage, successMessage, status,
} from '../helpers/status.js';

/// This solution to require not being found from SO
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
/// END SO SOLUTION
const RachioClient = require('rachio');
const client = new RachioClient(env.rachio_auth);
const DEBUG = true;
// import RachioClient from 'rachio/lib/RachioClient';

// console.log('eventController: wee', client);
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

/**
   * Get Retrieve Range. returns range from rachio * 
   * Some tips: It may be best to grab by zone by day. Day is interpretted here
   * as a cycle
   * @param {object} req 
   * @param {object} res 
   * @returns {object} event array
   */
const retrieveAPIEvents = async (req, res) => {
   // console.log('retrieveEvents: req : ', req);
   const {
      start_time, stop_time
   } = req.query;

   if(empty(start_time) || empty(stop_time)) {
      errorMessage.error = 'Start_time and stop_time are required values for RetrieveEvents.';
      return res.status(status.bad).send(errorMessage);
   }
   let startTime, endTime;
   if(parseInt(start_time) > 0)
      startTime = new Date(parseInt(start_time));
   if(parseInt(stop_time) > 0)
      endTime = new Date(parseInt(stop_time));
   try {
      successMessage.data = await getRachioEvents(startTime, endTime, {});
      console.log('retrieveEvents: SUCCESS: ', successMessage.data);
      return res.status(status.success).send(successMessage);
   } catch(error) {
      errorMessage.error = 'An error Occured';
      console.error('retrieveEvents: ERROR: ', error);
      return res.status(status.error).send(errorMessage);
   }

   // const values = [start_time, stop_time];
   // const getRangeQuery = 'SELECT * FROM event WHERE start_time <= $1 AND stop_time >= $2 ORDER BY stop_time ASC';
   // try {
   //    const { rows } = await dbQuery.query(getRangeQuery, values);
   //    const dbResponse = rows;
   //    if(dbResponse[0] === undefined) {
   //       successMessage.data = [];
   //       return res.status(status.notfound).send(successMessage);
   //    }
   //    successMessage.data = dbResponse;
   //    return res.status(status.success).send(successMessage);
   // } catch(error) {
   //    errorMessage.error = 'An error Occured';
   //    return res.status(status.error).send(errorMessage);
   // }
};

/// NOTE: These are helper functions using the rachio client

const zoneCache = {
   zones: []
}
/*
   All about the RachioService class
*/
function getRachioDevices() {
   if(DEBUG) console.log('getRachioDevices: client: ', this.rachioClient);
   this.rachioClient.getDevices()
      .then(devices =>
         devices.array.forEach(device =>
            console.log(`Name: ${device.name}; Model: ${device.model}; ID: ${device.id}`)
         )
      )
      .catch(err => console.log('getRachioDevices Error: ', err));


}

function getRachioDevice(id) {
   if(DEBUG) console.log('getRachioDevice: client: ', env.rachio_device);
   this.rachioClient.getDevice(env.rachio_device)
      .then(device => {
         console.log(`Name: ${device.name}; Model: ${device.model}; ID: ${device.id}`);
         return device;
      }
      )
      .catch(err => console.log('getRachioDevice Error: ', err));


}

function getRachioConditions(id) {
   if(DEBUG) console.log('getRachioDeviceConditions: client: ', env.rachio_device);
   this.rachioClient.getDeviceCurrentConditions(env.rachio_device)
      .then(conditions => {
         console.log(`conditions: `, conditions);
         return conditions;
      })
      .catch(err => console.log('getRachioConditions Error: ', err));
}

/* 
   Get Rachio Forecast
      returns an array of of Forecast objects for the next 14 days
*/
function getRachioForecast(id) {
   if(DEBUG) console.log('getRachioForecast: client: ', env.rachio_device);
   this.rachioClient.getDeviceForecast(env.rachio_device)
      .then(forecast => {
         console.log(`forecast: `, forecast);
         return forecast;
      })
      .catch(err => console.log('getRachioForecast Error: ', err));
}

function getRachioForecastDay(day) {
   this.rachioClient.getDeviceForecast(env.rachio_device)
      .then(forecast => {
         console.log(`forecast day: ${day}: `, forecast[day])
         return forecast[day];
      })
      .catch(err => console.log('getRachioForecastDay Error: ', err));
}

function getRachioZones(id) {
   this.rachioClient.getZonesByDevice(env.rachio_device)
      .then(zones => {
         console.log(`Zones: `, zones)
         return zones;
      })
      .catch(err => console.log('getRachioZones', err));
}

function getRachioZone(zoneId) {
   this.rachioClient.getZone(zoneId)
      .then(zone => {
         console.log(`Zone: `, zone);
         return zone;
      })
      .catch(err => console.log('getRachioZone', err));
}

function getRachioByNumber(number) {
   this.rachioClient.getDevice(env.rachio_device)
      .then(device => device.getZones())
      .then(zones => {
         zones.forEach(zone => {
            let newZone = {
               name: zone.name,
               number: zone.zoneNumber,
               id: zone.id,
               image: zone.imageUrl,
               lastWatered: zone.lastWateredDate
            };
            zoneCache.zones.push(newZone);
            console.log('getRachioByNumber: caching zone: ', newZone);
         });
         // return new Promise((resolve, reject) =>
         return zoneCache.zones.find(zone => zone.nubmer == number);
      })
      .catch(err => console.log('getRachioByNumber', err));

   // console.log(`${zone.name} : ${zone.zoneNumber} : ${zone.enabled} : ${zone.id}`)));
}

function isRachioWatering(id) {
   return this.rachioClient.isWatering(env.rachio_device);
}

// only one month of retrieval is allowed
// NOTE: Rachio reports time in GMT in eventDate. Flume reports time for PDT. 
// This means Flume needs 7 hours removed from MS time to sync up with rachio.
// Query params startTime and endTime expect 13 digit timestamps!!
async function getRachioEvents(startTime, endTime, filters = {}) {
   const MONTH = 2678400000; // 31 days in Milliseconds
   if(startTime == null)
      startTime = new Date(Date.now() - (MONTH));
   if(endTime == null)
      endTime = new Date(startTime.getTime() + MONTH);

   let startTimeMS = startTime.getTime();
   let endTimeMS = endTime.getTime();
   if(DEBUG) console.log('getRachioEvents: startTimeMS: ', startTimeMS, ' endTimeMS: ', endTimeMS);
   if(endTimeMS - startTimeMS > MONTH) {
      return Promise.reject(new Error('Range cannot exceed 31 days'));
   }

   filters = {
      // category: 'DEVICE',
      // type: 'RAIN_DELAY',
      subType: 'ZONE_COMPLETED',
      type: 'ZONE_STATUS',
      topic: "WATERING"
   };
   try {
      // begin crap
      if(DEBUG) console.log('getRachioEvents: env.rachio_device:', env.rachio_device, startTimeMS, endTimeMS, filters);
      // return await client.getDevices();
      // .then(devices =>
      //    devices.forEach(d =>
      //       console.log(`${d.name} : ${d.model} : ${d.id}`)));
      // end crap
      // if(DEBUG) console.log(client.getDeviceEvents(env.rachio_device, startTimeMS, endTimeMS, filters).then(data => console.log(data)));
      // this.rachioClient.getDeviceEvents(env.rachio_device, startTime, endTime, filters)
      return await client.getDeviceEvents(env.rachio_device, startTimeMS, endTimeMS, filters);
      // .then(events => events.forEach(e => console.log(e.toPlainObject())));
      // .then(response => console.log(response));
      // .then(response => Promise.resolve(response));
   } catch(error) {
      errorMessage.error = 'An error Occured';
      return res.status(status.error).send(errorMessage);
   }
}

const prepEvents = (req, res, processCallback) => {
   try {
      getRachioEvents(null, null)
         .then(data => processCallback(data));
   } catch(error) {
      errorMessage.error = 'An error Occured';
      console.error("prepEvents: error: ", error);
      return res.status(status.error).send(errorMessage);
   }

};

async function summarizeEvents(data) {
   let count = 0;
   try {
      data.forEach(r => {
         let eventTime = r.eventDate;
         let eventSum = r.summary.split(' ');
         let zone = eventSum[0].slice(1); //; zone = zone
         let duration = eventSum[eventSum.length - 2];
         console.log(count++, r.summary, zone, duration, eventTime);

         commitRachioEvent(zone, eventTime, duration)
            .then(committed => console.log('sumarizeRachio: committed: ', committed));
         

      });
   } catch(error) {
      errorMessage.error = 'An error Occured';
      console.error("summarizeEvents: inside error: ", error);
      return res.status(status.error).send(errorMessage);
   }
}
/// this is working out quite well. massage this to populate the events table.
async function summarizeRachio(req, res) {
   let count = 0;
   let resArr = [];
   try {
      let sRes = await getRachioEvents(null, null);
      // console.log(sRes);      
      await sRes.forEach(r => {
         const eventTime = r.eventDate / 1000;
         const eventSum = r.summary.split(' ');
         const zone = eventSum[0].slice(1); //; zone = zone
         const duration = eventSum[eventSum.length - 2];
         const stop_time = eventTime + (duration * 60);
         // console.log('\n\n', count++, r, '\n', r.summary, zone, duration, eventTime, stop_time);
         // console.log(count, )
         try {
            // let committed = commitRachioEvent(zone, eventTime, duration);
            commitRachioEventByTime(zone, eventTime, stop_time)
               .then(committed => {
                  console.log('sumarizeRachio: committed: ', committed);
                  count++;
                  return committed;
               })
               .then(committed => resArr[count] = committed);
            
            // console.log('sumarizeRachio: committed: ', committed);
         } catch(error) {
            errorMessage.error = 'An error Occured';
            console.error("summarizeRachio: inside error: ", error);
            return res.status(status.error).send(errorMessage);
         }

      })
        
      // return res;
   } catch(error) {
      console.error("summarizeRachio: error: ", error);
      errorMessage.error = 'An error Occured';
      return res.status(status.error).send(errorMessage);
   } finally {
      successMessage.data = `${count} records committed.`;
      return res.status(status.created).send(successMessage);
   }
}

async function commitRachioEvent(zone_id, start_time, duration) {
   const MINUTE = 60; // these results are processed as seconds
   let stop_time = start_time + (duration * MINUTE);
   console.log(`\n\ncommitRachioEvent: values: zone_id: ${zone_id}, start_time: ${start_time}, stop_time: ${stop_time} `);
   
   const createEventQuery = `INSERT INTO
            event(zone_id, start_time, stop_time)
            VALUES($1, to_timestamp($2), to_timestamp($3))
         returning *`;
   const values = [
      zone_id,
      start_time,
      stop_time
   ];

   try {
      const { rows } = await dbQuery.query(createEventQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return successMessage;
      // return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = `CommitRachioEvent: WARNING: Event for ${zone_id} was not added.`;
      return errorMessage;
      // throw (new Error(errorMessage.error));
      // return res.status(status.error).send(errorMessage);
   }

}

async function commitRachioEventByTime(zone_id, start_time, stop_time) {
   console.log(`\n\ncommitRachioEventByTime: values: zone_id: ${zone_id}, start_time: ${start_time}, stop_time: ${stop_time} `);
   
   const createEventQuery = `INSERT INTO
            event(zone_id, start_time, stop_time)
            VALUES(${zone_id}, to_timestamp(${start_time}), to_timestamp(${stop_time}))
         returning *`;
   const values = [
      // zone_id,
      // start_time,
      // stop_time
   ];

   try {
      const { rows } = await dbQuery.query(createEventQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return successMessage;
      // return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = `CommitRachioEvent: WARNING: Event for ${zone_id} was not added.`;
      return errorMessage;
      // throw (new Error(errorMessage.error));
      // return res.status(status.error).send(errorMessage);
   }

}


export {
   getEventRange,
   addEventDetails,
   updateEventDetails,
   retrieveAPIEvents,
   summarizeRachio,
};