const js = require("@eslint/js");
const browser = { document: "readonly", window: "readonly", localStorage: "readonly", confirm: "readonly" };
const shared = { CONFIG: "writable", clean: "writable", fees: "writable", profit: "writable", need: "writable" };
module.exports = [
  { ignores: ["node_modules/**", "playwright-report/**", "test-results/**"] },
  js.configs.recommended,
  { files: ["app.js"], languageOptions: { sourceType: "script", globals: { ...browser, ...shared } } },
  { files: ["fees.js"], languageOptions: { sourceType: "script" }, rules: { "no-unused-vars": "off" } },
  { files: ["*.config.js", "tests/**/*.js"], languageOptions: { sourceType: "commonjs", globals: { require: "readonly", module: "writable", __dirname: "readonly", process: "readonly", console: "readonly" } } }
];
