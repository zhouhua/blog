username = "zhouhua" # GitHub 用户名
token = "76dae3948a866e74e7bbef90e0cce07cdaf91b63"  # GitHub Token
repo_name = "blog-comments" # 存放 issues
sitemap_url = "http://www.zhouhua.site/sitemap.xml" # sitemap
kind = "Gitalk"

require 'open-uri'
require 'faraday'
require 'active_support'
require 'active_support/core_ext'
require 'sitemap-parser'

sitemap = SitemapParser.new sitemap_url
urls = sitemap.to_a

conn = Faraday.new(:url => "https://api.github.com/repos/#{username}/#{repo_name}/issues") do |conn|
  conn.basic_auth(username, token)
  conn.adapter  Faraday.default_adapter
end

urls.each_with_index do |url, index|
  title = open(url).read.scan(/<title>(.*?)<\/title>/).first
  response = conn.post do |req|
    req.body = { body: url, labels: [kind, url], title: title }.to_json
  end
  puts response.body
  sleep 15 if index % 20 == 0
end
