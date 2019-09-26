import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import React from 'react'
import { render, cleanup, act, fireEvent, prettyDOM } from 'react-testing-library'
import { findByText } from 'dom-testing-library'
import App from '../components/App'
import { timer } from '../utils/helpers'

let dom, container

const $ = sel => document.querySelector.call(document, sel)
const $$ = sel => document.querySelectorAll.call(document, sel)

// query non-existent str to dump the DOM, for debugging
const dump = () => console.log( prettyDOM(container) )

beforeEach(() => {
	dom = render(<App />)
	container = dom.container
})

afterEach(cleanup)

describe('add songs', () => {

	it('add one song', () => {

	  fireEvent.click( dom.getByTestId('btnAdd') )

	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(1)

	  const item = $('#song_1')
	  expect(item.querySelector('#songId').textContent).toEqual('1')
	  expect(item.querySelector('#songProgress').textContent).not.toEqual(0)

	})

	it('add many song', () => {

		const btn = dom.getByTestId('btnAdd')
	  fireEvent.click( btn )
	  fireEvent.click( btn )
	  fireEvent.click( btn )

	  // dump()
	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(3)

	  const item1 = rows.firstChild
	  expect(item1.querySelector('#songId').textContent).toEqual('2')
	  expect(item1.querySelector('#songProgress').textContent).not.toEqual(0)

	  const item2 = rows.children[1]
	  expect(item2.querySelector('#songId').textContent).toEqual('3')
	  expect(item2.querySelector('#songProgress').textContent).not.toEqual(0)

	  const item3 = rows.children[2]
	  expect(item3.querySelector('#songId').textContent).toEqual('4')
	  expect(item3.querySelector('#songProgress').textContent).not.toEqual(0)

	})
})

describe('delete songs', () => {

	it('delete one song', () => {

	  fireEvent.click( dom.getByTestId('btnAdd') )

	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(1)

	  fireEvent.click( dom.getByTestId('btnCancel') )
	  expect(rows.children.length).toEqual(0)
	})

	it('delete many song', () => {

		// add 3 songs
		const add = dom.getByTestId('btnAdd')
	  fireEvent.click( add )
	  fireEvent.click( add )
	  fireEvent.click( add )

	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(3)

	  const btns = $$('[data-testid="btnCancel"]')
	  expect(btns.length).toEqual(3)

	  // click remove btn 3 times
	  btns.forEach( b => fireEvent.click(b) )
	  expect(dom.getByTestId('rows').children.length).toEqual(0)
	})
})

describe('pause songs', () => {
	it('pause one song', () => {

	  fireEvent.click( dom.getByTestId('btnAdd') )
	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(1)

	  const btn = dom.getByTestId('btnPause')
	  fireEvent.click( btn )
	  expect(btn).toHaveAttribute('style', 'background-color: black;')
	})
})

describe('resume songs', () => {
	it('resume one song', () => {

	  fireEvent.click( dom.getByTestId('btnAdd') )
	  const rows = dom.getByTestId('rows')
	  expect(rows.children.length).toEqual(1)

	  const pause = dom.getByTestId('btnPause')
	  fireEvent.click( pause )

	  const resume = dom.getByTestId('btnResume')
	  fireEvent.click(resume)
	  expect(pause).not.toHaveAttribute('style', 'background-color: black;')
	  expect(pause).toHaveAttribute('style', 'background-color: white;')
	})
})

describe('async job', () => {

	it.only('one done', async () => {

		cleanup()

		act(() => {
			dom = render(<App />)
			const add = dom.getByTestId('btnAdd')
			fireEvent.click( add )
		})

	  await dom.findByText(/100/i)

	  const song = dom.getByTestId('rows').firstChild

	  // show green backgorund when item completed
	  expect( song ).toHaveAttribute('style', 'background-color: green; color: white;')

	  // show red border when all completed
	  expect(dom.getByTestId('rows')).toHaveAttribute('style', 'width: 150px; border: 10px solid red;')

	  // dump()
	})

	it.only('all done', async () => {

		cleanup()

		act(() => {
			dom = render(<App />)
			const add = dom.getByTestId('btnAdd')
			fireEvent.click( add )
			fireEvent.click( add )
			fireEvent.click( add )
		})

		const rows = dom.getByTestId('rows')

		const s1 = rows.children[0]
		const s2 = rows.children[1]
		const s3 = rows.children[2]

		// wait till 3 rows were completed
		// notice it's not using `dom.findByText` from `RTL`
	  await findByText( s1, /100/i)
	  await findByText( s2, /100/i)
	  await findByText( s3, /100/i)

	  // show green backgorund when each item was completed
	  expect( s1 ).toHaveAttribute('style', 'background-color: green; color: white;')
	  expect( s2 ).toHaveAttribute('style', 'background-color: green; color: white;')
	  expect( s3 ).toHaveAttribute('style', 'background-color: green; color: white;')

	  // show red border when all items was completed
	  expect(dom.getByTestId('rows')).toHaveAttribute('style', 'width: 150px; border: 10px solid red;')

	  // dump()
	})

})

describe('xxx', () => {

})

describe('xxx', () => {

})

describe('xxx', () => {

})

