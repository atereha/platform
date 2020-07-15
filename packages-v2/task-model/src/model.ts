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

import { StringProperty } from '@anticrm/platform'

import { UIBuilder } from '@anticrm/presentation-model'

import core from '@anticrm/platform-model'
import workbench from '@anticrm/workbench-model'
import task from '.'


export default (S: UIBuilder) => {

  S.createDocument(workbench.class.Application, {
    label: 'Задачи' as StringProperty,
    icon: task.icon.Task,
    main: task.component.Main
  }, task.application.Task)

  S.createClass(task.class.Task, core.class.VDoc, {
    name: S.attrUI(core.class.Type, {}, {
      label: task.string.Task_name
    }),
    description: S.attrUI(core.class.Type, {}, {
      label: task.string.Task_description
    }),
  })
}