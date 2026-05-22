/** Production site URL for canonicals, OG URLs, and JSON-LD. */
export const SITE_ORIGIN = 'https://doctoraibolit.com'

export const DEFAULT_DOCUMENT_TITLE =
  'AI Health Guidance | Private Symptom Support – Doctor AI Bolit'

export const DEFAULT_META_DESCRIPTION =
  'AI health guidance and private symptom support. Get instant answers about symptoms, wellness, and next steps — no signup required. Not a medical service.'

export const DEFAULT_OG_IMAGE =
  'https://doctoraibolit-og-images.s3.us-east-1.amazonaws.com/og-image-20260508.png'

/** Served from origin; same artwork as OG, resampled ≥1200px wide for Product / Google rich-result image requirements */
export const PRODUCT_SCHEMA_PRIMARY_IMAGE = `${SITE_ORIGIN}/og-schema-product.jpg`

export const PRODUCT_SCHEMA_PRIMARY_IMAGE_WIDTH = 1200
export const PRODUCT_SCHEMA_PRIMARY_IMAGE_HEIGHT = 1023
