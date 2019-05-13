
This example show cases another way of having multiple sub-fsm running, each tied to a child component, and hooked with update function.

# Goal

	- showing another way of implementing concurrency with multiple sub-machines and how they interact with the ui (via child components)

	- at the same time trying to avoid unnecessary re-render as much as possible

# Core features

	- Notice this is not using `invoke` to start service, instead it let each child component to start it's own `fsm`

	- Pay attention to how main fsm communicate with sub-fsm via the `onUpdate` function inside the child component

	- Generally speaking this is a bad approach once the new API `spawn(actor)` is out, that's a much better way of handling concurrency and inter-fsm communication along with lowest impact on the ui front
