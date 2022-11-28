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
import { ref } from "@vue/composition-api";

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

        return {
            isLoading,
        };
    },
};
</script>

<style lang="scss">
</style>
