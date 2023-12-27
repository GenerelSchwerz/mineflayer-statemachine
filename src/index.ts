import { newMachine, newTransition } from "./builders";
import { State } from "./baseState";
import { WildcardState } from "./behaviors";
import { ExtractData } from "./util";

type Data1 = { hi: "hi" };
type Data2 = { hi1: "hi1" };

class ParentState0 extends State<Data1> {
  onStateEntered(): void {}

  test: string = "hey";
}

class ParentState1 extends State<Data1> {
  onStateEntered(): void {}

  test1: string = "hi";
}

class ChildState1 extends State<Data1> {
  onStateEntered(): void {}
}

class ChildState2 extends State<Data1> {
  onStateEntered(test: string): void {}
}

class ChildState3 extends State<Data2> {
    onStateEntered(test: string): void {}
}

const bot = null as any;
const data1: Data1 = { hi: "hi" };
const data2: Data2 = { hi1: "hi1" };

const parent0 = new ParentState0(bot, data1);
const parent1 = new ParentState1(bot, data1);
const child1 = new ChildState1(bot, data1);
const child2 = new ChildState2(bot, data1);
const child3 = new ChildState3(bot, data2);

const wild = new WildcardState<Data1>(bot, data1);

const transitions = [
  newTransition("test", [parent0, parent1], child1)
    .onTransit((data) => {})
    .shouldTransit((data) => true),

  newTransition("test", [parent1, parent0], child2, ["test"])
    .onTransit((data) => {})
    .shouldTransit((data) => true),

  newTransition("test", [parent0, parent1], child2, ["test"])
    .onTransit((data) => {})
    .shouldTransit((data) => true),

  newTransition("test", [wild], child1)
    .onTransit((data) => {})
    .shouldTransit((data) => true),
];

const getData: ExtractData<ChildState2> = data1;
const machine = newMachine("test1", bot, data1, transitions, child2, ["test"]);
