/** 
 * @author ZYROUGE
 * @license MIT
*/

const Eris = require("eris");

const handleLeveling = async (client, message, GuildDB) => {
    /* Cooldown Checks */
    if(!client.cooldowns.level.get(message.channel.guild.id)) client.cooldowns.level.set(message.channel.guild.id, new Eris.Collection());
    const GuildCooldown = client.cooldowns.level.get(message.channel.guild.id);
    const now = Date.now();
    const GuildCooldownTime = GuildDB.dataValues.expCooldown * 1000;
    if(GuildCooldown.has(message.author.id)) {
        const expirationTime = GuildCooldown.get(message.author.id) + GuildCooldownTime;
        if (now < expirationTime) return;
    }

    /* Real Code */
    const key = {
        userID: message.author.id,
        guildID: message.channel.guild.id
    };
    let MemberDB = await client.database.Member.findOne({ where: key });
    if(!MemberDB) {
        MemberDB = await client.database.Member.create(key);
    }
    MemberDB.dataValues.expPoints = parseInt(MemberDB.dataValues.expPoints);
    MemberDB.dataValues.expLevel = parseInt(MemberDB.dataValues.expLevel);

    MemberDB.dataValues.expPoints += 1;
    const currentLevel = Math.floor((parseInt(GuildDB.dataValues.expThreshold) / 10) * Math.sqrt(MemberDB.dataValues.expPoints));
    
    if(currentLevel !== MemberDB.dataValues.expLevel) {
        MemberDB.dataValues.expLevel = currentLevel;
        MemberDB.dataValues.expPoints = 0;
        let LevelMessage = JSON.stringify(GuildDB.dataValues.expMessage)
            .split("{{user}}").join(`${message.author.mention}`)
            .split("{{level}}").join(`${currentLevel}`);
        LevelMessage = JSON.parse(LevelMessage);
        message.channel.createMessage(LevelMessage);
    }

    client.database.Member.update({
        expPoints: `${MemberDB.dataValues.expPoints}`,
        expLevel: `${MemberDB.dataValues.expLevel}`
    }, { where: key });

    /* Remove Cooldown */
    GuildCooldown.set(message.author.id, now);
    setTimeout(() => GuildCooldown.delete(message.author.id), GuildCooldownTime);
}

module.exports = handleLeveling;