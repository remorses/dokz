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
                b: true,
                c: true,
            },
        }
        const n = applySidebarOrdering({ tree, order })
        pretty(n)
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
            x: true,
            a: {
                b: true,
                c: { e: true, f: true },
            },
        }
        const n = applySidebarOrdering({ tree, order })
        pretty(n)
        expect(n).to.deep.eq({
            name: 'pages',
            children: [
                {
                    name: 'x',
                    children: [],
                },
                {
                    name: 'a',
                    children: [
                        { name: 'b' },
                        { name: 'c', children: [{ name: 'e' }, { name: 'f' }] },
                    ],
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
                b: true,
                c: { d: true, e: true, f: true },
            },
            x: true,
        }
        const n = applySidebarOrdering({ tree, order })
        pretty(n)
    })
})

const pretty = (x) => console.log(JSON.stringify(x, null, 2))
