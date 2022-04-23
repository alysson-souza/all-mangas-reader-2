import DOMPurify from "dompurify"

/**
 * This method sanitize an xhr result containing html and returns a safe dom node
 * A text node is created which contains the original document string to be able to look for variables values
 * in scripts, this is just text, never ever evaluated
 */
export function sanitizeDom(stringDom) {
    let htmlDocument = DOMPurify.sanitize(stringDom, { RETURN_DOM: true, FORCE_BODY: true })
    let docText = document.createElement("div")
    docText.id = "__amr_text_dom__"
    docText.innerText = stringDom
    htmlDocument.prepend(docText)
    return htmlDocument
}
