// @flow

const hogan = require('hogan.js')
const fs = require('fs')

const main = hogan.compile(fs.readFileSync('./templates/main.html').toString())

const template = (template: string) => {
    let file = fs.readFileSync('./templates/' + template + '.html').toString()
    let body = hogan.compile(file)
    return (data: any) => main.render({title: "Notagym", body: body.render(data)})
}

module.exports = {
    notation: template('notation'),
    ranking: template('ranking'),
    members: template('members')
}
