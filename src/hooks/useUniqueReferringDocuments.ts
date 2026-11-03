import type { SanityDocument } from '@sanity/client'
import { useMemo } from 'react'
import { type DocumentField, useReferringDocuments } from 'sanity'

import { getUniqueDocuments } from '../utils/getUniqueDocuments'

const ALL_FIELDS: DocumentField[] = []

/**
 * Listens for documents referring to `id`, counting a draft and its published version once.
 * Every caller opens its own listener, so mount it only where the references are shown.
 */
const useUniqueReferringDocuments = (
  id: string
): { isLoading: boolean; referringDocuments: SanityDocument[] } => {
  const { isLoading, referringDocuments } = useReferringDocuments<SanityDocument>(id, ALL_FIELDS)
  const uniqueDocuments = useMemo(
    () => getUniqueDocuments(referringDocuments),
    [referringDocuments]
  )

  return { isLoading, referringDocuments: uniqueDocuments }
}

export default useUniqueReferringDocuments
