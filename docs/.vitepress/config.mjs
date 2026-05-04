export default {
  title: 'Fullstack Microstarter',
  description: 'Technical and user documentation for the Fullstack Microstarter repository',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Technical manual', link: '/technical-manual/' },
      { text: 'User manual', link: '/user-manual/' }
    ],
    sidebar: {
      '/technical-manual/': [
        {
          text: 'Technical manual',
          items: [
            { text: 'Overview', link: '/technical-manual/' },
            { text: 'Getting started', link: '/technical-manual/getting-started' },
            { text: 'Local setup', link: '/technical-manual/local-setup' },
            { text: 'Architecture', link: '/technical-manual/architecture' },
            { text: 'Production deployment', link: '/technical-manual/production-deployment' }
          ]
        },
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/technical-manual/packages/' },
            { text: 'UI package', link: '/technical-manual/packages/ui' }
          ]
        }
      ],
      '/user-manual/': [
        {
          text: 'User manual',
          items: [
            { text: 'Overview', link: '/user-manual/' },
            { text: 'Roles and current scope', link: '/user-manual/roles-and-current-scope' },
            { text: 'Authentication flow', link: '/user-manual/authentication-flow' },
            { text: 'Known gaps and expectations', link: '/user-manual/known-gaps-and-expectations' }
          ]
        }
      ]
    }
  }
}
