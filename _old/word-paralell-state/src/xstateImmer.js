import { produce } from 'immer';
import { actionTypes } from 'xstate/lib/actions';

export function assign( assignment ) {
	return {
		type: actionTypes.assign,
		assignment
	}
}

export function updater( context, event, assignActions ) {
	const updatedContext = context

		? assignActions.reduce((acc, assignAction) => {
				const { assignment } = assignAction
				const update = produce(acc, interim => assignment(interim, event))
				return update
			}, context)

		: context

	return updatedContext
}
