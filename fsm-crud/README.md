
This is a typical CRUD applicaiton with master|detail|modal screens.

## Goal

Demonstrating how to model CRUD application with `xstate` using `parallel states` to control screen switching and `context` to replace redux.

## Key Features

- switch between master|detail|modal screen by fsm states

- optimistic update for create and delete of items

- making context immutable with `xstate/immer`

- use react `memo` to prevent unnecessary re-render

- how to control show/hide of modal window, along with preparing data for it to display

- event listed as Enumeration data type using `Enum` instead of strings

- how to integrate any 3rd parti ui libraries, using `notifications` as an example here

- storing { state, send } in react context using `useContext` so that child components could easily fetch and use it, no need to pass it around as `props`

- the relationship between fsm state and ui may not be mapped 1:1, pay attention to how `loading` and `error` are using the same component to represent different states

- making `machine` file clean and serializable by moving all `actions` and `guards` into it's own file

- bonus: multipe requests could be cancelled, for use case like `search as you type` where multipe requests might be sent in a short time

## Statechart

![crud](https://user-images.githubusercontent.com/325936/57836016-67df7700-77f2-11e9-83ba-142c1ebd1680.png)

# todo
	- toast 呼叫移入 fsm 內，它是 action 可操作的 side effect
	- 修正 eslint 錯誤(目前全部 disable)
	- 移除所有 manifest.json
