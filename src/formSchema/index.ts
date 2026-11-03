import * as z from 'zod'

import type { MediaToolOptions } from '../types'

export const tagOptionSchema = z.object({
  label: z.string().trim().min(1, { error: 'Label cannot be empty' }),
  value: z.string().trim().min(1, { error: 'Value cannot be empty' })
})

export const tagFormSchema = z.object({
  name: z.string().min(1, { error: 'Name cannot be empty' })
})

const hasText = (text: string | null | undefined): boolean => Boolean(text?.trim())

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAssetFormSchema = (
  languages: MediaToolOptions['languages'],
  validateAltTexts: boolean = false
) => {
  const defaultLanguage = languages.find(lang => lang.default)

  const createAltTextsSchema = () => {
    const baseSchema = z.record(z.string(), z.string().nullish())

    if (!validateAltTexts) {
      return baseSchema
    }

    if (defaultLanguage) {
      return baseSchema.refine(altTexts => hasText(altTexts[defaultLanguage.code]), {
        error: `Alt text is required for the default language (${defaultLanguage.title}).`,
        path: [defaultLanguage.code]
      })
    }

    return baseSchema.refine(altTexts => Object.values(altTexts).some(hasText), {
      error: 'At least one language must have alt text.'
    })
  }

  return z.object({
    altText: z.string().trim().optional(),
    altTexts: createAltTextsSchema(),
    creditLine: z.string().trim().optional(),
    description: z.string().trim().optional(),
    opt: z.object({
      media: z.object({
        tags: z.array(tagOptionSchema).nullable()
      })
    }),
    originalFilename: z.string().trim().min(1, { error: 'Filename cannot be empty' }),
    title: z.string().trim().optional()
  })
}

export type AssetFormSchemaObject = ReturnType<typeof createAssetFormSchema>
