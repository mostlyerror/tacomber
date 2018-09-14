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
 * 4. Linear regression, charts, etc. (filter "bad data points" like 164 miles?)
 * 5. Alerts?
 *
 * TODOS:
 * - make api call async?
 * - get babel transpilation to work
 * - mock a data store
 * - switch out ^mock for a real store
 * - come up with more intelligent method for figuring out odometer
 */
const axios = require('axios')

// const comber = require('./comber') // comber (crawler) can be run separately
const manifest = require('./manifest')
const listingParser = require('./listing-parser')

  manifest.latestUrls()
    .then(links => {
      const url = links[0]
      axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
          'Accept': 'text/html',
        }
      })
      .then(response => response.data)
      .then(html => listingParser.parse(html, url))
      .then(car => console.log(car))
      .catch(console.error)
    })
