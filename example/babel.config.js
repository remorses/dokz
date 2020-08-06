// you need to give access to the github app fist, https://github.com/apps/edit-this-page-app
module.exports = {
    presets: ['next/babel'],
    plugins: [
        [
            'edit-this-page',
            {
                editableFiles: 'pages/**',
                githubUrl: 'myusername/myrepo',
                branch: 'master',
            },
        ],
    ],
}
