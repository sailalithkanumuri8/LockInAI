/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "Database": {
      "token": string
      "type": "sst.sst.Linkable"
      "url": string
    }
    "Site": {
      "type": "sst.aws.StaticSite"
      "url": string
    }
    "Websocket": {
      "managementEndpoint": string
      "type": "sst.aws.ApiGatewayWebSocket"
      "url": string
    }
  }
}
