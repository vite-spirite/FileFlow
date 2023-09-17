<template>
    <div class="prose max-w-none pt-32">
        <h1>Téléchargement</h1>
        <button @click="download" v-if="!activeDownload" class="bg-neutral-900/25 text-neutral-100 w-full rounded-lg text-lg p-6">Télécharger</button>
        <div v-else>
            <h1>Téléchargement en cours...</h1>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const {file, token} = defineProps<{file: string, token: string}>();

const activeDownload = ref(false);


const download = async () => {
    console.log("call");
    const result = await axios.get(`http://localhost:3000/upload/${file}/${token}`, {
        responseType: 'arraybuffer',
        onDownloadProgress(progressEvent) {
            activeDownload.value = true;
        },
    });

    const blob = new File([result.data], file.replace('.enc', '.zip'));
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', file.replace('.enc', '.zip'));
    document.body.appendChild(link);
    link.click();

    link.remove();
    activeDownload.value = false;
}
</script>