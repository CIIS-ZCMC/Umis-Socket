const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 1,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

class Connection {
  constructor(name, child) {
    this.name = name;
    this.child = child;
  }

  find(id) {
    const queryString = `SELECT * FROM ${this.name} WHERE id = ${id}`;

    pool.query(queryString, (error, results, fields) => {
      if (error) {
        console.log("Error executing query:", error);
        throw error;
      }

      return this.child.generateInstance(...results[0]);
    });
  }

  where(condition) {
    const queryString = `SELECT * FROM ${this.name} ${condition}`;
    pool.query(queryString, (error, results, fields) => {
      if (error) {
        console.log("Error executing query:", error);
        throw error;
      }

      /**
       * If result is more than 1 then convert the result to collection of
       * child class
       */
      if (results.length > 1) {
        return results.map((result) => this.generateInstance(...result));
      }

      /**
       * If result is equal to 1 then return an instance of a child class
       */
      return this.child.generateInstance(...result[0]);
    });
  }
}

export default Connection;
