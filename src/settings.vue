<template>
    <section>
        <b-form @submit.prevent="saveSettings">
            <!-- START Mandatory, do not change -->
            <b-form-group
                :label="`${$t('@app/skeleton.settings.active')}`"
                content-cols-lg="7"
                content-cols-sm
                label-cols-lg="3"
                label-cols-sm="4"
                label-for="active"
            >
                <b-form-checkbox
                    id="active"
                    v-model="active"
                    switch
                ></b-form-checkbox>
            </b-form-group>
            <!-- END -->

            <!-- YOUR SETTINGS HERE -->

            <!-- START Mandatory, do not change -->
            <hr />

            <b-row class="mt-2">
                <b-col offset-md="3">
                    <b-button
                        :disabled="isSaving"
                        class="mb-2"
                        type="submit"
                        variant="primary"
                    >
                        <b-spinner
                            v-if="isSaving"
                            class="mr-50"
                            small
                        ></b-spinner>
                        {{ $t("@app/skeleton.settings.save") }}
                    </b-button>
                </b-col>
            </b-row>
            <!-- END -->
        </b-form>
    </section>
</template>

<script>
import {
    BButton,
    BCol,
    BForm,
    BFormCheckbox,
    BFormGroup,
    BRow,
    BSpinner,
} from "bootstrap-vue";
import { onBeforeMount, ref } from "@vue/composition-api";
import i18n from "@/libs/i18n";

export default {
    components: {
        BButton,
        BCol,
        BForm,
        BFormCheckbox,
        BFormGroup,
        BRow,
        BSpinner,
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

        const saveSettings = async () => {
            isSaving.value = true;

            await props.app.utils
                .saveSettings({
                    active: Boolean(active.value),
                })
                .then(() => {
                    props.app.utils.notify(
                        i18n.t("@app/skeleton.settings.save-success-title"),
                        "success"
                    );
                })
                .catch(() => {
                    props.app.utils.notify(
                        i18n.t("@app/skeleton.settings.save-error-title"),
                        "error"
                    );
                })
                .finally(() => (isSaving.value = false));
        };

        const initSettings = () => {
            active.value = Boolean(props.app.utils.getSetting("active", false));
        };

        onBeforeMount(initSettings);

        return {
            isSaving,
            active,
            saveSettings,
        };
    },
};
</script>
