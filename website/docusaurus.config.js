module.exports = {
  title: 'Instamate',
  tagline: 'A powerful, self-hosted data logger for your Instagram account',
  url: 'https://pihomeserver.github.io/instamate/',
  baseUrl: '/instamate/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'pihomeserver', // Usually your GitHub org/user name.
  projectName: 'instamate', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Instamate',
      logo: {
        alt: 'Instamate Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/pihomeserver/instamate',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Instamate, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/pihomeserver/instamate/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
