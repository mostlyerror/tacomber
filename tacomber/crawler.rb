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
        puts search_url(offset) if DEBUG
        feed = Feedjira::Feed.fetch_and_parse search_url(offset)
      rescue Exception => e
        # TODO: figure out which error to rescue from instead of Exception
        if @last_err
          puts 'Aborting, encountered two errors in a row.'
          puts [@last_err, e] && exit(0)
        else
          @last_err = e
          print 'x'
        end
      end

      unless feed.entries.empty?
        print '.'
        feed.entries.each { |item| @fd.puts item.url }
        get_links(offset+1)
      else
        puts "finished, #{offset+1} pages found"
      end
    ensure
      @fd.close
    end

    # TODO: make me configurable based on search parameters
    # guess we need a SearchParamsBuilder module..
    def search_url offset
      "https://denver.craigslist.org/search/cta?hasPic=1&bundleDuplicates=1&auto_make_model=toyota+tacoma&auto_title_status=1&format=rss&s=#{offset}"
    end
  end
end
