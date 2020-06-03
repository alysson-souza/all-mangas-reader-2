// // This uses angular and loads shit weird. Need to find if there is api source for it or how the content works if not
// if (typeof registerMangaObject === 'function') {
// 	registerMangaObject({
//         mirrorName : "Manga4Life",
//         canListFullMangas : true,
//         mirrorIcon : "manga4life.png",
//         languages : "en",
//         domains: ["manga4life.com"],
//         home: "https://manga4life.com",
//         chapter_url: /^\/read-online\/.*$/g,

//         getMangaList : async function (search) {
//             let doc = await amr.loadPage(this.home + "/directory/", { nocache: true, preventimages: true })
//             let res = []
//             $('.MainContainer a[href*="/manga/"]', doc).each(function () {
//                 res.push([$(this).text(), this.home + $(this).attr('href')]);
//             })
//             return res
//         },
    
//         getListChaps : async function (urlManga) {
//             let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
//             let res = []
//             let self = this
//             $('a[href*="/read-online/"]', doc).each(function (index) {
//                 res[res.length] = [$('span:first', this).text(), self.home + $(this).attr('href')];
//             })
//             console.log('Chapters')
//             console.log(res)
//             return res
//         },
    
//         getInformationsFromCurrentPage : async function (doc, curUrl) {
//             var mgtitle = $($('.MainContainer a[href*="manga"]', doc)[0])
//             return {
//                 "name" : mgtitle.text().trim().split("\n")[0].trim(),
//                 "currentMangaURL" : this.home + mgtitle.attr("href"),
//                 "currentChapterURL" : curUrl
//             };
//         },
    
//         getListImages : async function (doc, curUrl) {
//             let fullUrl = curUrl.replace('-page-1.html', '.html')
//             doc = await amr.loadPage(fullUrl, { nocache: true})

//             let regex = /(?<=vm\.CurChapter =).*?(?=;)/g
//             let matches = regex.exec(doc.innerText)
//             let vars = JSON.parse(matches[0])
//             console.log(vars)

//             regex = /(?<=vm\.CurPathName = ").*?(?=";)/g
//             matches = regex.exec(doc.innerText)
//             let cdnPath = matches[0]

//             regex = /(?<=vm\.IndexName = ").*?(?=";)/g
//             matches = regex.exec(doc.innerText)
//             let titlePath = matches[0]


//             let res = []
//             let chapImage = this.ChapterImage(vars.Chapter)
//             let extraDir = vars.Directory == '' ? '' : vars.Directory + '/'
//             for(i=1; i <= vars.Page; i++){
//                 let pageImage = this.PageImage(i)
//                 res.push(`https://${cdnPath}/manga/${titlePath}/${extraDir}/${chapImage}-${pageImage}.png`)
//             }

//             console.log(res)
//             return res
//         },

//         ChapterImage : function(ChapterString){
//             var Chapter = ChapterString.slice(1,-1);
//             var Odd = ChapterString[ChapterString.length -1];
//             if(Odd == 0){
//                 return Chapter;
//             }else{
//                 return Chapter + "." + Odd;
//             }
//         },

//         PageImage : function(PageString){
//             var s = "000" + PageString;
//             return s.substr(s.length - 3);
//         },
    
//         getImageFromPageAndWrite : async function (urlImg, image) {
//             $(image).attr("src", urlImg);
//         },
        
//         isCurrentPageAChapterPage : function (doc, curUrl) {
//             return $("div.ImageGallery", doc).length > 0;
//         }
//     })
// }