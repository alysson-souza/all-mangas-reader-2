if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Easy Going",
        canListFullMangas : true,
        mirrorIcon : "easygoing.png",
        languages : "en",
        domains: ["*.egscans.org", "*.egscans.com"],
        home: "https://egscans.com/",
        /*no chapter_url, all urls are /any/ will be loaded everywhere... */

        getMangaList : async function (search) {
            let doc = await amr.loadPage("http://read.egscans.com/", { nocache: true, preventimages: true })
            let res = [];
            $("select[name='manga'] option", doc).each(function () {
                if ($(this).attr('value') !== 0) {
                    res[res.length] = [$(this).text(), "http://read.egscans.com/" + $(this).attr('value')];
                }
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $("select[name='chapter'] option", doc).each(function (index) {
                res[res.length] = [$(this).text(), urlManga + '/' + $(this).attr('value')];
            });
            res.reverse();
            return res;
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var name = $("select[name='manga'] option:selected", doc).text(),
                currentMangaURL = "http://read.egscans.com/" + $("select[name='manga'] option:selected", doc).attr('value'),
                currentChapterURL = currentMangaURL + '/' + $("select[name='chapter'] option:selected", doc).attr('value');
            return {
                "name" : name,
                "currentMangaURL" : currentMangaURL,
                "currentChapterURL" : currentChapterURL
            };
        },
    
        getListImages : async function (doc, curUrl) {
            var res = [],
                img = [],
                txt,
                i;
            txt = $(".mid > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > script:nth-child(2)", doc).html();
            txt = JSON.stringify(txt);
            img = txt.match(/img_url\.push\(\'.+?\' \)/g);
            for (i = 0; img.length > i; i += 1) {
                res.push("http://read.egscans.com/" + img[i].match(/'(.*?)'/ig)[0].replace(/'/g, ""));
            }
            return res;
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage : function (doc, curUrl) {
            return ($("select[name='chapter']", doc).length > 0);
        }
    })
}