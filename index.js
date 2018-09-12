const { URL, URLSearchParams } = require('url')
const Parser = require('rss-parser')
const fs = require('fs')
const path = require('path')

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

const PAGE_SIZE = 25
const sort = Array.prototype.sort

/* form url for searching car and truck  listings
 * include relevent meta-filters that will not change, like..
 * bundle duplicates, include nearby areas, etc.
 */
function buildSearchUrl(params) {
  const { city, make, model, offset } = params 
  const urlBase = `https://${city.toLowerCase()}.craigslist.org/search/cta`
  const url = new URL(urlBase)
  const qs = new URLSearchParams({
    auto_make_model: `${make.toLowerCase()} ${model.toLowerCase()}`,
    auto_title_status: 1, // 'clean' title
    bundleDuplicates: 1,
    hasPic: 1,
    format: 'rss',
    s: offset,
  })
  url.search = qs
  return url
}

function getFeed(url) {
  const parser = new Parser({
    customFields: {
      feed: [
        'syn:updateBase',
        'syn:updateFrequency',
        'syn:updatePeriod'
      ],
    }
  })
  return parser.parseURL(url)
}

function getFeedItemId({ source } = item) {
  const pattern = /[0-9]+\.html$/
  const fileNameMatch = source.match(pattern)
  return parseInt(fileNameMatch[0].match(/\d+/))
}

var allItems  = []
function crawl(offset = 0) {
  const startTime = new Date()
  var params = {
    city: 'Denver',
    make: 'Toyota',
    model: 'Tacoma',
    offset: offset,
  }
  
  const searchUrl = buildSearchUrl(params).toString()
  const feed = getFeed(searchUrl)
  if (feed.items && feed.items.length > 0) {
    console.log(`${searchUrl}: ${feed.items.length} items found`)
    let sources = feed.items.map(item => item.source)
    allItems = allItems.concat(sources)
    setTimeout(crawl, 500, offset += PAGE_SIZE)
  } else {
    console.log(`${allItems.length} total items found`)
    const timeStr = startTime.toISOString()
    const filename = `${timeStr}-${params.city}-${params.make}-${params.model}.json`
    const filepath = path.resolve('data', filename)
    fs.writeFileSync(filepath,
      JSON.stringify(allItems),
      (err) => {
        if (err) console.error('oops')
      }
    )
    console.log("DONE")
  }
}

async function getLatestLinks() {
  const files = fs.readdir(path.resolve('data'), (err, files) => {
    if (err) throw(err)
    const filename = files.sort()[files.length-1]
    const filepath = path.resolve('data', filename)

    fs.readFile(filepath, function (err, buf) {
      if (err) throw(err)
      const links = JSON.parse(buf.toString())
      return links
    })
  })
  return files
}


function getLatestManifest() {
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

async function main() {
  const filename = await getLatestManifest()
  const links = await readManifest(filename)
  for (link of links) {
    console.log(link)
  }
}

main()


