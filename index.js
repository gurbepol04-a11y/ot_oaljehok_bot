import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)
const PRIJS = 0.75
let verbruik = {}
let stock = {}

function nuDatum() { return new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' }) }
function totaalPrijs(items) { const tot = Object.values(items).reduce((a,b)=>a+b,0); return `€${(tot*PRIJS).toFixed(2).replace('.',',')}` }

// --- FIX VOOR 409 ---
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
// delete oude webhook, force polling
await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(()=>{})

bot.on('text', async (ctx) => {
  const tekst = ctx.message.text.toLowerCase().trim()
  const naam = ctx.from.first_name
  const datum = nuDatum()

  const bij = tekst.match(/^bijvullen (\d+) (.+)$/)
  if (bij) {
    const aantal = parseInt(bij[1]); const drank = bij[2].trim()
    stock[drank] = (stock[drank]||0) + aantal
    return ctx.reply(`📦 Bijgevuld: ${aantal}x ${drank}\nNu: ${stock[drank]}x\n📅 ${datum}`)
  }

  const m = tekst.match(/^(?:een|eentje|1) (.+?)(?: voor (.+))?$/)
  if (m) {
    let drank = m[1].trim(); if (drank.startsWith('bijvullen')) return
    let doelNaam = naam
    if (m[2]) { doelNaam = m[2].trim(); doelNaam = doelNaam.charAt(0).toUpperCase() + doelNaam.slice(1) }
    if (!verbruik[doelNaam]) verbruik[doelNaam] = { items: {}, history: [] }
    verbruik[doelNaam].items[drank] = (verbruik[doelNaam].items[drank]||0)+1
    verbruik[doelNaam].history.push({ drank, datum, door: naam })
    if (stock[drank] && stock[drank] > 0) stock[drank]--
    const tot = Object.values(verbruik[doelNaam].items).reduce((a,b)=>a+b,0)
    return ctx.reply(`✅ ${doelNaam} - ${drank} +1\nTotaal: ${tot}x = ${totaalPrijs(verbruik[doelNaam].items)}\nNog: ${stock[drank] ?? 0}x\n📅 ${datum}`)
  }

  if (tekst === '!voorraad' || tekst === '/voorraad') {
    let out = `📋 VOORRAAD It Oaljehok\n📅 ${datum}\n\nKOELKAST:\n`
    if (!Object.keys(stock).length) out += `Leeg\n`; else for (let [k,v] of Object.entries(stock)) out += `${k}: ${v}x\n`
    out += `\nVERBRUIK:\n`; if (!Object.keys(verbruik).length) out += `Nog niks`; else for (let [p,d] of Object.entries(verbruik)) out += `${p}: ${Object.entries(d.items).map(([k,v])=>`${k} ${v}x`).join(', ')} = ${totaalPrijs(d.items)}\n`
    return ctx.reply(out)
  }
  if (tekst === 'mijn lijst' || tekst === '/mijnlijst') {
    const d = verbruik[naam]; if (!d) return ctx.reply(`${naam} niks\n📅 ${datum}`)
    return ctx.reply(`${naam}: ${Object.entries(d.items).map(([k,v])=>`${k} ${v}x`).join(', ')} = ${totaalPrijs(d.items)}`)
  }
  if (tekst === '!export' || tekst === '/export') {
    if (!Object.keys(verbruik).length) return ctx.reply(`Niks\n📅 ${datum}`)
    let csv = 'Datum;Naam;Drank;Door\n'; for (let [p,data] of Object.entries(verbruik)) for (let h of data.history) csv += `${h.datum};${p};${h.drank};${h.door}\n`
    return ctx.reply(`📊 EXPORT\n📅 ${datum}\n\n${csv}`)
  }
  if (tekst === 'afrekenen' || tekst === '!afrekenen' || tekst === '/afrekenen') {
    if (!Object.keys(verbruik).length) return ctx.reply(`Niks\n📅 ${datum}`)
    let out = `💰 AFREKENEN €0,75\n📅 ${datum}\n\n`; for (let [p,d] of Object.entries(verbruik)) out += `${p}: ${totaalPrijs(d.items)}\n`
    verbruik = {}; return ctx.reply(out + `\nGerest.`)
  }
  if (tekst === '!reset' || tekst === '/reset') { verbruik={}; stock={}; return ctx.reply(`⚠️ RESET\n📅 ${datum}`) }
})

bot.command('keet', (ctx) => ctx.reply('🏚️ It Oaljehok ONLINE ✅\n📅 ' + nuDatum()))

// Launch met drop pending
bot.launch({ dropPendingUpdates: true })
console.log('BOT ONLINE')
