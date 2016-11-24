// @flow

const Sequelize = require('sequelize')

module.exports = (database: string, username: string, password: string) => {
    let db = new Sequelize(database, username, password, {logging: () => {}})
    let tables = {}

    tables.Member = db.define('member', {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        firstName: { type: Sequelize.STRING },
        lastName: { type: Sequelize.STRING },
        birthdate: { type: Sequelize.DATE }
    })

    tables.Rigging = db.define('rigging', {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        name: { type: Sequelize.STRING }
    })

    tables.Competition = db.define('competition', {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        name: { type: Sequelize.STRING },
        dateBegining: { type: Sequelize.DATE },
        dateEnding: { type: Sequelize.DATE }
    })

    tables.Notation = db.define('notation', {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        difficulty: { type: Sequelize.FLOAT },
        execution: { type: Sequelize.FLOAT },
        penalty: { type: Sequelize.FLOAT },
        bonus: { type: Sequelize.FLOAT }
    })

    tables.Notation.belongsTo(tables.Member)
    tables.Notation.belongsTo(tables.Competition)
    tables.Notation.belongsTo(tables.Rigging)

    tables.Member.sync().then(() => {
        tables.Competition.sync().then(() => {
            tables.Rigging.sync().then(() => {
                tables.Notation.sync()
            })
        })
    })

    return tables
}
