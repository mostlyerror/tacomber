module Tacomber
  def self.base_dir
    @base_dir ||= Dir.pwd
  end
end

require_relative './tacomber/crawler'
require_relative './tacomber/manifest'
require_relative './tacomber/listing'
require_relative './tacomber/comber'
