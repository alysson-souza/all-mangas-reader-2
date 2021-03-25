if (typeof registerMangaObject === "function") {
	registerMangaObject({
		mirrorName: "MangaLib",
		canListFullMangas: false,
		mirrorIcon: "mangalib.png",
		languages: "ru",
		domains: ["mangalib.me"],
		home: "https://mangalib.me/",
		chapter_url: /\/.*\/v[0-9]+\/c[0-9]+/g,
		disabled: true,

		getMangaList: async function (search) {
			let json = await amr.loadJson(
				"https://mangalib.me/search", 
				{
					nocache: true,
					preventimages: true,
					type: 'GET',
					dataType: "json",
					data: { query: search },
					headers: {"x-requested-with": "XMLHttpRequest"},
				}
			)

			let res = [];
			for (const manga of json) {
				res[res.length] = [manga.name, "https://mangalib.me/" + manga.slug]
			}
			return res
		},
	
		getListChaps: async function (urlManga) {
			let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
			let res = []
			$("div.chapter-item__name > a", doc).each(function (index) {
				res.push([this.innerText, this.href]);
			})
			return res
		},

		isCurrentPageAChapterPage: async function (doc, curUrl) {
			return ($(".reader", doc).length > 0);
		},

		getInformationsFromCurrentPage: async function (doc, curUrl) {
			let a = $(".reader-header-info__name", doc)[0];
			return {
				"name": a.innerText,
				"currentMangaURL": a.href,
				"currentChapterURL": curUrl
			}
		},
	
		getListImages: async function (doc, curUrl) {
			// "https://img2.mangalib.me/manga/nidome-no-yuusha/chapters/1-5/выв.png"

			// window.__info = {
			// 	current: 1,
			// 	pages: [{ "page_image": "выв.png", "page_slug": 1, "created_at": "2018-07-28 13:59:06" }, { "page_image": "2 (3).png", "page_slug": 2, "created_at": "2018-07-28 13:59:14" }, { "page_image": "3.png", "page_slug": 3, "created_at": "2018-07-28 13:59:23" }, { "page_image": "4.png", "page_slug": 4, "created_at": "2018-07-28 13:59:35" }, { "page_image": "5.png", "page_slug": 5, "created_at": "2018-07-28 13:59:48" }, { "page_image": "6.png", "page_slug": 6, "created_at": "2018-07-28 14:00:02" }, { "page_image": "7.png", "page_slug": 7, "created_at": "2018-07-28 14:00:11" }, { "page_image": "8.png", "page_slug": 8, "created_at": "2018-07-28 14:00:18" }, { "page_image": "9.png", "page_slug": 9, "created_at": "2018-07-28 14:00:28" }, { "page_image": "10.png", "page_slug": 10, "created_at": "2018-07-28 14:00:43" }, { "page_image": "11.png", "page_slug": 11, "created_at": "2018-07-28 14:00:55" }, { "page_image": "12.png", "page_slug": 12, "created_at": "2018-07-28 14:01:04" }, { "page_image": "13.png", "page_slug": 13, "created_at": "2018-07-28 14:01:15" }, { "page_image": "14.png", "page_slug": 14, "created_at": "2018-07-28 14:01:23" }, { "page_image": "15.png", "page_slug": 15, "created_at": "2018-07-28 14:01:34" }, { "page_image": "16.png", "page_slug": 16, "created_at": "2018-07-28 14:01:44" }, { "page_image": "17.png", "page_slug": 17, "created_at": "2018-07-28 14:01:52" }, { "page_image": "18.png", "page_slug": 18, "created_at": "2018-07-28 14:02:02" }, { "page_image": "19.png", "page_slug": 19, "created_at": "2018-07-28 14:02:09" }, { "page_image": "20.png", "page_slug": 20, "created_at": "2018-07-28 14:02:20" }, { "page_image": "21.png", "page_slug": 21, "created_at": "2018-07-28 14:02:39" }, { "page_image": "22.png", "page_slug": 22, "created_at": "2018-07-28 14:02:51" }, { "page_image": "23.png", "page_slug": 23, "created_at": "2018-07-28 14:03:05" }, { "page_image": "24.png", "page_slug": 24, "created_at": "2018-07-28 14:03:16" }, { "page_image": "25.png", "page_slug": 25, "created_at": "2018-07-28 14:03:27" }],
			// 	slug: '/nidome-no-yuusha',
			// 	next: 'https://mangalib.me/nidome-no-yuusha/v1/c6',
			// 	prev: 'https://mangalib.me/nidome-no-yuusha/v1/c4/37',
			// 	manga_caution: '1',
			// 	base: 'https://mangalib.me/nidome-no-yuusha/v1/c5',
			// 	imgUrl: '/manga/nidome-no-yuusha/chapters/1-5/',
			// 	imgServer: 'secondary'
			// }
			let pages;
			let imgUrl;

			//let scriptText = $("script", doc)[0].text;
			
			$("script", doc).each(function () {
				if ($(this).text().includes("window.__info = {")) {
					pages = $(this).text().match(/pages:\s*(\[.*\])/)[1];
					pages = JSON.parse(pages);
					imgUrl = $(this).text().match(/imgUrl:\s*'(.*)',/)[1];
					return false //break
				}
			});
			
			return pages.map(function (currentValue) {
				return "https://img2.mangalib.me" + imgUrl + currentValue.page_image
			});
		},
	
		getImageFromPageAndWrite: async function (urlImg, image) {
			$(image).attr("src", urlImg);
		}
	})
}