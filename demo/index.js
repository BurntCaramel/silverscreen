const Hapi = require('hapi')
const Boom = require('boom')
const Joi = require('joi')

const server = new Hapi.Server()
server.connection()


const SilverScreen = require('silverscreen')

const base = SilverScreen

const payloadValidator = Joi.object({
	args: Joi.array()
})

const routes = Object.keys(base).map((methodName) => ({
	method: 'POST',
	path: `/${methodName}`,
	config: {
		validate: {
			payload: payloadValidator
		},
		handler({ payload }, reply) {
			const { args } = payload
			reply(
				base[methodName].apply(base, args)
			)
		}
	}
}))

server.route(routes)

server.route({
	method: 'GET',
	path: '/',
	handler(request, reply) {
		reply(
			Object.keys(base).map((methodName) => ({
				name: methodName,
				argCount: base[methodName].length
			}))
		)
	}
})

server.start()
