/** 
 * @author ZYROUGE
 * @license MIT
*/

'use strict';

// const reactions = await ReactionHandler.collectReactions(message, (userID) => userID === message.author.id, { maxMatches: 5, time: 60000 });

const EventEmitter = require('events').EventEmitter;

class ReactionHandler extends EventEmitter {
    constructor(message, filter, permanent = false, options = {}) {
        super();

        this.client     = (message.channel.guild) ? message.channel.guild.shard.client : message.channel._client;
        this.filter     = filter;
        this.message    = message;
        this.options    = options;
        this.permanent  = permanent;
        this.ended      = false;
        this.collected  = [];
        this.listener   = (msg, emoji, userID) => this.checkPreConditions(msg, emoji, userID);

        this.client.on('messageReactionAdd', this.listener);

        if (options.time) {
            setTimeout(() => this.stopListening('time'), options.time);
        }
    }

    checkPreConditions(msg, emoji, userID) {
        if (this.message.id !== msg.id) {
            return false;
        }

        if (this.filter(userID)) {
            this.collected.push({ msg, emoji, userID });
            this.emit('reacted', { msg, emoji, userID });

            if (this.collected.length >= this.options.maxMatches) {
                this.stopListening('maxMatches');
                return true;
            }
        }

        return false;
    }

    stopListening (reason) {
        if (this.ended) {
            return;
        }

        this.ended = true;

        if (!this.permanent) {
            this.client.removeListener('messageReactionAdd', this.listener);
        }
        
        this.emit('end', this.collected, reason);
    }
}

module.exports = {
    continuousReactionStream: ReactionHandler,
    collectReactions: (message, filter, options) => {
        const bulkCollector = new ReactionHandler(message, filter, false, options);

        return new Promise((resolve) => {
            bulkCollector.on('end', resolve);
        });
    }
};