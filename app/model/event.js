'use strict'

import dbQuery from '../db/dev/dbQuery';

class Event {
   constructor(zoneId, startTime, stopTime) {
      this.zoneId = zoneId;
      this.startTime = startTime;
      this.stopTime = stopTime;
      this.id = null;
      this.usage = null;
   }

   getEventDuration() {
      return this.stopTime - this.startTime;
   }

   toString() {
      r_str = "Zone ";
      r_str += this.zoneId;
      r_str += "from " + this.startTime;
      r_str += "to " + this.stopTime;
      return r_str;
   }

   static getEventById(id) {
      const getEventQuery = "SELECT * FROM event WHERE id = $1";
      const values = [id];

      try {
         const { rows } = await dbQuery.query(getUsageQuery, values);
         const dbResponse = rows;
      if(!dbResponse[0]) {
         errorMessage.error = 'No reported usage';
         // return res.status(status.notfound).send(errorMessage);
         return null;
      }
         successMessage.data = dbResponse;
         r_event = new Event(dbResponse[0].zone_id, dbResponse[0].start_time, dbResponse[0].stop_time);
         r_event.id = dbResponse[0].id;
         r_event.usage = dbResponse[0].total_usage;
         return r_event;
      // return res.status(status.success).send(successMessage);
      }
      catch(error) {
         errorMessage.error = 'Operation was not successful';
         return res.status(status.error).send(errorMessage);
      }
   }

}

export { Event }