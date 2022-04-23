# Working on a multilingual site implementation

Some sites return languages such as `es-la`, `pt-br`. some even returns wrong country codes like `us` instead of `en` etc...  
All Mangas Reader expect country codes [from this list](#list-of-supported-country-codes)

When a site returns languages or wrong country codes we need to convert them.  
This document will cover this whole process with a working example.

First we need a function that convert flags:  
`./src/utils.js`

```js
export someMirror_LangFix(langs) {
    const results = []
    if(typeof langs !== 'string') return '_United-Nations' // use this flag for unexpected languages
    for(const lang of langs.split(',')) {
    switch(lang) {
        case 'es-la':
            results.push('mx') //=> spanish LATAM -> mexican flag
            break;
        case 'pt-br':
            results.push('br') //=> Portugues BRAZIL -> brazilian flag
            break;
        default:
            results.push(lang) //=> country codes that don't need conversion
            break;
    }
    return results.join(',')
}
```

Now we can call this function in the website implementation:
`./src/mirrors/implementations/someMirror-scans.js`  
_You can check mangadex-v5 implementation if you need a full code example_

```js
/** my website impl. */
// [....]
getListChaps: async function(urlManga) {
    const res = []
    const data = doSomething(urlManga)
    data.forEach(item => {
        const lang = utils.someMirror_LangFix(item.lang) //=> fix lang/flag
        /** rest of the code is up to you */
        if(!res[lang]) res[lang] = []
        res[lang] = item.information
    })
    return res
},

// [ ... ]
getInformationsFromCurrentPage: async function(doc, curUrl) {
    const info = doSomethingElse(curUrl)
    return {
        name: info.name,
        currentMangaURL: info.url,
        currentChapterURL: info.chapter.url
        language: utils.someMirror_LangFix(info.chapter.lang) //=> fix lang/flag
    }
},
```

**If you are working on a new site your done!**  
but if you are editing an already existing implementation there's additionnal steps to ensure backward compatibilty.

We will need a list of all "wrong" codes/flags with `_` as a prefix  
`./src/utils.js`

```js
const someMirror_FixLangsList = ["es-la", "ja"] //=> flags
export const someMirror_FixLangsListPrefix = somethingFixLangsList.map(e => "_" + e) //=> flags with _prefix
```

And a function that fixes `Manga.key`
`./src/utils.js`

```js
export function someMirror_KeyFix(key) {
    return key.replace(/.*_(.*)$/, function (a, b) {
        return a.replace(b, "") + someMirror_LangFix(b)
    })
}
```

Then in order to convert entries already in both the local and remote (sync) database we will need a new mutation in the vuex store  
In this case you can basically copy/past the code below and replace the functions/variables names
`./src/store/modules/mangas.js` _(in `actions`)_

```js
someMirror_LangFix_Mutation({getters, rootState, dispatch}) {
    const mangasdb = await storedb.getMangaList()
    const mgs = mangasdb.filter(
        mg => mg.mirror === 'someMirror'
        && new RegExp(utils.someMirror_FixLangsListPrefix.join('|')).test(mg.key)
    )
if(!mgs.length) return
const temporarySyncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
const payload = []
for(const oldManga of mgs) {
    const newManga = new Manga(oldManga)
    newManga.key = utils.someMirror_KeyFix(newManga.key)
    newManga.language = utils.someMirror_LangFix(newManga.language)
    newManga.languages = utils.someMirror_LangFix(newManga.languages)
    payload.push({oldManga, newManga})
    await storedb.replace({oldManga, newManga})
}
await temporarySyncManager.fixLang(payload)
}
```

And finally we use our mutation just before the manga list is loaded:  
`./src/store/modules/mangas.js` _(in `actions.initMangasFromDB`)_

```js
async initMangasFromDB({ commit, dispatch }, fromModule) {

    await dispatch('someMirror_LangFix_Mutation') // needs to be called before storedb.getMangaList()

    await storedb.getMangaList().then(async mangasdb => {
        await dispatch('updateLanguageCategories')
        commit('setMangas', mangasdb.map(mg => new Manga(mg)));
    })
    if(fromModule) amrUpdater.refreshBadgeAndIcon()
},
```

## list of supported country codes

```js
;[
    ["ar", "sa"], // Saudi Arabia -> Arabic
    "bd", // Bangladesh -> Bengali
    "bg", // Bulgaria - > Bulgarian
    "ct", // Catalan
    "cn", // China -> simplified chinese
    "hk", // Hong Kong -> Cantonese
    "cz", // Czechia -> Czech
    "dk", // Denmark -> Dannish
    "nl", // Netherlands -> Dutch
    ["en", "gb"], // England -> English
    "ph", // Philippines -> Filipino
    "fi", // Finland -> Finnish
    "fr", // France -> French
    "de", // Germany -> German
    "gr", // Greece -> Greek
    "hu", // Hungary -> Hungrian
    "id", // Indonesia -> Indonesian
    "it", // Italy -> Italian
    "jp", // Japan -> Japanese
    "kr", // Korea -> Korean
    "my", // Malaysia -> Malay
    "mn", // Mongolia -> Mongolian
    "ir", // Iran -> Persian
    "pl", // Poland -> Polish
    "br", // Brazil -> Portuguese (br)
    "pt", // Portugal -> Portuguese
    "ro", // Romania -> Romanian
    "ru", // Russia -> Russian
    "rs", // Serbia -> Serbian
    "es", // Spain -> Spanish
    "mx", // Mexico -> LATAM
    "se", // Sweden -> Swedish
    "th", // Thailand -> Thai
    "tr", // Turkey -> Turkish
    "ua", // Ukraine -> Ukrainian
    "vn" // Vietnam -> Vietnamese
]
```
