// import { ApolloServer } from '@apollo/server'
import { ApolloServer } from 'apollo-server-express'
import { PrismaClient } from '@prisma/client'
import { schema } from './schema'
import * as express from 'express'
import * as HTTP from 'http'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

// import './sentry'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'

export const prisma = new PrismaClient()

//@ts-ignore
const app: express.Express = (express.default || express)()
const httpServer = HTTP.createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer as any);

export const apollo = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
})

apollo.start().then(() => {
  apollo.applyMiddleware({
      app,
      path: '*',
  })
  // apollo.installSubscriptionHandlers(http)
  httpServer.listen(process.env.NODE_ENV === 'production' ? 8081 : 4000, () => {
    console.log(`🚀 GraphQL service ready at http://localhost:4000/graphql`)
  })
})
