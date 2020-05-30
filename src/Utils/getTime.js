/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

var moment = require("moment");
require("moment-timezone");

module.exports = () => {
  return moment().tz('Asia/Kolkata').format(`DD-MM-YYYY HH:mm:ss zz`);
};