## Goals

This demo howcases how to model multi-thread application with `xstate` which requires frequent parent <-> child communcation, and how to separate concerns between parent and child machines using the `Actor` model.

## What to see in this example?

- Using `spawn` to create `actor` for child screen

- How child component hooks up with `actor`(`todoMachine`) by passing the ref around via `props`

- Communcation between `todoMachine` and `todosMachine` using `sned` and `sendParent`

- Provided alternative implementation of `useMachine` and `useService` which eliminates unnecessary redraws as much as possible, it it in `useMyHooks.js`

- Replaced `focusInput` and `service.execute` from 'todo.jsx' with a more easy to understand approach to handle content changes

- Fixed a bug when hitting `esc` key will trigger both `cancel` and `blur` events with the latter not being handled

## Statechart
![todos](https://user-images.githubusercontent.com/325936/65810958-08539800-e1e4-11e9-80d5-050a1a04bca9.png)
![todo](https://user-images.githubusercontent.com/325936/65810957-07bb0180-e1e4-11e9-9b03-44f68562b9cc.png)
