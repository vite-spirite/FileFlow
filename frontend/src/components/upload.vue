<template>
    <div class="upload overflow-hidden pb-16">
        <Transition name="slide" mode="out-in">
            <div class="card" v-if="step == 0">
                <div class="card-body">
                    <div class="input w-full flex flex-auto flex-row justify-start items-center bg-neutral-900/5 rounded-lg overflow-hidden text-neutral-900">
                        <input v-model="email" type="email" placeholder="Email" class="bg-transparent px-6 py-4 flex-1 outline-0 placeholder-neutral-600"/>
                        <button class="bg-neutral-900/10 h-full block px-6 py-4" @click="sendConfirmEmail">Vérifier mon email</button>
                        <button class="bg-neutral-900/10 h-full block px-6 py-4" @click="step++">Next</button>
                    </div>
                </div>
            </div>

            <div class="card" v-else-if="step == 1">
                <div class="card-body flex flex-col justify-center items-center space-y-5">
                    <div class="input w-full flex flex-auto flex-row justify-start items-center bg-neutral-900/5 rounded-lg overflow-hidden text-neutral-900">
                        <input v-model="code" type="text" placeholder="Code de sécurité" class="bg-transparent px-6 py-4 flex-1 outline-0 placeholder-neutral-600"/>
                    </div>

                    <div v-for="(target, index) in targets" :key="index" class="input w-full flex flex-auto flex-row justify-start items-center bg-neutral-900/5 rounded-lg overflow-hidden text-neutral-900">
                        <input v-model="targets[index]" type="text" placeholder="Déstinataire" class="bg-transparent px-6 py-4 flex-1 outline-0 placeholder-neutral-600"/>
                        <button class="bg-neutral-900/10 h-full block px-6 py-4" @click="targets.splice(index, 1)" v-if="targets.length > 1">Supprimer</button>
                    </div>

                    <button class="bg-neutral-900/25 h-full block px-6 py-4 w-full rounded-lg text-neutral-100" @click="targets.push('')">Ajouter un déstinataire</button>

                    <div ref="dropZoneEl" :class="{'w-full min-h-[150px] border-2 border-dashed border-neutral-900/25 rounded-lg flex flex-col': true, 'justify-center items-center': uploadFiles.length == 0, 'justify-start items-start space-y-2': uploadFiles.length > 0}">
                        <div class="text-neutral-900/25 text-2xl" v-show="uploadFiles.length == 0">Déposez vos fichiers ici</div>
                        <div class="text-neutral-100 rounded-md prose max-w-none w-full flex flex-row justify-between items-e=center px-6" v-for="(file, index) in uploadFiles" :key="`${index}-${file.name}`">
                            <h3>{{ file.name }}</h3>
                            <h3>{{ file.size }} Mo</h3>
                            <button class="bg-none text-red-500" @click="uploadFiles.splice(index, 1)">x</button>
                        </div>
                    </div>

                    <button class="bg-neutral-900/25 h-full block px-6 py-4 w-full rounded-lg text-neutral-100" @click="sendFiles" v-if="!uploadProgress.active">Envoyer</button>
                    <div class="flex flex-col w-full justify-start items-start prose max-w-none space-y-1" v-else>
                        <div class="flex flex-row justify-between items-center w-full">
                            <h3 class="text-neutral-900/25 p-0 m-0">Progression:</h3>
                            <h3 class="text-neutral-900/25 p-0 m-0">{{ uploadProgress.percentage }}%</h3>
                        </div>

                        <div class="w-full h-2 bg-neutral-900/25 rounded-lg overflow-hidden">
                            <div class="h-full bg-neutral-900/50" :style="{width: `${uploadProgress.percentage}%`}"></div>
                        </div>

                        <div class="flex flex-row justify-between items-center w-full">
                            <h3 class="text-neutral-900/25 p-0 m-0">Vitesse:</h3>
                            <h3 class="text-neutral-900/25 p-0 m-0">{{ uploadProgress.speed }} Bytes</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" v-else-if="step == 2">
                <div class="card-body flex flex-col justify-center items-center prose max-w-none">
                    <h1>Vos fichiers ont bien été envoyé, vous recevrez un email quand les déstinataires pourront les télécharger.</h1>

                    <button class="bg-neutral-900/25 h-full block px-6 py-4 w-full rounded-lg text-neutral-100" @click="step = 0">Envoyer d'autre fichiers.</button>
                </div>
            </div>
        </Transition>
    </div> 
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import axios from 'axios';

import {useDropZone} from '@vueuse/core';

interface FileUploads {
    name: string;
    size: number;
    type: string;
    data: File;
}

interface uploadProgress {
    active: boolean,
    percentage: number,
    speed: number,
    loaded: number,
    total: number
}

const step = ref(0);

const email = ref('');
const code = ref("");
const targets = ref([""]);

const uploadFiles: Ref<FileUploads[]> = ref([]);
const uploadProgress: Ref<uploadProgress> = ref({
    active: false,
    percentage: 0,
    speed: 0,
    loaded: 0,
    total: 0
});

const sendConfirmEmail = async () => {
    const result = await axios.post<boolean>('http://localhost:3000/security', {
        email: email.value
    });

    if(!result.data) {
        alert('Votre code de sécurité a déjà été envoyé ou votre email est invalide');
    }
    else {
        step.value++;
    }
}

const dropZoneEl = ref<HTMLElement | null>(null);
useDropZone(dropZoneEl, {
    onDrop(files, event) {
        files?.forEach((file) => {
            uploadFiles.value.push({
                name: file.name,
                size: file.size,
                type: file.type,
                data: file
            });
        })
    },
});

const sendFiles = () => {
    if(uploadFiles.value.length == 0) {
        alert('Vous devez ajouter au moins un fichier');
        return;
    }

    if(targets.value.length == 0) {
        alert('Vous devez ajouter au moins un déstinataire');
        return;
    }

    if(code.value == "") {
        alert('Vous devez ajouter un code de sécurité');
        return;
    }

    const formData = new FormData();
    uploadFiles.value.forEach((file: FileUploads) => {
        formData.append('files', file.data);
    });

    
    targets.value.forEach((target: string) => {
        formData.append('to[]', target);
    });

    formData.append('token', code.value);

    axios.post('http://localhost:3000/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? (uploadFiles.value as FileUploads[]).reduce((acc, file) => acc + file.size, 0);

            uploadProgress.value.active = true;
            uploadProgress.value.percentage = Math.round((progressEvent.loaded * 100) / total);
            uploadProgress.value.speed = progressEvent.bytes;
            uploadProgress.value.loaded = progressEvent.loaded;
            uploadProgress.value.total = total;

            if(total == progressEvent.loaded) {
                uploadProgress.value.active = false;
                uploadProgress.value.percentage = 0;
                uploadProgress.value.speed = 0;
                uploadProgress.value.loaded = 0;
                uploadProgress.value.total = 0;

                uploadFiles.value = [];

                targets.value = [""];
                code.value = "";

                email.value = "";

                step.value++;
            }
        }
    });
}

</script>

<style scoped>
.slide-leave-active,
.slide-enter-active {
  transition: all .5s;
}
.slide-enter-from {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(-100%, 0);
}
</style>
