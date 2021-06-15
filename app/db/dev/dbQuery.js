//db/dev/dbQuery.js

import pool from './pool';

export default {
   
  /**
   * Query DB
   * Abstracted instructions to query the database.
   * queryText is the string query.
   * params contain the values for queryText. If no 
   * values/substitutions, it is optional.
   * @param {object} req 
   * @param {object} res
   * @returns {object} object 
   */
   query(queryText, params) {      
    return new Promise((resolve, reject) => {
      pool.query(queryText, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};