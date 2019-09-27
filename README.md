
## Here are four examples showing different usages of xstate.

Each one was built upon the previous one, hence it's recommended to start with `crud-v1-services` and move forward from there.

## Core features of each example

### 1. crud-v1-services

- a typical CRUD apps showing how to model application states with `statechart` and implement the basic functionalities in `xstate`, pay attention to how `invoked` Services are used to serve different API calls.

- There are four kind of services -- Promise, Callback, Observable and Machine, `v1` is focused on `Callback`, for that it's the most commonly used services in real world application.

- Read about different kind of [Services here](https://xstate.js.org/docs/guides/communication.html#invoking-services)

### 2. crud-v2-optimistic-update

- `v2` is built upon `v1`, but with more delicate handling of `optimistic update` processing and used more child state for modeling the app, observe how `parallel` states were used to handle different steps of an operation.

### 3. crud-v3-promises

- `v3` is a slightly differnt version based on `v2` using a different `invoked` Service called `Promise`, pay attention to `services.js` and see `loadItems` and `deleteItem`

- Key different between `Callback` and `Promise` service is you get to dispatch events back to the parent just once with `Promise`, whereas in `Callback` you could use `cb` and `onReceive` to dispatch events multiple times, each has it's own place.

### 4. crud-v4-actors

- `v4` is based on David's [TodoMVC](https://codesandbox.io/s/xstate-todomvc-33wr94qv1) example but with a couple of improvements.

- This is the most complex one of all examples, for that it showcased how to use the latest and greatest `Actor` model for communication between child components and their parent.

- Pay attention to how `TodosMachine` spawn child `TodoMachine` and pass it's ref to each child component as a local single truth of handling component state.

- More details in the folder's `Readme.md`

- `Service` and `Actor` are basically the same thing but used differently, rule of thumb:

	- Statically invoke services (you have to write the service invocation in machine statemenet in advance)
	- Dynamically spawn actors (you can spawn new actors in all events whenever needed)

## Notes

- PRs welcomed and feel free to open issues if you find any problem or questions.

## Todo

	- Rewrite tests

	- Enable `whyDidYouRender` to see if there's any unnecesary re-renders
