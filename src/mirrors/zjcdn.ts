// Direct copy of function from embedded <scrip> tag
function generateStringVariables(p, a, c, k, e, d) {
    e = function (c) {
        return (
            (c < a ? "" : e(parseInt(String(c / a)))) +
            ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
        )
    }
    if (!"".replace(/^/, String)) {
        while (c--) d[e(c)] = k[c] || e(c)
        k = [
            function (e) {
                return d[e]
            }
        ]
        e = function () {
            return "\\w+"
        }
        c = 1
    }
    while (c--) if (k[c]) p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c])
    return p
}

/**
 * We have something like this that needs to parse the parameters
 * and return a string that needs to evaluated
 * "var newImgs=['//zjcdn.mangahere.org, ....];var newImginfos=[19715448...];"
 *
 * <script type="text/javascript">
 *             eval(function(p, a, c, k, e, d) {
 *                 e = function(c) {
 *                     return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
 *                 }
 *                 ;
 *                 if (!''.replace(/^/, String)) {
 *                     while (c--)
 *                         d[e(c)] = k[c] || e(c);
 *                     k = [function(e) {
 *                         return d[e]
 *                     }
 *                     ];
 *                     e = function() {
 *                         return '\\w+'
 *                     }
 *                     ;
 *                     c = 1;
 *                 }
 *                 ;while (c--)
 *                     if (k[c])
 *                         p = p.replace(new RegExp('\\b' + e(c) + '\\b','g'), k[c]);
 *                 return p;
 *             }('a n=[\'//7.9.8/5/2/1/6.0/4/o.3\',\'//7.9.8/5/2/1/6.0/4/l.3\',\'//7.9.8/5/2/1/6.0/4/m.3\',\'//7.9.8/5/2/1/6.0/4/r.3\',\'//7.9.8/5/2/1/6.0/4/s.3\',\'//7.9.8/5/2/1/6.0/4/p.3\',\'//7.9.8/5/2/1/6.0/4/q.3\',\'//7.9.8/5/2/1/6.0/4/k.3\',\'//7.9.8/5/2/1/6.0/4/e.3\',\'//7.9.8/5/2/1/6.0/4/f.3\',\'//7.9.8/5/2/1/6.0/4/c.3\',\'//7.9.8/5/2/1/6.0/4/d.3\',\'//7.9.8/5/2/1/6.0/4/i.3\',\'//7.9.8/5/2/1/6.0/4/j.3\',\'//7.9.8/5/2/1/6.0/4/g.3\',\'//7.9.8/5/2/1/6.0/4/h.3\',\'//7.9.8/5/2/1/6.0/4/C.3\'];a u=[v,A,B,y,z,x,w,H,I,J,E,D,G,F,t,b,b];', 46, 46, '|39145|manga|jpg|compressed|store|001|zjcdn|org|mangahere|var|19715468|m010|m011|m008|m009|m014|m015|m012|m013|m007|m001|m002|newImgs|m000|m005|m006|m003|m004|19715466|newImginfos|19715448|19715454|19715453|19715451|19715452|19715449|19715450|m315|19715460|19715458|19715464|19715462|19715455|19715456|19715457'.split('|'), 0, {}))
 *         </script>
 * @param doc
 * @private
 */
export const extractListOfImages = async (doc: string): Promise<string[]> => {
    const regex = /}\('(.*)\)\)/g

    const match = regex.exec(doc)
    // Matching group should be indexed 1
    if (!match || match.length < 2) {
        return []
    }

    const first = match[1]
    const variableExtraction = /(^.*;',)(\d*),(\d*),'(.*)'.split/g
    const variableMatch = variableExtraction.exec(first)

    if (!variableMatch || variableMatch.length < 5) {
        return []
    }
    // var a = [...], 46, 46, '|39145|manga|...'.split('|') ,0,{}
    const [_initialMatch, variables, x, y, imageList] = variableMatch
    const list = imageList.split("|")
    const data = generateStringVariables(variables, x, y, list, 0, {})

    const imgExtract = [...data.matchAll(/'(.+?)\\'/g)]

    return imgExtract.map(r => r[1])
}
