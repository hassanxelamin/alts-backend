import { ProductService, type SubscriberConfig, type SubscriberArgs, type ConfigModule, } from "@medusajs/medusa"
// import { createEmbedding } from './embedding-service'
// import { vectorizeText, vectorizeImage } from '@/lib/vectorize'
// import { 
//     amazonSyncCreateProductsWorkflow,
//     amazonSyncUpdateProductsWorkflow,
//     amazonSyncDeleteProductsWorkflow,
//     shopifySyncCreateProductsWorkflow,
//     shopifySyncUpdateProductsWorkflow,
//     shopifySyncDeleteProductsWorkflow
// } from "../workflows"

export default async function catalogUpdateHandler({ data: product, eventName, container, pluginOptions, }: SubscriberArgs) {
    const configModule: ConfigModule = container.resolve("configModule")



    // const { products } = await medusa.products.list({ handle: product.handle })

    // switch(eventName) {
    //     case ProductService.Events.CREATED:
    //         await handleCreatedEvent(product)
    //         break
    //     case ProductService.Events.UPDATED:
    //         await handleUpdatedEvent(product)
    //         break
    //     case ProductService.Events.DELETED:
    //         await handleDeletedEvent(product)
    //         break
    // }

    // console.log(`Processed ${eventName} for product ${data.id}`)

    console.log(product);
}

export const config: SubscriberConfig = {
    event: [
        ProductService.Events.CREATED,
        ProductService.Events.UPDATED,
        ProductService.Events.DELETED
    ],
    context: {
        subscriberId: "catalog-update-handler",
    },
}


// async function handleCreatedEvent(data: CoreProduct) {
//     const textVector = await vectorizeText(data.name + ' ' + data.description)
//     const imageVector = await vectorizeImage(`/${data.imageId}`)
    
//     await index.upsert({
//         id: data.id,
//         vector: [...textVector, ...imageVector],
//         metadata: {
//             ...data,
//             textVector,
//             imageVector
//         }
//     })

//     await amazonSyncCreateProductsWorkflow.run({ input: data })
//     await shopifySyncCreateProductsWorkflow.run({ input: data })
// }

// async function handleUpdatedEvent(data: CoreProduct) {
//     const textVector = await vectorizeText(data.name + ' ' + data.description)
//     const imageVector = await vectorizeImage(`/${data.imageId}`)
    
//     await index.upsert({
//         id: data.id,
//         vector: [...textVector, ...imageVector],
//         metadata: {
//             ...data,
//             textVector,
//             imageVector
//         }
//     })

//     await amazonSyncUpdateProductsWorkflow.run({ input: data })
//     await shopifySyncUpdateProductsWorkflow.run({ input: data })
// }

// async function handleDeletedEvent(data: { id: string }) {
//     await index.delete(data.id)

//     await amazonSyncDeleteProductsWorkflow.run({ input: data })
//     await shopifySyncDeleteProductsWorkflow.run({ input: data })
// }