/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Client', {
        blacklistedGuilds: Sequelize.JSON,
        blacklistedUsers: Sequelize.JSON
    });
};