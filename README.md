# pdftest

Visual PDF comparison tool.

## Usage

1. Add `pdftest` to your project using `npm install --save-dev pdftest`.
2. Run the PDF file server using `pdftest serve` (optionally specifying a port and root folder, e.g. `pdftest serve 3000 ./path/to/pdfs/`).
3. Import or require `pdftest` in your test files, making sure your tests are being run in a browser (e.g. via `karma`).
4. Connect `pdftest` to the server using `pdftest.api.connect` (e.g. `pdftest.api.connect('http://localhost:3000')`).
5. Use the comparison functions `pdftest.client.compare` and/or `pdftest.client.compareToSnapshot` to compare PDFs.

### Running the PDF server with tests

In most use cases you will need to start the `pdftest` server before running your tests, and end it when the tests are finished. There are several patterns to accomplish this:

1. **`start-server-and-test` (recommended):**

    Install `start-server-and-test` as a dev dependency (`npm i -D start-server-and-test`), then use in your npm scripts:

    ```
    "test:serve": "pdftest serve 3000",
    "test:run": "karma start",
    "test": "start-server-and-test test:serve http://localhost:3000 test:run",
    ```

2. **`pdftest start` and `pdftest stop`:**

    This option is built-in and requires no extra dependencies - its main disadvantage is that it will not automatically stop the server if something goes wrong. Active processes are tracked in a `data.json` file, which `pdftest stop` references to kill the process. In rare cases this approach could result in "orphaned" background processes.
    
    To use it in your npm scripts:

    ```
    "test": pdftest start 3000 && karma start && pdftest stop 3000",
    ```

3. **`npm-run-all` and `wait-on`:**

    Install `npm-run-all` and `wait-on` as dev dependencies (`npm i -D npm-run-all wait-on`), then use in your npm scripts:

    ```
    "test:serve": "pdftest serve 3000",
    "test:run": "wait-on http://localhost:3000 && karma start",
    "test": "npm-run-all --parallel --race test:serve test:run",
    ```

4. **Using `&` (not recommended):**

    - You may use `&` to run the server and tests simultaneously, e.g. `pdftest serve 3000 & karma start`
    - This requires no additional dependencies, however:
      - It does not guarantee the server is running before tests start
      - It does not end the server process when tests finish
      - It is not supported on Windows

For more info, see the discussion of options in the [Cypress documentation](https://docs.cypress.io/guides/guides/continuous-integration.html#Boot-your-server).

## Release process

`npm run stage-release [major/minor/patch]`: Bumps the version and creates a release branch to prepare the new release.

`npm run release [tagmessage]`: Builds the release, tags it, and merges it back into master.

`npm publish`: Publishes the current version to npm.
