import mirrorsImpl from "../amr/mirrors-impl";

/**
 * Runs implementation functions for the lab
 */
class HandleLab {
    handle(message, sender) {
        if ("lab" === message.action) {
            return this.runFunction(message);
        }
    }
    async runFunction(message) {
        // load implementation for mirror
        return new Promise(async (resolve, reject) => {
            let impl = await mirrorsImpl.getImpl(message.mirror);
            if (message.torun === "search") {
                impl.getMangaList(message.search, function (mirrorName, res) {
                    if (mirrorName !== message.mirror) {
                        reject("Mirror name returned is wrong !");
                    } else {
                        resolve(res);
                    }
                });
            }
        });
    }
}
export default (new HandleLab)