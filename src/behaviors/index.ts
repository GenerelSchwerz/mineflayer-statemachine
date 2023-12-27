import { Bot } from "mineflayer";
import { State } from "../baseState";

export class WildcardState<Data> extends State<Data> {
  constructor(bot: Bot, data: Data) {
    super(bot, data, "WildcardState");
  }
}
