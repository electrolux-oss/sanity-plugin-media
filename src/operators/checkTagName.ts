import type { SanityClient } from '@sanity/client'
import groq from 'groq'
import { from, Observable, of, throwError } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import { TAG_DOCUMENT_NAME } from '../constants'
import type { HttpError } from '../types'

const checkTagName = (client: SanityClient, name: string) => {
  return function <T>(source: Observable<T>): Observable<boolean> {
    return source.pipe(
      mergeMap(() => {
        return from(
          client.fetch<number>(
            groq`count(*[_type == "${TAG_DOCUMENT_NAME}" && name.current == $name])`,
            { name }
          )
        )
      }),
      mergeMap(existingTagCount => {
        if (existingTagCount > 0) {
          const error: HttpError = {
            message: 'Tag already exists',
            statusCode: 409
          }
          return throwError(() => error)
        }

        return of(true)
      })
    )
  }
}

export default checkTagName
