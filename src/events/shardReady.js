/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(shardID) {
        const shard = this.client.shards.get(shardID);
        shard.editStatus("online", {
            name: `${this.client.guilds.size} Servers | ${this.client.config.prefix}help | Shard ${shard.id}/${this.client.shards.size}`,
            type: 3
        });
    }
}