/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');