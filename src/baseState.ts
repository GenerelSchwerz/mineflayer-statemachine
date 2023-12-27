import { Bot } from "mineflayer";

export abstract class State<Data> {
  /**
   * Name displayed on the webserver.
   */
  readonly stateName: string;

  /**
   * Bot the state is related to.
   */
  readonly bot: Bot;

  /**
   * Data instance.
   */
  readonly data: Data;

  /**
   * Gets whether or not this state is currently active.
   */
  active: boolean = false;

  /**
   * Called when the bot enters this behavior state.
   */
  onStateEntered(...args: any[]): void {}

  /**
   * Called each tick to update this behavior.
   */
  update?(): void {}

  /**
   * Called when the bot leaves this behavior state.
   */
  onStateExited?(): void {}

  /**
   * Called if the behavior is anonymous per tick, checks if task is complete.
   */
  isFinished(): boolean {
    return false;
  }

  constructor(bot: Bot, data: Data, name?: string) {
    this.bot = bot;
    this.data = data;
    this.stateName = name ?? this.constructor.name;
  }
}
