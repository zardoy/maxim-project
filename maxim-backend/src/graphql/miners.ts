import {
    enumType,
    list,
    mutationField,
    nullable,
    objectType,
    queryField,
    stringArg,
    intArg
} from 'nexus'
import { prisma } from '..'
import { subscriptionField } from '@nexus/schema'
import { otherUserMadeEdits } from './events'
import { Miner } from 'nexus-prisma'
// import { ForbiddenError, ValidationError } from 'apollo-server-core'

export default [
    objectType({
        name: 'MinerId',
        definition(t) {
            t.id('id')
        }
    }),

    objectType({
        name: Miner.$name,
        description: Miner.$description,
        definition(t) {
            for (const [key, item] of Object.entries(Miner)) {
                if (key.startsWith('$')) continue
                t.field(key, {
                    type: item.type,
                })
            }
            // custom fields
        },
    }),

    queryField('getMiners', {
        type: 'Miner',
        args: {
        },
        async resolve(_) {
            return await prisma.miner.findMany()
        },
    }),
    mutationField('createMiner', {
        type: 'Miner',
        args: {
            model: stringArg(),
            hashrate: intArg(),
        },
        async resolve(_, args) {
            return await prisma.miner.create({
                data: args
            })
        },
    }),
    subscriptionField('otherUserMadeEdits', {
        type: 'MinerId',
        subscribe(root, args, context, info) {
            return asyncGenerator(otherUserMadeEdits)
        },
        resolve(payload) {
            return payload
        }
    })
]

async function* asyncGenerator(eventEmitter: import("events")) {
    let resolve;
    let promise = new Promise<any>(r => resolve = r);

    const handler = (value) => {
        resolve({ done: false, value });
        promise = new Promise<any>(r => resolve = r);
    };
    eventEmitter.on('data', handler);

    try {
      while (true) {
        const result = await promise;
        yield result.value;
      }
    } finally {
        eventEmitter.off('data', handler);
    }
}

// setInterval(() => {
//     otherUserMadeEdits.emit('data', { id: '1' })
// }, 1000)
