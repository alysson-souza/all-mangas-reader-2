if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MerakiScans",
        canListFullMangas: true,
        mirrorIcon: "merakiscans.png",
        languages: "en",
        domains: ["merakiscans.com"],
        home: "https://www.merakiscans.com/",
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://merakiscans.com/manga/", { nocache: true, preventimages: true })
            res = [];
            $("div#all div[id='listitem']", doc).each(function(ind) {
                res.push([
                    $(this).find("h1").text(),
                    "https://merakiscans.com" + $(this).find("a").attr("href").replace("/details/", "/manga/")
                ])
            })
            return res
            
        },

        getListChaps: async function (urlManga) {
            // For some reason no https: is passed????
            if (!urlManga.includes("https:")) {
                urlManga = "https:" + urlManga
            }
            console.log(urlManga)
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $("tr[id='chapter-head']", doc).each(function (index) {
                res[res.length] = [$(this).find("td:first").text(), "https://merakiscans.com" + $(this).attr("data-href")];
            });
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let name = $("h1[id='reader_text'] a", doc).text()
            let nameurl = "https://merakiscans.com" + $("h1[id='reader_text'] a", doc).attr("href") + "/"
            let matches = $.map($("script", doc), el => $(el).text()).join(";")
			matches = matches.match(/var currentChapter = "(.*?)";/)
			let chapurl = nameurl + matches[1] + "/"
			return {
				"name": name,
				"currentMangaURL": nameurl,
				"currentChapterURL": chapurl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = [];
			let matches = $.map($("script", doc), el => $(el).text()).join(";")
			matches = matches.match(/var images =(.*?);/)
			if (matches) {
				let b = JSON.parse(matches[1]);
				for (let i = 0; i < b.length; i++) {
					res[i] = curUrl + "/" + b[i]
				}
			}
			return res;
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        whereDoIWriteScans: function (doc, curUrl) {
            return $("#container", doc)
        },
        isCurrentPageAChapterPage: function (doc, curUrl) {
            
            // return $("img[id='preload']", doc).length > 0 // Works for live testing but not in lab
            
            let matches = $.map($("script", doc), el => $(el).text()).join(";")
            matches = matches.match(/var currentChapter = "(.*?)";/)
            return matches.length > 0
        },
        doSomethingBeforeWritingScans: function (doc, curUrl) {
            $("#container", doc).empty()
            
            $("#navcontainer", doc).remove()
            $("#controlbox", doc).remove()
            $("#reader_text", doc).remove()
            $("div[id='bottombox']", doc).remove()
            $("footer", doc).remove()
        },
        doAfterMangaLoaded: function (doc, curUrl) {
        }
    });
}