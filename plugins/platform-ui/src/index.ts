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

import { App } from 'vue'
import { Property, Resource, Metadata, plugin, Plugin, Service } from '@anticrm/platform'
import { Obj, Ref, Class, Type, Doc } from '@anticrm/platform-core'
import { IntlString } from '@anticrm/platform-core-i18n'

export type Asset = Metadata<string>

export type VueConstructor = object
export type Component<C extends VueConstructor> = Resource<C>
export type AnyComponent = Component<VueConstructor>
export type ComponentRef = Property<AnyComponent>

/// M O D E L

export interface UIDecorator { // interface
  label?: IntlString
  icon?: Asset
}

export interface TypeUIDecorator<T> extends Type<T>, UIDecorator {
  placeholder?: IntlString
}

export interface ClassUIDecorator<T extends Obj> extends Class<T> {
  //decorators: Record<string, TypeUIDecorator<any>>
}

export interface Form<T extends Obj> extends ClassUIDecorator<T> {
  form: ComponentRef
}

/// P L U G I N

export interface UIState {
  app: AnyComponent | undefined
}

export interface UIService extends Service {
  getApp (): App
  addState (plugin: Plugin<Service>, state: any): void
}

export default plugin('boot' as Plugin<UIService>, {}, {
  metadata: {
    DefaultApplication: '' as Metadata<AnyComponent>
  },
  class: {
    Form: '' as Ref<Class<Form<Doc>>>
  }
})
