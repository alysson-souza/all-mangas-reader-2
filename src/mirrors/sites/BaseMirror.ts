import { AnyNode, BasicAcceptedElems, load } from "cheerio"
import { MirrorHelper } from "../../reader/MirrorHelper"

export abstract class BaseMirror {
    protected constructor(protected amrLoader: MirrorHelper) {}

    protected parseHtml(html: string, selector: string, context?: BasicAcceptedElems<AnyNode> | null) {
        const cheerioAPI = load(html)
        return cheerioAPI(selector, context)
    }
}
