import { Bot } from "mineflayer";
import { State } from "./baseState";
import { NestedStateMachine } from "./stateMachines";
import { Transition } from "./transition";
import { ExtractData, HasEnterArgs, NoEnterArgs, OnEnterArgs } from "./util";


export function newTransition<Child extends State<any>, Data extends ExtractData<Child>, Parents extends readonly State<Data>[]>(
  name: string,
  parents: Parents,
  child: NoEnterArgs<Child>
): Transition<Data, Parents, Child>;
export function newTransition<
  Child extends State<any>,
  Data extends ExtractData<Child>,
  Parents extends readonly State<Data>[],
  Args extends OnEnterArgs<Child>
>(name: string, parents: Parents, child: HasEnterArgs<Child>, enterArgs: Args): Transition<Data, Parents, Child>;
export function newTransition<
  Child extends State<any>,
  Data extends ExtractData<Child>,
  Parents extends readonly State<Data>[],
  Args extends OnEnterArgs<Child>
>(name: string, parents: Parents, child: Child, enterArgs?: Args): Transition<Data, Parents, Child> {
  enterArgs = enterArgs ?? ([] as any);
  /**
   * Ugly hack to make sure the number of arguments passed to the onStateEntered function match.
   */
  if (child.onStateEntered.length !== enterArgs!.length) {
    throw new Error(
      `The number of arguments in the onStateEntered function of ${child.stateName} does not match the number of arguments passed to the transition builder.`
    );
  }

  return new Transition({
    name: name,
    parents: parents,
    child: child,
    enterArgs: enterArgs!,
  });
}

export function newMachine<Enter extends State<any>, Data extends ExtractData<Enter>, Exits extends readonly State<Data>[]>(
  name: string,
  bot: Bot,
  data: Data,
  transitions: Transition<Data>[],
  enter: NoEnterArgs<Enter>,
  exits?: Exits
): NestedStateMachine<Data>;
export function newMachine<
Enter extends State<any>, Data extends ExtractData<Enter>, 
  Args extends OnEnterArgs<Enter>,
  Exits extends readonly State<Data>[]
>(
  name: string,
  bot: Bot,
  data: Data,
  transitions: Transition<Data>[],
  enter: HasEnterArgs<Enter>,
  enterArgs: Args,
  exits?: Exits
): NestedStateMachine<Data>;
export function newMachine<
Enter extends State<any>, Data extends ExtractData<Enter>, 
  Args extends OnEnterArgs<Enter>,
  Exits extends readonly State<Data>[]
>(
  name: string,
  bot: Bot,
  data: Data,
  transitions: Transition<Data>[],
  enter: Enter,
  enterArgs?: Args,
  exits?: Exits
): NestedStateMachine<Data> {
  enterArgs ??= [] as any;
  if (enter.onStateEntered.length !== enterArgs!.length) {
    throw new Error(
      `The number of arguments in the onStateEntered function of ${enter.stateName} does not match the number of arguments passed to the machine builder.`
    );
  }

  return new NestedStateMachine(bot, data, transitions, enter, enterArgs!, name, exits);
}
