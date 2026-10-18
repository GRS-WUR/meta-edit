# Form guide

How to describe a dataset with meta-edit (<https://grs-wur.github.io/meta-edit/>).

The form produces a **Metadata Control File (MCF)**: a YAML file that describes your
dataset so others can find it, understand it and reuse it. Save it next to your data
(for example in the same repository or archive folder) under the identifier you chose,
e.g. `4TU-UAV-SIF-test.yml`.

Most examples below come from a real record: a UAV dataset of sun-induced chlorophyll
fluorescence over potato and sugar beet fields, published on 4TU.ResearchData.
Examples in *italics* are illustrative only.

## The basics

- The form is a series of steps. Click a step's title to open it; you can move between
  steps in any order.
- Fields marked with `*` in this guide are required. Everything else can be left empty;
  empty fields are still written to the file, which is fine.
- Each field has help text explaining what to enter.
- For lists (contacts, keywords, platforms, ...) use the **+** button to add an entry and
  the bin icon to remove one.
- **Save** downloads the record as `<identifier>.yml`. Nothing is stored in the browser,
  so save before closing the tab.
- To continue later, use **File → Open** and select the `.yml` file you saved.
- **File → New** clears the form and starts again from the GRS defaults.

## Steps and fields

### Metadata — about the record itself

| Field | What to enter | Example |
| --- | --- | --- |
| Identifier * | A short unique name; it becomes the file name. Students: use the ID given by the data steward. | `4TU-UAV-SIF-test` |
| Language | 2-letter code of the language you write the metadata in. | `en` |
| Alternate language | Optional second language. | |
| Character set | Leave as `utf8`. | `utf8` |
| Parent identifier | Optional: the record or DOI this dataset belongs to. Students: supervisor's last name. | `DOI:10.4121/20348382.v1` |
| Hierarchy level * | What is described; usually `dataset`. | `dataset` |
| Metadata dates → Creation | Date you made this record; filled in automatically for a new record. | `2026-10-08` |
| Dataset URI | Optional persistent URI of the dataset. | |

### Spatial information

| Field | What to enter | Example |
| --- | --- | --- |
| Data type | `grid` for rasters and imagery, `vector` for points/lines/polygons, `textTable` for tables. | `grid` |
| Geometry type | For imagery, `surface`; for vector data, the geometry used. | `surface` |

### Identification — what the dataset is

| Field | What to enter | Example |
| --- | --- | --- |
| Dataset language | Language of the data themselves, if any. | `en` |
| Title * | The dataset's name, e.g. the publication or thesis title. | Diurnal UAV-based sun-induced chlorophyll fluorescence over potato and sugar beet fields |
| Abstract | A few sentences: what was measured, where, when, with what. | |
| Edition | Optional version number. | |
| Dataset dates | When the data were created, published and last revised. Fill in at least one. | creation `2018-08-02`, publication `2022-08-23` |
| Keywords | Add a group, type keywords (press Enter after each), choose the keyword type (usually `theme`; `place` for locations). Optionally name the vocabulary they come from. | |
| Topic categories | Optional ISO categories, e.g. `farming`, `imageryBaseMapsEarthCover`, `environment`. | |
| Extents → Spatial | Bounding box `[min lon, min lat, max lon, max lat]` and EPSG code. Defaults cover the Netherlands in WGS 84 (4326). | `[3.356, 50.75, 7.218, 53.563]`, `4326` |
| Extents → Temporal | Optional begin and end date of the data. | |
| Access constraints | Usually `license`; `otherRestrictions` if there are none. | `license` |
| License | Name and link of the license. Defaults to CC BY 4.0. | `CC BY 4.0`, `https://creativecommons.org/licenses/by/4.0` |
| Rights | Optional rights or copyright statement. | |
| Dataset URL | Optional landing page of the dataset. | |
| Browse graphic | Optional link to a thumbnail image that previews the dataset. | |
| Status | `completed` for finished datasets. | `completed` |
| Maintenance frequency | How often the data change; `asNeeded` for most research data. | `asNeeded` |

### Content information — what is inside

| Field | What to enter | Example |
| --- | --- | --- |
| Content type | `image` for imagery, `coverage` for other gridded data, `feature_catalogue` for vector data. | `image` |
| Processing level | Optional imagery processing level. | *L1* |
| Attributes | One entry per variable (column, band or layer): name as in the data, readable title, data type, units, optional link to a definition. | *name `SIF`, units `mW m-2 sr-1 nm-1`* |
| Dimensions | For imagery, one entry per spectral band: name, units and min/max wavelength. | *`green`, `nm`, `530`, `570`* |

### Distribution information — where to get the data

One entry per location (repository, download link, web service).

| Field | What to enter | Example |
| --- | --- | --- |
| URL * | Link to the data or landing page. | `https://data.4tu.nl/datasets/25a3055f-.../1` |
| Type | `WWW:LINK` for a web page or repository; an OGC type for map/data services. | `WWW:LINK` |
| Name | Name of the repository or service. | `4TU.ResearchData` |
| Description | What is found there. Saved in the metadata language (`description: {en: ...}`). | |
| Function | `download` if the data can be downloaded there, `information` for a description page. | `download` |

### Contact information

One entry per responsible party. Each role can be used once per record.

| Field | What to enter | Example |
| --- | --- | --- |
| Role * | `owner` for the data owner; `pointOfContact` for whom to ask; `originator`/`author` for who created the data. | `owner` |
| Organization * | GRS unless otherwise specified. | `GRS` |
| Name, position | The responsible person. | `Lammert Kooistra` |
| Email * | Contact email. | |
| URL, phone, fax, address, city, administrative area, postal code, country | Contact details; fill in what is useful. City and country default to Wageningen, Netherlands. | |
| Contact instructions | Optional: when or how to get in touch. | |

### Acquisition — how the data were collected

One entry per platform, each with its instruments.

| Field | What to enter | Example |
| --- | --- | --- |
| Platform | Platform name. | `Dji Mavic2` |
| Description | Kind of platform. | `Quadcopter` |
| Instruments | Instrument name and type. | `Parrot Sequoia`, `MSP sensor` |

### Data quality

| Field | What to enter | Example |
| --- | --- | --- |
| Scope → Level | What the statement applies to; leave as `dataset`. | `dataset` |
| Lineage statement | How the dataset was made: sources, processing steps, software and versions. | this dataset was derived from a custom process |

## Importing instead of typing

**File → Import** can pre-fill the form:

- **DOI**: enter a DOI (e.g. `10.4121/20348382.v1`) to fill in title, authors, publisher,
  publication date and keywords from the DOI registration.
- **iso19139**: give a URL to, or upload, an ISO 19139 XML record.
- **Import from WMS**: enter a WMS service URL, pick a layer, and its title, abstract,
  keywords, extent and contact are filled in.

Imported values are merged into what is already in the form. Check the result:
imports never fill in everything. Import uses a public conversion service, so it needs
an internet connection and can occasionally be unavailable.

## Exporting to other formats

**File → Export** converts the record to ISO 19139 (XML), OGC API - Records, STAC or DCAT,
for repositories or catalogues that require those formats. Keep the `.yml` file as your
master copy: it is the one you can open and edit again in meta-edit.

## Sharing a pre-filled form

If your `.yml` file is online (e.g. on GitHub, use the *Raw* link), others can open it
directly in the form with:

```
https://grs-wur.github.io/meta-edit/?mcf=<link to the .yml file>
```
