export function getNameTime(feature, time_field = "phenomenonTime") {
    var name = clean(feature.name);

    if (feature[time_field].includes("/")) {
        const splitTime = feature[time_field].split("/");
        var timeDifference =
            new Date(splitTime[1]).getTime() - new Date(splitTime[0]).getTime();
        var minuteDifference = Math.floor(timeDifference / (1000 * 60));
        var hourDifference = Math.floor(timeDifference / (1000 * 3600));

        if (hourDifference > 0) {
            name = `${name} (${hourDifference} hr)`;
        } else if (minuteDifference > 0) {
            name = `${name} (${minuteDifference} min)`;
        }
    }

    return name;
}

export function clean(word) {
    if (typeof word === "string") {
        if (word.search(/\d+$/) > -1) {
            // String ends with a number
            var endingNumber = word.match(/\d+$/g);
            word = word.replace(endingNumber, `_${endingNumber}`);
        }

        if (word.search(/^\d+/) > -1) {
            // String starts with a number
            var leadingNumber = word.match(/^\d+/g);
            word = word.replace(leadingNumber, `${leadingNumber}_`);
        } else {
            word = word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
        }

        return word.replaceAll("_", " ");
    }
}

/**
 * Convert a list of items to an MCF-style dictionary.
 * The value of item[key] is used as dictionary key (e.g. a contact's role);
 * when it is missing, keys i0, i1, ... are used. Duplicate keys get a
 * numeric suffix (owner, owner_2) so no item is silently dropped.
 */
export function array2dict(arr, key) {
    var res = {};
    if (Array.isArray(arr)) {
        arr.forEach(function (item, i) {
            var k = (key && item && item[key]) ? item[key] : 'i' + i;
            var unique = k, n = 2;
            while (Object.prototype.hasOwnProperty.call(res, unique)) {
                unique = k + '_' + (n++);
            }
            res[unique] = item;
        });
    }
    return res;
}

/**
 * Convert an MCF-style dictionary to a list of items. When key is given and
 * an item lacks that property, the dictionary key is stored in it
 * (e.g. contact "owner" gets role: owner).
 */
export function dict2array(dict, key) {
    var res = [];
    if (Array.isArray(dict)) return dict.slice();
    if (dict && typeof dict === 'object') {
        Object.keys(dict).forEach(function (k) {
            var item = Object.assign({}, dict[k]);
            if (key && (!item[key] || item[key] == "")) {
                item[key] = k;
            }
            res.push(item);
        });
    }
    return res;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj === undefined ? {} : obj));
}

function today() {
    return new Date().toISOString().substring(0, 10);
}

/** Pick one language from an i18n value such as {en: "..."}; plain strings pass through. */
function fromI18n(value, lang) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value[lang] !== undefined) return value[lang];
        var keys = Object.keys(value);
        return keys.length ? value[keys[0]] : "";
    }
    return value === undefined || value === null ? "" : value;
}

/** Form sections, in the order they are written to the MCF file. */
export const MCF_SECTIONS = [
    "mcf", "metadata", "spatial", "identification", "content_info",
    "distribution", "contact", "acquisition", "dataquality"
];

/**
 * A fresh, empty record based on a model template; "$today$" is replaced by
 * today's date.
 */
export function newRecord(template) {
    return JSON.parse(JSON.stringify(template).split('$today$').join(today()));
}

/**
 * Convert a parsed MCF record (as read from YAML) to the shape the form uses.
 * vjsf cannot edit key-value maps, so contacts, distributions and keyword
 * groups become lists. Does not modify its input.
 */
export function mcfToForm(mcf) {
    var model = clone(mcf);
    var lang = (model.metadata && model.metadata.language) || 'en';

    if (!model.contact || !model.contact.contacts) {
        model.contact = { contacts: dict2array(model.contact, "role") };
    }

    if (!model.distribution || !model.distribution.distributions) {
        model.distribution = { distributions: dict2array(model.distribution) };
    }
    model.distribution.distributions.forEach(function (d) {
        d.description = fromI18n(d.description, lang);
    });

    if (!model.identification) model.identification = {};
    var kw = model.identification.keywords;
    if (kw && !Array.isArray(kw)) {
        kw = dict2array(kw);
    }
    // older records may hold plain strings instead of keyword groups
    if (Array.isArray(kw) && kw.length && typeof kw[0] === 'string') {
        kw = [{ keywords: kw, keywords_type: 'theme' }];
    }
    model.identification.keywords = (kw || []).map(function (group) {
        var g = Object.assign({}, group);
        if (g.keywords && !Array.isArray(g.keywords)) {
            // {en: [...]} or "a, b, c"
            var words = fromI18n(g.keywords, lang);
            g.keywords = Array.isArray(words) ? words : String(words).split(',').map(function (w) { return w.trim(); }).filter(Boolean);
        }
        return g;
    });

    // MCF 1.0 kept the license as a string and the metadata date as datestamp
    if (typeof model.identification.license === 'string') {
        model.identification.license = { name: model.identification.license, url: "" };
    }
    if (model.metadata && model.metadata.datestamp && !model.metadata.dates) {
        model.metadata.dates = { creation: String(model.metadata.datestamp) };
        delete model.metadata.datestamp;
    }
    return model;
}

/**
 * Convert the form model back to an MCF 2.0 record ready to be written as
 * YAML. Does not modify the form model.
 */
export function formToMcf(model) {
    var form = clone(model);
    var lang = (form.metadata && form.metadata.language) || 'en';
    var out = {};

    if (form.contact) {
        form.contact = array2dict(form.contact.contacts, "role");
    }
    if (form.distribution) {
        var dists = form.distribution.distributions || [];
        dists.forEach(function (d) {
            if (typeof d.description === 'string') {
                var desc = {};
                desc[lang] = d.description;
                d.description = desc;
            }
        });
        form.distribution = array2dict(dists);
    }
    if (form.identification && Array.isArray(form.identification.keywords)) {
        form.identification.keywords = array2dict(form.identification.keywords, "keywords_type");
    }
    if (!form.mcf) form.mcf = {};
    form.mcf.version = 2.0;

    // write sections in a fixed, readable order; keep anything extra at the end
    MCF_SECTIONS.concat(Object.keys(form)).forEach(function (s) {
        if (form[s] !== undefined && out[s] === undefined) out[s] = form[s];
    });
    return out;
}

export function hasLinks(feature) {
    return feature && feature.links && feature.links.length > 0;
}