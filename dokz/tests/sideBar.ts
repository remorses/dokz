import { applySidebarOrdering } from '../src/components/SideNav'
import { expect } from 'chai'

describe('sidebar', () => {
    it('applySidebarOrdering', () => {
        const tree: any = {
            name: 'pages',
            children: [{ name: 'a', children: [{ name: 'c' }, { name: 'b' }] }],
        }

        const order = {
            a: {
                b: null,
                c: null,
            },
        }
        const n = applySidebarOrdering({ tree, order })
        console.log(JSON.stringify(n, null, 2))
        expect(n).to.deep.eq({
            name: 'pages',
            children: [{ name: 'a', children: [{ name: 'b' }, { name: 'c' }] }],
        })
    })
    it('applySidebarOrdering complex but complete', () => {
        const tree: any = {
            name: 'pages',
            children: [
                {
                    name: 'a',
                    children: [
                        { name: 'c', children: [{ name: 'f' }, { name: 'e' }] },
                        { name: 'b' },
                    ],
                },
                {
                    name: 'x',
                    children: [],
                },
            ],
        }

        const order = {
            a: {
                b: null,
                c: { e: null, f: null },
            },
            x: null,
        }
        const n = applySidebarOrdering({ tree, order })
        console.log(JSON.stringify(n, null, 2))
        expect(n).to.deep.eq({
            name: 'pages',
            children: [
                {
                    name: 'a',
                    children: [
                        { name: 'b' },
                        { name: 'c', children: [{ name: 'e' }, { name: 'f' }] },
                    ],
                },
                {
                    name: 'x',
                    children: [],
                },
            ],
        })
    })
    it('applySidebarOrdering uncomplete', () => {
        const tree: any = {
            name: 'pages',
            children: [
                {
                    name: 'a',
                    children: [
                        { name: 'c', children: [{ name: 'f' }, { name: 'e' }] },
                        { name: 'b' },
                    ],
                },
                {
                    name: 'x',
                    children: [],
                },
            ],
        }

        const order = {
            a: {
                b: null,
                c: { d: null, e: null, f: null },
            },
            x: null,
        }
        const n = applySidebarOrdering({ tree, order })
        console.log(JSON.stringify(n, null, 2))
    })
})
