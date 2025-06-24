const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GAME_LINK = process.env.GAME_LINK;
const RESTOCK_INTERVAL_MINUTES = 5;

const seedEmojis = {
  "Minnow Seed": "<:Minnow:1386761021427023944>",
  "Goldfish Seed": "<:Goldfish:1386760982889496748>",
  "Shark Seed": "<:Shark:1386761057116360835>",
  "HammerHeadShark Seed": "<:HammerHeadShark:1386761100921671833>",
  "Squid Seed": "<:Squid:1386761146224087101>",
  "BlueWhale Seed": "<:BlueWhale:1386935338999611534>",
};

let lastHash = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

function formatCountdown(ms) {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function buildRestockEmbed(data) {
  const now = Date.now();
  const lines = data.map(seed => {
    const emoji = seedEmojis[seed.name] || "🌱";
    return `${emoji} ${seed.name}: ${seed.amount}`;
  });

  const embed = new EmbedBuilder()
    .setTitle("🔄 Seed Shop Restocked!")
    .setColor(0x30bbe3)
    .setDescription(lines.join("\n"))
    .setFooter({ text: `⏳ Next restock in ${formatCountdown(RESTOCK_INTERVAL_MINUTES * 60 * 1000)}` })
    .setTimestamp();

  return embed;
}

app.post('/stock-update', async (req, res) => {
  const stockData = req.body;

  // basic duplicate prevention
  const hash = JSON.stringify(stockData);
  if (hash === lastHash) return res.sendStatus(200);
  lastHash = hash;

  const embed = buildRestockEmbed(stockData);

  const button = new ButtonBuilder()
    .setLabel("🎮 Join Game")
    .setStyle(ButtonStyle.Link)
    .setURL(GAME_LINK);

  const row = new ActionRowBuilder().addComponents(button);

  const channel = await client.channels.fetch(CHANNEL_ID);
await channel.send({
  content: "<@&1386795957177553007>",
  embeds: [embed],
  components: [row],
  allowedMentions: {
    parse: ['roles'],
  },
});

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Webhook listening on port ${PORT}`));

client.login(TOKEN);
