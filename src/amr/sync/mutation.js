const mutations = [
  {
    type: 'setMangaReadTop',
    setToRemote: (mg, payload) =>  {
      mg.read = payload.read
      return mg
    },
  },
  {
    type: 'setMangaUpdateTop',
    setToRemote: (mg, payload) =>  {
      mg.read = payload.update
      return mg
    }
  },
  {
    type: 'setMangaDisplayName',
    setToRemote: (mg, payload) =>  {
      mg.read = payload.displayName
      return mg
    }
  },
  {
    type: 'setMangaDisplayMode',
    setToRemote: (mg, payload) =>  {
      mg.read = payload.display
      return mg
    }
  },
  {
    type:'setMangaLayoutMode',
    setToRemote: (mg, payload) => {
      mg.layout = payload.layout
      return mg
    }
  },
  {
    type: 'setMangaWebtoonMode',
    setToRemote: (mg, payload) =>  {
      mg.read = payload.webtoon
      return mg
    }
  },
]

export default mutations