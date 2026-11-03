import * as z from 'zod'

const assetValueSchema = z.object({
  asset: z.object({ _ref: z.string() })
})

/** Reads the asset reference from an image or file field value of unknown shape. */
export const getAssetRef = (value: unknown): string | undefined => {
  const result = assetValueSchema.safeParse(value)

  return result.success ? result.data.asset._ref : undefined
}
