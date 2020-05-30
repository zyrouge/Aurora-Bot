/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const emojis = require("../Utils/Emojis");

module.exports = {
    consumables: [
        {
            id: 101,
            name: `Energy Pill`,
            emoji: `${emojis.pill}`,
            cost: 1,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 0,
            successInc: 0.1,
            bountyInc: 0,
            resale: false
        },
        {
            id: 102,
            name: `Energizer`,
            emoji: `${emojis.energydrink}`,
            cost: 3,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 0,
            successInc: 0.5,
            bountyInc: 0,
            resale: false
        }
    ],
    ammunation: [
        {
            id: 301,
            name: `Stun Gun`,
            emoji: `${emojis.stungun}`,
            cost: 500,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 0.5,
            bountyInc: 10,
            resale: false
        },
        {
            id: 302,
            name: `Pistol`,
            emoji: `${emojis.pistol}`,
            cost: 1000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 0.75,
            bountyInc: 50,
            resale: 500
        },
        {
            id: 303,
            name: `Shotgun`,
            emoji: `${emojis.shotgun}`,
            cost: 2000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 0.9,
            bountyInc: 100,
            resale: 1100
        },
        {
            id: 304,
            name: `Rifle`,
            emoji: `${emojis.rifle}`,
            cost: 4000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 1,
            bountyInc: 150,
            resale: 2200
        },
        {
            id: 305,
            name: `Sniper`,
            emoji: `${emojis.sniper}`,
            cost: 5500,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 1.5,
            bountyInc: 200,
            resale: 2600
        },
        {
            id: 306,
            name: `Flamethrower`,
            emoji: `${emojis.flamethrower}`,
            cost: 7000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 2,
            bountyInc: 200,
            resale: 4000
        },
        {
            id: 307,
            name: `Machine Gun`,
            emoji: `${emojis.machinegun}`,
            cost: 7000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 1,
            successInc: 2,
            bountyInc: 200,
            resale: 4000
        }
    ],
    pets: [
        {
            id: 201,
            name: `Dog`,
            emoji: `${emojis.dog}`,
            cost: 2000,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 4,
            successInc: 0,
            bountyInc: 0,
            resale: 1500
        },
        {
            id: 202,
            name: `Cat`,
            emoji: `${emojis.cat}`,
            cost: 1500,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 4,
            successInc: 0,
            bountyInc: 0,
            resale: 1000
        },
        {
            id: 203,
            name: `Bug`,
            emoji: `${emojis.bug}`,
            cost: 750,
            gold: false,
            available: true,
            limited: false,
            maxInInv: 4,
            successInc: 0,
            bountyInc: 0,
            resale: 400
        }
    ]
};