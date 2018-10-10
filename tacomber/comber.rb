require 'progressbar'

module Tacomber
  module Comber

    def self.comb!
      lines = Tacomber::Manifest.size
      puts "#{lines} saved urls found"
      time = Time.now
      ts = time.to_s.tr(':', '_').split(' ').join('_')
      puts "Tacomber: combing start at #{time}"
      csv_path = [Tacomber.base_dir, 'data', "#{ts}.csv"].join('/')

      CSV.open(csv_path, 'a+') do |csv|
        csv << Tacomber::Listing.headers
        # start some progress bar here with Tacomber::Manifest.size
        progressbar = ProgressBar.create(
          starting_at: 0, 
          total: Tacomber::Manifest.size,
          throttle_rate: 1
        )

        Tacomber::Manifest.urls do |url|
          begin
            # TODO divide the dataset and spin up some worker to process in parallel
            car = Tacomber::Listing.fetch_and_parse(url)
            csv << car
            progressbar.increment
          rescue Exception => e
            # TODO: what to do ?
          end
        end
      end
    end

  end
end

