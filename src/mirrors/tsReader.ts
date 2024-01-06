/**
 * Extract images from ts_reader.run
 */
export function extractImages(doc: string): string[] {
    const multiLine = /ts_reader\.run\(([\s\S]*?)\);/g
    const multiLinePart = multiLine.exec(doc)

    if (multiLinePart) {
        /**
         * Sample argument
         * {
         *         "post_id": '',
         *         "noimagehtml": "<h2>NO IMAGE YET<\/h2>",
         *         "prevUrl": "/magic-emperor/491",
         *         "nextUrl": "/magic-emperor/493",
         *         "mode": "full",
         *         "sources": [{
         *             "source": "Server 1",
         *             "images": ["https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/1.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/2.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/3.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/4.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/5.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/6.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/7.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/8.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/9.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/10.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/11.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/12.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/13.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/14.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/15.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/16.jpg","https:\/\/www.funmanga.com\/uploads\/chapter_files\/16768\/6598e21e2cb23\/17.jpg"]        }],
         *         "lazyload": true,
         *         "defaultSource": "Server 1",
         *         "lazyloadPlaceHolder": "\/dist\/img\/readerarea.svg",
         *         "progressBar": true,
         *         "contentmode": "advanced",
         *         "protected": false,
         *         "is_novel": false,
         *         "unlock_token": null
         *     }
         */
        const runArg = multiLinePart[1]

        // "sources": (anything-here) ],
        const imageSources = /"sources": \[([\s\S]*?)],/g.exec(runArg)

        const firstSource = JSON.parse(imageSources[1])

        // this should return { source: "Server 1", images: [...]}
        if (!firstSource || !Array.isArray(firstSource.images)) {
            return []
        }

        return firstSource.images
    }

    return []
}
