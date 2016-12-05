// @flow

const http = require('http')
const config = require('./config')
const router = require('rlite-router')()
const templates = require('./templates')
const database = require('./database')(config.database.name, config.database.username, config.database.password)
const fs = require('fs')

//Create a server
module.exports = http.createServer(function(request, response) {
    const send = (content) => response.end(content)
    response.setHeader('content-type', 'text/html')

    router.add('notation/:competition/:member/:rigging', function (r) {
        send(templates.notation({
            competition: r.params.competition,
            member: r.params.member,
            rigging: r.params.rigging
        }))
    })

    router.add('ranking/:competition', function (r) {
        send(templates.ranking({
            competition: r.params.competition
        }))
    })

    router.add('members', function () {
        send(templates.members())
    })

    router.add('profile/:member', function (r) {
        send(templates.profile({
            member: r.params.member
        }))
    })

    router.add('competitions', function() {
        send(templates.competitions())
    })

    router.add('competition/:competition', function(r) {
        send(templates.competition({
            competition: r.params.competition
        }))
    })


    router.add('js/:file', function (r) {
    	response.setHeader('content-type', 'script/javascript')
        send(fs.readFileSync("src/js/" + r.params.file))
    })


    router.add('api/notation/:competition/:member/:rigging', function(r) {
        response.setHeader('Content-Type', 'application/json')
        if (request.method === 'POST') {
			var result = ''
			request.on('data', function(chunk) {
				result += chunk
			})
			request.on('end', function() {
                let notation = JSON.parse(result.split('\n')[3])
                notation.competitionId = r.params.competition
                notation.memberId = r.params.member
                notation.riggingId = r.params.rigging
                database.Notation.create(notation).then(function() {
                    response.end(JSON.stringify({ok: true}))
                })
			})
		} else {
			response.writeHead(404)
			response.end()
		}
    })

    router.add('api/ranking/:competition', function(r) {
        response.setHeader('Content-Type', 'application/json')
        database.Notation.findAll({
            where: {competitionId: r.params.competition},
            include: [
                {model: database.Member},
                {model: database.Rigging},
                {model: database.Competition}
            ]
        }).then((result) => {
            send(JSON.stringify(result))
        })
    })

    router.add('api/ranking/:competition/:member', function(r) {
        response.setHeader('Content-Type', 'application/json')
        database.Notation.findAll({
            where: {competitionId: r.params.competition, memberId: r.params.member},
            include: [
                {model: database.Member},
                {model: database.Rigging},
                {model: database.Competition}
            ]
        }).then((result) => {
            send(JSON.stringify(result))
        })
    })

    router.add('api/members', function() {
        response.setHeader('Content-Type', 'application/json')
        database.Member.findAll().then((result) => {
            send(JSON.stringify(result))
        })
    })

    router.add('api/members/:member', function(r) {
        response.setHeader('Content-Type', 'application/json')
        database.Member.findAll({
            where: {id: r.params.member},
            include: [
                {
                    model: database.Notation,
                    include: [
                        {model: database.Competition},
                        {model: database.Rigging}
                    ]
                }
            ]
        }).then((result) => {
            send(JSON.stringify(result[0]))
        })
    })

    router.add('api/competitions', function() {
        response.setHeader('Content-Type', 'application/json')
        if (request.method === 'POST') {
			var result = ''

			request.on('data', function(chunk) {
				result += chunk
			})

			request.on('end', function() {
                let competition = JSON.parse(result.split('\n')[3])
                database.Competition.create(competition).then(function() {
                    send(JSON.stringify({ok: true}))
                })
            })
        } else {
            database.Competition.findAll().then((result) => {
                send(JSON.stringify(result))
            })
        }
    })

    router.add('api/competitions/:competition', function(r) {
        response.setHeader('Content-Type', 'application/json')
        database.Competition.findAll({
            where: {id: r.params.competition},
            include: [
                {
                    model: database.Notation,
                    include: [
                        {model: database.Member},
                        {model: database.Rigging}
                    ]
                }
            ]
        }).then((result) => {
            send(JSON.stringify(result[0]))
        })
    })

    router.add('api/competitions/:competition/riggings', function(r) {
        response.setHeader('Content-Type', 'application/json')
        database.Rigging.findAll({
            include: [
                {
                    where: {competitionId: r.params.competition},
                    required: false,
                    model: database.Notation,
                    include: [
                        {model: database.Member}
                    ]
                }
            ]
        }).then((result) => {
            send(JSON.stringify(result))
        })
    })


    if (!router.run(request.url)) send('404')
})
