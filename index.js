const { Client, GatewayIntentBits } = require(`discord.js`);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });
const { setTimeout } = require('node:timers/promises');
const axios = require(`axios`);
require('dotenv').config();
client.on(`ready`, () => {
  console.log(`Logged in as ${client.user.tag} V:${process.env.version}`);
  rpc();
});
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.mentions.users.has(client.user.id)) {
    await message.reply('Restarting...');
    client.destroy();
    process.exit();
  }
  const channel = message.channel;
  if (!channel) return;
  const topic = channel.topic;
  const msg = message.content;
  if (!topic || !topic.includes('Translate') || msg.includes('*')) return;
  channel.sendTyping();
  if (message.content.match(/[ぁ-んァ-ン]/)) {
    const translation = await translate(message.content, 'ja', 'en');
    const reply = await message.reply(translation);
    reply.react('<:translate:1148387102116040774>');
    reply.react('🇵🇭');
    reply.react('❎');
    return;
  }
  const translation = await translate(message.content, 'en', 'ja');
  const reply = await message.reply(translation);
  reply.react('<:translate:1148387102116040774>');
  reply.react('🇵🇭');
  reply.react('❎');
});

client.on('messageReactionAdd', async (reaction, user) => {
  const msg = reaction.message;
  const emoji = reaction.emoji;
  if (!msg.editable) return;
  if (!msg.author.id == client.user.id) return;
  if (emoji.name == '❎' && reaction.count == 2) {
    msg.delete();
    return;
  }
  if (emoji.id == '1148387102116040774' && reaction.count == 2) {
    if (msg.content.match(/[ぁ-んァ-ン]/)) {
      const tl = await translate(msg, 'ja', 'tl');
      const ja = await translate(msg, 'ja', 'en');
      const re = await translate(ja, 'en', 'ja');
      msg.edit(`\`\`\`${msg.content}\`\`\`\n[**JA->TL**]${tl}\n[**JA->EN**]${ja}\n[**JA->EN->JA**]${re}`);
      await msg.reactions.removeAll();
      msg.react('❎');
      return;
    }
    const tl = await translate(msg, 'en', 'tl');
    const en = await translate(msg, 'en', 'ja');
    const re = await translate(en, 'ja', 'en');
    msg.edit(`\`\`\`${msg.content}\`\`\`\n[**EN->TL**]${tl}\n[**EN->JA**]${en}\n[**EN->JA->EN**]${re}`);
    await msg.reactions.removeAll();
    msg.react('❎');
    return;
  }
  if (emoji.name == '🇵🇭' && reaction.count == 2) {
    const ref = await msg.channel.messages.cache.get(msg.reference.messageId).content;
    const en = await translate(ref, 'tl', 'en');
    const ja = await translate(ref, 'tl', 'ja');
    const re = await translate(ref, 'en', 'tl');
    msg.edit(`\`\`\`${ref}\`\`\`\n[**TL->EN**]${en}\n[**TL->JA**]${ja}\n[**TL->EN->TL**]${re}`);
    await msg.reactions.removeAll();
    msg.react('❎');
    return;
  }
});
client.login(process.env.token);
async function translate(msg, sL, tL) {
  try {
    const response = await axios.get('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sL + '&tl=' + tL + '&dt=t&q=' + encodeURI(msg));
    const data = response.data;
    return data[0][0][0];
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translate Failed(翻訳に失敗しました。)';
  }
}
async function rpc() {
  client.user.setActivity({
    name: `Version: ${process.env.version}!`,
    status: 'idle',
  });
  await setTimeout(30000);
  client.user.setActivity({
    name: `Ping: ${client.ws.ping}ms`,
    status: 'online',
  });
  await setTimeout(30000);
  rpc();
}
