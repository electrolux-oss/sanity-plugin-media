import type {
  FieldDefinitionBase,
  FileDefinition,
  ImageDefinition,
  WidenInitialValue,
  WidenValidation
} from 'sanity'

import { AutoTagInput } from '../components/AutoTagInput'

type MediaFieldConfig<T extends ImageDefinition | FileDefinition> = Omit<T, 'options'> &
  FieldDefinitionBase & {
    name: string
    mediaTags: string[]
    options?: T['options']
  }

type MediaFieldResult<T extends ImageDefinition | FileDefinition> = Omit<T, 'options'> &
  FieldDefinitionBase & {
    options?: T['options'] & { mediaTags: string[] }
    components: { input: typeof AutoTagInput }
  } & WidenValidation &
  WidenInitialValue

/**
 * Defines an image or file field whose selected / uploaded assets are tagged with `mediaTags`.
 *
 * `mediaTags` is copied to `options.mediaTags` (which pre-filters the media browser) and
 * {@link AutoTagInput} is set as the input component.
 *
 * ```ts
 * mediaField({ name: 'image', type: 'image', mediaTags: ['product'] })
 * ```
 */
export function mediaField(
  config: MediaFieldConfig<ImageDefinition>
): MediaFieldResult<ImageDefinition>
export function mediaField(
  config: MediaFieldConfig<FileDefinition>
): MediaFieldResult<FileDefinition>
export function mediaField(
  config: MediaFieldConfig<ImageDefinition> | MediaFieldConfig<FileDefinition>
): MediaFieldResult<ImageDefinition> | MediaFieldResult<FileDefinition> {
  const { mediaTags, options, components, ...rest } = config

  return {
    ...rest,
    options: { ...options, mediaTags },
    components: { ...components, input: AutoTagInput }
  } as unknown as MediaFieldResult<ImageDefinition>
}
