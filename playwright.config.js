const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests",
  webServer: { command: "python3 -m http.server 4173", url: "http://localhost:4173", reuseExistingServer: true },
  use: { baseURL: "http://localhost:4173" },
  reporter: [["list"], ["html", { open: "never" }]]
});
