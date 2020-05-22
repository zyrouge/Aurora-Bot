/** 
 * @author ZYROUGE
 * @license MIT
*/

module.exports = async (user) => {
    return user.avatar ? 
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.includes("a_") ? "gif": "png"}` :
        `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 4}.png`
}