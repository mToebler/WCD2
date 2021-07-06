import moment from 'moment';
// legacy support
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');

import dbQuery from '../db/dev/dbQuery.js';
import env from '../../env.js';
import * as GALLONS from '../helpers/constants.js';

import {
   isEmpty, empty,
} from '../helpers/validation.js';

import { commitFlumeUsage } from '../model/usage.js';

import {
   errorMessage, successMessage, status
} from '../helpers/status.js';
import { FlumeService } from '../helpers/flume.js';
import { request, response } from 'express';
// import { forEach } from 'core-js/es/array';
// import 'core-js/es/array';

// globals: shoot me
const DEBUG = true;
const HOUR = 3600000;
const flumePack = {
   path_base: '',
   access_token: '',
   payload: {},
   _flume_secrets: {
      client_id: env.flume_client,
      client_secret: env.flume_secret,
      username: env.flume_user,
      password: env.flume_pw,
      access_token: undefined,
      device_id: env.flume_device,
      user_id: env.flume_userId,
   },
   TIME_ADJUST: -7,
};

flumePack._flume_keys = JSON.parse(JSON.stringify(flumePack._flume_secrets));

// helper function to enable enums
const enumValue = (name) => Object.freeze({ toString: () => name });

const Buckets = Object.freeze({
   MIN: 3,
   HR: 4,
   DAY: 5,
   MON: 7,
   YEAR: 8,
});
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

//  @Route("/range/{start}/{end}")
//  @Guards(FlumeValidatorGuard)
async function getFlumeUseByRange(service, start = undefined, stop = undefined) {
   const HOUR = 3600000;

   if(start === undefined) {
      stop = newDate();
      start = new Date(stop.getMilliseconds() - (HOUR * 20));
   } else {
      start = parseInt(start);
      stop = parseInt(stop);
   }

   const startTime = new Date(start);
   const endTime = new Date(stop);
   // if (service.DEBUG)
   console.log('getFlumeUseByRange: param start: ', start, ' start: ', startTime, ' end: ', endTime, ' difference: ', endTime.getTime() - startTime.getTime(), ' limit: ', HOUR * 20);
   let payload;
   if(endTime.getTime() - startTime.getTime() < HOUR * 20) {
      // payload = await service.queryFlumeByDateRange(startTime, endTime, this.flume);
      payload = await service.queryFlumeByRangeAdjusted(startTime, endTime, service);
      if(service.DEBUG) console.log('getFlume: payload: ', payload);
   } else {
      console.log('getFlumeUseByRange: time range cannot be more than 20 hours.');
   }


}


/// this is working out quite well. massage this to populate the events table.
async function testFlume(req, res) {
   try {
      const {
         start, stop
      } = req.query;
      // console.log(req.query);
      console.log(`testFlume: start ${start}, stop: ${stop}`)
      // console.log('TEST TEST: ', flumePack);
      // return await flumeStudy(req, res);

      return await flumeStudy(req, res);
      // return res.status(status.success).send(successMessage);
      /*
         .then(results => queryFlumeByDateRange())
         .then(data => data.json())
         .then(qResults => {
            successMessage.data = qResults;
            return res.status(status.success).send(successMessage);
         })
         .catch(err => {
            errorMessage.error = 'testflume: error: ' + err;
            return res.status(status.bad).send(errorMessage);
         });
      */
      // let results = await flumeStudy(req, res);
      // // return await queryFlumeByDateRange();
      // let qResults = await queryFlumeByDateRange();

      // successMessage.data = qResults;
      // return res.status(status.success).send(successMessage);


      // const flume = new FlumeService();
      // getFlumeUseByRange(flume, start, stop);
      // let res = await getRachioEvents(null, null);
      // // console.log(res);
      // let count = 0;
      // res.forEach(r => {
      //    let eventTime = r.eventDate/1000;
      //    let eventSum = r.summary.split(' ');
      //    let zone = eventSum[0].slice(1); //; zone = zone
      //    let duration = eventSum[eventSum.length - 2];
      //    console.log(count++, r.summary, zone, duration, eventTime);
      //    try {
      //       let committed = commitRachioEvent(zone, eventTime, duration);
      //       console.log('sumarizeRachio: committed: ', committed);
      //    } catch(error) {
      //       errorMessage.error = 'An error Occured';
      //       console.error("summarizeRachio: inside error: ", error);
      //       return res.status(status.error).send(errorMessage);
      //    }

      // });
      // return res;
   } catch(error) {
      console.error("testFlume: error: ", error);
      errorMessage.error = 'An error Occured';
      return res.status(status.error).send(errorMessage);
   }
}

// wrapper for queryFlumeByDateRange
// start & stop need to be in milliseconds
async function getRange(req, res=undefined) {
   let data;
   let parsed;
   try {
      const {
         start, stop
      } = req.query;
      // console.log(req.query);
      console.log(`getRange: start ${start}, stop: ${stop}: `, Date.now());
      // console.log('TEST TEST: ', flumePack);
      // return await flumeStudy(req, res);

      // return await queryFlumeByDateRange(start, stop);
      // return await queryFlumeByDateRange();
      data = await queryFlumeByDateRange(parseInt(start), parseInt(stop));
      parsed = await data.json();
      successMessage.data = Object.values(parsed.data[0])[0];
      console.info('getRange: data: returning ', successMessage.data.length, ' records');
      if(res !== undefined)
         return res.status(status.success).send(successMessage);
      else
         return successMessage.data;

   } catch(error) {
      console.error("getRange: error: ", error);
      errorMessage.error = 'An error Occured';
      return res.status(status.error).send(errorMessage);
   } 
}

/**
 *  Query Flume By Date Range
 *  Main query tool. Use getRange wrapper above
 *  bucketVal is one of the      
 */

async function queryFlumeByDateRange(startTime = undefined, endTime = undefined, bucketVal = Buckets.MIN) {
   if(startTime === undefined) {
      endTime = new Date();
      startTime = new Date(Date.now().getTime() - (12 * HOUR));
      console.log('TEST DATE TEST DATE: startTime: ', startTime, 'endTime: ', endTime);
      // startTime = date.addHours(startTime, -13);
      // endTime = date.addHours(endTime, -1);      
   } else {
      startTime = new Date(startTime);
      endTime = new Date(endTime);
   }

   startTime = adjustFlumeTimes(startTime);
   endTime = adjustFlumeTimes(endTime);

   console.info('queryFlumeByDateRange: Adjusted DATES start: ', startTime, 'end: ', endTime);
   //  let dayn20H: date;
   // let dayn20H = date.addHours(day, (-2));
   // let dayN19H = date.setHours(day.getHours()-19);
   let queries = {
      queries: [
         {
            request_id: startTime.toISOString(),
            bucket: bucketVal,
            since_datetime: startTime.toISOString().slice(0, 19).replace("T", " "),
            until_datetime: endTime.toISOString().slice(0, 19).replace("T", " "),
            // "since_datetime": "2020-11-03 12:00:00",
            // "until_datetime": "2020-11-03 23:59:59",
            //# %a%b%d ~ MonJuly30           
         }
      ]
   };
   try {
      console.info('qFBDR: flumeKeys: ', flumePack._flume_keys);
      // that.makeFlumeRequest(`users/${that._flume_keys['user_id']}/devices/${that._flume_keys['device_id']}/query`, "POST", queries)
      // let fRes = await makeFlumeRequest(`users/${flumePack._flume_keys.user_id}/devices/${flumePack._flume_keys.device_id}/query`, "POST", queries);
      return await makeFlumePost(`users/${flumePack._flume_keys.user_id}/devices/${flumePack._flume_keys.device_id}/query`, queries);
      // let  fRes = await makeFlumePost(`users/${flumePack._flume_keys.user_id}/devices/${flumePack._flume_keys.device_id}/query`, queries);
      let jRes = fRes.json();

      // .then(res => console.log(res.data[0]))
      console.log('queryFLumeByDateRange: results: ', jRes);
      // Object.values(jRes.data[0]).forEach(e => console.log(e));
      return jRes;
      // return res.status(status.success).send(successMessage);
      // return jRes; ///:TODO: return this

      // await makeFlumePost(`users/${flumePack._flume_keys['user_id']}/devices/${flumePack._flume_keys['device_id']}/query`, queries)
      //    .then(res => res.json())
      //    // .then(res => console.log(res.data[0]))
      //    .then(res => console.log(res))
      //    .then(res => Object.values(res.data[0]).forEach(e => console.log(e))) ///:TODO: return this
      //    // .then(res => res.map(e => {
      //    console.log(e)
      // }))
      // .then(res => JSON.parse(res.text))
      // .then(loaded => { console.log('queryFlumeByDate: result', loaded); return loaded })
      // .catch(err => console.error('\n\nqueryFlumeByDate: error' + err));
   } catch(err) {
      console.error('queryFlumeByDateRange: error: ', err);
      throw new Error('queryFlumeByDateRange: Sorry operation failed: ' + err);
   }

}


// excellent example of dealing with returning out the function 
// from a.then() chain
async function flumeStudy(req, res) {
   const url = 'https://api.flumewater.com/oauth/token';
   const options = {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
         grant_type: 'password',
         client_id: env.flume_client,
         client_secret: env.flume_secret,
         username: env.flume_user,
         password: env.flume_pw
      })
   };

   fetch(url, options)
      .then(data => data.json())
      // .then(json => console.log(json))
      .then(parsed => parsed["data"][0]["access_token"])
      .then(access_token => _parse_access_token(access_token))
      // skipping device ID, already have it.
      // .then(fk => _processUserDeviceId(fk.user_id, res))
      .then(json => {
         successMessage.data = json;
         console.log('flumeStudy: about to return: ', json);
         return res.status(status.success).send(successMessage);
         // res.status(status.success).send(successMessage);
         // return json;
      })
      .catch(err => {
         console.error('flumeStudy error: ' + err);
         // errorMessage.error = 'flumeStudy: Error:' + err;
         // return res.status(status.bad).send(errorMessage);
         throw new Error('flumeStudy: ', err);
      });
}

// .then(res => res.json())
//          // .then(parsed => console.log(parsed))
//          .then(parsed => parsed["data"][0]["access_token"])
//          // .then(parsed => console.log(parsed))
//          .then(access_token => this._parse_access_token(access_token))
//          // need to take the decoded from above and get device_id
//          /// using callback to get most recent data
//          .then(keys => this._processUserDeviceId(keys["user_id"], this.queryFlumeByDate))
//          // .then(value => this.queryRecentFlume())
//          .catch(err => console.error('error' + err));

function _parse_access_token(access_token) {
   try {
      flumePack.access_token = access_token;
      if(DEBUG) console.log('_parse_access_token: this.access_token:', flumePack.access_token);
      flumePack._flume_keys.user_id = _getUserId(access_token);
      if(DEBUG) console.log('_parse_access_token: _flume_keys.user_id:', flumePack._flume_keys.user_id);
      flumePack._flume_keys.access_token = access_token;
   } catch(err) {
      console.error('_p_a_t: error: ', err);
      flumePack._error = {
         // status: err.status || 500,
         module: '_parse_access_token',
      };
      throw new error(flumePack._error);
   }
   return flumePack._flume_keys;
}

function _getUserId(res) {
   if(DEBUG) console.log('_getUserId: res:', res);
   //currently a byte string. Need dictionary. chain pile ...
   // let jwt_obj = JSON.parse(String(this._getJWTTokenPayload(res), "utf-8"));
   let jwt_obj = _getJWTTokenPayload(res);

   return jwt_obj.user_id;
}

function _getJWTTokenPayload(token) {
   // 00101110 = '.'
   let decoded = jwt.decode(token);
   if(DEBUG) console.log(`\n\_ngetJWTTokenPayload:\n ${token}  \nconverted to Base64 is: \n`, decoded);
   return decoded;
}

// res is response object
function _processUserDeviceId(userId, res) {
   const url = `https://api.flumewater.com/users/${userId}/devices?user=false&location=false`;
   const options = { method: 'GET', headers: { Accept: 'application/json' } };

   // fetch(url, options)
   //    .then(res => res.json())
   //    .then(json => console.log(json))
   //    .catch(err => console.error('error:' + err));

   flumePack._flume_secrets.device_id = env.flume_device;
   // if(DEBUG) console.log("_processUserDeviceId: using id: ", userId, "\ncb is:", cb);
   // if(typeof cb === 'undefined') {
   // console.log('_processUserDeviceId: In if.');
   //    /// NOTE:???
   makeFlumeRequest(`users/${userId}/devices`)
      //       // .then(text => console.log("\_nprocessUserDeviceId: ", text))
      .then(res => res.json())
      .then(json => json["data"][0]["id"]) //console.log('\n\ndeviceId', json["data"][0]["id"]))
      .then(deviceId => _assignDeviceId(deviceId))
      .then(deviceId => res.send(flumePack._flume_secrets))
      //       // .then(text => console.log("\_nprocessUserDeviceId: ", text))
      //       //(let loaded = text)
      .catch(err => console.error('error' + err));

   return flumePack._flume_secrets.device_id;
   // } else {
   //    console.log('_processUserDeviceId: In else.');
   //    this.makeFlumeRequest(`users/${userId}/devices`)
   //       // .then(text => console.log("\_nprocessUserDeviceId: ", text))
   //       .then(res => res.json())
   //       .then(json => json["data"][0]["id"]) //console.log('\n\ndeviceId', json["data"][0]["id"]))
   //       .then(deviceId => {
   //          this._assignDeviceId(deviceId);
   //          cb(new Date(), this);
   //       })
   //       // .then(text => console.log("\_nprocessUserDeviceId: ", text))
   //       //(let loaded = text)
   //       .catch(err => console.error('error' + err));

   // return deviceId;
   // }



}

/*
       MAKE FLUME REQUEST
       A simple wrapper for flume requests. 
       TODO: have check auth_token to make sure everything
             is still kosher. If not, then refresh & update.
         Takes a RESTful path
         Returns response
    */
function makeFlumeRequest(rest_path, method = "GET", params = undefined) {
   // NOTE: this is a STUB      
   checkToken();
   let url = "https://api.flumewater.com/" + rest_path;
   if(typeof params === 'undefined') {
      if(DEBUG) console.log('makeFlumeReq: making request from ', url);

      return fetch(url, getHeaders(method));
      // return requests.request(method, url, this.getHeaders());
   }
   else {
      // let body = JSON.stringify(params);
      // if (this.DEBUG) console.log('makeFlumeReq: body is: ', body);
      let options = getHeaders(method, params);
      if(DEBUG) console.log('makeFlumeReq: making request from ', url, '\n\t', { options });
      return fetch(url, { data: getHeaders(method) });
      // return fetch(url, { method: method, body: this._getBody(params), data: options, });
      // return requests.request(method, url, data = dumped,
      // headers = this.getHeaders())
   }
}

async function makeFlumePost(rest_path, params) {
   let response = undefined;
   let rUrl = "https://api.flumewater.com/" + rest_path;
   let headersData = _getSimpleHeader();
   // let headersData = getHeaders('POST', bodyData);
   let bodyData = _getBody(params);
   // let bodyData = params;
   let options = {
      method: 'POST',
      body: bodyData,
      headers: headersData
   };

   // options = JSON.stringify(options);
   if(DEBUG) console.log('makeFlumePost: making request from ', rUrl, '\nheaders: ', headersData,
      '\nbody: ', bodyData, '\n\noptions: ', options);
   try {
      // response = await request(options, function (error, res, body) {
      //    if(error) throw new Error(error);
      //    console.log(body);
      //    console.log(res);
      //    return body;
      // });


      return await fetch(rUrl, options);
      // return fetch(rUrl, {
      //    method: 'POST',
      //    body: bodyData,
      //    headers: `'${headersData}'`
      // });
      // console.log('mfR: response: ', response);
   } catch(error) {
      errorMessage.error = 'Sorry You are unauthorized to add usage';
      response = errorMessage;
   }
   // } finally {
   //    return response;
   // }
}

/*
   GET HEADERS
      Takes a dictionary or uses the keys in secrets
      Returns a dictionary of request headers 
*/
function getHeaders(means = undefined, bodyData = undefined) {
   // default header
   // let header = { "Content-Type": "application/json" };
   let body = '';
   if(typeof means === 'undefined') means = 'GET';
   if(typeof bodyData !== 'undefined') {
      body = JSON.stringify(bodyData);
   }
   // let header = { "Accept": "application/json" };
   let header = { "Content-Type": "application/json" };
   // and if we've auth'd
   if(typeof flumePack._flume_keys.access_token !== 'undefined') {
      header["Authorization"] = `Bearer ${flumePack._flume_keys.access_token}`;
   }
   let method = {};
   if(body !== '')
      method = { "method": means, "body": body, "headers": header };
   else
      method = { "method": means, "headers": header };
   // if (this.DEBUG) console.log('getHeaders: returning', method);
   return method;
}

function _getSimpleHeader() {
   let header = { "Content-Type": "application/json" };
   // and if we've auth'd   
   if(typeof flumePack._flume_keys.access_token !== 'undefined') {
      header["Authorization"] = `Bearer ${flumePack._flume_keys.access_token}`;
   }
   // if(typeof flumePack._flume_keys.access_token !== 'undefined') {
   //    header.Authorization = `Bearer ${flumePack._flume_keys.access_token}`;      
   // }
   console.log('_getSimpleHeader: returning header: ', header);
   return header;
}
function _getBody(bodyData) {
   return JSON.stringify(bodyData);
}



/*
   CHECK TOKEN
   Check's auth token for validity, refreshes if needed.
   TODO:
     Returns nothing. Should update member _f_keys
   */
function checkToken() {
   return undefined;
}

function _assignDeviceId(id) {
   flumePack._flume_keys.device_id = id;
   if(DEBUG) console.log('\n\ndeviceId', flumePack._flume_keys.device_id);
   return flumePack._flume_keys.device_id;
}


async function processFlume(req, res) {
   console.log('processFlume: flumePack.access_token: ', flumePack.access_token);
   let count = 0;
   if(flumePack.access_token !== undefined) {
      try {
         // don't send the res object
         let dataArray = await getRange(req);
         // let rArray = dataArray.data;
         console.log(dataArray);         
         dataArray.forEach(r => {
            // flume returns formatted datetime strings
            let eventTime = r.datetime;
            let usageAmount = r.value;                        
            console.log(count++, eventTime, usageAmount);
            try {
               commitFlumeUsage(eventTime, usageAmount);
               console.log('processFlume: committed: ', eventTime, ' for ', usageAmount);
            } catch(err) {
               errorMessage.error = 'processFlume: An error Occured' + err;
               console.error("processFlume: inside error: ", err);
               return res.status(status.error).send(errorMessage);
            } 
         });
         // return res;
      } catch(error) {
         console.error("processFlume: error: ", error);
         errorMessage.error = 'processFlume: An error Occured' + error;
         return res.status(status.error).send(errorMessage);
      } finally {
         successMessage.data = 'Processed ' + count + ' records';
         return res.status(status.created).send(successMessage);
      }
   }
}

// Turns out Las Vegas is 7 hours behind UTC.
function adjustFlumeTimes(unadjustedDate) {
   return date.addHours(unadjustedDate, (flumePack.TIME_ADJUST));
}




export {
   createUsage,
   getUsage,
   getUsageAmount,
   testFlume,
   getRange,
   processFlume
};