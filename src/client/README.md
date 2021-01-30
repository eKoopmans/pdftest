# Automated testing

The client utilities rely on browser behaviour, so to test them effectively we must either:

- use jsdom within jest, to simulate a browser
  - best option for simple unit tests? most light-weight
  - might need "canvas-prebuilt" for full canvas behaviour
- use puppeteer within jest, to launch a real headless browser (Chromium)
  - a bit heavy for unit tests
- run all "client" tests in real browsers with Karma
  - makes sense to run the tests in-browser rather than Node
- run all "client" tests in real browsers with Cypress
  - possibly the best solution all round
