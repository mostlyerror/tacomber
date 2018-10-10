module Tacomber
  module Manifest
    def self.urls
      File.foreach(manifest_filename) do |line|
        yield line.strip
      end
    end

    def self.manifest_filename
      @filename ||= Dir.glob("#{Tacomber.base_dir}/urls/*").sort.last
    end

    def self.size
      `wc -l < #{manifest_filename}`.to_i
    end
  end
end
