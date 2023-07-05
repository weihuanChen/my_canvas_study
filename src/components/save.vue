<!--
Time: 2023-04-10 14:33:18

 * @Description: 保存文件
-->

<template>
  <div class="save-box">
    <!-- <Button style="margin-left: 10px" type="text" @click="beforeClear">
      清空
        </Button> -->
    <Dropdown @on-click="saveWith">
      <!-- <Button type="primary">
            保存
            <Icon type="ios-arrow-down"></Icon>
          </Button> -->
      <span class="save_button">
        保存
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <template #list>
        <DropdownMenu>
          <DropdownItem name="clipboard">复制到剪切板</DropdownItem>
          <DropdownItem name="saveImg">保存为图片</DropdownItem>
          <DropdownItem name="saveSvg">保存为svg</DropdownItem>
          <DropdownItem name="saveJson" divided>保存为JSON格式</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
    <Modal
      v-model="state.showFlag"
      title="选择分类导出"
      @on-ok="handleSubmitSave"
    >
      <Select v-model="state.selectValue">
        <Option
          v-for="item of selectList"
          :value="item.value"
          :key="item.value"
          >{{ item.label }}</Option
        >
      </Select>
    </Modal>
  </div>
</template>
  
<script setup name="save-bar">
import { Modal, Input, Select, Option } from "view-ui-plus";
import { clipboardText } from "@/utils/utils.js";
import useSelect from "@/hooks/select";
import { v4 as uuid } from "uuid";
import { debounce, cloneDeep, clone } from "lodash-es";
import { useI18n } from "vue-i18n";
import { reactive, inject, onMounted, ref } from "vue";
const { canvas } = useSelect();
const selectList = inject("selectList");
const state = reactive({
  selectValue: "",
  showFlag: false,
  exportType: "",
});
const cbMap = {
  clipboard(canvas) {
    const jsonStr = canvas.editor.getJson();
    clipboardText(JSON.stringify(jsonStr, null, "\t"));
  },

  saveJson(_canvas) {
    //克隆副本
    //由于要保持原有画布的状态，不能把其他的类型删掉，因此要基于副本进行操作
    // let _canvas = cloneDeep(canvas)
    // for (const item of _canvas.c.getObjects()) {
    //   if (item.text === '厂房1组') {
    //     _canvas.c.remove(item)
    //   }
    // }
    //转换的也是副本
    const dataUrl = _canvas.editor.getJson([
      "text",
      "id",
      "factoryId",
      "graphicalId",
      "name",
      "value",
      "type",
    ]);
    const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t")
    )}`;
    downFile(fileStr, "json");
  },

  saveSvg(canvas) {
    const workspace = canvas.c
      .getObjects()
      .find((item) => item.id === "workspace");
    const { left, top, width, height } = workspace;
    const dataUrl = canvas.c.toSVG({
      width,
      height,
      viewBox: {
        x: left,
        y: top,
        width,
        height,
      },
    });
    const fileStr = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      dataUrl
    )}`;
    downFile(fileStr, "svg");
  },

  saveImg(canvas) {
    const workspace = canvas.c
      .getObjects()
      .find((item) => item.id === "workspace");
    canvas.editor.ruler.hideGuideline();
    const { left, top, width, height } = workspace;
    const option = {
      name: "New Image",
      format: "png",
      quality: 1,
      left,
      top,
      width,
      height,
    };
    canvas.c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.c.toDataURL(option);
    downFile(dataUrl, "png");
    canvas.editor.ruler.showGuideline();
  },
};
// const saveWith = debounce(function (type) {
//   cbMap[type] && typeof cbMap[type] === 'function' && cbMap[type]();
// }, 300);
const exportFile = debounce(function (type, canvas) {
  cbMap[type] && typeof cbMap[type] === "function" && cbMap[type](canvas);
}, 300);
const saveWith = (type) => {
  state.showFlag = true;
  state.exportType = type;
};
const handleSubmitSave = () => {
  //克隆副本
  //由于要保持原有画布的状态，不能把其他的类型删掉，因此要基于副本进行操作
  const { selectValue, exportType } = { ...state };
  let _canvas = cloneDeep(canvas);
  if (selectValue) {
    for (const item of _canvas.c.getObjects()) {
      //不等于选择属性的删除
      if (item.value !== selectValue && item.id !== "workspace") {
        _canvas.c.remove(item);
      }
    }
  }
  console.log(_canvas.c.getObjects());
  exportFile(exportType, _canvas);
};
/**
 * @desc clear canvas 清空画布
 */
const clear = () => {
  canvas.c.getObjects().forEach((obj) => {
    if (obj.id !== "workspace") {
      canvas.c.remove(obj);
    }
  });
  canvas.c.discardActiveObject();
  canvas.c.renderAll();
};

const beforeClear = () => {
  Modal.confirm({
    title: `提示`,
    content: `<p>清理提示</p>`,
    okText: "确认",
    cancelText: "取消",
    onOk: () => clear(),
  });
};

function downFile(fileStr, fileType) {
  const anchorEl = document.createElement("a");
  anchorEl.href = fileStr;
  anchorEl.download = `${uuid()}.${fileType}`;
  document.body.appendChild(anchorEl); // required for firefox
  anchorEl.click();
  anchorEl.remove();
}
onMounted(() => {});
</script>
  
<style scoped lang="less">
.save-box {
  display: inline-block;
  // padding-right: 10px;

  .save_button {
    cursor: pointer;
    color: #ffffff;
  }
}
</style>
  