/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const Channel = require("./Channel");
const CommandMessage = require("./CommandMessage");

function Responder(...args) {
    return new Channel(...args);
}

Responder.CommandMessage = CommandMessage;

module.exports = Responder;