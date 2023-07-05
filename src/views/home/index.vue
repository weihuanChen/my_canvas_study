<style lang="less" scoped>
@import "~./index.less";
</style>
<template>
  <div class="home">
    <Layout>
      <!-- <HelloWorld msg="Hello Vue 3.0 + Vite" /> -->
      <Header v-if="show" class="header">
        <!-- 导入 -->
        <!-- <import-JSON></import-JSON>
        <Divider type="vertical" />
        <space>
          <RadioGroup v-model="selectValue" button-style="solid" type="button">
            <Radio :label="item.value" v-for="item of selectList" :key="item.value">{{ item.label }}</Radio>
          </RadioGroup>
        </space>
        <div style="float: right">
          <Divider type="vertical" />
          <history></history>
          <Divider type="vertical" />
          <save></save>
                                              </div> -->
        <div class="header-edit_box">
          <div class="left_container">
            <import-JSON></import-JSON>
            <save></save>
            <history></history>
          </div>
          <Divider type="vertical" style="height: 1.6rem" />
          <a
            href="javascript: void(0)"
            @click="
              () => {
                editIndex = 0;
              }
            "
            class="tag"
            :class="editIndex === 0 ? 'active' : ''"
            >绘制</a
          >
          <a
            href="javascript: void(0)"
            @click="
              () => {
                editIndex = 1;
              }
            "
            class="tag"
            :class="editIndex === 1 ? 'active' : ''"
            >操作</a
          >
        
          <Divider type="vertical" style="height: 1.6rem" />
        </div>
        <div class="header-edit_box" v-if="editIndex == 0">
          <div>
            <a
              href="javascript: void(0)"
              v-for="(item, index) of selectList"
              :key="item.value"
              class="tag"
              :class="selectIndex === index ? 'active' : ''"
              @click="handleChangeSelectValue(index, item)"
              >{{ item.label }}</a
            >
          </div>
        </div>
        <div class="header-edit_box" v-show="editIndex == 1">
          <inline-tools
            :selectType="selectValue"
            :selectList="selectList"
            :activeIndex="editIndex"
          ></inline-tools>
        </div>
      </Header>
      <!-- 画布区域 -->
      <Content style="display: flex; height: calc(100vh - 200px)">
        <!-- <div v-if="show" style="width: 380px; height: 100%; background: #fff; display: flex">
          <Menu :active-name="menuActive" accordion @on-select="(activeIndex) => (menuActive = activeIndex)" width="65px">
            <MenuItem :name="1" class="menu-item">
            <Icon type="md-book" size="24" />
            <div>模板</div>
            </MenuItem>
            <MenuItem :name="1" class="menu-item">
            <Icon type="md-images" size="24" />
            <div>元素</div>
            </MenuItem>
            <MenuItem :name="3" class="menu-item">
            <Icon type="md-reorder" size="24" />
            <div>布局</div>
            </MenuItem>
          </Menu>
          <div class="content">
            <div v-show="menuActive === 1" class="left-panel">
              <tools :selectType="selectValue" :selectList="selectList"></tools>
            </div>
            <div v-show="menuActive === 3" class="left-panel">
              <layer></layer>
            </div>
          </div>
                  </div> -->
        <div
          id="workspace"
          style="width: 100%; position: relative; background: #f1f1f1"
        >
          <div class="canvas-box">
            <div class="inside-shadow"></div>
            <canvas
              id="canvas"
              :class="ruler ? 'design-stage-grid' : ''"
            ></canvas>
            <!-- <mouseMenu></mouseMenu> -->
            <dragMode></dragMode>
            <zoom></zoom>
          </div>
        </div>
        <!-- 属性区域 380-->
        <!---干掉图层区域-->
        <div
          v-if="true"
          style="
            width: 530px;
            height: 100%;
            padding: 10px;
            overflow-y: auto;
            background: #fff;
          "
        >
          <div v-if="show">
            <!-- <set-size></set-size> -->
            <group :selectType="selectValue"></group>
          </div>
          <attributes-list></attributes-list>
        </div>
      </Content>
    </Layout>
  </div>
</template>
  
<script>
import { mapActions } from "pinia";
import useSelectStore from "@/store/selectAttributes.js";
// 导入元素
import importJSON from "@/components/importJSON.vue";
import EditorWorkspace from "@/core/EditorWorkspace";
import HelloWorld from "@/components/HelloWorld.vue";
import save from "@/components/save.vue";
import zoom from "@/components/zoom.vue";
import group from "@/components/group.vue";
import clone from "@/components/clone.vue";
import lock from "@/components/lock.vue";
import dele from "@/components/del.vue";
import inlineTools from "@/components/inlineTools.vue";
import dragMode from "@/components/dragMode.vue";
//左侧元素组件
import tools from "@/components/tools.vue";
import setSize from "@/components/setSize.vue";
//核心功能组件
import Editor from "@/core";
import CanvasEventEmitter from "@/utils/event/notifier";
// 右侧组件
import history from "@/components/history.vue";
import attributesList from "@/components/attributesList";

import mouseMenu from "@/components/contextMenu/index.vue";
import { fabric } from "fabric";
const event = new CanvasEventEmitter();
import actions from "@/shared/action";
const canvas = {};
export default {
  name: "App",
  provide() {
    return {
      canvas,
      fabric,
      event,
      selectList: this.selectList,
    };
  },
  // provide: {
  //   canvas,
  //   fabric,
  //   event,
  //   selectList: this.getFontJson
  // },
  components: {
    HelloWorld,
    tools,
    setSize,
    history,
    attributesList,
    save,
    importJSON,
    zoom,
    group,
    lock,
    clone,
    dele,
    mouseMenu,
    inlineTools,
    dragMode,
  },
  data() {
    return {
      menuActive: 1,
      show: false,
      select: null,
      ruler: false,
      editIndex: 0, //操作面板游标
      selectIndex: 0, //属性选择游标
      selectValue: 0,
      selectText: "",
      selectList: [
        {
          label: "厂房",
          value: 0,
        },
        {
          label: "配电箱",
          value: 1,
        },
        {
          label: "厂区道路",
          value: 2,
        },
        {
          label: "爬梯",
          value: 3,
        },
        {
          label: "易燃易爆设备",
          value: 4,
        },
        {
          label: "高压箱变",
          value: 5,
        },
        {
          label: "高压箱变",
          value: 6,
        },
        {
          label: "开关站",
          value: 7,
        },
        {
          label: "污染源",
          value: 8,
        },
        {
          label: "电缆路径",
          value: 9,
        },
        {
          label: "高大建筑物",
          value: 10,
        },
        {
          label: "水源点",
          value: 11,
        },
      ],
    };
  },
  watch: {
    ruler: {
      handler(value) {
        if (!this.canvas.ruler) return;
        if (value) {
          this.canvas.ruler.enable();
        } else {
          this.canvas.ruler.disable();
        }
      },
    },
  },
  mounted() {
    actions.onGlobalStateChange((state) => {
      const { token } = state;
      // 未登录 - 返回主页
      if (!token) {
        this.$message.error("未检测到登录信息！");
        return this.$router.push("/");
      }

      // 获取用户信息
      this.getUserInfo(token);
    }, true);

    //为选项类型填充数量
    this.selectList = this.selectList.map((item) => {
      item.number = 0;
      return item;
    });
    // this.canvas = new fabric.Canvas('canvas', {
    //   fireRightClick: true, // 启用右键，button的数字为3
    //   stopContextMenu: true, // 禁止默认右键菜单
    //   controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
    // });
    // this.$Spin.hide();

    //绑定画布
    this.canvas = new fabric.Canvas("canvas", {
      stopContextMenu: true,
      controlsAboveOverlay: true,
      fireRightClick: true,
      backgroundColor: "rgb(255,255,255)",
    });

    // console.log(canvas.c);
    // // 将矩形添加到画布中
    // canvas.c.add(rect)
    canvas.c = this.canvas;
    event.init(canvas.c);
    canvas.editor = new Editor(canvas.c);

    canvas.c.renderAll();

    this.show = true;
  },
  methods: {
    ...mapActions(useSelectStore, ["setSelect"]),
    //更改选择的业务属性
    handleChangeSelectValue(index, item) {
      this.selectIndex = index;
      this.selectValue = item.value;
      this.setSelect(item.value);
    },
    // 获取字体数据 新增字体样式使用
    getFontJson() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        const json = activeObject.toJSON([
          "id",
          "gradientAngle",
          "selectable",
          "hasControls",
        ]);
        console.log(json);
        const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(json, null, "\t")
        )}`;
        downFile(fileStr, "font.json");
        const dataUrl = activeObject.toDataURL();
        downFile(dataUrl, "font.png");
      }
    },
  },
};
</script>
<style lang="less" scoped></style>
  
  