import { GraphQLClient, gql } from 'graphql-request'
import { useEffect, useState } from 'react'

//@ts-ignore
export const API_BASE_URL = process.env.NODE_ENV === 'production' ? `${location.origin}/graphql` : 'http://localhost:4000/graphql'

export const useFetch = <T>({ enabled = true, variables = {}, document, stateCounter = 0 }) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(enabled)

    useEffect(() => {
        console.log('useEffect')
        if (!enabled) return
        ;(async () => {
            console.log('fetching')
            setLoading(true)
            const data = await new GraphQLClient(API_BASE_URL).request(document, variables)
            setData(data as T)
            setLoading(false)
        })()
    }, [enabled, stateCounter])

    return { data, loading }
}

export const plainFetch = ({ document, variables }) => {
    return new GraphQLClient(API_BASE_URL).request(document, variables)
}
