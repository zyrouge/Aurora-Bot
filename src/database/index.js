/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Sequelize } = require("sequelize");
const path = require("path");

/* Sequelize Client */
const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.resolve("storage", "database.sqlite"),
    logging: false
});

/* Import Models */
const Guild = sequelize.import(`models/Guild`);
const Member = sequelize.import(`models/Member`);
const ModCase = sequelize.import(`models/ModCase`);
const ReactionRole = sequelize.import(`models/ReactionRole`);
const Role = sequelize.import(`models/Role`);
const Settings = sequelize.import(`models/Settings`);
const TextChannel = sequelize.import(`models/TextChannel`);
const User = sequelize.import(`models/User`);

module.exports = { Guild, Member, ModCase,  ReactionRole, Role, Settings, TextChannel, User };