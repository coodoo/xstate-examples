import { interpret } from 'xstate'
import machine from './machine'

const current = svc => svc.state.toStrings().pop()
const dump = svc => console.log( '[state]', svc.state.value, '\n  [ctx]', svc.state.context )
const timer = time => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time)
	})
}


let svc
const init = () => {
	svc = interpret(machine)
	.onTransition( state => {
		// console.log( '[trans] ', state.changed, '|', state.value, state.context, )

		if(state.changed == false){
			console.error(
				`\n\n★ ☆ ★ [UNKNOWN EVENT]\nEvent=`,
				state.event,

				'\nState=',
				state.value,

				'\nContext=',
				state.context,
				'\n\n' )

			// console.log( 'state:', state )

			// throw new Error('BOOM')
		}
	})
	.onEvent( e => {
		// console.log( '\n[event] ', e  )
	})
	svc.start()
}

beforeAll( () => {
	init()
})

// reset fsm
beforeEach(() => {
	init()
})

describe('C 能取消運算', () => {

	it('1+2 後按 C 取消 2', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operand1).toEqual(1)

		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'C',value: null})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operand1).toEqual(1)
		expect(svc.state.context.operand2).toEqual(0)
		expect(svc.state.context.operator).toEqual('+')
		expect(svc.state.context.display).toEqual(0)
		// dump(svc)
	})

	it('1-3=-2 後按 C 應該沒反應', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '-'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operand1).toEqual(1)

		svc.send({type: 'NUMBER', value: 3})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.display).toEqual(-2)

		svc.send({type: 'C',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operator).toEqual(null)
		expect(svc.state.context.operand1).toEqual(-2)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(-2)
		// dump(svc)
	})
})

describe('AC 功能', () => {

	it('AC 清除輸入值', () => {
  	expect(current(svc)).toEqual('main.start')
  	svc.send({ type: 'AC', value: null })
  	expect(current(svc)).toEqual('main.start')
  	expect(svc.state.context.operand1).toEqual(0)
  	expect(svc.state.context.operand2).toEqual(0)
  	expect(svc.state.context.operator).toEqual(null)
  })

  it('divideByZero 後按 C 返回 operand2，此時值為 0', () => {
  	svc.send({type: 'NUMBER', value: 1})
  	svc.send({type: 'OPERATOR_OTHERS', value: '+'})
  	svc.send({type: 'NUMBER', value: 2})
  	svc.send({type: 'OPERATOR_OTHERS', value: '/'})
  	svc.send({type: 'NUMBER', value: 0})
  	expect(current(svc)).toEqual('alert')

  	svc.send({type: 'C', value: null})
  	// dump(svc)

  	expect(current(svc)).toEqual('operand2')
  	expect(svc.state.context.display).toEqual(0)
  	expect(svc.state.context.operand2).toEqual(0)
  })

  it('divideByZero 後按 C 返回 operand2，接著輸入 2，再輸入 3 並按 =，等於運算 3/6=0.5', () => {
  	svc.send({type: 'NUMBER', value: 1})
  	svc.send({type: 'OPERATOR_OTHERS', value: '+'})
  	svc.send({type: 'NUMBER', value: 2})
  	svc.send({type: 'OPERATOR_OTHERS', value: '/'})
  	svc.send({type: 'NUMBER', value: 0})
  	svc.send({type: 'C', value: null})
  	expect(current(svc)).toEqual('operand2')

  	svc.send({type: 'NUMBER', value: 2})
  	expect(current(svc)).toEqual('operand2')
  	expect(svc.state.context.operand2).toEqual(2)

  	svc.send({type: 'NUMBER', value: 6})
  	expect(current(svc)).toEqual('operand2')
  	expect(svc.state.context.operand2).toEqual(6)

  	svc.send({type: 'EQUAL', value: null})
  	expect(current(svc)).toEqual('main.result')
  	expect(svc.state.context.display).toEqual(0.5)
  	// dump(svc)
  })
})

describe('Operand1', () => {

	it('從 start 按 2 進入 operand1', () => {
		expect(current(svc)).toEqual('main.start')
		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(2)
		// dump(svc)
	})

	it('從 start 按 2 進入 operand1，再按 3 停留在 operand1', () => {
		expect(current(svc)).toEqual('main.start')
		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(2)

		svc.send({type: 'NUMBER',value: 3})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(3)
		// dump(svc)
	})

	it('從 start 按 2 進入 operand1，按 AC 退回 start', () => {
		expect(current(svc)).toEqual('main.start')

		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(2)
		// dump(svc)

		svc.send({ type: 'AC', value: null })
		expect(current(svc)).toEqual('main.start')
		expect(svc.state.context.operand1).toEqual(0)
		expect(svc.state.context.display).toEqual(0)
		// dump(svc)
	})

	it('AC 後重算 1+2=3', () => {

		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(2)

		svc.send({ type: 'AC', value: null })
		expect(current(svc)).toEqual('main.start')

		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})

		// dump(svc)
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)
	})

	it('operand1 連續輸入 1, 2, 3 應該得到 123', () => {
		svc.send({type: 'NUMBER', value: 1})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(1)

		svc.send({type: 'NUMBER', value: 12})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(12)

		svc.send({type: 'NUMBER', value: 123})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(123)
		// dump(svc)
	})

	it('operand1 連續輸入 123 後按 AC', () => {
		svc.send({type: 'NUMBER', value: 1})
		expect(svc.state.context.operand1).toEqual(1)

		svc.send({type: 'NUMBER', value: 12})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(12)

		svc.send({type: 'NUMBER', value: 123})
		expect(current(svc)).toEqual('operand1')
		expect(svc.state.context.operand1).toEqual(123)

		svc.send({type: 'AC', value: null})
		// dump(svc)
		expect(current(svc)).toEqual('main.start')
		expect(svc.state.context.operand1).toEqual(0)
		expect(svc.state.context.display).toEqual(0)
		expect(svc.state.context.operator).toEqual(null)
	})

	it('連續輸入 decimal: 0. -> 0.3 -> 0.34', () => {
		svc.send({type: 'NUMBER', value: +'0.'})
		expect(svc.state.context.operand1).toEqual(0)
		// dump(svc)

		svc.send({type: 'NUMBER', value: .3})
		expect(svc.state.context.operand1).toEqual(0.3)
		// dump(svc)

		svc.send({type: 'NUMBER', value: .34})
		expect(svc.state.context.operand1).toEqual(0.34)
		// dump(svc)
	})
})

describe('各種運算', () => {

	it('1+2=3', () => {
		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})

		// dump(svc)
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)
	})

	it('先算出結果為 3，再 +1 結果為 4', () => {
		// 先算出第一次結果
		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)
		// dump(svc)

		// 接著繼續 +1
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('+')

		svc.send({type: 'NUMBER',value: 1})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(1)

		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(4)
		// dump(svc)
	})

	it('先算出結果為 3，再 -2 結果為 1', () => {
		// 先算出第一次結果
		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)

		// 接著繼續 -1
		svc.send({type: 'OPERATOR_OTHERS', value: '-'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('-')

		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(2)

		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(1)
		expect(svc.state.context.display).toEqual(1)
		// dump(svc)
	})

	it('先算出結果為 3，再 *2 結果為 6', () => {
		// 先算出第一次結果
		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)
		// dump(svc)

		// 接著繼續 +1
		svc.send({type: 'OPERATOR_OTHERS', value: '*'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('*')

		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(2)

		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(6)
		// dump(svc)
	})

	it('先算出結果為 3，再 /2 結果為 1.5', () => {
		// 先算出第一次結果
		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)
		// dump(svc)

		// 接著繼續 +1
		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('/')

		svc.send({type: 'NUMBER',value: 2})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(2)

		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(1.5)
		expect(svc.state.context.display).toEqual(1.5)
		// dump(svc)
	})

	it('1+2=3，忽略此結果，重新輸入 5+6=11', () => {

		svc.send({type: 'NUMBER',value: 1})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 2})
		svc.send({type: 'EQUAL',value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(3)

		svc.send({type: 'NUMBER',value: 5})
		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		svc.send({type: 'NUMBER',value: 6})
		svc.send({type: 'EQUAL',value: null})

		// dump(svc)
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.operand1).toEqual(11)
	})

	it('連續輸入 decimal 做加法運算 0.34+6 = 6.34', () => {
		svc.send({type: 'NUMBER', value: +'0.'})
		expect(svc.state.context.operand1).toEqual(0)
		// dump(svc)

		svc.send({type: 'NUMBER', value: .3})
		expect(svc.state.context.operand1).toEqual(0.3)
		expect(current(svc)).toEqual('operand1')
		// dump(svc)

		svc.send({type: 'NUMBER', value: .34})
		expect(svc.state.context.operand1).toEqual(0.34)
		// dump(svc)

		svc.send({type: 'OPERATOR_OTHERS',value: '+'})
		expect(svc.state.context.operator).toEqual('+')

		svc.send({type: 'NUMBER',value: 6})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand1).toEqual(0.34)
		expect(svc.state.context.operand2).toEqual(6)

		svc.send({type: 'EQUAL',value: null})
		expect(svc.state.context.operand1).toEqual(6.34)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('1 + 123 = 124', () => {
		svc.send({type: 'NUMBER', value: 1})
		// dump(svc)
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		// dump(svc)
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'NUMBER', value: 12})
		svc.send({type: 'NUMBER', value: 123})
		// dump(svc)

		expect(svc.state.context.operand2).toEqual(123)
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(124)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(124)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
	})

	it('2*4 = 8', () => {
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'OPERATOR_OTHERS', value: '*'})
		svc.send({type: 'NUMBER', value: 4})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(8)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(8)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('0.2*0.4 = 0.8', () => {
		svc.send({type: 'NUMBER', value: 0.2})
		svc.send({type: 'OPERATOR_OTHERS', value: '*'})
		svc.send({type: 'NUMBER', value: 0.4})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(0.08)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(0.08)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('0.2*0.44 = 0.088', () => {
		svc.send({type: 'NUMBER', value: 0.2})
		svc.send({type: 'OPERATOR_OTHERS', value: '*'})
		svc.send({type: 'NUMBER', value: 0.44})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(0.088)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(0.088)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('6/2 = 3', () => {
		svc.send({type: 'NUMBER', value: 6})
		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(3)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(3)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('2/6 = 0.33333333...', () => {
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		svc.send({type: 'NUMBER', value: 6})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toBeCloseTo(0.33)
		expect(svc.state.context.display).toBeCloseTo(0.33)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('0.2/0.4 = 0.5', () => {
		svc.send({type: 'NUMBER', value: 0.2})
		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		svc.send({type: 'NUMBER', value: 0.4})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toBeCloseTo(0.5)
		expect(svc.state.context.display).toBeCloseTo(0.5)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('5 - 3 = 2', () => {
		svc.send({type: 'NUMBER', value: 5})
		svc.send({type: 'OPERATOR_OTHERS', value: '-'})
		svc.send({type: 'NUMBER', value: 3})
		svc.send({type: 'EQUAL', value: null})
		expect(svc.state.context.operand1).toEqual(2)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(2)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
		// dump(svc)
	})

	it('1 - 3 = -2', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		expect(current(svc)).toEqual('operator')
		// dump(svc)

		svc.send({type: 'NUMBER', value: 3})
		expect(current(svc)).toEqual('operand2')
		svc.send({type: 'EQUAL', value: null})

		expect(svc.state.context.operand1).toEqual(-2)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(-2)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
	})

	it('1 - 3 - 5 = -7', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		expect(current(svc)).toEqual('operator')

		svc.send({type: 'NUMBER', value: 3})
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		expect(current(svc)).toEqual('operator')

		svc.send({type: 'NUMBER', value: 5})
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'EQUAL', value: null})
		expect(current(svc)).toEqual('main.result')
		// dump(svc)

		expect(svc.state.context.operand1).toEqual(-7)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(-7)
		expect(svc.state.context.operator).toEqual(null)
	})

	// 要測中間有按 = 再按 - 會如何
	it('1 - 3 = -2 再 -5 = -7', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		expect(current(svc)).toEqual('operator')

		svc.send({type: 'NUMBER', value: 3})
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'EQUAL', value: null})
		expect(current(svc)).toEqual('main.result')

		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		svc.send({type: 'NUMBER', value: 5})
		svc.send({type: 'EQUAL', value: null})
		// dump(svc)

		expect(svc.state.context.operand1).toEqual(-7)
		expect(svc.state.context.operand2).toEqual(null)
		expect(svc.state.context.display).toEqual(-7)
		expect(svc.state.context.operator).toEqual(null)
		expect(current(svc)).toEqual('main.result')
	})

	it('1+2=3 再繼續 +4=7', () => {

		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'EQUAL', value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.display).toEqual(3)

		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('+')

		svc.send({type: 'NUMBER', value: 4})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(4)

		svc.send({type: 'EQUAL', value: null})
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.display).toEqual(7)

		// dump(svc)
	})

	it('1+2+4=7', () => {

		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.display).toEqual(3)

		svc.send({type: 'NUMBER', value: 4})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand2).toEqual(4)

		svc.send({type: 'EQUAL', value: null})
		// dump(svc)
		expect(current(svc)).toEqual('main.result')
		expect(svc.state.context.display).toEqual(7)

	})
})

describe('Operand2', () => {
	it('operand2 連續輸入 1, 2, 3 應該得到 123', () => {

		// 先填滿 operand1 與 operator
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operand1).toEqual(1)
		expect(svc.state.context.operator).toEqual('+')

		// 再開始測 operand2
		svc.send({type: 'NUMBER', value: 1})
		expect(svc.state.context.operand2).toEqual(1)
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'NUMBER', value: 12})
		expect(svc.state.context.operand2).toEqual(12)
		expect(current(svc)).toEqual('operand2')

		svc.send({type: 'NUMBER', value: 123})
		expect(svc.state.context.operand2).toEqual(123)
		expect(current(svc)).toEqual('operand2')
		// dump(svc)

	})
})

describe('Operator', () => {
	it('operator 連續輸入 + - * / 最後停在 / ', () => {

		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('+')

		svc.send({type: 'OPERATOR_OTHERS', value: '*'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('*')

		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('/')

		svc.send({type: 'OPERATOR_MINUS', value: '-'})
		expect(current(svc)).toEqual('operator')
		expect(svc.state.context.operator).toEqual('-')
		// dump(svc)
	})

})

describe('Negative', () => {

	it('先按減號，輸入 2，畫面顯示 -2', () => {
  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')

  	svc.send({type: 'NUMBER', value: 2})
  	expect(current(svc)).toEqual('operand1')
  	expect(svc.state.context.display).toEqual(-2)
  	// dump(svc)
  })

  it('-2 + 5 = 3', () => {
  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')
  	svc.send({type: 'NUMBER', value: 2})
  	expect(svc.state.context.display).toEqual(-2)

  	svc.send({type: 'OPERATOR_OTHERS', value: '+'})
  	svc.send({type: 'NUMBER', value: 5})
  	expect(svc.state.context.operand2).toEqual(5)

  	svc.send({type: 'EQUAL', value: null})
  	expect(svc.state.context.display).toEqual(3)
  	// dump(svc)
  })

  it('先按減號進入 negative 狀態，按 C 退回 start，畫面顯示 0', () => {
  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')
  	// dump(svc)

  	svc.send({type: 'C', value: null})
  	expect(current(svc)).toEqual('main.start')
  	expect(svc.state.context.display).toEqual(0)
  	// dump(svc)
  })

  it('進入 negative, 按 C 退回 start，按 +2 = 2', () => {

  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')

  	svc.send({type: 'C', value: null})
  	expect(current(svc)).toEqual('main.start')

  	svc.send({type: 'OPERATOR_OTHERS', value: '+'})
  	expect(current(svc)).toEqual('operator')
  	expect(svc.state.context.operand1).toEqual(0)

  	svc.send({type: 'NUMBER', value: 2})
  	svc.send({type: 'EQUAL', value: null})
  	// dump(svc)
  })

  it('進入 negative, 按 C 退回 start，再按 -，又進入 negative1', () => {

  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')
  	// dump(svc)

  	svc.send({type: 'C', value: null})
  	expect(current(svc)).toEqual('main.start')
  	// dump(svc)

  	svc.send({type: 'OPERATOR_MINUS', value: '-'})
  	expect(current(svc)).toEqual('negative1')
  	// dump(svc)
  })

})

describe('Divide by zero', () => {

	it('divide by zero 進入 alert ', () => {
		svc.send({type: 'NUMBER',value: 5})
		svc.send({type: 'OPERATOR_OTHERS',value: '/'})
		svc.send({type: 'NUMBER',value: 0})
		// dump(svc)
		expect(current(svc)).toEqual('alert')
	})

	it('divide by zero 後按 C 回 operand2 ', () => {
		svc.send({type: 'NUMBER',value: 5})
		svc.send({type: 'OPERATOR_OTHERS',value: '/'})
		svc.send({type: 'NUMBER',value: 0})
		expect(current(svc)).toEqual('alert')

		svc.send({type: 'C',value: null})
		expect(current(svc)).toEqual('operand2')
		expect(svc.state.context.operand1).toEqual(5)
		expect(svc.state.context.operand2).toEqual(0)
		expect(svc.state.context.operator).toEqual('/')
		expect(svc.state.context.display).toEqual(0)
		// dump(svc)
	})

	it('divide by zero 後按 AC 回 main.start ', () => {
		svc.send({type: 'NUMBER',value: 5})
		svc.send({type: 'OPERATOR_OTHERS',value: '/'})
		svc.send({type: 'NUMBER',value: 0})
		expect(current(svc)).toEqual('alert')

		svc.send({type: 'AC',value: null})
		expect(current(svc)).toEqual('main.start')
		// dump(svc)
	})

	it('1+2 / 0 = alert', () => {
		svc.send({type: 'NUMBER', value: 1})
		svc.send({type: 'OPERATOR_OTHERS', value: '+'})
		svc.send({type: 'NUMBER', value: 2})
		svc.send({type: 'OPERATOR_OTHERS', value: '/'})
		svc.send({type: 'NUMBER', value: 0})
		// dump(svc)

		expect(current(svc)).toEqual('alert')
		expect(svc.state.context.display).toEqual('ERROR')
	})

})


