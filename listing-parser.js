const cheerio = require('cheerio')

function isRemoved(dom) {
  return dom('#has_been_removed').length > 0
}

function parseId(url) {
  const fileNameMatch = url.match(/[0-9]+\.html$/i)
  return parseInt(fileNameMatch[0].match(/\d+/))
}

function parsePrice(dom) {
  const text = dom('.price').text()
  if (text.length > 0) return parseInt(text.match(/\d+/))
  return null
}

// best effort of finding mileage based on sidebar metadata OR crude text-search (later)
// TODO: if no luck with meta, try to make sense of user post body?
function parseMileage(meta, dom) {
  const keyMatch = Object.keys(meta)
    .find(str => str.match(/(odometer|mileage|miles)/i))
  if (keyMatch) return parseInt(meta[keyMatch])
  return null
}

// in: cheerio dom obj
// out: array of strings containing "structured" car metadata (sidebar)
function parseMeta(dom) {
  const nodes = dom('p.attrgroup > span')
  const arr =  nodes.map((i, node) => dom(node).text()).toArray()
  if (arr.length === 0) return {}
  const label = arr.shift()

  return arr.reduce((acc, str) => {
    let [key, val] = str.split(': ')
    key = key.split(' ').join('_')
    acc[key] = val
    return acc
  }, { label })
}

// in: html doc, url
// out: carListing object
function parseListing(html, link) {
  const dom = cheerio.load(html, {normalizeWhitespace: true})
  const id = parseId(link)
  const removed = isRemoved(dom)
  if (removed) return { id, link, removed }
  const price =   parsePrice(dom)
  const meta =    parseMeta(dom)
  const mileage = parseMileage(meta, dom)

  return {
    id,
    price,
    link,
    mileage,
    meta,
    removed
  }
}


exports.parse = parseListing
