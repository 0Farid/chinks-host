const Discord = require("discord.js");
var mongoUtil = require("../../../mongoUtil");
const { nanoid } = require("nanoid");

module.exports = {
    name: 'invite', 
    description: '',
    args: true, 
    usage: ``, 
    async execute(message, args, client, prefix) {
      

			if(!args[0]){
        const helpEmbed = new Discord.MessageEmbed()
          .setColor(client.config.normalcolour)
          .setTitle("Invite commands")
          .addField(`${prefix}invite create`, "Assigns an invite to a user.")
          .addField(`${prefix}invite delete`, "Deletes an invite.")
          .addField(`${prefix}invite list`, "Lists invites.")
          .addField(`${prefix}invite wave`, "Assigns an invite to every user.")

        message.reply({ embeds: [helpEmbed] }); 
      }
      command = args[0]

      if (message.author.id != client.config.ownerID){
         const noPerms = new Discord.MessageEmbed()
					.setColor(client.config.errorcolour)
					.setTitle("🚫 You are missing permissions!")
					.setDescription(`This command requires \`BOT_OWNER\``)
        message.reply({ embeds: [noPerms] })
      }
      else{
        if (command === 'create') {
          if(!args[1]){
            var user = "kashdami"
          }
          else {
            var user = args[1]
          }
          console.log(user)
          const creating = new Discord.MessageEmbed()
            .setColor(client.config.normalcolour)
            .setDescription(`⏳ Creating invite...`)
          const lmao = new Discord.MessageEmbed()
            .setColor(client.config.normalcolour)
            .setTitle("Invite created!")
            .setDescription(`Tell <@${client.config.ownerID}> To Check Their Dms Or If You Are The User Login Into Your Account And CHeck there `)
          message.channel.send({embeds: [lmao]})
          client.users.cache.get(client.config.ownerID).send({ embeds: [creating] }).then(m =>{
            var invite = `DEVS-${randomstr(4)}-${randomstr(4)}-${randomstr(4)}`
            mongoUtil.getInviteModel().create({ 
              invite: invite, 
              user: user, 
              created: Date.now()
            });
            const created = new Discord.MessageEmbed()
              .setColor(client.config.normalcolour)
              .setTitle("Invite created!")
              .setDescription(`**User:** ${user}\n**Staff:** ${message.author}\n**Invite** ||${invite}||`)
              .setTimestamp(message.createdAt)
            m.edit({ embeds: [created] })
          }) 
        }
        else if(command === 'delete'){
          if(!args[1]){
            message.reply("tf am i supposed to delete you stupid fucking bitch")
          }
          else {
            var invite = args[1]

            const deleting = new Discord.MessageEmbed()
            .setColor(client.config.normalcolour)
            .setDescription(`⏳ Deleting invite...`)
            message.reply({ embeds: [deleting] }).then(m =>{
              mongoUtil.getInviteModel().findOneAndDelete({ invite: invite }).then(deletedinvite =>{
                if(!deletedinvite) {
                  const noInvite = new Discord.MessageEmbed()
                    .setColor(client.config.errorcolour)
                    .setTitle("🚫 Error whilst deleting invite")
                    .setDescription(`The invite ${invite} does not exist in the database.`)
                   message.reply({ embeds: [noInvite] })
                }

                const deleted = new Discord.MessageEmbed()
                  .setColor(client.config.normalcolour)
                  .setTitle("Invite deleted!")
                  .setDescription(`**Invite:** ${deletedinvite.invite}\n**User:** ${deletedinvite.user}\n**Staff:** ${message.author}`)
                  .setTimestamp(message.createdAt)
                m.edit({ embeds: [deleted] })
              })
            }) 
          }
        }
        else if(command === 'list'){
          let inviteModel = await mongoUtil.getInviteModel()

          let inviteskek = await inviteModel.find();
          let inviteskekArray = [];

          inviteskek.forEach(e => {
              inviteskekArray.push('`' + e.invite + '`');
          });
          const abcyay = new Discord.MessageEmbed()
	        .setColor(client.config.normalcolour)
          .setTitle(`Invite List`)
          .setDescription(inviteskekArray.join(`\n `))
          message.reply({ embeds: [abcyay] })

        }
        else if(command === 'wave' || command === 'mass'){
          const creating = new Discord.MessageEmbed()
            .setColor(client.config.normalcolour)
            .setDescription(`⏳ Sending out an invite wave...`)
          message.reply({ embeds: [creating] }).then(m =>{
            mongoUtil.getUserModel().find({} , (err, users) => {
                users.map(user => {
                  var invite = `CHNK-${randomstr(4)}-${randomstr(4)}-${randomstr(4)}`
                  mongoUtil.getInviteModel().create({ 
                    invite: invite, 
                    user: user.username, 
                    created: Date.now()
                  });
                })
            })
            const created = new Discord.MessageEmbed()
              .setColor(client.config.normalcolour)
              .setTitle("Invite wave sent!")
              .setDescription(`**Staff:** ${message.author}`)
              .setTimestamp(message.createdAt)
            m.edit({ embeds: [created] })
          }) 
        }
      }

      function randomstr(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() *        charactersLength));
        }
        return result;
      }

    },                                     
};
