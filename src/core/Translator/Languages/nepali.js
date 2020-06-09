/** 
 * @author Snowflake107
 * @license GPL-3.0
*/

module.exports = {
    PREFIX_CHANGE:          (PREFIX) => `प्रीफिक्स ${PREFIX} मा परिवर्तन भएको छ।`,
    HELP_DESC:              (PREFIX, COMMANDS) => (
                                `कोटिमा रहेका आदेशको प्रयोग गर्न \`${PREFIX}help <संख्या>\` को प्रयोग गर्नुहोला\n`+
                                `उदाहरणका लागि, **Utility** कोटिमा रहेका आदेशका लागि \`${PREFIX}help 13\` प्रयोग गर्नुहोला।\n`+
                                `जम्मा आदेशहरु: **${COMMANDS}**`
                            ),
    HELP_MENU:              "सहयोगी मेनू",
    HELP_CATEGORIES:        "कोटिहरू",
    HELP_SUPPORT:           "सहयोगका लागी",
    DASHBOARD:              "प्रबन्ध कक्ष",
    WEBSITE:                "वेबसाईट",
    TRANSLATION_ERROR:      "भाषा परिवर्तनमा केही समस्या आएको छ।",
    GUILD_LANGUAGE:         "यो संजालको भषा नेपाली हो।",
    MODULE_DISABLED:        (MODULE) => (`मोड्यूल \`${MODULE}\`लाई यो सन्जालमा **अक्षम** गरिएको छ।`),
    COOLDOWN_WAIT:          (TIMELEFT, COMMAND) => (`आदेश \`${COMMAND}\` को फेरि प्रयोग गर्न कृपया **${TIMELEFT.toFixed(1)} सेकेन्ड पर्खनुहोला।`),
    COMMAND_GUILDONLY:      (COMMAND) => (`आदेश \`${COMMAND}\` को प्रयोग **प्रत्यक्ष** सन्जालमा मात्र गर्न मिल्छ।`),
    COMMAND_NSFWONLY:       (COMMAND) => (`यो आदेश \`${COMMAND}\` संबेदनसिल आदेश भएकाले कृपया **NSFW Channel** को प्रयोग गर्नुहोला।`),
    MISSING_PERMISSION_BOT: (PERMISSION) => (`${Utils.emojis.cross} मलाई ${PERMISSION.map(perm => `\`${perm}\``).join(", ")} को आज्ञाँ प्राप्त छैन!`),
    MISSING_PERMISSION_USER:(PERMISSION) => (`${Utils.emojis.cross} तपाईंसङ्ग ${PERMISSION.map(perm => `\`${perm}\``).join(", ")} को आज्ञाँ प्राप्त छैन!`),
    SOMETHING_WRONG:        (ERROR) => (`${Utils.emojis.cross} केही गलत भयो! ${ERROR ? `**${ERROR}**` : ""}`),
    USER_AFK:               (USERNAME, DISCRIM, AFKMSG) => (`**${USERNAME}#${DISCRIM}** अहिले निष्क्रिय हुनुहुन्छ। कारण: **${AFKMSG}**`),
    AFK:                    "निष्क्रिय",
    AFK_LOG_MSG:            (USER, TIME) => (`${USER} - समय ${TIME}`),
    CONTENT:                (MESSAGE) => (`**सन्देश:** ${MESSAGE}`),
    AFK_REMOVED:            (PINGS) => (`${Utils.emojis.tick} तपाईंलाई निष्क्रिय कोटीबाट हटाइएको छ। ${PINGS ? `तपाईंलाई **${PINGS}** पटक बोलाइएको थियो।\n:लगहरू` : ""}`),
    MONTHS:                 ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज", "कात्तिक", "मङ्सिर", "पुष", "माघ", "फागुन", "चैत"]

    /* Numbers */
    "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९", "0": "०"
};
