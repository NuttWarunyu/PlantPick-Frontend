import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // ระบุไฟล์ที่ต้องการให้ ESLint อ่านข้าม
  { ignores: ["dist", "postcss.config.js", "tailwind.config.js"] },

  // กำหนดค่าให้กับไฟล์ JavaScript และ JSX
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // ใช้สำหรับโค้ด browser
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module", // ใช้ ES Modules สำหรับโค้ด React
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // เพิ่มการกำหนดค่าแยกสำหรับไฟล์ Node.js (เช่น postcss.config.js)
  {
    files: ["postcss.config.js", "tailwind.config.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // เพิ่ม globals สำหรับ Node.js
      sourceType: "script", // ใช้ CommonJS สำหรับ config files
    },
    rules: {
      "no-undef": "off", // ปิดการตรวจสอบ no-undef สำหรับไฟล์เหล่านี้
    },
  },
];
