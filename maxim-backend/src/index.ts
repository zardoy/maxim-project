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
import { join } from 'path'

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
      path: '/graphql',
  })
  app.use(express.static(join(__dirname, './dist')))
  // apollo.installSubscriptionHandlers(http)
  const port = process.env.NODE_ENV === 'production' ? 9091 : 4000;
  httpServer.listen(port, () => {
    console.log(`🚀 GraphQL service ready at http://localhost:${port}/graphql`)
  })
})
