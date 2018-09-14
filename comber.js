const { URL, URLSearchParams } = require('url')
const Parser = require('rss-parser')
const fs = require('fs')
const path = require('path')

const PAGE_SIZE = 25

var allItems = []
async function comb(offset = 0) {
  const startTime = new Date()
  var params = {
    city: 'Denver',
    make: 'Toyota',
    model: 'Tacoma',
    offset: offset,
  }
  
  const searchUrl = buildSearchUrl(params).toString()
  const feed = await getFeed(searchUrl)

  if (feed.items && feed.items.length > 0) {
    let sources = feed.items.map(item => item.source)
    allItems = allItems.concat(sources)
    process.stdout.write('.')
    setTimeout(comb, 300, offset += PAGE_SIZE)
  } else {
    console.log(`${allItems.length} total items found`)
    const timeStr = startTime.toISOString()
    const filename = `${timeStr}-${params.city}-${params.make}-${params.model}.json`
    const filepath = path.resolve('data', filename)

    fs.writeFileSync(filepath,
      JSON.stringify(allItems),
      console.error
    )

    console.log("DONE")
  }
}

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

/* retrieve RSS Feed and parse XML */
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

exports.comb = comb;
