// ESLint 扁平配置（ESLint 9+）
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-server/**', 'site/**', 'release/**', 'node_modules/**', '*.mjs', 'functions/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 放宽：AI 输出字段用 any 是常态，显式 any 不禁止
      '@typescript-eslint/no-explicit-any': 'off',
      // 未使用变量/参数报错，杜绝死代码（配合 tsconfig 严格检查）
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 以下 React 19 新严格规则对 React 18 既有代码误报多，暂不启用：
      // 1) 装饰性粒子动画用 Math.random 初始化 ref（purity）
      // 2) 渲染期读 ref 的防重复提交模式（refs）
      // 3) 初始化 state 的 effect（set-state-in-effect）
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  }
);
