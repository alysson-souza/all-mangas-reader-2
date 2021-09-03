const mutations = [
  {
    type: 'setMangaReadTop',
    set: (mg, payload) =>  {
      mg.read = payload.read
      return mg
    }
  },
  {
    type: 'setMangaUpdateTop',
    set: (mg, payload) =>  {
      mg.read = payload.update
      return mg
    }
  },
  {
    type: 'setMangaDisplayName',
    set: (mg, payload) =>  {
      mg.read = payload.displayName
      return mg
    }
  },
  {
    type: 'setMangaDisplayMode',
    set: (mg, payload) =>  {
      mg.read = payload.display
      return mg
    }
  },
  {
    type: 'setMangaWebtoonMode',
    set: (mg, payload) =>  {
      mg.read = payload.webtoon
      return mg
    }
  },
]

export default mutations