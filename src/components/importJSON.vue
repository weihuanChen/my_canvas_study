<!--

-->

<template>
    <div style="display: inline-block">
        <Button @click="insert" type="text" size="small">导入JSON文件</Button>
    </div>
</template>
  
<script>
import { selectFiles, downFontByJSON } from '@/utils/utils';

export default {
    name: 'ToolBar',
    inject: ['canvas', 'fabric'],
    methods: {
        insert() {
            selectFiles({ accept: '.json' }).then((files) => {
                const [file] = files;
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = () => {
                    this.insertSvgFile(reader.result);
                };
            });
        },
        insertSvgFile(jsonFile) {
            // 加载字体后导入
            downFontByJSON(jsonFile).then(() => {
                this.$nextTick(() => {
                    console.log('import',this.canvas.c.getObjects());
                    this.canvas.c.loadFromJSON(jsonFile, () => {
                        this.canvas.c.renderAll.bind(this.canvas.c);
                        //必须要有workspace的字段才能正确读取
                        setTimeout(() => {
                            const workspace = this.canvas.c.getObjects().find((item) => item.id === 'workspace');
                            workspace.set('selectable', false);
                            workspace.set('hasControls', false);
                            this.canvas.c.requestRenderAll();
                            this.canvas.editor.editorWorkspace.setSize(workspace.width, workspace.height);
                            this.canvas.c.renderAll();
                            this.canvas.c.requestRenderAll();
                        }, 100);
                    });
                })
            });
        },
    },
};
</script>
  
<style scoped lang="less"></style>
  