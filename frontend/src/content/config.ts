import {defineCollection, z} from 'astro:content'

const features = defineCollection({
    schema: z.object({
        title: z.string(),
        image: z.string(),
        imageCopyAfter: z.string().optional(),
        imageCopyText: z.string().optional(),
        imageCopyLink: z.string().optional()
    })
});

export const collections = {features};