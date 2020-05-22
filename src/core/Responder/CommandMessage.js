/** 
 * @author ZYROUGE
 * @license MIT
*/

const Channel = require("./Channel");

class Responder extends Channel {
    constructor(message) {
        if(!message) throw new Error("No Message was passed");
        super(message.channel);
        this.message = message;
    }

    async deleteSelf() {
        let DataResult;
        if(this.channel.guild) {
            DataResult = await this.client.database.Guild.findOne({
                where: { guildID: this.channel.guild.id }
            });
        } else {
            DataResult = await this.client.database.User.findOne({
                where: { userID: this.channel.recipient.id }
            });
        }
        const shouldDelete = DataResult && DataResult.dataValues && DataResult.dataValues.delResp ? true : false;
        if(!shouldDelete) return;
ildDB &&ldDB.dataValues && GuildDB.dataValues.delMS ? true : fal(() => {
            message.delete(`Auto-Delete Commands`).catch(() => {});
        }, msDelete);
    }
}

module.exports = Responder;