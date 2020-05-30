/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');