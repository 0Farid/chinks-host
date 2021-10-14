const Discord = require("discord.js");

module.exports = {
    name: 'test', 
    description: '',
    args: true, 
    usage: ``, 
    async execute(message, args, client, prefix) {
	
			const finished = new Discord.MessageEmbed()
				//.setAuthor(config.botname, config.pfp)
				.setColor(client.config.normalcolour)
				.setDescription(`Bot working!`)
			message.channel.send({ embeds: [finished] }); 
    },                                     
};
