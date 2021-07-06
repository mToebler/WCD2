import dbQuery from '../db/dev/dbQuery.js';
import { successMessage, errorMessage, status } from '../helpers/status.js';

async function commitFlumeUsage(eventTime, usageAmount) {
   const createUsageQuery = `INSERT INTO
         usage (usage_time, usage_amount, unit_id)
	      VALUES(TO_TIMESTAMP($1, 'YYYY-MM-DD HH24:MI:SS'), $2, 1)
	   RETURNING *;`
   const values = [
      eventTime,
      usageAmount      
   ];

   try {
      const { rows } = await dbQuery.query(createUsageQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return successMessage;
      // return res.status(status.created).send(successMessage);
   } catch(error) {
      errorMessage.error = `CommitFlumeEvent: WARNING: Event for ${eventTime} was not added.`;
      return errorMessage;
      // throw (new Error(errorMessage.error));
      // return res.status(status.error).send(errorMessage);
   }

}

export { commitFlumeUsage };
