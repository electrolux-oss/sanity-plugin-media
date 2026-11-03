import { type SanityClient, useClient } from 'sanity'

const useVersionedClient = (): SanityClient => useClient({ apiVersion: '2022-10-01' })

export default useVersionedClient
