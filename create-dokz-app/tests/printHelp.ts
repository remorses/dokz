import { printHelp } from '../create-app'

it('printHelp', () => {
    printHelp({
        appName: 'app',
        appPath: '/app',
        cdpath: '.',
        useYarn: false,
    })
})
