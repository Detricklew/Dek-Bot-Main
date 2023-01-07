function WordCount(str) { 
  return str.split(" ").length;
}
let sqlite3 = require("sqlite3").verbose();
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}



async function Load_reactions(message, reactions) {
  let db = new sqlite3.Database("./Dek-bot.db", (err) => {
    if (err) {
      return console.error(err);
    }
  });
  reactions.cache.forEach((reaction) => {
    var emoji = reaction.emoji.name;
    reaction.users.fetch().then((user) => {
      user.forEach((user) => {
        db.get(
          `SELECT EXISTS
          (SELECT * FROM reaction
            WHERE user_id = ?
            AND messages_id = ?
            AND reaction = ?)`,
          [user.id, message, emoji],
          (err, rows) => {
            if (err) {
              console.error(err);
              return;
            }
            let check = Object.values(rows);
            if (check == "1") {
              return;
            } else {
              db.run(
                `INSERT INTO reaction (
                    user_id,
                    messages_id,
                    reaction
                  )
                  VALUES(?, ?, ?)`,
                [user.id, message, emoji],
                (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  return;
                }
              );
            }
          }
        );
      });
    });
  });
}
function Log_messages(message) {
  if (message.author.bot){
    return;
  }
  const Channel_id = message.channelId;
  const User_id = message.author.id;
  const Message = message.content;
  const Guild_id = message.guildId;
  const Message_id = message.id;
  const time = message.createdTimestamp;
  let db = new sqlite3.Database("./Dek-bot.db", (err) => {
    if (err) {
      return console.error(err);
    }
  });
  db.get(
    `SELECT EXISTS
      (SELECT * FROM message
       WHERE id = ?)`,
    [Message_id],
    (err, row) => {
      if (err) {
        return console.error(err);
      }
      let checks = Object.values(row);
      if (checks == "1") {
        return;
      } else {
        db.run(
          `INSERT INTO message (
            user_id,
            content,
            guild_id,
            channel_id,
            timestamp,
            id
          )
          VALUES(?,?,?,?,?,?)`,
          [User_id, Message, Guild_id, Channel_id, time, Message_id],
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
            return;
          }
        );
      }
    }
  );
}

var log = {
  Delete_message: async function (message) {
    const Channel_id = message.channelId;
    const User_id = message.author.id;
    const Message = message.content;
    const Guild_id = message.guildId;
    const Message_id = message.id;
    const time = message.createdTimestamp;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS (SELECT
        * FROM message 
        WHERE id = ?)`,
      [Message_id],
      (err, row) => {
        if (err) {
          return console.error(err);
        }
        let checks = Object.values(row);
        if (checks == "1") {
          db.run(
            `DELETE FROM message 
              WHERE id = ?`,
            [Message_id],
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
              return;
            }
          );
        } else {
          return;
        }
      }
    );
  },
  log_channel: async function (channel) {
    const id = channel.id;
    const guild_id = channel.guildId;
    const name = channel.name;
    const type = channel.type;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS(
        SELECT * FROM channels
        WHERE id = ?
        AND guild_id = ?
        AND name = ?
        AND type = ?)`,
      [id, guild_id, name, type],
      (err, row) => {
        if (err) {
          console.error(err);
          return;
        }
        let check = Object.values(row);
        if (check == "1") {
          return;
        } else {
          db.get(
            `SELECT EXISTS(
                SELECT * FROM channels
                WHERE id = ?
                AND guild_id = ?
                AND type = ?)`,
            [id, guild_id, type],
            (err, rows) => {
              if (err) {
                console.error(err);
                return;
              }
              let checks = Object.values(rows);
              if (checks == "1") {
                db.run(
                  `UPDATE channels
                      SET name = ?
                      WHERE id = ?
                      AND guild_id = ?
                      AND type = ?`,
                  [name, id, guild_id, type],
                  (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    return;
                  }
                );
              } else {
                db.run(
                  `INSERT INTO channels(
                        id,
                        guild_id,
                        name,
                        type)
                        VALUES (?,?,?,?)`,
                  [id, guild_id, name, type],
                  (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    return;
                  }
                );
              }
            }
          );
        }
      }
    );
  },
  log_user: async function (GuildMember) {
    if (GuildMember.user.bot) {
      return;
    }
    const id = GuildMember.user.id;
    const username = GuildMember.user.username;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS(
        SELECT * FROM user
        WHERE id = ?
        AND Username = ?)`,
      [id, username],
      (err, row) => {
        if (err) {
          console.error(err);
          return;
        }
        let check = Object.values(row);
        if (check == "1") {
          return;
        } else {
          db.get(
            `SELECT EXISTS(
                SELECT * FROM user
                WHERE id = ?)`,
            [id],
            (err, rows) => {
              if (err) {
                console.error(err);
              }
              let checks = Object.values(rows);
              if (checks == "1") {
                db.run(
                  `UPDATE user
                      SET Username = ?
                      WHERE id = ?`,
                  [username, id],
                  (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    return;
                  }
                );
              } else {
                db.run(
                  `INSERT INTO user(
                        id,
                        Username)
                        VALUES (?,?)`,
                  [id, username],
                  (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    return;
                  }
                );
              }
            }
          );
        }
      }
    );
  },
  load_users: async function (server) {
    server.members.fetch().then((member) => {
      member.forEach((member) => {
        if (member.user.bot) {
          return;
        }
        const id = member.user.id;
        const username = member.user.username;
        let db = new sqlite3.Database("./Dek-bot.db", (err) => {
          if (err) {
            return console.error(err);
          }
        });
        db.get(
          `SELECT EXISTS(
              SELECT * FROM user
              WHERE id = ?
              AND Username = ?)`,
          [id, username],
          (err, row) => {
            if (err) {
              console.error(err);
              return;
            }
            let check = Object.values(row);
            if (check == "1") {
              return;
            } else {
              db.get(
                `SELECT EXISTS(
                      SELECT * FROM user
                      WHERE id = ?)`,
                [id],
                (err, rows) => {
                  if (err) {
                    console.error(err);
                  }
                  let checks = Object.values(rows);
                  if (checks == "1") {
                    db.run(
                      `UPDATE user
                            SET Username = ?
                            WHERE id = ?`,
                      [username, id],
                      (err) => {
                        if (err) {
                          console.error(err);
                          return;
                        }
                        return;
                      }
                    );
                  } else {
                    db.run(
                      `INSERT INTO user(
                              id,
                              Username)
                              VALUES (?,?)`,
                      [id, username],
                      (err) => {
                        if (err) {
                          console.error(err);
                          return;
                        }
                        return;
                      }
                    );
                  }
                }
              );
            }
          }
        );
      });
    });
  },
  Log_Reaction: async function (user_id, messagereaction) {
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    const messages_id = messagereaction.message.id;
    const reaction = messagereaction.emoji.name;
    db.get(
      `SELECT EXISTS
      (SELECT * FROM reaction
        WHERE user_id = ?
        AND messages_id = ?
        AND reaction = ?)`,
      [user_id, messages_id, reaction],
      (err, rows) => {
        if (err) {
          console.error(err);
          return;
        }
        let check = Object.values(rows);
        if (check == "1") {
          return;
        } else {
          db.run(
            `INSERT INTO reaction (
                user_id,
                messages_id,
                reaction
              )
              VALUES(?, ?, ?)`,
            [user_id, messages_id, reaction],
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
              return;
            }
          );
        }
      }
    );
  },
  Load_Server: async function (server) {
    const guild_id = server.id;
    const guild_name = server.name;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS(
        SELECT * FROM guilds
        WHERE id = ?
        AND name  = ?
        )`,
      [guild_id, guild_name],
      (err, row) => {
        if (err) {
          console.error(err);
        }
        let checks = Object.values(row);
        if (checks == "1") {
          return;
        } else {
          db.get(
            `SELECT EXISTS(
                SELECT * FROM guilds
                WHERE id = ?
                )`,
            [guild_id],
            (err1, row1) => {
              if (err) {
                console.error(err1);
                return;
              } else {
                let check = Object.values(row1);
                if (check == "1") {
                  db.run(
                    `UPDATE guilds
                     SET name = ?
                     WHERE id = ?
                      `,
                    [guild_name, guild_id],
                    (err) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      return;
                    }
                  );
                } else {
                  db.run(
                    `INSERT INTO 
                     guilds (id, name)
                     VALUES (?,?)`,
                    [guild_id, guild_name],
                    (err) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      return;
                    }
                  );
                }
              }
            }
          );
        }
      }
    );
  },
  Load_DB: function () {
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      } else {
        db.run(`CREATE TABLE IF NOT EXISTS "user" (
                    "id"	INTEGER NOT NULL UNIQUE,
                    "Username"	TEXT NOT NULL,
                    PRIMARY KEY("id")
                  )`);
        db.run(`CREATE TABLE IF NOT EXISTS "reaction" (
                    "user_id"	INTEGER NOT NULL,
                    "messages_id"	INTEGER NOT NULL,
                    "reaction"	TEXT NOT NULL,
                    FOREIGN KEY("messages_id") REFERENCES "message"("id"),
                    FOREIGN KEY("user_id") REFERENCES "user"("id")
                  )`);
        db.run(`CREATE TABLE IF NOT EXISTS "message" (
                      "user_id"	INTEGER NOT NULL,
                      "content"	TEXT,
                      "guild_id"	INTEGER NOT NULL,
                      "channel_id"	INTEGER NOT NULL,
                      "timestamp"	INTEGER NOT NULL,
                      "id"	INTEGER NOT NULL,
                      FOREIGN KEY("channel_id") REFERENCES "channels"("id"),
                      PRIMARY KEY("id"),
                      FOREIGN KEY("guild_id") REFERENCES "guilds"("id"),
                      FOREIGN KEY("user_id") REFERENCES "user"("id")
                    )`);
        db.run(`CREATE TABLE IF NOT EXISTS "guilds" (
                      "id"	INTEGER NOT NULL,
                      "name"	TEXT NOT NULL,
                      PRIMARY KEY("id")
                    )`);
        db.run(`CREATE TABLE IF NOT EXISTS "custom_responses" (
                      "id"	INTEGER NOT NULL,
                      "name" TEXT NOT NULL,
                      "user_id"	INTEGER NOT NULL,
                      "trigger"	TEXT NOT NULL,
                      "response"	TEXT NOT NULL,
                      "guild_id"	INTEGER NOT NULL,
                      "channel_exclusive"	INTEGER NOT NULL,
                      "channel_id"	INTEGER,
                      "primary_response" INTEGER NOT NULL,
                      PRIMARY KEY("id" AUTOINCREMENT),
                      FOREIGN KEY("channel_id") REFERENCES "channels"("id"),
                      FOREIGN KEY("user_id") REFERENCES "user"("id"),
                      FOREIGN KEY("guild_id") REFERENCES "guilds"("id")
                    )`);
        db.run(`CREATE TABLE IF NOT EXISTS "channels" (
                      "id"	INTEGER NOT NULL,
                      "guild_id"	INTEGER NOT NULL,
                      "name"	TEXT NOT NULL,
                      "type"  INTEGER NOT NULL,
                      PRIMARY KEY("id")
                    )`);
        console.log("Successfully loaded database 'Dek-bot'");
        return;
      }
    });
  },
  Log_message: async function (message) {
    if(message.author.bot){
      return;
    }
    const Channel_id = message.channelId;
    const User_id = message.author.id;
    const Message = message.content;
    const Guild_id = message.guildId;
    const Message_id = message.id;
    const time = message.createdTimestamp;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS (SELECT
        * FROM message WHERE user_id = ?
         AND content = ?
         AND channel_id = ?
         AND guild_id = ?
         AND id = ?
         AND timestamp = ?)`,
      [User_id, Message, Channel_id, Guild_id, Message_id, time],
      (err, row) => {
        if (err) {
          return console.error(err);
        }
        let checks = Object.values(row);
        if (checks == "1") {
          return;
        } else {
          db.get(
            `SELECT EXISTS(
              SELECT * FROM message
               WHERE id = ?)`,
            [Message_id],
            (err1, row1) => {
              if (err1) {
                console.error(err1);
                return;
              } else {
                let check = Object.values(row1);
                if (check == "1") {
                  db.run(
                    `UPDATE message
                      SET content = ?
                      WHERE id = ?`,
                    [Message, Message_id],
                    (err) => {
                      if (err) {
                        console.error(err);
                        return;
                      }
                      return;
                    }
                  );
                }
                else{
                  db.run(
                    `INSERT INTO message(
                      user_id,
                      content,
                      guild_id,
                      channel_id,
                      id,
                      timestamp)
                      VALUES (?,?,?,?,?,?)`,
                      [User_id, Message, Channel_id, Guild_id, Message_id, time],
                      (err) =>{
                        if (err){
                          console.error(err);
                          return;
                        }
                        return;
                      }
                  )
                }
              }
            }
          );
        }
      }
    );
  },
  Load_Messages: async function (channel_id) {
    const channel = channel_id;
    let messages = [];
    // Create message pointer
    let message = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) =>
        messagePage.size === 1 ? messagePage.at(0) : null
      );

    while (message) {
      await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => messages.push(msg));

          // Update our message pointer to be last message in page of messages
          message =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }

    messages.forEach((message) => {
      Log_messages(message);
      Load_reactions(message.id, message.reactions);
    });
    // Print all messages
  },
  Delete_reaction: async function (message) {
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS
      (SELECT * FROM reaction
        WHERE messages_id = ?)`,
      [message],
      (err, rows) => {
        if (err) {
          console.error(err);
          return;
        }
        let check = Object.values(rows);
        if (check == "1") {
          db.run(
            `DELETE FROM reaction
            WHERE messages_id = ?`,
            [message],
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
              return;
            }
          );
        } else {
          return;
        }
      }
    );
  },
  delete_channel: async function (channel) { 
    const id = channel.id;
    const guild_id = channel.guildId;
    const name = channel.name;
    const type = channel.type;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS(
        SELECT * FROM channels
        WHERE id = ?
        AND guild_id = ?
        AND name = ?
        AND type = ?)`,
      [id, guild_id, name, type],
      (err, row) => {
        if (err) {
          console.error(err);
          return;
        }
        let check = Object.values(row);
        if (check == "1") {
          db.run(
            `DELETE FROM channels
            WHERE id = ?
            AND guild_id = ?
            AND name = ?
            AND type = ?`,
            [id, guild_id, name, type],
            (err) =>{
              if(err){
                console.error(err);
                return;
              }
              return;
            }
          )
        } else {
            return;
        }
      }
    );
  },
  check_responses: async function (message){
    var primary = 0;
    if (message.member.user.bot){
      return;
    }
    const responses = [];
    guild_id = message.guildId;
    content = message.content.replace(/ +/g, " ").toLowerCase();
    const message_array = content.split(" ");
    channel_id = message.channelId;
    let db = new sqlite3.Database("./Dek-bot.db", (err) => {
      if (err) {
        return console.error(err);
      }
    });
    db.get(
      `SELECT EXISTS(
        SELECT * FROM custom_responses
        WHERE guild_id = ?)`,
        [guild_id],
        (err,row) =>{
          if(err){
            console.error(err);
            return;
          }
          const check = Object.values(row);
          if(check == "1"){
            db.all(
              `SELECT  name,
              trigger,
              response,
              channel_id,
              primary_response
              FROM custom_responses
              WHERE guild_id = ?`,
              [guild_id], 
              (err,rows) =>{
                if(err){
                  console.error(err);
                  return;
                }
                rows.forEach(row =>{
                  if (row.channel_id == channel_id || !row.channel_id){
                    if(WordCount(row.trigger) == "1"){
                      message_array.forEach(message =>{
                        if (message == row.trigger){
                          responses.push(row.response);
                          return;
                        }
                      })
                    }
                    else{
                      if(content.includes(row.trigger) && WordCount(row.trigger) != "1"){
                        if (row.primary_response == "1"){
                          message.channel.send(row.response);
                          primary = 1;
                          return;
                        }
                        else{
                          responses.push(row.response);
                        }
                      }
                    }
                  }
                })
                if(responses.length == "0" || primary == "1"){
                  return;
                }
                const i = getRandomInt(0,responses.length);
                message.channel.send(responses.at(i));
                return;
              }
            )
          }
          return;
        }
    )
  }
};
module.exports = log;
