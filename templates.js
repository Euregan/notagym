const hogan = require('hogan.js')
const fs = require('fs')

const main = hogan.compile(fs.readFileSync('./templates/main.html').toString())

const template = (template) => {
    template = fs.readFileSync('./templates/' + template + '.html').toString()
    template = hogan.compile(template)
    return (data) => main.render({title: "Notagym", body: template.render(data)})
}

module.exports = {
    notation: template('notation')
}
