require 'feedjira'

module Tacomber
  class Crawler
    def self.crawl!
      ts = Time.now.to_s.tr(':', '_').split(' ').join('_')
      new("./urls/#{ts}.urls").get_links
      puts 'Tacomber: crawling '
    end

    def initialize(urls_file)
      # TODO: I suppose we should take an IO source to write to,
      # instead of assuming it's a file, and writing to it here.
      # Return manifest entries found instead of writing to fs.
      @fd = File.open(urls_file, 'a')
    end

    def get_links offset = 0
      begin
        feed = Feedjira::Feed.fetch_and_parse search_url(offset)
        print '.'
      rescue Exception => e
        # TODO: figure out which error to rescue from instead of Exception
        print 'x'
        if @last_err
          puts 'Aborting, encountered two errors in a row.'
          puts [@last_err, e] && exit(0)
        else
          @last_err = e
        end
      end

      if feed.entries.empty?
        puts "#{offset + 1} pages found" && exit(1)
      end

      feed.entries.each { |item| @fd.puts item.url }
      get_links offset + 1
    ensure
      @fd.close
    end

    # TODO: make me configurable based on search parameters
    # guess we need a SearchParamsBuilder module..
    def search_url offset
      "https://denver.craigslist.org/search/cta?auto_make_model=toyota+tacoma&bundleDuplicates=1&auto_title_status=1&hasPic=1&format=rss&s=#{offset}"
    end
  end
end
