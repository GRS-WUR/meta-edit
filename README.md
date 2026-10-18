![meta-edit](./src/components/img/logo.svg)

# meta-edit

A web form for creating metadata records for geospatial datasets, used by the
[Laboratory of Geo-Information Science and Remote Sensing (GRS)](https://www.wur.nl/nl/leerstoelgroepen/laboratorium-voor-geo-informatiekunde-en-remote-sensing)
at Wageningen University & Research.

**Open the form: <https://grs-wur.github.io/meta-edit/>**

You fill in the form and save the result as a
[Metadata Control File](https://geopython.github.io/pygeometa/reference/mcf/) (MCF 2.0),
a readable YAML file that sits next to your data and can be converted to ISO 19139,
OGC API - Records, STAC or DCAT.

- **Filling in the form?** Read the [help page](https://grs-wur.github.io/meta-edit/help.html), also linked from the form's **Help** button.
- **Maintaining the app?** Read on.

meta-edit is based on [MDME](https://github.com/osgeo/mdme) by Paul van Genuchten.

## What it does

- Create a new record from a template with GRS defaults (File → New)
- Open an existing MCF file to edit it (File → Open); MCF 1.0 files are upgraded to 2.0
- Import from a DOI, an ISO 19139 record or a WMS service (File → Import / Import from WMS)
- Save as MCF YAML (Save)
- Export to ISO 19139, OGC API - Records, STAC or DCAT (File → Export)
- Load a record from a URL by opening `https://grs-wur.github.io/meta-edit/?mcf=<url-of-yml>`

The app runs entirely in the browser; nothing you type is stored on a server.
The exceptions are **Import** and **Export**, which send the record to the
pygeometa conversion service at [demo.pygeoapi.io](https://demo.pygeoapi.io/master/processes),
a public demo server run by the pygeoapi project.

## Run it locally

Requires [Node.js](https://nodejs.org) 18 or newer (20 recommended) and [Yarn](https://classic.yarnpkg.com) 1.x.

```bash
git clone https://github.com/GRS-WUR/meta-edit.git
cd meta-edit
yarn install
yarn serve
```

Then open the URL printed in the terminal, usually <http://localhost:8080/meta-edit/>.

`yarn build` writes a production build to `dist/`.

## Deployment (GitHub Pages)

Every push to `main` is built and published automatically by
[`.github/workflows/main.yml`](.github/workflows/main.yml):

1. Node 20 installs the dependencies from `yarn.lock` and runs `yarn build`.
2. The `dist/` folder is pushed to the `gh-pages` branch.
3. GitHub Pages serves that branch at <https://grs-wur.github.io/meta-edit/>.

Pull requests are built (so a broken build shows up before merging) but not deployed.
Changes that only touch Markdown or `docs/` don't trigger a build. You can also rerun the
workflow by hand from the **Actions** tab (*GH Pages deploy* → *Run workflow*).

Repository settings this relies on:

- **Settings → Pages → Build and deployment**: Source *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.
- **Settings → Actions → General → Workflow permissions**: the workflow asks for `contents: write` itself;
  if your organisation restricts this, allow *Read and write permissions*.

If the site is moved to another repository name, update `publicPath` in
[`vue.config.js`](vue.config.js) to `/<new-repo-name>/`, otherwise the page loads blank.

## Changing the form

The form is generated from a JSON Schema by
[vjsf](https://koumoul-dev.github.io/vuetify-jsonschema-form/latest/) (v2). To add,
remove or reword a field you normally only edit two files:

| File | What it controls |
| --- | --- |
| [`src/models/mcf/model.json`](src/models/mcf/model.json) | The fields: `title` is the label, `description` the help text, `enum` turns a field into a dropdown, `required` marks mandatory fields. `"x-display": "textarea"` gives a multi-line box; `"x-display": "hidden"` hides a field. |
| [`src/models/mcf/template.json`](src/models/mcf/template.json) | The values a new record starts with (File → New). `$today$` is replaced with today's date. |
| [`public/help.html`](public/help.html) | The help page. Update it when you add, remove or rename a field. |

Each top-level property in `model.json` is one step in the form. Keep field names
identical to the [MCF reference](https://geopython.github.io/pygeometa/reference/mcf/),
because the saved file uses them as-is.

### How records are converted

MCF stores contacts, distributions and keyword groups as key-value maps
(`contact: {owner: {...}}`); vjsf can only edit lists. The conversion lives in
[`src/scripts/helpers.js`](src/scripts/helpers.js):

- `mcfToForm()` runs when a file is opened or imported. It turns those maps into
  lists (`contact.contacts`, `distribution.distributions`, `identification.keywords`),
  picks the metadata language out of multilingual values such as
  `description: {en: ...}`, and upgrades MCF 1.0 fields (`datestamp`, a plain-string `license`).
- `formToMcf()` runs on Save and Export and does the reverse: contacts are keyed by
  their role (a second contact with the same role becomes `owner_2`), distributions by
  `i0`, `i1`, ..., keyword groups by their keyword type; the distribution description
  is written as `{<metadata language>: text}`; sections are written in a fixed order.

If you add a new field that is a key-value map or multilingual in MCF, extend these two functions.

### Other metadata models

`src/models/` also contains schemas for
[OGC API - Records](https://ogcapi.ogc.org/records/) and
[Data Package](https://specs.frictionlessdata.io/data-package/). Switch with the
`vocab` constant at the top of [`src/App.vue`](src/App.vue). These models have not
been updated alongside MCF, and Save/Export assume MCF.

## Project layout

```
public/              static files; index.html, help.html, logos, codelists
src/App.vue          the form and Save/Export
src/components/      MainMenu.vue (File menu, import dialogs), FileReader.vue
src/models/          JSON Schema + template per metadata model
src/scripts/         helpers.js (MCF <-> form conversion)
public/help.html     help page for people filling in the form (linked from the Help button)
```

## Known limitations

- The app uses Vue 2 and Vuetify 2, which no longer receive updates. Moving to Vue 3
  means switching to vjsf v3 and rewriting `App.vue` and `MainMenu.vue`.
- Import and Export depend on the public pygeoapi demo server; if it is down or changes,
  those menu items fail. Opening and saving MCF files always works.

## License

[MIT](LICENSE.md)
