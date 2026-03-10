# React + TypeScript + Vite# React  TypeScript  Vite# React  TypeScript  Vite # React  TypeScript  ViteReact  TypeScript  Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.此模板提供了一个最小化设置，用于在 Vite 中让 React 正常运行，并启用热模块替换（HMR）以及一些 ESLint 规则。This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules. This template provides a minimal setup for getting React running in Vite, with hot module replacement (HMR) enabled and some ESLint rules.

Currently, two official plugins are available:目前有两个官方插件可用：Currently, two official plugins are available:

- [@vitejs/plugin-react   @vitejs/plugin-react 插件](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel   巴别塔](https://babeljs.io/) (or [oxc   光交叉连接](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh- [@vitejs/plugin-react   @vitejs/plugin-react 插件](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) 使用 [Babel   巴别塔](https://babeljs.io/)（在 [rolldown-vite](https://vite.dev/guide/rolldown) 中使用时则使用 [oxc   光交叉连接](https://oxc.rs)）来实现快速刷新功能
- [@vitejs/plugin-react-swc   @vitejs/plugin-react-swc 插件](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh- [@vitejs/plugin-react-swc   @vitejs/plugin-react-swc 插件](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) 使用 [SWC](https://swc.rs/) 实现快速刷新功能

## React Compiler   React编译器## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation   这个文档](https://react.dev/learn/react-compiler/installation).由于 React 编译器会对开发和构建性能产生影响，因此在此模板中未启用它。若要添加，请参阅 [此文档](https://react.dev/learn/react-compiler/installation)。

## Expanding the ESLint configuration## 扩展 ESLint 配置

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:如果您正在开发生产应用程序，我们建议更新配置以启用类型感知的代码检查规则：

```js
export default defineConfig([导出默认的配置定义：[export default defineConfig([Export the default configuration definition: [
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],文件：['**/*.{ts,tsx}']
    extends: [   扩展了:(
      // Other configs...   //其他配置…

      // Remove tseslint.configs.recommended and replace with this// 移除 tseslint.configs.recommended 并用以下内容替换
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules// 或者，使用此选项以启用更严格的规则
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules// 如需遵循风格规则，可添加此内容
      tseslint.configs.stylisticTypeChecked,

      // Other configs...   //其他配置…// Other configs...   // Other configurations...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],项目：['./tsconfig.node.json'， './tsconfig.app.json']
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...   //其他选项…
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:您还可以安装 [eslint-plugin-react-x   eslint-plugin-react-x 是一个 ESLint 插件，用于增强对 React ](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) 和 [eslint-plugin-react-dom   ESLint 插件：React DOM](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) 以获取针对 React 的特定代码检查规则：

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [   扩展了:(
      // Other configs...   //其他配置…
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...   //其他选项…
    },
  },
])
```
