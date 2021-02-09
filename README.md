# pdftest

Visual PDF comparison tool.

## Usage

Imports should be done directly via 'src/client' and 'src/server'. Client requires browser and server requires node - there should be no occasion where a single consumer uses both.

### Running the PDF server with tests

In most use cases you will need to start the `pdftest` server before running your tests, and end it when the tests are finished. There are several patterns to accomplish this:

1. **`start-server-and-test` (recommended):**

    Install `start-server-and-test` as a dev dependency (`npm i -D start-server-and-test`), then use in your npm scripts:

    ```
    "test:serve": "pdftest serve 3000",
    "test:run": "karma start",
    "test": "start-server-and-test test:serve http://localhost:3000 test:run",
    ```

2. **`npm-run-all` and `wait-on`:**

    Install `npm-run-all` and `wait-on` as dev dependencies (`npm i -D npm-run-all wait-on`), then use in your npm scripts:

    ```
    "test:serve": "pdftest serve 3000",
    "test:run": "wait-on http://localhost:3000 && karma start",
    "test": "npm-run-all --parallel --race test:serve test:run",
    ```

3. **Using `&` (not recommended):**

    - You may use `&` to run the server and tests simultaneously, e.g. `pdftest serve 3000 & karma start`
    - This requires no additional dependencies, however:
      - It does not guarantee the server is running before tests start
      - It does not end the server process when tests finish
      - It is not supported on Windows

For more info, see the discussion of options in the [Cypress documentation](https://docs.cypress.io/guides/guides/continuous-integration.html#Boot-your-server).
