const mutations = [
  {
    type: 'setMangaReadTop',
    isDifferent: (mg, payload) => mg.read !== payload.read,
    setToRemote: (mg, payload) =>  {
      mg.read = payload.read
      return mg
    },
  },
  {
    type: 'setMangaUpdateTop',
    isDifferent: (mg, payload) => mg.update !== payload.update,
    setToRemote: (mg, payload) =>  {
      mg.update = payload.update
      return mg
    }
  },
  {
    type: 'setMangaDisplayName',
    isDifferent: (mg, payload) => mg.displayName !== payload.displayName,
    setToRemote: (mg, payload) =>  {
      mg.displayName = payload.displayName
      return mg
    }
  },
  {
    type: 'setMangaDisplayMode',
    isDifferent: (mg, payload) => mg.display !== payload.display,
    setToRemote: (mg, payload) =>  {
      mg.display = payload.display
      return mg
    }
  },
  {
    type:'setMangaLayoutMode',
    isDifferent: (mg, payload) => mg.layout !== payload.layout,
    setToRemote: (mg, payload) => {
      mg.layout = payload.layout
      return mg
    }
  },
  {
    type: 'setMangaWebtoonMode',
    isDifferent: (mg, payload) => mg.webtoon !== payload.webtoon,
    setToRemote: (mg, payload) =>  {
      mg.webtoon = payload.webtoon
      return mg
    }
  },
]

export default mutations