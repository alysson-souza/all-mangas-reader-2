if (typeof registerMangaObject === "function") {
	registerMangaObject({
		mirrorName: "MintManga",
		canListFullMangas: false,
		mirrorIcon: "mintmanga.png",
		languages: "ru",
		domains: ["mintmanga.com"],
		home: "http://mintmanga.com/",
		chapter_url: /^\/.*\/vol.*\/[0-9]+.+$/g,

		getMangaList: async function (search) {
			let json = await amr.loadJson(
				"http://mintmanga.com/search/suggestion", 
				{
					nocache: true,
					preventimages: true,
					type: 'GET',
					dataType: "text",
					data: { query: search }
				}
			)
			let res = [];
			for (let sug of json.suggestions) {
				if (!sug.link.includes("/", 1)) {
					res[res.length] = [sug.value, "http://mintmanga.com" + sug.link]
				}
			}
			return res
		},
	
		getListChaps: async function (urlManga) {
			let doc = await amr.loadPage(urlManga + "?mtr=1", { nocache: true, preventimages: true })
			let res = []
			var mng_nm = (urlManga.split("/")).pop();
			$("div.expandable td > a", doc).each(function (index) {
				var str = $(this).attr("href");
				str = str.split("/")[1];
				if (str === mng_nm) {
					res[res.length] = [
						this.innerText.match(/\u000a\s+(.*)/g)[1].trim(),
						"http://mintmanga.com" + $(this).attr("href")
					];
				}
			})
			return res
		},
	
		passAdult: async function(doc, curUrl) {
            if ($("a[href='?mtr=1']").length > 0) {
				doc = await amr.loadPage(curUrl + "?mtr=1")
			}
			return doc
		},
		getInformationsFromCurrentPage: async function (doc, curUrl) {
			var name = $($("#mangaBox h1 a:first-child", doc).contents()[0]).text();
			var nameurl = "http://mintmanga.com" + $("#mangaBox h1 a:first-child", doc).attr("href");
			var chapurl = curUrl.split("?")[0] + "?mtr=1";
			return {
				"name": name,
				"currentMangaURL": nameurl,
				"currentChapterURL": chapurl
			}
		},
	
		getListImages: async function (doc, curUrl) {
			doc = await this.passAdult(doc, curUrl)

			var res = [];
			var matches = $.map($("script", doc), el => $(el).text()).join(";") //doc.documentElement.innerHTML; --> replace to work in JSDOM
			matches = matches.match(/rm_h\.init\(.*?\]\]/);
			if (matches) {
				matches = matches[0].slice(10);
				matches = matches.split("'").join('"');
				var b = JSON.parse(matches);
				for (var i = 0; i < b.length; i++) {
					res[i] = b[i][1] + b[i][0] + b[i][2];
				}
			}
			return res;
		},
	
		getImageFromPageAndWrite: async function (urlImg, image) {
			$(image).attr("src", urlImg);
		},

		isCurrentPageAChapterPage: async function (doc, curUrl) {
			doc = await this.passAdult(doc, curUrl)

			return ($("img#mangaPicture", doc).length > 0);
		}
	})
}
