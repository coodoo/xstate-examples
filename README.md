
## Here are four examples showing different usages of xstate.

Each one was built upon the previous one, hence it's recommended to start with `crud-v1-services` and move forward from there. All examples also available on codesandbox, feel free to play and fork those example, and report any issues you found here, PRs welcomed too.

All these examples are built with the help from [stateskit.com](https://stateskit.com)'s visual statechart editor, don't forget to try it out 😎

## Core features of each example

### `crud-v1-services`

- A typical CRUD app showing how to `model` application states with `statechart` and implement the basic functionalities in `xstate`, pay attention to how `invoked` Services are used to serve different API calls.

- There are four kind of services in `xstate`, which are `Promise, Callback, Observable and Machine`, for this example we are focused on `Callback` because it's the most commonly used services in a real world application.

- Read about different kind of [Services here](https://xstate.js.org/docs/guides/communication.html#invoking-services)

- Play on [[codesandbox]](https://codesandbox.io/s/crud-v1-services-fy1du)

### `crud-v2-optimistic-update`

- `v2` is built upon `v1`, but with more delicate handling of `optimistic update` processing and used different child state to model the app, observe how `parallel` states were used to handle different steps of each operation also pay attention to both `happy` and `sorrow` paths.

- Play on [[codesandbox]](https://codesandbox.io/s/crud-v2-optimistic-update-3bc58)

### `crud-v3-promises`

- `v3` is a slightly differnt version based on `v2` using a different `invoked` Service called `Promise`, pay attention to `services.js` and see how `loadItems` and `deleteItem` worked.

- Key different between `Callback` and `Promise` service is you get to dispatch events back to the parent just once with `Promise`, whereas in `Callback` you could use `cb` and `onReceive` functions to dispatch events multiple times, both has it's own place in an application, hence this example.

- Play on [[codesandbox]](https://codesandbox.io/s/crud-v3-promises-h9d5t)

### `crud-v4-actors`

- `v4` is based on David's [TodoMVC](https://codesandbox.io/s/xstate-todomvc-33wr94qv1) example but with a couple of improvements.

- This is by far the most complex example, it showcased how to use the latest `Actor` model for communication between child components and their parent.

- Pay attention to how `TodosMachine` spawned child `TodoMachine`s and pass it's ref to each child component as a local single truth that handles the component state., more details in the folder's `Readme.md`

- See detailed docs on [actor here](https://xstate.js.org/docs/guides/actors.html), this is something you don't want to miss 😎

- In short, `Service` and `Actor` are basically the same thing but used differently, rule of thumb:

	- Statically invoke services (you have to write all services in machine statemenet in advance)
	- Dynamically spawn actors (you can spawn new actors from any events whenever needed)

- Play on [[codesandbox]](https://codesandbox.io/s/crud-v4-actors-oxx7y)

## Notes

- Generic naming convention for `states` and `events` are:

	- `camelCaseForState`

	- `UPPER.CASE.FOR.EVENT`

		- By using dot for event it is possible in the future to implement wildcase event matching, for example `UPPER.*` to match all events starting with `UPPER`

- Basic guiding rule for all these example are hoping to make `ui` a `dumb layer`
	- meaning ui only does two things
		- draw the user interface
		- accept user inputs (keyboard/mouse events)
	- then delegate those events to `xstate` to handle, where all business logics are encapsulated

## Todo

- Rewrite tests

- Enable `whyDidYouRender` to see if there's any unnecesary re-renders
