const Discord = require("discord.js");
var mongoUtil = require("../../../mongoUtil");
const { nanoid } = require("nanoid");
const mongoose = require('mongoose');


module.exports = {
    name: 'user', 
    description: '',
    args: true, 
    usage: ``, 
    async execute(message, args, client, prefix) {
    command = args[0]

			if(!args[0]){
        const helpEmbed = new Discord.MessageEmbed()
          .setColor(client.config.normalcolour)
          .setTitle("User commands")
          .addField(`${prefix}user info`, "Gets A Users Info")
          .addField(`${prefix}user list`, "List All The Devs.games Users")

        message.reply({ embeds: [helpEmbed] }); 
      }
      else{
        if (command === 'info') {
          if(!args[1]){
            var user = "kashdami"
          }
          else {
            var user = args[1]
          }
          let UserModel = await mongoUtil.getUserModel().findOne({ username: user })
          if(UserModel === null) return; //its just not gonna respond smh
          console.log(UserModel)
          const creating = new Discord.MessageEmbed()
            .setColor(client.config.normalcolour)
            .setDescription(`⏳ Finding User...`)
          message.reply({ embeds: [creating] }).then(m =>{


            const created = new Discord.MessageEmbed()
              .setColor(client.config.normalcolour)
              .setTitle("User Found!")
              .setDescription(`**User:** ${user}\n**Uid:** ${UserModel.id}\n**Date Made** ${UserModel.created}`)
              .setTimestamp(message.createdAt)
            m.edit({ embeds: [created] })



          }) 
        }
        else if(command === 'list'){
        let userppl = await mongoUtil.getUserModel()

        let idek = await userppl.find();
        let kekmaArray = [];

        idek.forEach(e => {
            kekmaArray.push('`' + e.username + '`');
        });

        const abcyay = new Discord.MessageEmbed()
	      .setColor(client.config.normalcolour)
        .setTitle(`Users List`)
        .setDescription(kekmaArray.join(`\n `))
        console.log(kekmaArray)
        message.reply({ embeds: [abcyay] })

        }
      }

    },                                     
};
