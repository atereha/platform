//
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { AnyLayout, Class, CoreProtocol, CreateTx, Doc, Ref, Tx, VDoc } from '@anticrm/platform'

import { openDB } from 'idb'
import { ModelDb } from './modeldb'
import core from '.'

export interface CacheControl {
  cache (docs: Doc[]): Promise<void>
}

export async function createCache (dbname: string, modelDb: ModelDb): Promise<CoreProtocol & CacheControl> {
  const db = await openDB(dbname, 1, {
    upgrade (db) {
      const domains = new Map<string, string>()
      const classes = modelDb.findClasses({})
      for (const clazz of classes) {
        const domain = clazz._domain as string
        if (domain && !domains.get(domain)) {
          domains.set(domain, domain)
          console.log('create object store: ' + domain)
          const objectStore = db.createObjectStore(domain, { keyPath: '_id' })
          objectStore.createIndex('_class', '_class', { unique: false })
        }
      }
    }
  })

  async function store (docs: Doc[]): Promise<void> {
    if (docs.length === 0) { return }
    const domains = new Map<string, Doc[]>()
    for (const doc of docs) {
      const domain = modelDb.getDomain(doc._class)
      let perDomain = domains.get(domain)
      if (!perDomain) {
        perDomain = []
        domains.set(domain, perDomain)
      }
      perDomain.push(doc)
    }
    const domainNames = Array.from(domains.keys())
    if (domainNames.length === 0) {
      throw new Error('no domains!')
    }
    console.log('domain names: ', domainNames)
    const tx = db.transaction(domainNames, 'readwrite')
    for (const e of domains.entries()) {
      const store = tx.objectStore(e[0])
      for (const doc of e[1]) {
        console.log('PUT', e[0], doc)
        store.put(doc)
      }
    }
    return tx.done
  }

  /**
   * Apply given transaction to cached results.
   * @param tx
   */
  function apply (tx: Tx): Promise<void> {
    const _class = tx._class
    switch (_class) {
      case core.class.CreateTx: {
        const create = tx as CreateTx
        const doc: VDoc = {
          _class: create._objectClass,
          _id: create._objectId,
          _createdBy: create._user,
          _createdOn: create._date,
          ...create._attributes
        }
        return store([doc])
      }
      default:
        throw new Error('not implemented (apply tx)')
    }
  }

  const cache: CoreProtocol & CacheControl = {

    async find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> { // eslint-disable-line
      console.log('indexeddb find: ', _class)
      const result = [] as Doc[]
      const domain = modelDb.getDomain(_class)
      const tx = db.transaction(domain)
      const store = tx.objectStore(domain)
      const index = store.index('_class')
      const range = IDBKeyRange.bound(_class, _class)
      let cursor = await index.openCursor(range)
      while (cursor) {
        // console.log('cursor value: ', cursor.value)
        result.push(cursor.value)
        cursor = await cursor.continue()
      }
      return result
    },

    tx (tx: Tx): Promise<void> {
      return Promise.all([store([tx]), apply(tx)]).then()
    },

    loadDomain (domain: string): Promise<Doc[]> {
      throw new Error('not implemented')
    },

    /// /

    cache: store
  }

  return cache
}