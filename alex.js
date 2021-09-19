///Alex Bot - By Gaber Elsayed

bot.on("raw", async event => {
  const eventName = event.t;
  if(eventName === "MESSAGE_REACTION_ADD") {
    
    
      var reactionChannel = bot.channels.get(event.d.channel_id)
      if(reactionChannel.messages.has(event.d.message_id))
            return;
      else {
        reactionChannel.fetchMessage(event.d.message_id)
        .then(msg => {
          var msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id)
          var user = bot.users.get(event.d.user_id)
          bot.emit("messageReactionAdd", msgReaction, user)
             
        }).catch(err => console.log(err))
      }
    
  }
  
  if(eventName === "MESSAGE_REACTION_REMOVE") {

    
    var reactionChannel = bot.channels.get(event.d.channel_id)
    if(reactionChannel.messages.has(event.d.message_id))
            return;
      else {
        reactionChannel.fetchMessage(event.d.message_id)
        .then(msg => {
          var msgReaction = msg.reactions.get(event.d.emoji.name + ":" + event.d.emoji.id)
          var user = bot.users.get(event.d.user_id)
          bot.emit("messageReactionRemove", msgReaction, user)
          
        }).catch(err => console.log(err))
      }
    
    }
  
});



bot.on("messageReactionAdd", (messageReaction, user) => {
            var roleName = messageReaction.emoji.name;
            let message_id = messageReaction.message.id;
            let emoji = db.fetch(`reaction_${message_id}`);
            let emojiFor = (Discord.Util.parseEmoji(roleName));
            let emojiName = emojiFor.name;
            let role_id = db.fetch(`role_${message_id}_${emojiName}`);
  
            if(user.id == "628983756115410966") return;
            // console.log(messageReaction.message.id);
            // console.log(emojiFor.name);
            // console.log(role_id);
  
            if(!role_id) return;
  
            var role = messageReaction.message.guild.roles.find(role => role.id == role_id);
            
            if(role) {
              var member = messageReaction.message.guild.members.find(member => member.id == user.id);
              member.addRole(role.id).catch(error => { throw error})
              .then(r => {
                if(db.fetch(`notify_${messageReaction.message.channel.guild.id}`) == true) try{ user.send("**Success:** *Added ``" + role.name + "`` role.*").catch(err => console.log("Blocked DM!")); }catch(error){console.log("Blocked DM!")}
            });
              }
  
});


bot.on("messageReactionRemove", (messageReaction, user) => {
            var roleName = messageReaction.emoji.name;
            let message_id = messageReaction.message.id;
  
            let emoji = db.fetch(`reaction_${message_id}`);
            let emojiFor = (Discord.Util.parseEmoji(roleName));
            let emojiName = emojiFor.name;
            let role_id = db.fetch(`role_${message_id}_${emojiName}`);
  
            // console.log(messageReaction.message.id);
            // console.log(emojiFor.name);
            // console.log(role_id);
  
            if(!role_id) return;
  
            var role = messageReaction.message.guild.roles.find(role => role.id == role_id);
            
            if(role) {
              var member = messageReaction.message.guild.members.find(member => member.id == user.id);
              member.removeRole(role.id).catch(error => { throw error})
              .then(r => {
                if(db.fetch(`notify_${messageReaction.message.channel.guild.id}`) == true) try{ user.send("**Success:** *Removed ``" + role.name + "`` role.*").catch(err => console.log("Blocked DM!")); }catch(error){console.log("Blocked DM!")}
            });
              }
});


bot.on("message", async message => {
  
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

        let messageArray = message.content.split(" ");
        let command = messageArray[0].toLowerCase();
        let args = messageArray.slice(1);
        var server = bot.guilds.get(message.guild.id).id;

  
  
  
      if(command == `${prefix}create`) {
          
          if(!message.guild.members.get("593000879876079616").hasPermission("MANAGE_ROLES")) return message.channel.send("**Error: My permissions are to low to do that, I need ``MANAGE_ROLES`` permissions!**");
          let botPos = message.guild.members.get("593000879876079616").highestRole.position;
          
                      
          if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Error: **You are not allowed to use this command!**\n*Permission needed:* ``MANAGE_ROLES``");
            
          if(!args[2]) return message.channel.send("**An argument is missing!**\n*Usage:* ``" + prefix + "create <MESSAGE_ID> <EMOJI> <ROLE MENTION/ID>``");
          
          let message_id = args[0];
          let emoji = (Discord.Util.parseEmoji(args[1]));
          let role_id = args[2];
          //let emoji_id = bot.emojis.find(emoji => emoji.name === emoji);
           
          
          let messageReact = await message.channel.fetchMessage(message_id).catch(err => {console.log(err)});
          
          if(role_id.length == 22) role_id = role_id.slice(3, 21);
          
            if(!message.guild.roles.find(r => r.id == role_id)) {
              return message.channel.send("**Error: *Can not find role_id:***\n```> role_id: " + role_id + "```");
            }
            
            let rolePos = message.guild.roles.find(role => role.id === role_id);
            
            if(rolePos.position >= botPos) return message.channel.send("**Error: Role " + rolePos.name + " is an higher role than bot's role.**\nSet the *Bot Role* higher than given role to fix that!");
          
          
          
          if(messageReact) {
            try{
            await messageReact.react(emoji.name);
            }
            catch(error) {
              
              try{
            await messageReact.react(emoji.name + ":" +emoji.id);
            }
              catch(error) {
              return message.channel.send("**Error: *Can not find emoji:***\n```> emoji: " + emoji.name + "```");
              }
            }
            
            

            
            //await db.set(`messageID`, message_id);
            await db.set(`reaction_${message_id}`, emoji.name);
            await db.set(`role_${message_id}_${emoji.name}`, role_id);
            
            // console.log(await db.get(`messageID`));
            // console.log(await db.get(`reaction_${message_id}`));
            // console.log(await db.get(`role_${message_id}_${emoji.name}`));
            
            
            
            
            
            //message.channel.send("**Successfully created Reaction Role:**\n```message_id: " + message_id + "\nemoji: " + emoji.name + "\nrole: " + message.guild.roles.find(r => r.id == role_id).name + "```");
            let messageTo = "(https://discordapp.com/channels/" + server + "/" + message.channel.id + "/" + message_id + ")";
            
            let embed = new Discord.RichEmbed()
            .setDescription("**Successfully Created Reaction Role**")
            .setColor("#CCCCFF")
            .addField("Message ID", "[" + message_id + "]" + messageTo)
            .addField("Emoji", bot.emojis.get(emoji.id) || emoji.name)
            .addField("Role", message.guild.roles.find(r => r.id == role_id));
            
            message.channel.send({embed: embed});
            
            
            
          } else {
            return message.channel.send("**Error: *Can not find message:***\n```> message_id: " + message_id + "```*Note: You must use this command on the channel that the message is!*");
          }
          
          
          
          
          
          
          return;
          
        
      }
  
  if(command == `${prefix}remove`) {
      
      if(!message.guild.members.get("628983756115410966").hasPermission("MANAGE_ROLES")) return message.channel.send("**Error: My permissions are to low to do that, I need ``MANAGE_ROLES`` permissions!**");
      if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Error: **You are not allowed to use this command!**\n*Permission needed:* ``MANAGE_ROLES``");
      
          if(!args[1]) return message.channel.send("**An argument is missing!**\n*Usage:* ``" + prefix + "remove <MESSAGE_ID> <EMOJI>``"); 
      
            let message_id = args[0];
            let emoji = (Discord.Util.parseEmoji(args[1]));
            let role_id = await db.fetch(`role_${message_id}_${emoji.name}`);
      
            if(!role_id) return message.channel.send("**Error: Can not find Reaction Role:**\n```message_id: " + message_id + "\nemoji: " + emoji.name + "```");
      
            await db.delete(`reaction_${message_id}`);
            await db.delete(`reaction_${message_id}`);
            await db.delete(`role_${message_id}_${emoji.name}`);
            
            //return message.channel.send("**Successfully removed Reaction Role:**\n```message_id: " + message_id + "\nemoji: " + emoji.name + "\nrole_id: " + role_id + "```");
       
            let messageTo = "(https://discordapp.com/channels/" + server + "/" + message.channel.id + "/" + message_id + ")";
      
            let embed = new Discord.RichEmbed()
            .setDescription("**Successfully Removed Reaction Role**")
            .setColor("#FF6767")
            .addField("Message ID", "[" + message_id + "]" + messageTo)
            .addField("Emoji", bot.emojis.get(emoji.id) || emoji.name)
            .addField("Role", message.guild.roles.find(r => r.id == role_id));
            
            return message.channel.send({embed: embed});
          
    
  }
  
  
  
  if(command === `${prefix}embed`) {
            if(!message.guild.members.get("628983756115410966").hasPermission("EMBED_LINKS")) return message.channel.send("**Error: My permissions are to low to do that, I need ``EMBED_LINKS`` permissions!**");
            if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Error: **You are not allowed to use this command!**\n*Permission needed:* ``MANAGE_MESSAGES``");
            
            let eFieldInfo = args.join(" ");
            if(!eFieldInfo) return message.channel.send("**Error: Can not create an empty embed body:**\n*Usage:* ``" + prefix + "embed <BODY>``");
            
              let sURL = message.guild.iconURL;

              let embed = new Discord.RichEmbed()
              //.setDescription(eName)
              .setColor('#b18ah1')
              .addField("Reaction Roles", eFieldInfo)




              return message.channel.send({embed: embed});
      }
  
  
  
  
  if(command === `${prefix}notifications` || command === `${prefix}notify`) {
      if(!message.guild.members.get("628983756115410966").hasPermission("EMBED_LINKS")) return message.channel.send("**Error: My permissions are to low to do that, I need ``EMBED_LINKS`` permissions!**");
      if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Error: **You are not allowed to use this command!**\n*Permission needed:* ``MANAGE_ROLES``");
      
      if(!args[0]) args[0] = "null";
      let notify = args[0].toString().toLowerCase();
      
      
      if(notify == "on" || notify == "true") {
        await db.set(`notify_${server}`, true);
        
        
        return message.channel.send("Notifications for *userReactionRoleAdd* in **" + message.guild.name + "** server have been changed to ``true``.");
      }
      
      if(notify == "off" || notify == "false") {
        await db.set(`notify_${server}`, false);
        
        
        
        return message.channel.send("Notifications for *userReactionRoleAdd* in **" + message.guild.name + "** server have been changed to ``false``.");
      }
      
      return message.channel.send("**Error: Notifications can't be *null or empty***.\n*Usage:* ``" + prefix + "notify [ON/OFF]``");
    
    
  }
  
})
