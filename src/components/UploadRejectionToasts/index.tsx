import { useToast } from '@sanity/ui'
import filesize from 'filesize'
import { useEffect } from 'react'

import { subscribeToUploadRejections } from '../../utils/withMaximumUploadSize'

const formatSize = (bytes: number) => filesize(bytes, { base: 10, round: 0 })

const UploadRejectionToasts = () => {
  const toast = useToast()

  useEffect(
    () =>
      subscribeToUploadRejections(({ files, maximumUploadSize }) => {
        const fileList = files.map(file => `"${file.name}" (${formatSize(file.size)})`).join(', ')

        toast.push({
          closable: true,
          duration: 10000,
          status: 'error',
          title: files.length === 1 ? 'File is too large' : 'Files are too large',
          description: `${fileList} ${
            files.length === 1 ? 'exceeds' : 'exceed'
          } the maximum upload size of ${formatSize(maximumUploadSize)}.`
        })
      }),
    [toast]
  )

  return null
}

export default UploadRejectionToasts
