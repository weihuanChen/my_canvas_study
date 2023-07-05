<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-02-26 19:58:01
 * @Description: 回退重做
-->

<template>
    <div style="display: inline-block" class="template">
        <!-- 后退 -->
        <Tooltip :content="`撤销` + `(${undoStack.length})`">
            <!-- <Button @click="undo" type="text" size="small" :disabled="!canUndo">
                                    <Icon type="ios-undo" size="20" />
                </Button> -->
        <span class="text" @click="undo" :disabled="!canUndo"
                :style="canUndo === true ? '' : 'pointer-events: none'">撤销</span>
        </Tooltip>

        <!-- 重做 -->
    <Tooltip :content="`重做` + `(${redoStack.length})`">
        <!-- <Button @click="redo" type="text" size="small" :disabled="!canRedo">
                                <Icon type="ios-redo" size="20" />
                            </Button> -->
            <span class="text" @click="redo" :disabled="!canRedo"
                :style="canRedo === true ? '' : 'pointer-events: none'">重做</span>
        </Tooltip>
        <!-- <span class="time" v-if="history.length">
                                    {{ useDateFormat(history[0].timestamp, 'HH:mm:ss').value }}
                                </span> -->
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { useRefHistory, useDateFormat } from '@vueuse/core';
import { keyNames, hotkeys } from '@/core/initHotKeys';
import type { fabric } from 'fabric';
import * as vfe from 'vfe';
import EditorWorkspace from '@/core/EditorWorkspace';
const canvas = inject<vfe.ICanvas>('canvas');


const {
    undo: _undo,
    redo: _redo,
    canRedo,
    canUndo,
    commit,
    pause,
    resume,
    clear,
    history,
    source,
    redoStack,
    undoStack,
    isTracking,
} = useRefHistory(ref(), {
    capacity: 50,
});

const save = (event: fabric.IEvent) => {
    // 过滤选择元素事件
    const isSelect = event.action === undefined && event.e;
    if (isSelect || !canvas) return;
    // 丢弃workspace创建前的记录
    if (!canvas.editor.editorWorkspace) {

        source.value = canvas.editor.getJson();
        commit();
        clear();
        return;
    }

    if (isTracking.value) {
        source.value = canvas.editor.getJson(canvas.c);
    }
};

// 后退
const undo = () => {
    _undo();
    renderCanvas();
};
// 重做
const redo = () => {
    _redo();
    renderCanvas();
};

const renderCanvas = () => {
    if (!canvas) return;
    pause();
    canvas.c.clear();
    canvas.c.loadFromJSON(source.value, () => {
        canvas.c.renderAll();
        resume();
    });
};

onMounted(() => {
    console.log('adde是事件被加入，绑定该事件后，需要调起添加对象的行为才能监听到');

    canvas.c.on({
        'object:added': save,
        'object:modified': save,
        'selection:updated': save,
    });
    hotkeys(keyNames.ctrlz, undo);
});

onUnmounted(() => {
    canvas?.c.off({
        'object:added': save,
        'object:modified': save,
        'selection:updated': save,
    });
});
</script>
  
<style scoped lang="less">
span.active {
    svg.icon {
        fill: #2d8cf0;
    }
}

.time {
    color: #c1c1c1;
}

.template {
    .text {
        cursor: pointer;
        color: #ffffff;
        margin-right: 5px;
        // pointer-events: none;
    }
}
</style>
  
<script lang="ts">
export default {
    name: 'ToolBar',
};
</script>
  