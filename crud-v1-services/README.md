
## Goals

- This is a typical CRUD applicaiton with master|detail|modal screens.

- Demonstrating how to model CRUD application with `xstate` using `parallel states` to control screen switching and `context` to replace redux.

## What to see in this example

- switch between master|detail|modal screen by fsm states

- optimistic update for creating and deleting items

- how to control show/hide of modal window, along with preparing data for it to display

- how to integrate any 3rd parti ui libraries, using `notifications` as an example here

- storing { state, send } in react context using `useContext` so that child components could easily fetch and use it, no need to pass it around as `props`

- the relationship between fsm state and ui may not be mapped 1:1, pay attention to how `loading` and `error` are using the same component to represent different states

- making `machine` file clean and serializable by moving all `actions` and `guards` into it's own file

- bonus: multipe requests could be cancelled, for use case like `search as you type` where multipe requests might be sent in a short time

## Statechart

![v1](https://user-images.githubusercontent.com/325936/65810691-f8d25000-e1df-11e9-9c35-9d5e1d5a0fa5.png)

