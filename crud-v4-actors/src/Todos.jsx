import React from "react";
import cn from "classnames";
import "todomvc-app-css/index.css";
import { useHashChange } from "./useHashChange";
import { Todo } from "./Todo";
import { todosMachine } from "./todosMachine";
import { useMachineEx } from './useMyHooks'

function filterTodos(state, todos) {
  if (state.matches("active")) {
    return todos.filter(todo => !todo.completed);
  }

  if (state.matches("completed")) {
    return todos.filter(todo => todo.completed);
  }

  return todos;
}

const persistedTodosMachine = todosMachine.withConfig(
  {
    actions: {
      persist: ctx => {
        localStorage.setItem("todos-xstate", JSON.stringify(ctx.todos));
      }
    }
  },

  {
    todo: "Learn state machines",

    // IIFE
    todos: (() => {
      try {
        return JSON.parse(localStorage.getItem("todos-xstate")) || [];
      } catch (e) {
        return [];
      }
    })()
  }
);

export function Todos() {

  const [state, send ] = useMachineEx(persistedTodosMachine, {}, {debug: true, name: 'Parent'});

  console.log( '\nParent render'  )

  useHashChange(() => {
    send(`SHOW.${window.location.hash.slice(2) || "all"}`);
  });

  const { todos, todo } = state.context;

  const numActiveTodos = todos.filter(todo => !todo.completed).length;
  const allCompleted = todos.length > 0 && numActiveTodos === 0;
  const mark = !allCompleted ? "completed" : "active";
  const markEvent = `MARK.${mark}`;
  const filteredTodos = filterTodos(state, todos);


  return (
    <section className="todoapp" data-state={state.toStrings()}>
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyPress={e => {
            if (e.key === "Enter") {
              send("NEWTODO.COMMIT", { value: e.target.value });
            }
          }}
          onChange={e => send("NEWTODO.CHANGE", { value: e.target.value })}
          value={todo}
        />
      </header>
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          checked={allCompleted}
          onChange={() => {
            send(markEvent);
          }}
        />
        <label htmlFor="toggle-all" title={`Mark all as ${mark}`}>
          Mark all as {mark}
        </label>

        <ul className="todo-list">
          {filteredTodos.map(todo => {
          	return <Todo key={todo.id} todoRef={todo.ref} />
          })}
        </ul>

      </section>

      {!!todos.length && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{numActiveTodos}</strong> item
            {numActiveTodos === 1 ? "" : "s"} left
          </span>
          <ul className="filters">
            <li>
              <a
                className={cn({
                  selected: state.matches("all")
                })}
                href="#/"
              >
                All
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: state.matches("active")
                })}
                href="#/active"
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: state.matches("completed")
                })}
                href="#/completed"
              >
                Completed
              </a>
            </li>
          </ul>
          {numActiveTodos < todos.length && (
            <button
              onClick={_ => send("CLEAR_COMPLETED")}
              className="clear-completed"
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
