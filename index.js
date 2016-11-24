const server = require('./server')
const config = require('./config')

server.listen(config.port)
