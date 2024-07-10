import {
    AdminProductsRes,
    MedusaRequest,
    MedusaResponse,
    ProductStatus,
  } from "@medusajs/medusa";
  import { GET_PRODUCT_BY_ID, GET_PRODUCT_BY_URL } from "../queries";
  import { medusaClient, ryeClient } from "../../clients";
  import { AnyVariables, OperationResult } from "@urql/core";
  import { ResponsePromise } from "@medusajs/medusa-js";
  
  export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
  ): Promise<void> {
    try {
      const productUrls: { url: string; marketplace: "AMAZON" | "SHOPIFY" }[] = (req.body as any).productUrls;
  
        const marginData = (req.body as any).margin ?? {unit: 'percent', value: 0};
        let margin = 0;
        const isMarginPercent = marginData.unit === 'percent';
        if(marginData.unit === 'percent'){
          margin = marginData.value / 100;
        } else {
          margin = marginData.value;
        }
  
      const productRequests: Promise<OperationResult<any, AnyVariables>>[] = [];
      for (const { url, marketplace } of productUrls) {
        productRequests.push(
          ryeClient
            .mutation(GET_PRODUCT_BY_URL, {
              input: {
                url,
                marketplace,
              },
            })
            .toPromise()
        );
      }
  
      const productIds = (await Promise.all(productRequests)).map((product) => ({
        id: product.data.requestProductByURL.productID,
        marketplace: (product.operation.variables as any).input.marketplace,
      }));
  
      const productPromises = [];
  
      for (const { id, marketplace } of productIds) {
        productPromises.push(
          ryeClient
            .query(GET_PRODUCT_BY_ID, {
              input: {
                id,
                marketplace,
              },
            })
            .toPromise()
        );
      }
  
      const results = await Promise.all(productPromises);
      const medusaProductProms: ResponsePromise<AdminProductsRes>[] = [];
      for (const result of results) {
        console.log(result.data.productByID);
        if (result.data.productByID.isAvailable) {
          let priceWithMargin = result.data.productByID.price.value + margin 
          if(isMarginPercent){
            const marginAmount = result.data.productByID.price.value * margin;
            priceWithMargin =  result.data.productByID.price.value + marginAmount;
          }
  
          medusaProductProms.push(
            medusaClient.admin.products.create({
              title: result.data.productByID.title,
              images: result.data.productByID.images.map((i) => i.url),
              description: result.data.productByID.description,
              thumbnail: result.data.productByID.images[0].url,
              status: ProductStatus.PUBLISHED,
              metadata: {
                marketplaceId: result.data.productByID.id,
                marketplace: result.data.productByID.marketplace,
              },
              variants: [
                {
                  title: result.data.productByID.title,
                  inventory_quantity: 10,
                  metadata: {
                    marketplaceId: result.data.productByID.id,
                    marketplace: result.data.productByID.marketplace,
                  },
                  prices: [
                    {
                      currency_code: result.data.productByID.price.currency,
                      amount: priceWithMargin,
                    },
                  ],
                },
              ],
              is_giftcard: false,
              discountable: false,
            })
          );
        }
      }
  
      const products = (await Promise.all(medusaProductProms)).map(
        (product) => product.product
      );
  
      res.send(products);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }



  /////

  // Import necessary types and functions from Medusa and custom queries
import {
  AdminProductsRes,
  MedusaRequest,
  MedusaResponse,
  ProductStatus,
} from "@medusajs/medusa";
import { GET_PRODUCT_BY_ID, GET_PRODUCT_BY_URL } from "../queries";
import { medusaClient, ryeClient } from "../../clients";
import { AnyVariables, OperationResult } from "@urql/core";
import { ResponsePromise } from "@medusajs/medusa-js";

// Define an asynchronous POST function to handle product creation
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Extract product URLs and marketplace information from the request body
    const productUrls: { url: string; marketplace: "AMAZON" | "SHOPIFY" }[] = (req.body as any).productUrls;

    // Extract margin data from the request body, defaulting to 0% if not provided
    const marginData = (req.body as any).margin ?? {unit: 'percent', value: 0};
    let margin = 0;
    const isMarginPercent = marginData.unit === 'percent';
    if(marginData.unit === 'percent'){
      margin = marginData.value / 100;
    } else {
      margin = marginData.value;
    }

    // Create an array of promises to fetch product information by URL
    const productRequests: Promise<OperationResult<any, AnyVariables>>[] = [];
    
    for (const { url, marketplace } of productUrls) {
      productRequests.push(
        ryeClient
          .mutation(GET_PRODUCT_BY_URL, {
            input: {
              url,
              marketplace,
            },
          })
          .toPromise()
      );
    }

    // Wait for all product requests to complete and extract product IDs
    const productIds = (await Promise.all(productRequests)).map((product) => ({
      id: product.data.requestProductByURL.productID,
      marketplace: (product.operation.variables as any).input.marketplace,
    }));

    // Create an array of promises to fetch detailed product information by ID
    const productPromises = [];
    for (const { id, marketplace } of productIds) {
      productPromises.push(
        ryeClient
          .query(GET_PRODUCT_BY_ID, {
            input: {
              id,
              marketplace,
            },
          })
          .toPromise()
      );
    }

    // Wait for all product detail requests to complete
    const results = await Promise.all(productPromises);
    const medusaProductProms: ResponsePromise<AdminProductsRes>[] = [];

    // Process each product result
    for (const result of results) {
      console.log(result.data.productByID);
      if (result.data.productByID.isAvailable) {
        // Calculate price with margin
        let priceWithMargin = result.data.productByID.price.value + margin 
        if(isMarginPercent){
          const marginAmount = result.data.productByID.price.value * margin;
          priceWithMargin =  result.data.productByID.price.value + marginAmount;
        }

        // Create a new product in Medusa with the fetched information
        medusaProductProms.push(
          medusaClient.admin.products.create({
            title: result.data.productByID.title,
            images: result.data.productByID.images.map((i) => i.url),
            description: result.data.productByID.description,
            thumbnail: result.data.productByID.images[0].url,
            status: ProductStatus.PUBLISHED,
            metadata: {
              marketplaceId: result.data.productByID.id,
              marketplace: result.data.productByID.marketplace,
            },
            variants: [
              {
                title: result.data.productByID.title,
                inventory_quantity: 10,
                metadata: {
                  marketplaceId: result.data.productByID.id,
                  marketplace: result.data.productByID.marketplace,
                },
                prices: [
                  {
                    currency_code: result.data.productByID.price.currency,
                    amount: priceWithMargin,
                  },
                ],
              },
            ],
            is_giftcard: false,
            discountable: false,
          })
        );
      }
    }

    // Wait for all Medusa product creations to complete and extract the products
    const products = (await Promise.all(medusaProductProms)).map(
      (product) => product.product
    );

    // Send the created products as the response
    res.send(products);
  } catch (error) {
    // If an error occurs, send a 500 status with the error message
    res.status(500).send({ error: error.message });
  }
}