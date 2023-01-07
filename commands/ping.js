const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('checks if bot is operational'),
	async execute(interaction) {
		await interaction.reply('i am awake sir');
	},
};