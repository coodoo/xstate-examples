import { useState, useMemo, useEffect } from "react";
import { interpret } from "xstate";

export function useMachine(machine, options = {}) {

  const [current, setCurrent] = useState(machine.initialState);

  const service = useMemo(
    () =>

    	// 啟動 fsm 的必要過程
      interpret(machine, { execute: false })
      	// 這支主要目地是為了打印當前狀態，順便操作 internal state 指令 setCurrent
        .onTransition(state => {
          options.log && console.log("CONTEXT:", state.context);
          setCurrent(state);
        })
        .onEvent(e => options.log && console.log("EVENT:", e)),
    []
  );

  useEffect(
    () => {
      service.execute(current);
    },
    [current]
  );

  useEffect(() => {
    service.start();

    return () => service.stop();
  }, []);

  return [current, service.send];
}
