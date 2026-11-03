import { defineField, defineType } from 'sanity'

import { TAG_DOCUMENT_NAME } from '../constants'
import TagIcon from '../components/TagIcon'

export default defineType({
  title: 'Media Tag',
  icon: TagIcon,
  name: TAG_DOCUMENT_NAME,
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'slug'
    })
  ],
  preview: {
    select: {
      name: 'name'
    },
    prepare({ name }) {
      return {
        media: TagIcon,
        title: name?.current
      }
    }
  }
})
