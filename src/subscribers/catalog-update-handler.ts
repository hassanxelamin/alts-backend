import { ProductService, type SubscriberConfig, type SubscriberArgs, type ConfigModule, } from "@medusajs/medusa"
// import { syncProductsWorkflow } from "../workflows"

export default async function catalogUpdateHandler({ data, eventName, container, pluginOptions, }: SubscriberArgs) {
    const configModule: ConfigModule = container.resolve("configModule")

    // await syncProductsWorkflow.run({ input: data })

    console.log("hello world!");
    // ...
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