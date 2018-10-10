module Tacomber
  module Manifest
    def self.urls
      find_latest_manifest
      File.foreach(@manifest_filename) do |line|
        yield line.strip
      end
    end

    def self.find_latest_manifest
      @manifest_filename = Dir.glob('../urls/*').sort.last
    end

    def self.size
      `wc -l < #{@manifest_filename}`.to_i
    end
  end
end
