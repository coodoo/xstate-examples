
A extremely simplified text editor, this is one of the examples used in the book [`Constructing the User Interface with Statecharts`](https://dl.acm.org/citation.cfm?id=520870)


## Goal

to show case the relationship between `fsm` and `ui` not necessarily 1:1, also shows how to model a program with `parallel`states, 

## Key Features

- pay attention to the `global` states, where it houses `selection` and `clipboard` for managing parallel states

- also notice how `selection` state manages it's own parallel child states (this is `bold`, `italic` and `underline`)

- this examples show cases the power of modeling a program with a mix of `parallel` and `hierarchy` states, this is a must-have capability when modeling program with statecharts

## Statechart

![word](https://user-images.githubusercontent.com/325936/57836012-66ae4a00-77f2-11e9-9a5a-e233efacc352.png)
