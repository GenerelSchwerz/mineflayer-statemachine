import { Bot } from "mineflayer";
import { State } from "../baseState";

export class WildcardState extends State<any> {
  constructor(bot: Bot, data: any) {
    super(bot, data, "WildcardState");
  }
}
