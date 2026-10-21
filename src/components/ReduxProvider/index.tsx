import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { createEpicMiddleware, ofType } from 'redux-observable'
import { takeUntil } from 'rxjs'

import { configureStore } from '@reduxjs/toolkit'

import { rootEpic, rootReducer } from '../../modules'
import { initialState as assetsInitialState } from '../../modules/assets'
import getDocumentAssetIds from '../../utils/getDocumentAssetIds'
import { isSupportedAssetType } from '../../utils/isSupportedAssetType'

import type { AnyAction, Store } from '@reduxjs/toolkit'
import {
  type AssetSourceComponentProps,
  type SanityClient,
  type SanityDocument,
  useCurrentUser
} from 'sanity'
import type { ReactNode } from 'react'
import type { RootReducerState } from '../../modules/types'
import type { Uploader } from '../../types'

const EPIC_END_TYPE = 'media/epicEnd'

type Props = {
  assetType?: AssetSourceComponentProps['assetType']
  children?: ReactNode
  client: SanityClient
  document?: SanityDocument
  excludeTagSlugs?: string[]
  selectedAssets?: AssetSourceComponentProps['selectedAssets']
}

type CreatedStore = {
  cancelEnd: () => void
  scheduleEnd: () => void
  store: Store
}

const createReduxStore = (props: Props & { uploader?: Uploader }): CreatedStore => {
  // Initialize redux store + middleware
  const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootReducerState>({
    dependencies: {
      client: props.client, // inject sanity client as a dependency to all epics
      uploader: props.uploader
    }
  })
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        /*
        serializableCheck: {
          ignoredActions: [
            assetsActions.deleteError.type,
            uploadsActions.uploadRequest.type,
            uploadsActions.uploadStart.type,
          ]
        },
        */
        // TODO: remove once we're no longer storing non-serializable data in the store
        serializableCheck: false,
        thunk: false
      }).prepend(epicMiddleware),
    devTools: true,
    preloadedState: {
      assets: {
        ...assetsInitialState,
        assetTypes: isSupportedAssetType(props.assetType) ? [props.assetType] : ['file', 'image'],
        excludeTagSlugs: props.excludeTagSlugs ?? []
      },
      debug: {
        badConnection: false,
        enabled: false
      },
      dialog: { items: [] },
      notifications: { items: [] },
      search: { facets: [], query: '' },
      selected: {
        assets: props.selectedAssets || [],
        document: props.document,
        documentAssetIds: props.document ? getDocumentAssetIds(props.document) : []
      },
      tags: {
        allIds: [],
        byIds: {},
        creating: false,
        fetchCount: -1,
        fetching: false,
        panelVisible: true
      },
      uploads: {
        allIds: [],
        byIds: {}
      }
    }
  })
  epicMiddleware.run((action$, state$, dependencies) =>
    rootEpic(action$, state$, dependencies).pipe(takeUntil(action$.pipe(ofType(EPIC_END_TYPE))))
  )

  let pendingEnd: ReturnType<typeof setTimeout> | null = null

  return {
    store,
    // Ending is deferred a tick: React strict mode unmounts and remounts synchronously in
    // development, and the remount reuses this store, so ending immediately would leave it
    // with no epics running.
    scheduleEnd: () => {
      if (pendingEnd !== null) {
        return
      }

      pendingEnd = setTimeout(() => {
        pendingEnd = null
        store.dispatch({ type: EPIC_END_TYPE })
      }, 0)
    },
    cancelEnd: () => {
      if (pendingEnd === null) {
        return
      }

      clearTimeout(pendingEnd)
      pendingEnd = null
    }
  }
}

const ReduxProvider = ({ children, ...props }: Props) => {
  const currentUser = useCurrentUser()
  const [{ cancelEnd, scheduleEnd, store }] = useState(() =>
    createReduxStore({
      ...props,
      uploader: currentUser ? { id: currentUser.id } : undefined
    })
  )

  useEffect(() => {
    cancelEnd()
    return () => scheduleEnd()
  }, [cancelEnd, scheduleEnd])

  return <Provider store={store}>{children}</Provider>
}

export default ReduxProvider
