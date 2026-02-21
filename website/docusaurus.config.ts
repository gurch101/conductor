import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Conductor',
  tagline: 'Orchestrate your AI agents',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://gurch101.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/conductor/',

  // GitHub pages deployment config.
  organizationName: 'gurch101',
  projectName: 'conductor',
  trailingSlash: false,

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at the site root
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/services', '../src/repositories'],
        entryPointStrategy: 'expand',
        out: 'docs/reference',
        tsconfig: '../tsconfig.json',
        name: 'Conductor',
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Conductor',
      items: [
        {to: '/reference/modules', label: 'Reference Documentation', position: 'left'},
        {to: '/CHANGELOG', label: 'Changelog', position: 'left'},
        {
          href: 'https://github.com/gurch101/conductor',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Reference Documentation',
              to: '/reference/modules',
            },
            {
              label: 'Changelog',
              to: '/CHANGELOG',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/gurch101/conductor',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Conductor. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
