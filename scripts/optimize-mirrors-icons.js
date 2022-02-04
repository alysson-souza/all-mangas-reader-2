const fs = require('fs')
const path = require('path')
const sharp = require('sharp')


let files = fs.readdirSync(path.join(__dirname, '../', 'src/mirrors/icons'))

files = files.map(f => path.join(__dirname, '../', 'src/mirrors/icons', f))

// filter out image without "-optimized.png" extension
files = files.filter(f => !f.endsWith('-optimized.png'))

if(files.length) console.log('Optimizing '+files.length+' icons...')

files.forEach(file => {
  const newFileName = file.replace(/(\.png|\.jpg|\.gif|\.webp)$/g, '-optimized.png')
  sharp(file)
    .resize(16, 16)
    .toFormat('png')
    .png({compressionLevel: 9, quality: 5})
    .toFile(newFileName)
    .then(() => {
      fs.unlinkSync(file)
    })
})

