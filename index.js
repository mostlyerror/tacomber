const { URL, URLSearchParams } = require('url')
const Parser = require('rss-parser')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')

/*
 * Tacomber
 * "Comb" craigslist looking for sick deals on specific car make and model in a specific
 * location, i.e., Toyota Tacomas in Denver (for now).
 *
 * Retrieve RSS feed of vehicles from Craiglist
 *  can use &format=rss to get un-styled data
 *  could be paginated
 * For each item, retrieve details about that item
 *  extract relevant content from the DOM
 *
 * 1. Get all Toyota Tacomas in Denver (50-mi radius || how CL defines Denver)
 * 2. Spit data out in a CSV
 * 3. Automatically populate Google Sheet (or other spreadsheet svc? AirTable?)
 * 4. Linear regression, charts, etc.
 * 5. Alerts?
 *
 *
 * TODOS:
 * - make api call async?
 * - get babel transpilation to work
 * - mock a data store
 * - switch out ^mock for a real store
 */

function extractCarDetail(doc) {}

function buildCsv(carDetails) {}

function getLatestManifestFile() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve('data'), (err, files) => {
      if (err) throw(err)
      const latest = files.sort()[files.length-1]
      resolve(path.resolve('data', latest))
    })
  })
}

function readManifest(manifest) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(manifest), (err, buf) => {
      if (err) throw(err)
      resolve(JSON.parse(buf.toString()))
    })
  })
}

function isRemoved(dom) {
  return dom('#has_been_removed').length > 0
}

function parseId(url) {
  const fileNameMatch = url.match(/[0-9]+\.html$/i)
  return parseInt(fileNameMatch[0].match(/\d+/))
}

function parsePrice(dom) {
  const text = dom('.price').text()
  return parseInt(text.match(/\d+/))
}

// best effort of finding mileage based on sidebar metadata OR crude text-search
// (later)
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
  const $ = cheerio.load(html)
  const id = parseId(link)
  const removed = isRemoved($)
  if (removed) return { id, link, removed }
  const price = parsePrice($)
  const meta = parseMeta($)
  const mileage = parseMileage(meta, $)
  return {
    id,
    price,
    link,
    mileage,
    meta,
    removed
  }
}

function getCarAttrs(links) {
  links.map((url, i) => {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
          'Accept': 'text/html',
        }
      })
        .catch(reject)
        .then(response => response.data) 
        .then(html => parseListing(html, url))
        .then(resolve)
      // ECONNRESET
      // ENOTFOUND
    })
  })
}

(async function main() {
  getLatestManifestFile()
    .then(readManifest)
    .then(getCarAttrs)
    .then(console.log)
    .catch(console.error)
})()

main()
