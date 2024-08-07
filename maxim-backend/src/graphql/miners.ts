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
import { Miner as PrismaMiner } from '@prisma/client'
import { prisma } from '..'
import { subscriptionField } from '@nexus/schema'
import { otherUserMadeEdits } from './events'
import { Miner } from 'nexus-prisma'
// import { ForbiddenError, ValidationError } from 'apollo-server-core'

const minersColumnsLocalized: Record<keyof PrismaMiner, string | false> = {
    id: false,
    model: 'Модель',
    title: 'Название (свое)',
    hashrate: 'Хэшрейт',
    createdAt: false,
    updatedAt: false,
    image: 'Изображение',
    manufacturer: 'Производитель',
    status: 'Статус',
    minTradeCount: 'Минимальное кол-во',
    weight: 'Вес',
    powerConsumption: 'Потребление энергии',
    coolingType: 'Тип охлаждения',
    miningCoin: 'Майнинг монета',
    miningAlgorithm: 'Майнинг алгоритм',
    isTopMiner: 'Топ-майнер',
    unit: 'Единица Хешрейта',
    openCartId: 'Корзина ID',
    locationType: 'Местоположения',
    locationCity: 'Город Китай',
    deliveryType: 'Логистика',
    costPrice: 'Себестоимость',
    taxes: 'Налог',
}

const tableReadonlyColumns = {
    id: true,
    createdAt: true,
    updatedAt: true,
}

const hideTableDefault: Partial<Record<keyof PrismaMiner, boolean>> = {
    weight: true,
    unit: true,
    image: true,
    minTradeCount: true,
}

const customTableColumns = {

}

type DataOverride = {
    type?: string
    choices?: string[]
    disabled?: boolean
    // todo
    deafultValue?: any
}
const inputsDataOverride: Partial<Record<keyof PrismaMiner, DataOverride>> = {
    unit: {
        choices: [
            'TH/s'
        ],
    },
    image: {
        disabled: true,
    },
    locationType: {
        choices: [
            'Китай',
            'Москва'
        ],
    },
    isTopMiner: {
        type: 'boolean',
    },
    deliveryType: {
        choices: [
            'РФ',
            'РБ',
            'Карго'
        ],
    },
    hashrate: {
        type: 'number',
    },
    weight: {
        type: 'number',
    },
    coolingType: {
        choices: [
            'Воздушное',
            'Водяное'
        ],
    },
    minTradeCount: {
        type: 'number',
    },
    miningCoin: {
        choices: [
            'BTC'
        ],
    },
    locationCity: {
        choices: [
            'Гонконг',
            'Шеньчжень'
        ],
    },
}

const inputsCategories: Record<string, Partial<Record<keyof PrismaMiner, boolean>>> = {
    'Общие сведения': {
        model: true,
        title: true,
        manufacturer: true,
        image: true,
        weight: true,
        isTopMiner: true,
    },
    "Потребление, майнинг, охлаждение": {
        hashrate: true,
        unit: true,
        powerConsumption: true,
        miningCoin: true,
        miningAlgorithm: true,
        coolingType: true,
    },
    'Продажа': {
        minTradeCount: true,
        locationType: true,
        locationCity: true,
        deliveryType: true,
        costPrice: true,
        taxes: true,
        openCartId: true,
    },
}

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

    objectType({
        name: 'Miners',
        definition(t) {
            t.list.field('miners', {
                type: 'Miner',
            })
            t.list.field('columns', {
                type: 'String',
            })
            t.list.field('columnsLocalized', {
                type: 'String',
            })
        },
    }),

    objectType({
        name: 'EditField',
        definition(t) {
            t.string('name')
            t.string('type')
            t.string('label')
            t.nullable.list.string('choices')
            t.nullable.boolean('required')
            t.nullable.boolean('multiline')
            t.nullable.boolean('disabled')
            t.nullable.boolean('disabledReason')
        }
    }),

    objectType({
        name: 'Category',
        definition(t) {
            t.string('name')
            t.list.string('values')
        }
    }),

    objectType({
        name: 'MinerEditor',
        definition(t) {
            t.list.field('fields', {
                type: 'EditField',
            })
            t.list.field('categories', {
                type: 'Category',
            })
        }
    }),

    queryField('getMinerEditor', {
        type: 'MinerEditor',
        args: {
        },
        resolve(_) {
            return {
                fields: Object.entries(minersColumnsLocalized).filter(([key, value]) => value !== false).map(([key, value]) => {
                    const override = inputsDataOverride[key]
                    return {
                        name: key,
                        type: 'string', // js type
                        label: value,
                        ...override,
                    };
                }),
                categories: Object.entries(inputsCategories).map(([key, value]) => ({
                    name: key,
                    values: Object.entries(value).filter(([key, value]) => value !== false).map(([key, value]) => key),
                })),
            }
        }
    }),

    queryField('getMiners', {
        type: 'Miners',
        args: {
        },
        async resolve(_) {
            const columns = Object.entries(minersColumnsLocalized).filter(([key, value]) => value !== false && hideTableDefault[key] !== true)
            const columnsKeys = columns.map(([key, value]) => key as keyof PrismaMiner)
            const columnsLocalized = columns.map(([key, value]) => value as string)
            return {
                miners: await prisma.miner.findMany(),
                columns: columnsKeys,
                columnsLocalized,
            }
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
