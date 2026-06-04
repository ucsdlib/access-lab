source "https://rubygems.org"

gem "jekyll", "~> 4.4"

# GitHub Pages compatibility (uncomment to deploy via GitHub Pages)
# gem "github-pages", group: :jekyll_plugins

group :jekyll_plugins do
  # Add Jekyll plugins here as needed
end

# Windows/JRuby compatibility shims (safe to include on macOS too)
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
