/** 
 * @author ZYROUGE, Snowflake107
 * @license GPL-3.0
*/

const { Utils } = require("aurora");

module.exports = {
    PREFIX_CHANGE:          (PREFIX) => `Prefix has been changed to \`${PREFIX}\``,
    HELP_DESC:              (PREFIX, COMMANDS, RANDOMCATNUMBER, RANDOMCATNAME) => (
                                `Use \`${PREFIX}help <number>\` for Commands in the **Category**\n` +
                                `For Example, \`${PREFIX}help ${RANDOMCATNUMBER}\` for Commands in **${RANDOMCATNAME.toProperCase()}**\n` +
                                `Total Commands: **${COMMANDS}**`
                            ),
    HELP_MENU:              "Help Menu",
    HELP_CATEGORIES:        "Categories",
    HELP_SUPPORT:           "Support",
    DASHBOARD:              "Dashboard",
    WEBSITE:                "Website",
    TRANSLATION_ERROR:      "Something went wrong in the translation system.",
    GUILD_LANGUAGE:         "Language of this server is English.",
    COMMAND_DISABLED:       (COMMAND) => (`\`${COMMAND}\` Command is **Disabled** in this Server.`),
    MODULE_DISABLED:        (MODULE) => (`\`${MODULE}\` Module is **Disabled** in this Server.`),
    COOLDOWN_WAIT:          (TIMELEFT, COMMAND) => (`Please wait **${TIMELEFT.toFixed(1)} second${TIMELEFT > 1 ? "s" : ""}** before reusing the \`${COMMAND}\` command.`),
    COMMAND_GUILDONLY:      (COMMAND) => (`\`${COMMAND}\` Command can be used only in **Guilds!**`),
    COMMAND_NSFWONLY:       (COMMAND) => (`\`${COMMAND}\` Command can be used only in **NSFW Channels!**`),
    MISSING_PERMISSION_BOT: (PERMISSION) => (`${Utils.emojis.cross} I am missing ${PERMISSION.map(perm => `\`${perm}\``).join(", ")} permission${PERMISSION.length > 1 ? "s" : ""}!`),
    MISSING_PERMISSION_USER:(PERMISSION) => (`${Utils.emojis.cross} You are missing ${PERMISSION.map(perm => `\`${perm}\``).join(", ")} permission${PERMISSION.length > 1 ? "s" : ""}!`),
    SOMETHING_WRONG:        (ERROR) => (`${Utils.emojis.cross} Something went wrong!${ERROR ? `**${ERROR}**` : ""}`),

    /* Numbers */
    "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "0": "0"
};