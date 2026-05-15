// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '클로드코드 스터디',
  tagline: '클로드코드 마스터 책 스터디 기록',
  favicon: 'img/favicon.ico',

  url: 'https://claude-code-study.github.io',
  baseUrl: '/claude-code-master-reading/',

  organizationName: 'claude-code-study',
  projectName: 'claude-code-master-reading',

  onBrokenLinks: 'warn',

  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '.',
          include: ['@sukyoung/**/*.md', '@hjpark/**/*.md'],
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        items: [
          {
            to: '/',
            position: 'left',
            label: '스터디 소개',
            activeBaseRegex: '^/claude-code-master-reading/$',
          },
          {
            type: 'docSidebar',
            sidebarId: 'studySidebar',
            position: 'left',
            label: '스터디 노트',
          },
          {
            href: 'https://github.com/claude-code-study/claude-code-master-reading',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '참고 자료',
            items: [
              {
                label: '클로드코드 공식 문서',
                href: 'https://docs.anthropic.com/ko/docs/claude-code/overview',
              },
              {
                label: '클로드코드 GitHub',
                href: 'https://github.com/anthropics/claude-code',
              },
              {
                label: '클로드코드 마스터 (교보문고)',
                href: 'https://product.kyobobook.co.kr/detail/S000219725328',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 클로드 코드 북 스터디. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

module.exports = config;
