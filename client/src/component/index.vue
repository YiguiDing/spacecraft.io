<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Game } from "@/lib/Game";
import {
  ElButton,
  ElDialog,
  ElInput,
  ElMessage,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElSwitch,
  ElLink,
} from "element-plus";
import "element-plus/dist/index.css";
import { Config } from "@/lib/Config";
import { docClientWHRef, syncWithLocal } from "@/hooks";
import { publicServerAddrs, ServerConfig } from "@/config/servers";

const { serverAddrs } = defineProps({
  serverAddrs: {
    default: [] as ServerConfig,
  },
});

const addrs = [...serverAddrs, ...publicServerAddrs];
const docClient = docClientWHRef();
const showCanvas = ref(false);
const inputFormFlag = ref(false);
const onlineMode = ref(true);
const nickName = syncWithLocal("nickName");
const serverAddr = ref("");
const gameRootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let game: Game | undefined = undefined;

function gameInit() {
  if (!canvasRef.value || !gameRootRef.value) {
    console.log("error");
    return;
  }
  game = new Game(
    canvasRef.value!,
    new Config({ gameRootEleRef: gameRootRef.value! })
  );
  game.viewWidth = docClient.width.value;
  game.viewHeight = docClient.height.value;
  // 修改默认配置
  watch(docClient.width, (val) => {
    game && (game!.viewWidth = val);
  });
  watch(docClient.height, (val) => {
    game && (game!.viewHeight = val);
  });
  watch(nickName, (val) => {
    game && (game!.config.userName = val);
  });
  watch(onlineMode, (val) => {
    game && (game!.config.onlineMode = val);
  });
  watch(serverAddr, (val) => {
    game && (game!.config.serverAddr = val);
  });
}

function showDilog() {
  inputFormFlag.value = true;
}

function showHelp() {
  ElMessage({
    duration: 5000,
    showClose: true,
    message: "`↑`前进; `←`左转; `→`右转;",
  });
  ElMessage({
    duration: 5000,
    showClose: true,
    message: "`ctrl` 加速；`space` 攻击;",
  });
}

function gameStart() {
  if (!game) return;
  showCanvas.value = true;
  game.run();
  docClient.run();
}

function gameExit() {
  if (!game) return;
  showCanvas.value = false;
  game.destory();
}

function gameDestory() {
  if (!game) return;
  game.destory();
  docClient.destory();
}

onMounted(gameInit);
onBeforeUnmount(gameDestory);
</script>

<template>
  <div ref="gameRootRef" class="spacecraft-game-root">
    <canvas ref="canvasRef" id="spacecraft" v-show="showCanvas" />
    <div class="btns">
      <ElButton
        v-text="'小游戏'"
        class="btn start"
        v-if="!showCanvas"
        @click="showDilog"
      />
      <ElButton
        v-text="'提示'"
        class="btn info"
        v-if="showCanvas"
        @click="showHelp"
      />
      <ElLink
        v-text="'关于'"
        class="btn abut"
        v-if="showCanvas"
        href="https://github.com/YiguiDing/spacecraft.io"
        target="_blank"
      />
      <ElButton
        v-text="'退出'"
        class="btn quit"
        v-if="showCanvas"
        @click="gameExit"
      />
    </div>
    <ElDialog v-model="inputFormFlag" title="Spacecraft" center width="400px">
      <ElForm>
        <ElFormItem label="昵称">
          <ElInput v-model="nickName" />
        </ElFormItem>
        <ElFormItem
          :label="onlineMode ? '联机' : '单机'"
          allow-create
          default-first-option
          style="display: flex"
        >
          <ElSwitch v-model="onlineMode" />
          <ElSelect
            v-if="onlineMode"
            v-model="serverAddr"
            default-first-option
            style="margin-left: 10px; flex: 1"
          >
            <ElOption
              v-for="item in addrs"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton
          v-text="'开始游戏'"
          type="success"
          @click="(inputFormFlag = false), gameStart()"
        />
      </template>
    </ElDialog>
  </div>
</template>
<style scoped lang="less">
.spacecraft-game-root {
  width: fit-content;
}
canvas#spacecraft {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}
.btns {
  z-index: 1001;
  position: fixed;
  left: 0;
  bottom: 5px;
  width: fit-content;
  height: fit-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .btn {
    writing-mode: vertical-lr;
    width: fit-content;
    height: fit-content;
    color: white;
    border-radius: 0 5px 5px 0;
    line-height: 1rem;
    margin: 0;
    margin-top: 5px;
    padding: 5px 3px;
    cursor: pointer;
    font-size: medium;
    border: none;
  }

  .start {
    background-color: #75b775;
  }

  .quit {
    background-color: orange;
  }
  .abut {
    background-color: #80ff56;
  }
  .info {
    background-color: #75b7aa;
  }
}
</style>
