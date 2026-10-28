Sorry daarvoor, dat was een bug. Hier is het bestand:

*Bestand: `index.js`*

Vervang je hele huidige `index.js` op GitHub hiermee:
import { Telegraf, Markup } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

// teller voor biertjes
const biertjes = new Map()

bot.start((ctx) => ctx.reply(
  `Welkom in It Oaljehok! 🍺\n/bier - bestel\n/score - biertjes teller\n/muziek - muziek\n/keet - status`
))

bot.command('bier', (ctx) => {
  const id = ctx.from.id
  const naam = ctx.from.first_name
  const aantal = (biertjes.get(id)?.aantal || 0) + 1
  biertjes.set(id, { naam, aantal })
  ctx.reply(`🍺 Biertje #${aantal} voor ${naam}! Proost!`)
})

bot.command('score', (ctx) => {
  if (biertjes.size === 0) return ctx.reply('Nog geen biertjes geteld vandaag.')
  let tekst = '🍺 Biertjes vandaag:\n'
  for (const v of biertjes.values()) {
    tekst += `${v.naam}: ${v.aantal}\n`
  }
  ctx.reply(tekst)
})

bot.command('muziek', (ctx) => {
  ctx.reply('🎵 Keet muziek:', Markup.inlineKeyboard([
    [Markup.button.url('Feest Hits', 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd')],
    [Markup.button.url('Zuip Hits', 'https://www.youtube.com/results?search_query=zuip+liederen')],
    [Markup.button.callback('🔊 BOX AAN', 'box_aan')]
  ]))
})

bot.action('box_aan', (ctx) => {
  ctx.answerCbQuery()
  ctx.reply('🔊 BOX AAN!')
})

bot.command('keet', (ctx) => ctx.reply('🏚️ It Oaljehok is ONLINE ✅'))

bot.launch()
console.log('ONLINE 🍺')
1 bestand, alleen `index.js` vervangen, commiten, klaar.
