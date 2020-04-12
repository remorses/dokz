import chalk from 'chalk'
import spawn from 'cross-spawn'
// @ts-ignore
import downloadRepo from 'github-download-parts/index'
import makeDir from 'make-dir'
import path from 'path'
import { tryGitInit } from './helpers/git'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { getOnline } from './helpers/is-online'
import { shouldUseYarn } from './helpers/should-use-yarn'



const TEMPLATE_FOLDER = `example`
const TEMPLATE_REPO = `remorses/doks`

function install({ useYarn }) {
    return new Promise((resolve, reject) => {
        let child
        if (useYarn) {
            child = spawn('yarn', [], { stdio: 'inherit' })
        } else {
            child = spawn('npm', ['i'], { stdio: 'inherit' })
        }
        child.on('close', (code) => {
            if (code !== 0) {
                reject('cannot install')
                return
            }
            resolve()
        })
    })
}

export async function createApp({
    appPath,
    useNpm,
}: {
    appPath: string
    useNpm: boolean
    example?: string
    examplePath?: string
}) {
    const root = path.resolve(appPath)
    const appName = path.basename(root)

    await makeDir(root)
    if (!isFolderEmpty(root, appName)) {
        process.exit(1)
    }

    const useYarn = useNpm ? false : shouldUseYarn()
    const isOnline = !useYarn || (await getOnline())
    const originalDirectory = process.cwd()

    const displayedCommand = useYarn ? 'yarn' : 'npm'
    console.log(`Creating a new Doks app in ${chalk.green(root)}.`)
    console.log()

    await makeDir(root)
    process.chdir(root)

    await downloadRepo(TEMPLATE_REPO, '.', TEMPLATE_FOLDER)
    await install({ useYarn })
    // {
    //     const packageJson = {
    //         name: appName,
    //         version: '0.1.0',
    //         private: true,
    //         scripts: {
    //             dev: 'next dev',
    //             build: 'next build',
    //             start: 'next start',
    //         },
    //     }
    //     fs.writeFileSync(
    //         path.join(root, 'package.json'),
    //         JSON.stringify(packageJson, null, 2) + os.EOL,
    //     )

    //     console.log(
    //         `Installing ${chalk.cyan('react')}, ${chalk.cyan(
    //             'react-dom',
    //         )}, and ${chalk.cyan('next')} using ${displayedCommand}...`,
    //     )
    //     console.log()

    //     await install(root, ['react', 'react-dom', 'next'], {
    //         useYarn,
    //         isOnline,
    //     })
    //     console.log()

    //     await cpy('**', root, {
    //         parents: true,
    //         cwd: path.join(__dirname, 'templates', 'default'),
    //         rename: (name) => {
    //             switch (name) {
    //                 case 'gitignore': {
    //                     return '.'.concat(name)
    //                 }
    //                 // README.md is ignored by webpack-asset-relocator-loader used by ncc:
    //                 // https://github.com/zeit/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
    //                 case 'README-template.md': {
    //                     return 'README.md'
    //                 }
    //                 default: {
    //                     return name
    //                 }
    //             }
    //         },
    //     })
    // }

    if (tryGitInit(root)) {
        console.log('Initialized a git repository.')
        console.log()
    }

    let cdpath: string
    if (path.join(originalDirectory, appName) === appPath) {
        cdpath = appName
    } else {
        cdpath = appPath
    }

    console.log(`${chalk.green('Success!')} Created ${appName} at ${appPath}`)
    console.log('Inside that directory, you can run several commands:')
    console.log()
    console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}dev`))
    console.log('    Starts the development server.')
    console.log()
    console.log(
        chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`),
    )
    console.log('    Builds the app for production.')
    console.log()
    console.log(chalk.cyan(`  ${displayedCommand} start`))
    console.log('    Runs the built app in production mode.')
    console.log()
    console.log('We suggest that you begin by typing:')
    console.log()
    console.log(chalk.cyan('  cd'), cdpath)
    console.log(
        `  ${chalk.cyan(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`,
    )
    console.log()
}
