<template>
    <section id="app-skeleton">
        <h5 class="mb-1">{{ $t("@app/skeleton-app.content.title") }}</h5>
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

            // Pick a random page of vehicles available in SWAPI
            const randomPage = randomNumber(3) + 1;

            await props.app.utils.apiCall({
                    url: `https://swapi.dev/api/starships/?page=${randomPage}`,
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
