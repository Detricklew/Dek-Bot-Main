# Dek-BOT
#### Video Demo:  <https://youtu.be/avxKdK0niUU>
#### Description:

This is my final project for cs50. In this read me we will go over each file and what it does.

index.js. The starting point, this module logs the client into discord. first the bot checks to see if a database has been made, if not bot makes one itself. The bot then back tracks all messages (up to last 100) then logs them into a sqlite database. the bot then checks for all slash commands(we'll get into that later) and makes sure they are operational. it then checks for certain parameters "events" and executes functions based on said events. there are 8 events that it currently listens for message create, delete, and update, message reaction add, channel delete, channel create and channel update.

Load_disord.js. This is the biggest file in the project with alot of core functions that are the back bones of the project.

    Load_DB loads a sqlite3 Database for use with the client to load users interactions with the discord server
        Here are the databases:
            "user"
                -id (user id of the discord user)
                -Username(Username of the discord user)
                primary id (id)
            "reaction"
                -user_id(references user.id)
                -message_id(references message.id)
                -reaction(the reaction used for the message)
            "message"
                -user_id (references user.id)
                -content (the contents of a discord message (does not include media))
                -guild_id (references guild.id)
                -channel_id(references channel.id)
                -timestamp (the timestamp provided by discord for the message)
            "guilds"
                -id (the guild id)
                -name (the name of the guild)
            "custom_responses"
                -id (the custom id of the response)
                -name (the name of the response (there can be duplicates but not for the same user))
                -user_id(the id of the user who created the response)
                -trigger(the phrase that will be checked for from the user input)
                -response(the phrase that will be emitted if a match is found)
                -guild_id(the id of the guild the phrase was made in)
                -channel_exclusive(whether or not the message will be exclusive to the channel);
                -channel_id(the_channel id of channel if channel exclusive is checked)
                -primary response(if the response will always sent out (can only be one per trigger))
            "channels"
                -id(the id of the channel)
                -guild_id(references guild id)
                -name(the name of the channel)
                -type(the type of channel)

    Load_users: loads users into the database by taking a servers as a data point and sifting through it and loading each user into the database if they are not already there. it makes use of the SELECT EXISTS clause in sqlite.

    Log_Reaction: loads the reaction the user makes on a message, takes user_id and a message reaction object. it opens the database and checks if the reaction is already loaded, if so it exists the application. else it loads it into the database.

    Log_message: loads message into the database, takes a message object, checks if the message already exists, if so exits the application else it logs the message to the database.

    Load_Server: loads each server into the database, takes a server object, checks if the server is aleady logged, if so exits the application else it loads the database into the database;

    Custom_response: This is probably the more meaty part of my functions. it talks to the data base to compare what it has stored to what the user has inputted if they match the bot will send out a response. 
    it uses a discord command to get input from the user. then it asks if the user wants it to be a channel specific response and asks what channel to put it in if true. then when a user types a message into discord chat it takes the chat and runs it across every entry in the database looking for a match if it is a match it adds it to an array. if it is a primary response it send the message and closes the function. if it is not a primary response and they are matches the bot takes the length of the array and puts it into a random number generator the number selected gets input into the array and it sendds out the indexed response. also it checks the channel against any channel exclusive responses

    log_channel: it takes the channel as the argument and loads it into the database checking to be sure that the channels doesnt already exist.

    deploy_commands: sends the discord api the new slash commands so that the user has a good interface to work with

    commands: these are the commands the user can run.
            response: this modules prepares to send the sqlite3 database data from the user it has 3options
                        -list: this sends a request to the db to send a list of all custom responses that were made. it also can take an id argument to give a more detailed description of the response.
                        -create: this takes 4 arguments:
                                    name: the name of the response
                                    trigger: the word or phrase that will trigger a response
                                    response: the word or phrase that will be sent out if a trigger matches
                                    channel: the channel it is to be in if exclusive if blank will mark as null
                        -delete: this calls upon the data base and asks it if a user created response exists if it does it deletes it. it takes one argument, the id of the command. if left blank it deletes all of the entries.
            Ping: this pings the bot to ensure that it is up and operational

            Admin_response: the administrator version of response. it takes the same commands with slight twists
                            -list: this lists all users responses in the server with the ability to index into any users response with the id number of it
                            - create: it has the same parameters of create but with the option of priority response(the only response that will be sent with thee trigger word):
                            -Delete: takes a single argument, the id of any users command, it asks the database based on guild id and the id of the command just to be sure users cant delete ther peoples options

Well that was a short summary of my final project i had a blast taking this very difficult course and cannot wait to impove upon my skills even more.

                        
