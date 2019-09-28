
## Goals

This example demos using `Promise` instead of `Callback` for handling async operations (API invocation, database operation and any side-effects)

## What to see in this example

- See `services.js` for details, pay attentions to `loadItems` and `deleteItems`

```js
export const loadItems = (ctx, e) => {

	const t = random(300, 1000)

	return new Promise((resolve, reject) => {
		setTimeout(() => {

			const fakeItem = () => {
				const id = randomId()
				const d = {
					id,
					label: `Label_${id}`,
				}
				return d
			}

			// instead of fetching data via API, we fake them here
			const arr = [fakeItem(), fakeItem(), fakeItem()]

			console.log( '\nfetched: ', arr )

			// for test only
			// randomly trigger happy and sorrow path to test both scenarios
			// if((t % 2) == 0 ){
			if(true){
			// if(false){
				resolve(arr)
			} else {
				reject('network error')
			}
		}, t)
	})
}
```

- Most of the time you will want to use `Callback` for that it can communicate with it's parent by sending multiple events, but for simpler tasks `Promise` might work as well, just bear in one you only get one chance to communicate with the parent (when the Promise was resolved or rejected)

## Statechart

![v3](https://user-images.githubusercontent.com/325936/65810689-f8d25000-e1df-11e9-8751-060d86bf14f8.png)
All charts generated using [StatesKit](https://stateskit.com)
