if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "DM5",
        canListFullMangas : true,
        mirrorIcon : "dm5.png",
        languages : "cn",
        domains: ["www.dm5.com"],
        home: "https://www.dm5.com/",
        chapter_url: /^\/m[0-9]+\/$/g,

        test_options: {
            images_restricted_domain: true
        },

        getMangaList : async function (search) {
            let doc = await amr.loadPage("https://www.dm5.com/search.ashx?d=" + new Date().getTime() + "&t=" + search + "&language=1", { preventimages: true })
            let res = [];
            $("li", doc).each(function () {
                let url = $(this).attr("onclick")
                let st = url.indexOf("'"), en = url.lastIndexOf("'")
                url = url.substring(st + 1, en)
                if ($(this).attr('value') !== 0) {
                    res[res.length] = [$(".left", $(this)).text(), "https://www.dm5.com" + url];
                }
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            if ($("#checkAdult", doc).length > 0) { // pass adult test
                amr.setCookie({ // set the cookie on dm5 domain
                    name: "isAdult",
                    value: "1",
                    path: "/",
                    url: urlManga,
                    domain: "www.dm5.com",
                    expirationDate: new Date().getTime() + (24*60*60*1000)
                })
                doc = await amr.loadPage(urlManga, { // and reload the page
                    nocache: true, 
                    preventimages: true
                })
            }
            let res = [];
            $("#chapterlistload li > a", doc).each(function (index) {
                $("span", $(this)).remove()
                let name = $(this).text()
                if ($(".title", $(this)).length > 0) name = $(".title", $(this)).text()
                res[res.length] = [name, "https://www.dm5.com" + $(this).attr('href')];
            });
            if ($("#chapterlistload .cover", doc).length > 0) res = res.reverse()
            return res;
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            let mg = $(".view-header-2 .title a[href!='/']", doc)
            return {
                "name" : mg.attr("title"),
                "currentMangaURL" : "https://www.dm5.com" + mg.attr("href"),
                "currentChapterURL" : "https://www.dm5.com" + amr.getVariable("DM5_CURL", doc)
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let lastpage = amr.getVariable("DM5_IMAGE_COUNT", doc),
                curl = amr.getVariable("DM5_CURL", doc),
                res = []

            for (let i = 1; i <= lastpage; i++) {
                res.push("https://www.dm5.com" + curl.slice(0, -1) + "-p" + i + "/")
            }
            return res;
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            // loads the page containing the current scan
            let doc = await amr.loadPage(urlImg)
            var mkey = '';
            if ($("#dm5_key", doc).length > 0) {
                mkey = $("#dm5_key", doc).val();
            }
            let curl = amr.getVariable("DM5_CURL", doc),
                cid = amr.getVariable("DM5_CID", doc),
                mid = amr.getVariable("DM5_MID", doc),
                dt = amr.getVariable("DM5_VIEWSIGN_DT", doc), // valid date for the sign key
                sign = amr.getVariable("DM5_VIEWSIGN", doc), // sign key
                chapfunurl = "https://www.dm5.com" + curl + "chapterfun.ashx", // url to retrieve scan url
                curpage = 1,
                re = /m\d+-p(\d+)\/?/,
                mat = urlImg.match(re)
            if (mat != null && mat.length > 1) {
                curpage = parseInt(mat[1]) // set the current page depending on the scan to retrieve
            }
            let params = { // Build parameters for the request
                cid: cid, 
                page: curpage, 
                key: mkey, 
                language: 1, 
                gtk: 6, 
                _cid: cid, 
                _mid: mid, 
                _dt: dt, 
                _sign: sign
            }
            // get scan url (this function seems to work only within DM5, perhaps a control on Referer)
            let data = await amr.loadJson(
                chapfunurl, 
                {
                    data: params, 
                    nocontenttype: true, 
                    headers: {"X-Requested-With": "XMLHttpRequest"},
                    referer: urlImg
                }
            )
            // the retrieved data is packed through an obfuscator
            // dm5 is unpacking the images url through an eval, we can't do that in AMR due to CSP
            // we do it manually (below is the unpack function shipped with the data to decode)
            let unpack = function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}
            
            // regexp to parse the arguments to pass to the unpack function, just parse the 4 first arguments
            let regexpargs = /'(([^\\']|\\')*)',([0-9]+),([0-9]+),'(([^\\']|\\')*)'/g
            let match = regexpargs.exec(data)
            if (match) {
                args = [match[1], match[3], match[4], match[5].split("|"), 0, {}]
                let sc = unpack(...args) // call the unpack function
                sc = sc.replace(/\\'/g, "'") // unquote the result
                // the result is another js function containing the data, we mimic here what it does
                // retrieve the variables
                let cid = amr.getVariableFromScript("cid", sc), 
                    key = amr.getVariableFromScript("key", sc),
                    pix = amr.getVariableFromScript("pix", sc),
                    pvalue = amr.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
                pvalue = pvalue.map(img => pix + img + '?cid=' + cid + '&key=' + key) // mimic the returned function which rebuilds the url depending on its parts
                $(image).attr("src", pvalue[0]); // set the image src
            } else {
                $(image).attr("src", "error"); 
            }
        },
    
        whereDoIWriteScans : function (doc, curUrl) {
            return $('.amr-container', doc);
        },
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("#cp_img", doc).length > 0;
        },
        doSomethingBeforeWritingScans : function (doc, curUrl) {
            while (
                $("body > .view-header-2", doc).next().length > 0 && 
                !$("body > .view-header-2", doc).next().is(".view-comment")
            ) {
                $("body > .view-header-2", doc).next().remove()
            }
            $("body > .view-header-2", doc).after("<div class='amr-container'></div>")
        },
        
        doAfterMangaLoaded : function (doc, curUrl) {
        }
    })
}