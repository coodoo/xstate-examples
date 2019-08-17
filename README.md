
These examples showcased practical and common use cases of `statecharts` using `xstate`.

It is recommend to start with `fsm-crud` which showcased the most basic operations one might need on a daily basis.

`service-3-actor` is the most complex and up to date example that showcased how to model and implement concurrency using `statecharts` in an `actor` manner.

## The goal of each example is listed below.

- `fsm-crud`
	- a typical CRUD apps but a bit more complex than normal `TodoMVC` example

- `fsm-calc`
	- a simple calculator as described in the textbook

- `fsm-word`
	- showcase how parallel state could be useful when modeling complex program where states and ui didn't have 1:1 relationship

- `fsm-service-1-callback`
	- simple approach of implementing multi-thread jobs with one service, each job could be pasued/resumed/cancelled

- `fsm-service-2-submachine`
	- another way of implementing multi-thread jobs by letting each child component starts it's own sub-fsm, and using ui layer to piece together the application

- `fsm-service-3-actor`
	- the recommended way of implementing concurrency by creating multiple services and let them communicate with each other in a `actor` manner

## When to use what?

If you are working on a typical `CRUD` style application, follow along `fsm-crud`.

If you need basic concurrency, follow along `service-1-callback`.

If you need complex concurrency and fine-grained control of each thread, follow along `service-3-actor`

If none of above can solve your problem, ping me, I might be of some help 😎
