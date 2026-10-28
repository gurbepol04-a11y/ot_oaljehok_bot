import { Telegraf, Markup } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)
const biertjes = new Map()

bot.command('bier', (ctx) => {
  const id = ctx.from.id
  const naam = ctx.from.first_name
  const nu = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
  
  const aantal = (biertjes.get(id)?.aantal || 0) + 1
  biertjes.set(id, { naam, aantal, laatste: nu })
  
  ctx.reply(`🍺 Biertje #${aantal} voor ${naam}!\n🕒 ${nu}`)
})

bot.command('score', (ctx) => {
  if (biertjes.size === 0) return ctx.reply('Nog geen biertjes vandaag.')
  let tekst = '🍺 Score + tijd:\n'
  for (const v of biertjes.values()) {
    tekst += `${v.naam}: ${v.aantal} stuks (laatste: ${v.laatste})\n`
  }
  ctx.reply(tekst)
})

bot.command('muziek', (ctx) => {
  ctx.reply('🎵', Markup.inlineKeyboard([
    [Markup.button.url('Feest', 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd')],
    [Markup.button.callback('BOX AAN', 'box_aan')]
  ]))
})

bot.action('box_aan', (ctx) => {
  ctx.answerCbQuery()
  ctx.reply('🔊 BOX AAN!')
})

bot.command('keet', (ctx) => ctx.reply('🏚️ It Oaljehok ONLINE ✅'))

bot.launch()
