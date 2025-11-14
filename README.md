# Sanity Media Plugin - Electrolux Version (for Sanity Studio v3)

> This plugin is for **Sanity Studio v3**.  
> This is a forked version of Sanitys own [Media Plugin (v4.0.0)](https://github.com/sanity-io/sanity-plugin-media)

## What is it?

A Sanity Studio v3 plugin that extends media handling capabilities with custom enhancements, based on a fork of an original plugin by Sanity.io.

A convenient way to browse, manage and refine your [Sanity](https://www.sanity.io/) assets.

Use it standalone as a browser, or optionally hook it up as a [custom asset source](https://www.sanity.io/docs/custom-asset-sources) and use it to power both image and file selection too.

![Grid view](https://user-images.githubusercontent.com/209129/108927411-21aa7f00-7638-11eb-9cf7-334598ac4103.png)
_Default grid view_


_Asset details tab_          |  _Asset alt texts tab_
:-------------------------:|:-------------------------:
![first](https://github.com/user-attachments/assets/477b6576-a1a4-42e2-b2c2-2d2e962eb366)  |  ![second](https://github.com/user-attachments/assets/2c5bd907-1b60-48c6-a007-2f7304409007)


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

#### Added support for multi-language alt texts

- Define a list of available languages to enable multi-language alt texts for assets.
- See example of how to enable this feature [here](###plugin-config).

## Install (Sanity Studio v3)

In your Sanity project folder:

```zsh
npm install --save sanity-plugin-media
```

or

```zsh
yarn add sanity-plugin-media
```

## Usage

Add it as a plugin in your `sanity.config.ts` (or .js) file:

```js
import { media } from 'sanity-plugin-media'

export default defineConfig({
  // ...
  plugins: [
    media(      
      languages: [
        { code: 'en-US', title: 'English', default: true },
        { code: 'sv-SE', title: 'Swedish' },
        { code: 'fr-FR', title: 'French' },
        { code: 'de-DE', title: 'German' }
      ],
    )
  ]
})
```

This will enable the Media plugin as both a standalone tool (accessible in your studio menu) and as an additional asset source for your image and file fields.

### Customizing the asset source

You can configure your studio to use this asset source either exclusively, or conditionally enable it based on the type of asset (image or file).

```js
import { media, mediaAssetSource } from 'sanity-plugin-media'

export default defineConfig({
  // ...
  plugins: [media()],
  form: {
    // Don't use this plugin when selecting files only (but allow all other enabled asset sources)
    file: {
      assetSources: previousAssetSources => {
        return previousAssetSources.filter(assetSource => assetSource !== mediaAssetSource)
      }
    }
  }
})
```

### Plugin Config

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
        excludeSources: ['unsplash'],
        // string | string[] - when used with 3rd party asset sources, you may
        // wish to prevent users overwriting the creditLine based on the `source.name`
      },
      maximumUploadSize: 10000000
      // number - maximum file size (in bytes) that can be uploaded through the plugin interface
    })
  ],
})
```

## Develop locally

### Test your plugin locally

In the plugin directory run this command:
```zsh
npm run link-watch
```

This will set up your plugin to build whenever the code changes, and publish the package to a local yalc repository.

Run the command in the studio project directory:

```zsh
npx yalc add @electrolux-oss/sanity-plugin-media && npx yalc link @electrolux-oss/sanity-plugin-media && npm install
```

You should see something like this in the `package.json` file:

```
"@electrolux-oss/sanity-plugin-media": "file:.yalc/@electrolux-oss/sanity-plugin-media",
```

Which means you can safely use the local version of the plugin with this import:

```
import { media } from '@electrolux-oss/sanity-plugin-media'
```
