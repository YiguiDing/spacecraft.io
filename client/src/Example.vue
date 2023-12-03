<script setup lang="ts">
import { SpacecraftVue, ServerConfig } from "./index";
let list: ServerConfig = [
  {
    label: "http://localhost:3333",
    value: "http://localhost:3333",
  },
];
</script>

<template>
  <SpacecraftVue :server-addrs="list" />
</template>
