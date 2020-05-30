/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

module.exports = () => {
    /* String */
    String.prototype.toProperCase = function() {
        return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
    };
    
    String.prototype.toCamelCase = function() {
        return this.replace(/([^\W_]+[^\s-]*) */g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    };
    
    String.prototype.toSnakeCase = function() {
        return this.replace(/\s/g, "_");
    }

    String.prototype.shorten = function(len) {
        return this.length > (len || 200) ? String((this.substr(0, (len || 197))) + "...") : String(this);
    }
    
    /* Array */
    Array.prototype.random = function() {
        return this[Math.floor(Math.random() * this.length)];
    };
    
    /* Eris */
    const Eris = require('eris');
    const Endpoints = require(require("path").resolve("node_modules", "eris", "lib", "rest", "Endpoints"));
    Object.defineProperties(Eris.Client.prototype, {
        fetchUser: {
            value: function(userID) {
              return this.requestHandler.request("GET", Endpoints.USER(userID), true).then((user) => new Eris.User(user, this));
            }
        },
        fetchChannel: {
            value: function(channelID) {
              return this.requestHandler.request("GET", Endpoints.CHANNEL(channelID), true).then((channel) => {
                if (channel.type === 0) {
                  return new Eris.TextChannel(channel, null, this.options.messageLimit);
                } else if (channel.type === 1) {
                  return new Eris.PrivateChannel(channel, this);
                } else if (channel.type === 2) {
                  return new Eris.VoiceChannel(channel, null);
                } else if (channel.type === 3) {
                  return new Eris.GroupChannel(channel, this);
                } else if (channel.type === 4) {
                  return new Eris.CategoryChannel(channel, null);
                } else {
                  return channel;
                }
              });
            }
        },
        fetchGuildEmoji: {
          value: function(guildID, emojiID) {
            return this.requestHandler.request("GET", Endpoints.GUILD_EMOJI(guildID, emojiID), true);
          }
        }
    });
    
    Object.defineProperties(Eris.Member.prototype, {
        isModerator: {
            value: function() {
                return !!(this.permission.has("manageMessages"));
            }
        },
        isAdministrator: {
            value: function() {
                return !!(this.permission.has("administrator"));
            }
        }
    });
};