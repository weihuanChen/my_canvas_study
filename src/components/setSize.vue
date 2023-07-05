<!--
    尺寸设置
-->

<template>
    <div v-if="!mixinState.mSelectMode">
        <Divider plain orientation="left">尺寸</Divider>
        <Form :label-width="40">
            <FormItem label="宽度" prop="name">
                <InputNumber :max="2000" :min="1" v-model="width" @on-change="setSize"></InputNumber>
            </FormItem>
            <FormItem label="高度" prop="name">
                <InputNumber :max="2000" :min="1" v-model="height" @on-change="setSize"></InputNumber>
            </FormItem>
        </Form>
        <Divider plain orientation="left">默认尺寸</Divider>
        <ButtonGroup vertical>
            <Button v-for="(item, i) in presetSize" :key="`${i}presetSize`" size="small" style="text-align: left"
                @click="setSizeBy(item.width, item.height)">
                {{ item.label }}:{{ item.width }}x{{ item.height }}
            </Button>
        </ButtonGroup>
    </div>
</template>
  
<script setup name="CanvasSize">
import useSelect from '@/hooks/select';
import { ref, onMounted, reactive } from 'vue';

import EditorWorkspace from '@/core/EditorWorkspace';

const { canvas, mixinState } = useSelect();
//   const $t = useI18n();

let width = ref(1600);
let height = ref(1000);
let presetSize = reactive([
    {
        label: 'red_book_vertical',
        width: 900,
        height: 1200,
    },
    {
        label: 'red_book_horizontal',
        width: 1200,
        height: 900,
    },
    {
        label: 'phone_wallpaper',
        width: 1080,
        height: 1920,
    },
]);

onMounted(() => {
    console.log(canvas);
    // canvas.editor.editorWorkspace = new EditorWorkspace(canvas.c, {
    //     width: width.value,
    //     height: height.value,
    // });
});

const setSizeBy = (w, h) => {
    width.value = w;
    height.value = h;
    setSize();
};
const setSize = () => {
    canvas.editor.editorWorkspace.setSize(width.value, height.value);
};
</script>
  
<style scoped lang="less">
:deep(.ivu-form-item) {
    margin-bottom: 0;
}

:deep(.ivu-divider-plain) {
    &.ivu-divider-with-text-left {
        margin: 10px 0;
        font-weight: bold;
    }
}
</style>
  