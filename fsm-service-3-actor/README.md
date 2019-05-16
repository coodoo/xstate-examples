This is a simple song conversion app which allows user to add multiple files and convert them from one format to antoher, concurrently.

## Goal

Demonstrating how to model multi-thread application with `xstate` which requires frequent parent <-> child communcation, and how to separate concerns between parent and child machines in an `actor` manner.

## Key Features

- Modeling multi-thread application with `xstate`

- Create one thread for each song for the compression job, modeled as an `actor`(`workMachine`)

- Utilizing `spawn(actor)` command to create multiple threads

- Each actor creates it's own `service` as a side effect to process file conversion (say invoking `ffmpeg` for example)

- Communcation between `mainMachine` and `workMachine` using `sned` and `sendParent`

- See how child component hooks up with `actor`(`workMachine`) by passing in the instance via `props`

## Sub Features

- See how `fsm.test.js` made sure all key `fsm` scenarios are tested

- See how `ui.test.js` uses `react-testing-library` to test the ui parts as a black box and covered all key use cases

- Also note tests and implementations were done side by side, not before nor after, which means when you are implementing the feature, you are also writing the test on the side (to verify the feature you just implemented actually works), gone are the day of manually testing during development, then add unit tests right before openning the PR just for the sake of it.

	As a side note, this is not `TDD` either, for that it requires one to write test up-front, instead, I'm proposing to write test along with the implementation, hence making writing tests part of the implementation, and vice versa.

## Temporary workaround

We used the latest command `spawn()` in this example, which is still in beta, for it to work, you need to run following steps to build the latest version of xstate (make sure you have typescript compiler installed globally):

```
yarn remove xstate
yarn add https://github.com/davidkpiano/xstate
cd node_modules/xstate
yarn
yarn run build
````

After this was done, run `yarn start`.
