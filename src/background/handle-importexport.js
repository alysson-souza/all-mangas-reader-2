
class HandleImportExport {
  handle(message, sender) {
    switch (message.action) {
      case "mangadexVerifyCredentials":
        return window['AMR_STORE'].dispatch('mangadexVerifyCredentials', message);
      case "mangadexResetCredentials":
        return window['AMR_STORE'].dispatch('mangadexResetCredentials');
      case "mangadexExportMangas":
        return window['AMR_STORE'].dispatch('mangadexExportMangas');
      case "mangadexImportMangas":
        return window['AMR_STORE'].dispatch('mangadexImportMangas');
      case "mangadexAddManga":
        return window['AMR_STORE'].dispatch('mangadexAddManga', message);
      case "mangadexAddMangasInLang":
        return window['AMR_STORE'].dispatch('mangadexAddMangasInLang', message);
    }
  }
}

export default (new HandleImportExport)