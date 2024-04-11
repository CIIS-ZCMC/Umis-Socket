import Connection from require('../models/Connection');

class Biolog extends Connection {
  constructor(
    table = "daily_time_records",
    id,
    dtr_date,
    first_in,
    first_out,
    second_in,
    second_out,
    is_biometric
  ) {
    super(table, this);
    this.id = id;
    this.dtr_date = dtr_date;
    this.first_in = first_in;
    this.first_out = first_out;
    this.second_in = second_in;
    this.second_out = second_out;
    this.is_biometric = is_biometric;
  }

  static generateInstance(data) {
    return new Biolog(
      data.id,
      data.dtr_date,
      data.first_in,
      data.first_out,
      data.second_in,
      data.second_out,
      data.is_biometric
    );
  }
}

export default Biolog;
