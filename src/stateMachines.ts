import EventEmitter from "events";
import { Bot } from "mineflayer";
import { State } from "./baseState";
import { Transition } from "./transition";
import { EventMap } from "typed-emitter";
import StrictEventEmitter from "strict-event-emitter-types";
import { ExtractData } from "./util";

export interface NestedMachineEvents {
  stateEntered: (oldBehavior: State<any>, data: any) => void;
  stateExited: (oldBehavior: State<any>, data: any) => void;
}

export type NSM<Data extends EventMap> = {
  emit<Key extends keyof Data>(eventName: Key, ...args: Parameters<Data[Key]>): void;
  on<Key extends keyof Data>(eventName: Key, listener: (...args: Parameters<Data[Key]>) => void): void;
};


export class NestedStateMachine<Data>
  extends (EventEmitter as new () => StrictEventEmitter<EventEmitter, NestedMachineEvents>)
  implements State<Data>
{
  public readonly stateName: string;
  public readonly transitions: Transition<Data>[];
  public readonly states: State<Data>[];
  public readonly enter: State<Data>;
  public readonly enterArgs: any[] | undefined = undefined; // StateConstructorArgs<typeof this.enter>; // sadly, this is always undefined (no static generics).
  public readonly exits?: readonly State<Data>[] | undefined;

  protected _activeState?: State<Data>;

  public readonly bot: Bot;
  public readonly data: Data;
  public active: boolean = false;

  public constructor(
    bot: Bot,
    data: Data,
    transitions: Transition<Data>[],
    enter: State<Data>,
    enterArgs: any[] = [],
    name?: string,
    exits?: readonly State<Data>[]
  ) {
    // eslint-disable-next-line constructor-super
    super();
    this.bot = bot;
    this.data = data;
    this.stateName = name ?? this.constructor.name;
    this.transitions = transitions;
    this.enter = enter;
    this.enterArgs = enterArgs;
    this.exits = exits;

    this.states = [];
    this.loadStates();
  }

  private loadStates() {
    for (const transition of this.transitions) {
      for (const state of transition.baseStates) {
        if (!this.states.includes(state)) {
          this.states.push(state);
        }
      }
      if (!this.states.includes(transition.nextState)) {
        this.states.push(transition.nextState);
      }
    }
  }

  /**
   * Getter
   */
  public get activeState(): State<Data> | undefined {
    return this._activeState;
  }

  public onStateEntered(): void {
    this.enterState(this.enter, this.enterArgs);
  }

  public onStateExited(): void {
    this.exitActiveState();
    this._activeState = undefined;
  }

  protected enterState(state: State<Data>, ...args: any[]): void {
    this._activeState = state;
    this._activeState.active = true;
    this.emit("stateEntered", this._activeState, this.data);
    this._activeState.onStateEntered?.(...args);
    this._activeState.update?.();
  }

  protected exitActiveState(): void {
    if (this._activeState == null) return;
    this._activeState.active = false;
    this.emit("stateExited", this._activeState, this.data as Data);
    this._activeState.onStateExited?.();
  }

  public update(): void {
    // update will only occur when this is active anyway, so return if not.
    // console.log(this.activeStateType, this._activeState == null);
    if (this._activeState == null) return;
    this._activeState.update?.();
    for (let i = 0; i < this.transitions.length; i++) {
      const transition = this.transitions[i];
      if (
        transition.baseStates.includes(this._activeState) ||
        transition.isWildcard
        // transition.baseStates.includes(WildcardState)
      ) {
        if (transition.isTriggered() || transition.shouldTransition(this._activeState)) {
          transition.resetTrigger();
          i = -1;
          transition.onTransition(this.data);
          this.exitActiveState();
          this.enterState(transition.nextState, transition.enterArgs);
        }
      }
      // transition.resetTrigger() // always reset to false to avoid false positives.
    }
  }

  /**
   * Checks whether or not this state machine layer has finished running.
   */
  public isFinished(): boolean {
    if (this.active == null) return true;
    if (this._activeState == null) return true;
    if (this.exits == null) return false;
    return this.exits.includes(this._activeState);
  }
}

export type NestedStateMachine1<Inp> = StrictEventEmitter<EventEmitter, Inp> & NestedStateMachine<Inp>;

// export type NestedStateMachine1<Data extends EventMap> = NestedStateMachine<Data> & NSM<Data>;
