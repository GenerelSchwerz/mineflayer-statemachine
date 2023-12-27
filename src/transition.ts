import { State } from "./baseState";
import { WildcardState } from "./behaviors";
import { MergeArray, OnEnterArgs } from "./util";

/**
 * The parameters for initializing a state transition.
 */
export interface TransitionInfo<Data, Parents extends readonly State<Data>[] = readonly State<Data>[], Child extends State<Data> = State<Data>> {
  parents: Parents;
  child: Child;
  enterArgs: OnEnterArgs<Child>;
  name?: string;
  shouldTransition?: (state: MergeArray<Parents>) => boolean;
  onTransition?: (data: Data) => void;
}

/**
 * A transition that links when one state (the parent) should transition
 * to another state (the child).
 */
export class Transition<Data, Parents extends readonly State<Data>[] = readonly State<Data>[], Child extends State<Data> = State<Data>> {
  readonly baseStates: Parents;
  readonly nextState: Child;
  public readonly enterArgs: TransitionInfo<Data, Parents, Child>["enterArgs"];
  private triggerState: boolean = false;
  shouldTransition: (state: MergeArray<Parents>) => boolean;
  onTransition: (data: Data) => void;
  name?: string;
  #isWild?: boolean;

  constructor({
    parents,
    child,
    name,
    enterArgs,
    shouldTransition = (data) => false,
    onTransition = (data) => {},
  }: TransitionInfo<Data, Parents, Child>) {
    this.baseStates = parents;
    this.nextState = child;
    this.enterArgs = enterArgs;
    this.name = name;

    this.shouldTransition = shouldTransition;
    this.onTransition = onTransition;
  }


  public get isWildcard() {
    if (this.#isWild !== undefined) 
      return this.#isWild
    return this.#isWild = this.baseStates.find(s=>s.constructor===WildcardState) !== undefined
  }

  trigger(): void {
    this.triggerState = true;
  }

  isTriggered(): boolean {
    return this.triggerState;
  }

  resetTrigger(): void {
    this.triggerState = false;
  }

  shouldTransit(should: (state: MergeArray<Parents>) => boolean): this {
    this.shouldTransition = should;
    return this;
  }

  onTransit(onTrans: (data: Data) => void): this {
    this.onTransition = onTrans;
    return this;
  }

  
}
