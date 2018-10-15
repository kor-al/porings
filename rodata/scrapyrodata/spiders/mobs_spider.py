import scrapy

# scrapy shell "http://ratemyser
# ver.net/index.php?all_mob_select=%23&mob_id=&mob_name=&element=-1&race=-1&size=-
# 1&mlvsn=4&mlv=1&mlv2=&bxpsn=0&exp=&exp2=&jxpsn=0&jexp=&jexp2=&flee=&dr=95&hit=&h
# r=100&rgc=0&immu=0&mvp=0&minib=0&aggr=0&assi=0&sense=0&det=0&sench=0&loot=0&chch
# a=0&immo=0&chtar=0&natk=0&imkb=0&plt=0&sort_r=0&sort_o=0&page=mob_db&f=1&mob_sea
# rch=Search&page_num=1"


class MobsSpider(scrapy.Spider):
    name = "mobs"
    kTotalPsges = 1
    i = 1 #pages counter

    #start_urls=['http://ratemyserver.net/index.php?all_mob_select=%23&mob_id=&mob_name=&element=-1&race=-1&size=-1&mlvsn=4&mlv=1&mlv2=&bxpsn=0&exp=&exp2=&jxpsn=0&jexp=&jexp2=&flee=&dr=95&hit=&hr=100&rgc=0&immu=0&mvp=0&minib=0&aggr=0&assi=0&sense=0&det=0&sench=0&loot=0&chcha=0&immo=0&chtar=0&natk=0&imkb=0&plt=0&sort_r=0&sort_o=0&page=mob_db&f=1&mob_search=Search']
    #- scrap porings
    #start_urls = ['http://ratemyserver.net/index.php?mob_name=pori&page=re_mob_db&f=1&mob_search=Search&page_num=1']
    #-scrap drops
    start_urls = ['http://ratemyserver.net/index.php?mob_name=drops&page=re_mob_db&f=1&mob_search=Search',
                  'http://ratemyserver.net/index.php?mob_name=marin&page=re_mob_db&f=1&mob_search=Search',
                  'http://ratemyserver.net/index.php?mob_name=metaling&page=re_mob_db&f=1&mob_search=Search',
                  'http://ratemyserver.net/index.php?mob_name=Ghost&page=re_mob_db&f=1&mob_search=Search']

    def parse(self, response):

        for mob in response.css('table.content_box_mob'):
            titlecss = mob.css('th.bborder')[0].css('div::text')
            mobid = titlecss.re(r'Mob-ID#(\d+)')[0]
            mobNAME = titlecss.re(r'\((\w+)\)')[0]
            mobname = ' '.join(titlecss.re(r'(\w+ /*)')).strip()

            table1 = mob.css('table.content_box_db')[0]
            feature_names, feature_values = [],[]
            for tr in table1.css('tr'):
                feature_names_temp = tr.css('th.lmd::text').extract()
                feature_values += tr.css('td.bb::text').extract()[:len(feature_names_temp)]
                feature_names += feature_names_temp
            features1 = dict(zip(feature_names, feature_values))

            image_url = table1.css('tr')[0].css('td.bb img::attr(src)').extract_first()

            table2 = mob.css('table.content_box_db')[1]

            feature_names, feature_values = [], []
            for tr in table2.css('tr'):
                feature_values += tr.css('td.bb::text, td.bb span::text').re(r'-*\d+')
                feature_names += tr.css('th.lmd::text').extract()
            features2 = dict(zip(feature_names, feature_values))

            yield {
                'id' : mobid,
                'NAME' : mobNAME,
                'name' : mobname,
                'file_urls' : [image_url],
                **features1,
                **features2
            }

        #next_page = response.xpath('/html/body/div[1]/div[3]/div[2]/table/tr[2]/td[2]/div[3]/span[16]/a/@href').extract_first()
        next_page = self.start_urls[0] + '&page_num=' + str(self.i + 1)
        if next_page is not None and self.i < self.kTotalPsges:
            self.i=self.i+1
            yield response.follow(next_page, callback=self.parse)