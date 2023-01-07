const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
var { AsciiTable3, AlignmentEnum } = require("ascii-table3");
let sqlite3 = require("sqlite3").verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resp")
    .setDescription("Custom responses to messages!")
    .addSubcommand((subcommand) =>
      subcommand
      .setName("list")
      .setDescription("List custom responses")
      .addIntegerOption((listnum) =>
        listnum
        .setName('id')
        .setDescription('Input id for more details on a specific response. Leave blank to list all')
      )
    )
    .addSubcommand((subcommand1) =>
      subcommand1
        .setName("create")
        .setDescription("Create a custom response")
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
    )
    .addSubcommand((subcommand3) =>
      subcommand3
        .setName("delete")
        .setDescription("Deletes a custom command")
        .addIntegerOption((option1) =>
          option1
            .setName("id")
            .setDescription(
              "id number of response you want deleted, leave blank for Deletion of all"
            )
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "list") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
      const user_id = interaction.user.id;
      if(interaction.options.getInteger('id')){
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
            [id, user_id],
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
                  [id, user_id],
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
        var table = new AsciiTable3()
        .setHeading("id", "name")
        .setAlignCenter(3)
        .setStyle("none");
      let db = new sqlite3.Database("./Dek-bot.db", (err) => {
        if (err) {
          return console.error(err);
        }
      });
      db.all(
        `SELECT id,
				name,
				trigger,
				response,
				channel_exclusive,
				channel_id
				FROM custom_responses
				WHERE user_id = ?`,
        [user_id],
        (err, rows) => {
          if (err) {
            console.error(err);
            interaction.editReply("there was an error getting your list 🫠");
            return;
          } else if (rows.length == "0") {
            interaction.editReply("you have no active custom responses 😬");
            return;
          } else {
            rows.forEach((row) => {
              table.addRow(row.id, row.name);
            });
            interaction.editReply(table.toString());
            return;
          }
        }
      );
      }
      
    } else if (interaction.options.getSubcommand() === "create") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
      var name = interaction.options.getString("name");
      const user_id = interaction.user.id;
      var trigger = interaction.options.getString("trigger");
      var response = interaction.options.getString("response");
      const guild_id = interaction.guild.id;
      const primary = 0;
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
    } else if (interaction.options.getSubcommand() === "delete") {
      await interaction.reply({
        content: "workin' Boss Mane 🕵🏽‍♂️",
        ephemeral: true,
      });
      const user_id = interaction.user.id;
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
					WHERE user_id = ?
					AND id = ?)`,
          [user_id, id],
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
								WHERE user_id = ?
								AND id =?`,
                [user_id, id],
                (err) => {
                  if (err) {
                    console.error(err);
                    interaction.editReply(
                      "there was an error deleting your response 🫠"
                    );
                    return;
                  }
                  interaction.editReply("GONE REDUCED TO ATOMS 😱");
                  return;
                }
              );
            }
            interaction.editReply(
              "cant find the response you wanted to delete 🫠"
            );
            return;
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
          return;
				}
		)
	  }
    }
  },
};
