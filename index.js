//console.log(module.paths)

//const path = require('path')
//const querystring = require('querystring')
const { URL, URLSearchParams } = require('url')

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
 */


/* form  url for searching car and truck  listings
 * include relevent meta-filters that will not change, like..
 * bundle duplicates, include nearby areas, etc.
 */
function buildSearchUrl(city, make, model) {
  const urlBase = `https://${city.toLowerCase()}.craigslist.org/search/cta`
  const url = new URL(urlBase)
  const qs = new URLSearchParams({
    auto_make_model: `${make.toLowerCase()} ${model.toLowerCase()}`,
    auto_title_status: 1, // 'clean' title
    format: 'rss',
    bundleDuplicates: 1,
    hasPic: 1
  })
  url.search = qs

  return url;
}

function getVehicles() {
  const city = 'Denver'
  const make = 'Toyota'
  const model = 'Tacoma'
  const searchUrl = buildSearchUrl(city, make, model);
  console.log(searchUrl.toString());
}
  // 2. make an api call
  // 3. store in a "deduplicating" data structure? a map?

getVehicles()
