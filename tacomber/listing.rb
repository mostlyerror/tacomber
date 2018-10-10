require 'HTTParty'
require 'nokogiri'
require 'pry'
require 'json'

module Tacomber
  module Listing

    def self.fetch(url)
      HTTParty.get url
    end

    def self.fetch_and_parse url
      html = fetch url
      doc = Nokogiri::HTML html
      title = doc.css('span#titletextonly').text&.strip
      subtitle = doc.css('.postingtitletext small').text&.strip
      price = doc.css('.price').text&.strip
      map_node = doc.at_css('#map')
      lat = map_node.attr('data-latitude')&.strip if map_node
      lng = map_node.attr('data-longitude')&.strip if map_node
      post_body_node = doc.css('#postingbody')
      post_body_node.search('.print-information').remove
      post_body = post_body_node.text&.strip
      meta = doc.css('.mapAndAttrs .attrgroup:nth-child(3) span')
        .map(&:text)
        .reduce({}) {|acc, txt|
        k, v = txt.split(': ')
        acc[k&.strip] = v&.strip
        acc
      }.to_json
      [url, title, subtitle, price, lat, lng, post_body, meta]
    end

    def self.headers
      %i[url title subtitle price lat lng post_body meta]
    end

  end
end
