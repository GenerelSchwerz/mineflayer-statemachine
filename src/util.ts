import { State } from "./baseState";
import { Transition } from "./transition";

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type OmitTwo<T extends any[]> = T extends [any, any, ...infer R] ? R : never;

export type OnEnterArgs<_State extends State<any>> = ArgumentTypes<_State["onStateEntered"]>;

export type HasEnterArgs<Child extends State<any>> = Required<OnEnterArgs<Child>> extends [first: any, ...any: any[]] ? Child : never;

export type NoEnterArgs<Child extends State<any>> = OnEnterArgs<Child> extends [first: any, ...any: any[]] ? never : Child;

export type ExtractData<Type> = Type extends State<infer Data> ? Data : never;


export type MergeArray<ToMerge extends readonly any[]> = ToMerge extends readonly (infer Internal)[] ? Internal: never;
// export type MergeStates<
//   Data,
//   ToMerge extends readonly any[],
//   Final extends State<Data> = State<Data>,
//   Start extends boolean = false
// > = ToMerge extends []
//   ? Final
//   : ToMerge extends readonly [first: infer R extends State<Data>, ...i: infer Rest extends readonly State<Data>[]]
//   ? Start extends true
//     ? MergeStates<Data, Rest, Final | R, Start>
//     : MergeStates<Data, Rest, R, true>
//   : State<Data>;


type ExtractStateTypings<
  Data,
  Trans extends readonly any[],
  Ret0 extends State<Data>[] = [],
  Ret1 extends State<Data>[] = []
> = Trans extends []
  ? [Ret0, Ret1]
  : Trans extends [infer First extends Transition<any,any,any>, ...infer Rest] ?
    ExtractStateTypings<Data, Rest, [...Ret0, ...First["baseStates"]], [...Ret1, First["nextState"]]>
    : Trans

