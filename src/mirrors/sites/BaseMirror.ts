import { AnyNode, BasicAcceptedElems, load } from "cheerio"
import { MirrorHelper } from "../../reader/MirrorHelper"

export abstract class BaseMirror {
    protected constructor(protected mirrorHelper: MirrorHelper) {}

    protected queryHtml(html: string, selector: string, context?: BasicAcceptedElems<AnyNode> | null) {
        const cheerioAPI = load(html)
        return cheerioAPI(selector, context)
    }

    protected parseHtml(html: string) {
        return load(html)
    }

    /**
     * Wrapper for original mirrorHelper getVariable.
     * Currently we are receiving original html, not sanitized one. so we can
     * pass-through to getVariableFromScript
     */
    protected getVariable({ doc, variableName }: { doc: string; variableName: string }) {
        return this.mirrorHelper.getVariableFromScript(variableName, doc)
    }
}
