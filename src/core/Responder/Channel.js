/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

class Responder {
    constructor(channel) {
        if(!channel) throw new Error("No Channel was passed");
        this.channel = channel;
        this.client = channel.type == 0 ? channel.guild.shard.client : channel.client; // cuz why not
    }

    async deployDelete(message) {
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
        const msDelete = DataResult && DataResult.dataValues && DataResult.dataValues.delMS ? true : false;
        setTimeout(() => {
            message.delete(`Auto-Delete Commands`).catch(() => {});
        }, msDelete);
    }
    
    send(content, file, shouldDelete = true) {
        return new Promise((resolve, reject) => {
            if(!content) throw new Error("No Content was passed");
            this.channel.createMessage(content, file)
            .then(msg => {
                if(shouldDelete) this.deployDelete(msg).catch(() => {});
                resolve(msg);
            })
            .catch(e => reject(e));
        })
    }
}

module.exports = Responder;