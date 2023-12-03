import { ref, watch } from "vue";

export function docClientWHRef() {
  let width = ref(document.documentElement.clientWidth);
  let height = ref(document.documentElement.clientHeight);
  function listen() {
    width.value = document.documentElement.clientWidth;
    height.value = document.documentElement.clientHeight;
  }
  function run() {
    window.addEventListener("resize", listen);
  }
  function destory() {
    window.removeEventListener("resize", listen);
  }
  return {
    width,
    height,
    run,
    destory,
  };
}

export function syncWithLocal(valName: string, initVal?: string) {
  let refVal = ref(localStorage.getItem(valName) || initVal || "");
  watch(refVal, (newVal) => {
    localStorage.setItem(valName, newVal);
  });
  return refVal;
}
