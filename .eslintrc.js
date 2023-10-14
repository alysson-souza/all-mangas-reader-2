module.exports = {
    extends: ["plugin:vue/essential", "plugin:vuetify/recommended", "prettier"],
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: "2022"
    },
    plugins: ["@typescript-eslint"],
    rules: {
        "prefer-const": "warn"
    }
}
