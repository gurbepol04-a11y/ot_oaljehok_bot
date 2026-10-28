import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)
const PRIJS = 0.75

let verbruik = {} // { Jan: { items: {bier:2}, history: [{drank, datum, door}] } }
let stock = {} // { bier: 24, cola: 12 }

function nuDatum() {
  return new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
}
function totaalPrijs(items) {
  const tot = Object.values(items).reduce((a,b)=>a+b,0)
  return `€${(tot*PRIJS).toFixed(2).replace('.',',')}`
}

bot.on('text', async (ctx) => {
  const tekst = ctx.message.text.toLowerCase().trim()
  const naam = ctx.from.first_name
  const datum = nuDatum()

  // 1. BIJVULLEN - bijvullen 24 bier / bijvullen 10 ice tea
  const bij = tekst.match(/^bijvullen (\d+) (.+)$/)
  if (bij) {
    const aantal = parseInt(bij[1])
    const drank = bij[2].trim()
    stock[drank] = (stock[drank]||0) + aantal
    return ctx.reply(`📦 Bijgevuld: ${aantal}x ${drank}\nNu in koelkast: ${stock[drank]}x ${drank}\n📅 ${datum}`)
  }

  // 2. DRINKEN - een bier / een ice tea voor jan
  const m = tekst.match(/^(?:een|eentje|1) (.+?)(?: voor (.+))?$/)
  if (m) {
    let drank = m[1].trim()
    // stop als het "bijvullen" was, die hebben we al gehad
    if (drank.startsWith('bijvullen')) return
    
    let doelNaam = naam
    if (m[2]) {
      doelNaam = m[2].trim()
      doelNaam = doelNaam.charAt(0).toUpperCase() + doelNaam.slice(1)
    }

    if (!verbruik[doelNaam]) verbruik[doelNaam] = { items: {}, history: [] }
    verbruik[doelNaam].items[drank] = (verbruik[doelNaam].items[drank]||0)+1
    verbruik[doelNaam].history.push({ drank, datum, door: naam })

    if (stock[drank] && stock[drank] > 0) stock[drank]--

    const tot = Object.values(verbruik[doelNaam].items).reduce((a,b)=>a+b,0)
    const nog = stock[drank] ?? 0

    if (doelNaam === naam) {
      return ctx.reply(`✅ ${doelNaam} - ${drank} +1\n📅 ${datum}\nTotaal jou: ${tot}x = ${totaalPrijs(verbruik[doelNaam].items)}\nNog in koelkast: ${nog}x`)
    } else {
      return ctx.reply(`✅ ${naam} zet 1x ${drank} op ${doelNaam}\n📅 ${datum}\n${doelNaam} totaal: ${tot}x\nNog in koelkast: ${nog}x`)
    }
  }

  // 3. COMMANDS MET ! zo als vroeger
  if (tekst === '!voorraad' || tekst === '/voorraad') {
    let out = `📋 VOORRAAD It Oaljehok\n📅 ${datum}\n\nKOELKAST:\n`
    if (!Object.keys(stock).length) out += `Leeg\n`
    else for (let [k,v] of Object.entries(stock)) out += `${k}: ${v}x\n`
    out += `\nVERBRUIK:\n`
    if (!Object.keys(verbruik).length) out += `Nog niks`
    else for (let [p,d] of Object.entries(verbruik)) out += `${p}: ${Object.entries(d.items).map(([k,v])=>`${k} ${v}x`).join(', ')} = ${totaalPrijs(d.items)}\n`
    return ctx.reply(out)
  }

  if (tekst === 'mijn lijst' || tekst === '/mijnlijst') {
    const d = verbruik[naam]
    if (!d) return ctx.reply(`${naam} niks gedronken\n📅 ${datum}`)
    return ctx.reply(`${naam}: ${Object.entries(d.items).map(([k,v])=>`${k} ${v}x`).join(', ')} = ${totaalPrijs(d.items)}\n📅 ${datum}`)
  }

  if (tekst === '!export' || tekst === '/export') {
    if (!Object.keys(verbruik).length) return ctx.reply(`Niks te exporteren\n📅 ${datum}`)
    let csv = 'Datum;Naam;Drank;Prijs;Door;Koelkast_Nog\n'
    for (let [persoon, data] of Object.entries(verbruik)) {
      for (let h of data.history) {
        csv += `${h.datum};${persoon};${h.drank};${h.prijs ?? PRIJS};${h.door};${stock[h.drank] ?? 0}\n`
      }
    }
    return ctx.reply(`📊 EXPORT It Oaljehok\n📅 ${datum}\n\n${csv}`)
  }

  if (tekst === 'afrekenen' || tekst === '!afrekenen' || tekst === '/afrekenen') {
    if (!Object.keys(verbruik).length) return ctx.reply(`Niks af te rekenen\n📅 ${datum}`)
    let out = `💰 AFREKENEN €0,75/stuk\n📅 ${datum}\n\n`
    for (let [p,d] of Object.entries(verbruik)) out += `${p}: ${totaalPrijs(d.items)}\n`
    verbruik = {}
    return ctx.reply(out + `\nVerbruik gerest op 0. Koelkast blijft staan.`)
  }

  if (tekst === '!reset' || tekst === '/reset') {
    verbruik = {}
    stock = {}
    return ctx.reply(`⚠️ RESET door ${naam}\n📅 ${datum}\nAlles op 0`)
  }
})

bot.command('keet', (ctx) => ctx.reply('🏚️ It Oaljehok ONLINE ✅\n📅 ' + nuDatum()))
bot.launch()
console.log('BOT ONLINE')
