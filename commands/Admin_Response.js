const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
var { AsciiTable3, AlignmentEnum } = require("ascii-table3");
let sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminresp")
    .setDescription("(Admin) Custom responses to messages!")
    .setDefaultMemberPermissions(0)
    .addSubcommand((subcommand) =>
      subcommand
      .setName("alist")
      .setDescription("(Admin) List custom responses")
      .addIntegerOption((listnum) =>
        listnum
        .setName('id')
        .setDescription('Input id for more details on a specific response. Leave blank to list all users responses')
      )
      .addUserOption(users=> 
        users
        .setName('user')
        .setDescription('list users specific custom responses'))
    )
    .addSubcommand((subcommand1) =>
      subcommand1
        .setName("acreate")
        .setDescription("(Admin) Create a custom response")
        .addStringOption((name) =>
          name
            .setName("name")
            .setDescription("The name of the custom response")
            .setRequired(true)
            .setMaxLength(25)
        )
        .addStringOption((i_phrase) =>
          i_phrase
            .setName("trigger")
            .setDescription("Trigger Phrase to listen for")
            .setRequired(true)
            .setMaxLength(2000)
        )
        .addStringOption((option1) =>
          option1
            .setName("response")
            .setDescription("The response to be echoed back")
            .setRequired(true)
            .setMaxLength(2000)
        )
        .addChannelOption((option2) =>
          option2
            .setName("channel")
            .setDescription(
              "If it is to be a channel exclusive select the channel, otherwise leave blank"
            )
            .addChannelTypes(ChannelType.GuildText)
        )
        .addBooleanOption(bool =>
          bool
          .setName('priority')
          .setDescription('Select if you want your phrase to take priority over all other responses. Only 1 per trigger word.'))
    )
    .addSubcommand((subcommand3) =>
      subcommand3
        .setName("adelete")
        .setDescription("(Admin) Deletes a custom command")
        .addIntegerOption((option1) =>
          option1
            .setName("id")
            .setDescription(
              "id number of response you want deleted"
            )
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "alist") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
      const guild_id = interaction.guild.id;
      if(interaction.options.getInteger('id')){
        if(interaction.options.getUser('user')){
          const user_id = interaction.options.getUser('user');
          const id = interaction.options.getInteger('id');
          let db = new sqlite3.Database("./Dek-bot.db", (err) => {
            if (err) {
              return console.error(err);
            }
          });
          db.get(
            `SELECT EXISTS (
              SELECT * FROM custom_responses
              WHERE id = ?
              AND user_id = ?)`,
              [id, user_id.id],
              (err,row) =>{
                if(err){
                  console.error(err);
                  return;
                }
                const check = Object.values(row);
                if(check == "1"){
                  db.all(
                    `SELECT * FROM custom_responses
                    WHERE id = ? 
                    AND user_id = ?`,
                    [id, user_id.id],
                    (err,rows) =>{
                      if(err){
                        console.error(err);
                        return;
                      }
                      rows.forEach(row =>{
                        if(row.channel_exclusive == "1"){
                          const i = "yes";
                          var id = BigInt(row.channel_id).toString();
                          interaction.editReply(`ID: ${row.id}\n Name: ${row.name}\n Trigger: ${row.trigger}\n Response: ${row.response}\n Channel Exclusive: ${i}\n Channel: <#${id}>`);
                          console.log(`Channel: <#${id}>`);
                          return;
                        }
                        const j = "no";
                        interaction.editReply(`ID: ${row.id}\n Name: ${row.name}\n Trigger: ${row.trigger}\n Response: ${row.response}\n Channel Exclusive: ${j}`);
                        return;
                      })
                    }
                  )
                }
                else{
                  interaction.editReply("Could not find the response 🫠");
                  return;
                }
              }
          )
        }
        else{
          const id = interaction.options.getInteger('id');
          let db = new sqlite3.Database("./Dek-bot.db", (err) => {
            if (err) {
              return console.error(err);
            }
          });
          db.get(
            `SELECT EXISTS (
              SELECT * FROM custom_responses
              WHERE id = ?)`,
              [id],
              (err,row) =>{
                if(err){
                  console.error(err);
                  return;
                }
                const check = Object.values(row);
                if(check == "1"){
                  db.all(
                    `SELECT custom_responses.id,
                     custom_responses.name,
                     custom_responses.trigger,
                     custom_responses.response,
                     custom_responses.channel_exclusive,
                     custom_responses.channel_id,
                     user.Username 
                     FROM custom_responses
                     JOIN user 
                     ON custom_responses.user_id = user.id
                    WHERE custom_responses.id = ?`,
                    [id],
                    (err,rows) =>{
                      if(err){
                        console.error(err);
                        interaction.editReply("there was an error getting your list 🫠");
                        return;
                      }
                      rows.forEach(row =>{
                        if(row.channel_exclusive == "1"){
                          const i = "yes";
                          interaction.editReply(`ID: ${row.id}\n Username: ${row.Username}\n Name: ${row.name}\n Trigger: ${row.trigger}\n Response: ${row.response}\n Channel Exclusive: ${i}\n Channel: <#${id}>`);
                          return;
                        }
                        const j = "no";
                        interaction.editReply(`ID: ${row.id}\n Username: ${row.Username}\n Name: ${row.name}\n Trigger: ${row.trigger}\n Response: ${row.response}\n Channel Exclusive: ${j}`);
                        return;
                      })
                    }
                  )
                }
                else{
                  interaction.editReply("Could not find the response 🫠");
                  return;
                }
              }
          )
        }
      }
      else{
        if (interaction.options.getUser('user')){
          const user_id = interaction.options.getUser('user');
          var table = new AsciiTable3()
          .setHeading("id", "name", "username")
          .setAlignCenter(3)
          .setStyle("none");
        let db = new sqlite3.Database("./Dek-bot.db", (err) => {
          if (err) {
            return console.error(err);
          }
        });
        db.all(
          `SELECT custom_responses.id,
           custom_responses.name,
           user.Username FROM
           custom_responses
           JOIN user 
           ON custom_responses.user_id = user.id
           WHERE guild_id = ?
           AND user_id = ?`,
          [guild_id, user_id.id],
          (err, rows) => {
            if (err) {
              console.error(err);
              interaction.editReply("there was an error getting your list 🫠");
              return;
            } else if (rows.length == "0") {
              interaction.editReply("This user has no active custom responses 😬");
              return;
            } else {
              rows.forEach((row) => {
                table.addRow(row.id, row.name, row.Username);
              });
              interaction.editReply(table.toString());
              return;
            }
          }
        );
        }
        else{
          var table = new AsciiTable3()
          .setHeading("id", "name", "username")
          .setAlignCenter(3)
          .setStyle("none");
        let db = new sqlite3.Database("./Dek-bot.db", (err) => {
          if (err) {
            return console.error(err);
          }
        });
        db.all(
          `SELECT custom_responses.id,
           custom_responses.name,
           user.Username FROM
           custom_responses
           JOIN user 
           ON custom_responses.user_id = user.id
           WHERE guild_id = ?`,
          [guild_id],
          (err, rows) => {
            if (err) {
              console.error(err);
              interaction.editReply("there was an error getting your list 🫠");
              return;
            } else if (rows.length == "0") {
              interaction.editReply("This server has no active custom responses 😬");
              return;
            } else {
              rows.forEach((row) => {
                table.addRow(row.id, row.name, row.Username);
              });
              interaction.editReply(table.toString());
              return;
            }
          }
        );
        }
      }
      
    } else if (interaction.options.getSubcommand() === "acreate") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
      var name = interaction.options.getString("name");
      const user_id = interaction.user.id;
      var trigger = interaction.options.getString("trigger");
      var response = interaction.options.getString("response");
      const guild_id = interaction.guild.id;
      var primary = 0;
      name = name.replace(/ +/g, " ");
      trigger = trigger.replace(/ +/g, " ").toLowerCase();
      response = response.replace(/ +/g, " ");
      var channel_id;
      var channel_exclusive;
      if (interaction.options.getChannel("channel")) {
        channel_id = interaction.options.getChannel("channel");
        channel_id = channel_id.id;
        channel_exclusive = 1;
      } else {
        channel_id = null;
        channel_exclusive = 0;
      }
      if(interaction.options.getBoolean('priority')){
        primary = 1;
        let db = new sqlite3.Database("./Dek-bot.db", (err) => {
          if (err) {
            return console.error(err);
          }
        });
        db.get(
          `SELECT EXISTS(
            SELECT * FROM custom_responses
            WHERE trigger = ?
            AND response = ?
            AND guild_id = ?
            AND channel_exclusive = ?
            AND channel_id = ?)`,
          [trigger, response, guild_id, channel_exclusive, channel_id],
          (err, rows) => {
            if (err) {
              console.error(err);
              interaction.editReply(
                "there was an error creating your response 🫠"
              );
              return;
            }
            const check = Object.values(rows);
            if (check == "1") {
              interaction.editReply("Sorry this response already exists 🫠");
              return;
            } else {
              db.get(
                `SELECT EXISTS(
                    SELECT * FROM custom_responses
                    WHERE trigger = ?
                    AND response = ?
                    AND guild_id = ?)`,
                [trigger, response, guild_id],
                (err, rows1) => {
                  if (err) {
                    console.error(err);
                    interaction.editReply(
                      "there was an error creating your response 🫠"
                    );
                    return;
                  }
                  const check = Object.values(rows1);
                  if (check == "1") {
                    interaction.editReply("Sorry this response already exists 🫠");
                    return;
                  } else {
                    db.get(
                      `SELECT EXISTS(
                            SELECT * FROM custom_responses
                            WHERE user_id = ?
                            AND name = ?
                            AND guild_id = ?)`,
                      [user_id, name, guild_id],
                      (err, rows2) => {
                        if (err) {
                          console.error(err);
                          interaction.editReply(
                            "there was an error creating your response 🫠"
                          );
                          return;
                        }
                        const check = Object.values(rows2);
                        if (check == "1") {
                          interaction.editReply(
                            "You have already given that name to a response 🤨"
                          );
                          return;
                        }
                        else{
                          db.get(
                            `SELECT EXISTS(
                              SELECT * FROM custom_responses
                              where trigger = ?
                              AND primary_response = ?
                              AND guild_id = ?)`,
                              [trigger, guild_id, primary],
                              (err,rows3) =>{
                                if (err){
                                  console.error(err);
                                  interaction.editReply("there was an error creating your response 🫠");
                                  return;
                                }
                                else{
                                  const check2 = Object.values(rows3);
                                  if(check2 == "1"){
                                    interaction.editReply("There is already a primary response to that trigger 🤨");
                                    return;
                                  }
                                  else{
                                    db.run(
                                      `INSERT INTO custom_responses(
                           name,
                          user_id,
                          trigger,
                          response,
                          guild_id,
                          channel_exclusive,
                          channel_id,
                          primary_response)
                          VALUES(?,?,?,?,?,?,?,?)`,
                                      [
                                        name,
                                        user_id,
                                        trigger,
                                        response,
                                        guild_id,
                                        channel_exclusive,
                                        channel_id,
                                        primary,
                                      ],
                                      (err) => {
                                        if (err) {
                                          console.error(err);
                                          interaction.editReply(
                                            "there was an error creating your response 🫠"
                                          );
                                          return;
                                        }
                                        interaction.editReply(
                                          "looks like everythings good on our end boss, enjoy ya day 🤝🏾"
                                        );
                                        return;
                                      }
                                    );
                                  }
                                }
                              }
                          )
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
      else{
        let db = new sqlite3.Database("./Dek-bot.db", (err) => {
          if (err) {
            return console.error(err);
          }
        });
        db.get(
          `SELECT EXISTS(
            SELECT * FROM custom_responses
            WHERE trigger = ?
            AND response = ?
            AND guild_id = ?
            AND channel_exclusive = ?
            AND channel_id = ?)`,
          [trigger, response, guild_id, channel_exclusive, channel_id],
          (err, rows) => {
            if (err) {
              console.error(err);
              interaction.editReply(
                "there was an error creating your response 🫠"
              );
              return;
            }
            const check = Object.values(rows);
            if (check == "1") {
              interaction.editReply("Sorry this response already exists 🫠");
              return;
            } else {
              db.get(
                `SELECT EXISTS(
                    SELECT * FROM custom_responses
                    WHERE trigger = ?
                    AND response = ?
                    AND guild_id = ?)`,
                [trigger, response, guild_id],
                (err, rows1) => {
                  if (err) {
                    console.error(err);
                    interaction.editReply(
                      "there was an error creating your response 🫠"
                    );
                    return;
                  }
                  const check = Object.values(rows1);
                  if (check == "1") {
                    interaction.editReply("Sorry this response already exists 🫠");
                    return;
                  } else {
                    db.get(
                      `SELECT EXISTS(
                            SELECT * FROM custom_responses
                            WHERE user_id = ?
                            AND name = ?
                            AND guild_id = ?)`,
                      [user_id, name, guild_id],
                      (err, rows2) => {
                        if (err) {
                          console.error(err);
                          interaction.editReply(
                            "there was an error creating your response 🫠"
                          );
                          return;
                        }
                        const check = Object.values(rows2);
                        if (check == "1") {
                          interaction.editReply(
                            "You have already given that name to a response 🤨"
                          );
                          return;
                        }
                        db.run(
                          `INSERT INTO custom_responses(
               name,
              user_id,
              trigger,
              response,
              guild_id,
              channel_exclusive,
              channel_id,
              primary_response)
              VALUES(?,?,?,?,?,?,?,?)`,
                          [
                            name,
                            user_id,
                            trigger,
                            response,
                            guild_id,
                            channel_exclusive,
                            channel_id,
                            primary,
                          ],
                          (err) => {
                            if (err) {
                              console.error(err);
                              interaction.editReply(
                                "there was an error creating your response 🫠"
                              );
                              return;
                            }
                            interaction.editReply(
                              "looks like everythings good on our end boss, enjoy ya day 🤝🏾"
                            );
                            return;
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    } else if (interaction.options.getSubcommand() === "adelete") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
     const guild_id = interaction.guild.id;
	  let db = new sqlite3.Database("./Dek-bot.db", (err) => {
        if (err) {
          return console.error(err);
        }
      });
      if (interaction.options.getInteger("id")) {
        id = interaction.options.getInteger("id");
        db.get(
          `SELECT EXISTS(
					SELECT * FROM custom_responses
					WHERE guild_id = ?
					AND id = ?)`,
          [guild_id, id],
          (err, row) => {
            if (err) {
              console.error(err);
              interaction.editReply(
                "there was an error deleting your response 🫠"
              );
              return;
            }
            const check = Object.values(row);
            if (check == "1") {
              db.run(
                `DELETE FROM custom_responses 
								WHERE guild_id = ?
								AND id =?`,
                [guild_id, id],
                (err) => {
                  if (err) {
                    console.error(err);
                    interaction.editReply(
                      "there was an error deleting your response 🫠"
                    );
                    return;
                  }
                  interaction.editReply("GONE REDUCED TO ATOMS 😱");
                }
              );
            }
            interaction.editReply(
              "cant find the response you wanted to delete 🫠"
            );
          }
        );
      }
	  else{
		db.get(
			`SELECT EXISTS(
				SELECT * FROM custom_responses
				WHERE user_id = ?)`,
				[user_id],
				(err,rows) =>{
					if(err){
						console.error(err);
						interaction.editReply(
						  "there was an error deleting your response 🫠"
						);
						return;
					}
					const check = Object.values(rows);
					if(check =="1"){
						db.run(
							`DELETE FROM custom_responses
							WHERE user_id =?`,
							[user_id],
							(err) =>{
								if(err){
									console.error(err);
									interaction.editReply(
						  		"there was an error deleting your response 🫠"
								);
								return;
								}
								interaction.editReply("NGL you wild asf for that one chief\n But we sent em all to the shadow realm 😈");
								return;
							}
						)
					}
					interaction.editReply("we couldn't find em boss 😞");
				}
		)
	  }
    }
  },
};
