# Sanity Media Plugin - Electrolux Version (for Sanity Studio v6)

> This plugin supports **Sanity Studio v6.20 and newer**.
> Originally based on Sanity's [sanity-io/sanity-plugin-media](https://github.com/sanity-io/sanity-plugin-media) (v4.0.0, MIT).

> [!WARNING]
> Breaking changes introduced in version 5.0.0 of this plugin. See [Breaking changes](#breaking-changes).

A convenient way to browse, manage and refine your [Sanity](https://www.sanity.io/) assets.

Use it standalone as a browser, or hook it up as a [custom asset source](https://www.sanity.io/docs/custom-asset-sources) to power both image and file selection too.

![Grid view](https://user-images.githubusercontent.com/209129/108927411-21aa7f00-7638-11eb-9cf7-334598ac4103.png)
_Default grid view_

|                                    _Asset details tab_                                    |                                   _Asset alt texts tab_                                    |
| :---------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| ![first](https://github.com/user-attachments/assets/477b6576-a1a4-42e2-b2c2-2d2e962eb366) | ![second](https://github.com/user-attachments/assets/2c5bd907-1b60-48c6-a007-2f7304409007) |

## Features

#### Manage and organise your assets

- Support for batch uploads with drag and drop support
- Edit text fields native to Sanity's asset documents, such as `title`, `description`, `altTexts` and `originalFilename`
- View asset metadata and a limited subset of EXIF data, if present
- Tag your assets individually or in bulk
- Manage tags directly within the plugin
- Get previews for audio and video files
- Easily select and delete multiple assets in bulk

#### Granular search tools

- Refine your search with any combination of search facets such as filtering by tag name, asset usage, file size, orientation, type (and more)
- Use text search for a quick lookup by title, description and alt text

#### Built for large datasets and collaborative editing in mind

- Virtualized grid + tabular views for super speedy browsing, even with thousands of assets and tags
- Utilises Sanity's [real time updates](https://www.sanity.io/docs/realtime-updates) for live changes from other studio members

#### Fits right in with your Sanity studio

- Built with the same [UI components Sanity uses](https://www.sanity.io/ui) under the hood
- Fully responsive and mobile friendly

#### Electrolux additions

- Multi-language alt texts, with validation of the default language (see [Plugin config](#plugin-config))
- Automatic tagging of assets selected or uploaded through a field (see [Auto-tagging assets from a field](#auto-tagging-assets-from-a-field))
- An **Edit Media** option on image and file fields (see [Edit Media](#edit-media))
- A maximum upload size for every upload in the Studio, and tags that hide assets from the browser
- A record of who uploaded each asset (see [Uploaded by](#uploaded-by))

## Install (Sanity Studio v6.20+)

| Package / Runtime     | Requirement |
| --------------------- | ----------- |
| `sanity`              | `^6.20.0`   |
| `react` / `react-dom` | `^19.2.2`   |
| `styled-components`   | `^6.1.15`   |
| Node.js               | `>=22.12`   |

Run

```zsh
npm install --save @electrolux-oss/sanity-plugin-media
```

or

```zsh
yarn add @electrolux-oss/sanity-plugin-media
```

## Usage

Add it as a plugin in your `sanity.config.ts` (or .js) file:

```js
import { media } from '@electrolux-oss/sanity-plugin-media'

export default defineConfig({
  // ...
  plugins: [
    media({
      languages: [
        { code: 'en-US', title: 'English', default: true },
        { code: 'sv-SE', title: 'Swedish' },
        { code: 'fr-FR', title: 'French' },
        { code: 'de-DE', title: 'German' }
      ]
    })
  ]
})
```

This will enable the Media plugin as both a standalone tool (accessible in your studio menu) and as an additional asset source for your image and file fields.

### Customizing the asset source

You can configure your studio to use this asset source either exclusively, or conditionally enable it based on the type of asset (image or file).

```js
import { media, mediaAssetSource } from '@electrolux-oss/sanity-plugin-media'

export default defineConfig({
  // ...
  plugins: [media()],
  form: {
    // Don't use this plugin when selecting files only (but allow all other enabled asset sources)
    file: {
      assetSources: previousAssetSources => {
        return previousAssetSources.filter(
          assetSource => assetSource.name !== mediaAssetSource.name
        )
      }
    }
  }
})
```

### Plugin config

```ts
// sanity.config.ts
export default defineConfig({
  //...
  plugins: [
    media({
      // { code: string; title: string, default?: boolean }[] - the list of languages used for alt texts
      // NOTE! Set only one language to default: true.
      languages: [
        { code: 'en-US', title: 'English', default: true },
        { code: 'sv-SE', title: 'Swedish' },
        { code: 'fr-FR', title: 'French' },
        { code: 'de-DE', title: 'German' }
      ],
      creditLine: {
        enabled: true,
        // boolean - enables an optional "Credit Line" field in the plugin.
        // Used to store credits e.g. photographer, licence information
        excludeSources: ['unsplash']
        // string | string[] - when used with 3rd party asset sources, you may
        // wish to prevent users overwriting the creditLine based on the `source.name`
      },
      maximumUploadSize: 10000000,
      // number - maximum file size (in bytes) for uploads, both through the plugin interface and
      // through the image / file fields' own upload button (any upload-capable asset source)
      directUploads: true,
      // boolean - enable / disable direct uploads through the plugin interface (default true)
      createTagsOnUpload: true,
      // boolean - create tags listed in a field's `mediaTags` if they don't exist yet (default true)
      uploadMenu: false,
      // boolean - offer "Media" as an upload target in image / file fields (default true).
      // Set to false to make the upload button use the workspace's own uploader directly;
      // "Media" is then only listed under "Select"
      excludeTags: ['internal', 'archived'],
      // string[] (optional) - tag slugs (`media.tag` `name.current`). Assets with any of these
      // tags are hidden from the Media browser and asset picker, and the tags themselves are
      // hidden in the tag panel and tag search facet. The asset edit dialog still lists all tags.
      components: {
        details: CustomDetails
      }
    })
  ]
})
```

### Auto-tagging assets from a field

Assets selected or uploaded through a field can be tagged automatically. The same tags pre-filter the media browser when it is opened from that field.

```ts
import { mediaField } from '@electrolux-oss/sanity-plugin-media'

defineType({
  name: 'product',
  type: 'document',
  fields: [
    mediaField({
      name: 'image',
      type: 'image',
      mediaTags: ['product']
    })
  ]
})
```

Or use the input component directly:

```tsx
import { AutoTagInput } from '@electrolux-oss/sanity-plugin-media'

defineField({
  name: 'image',
  type: 'image',
  options: { mediaTags: ['product'] }, // pre-filters the browser
  components: { input: AutoTagInput } // applies tags on select
})

// Or pass mediaTags as a prop to override the field options:
defineField({
  name: 'image',
  type: 'image',
  components: {
    input: props => <AutoTagInput {...props} mediaTags={['product']} />
  }
})
```

Only assets selected after the document is opened are tagged. Existing values are left untouched. Tags missing from the dataset are created unless `createTagsOnUpload` is `false`.

### Uploaded by

The asset details panel shows who uploaded an asset. It is recorded as `opt.media.uploadedBy` (`{ id }`, the Sanity user ID only; the sync button next to it fetches the person's name, and email when Sanity returns it, on demand) when a logged-in user uploads through the Studio: in the Media browser, or with an image / file field's own upload button and drag and drop. Only uploads made in that user's browser are recorded, so collaborators editing the same document are never credited. Assets uploaded by scripts, the CLI, API tokens or before this feature existed show **Unknown**.

### Edit Media

The plugin adds an **Edit Media** option to the asset menu of image and file fields. It opens the edit dialog (title, alt texts, description, tags, …) for the field's current asset, without leaving the document.

## Contributing

See [CONTRIBUTING.md](https://github.com/electrolux-oss/sanity-plugin-media/blob/main/CONTRIBUTING.md) for local development, the checks, and the conventions for branches, commits, pull requests and releases.

## Breaking changes

### **v4 → v5**

This release requires **Sanity Studio v6.20 or newer**, the first Studio release on `@sanity/ui`
^4.4.9. Support for Studio v5 and Studio v6 before 6.20 has been dropped; stay on v4 of this
plugin for older Studios.

- The plugin now uses the same `@sanity/ui` (v4) and `@sanity/client` (v8) versions as the Studio,
  so npm installs one shared copy of each instead of a second one inside the plugin.
- `react-is` is no longer a peer dependency.
- The tag inputs take their colors and fonts from the Studio's theme, so they follow custom themes.

Requirements:

| Package / Runtime     | Requirement |
| --------------------- | ----------- |
| `sanity`              | `^6.20.0`   |
| `react` / `react-dom` | `^19.2.2`   |
| `styled-components`   | `^6.1.15`   |
| Node.js               | `>=22.12`   |

### **v3 → v4**

This release targets **Sanity Studio v5 and v6**. Support for Studio v4 has been dropped, and the
package is now **ESM-only** (the CommonJS build has been removed).

Requirements:

| Package / Runtime                  | Requirement          |
| ---------------------------------- | -------------------- |
| `sanity`                           | `^5.0.0 \|\| ^6.0.0` |
| `react` / `react-dom` / `react-is` | `^19.2.2`            |
| `styled-components`                | `^6.1.15`            |
| Node.js                            | `>=22.12`            |

### **v2 → v3**

This release upgrades the plugin’s peer dependency from **React 18** to **React 19**.  
Projects using this plugin must update to React 19 before upgrading to v3.
