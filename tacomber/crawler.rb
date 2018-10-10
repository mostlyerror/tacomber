require 'feedjira'

module Tacomber
  class Crawler
    def self.crawl!
      ts = Time.now.to_s.tr(':', '_').split(' ').join('_')
      puts "Tacomber: starting crawl at #{ts}\n"
      new("./urls/#{ts}.urls").get_links
    ensure
      @fd.close
      puts "done"
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
        @last_err = nil
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

      if (feed.nil? && !@last_err)
        get_links(offset)
      elsif feed.entries && feed.entries.size > 0
        print '.'
        feed.entries.each { |item| @fd.puts item.url }
        get_links(offset + feed.entries.size)
      end
    end

    # TODO: make me configurable based on search parameters
    # guess we need a SearchParamsBuilder module..
    def search_url offset
      "https://denver.craigslist.org/search/cta?hasPic=1&bundleDuplicates=1&auto_make_model=toyota+tacoma&auto_title_status=1&format=rss&s=#{offset}"
    end
  end
end
