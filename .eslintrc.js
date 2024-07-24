export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      // 없으면 기본값 'error', warn, off 설정가능
      'no-unused-vars': 'warn',
      'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    },
  },
];
// eslint-disable-next-line no-unused-vars -> 예외 처리ㅇ
