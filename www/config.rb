http_path = "/"
css_dir = "css"
sass_dir = "scss"
images_dir = "images"
http_generated_images_path = "images"
http_images_path = "/www/images"
asset_cache_buster :none
sass_options = {:debug_info => false}

environment = :production
preferred_syntax = :scss
output_style = :compressed

require 'fileutils'
on_stylesheet_saved do |file|
  if File.exists?(file) && File.basename(file) == "style.css"
    puts "Moving: #{file}"
    FileUtils.mv(file, File.dirname(file) + "/../" + File.basename(file))
  end
end