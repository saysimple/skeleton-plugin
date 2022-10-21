<template>
    <section id="app-skeleton">
        <h5 class="mb-1">{{ $t("@app/skeleton.content.title") }}</h5>
        <div class="text-center">
            <b-spinner v-if="isLoading" class="mb-2" />
        </div>
    </section>
</template>

<script>
import { BSpinner } from "bootstrap-vue";
import { onBeforeMount, ref } from "@vue/composition-api";

export default {
    components: {
        BSpinner,
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

        const initSettings = () => {
            loadData();
        };

        // https://swapi.dev/
        const loadData = async () => {
            isLoading.value = true;

            await props.app.utils.apiCall({
                    url: `https://swapi.dev/api/starships/?page=1`,
                    method: "GET",
                },
            ).finally(() => isLoading.value = false);
        };

        onBeforeMount(initSettings);

        return {
            isLoading,
        };
    },
};
</script>

<style lang="scss">
</style>
