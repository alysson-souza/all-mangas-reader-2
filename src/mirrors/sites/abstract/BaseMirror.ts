import { AnyNode, BasicAcceptedElems, load } from "cheerio"
import { MirrorHelper } from "../../MirrorHelper"
import browser from "webextension-polyfill"
import { ScriptJsonInject } from "../../../types/common"

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

    protected async scriptJson({ target, url, config = {} }: ScriptJsonInject) {
        const mergedConfig: RequestInit = {
            ...config,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                ...(config.headers as Record<string, string> | undefined)
            }
        }

        const [fetchResponse] = await browser.scripting.executeScript({
            target: target,
            func: function ({ url, config }) {
                return fetch(url, config)
                    .then(r => r.json())
                    .catch(e => {
                        console.error(e)
                        throw e
                    })
            },
            args: [{ url, config: mergedConfig }]
        })

        if (fetchResponse.error) {
            throw new Error(fetchResponse.error.message)
        }

        return fetchResponse.result
    }
}
