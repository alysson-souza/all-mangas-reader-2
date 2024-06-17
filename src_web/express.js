const express = require("express")
const path = require("path")
const app = express()
const port = 3456

const errors = Object.freeze({
    CHAPTER_LIST_CODE: Symbol("chapter_list_code"),
    CHAPTER_LIST_EMPTY: Symbol("chapter_list_empty")
})
const images = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"]
const seriesList = [
    {
        name: "Generic Mirum series",
        desc: "Martial arts, overpowered reincarnation, every beauty falls for the mc. The standard",
        chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        error: null
    },
    {
        name: "Max SSSSSS level player",
        desc: "MC was a loser who died after rich kid took his fiance and bullied him. Goes back in time where he breaks it off with shallow girl first, then uses magical perfect knowledge of everything to get OP items and elixers. Rejects girl who suddenly sees him in new light, attracts other rich beautiful girls, etc...",
        chapters: [1, 2, 3, 4, 5, 6],
        error: null
    },
    {
        name: "Broken chapter list",
        desc: "A series that has server error codes on chapter list",
        chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15],
        error: errors.CHAPTER_LIST_CODE
    },
    {
        name: "Empty chapter list",
        desc: "A series that has an empty chapter list",
        chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        error: errors.CHAPTER_LIST_EMPTY
    },
    {
        name: "Missing chapters",
        desc: "A series that has missing chapters",
        chapters: [1, 2, 5, 6, 7, 8, 9, 10],
        error: null
    }
]

const allow_errors = process.argv.includes("-errors")

app.use("/public", express.static(path.join(__dirname, "public")))

app.get("/list", (req, res) => {
    res.json({
        series: seriesList.map((item, index) => {
            return {
                name: item.name,
                desc: item.desc,
                id: index
            }
        })
    })
})

app.get("/series/:id", (req, res) => {
    const series = seriesList[parseInt(req.params.id)]

    if (!series) {
        return res.sendStatus(404)
    }

    if (allow_errors) {
        if (series.error === errors.CHAPTER_LIST_CODE) {
            return res.sendStatus(503)
        }

        if (series.error === errors.CHAPTER_LIST_EMPTY) {
            series.chapters = []
        }
    }

    res.json({
        name: series.name,
        desc: series.desc,
        seriesId: req.params.id,
        chapters: series.chapters
    })
})

app.get("/read/:seriesId/:chapterId", (req, res) => {
    const seriesId = parseInt(req.params.seriesId)
    const chapterId = parseInt(req.params.chapterId)

    const series = seriesList[seriesId]

    if (!series) {
        return res.sendStatus(404)
    }

    const chapter = series.chapters[chapterId]

    if (!chapter) {
        return res.sendStatus(500)
    }

    res.json({
        name: series.name,
        seriesId: seriesId,
        images: images
    })
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
    if (allow_errors) console.log(`Server has errors enabled`)
})
