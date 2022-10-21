import { BButton, BSpinner, BTable, BRow, BCol, BFormGroup, BFormInput, BFormCheckbox, BFormSelect, BForm } from 'bootstrap-vue';
import VueCompositionAPI, { ref, onBeforeMount } from '@vue/composition-api';
import i18n from '@/libs/i18n';
import Vue from 'vue';

//

var script$1 = {
    components: {
        BButton,
        BSpinner,
        BTable,
    },
    props: {
        app: {
            type: Object,
            required: true,
        },
        appData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    setup(props) {
        const isLoading = ref(false);
        const randomVehicle = ref({});

        const userName = ref(props.app.settings.userName);
        const userPass = ref(props.app.settings.userPass);
        const environment = ref(props.app.settings.environment);

        const initSettings = () => {
            userName.value = props.app.utils.getSetting("userName", "");
            userPass.value = props.app.utils.getSetting("userPass", "");
            environment.value = props.app.utils.getSetting("environment", "dev");

            loadData();
        };

        // https://swapi.dev/
        const loadData = async () => {
            isLoading.value = true;

            // Pick a random page of vehicles available in SWAPI
            const randomPage = randomNumber(3) + 1;

            randomVehicle.value = await props.app.utils.apiCall({
                    url: `https://swapi.dev/api/starships/?page=${randomPage}`,
                    method: "GET",
                },
            )
                .then((result) => result.results[randomNumber(result.results.length)])
                .finally(() => isLoading.value = false);
        };

        const randomNumber = (max) => {
            return Math.floor(Math.random() * max);
        };

        const vehicleCost = (amountInCredits) => {
            if (amountInCredits == 'unknown') {
                return;
            }

            // One imperial credit is about $4
            return (amountInCredits / 4).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            });
        };

        const createMessage = () => {
            props.app.utils.appendToMessage(i18n.t("@app/example-app.content.message-maintenance", {
                contactName: props.appData.contact.name,
                vehicleName: randomVehicle.value.name,
                manufacturer: randomVehicle.value.manufacturer,
                agentName: props.appData.assignedAgent ? props.appData.assignedAgent.name : "R2-D2",
            }));
            //`Dear ${props.appData.contact.name},\n\nYour ${randomVehicle.value.name} is due for some maintenance. Please contact ${randomVehicle.value.manufacturer} for an appointment.\n\nRegards,\n${props.appData.assignedAgent ? props.appData.assignedAgent.name : 'R2-D2'}`);
            props.app.utils.notify(i18n.t("@app/example-app.content.message-generated"));
        };

        onBeforeMount(initSettings);

        return {
            isLoading,
            randomVehicle,
            vehicleCost,
            createMessage,
        };
    },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('section',{attrs:{"id":"app-example-app"}},[_c('h5',{staticClass:"mb-1"},[_vm._v(_vm._s(_vm.$t("@app/example-app.content.title")))]),_vm._v(" "),_c('div',{staticClass:"text-center"},[(_vm.isLoading)?_c('b-spinner',{staticClass:"mb-2"}):_vm._e()],1),_vm._v(" "),(_vm.randomVehicle && !_vm.isLoading)?_c('table',{staticClass:"mb-2"},[_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.name")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.name))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.model")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.model))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.class")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.starship_class))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.manufacturer")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.manufacturer))])]),_vm._v(" "),(_vm.randomVehicle.cost_in_credits!== 'unknown')?_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.cost-in-credits")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.vehicleCost(_vm.randomVehicle.cost_in_credits)))])]):_vm._e(),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.length")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.length))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.max-speed")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.max_atmosphering_speed))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.crew")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.crew))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.passengers")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.passengers))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.cargo-capacity")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.cargo_capacity))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.hyperdrive-rating")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.hyperdrive_rating))])]),_vm._v(" "),_c('tr',[_c('td',[_vm._v(_vm._s(_vm.$t("@app/example-app.content.vehicle.mglt")))]),_vm._v(" "),_c('td',[_vm._v(_vm._s(_vm.randomVehicle.MGLT))])])]):_vm._e(),_vm._v(" "),_c('b-button',{staticClass:"w-100",attrs:{"variant":"primary"},on:{"click":_vm.createMessage}},[_vm._v("\n        "+_vm._s(_vm.$t("@app/example-app.content.generate-message"))+"\n    ")])],1)};
var __vue_staticRenderFns__$1 = [];

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-c70f920a_0", { source: "#app-example-app table tr td{font-size:12px;vertical-align:top}#app-example-app table tr td:first-child{font-weight:700;margin-right:12px}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector,
    undefined,
    undefined
  );

//

var script = {
    components: {
        BRow,
        BCol,
        BFormGroup,
        BFormInput,
        BButton,
        BFormCheckbox,
        BFormSelect,
        BSpinner,
        BForm,
    },
    props: {
        app: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const isSaving = ref(false);

        const active = ref(props.app.settings.active);
        const userName = ref(props.app.settings.userName);
        const userPass = ref(props.app.settings.userPass);
        const environment = ref(props.app.settings.environment);

        const environmentOptions = [
            { value: "dev", text: i18n.t("@app/example-app.settings.environment.dev") },
            { value: "acc", text: i18n.t("@app/example-app.settings.environment.acc") },
            { value: "prod", text: i18n.t("@app/example-app.settings.environment.prod") },
        ];

        const saveSettings = async () => {
            isSaving.value = true;

            await props.app.utils
                .saveSettings({
                    active: Boolean(active.value),
                    userName: userName.value,
                    userPass: userPass.value,
                    environment: environment.value,
                })
                .then(() => {
                    props.app.utils.notify(i18n.t("@app/example-app.settings.save-success-title"), "success");
                })
                .catch(() => {
                    props.app.utils.notify(i18n.t("@app/example-app.settings.save-error-title"), "error");
                })
                .finally(() => isSaving.value = false);
        };

        const initSettings = () => {
            active.value = Boolean(props.app.utils.getSetting("active", false));
            userName.value = props.app.utils.getSetting("userName", "");
            userPass.value = props.app.utils.getSetting("userPass", "");
            environment.value = props.app.utils.getSetting("environment", "dev");
        };

        onBeforeMount(initSettings);

        return {
            isSaving,
            active,
            userName,
            userPass,
            environment,
            environmentOptions,
            saveSettings,
        };
    },
};

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('section',[_c('b-form',{on:{"submit":function($event){$event.preventDefault();return _vm.saveSettings.apply(null, arguments)}}},[_c('b-form-group',{attrs:{"label":("" + (_vm.$t('@app/example-app.settings.active'))),"content-cols-lg":"7","content-cols-sm":"","label-cols-lg":"3","label-cols-sm":"4","label-for":"active"}},[_c('b-form-checkbox',{attrs:{"id":"active","switch":""},model:{value:(_vm.active),callback:function ($$v) {_vm.active=$$v;},expression:"active"}})],1),_vm._v(" "),_c('b-form-group',{attrs:{"label":_vm.$t('@app/example-app.settings.api-user-name'),"content-cols-lg":"7","content-cols-sm":"","label-cols-lg":"3","label-cols-sm":"4","label-for":"api-user-name"}},[_c('b-form-input',{attrs:{"id":"api-user-name","required":"","type":"text"},model:{value:(_vm.userName),callback:function ($$v) {_vm.userName=$$v;},expression:"userName"}})],1),_vm._v(" "),_c('b-form-group',{attrs:{"label":("" + (_vm.$t('@app/example-app.settings.api-user-pass'))),"content-cols-lg":"7","content-cols-sm":"","label-cols-lg":"3","label-cols-sm":"4","label-for":"api-user-pass"}},[_c('b-form-input',{attrs:{"id":"api-user-pass","required":"","type":"password"},model:{value:(_vm.userPass),callback:function ($$v) {_vm.userPass=$$v;},expression:"userPass"}})],1),_vm._v(" "),_c('b-form-group',{attrs:{"label":("" + (_vm.$t('@app/example-app.settings.environment.label'))),"content-cols-lg":"7","content-cols-sm":"","label-cols-lg":"3","label-cols-sm":"4","label-for":"environment"}},[_c('b-form-select',{attrs:{"id":"environment","options":_vm.environmentOptions},model:{value:(_vm.environment),callback:function ($$v) {_vm.environment=$$v;},expression:"environment"}})],1),_vm._v(" "),_c('hr'),_vm._v(" "),_c('b-row',{staticClass:"mt-2"},[_c('b-col',{attrs:{"offset-md":"3"}},[_c('b-button',{staticClass:"mb-2",attrs:{"disabled":_vm.isSaving,"type":"submit","variant":"primary"}},[(_vm.isSaving)?_c('b-spinner',{staticClass:"mr-50",attrs:{"small":""}}):_vm._e(),_vm._v("\n                    "+_vm._s(_vm.$t("@app/example-app.settings.save"))+"\n                ")],1)],1)],1)],1)],1)};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

const locales = {
    en: {
        settings: {
            active: "Active",
            "api-user-name": "Username",
            "api-user-pass": "Password",
            environment: {
                label: "Environment",
                dev: "Development",
                acc: "Acceptance",
                prod: "Production",
            },
            save: "Save",
            "save-success-title": "Settings saved",
            "save-error-title": "Error saving settings",
        },
        content: {
            title: "Contact Vehicle",
            "generate-message": "Generate message",
            "message-maintenance":
                "Dear {contactName},\n\nYour {vehicleName} is due for some maintenance. Please contact {manufacturer} for an appointment.\n\nRegards,\n{agentName}",
            "message-generated": "Message generated",
            vehicle: {
                name: "Name",
                model: "Model",
                class: "Starship Class",
                manufacturer: "Manufacturer",
                "cost-in-credits": "Cost",
                length: "Length",
                "max-speed": "Max. speed",
                crew: "Crew",
                passengers: "Passengers",
                "cargo-capacity": "Cargo",
                "hyperdrive-rating": "Hyperdrive Rating",
                mglt: "Megalight per hour",
            },
        },
    },
    nl: {
        settings: {
            active: "Actief",
            "api-user-name": "Gebruikersnaam",
            "api-user-pass": "Wachtwoord",
            environment: {
                label: "Environment",
                dev: "Development",
                acc: "Acceptance",
                prod: "Production",
            },
            save: "Opslaan",
            "save-success-title": "Settings opgeslagen",
            "save-error-title": "Fout bij opslaan settings",
        },
        content: {
            title: "Voertuig contact",
            "generate-message": "Genereer bericht",
            "message-maintenance":
                "Beste {contactName},\n\nUw voertuig {vehicleName} is toe aan wat onderhoud. Neem contact op met {manufacturer} voor een afspraak.\n\nGroet,\n{agentName}",
            "message-generated": "Message generated",
            vehicle: {
                name: "Name",
                model: "Model",
                class: "Starship Class",
                manufacturer: "Manufacturer",
                "cost-in-credits": "Cost",
                length: "Length",
                "max-speed": "Max. speed",
                crew: "Crew",
                passengers: "Passengers",
                "cargo-capacity": "Cargo",
                "hyperdrive-rating": "Hyperdrive Rating",
                mglt: "Megalight per hour",
            },
        },
    },
    es: {
        settings: {
            active: "Activo",
            "api-user-name": "Username",
            "api-user-pass": "Password",
            environment: {
                label: "Environment",
                dev: "Development",
                acc: "Acceptance",
                prod: "Production",
            },
            save: "Ahorrar",
            "save-success-title": "Settings saved",
            "save-error-title": "Error saving settings",
        },
        content: {
            title: "Vehículo de contacto",
            "generate-message": "Generar mensaje",
            "message-maintenance":
                "Dear {contactName},\n\nYour {vehicleName} is due for some maintenance. Please contact {manufacturer} for an appointment.\n\nRegards,\n{agentName}",
            "message-generated": "Message generated",
            vehicle: {
                name: "Name",
                model: "Model",
                class: "Starship Class",
                manufacturer: "Manufacturer",
                "cost-in-credits": "Cost",
                length: "Length",
                "max-speed": "Max. speed",
                crew: "Crew",
                passengers: "Passengers",
                "cargo-capacity": "Cargo",
                "hyperdrive-rating": "Hyperdrive Rating",
                mglt: "Megalight per hour",
            },
        },
    },
};

// Import vue component

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
__vue_component__$1.install = installer("content", __vue_component__$1);
__vue_component__.install = installer("settings", __vue_component__);

var index = {
    name: pkg.saysimple.name,
    plugin: {
        name: pkg.name,
        version: pkg.version,
        saysimple: pkg.saysimple,
    },
    components: {
        settings: __vue_component__,
        content: __vue_component__$1,
    },
    locales: prefixLocales(locales),
};

export { index as default };
//# sourceMappingURL=example.esm.js.map
