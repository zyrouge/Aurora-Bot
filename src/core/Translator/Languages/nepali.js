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
    "1":                    "१",
    "2":                    "२",
    "3":                    "३",
    "4":                    "४",
    "5":                    "५",
    "6":                    "६",
    "7":                    "७",
    "8":                    "८",
    "9":                    "९",
    "0":                    "०"
};