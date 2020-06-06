/** 
 * @author ZYROUGE, Snowflake107
 * @license GPL-3.0
*/

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
    "1":                    "1",
    "2":                    "2",
    "3":                    "3",
    "4":                    "4",
    "5":                    "5",
    "6":                    "6",
    "7":                    "7",
    "8":                    "8",
    "9":                    "9",
    "0":                    "0"
};