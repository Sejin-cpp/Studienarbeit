import { Schema, Context, type } from "@colyseus/schema";

export class GaigelState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";

}