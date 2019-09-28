
## Goals

This is an alternative version of how to implement optimistic update with parallel states to give you a feel of it's power.

## What to see in this example

- Refactored optimistic update with more detailed states

- Pay attentions to how the parallel state `optimisticPending` was designed and the events it's repsonsible for

```
optimisticPending: {
	on: {
		// optimistic result - delete item
		OPTIMISTIC_DELETE_ITEM_SUCCESS: [
			{
				target: ['#Root.main.master', '#Root.global.selection.unSelected'],
				actions: 'deleteOptimisticItemSuccess',
			},
		],
		OPTIMISTIC_DELETE_ITEM_FAIL: [
			{
				target: ['#Root.main.master', '#Root.global.selection.selected'],
				actions: 'restoreOptimisticDeleteItem',
			},
		],

		// optimistic result - create item
		OPTIMISTIC_CREATE_ITEM_SUCCESS: [
			{
				target: ['#Root.main.master'],
				actions: 'createOptimisticItemSuccess',
			},
		],
		OPTIMISTIC_CREATE_ITEM_FAIL: [
			{
				target: ['#Root.main.master'],
				actions: 'restoreOptimisticNewItem',
			},
		],

		// optimistic result - edit item
		OPTIMISTIC_EDIT_ITEM_SUCCESS: [
			{
				target: ['#Root.main.master'],
				actions: 'editOptimisticItemSuccess',
			},
		],
		OPTIMISTIC_EDIT_ITEM_FAIL: [
			{
				target: ['#Root.main.master'],
				actions: 'restoreOptimisticEditItem',
			},
		],
	}
}
```

- Notice `toaster.notify()` was treated as a side effect and can be directly invoked inside `actions`, instead of delegating it via the ui.


## Statechart

![v2](https://user-images.githubusercontent.com/325936/65810692-f96ae680-e1df-11e9-9040-7ba0c3113abd.png)


