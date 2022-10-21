// Import vue component
import content from "./content.vue";
import settings from "./settings.vue";
import VueCompositionAPI from "@vue/composition-api";
import Vue from "vue";
import { locales } from "./locales";

Vue.use(VueCompositionAPI);

// Load package.json information
// Note: Using pkg because package is a reserved keyword
const pkg = require("../package.json");

const installers = new Map();

// install function executed by Vue.use()
function installer(name, component) {
    // Prevent having multiple installers for a single component
    if (installers.has(name)) {
        return installers.get(name);
    }

    // Registers component with vue under the name `plugin-appName-name`
    function install(Vue) {
        if (install.installed) return;
        install.installed = true;
        Vue.use(VueCompositionAPI);
        Vue.component(`plugin-${pkg.saysimple.name}-${name}`, component);
    }

    installers.set(name, install);
    return install;
}

function prefixLocales(locales) {
    return Object.entries(locales).reduce((prefixedLocales, [language, messages]) => {
        prefixedLocales[language] = {
            [`@app/${toKebabCase(pkg.saysimple.name)}`]: messages,
        };

        return prefixedLocales;
    }, {});
}

function toKebabCase(str) {
    return (
        str &&
        str
            .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
            .map((x) => x.toLowerCase())
            .join("-")
    );
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
content.install = installer("content", content);
settings.install = installer("settings", settings);

export default {
    name: pkg.saysimple.name,
    plugin: {
        name: pkg.name,
        version: pkg.version,
        saysimple: pkg.saysimple,
    },
    components: {
        settings,
        content,
    },
    locales: prefixLocales(locales),
};