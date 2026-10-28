import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welkom in It Oaljehok! 🍺\n\nCommands:\n/bier - bestel een biertje\n/keet - wie is er?\n/muziek - zet muziek aan\n/hulp - alle commands'))

bot.command('bier', (ctx) => ctx.reply(`🍺 Biertje voor ${ctx.from.first_name}! Proost!`))
bot.command('keet', (ctx) => ctx.reply('It Oaljehok is OPEN! 🔥 Wie komt er?'))
bot.command('muziek', (ctx) => ctx.reply('🎵 Muziek staat aan! Wat moet er gedraaid worden?'))
bot.command('hulp', (ctx) => ctx.reply('/bier /keet /muziek /hulp'))

bot.on('text', (ctx) => {
  const txt = ctx.message.text.toLowerCase()
  if(txt.includes('bier')) ctx.reply('Bier?! Ik ben erbij! 🍻')
  if(txt.includes('open')) ctx.reply('KEET IS OPEN!')
})

bot.launch()
console.log('It Oaljehok bot is ONLINE!')
