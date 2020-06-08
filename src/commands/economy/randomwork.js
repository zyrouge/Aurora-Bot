/** 
 * @author ZYROUGE
 * @license GPL-3.0
*/

const { Command } = require("aurora");

class _Command extends Command {
    constructor (client) {
        super(client, {
            name: "randomwork",
            description: "Earn money by doing random Jobs.",
            usage: "",
            guildOnly: true,
            aliases: ["rwork"],
            permission: {
                bot: ["embedLinks"],
                user: []
            },
            enabled: true
        });
    }

    async run(message, args) {
        const responder = new this.client.responder(message.channel);
        const key = { userID: message.author.id };
        let userDB = await this.client.database.User.findOne({ where: key });
        if(!userDB) userDB = await this.client.database.User.create(key);

        /* Work */
        const winProb = Math.floor(Math.random() * 5);
        if(!winProb) return responder.send({
            embed: this.client.utils.embeds.embed(message.author, {
                description: `What a pity! You didn\'t find a Job.`
            })
        });

        const job = this.randomJob();
        responder.send(`You worked as a(n) **${job}**`);
    }

    randomJob() {
        return [
            'Accountant',
            'Actor',
            'Air Steward',
            'Animator',
            'Architect',
            'Assistant',
            'Author',
            'Baker',
            'Biologist',
            'Builder',
            'Butcher',
            'Career Counselor',
            'Caretaker',
            'Chef',
            'Civil Servant',
            'Clerk',
            'Comic Book Writer',
            'Company Director',
            'Computer Programmer',
            'Cook',
            'Decorator',
            'Dentist',
            'Designer',
            'Diplomat',
            'Director',
            'Doctor',
            'Economist',
            'Editor',
            'Electrician',
            'Engineer',
            'Executive',
            'Farmer',
            'Film Director',
            'Fisherman',
            'Fishmonger',
            'Flight Attendant',
            'Garbage Man',
            'Geologist',
            'Hairdresser',
            'Head Teacher',
            'Jeweler',
            'Journalist',
            'Judge',
            'Juggler',
            'Lawyer',
            'Lecturer',
            'Lexicographer',
            'Library Assistant',
            'Magician',
            'Makeup Artist',
            'Manager',
            'Miner',
            'Musician',
            'Nurse',
            'Optician',
            'Painter',
            'Personal Assistant',
            'Photographer',
            'Pilot',
            'Plumber',
            'Police Officer',
            'Politician',
            'Porter',
            'Printer',
            'Prison Officer / Warder',
            'Professional Gambler',
            'Puppeteer',
            'Receptionist',
            'Sailor',
            'Salesperson',
            'Scientist',
            'Secretary',
            'Shop Assistant',
            'Sign Language Interpreter',
            'Singer',
            'Soldier',
            'Solicitor',
            'Surgeon',
            'Tailor',
            'Teacher',
            'Telephone Operator',
            'Telephonist',
            'Translator',
            'Travel Agent',
            'Trucker',
            'Tv Cameraman',
            'Tv Presenter',
            'Vet',
            'Waiter',
            'Web Designer',
            'Writer'
          ].random();
    }
}

module.exports = _Command;