/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/*
 * @Author: 秦少卫
 * @Date: 2023-02-03 21:50:10
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-04-18 22:24:22
 * @Description: 工作区初始化
 */

import { fabric } from 'fabric';
import { throttle } from 'lodash-es';

// declare type EditorWorkspaceOption = { width: number; height: number };
// declare type ExtCanvas = fabric.Canvas & {
//   isDragging: boolean;
//   lastPosX: number;
//   lastPosY: number;
// };

class EditorWorkspace {
  //   canvas: fabric.Canvas;
  //   workspaceEl: HTMLElement;
  //   workspace: fabric.Rect | null;
  //   option: EditorWorkspaceOption;
  //   // width: number;
  //   // height: number;
  //   dragMode: boolean;
  constructor(canvas, option) {
    this.canvas = canvas;
    const workspaceEl = document.querySelector('#workspace');
    if (!workspaceEl) {
      throw new Error('element #workspace is missing, plz check!');
    }
    this.workspaceEl = workspaceEl;
    this.workspace = null;
    this.option = option;
    this.dragMode = false;
    this._initBackground();
    this._initWorkspace();
    this._initResizeObserve();
    this._initDring();
  }

  // 初始化背景
  _initBackground() {
    this.canvas.setBackgroundColor('#F1F1F1', this.canvas.renderAll.bind(this.canvas));
    this.canvas.backgroundImage = '';
    this.canvas.setWidth(this.workspaceEl.offsetWidth);
    this.canvas.setHeight(this.workspaceEl.offsetHeight);
    // 上一次画布大小，没搜到引用，注释ing
    // this.width = this.workspaceEl.offsetWidth;
    // this.height = this.workspaceEl.offsetHeight;
  }

  // 初始化画布
  _initWorkspace() {
    const { width, height } = this.option;
    const canvasObj = this.canvas
    const _this = this;
    // const workspace = new fabric.Rect({
    //   fill: '#ffffff',
    //   width,
    //   height,
    //   id: 'workspace',
    // });
    // workspace.set('selectable', false);
    // workspace.set('hasControls', false);
    // workspace.hoverCursor = 'selection';
    // this.canvas.add(workspace);
    // this.canvas.renderAll();
    let workspace = null
    // 创建一个新的 Image 对象
    var img = new Image();
    img.src = 'src/assets/filters/kotei_9628.png';

    // 等待图像加载完成
    img.onload = function () {
      // 创建一个新的 Pattern 对象
      var pattern = new fabric.Pattern({
        source: img,
        repeat: 'repeat',
        offset: new fabric.Point(0, 0)
      });

      // 创建一个新的 Rect 对象，并将其 fill 属性设置为 pattern
      workspace = new fabric.Rect({
        width,
        height,
        fill: pattern
      });

      workspace.set('selectable', false);
      workspace.set('hasControls', false);
      workspace.hoverCursor = 'selection';
      canvasObj.add(workspace);
      canvasObj.renderAll();

      _this.workspace = workspace;
      _this.auto();
    };
  }

  /**
   * 设置画布中心到指定对象中心点上
   * @param {Object} obj 指定的对象
   */
  setCenterFromObject(obj) {
    const { canvas } = this;
    const objCenter = obj.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;
    if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return;
    viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0];
    viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3];
    canvas.setViewportTransform(viewportTransform);
    canvas.renderAll();
  }

  // 初始化监听器
  _initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        this.auto();
      }, 50)
    );
    resizeObserver.observe(this.workspaceEl);
  }

  setSize(width, height) {
    this._initBackground();
    this.option.width = width;
    this.option.height = height;
    // 重新设置workspace
    this.workspace = this.canvas
      .getObjects()
      .find((item) => item.id === 'workspace');
    this.workspace.set('width', width);
    this.workspace.set('height', height);
    this.auto();
  }

  setZoomAuto(scale, cb) {
    const { workspaceEl } = this;
    const width = workspaceEl.offsetWidth;
    const height = workspaceEl.offsetHeight;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform(fabric.iMatrix.concat());
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale);
    if (!this.workspace) return;
    this.setCenterFromObject(this.workspace);

    // 超出画布不展示
    this.workspace.clone((cloned) => {
      this.canvas.clipPath = cloned;
      this.canvas.requestRenderAll();
    });
    if (cb) cb(this.workspace.left, this.workspace.top);
  }

  _getScale() {
    const viewPortWidth = this.workspaceEl.offsetWidth;
    const viewPortHeight = this.workspaceEl.offsetHeight;
    // 按照宽度
    if (viewPortWidth / viewPortHeight < this.option.width / this.option.height) {
      return viewPortWidth / this.option.width;
    } // 按照宽度缩放
    return viewPortHeight / this.option.height;
  }

  // 放大
  big() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  }

  // 缩小
  small() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio < 0 ? 0.01 : zoomRatio);
  }

  // 自动缩放
  auto() {
    const scale = this._getScale();
    this.setZoomAuto(scale - 0.08);
  }

  // 1:1 放大
  one() {
    this.setZoomAuto(0.8 - 0.08);
    this.canvas.requestRenderAll();
  }

  // 开始拖拽
  startDring() {
    this.dragMode = true;
    this.canvas.defaultCursor = 'grab';
  }
  endDring() {
    this.dragMode = false;
    this.canvas.defaultCursor = 'default';
  }

  // 拖拽模式
  _initDring() {
    const This = this;
    this.canvas.on('mouse:down', function (ExtCanvas, opt) {
      console.log(ExtCanvas);
      const evt = opt.e;
      if (evt.altKey || This.dragMode) {
        This.canvas.defaultCursor = 'grabbing';
        This.canvas.discardActiveObject();
        This._setDring();
        ExtCanvas.selection = false;
        ExtCanvas.isDragging = true;
        ExtCanvas.lastPosX = evt.clientX;
        ExtCanvas.lastPosY = evt.clientY;
        ExtCanvas.requestRenderAll();
      }
    });

    this.canvas.on('mouse:move', function (ExtCanvas, opt) {
      console.log(ExtCanvas);
      if (ExtCanvas.isDragging) {
        This.canvas.discardActiveObject();
        This.canvas.defaultCursor = 'grabbing';
        const { e } = opt;
        if (!ExtCanvas.viewportTransform) return;
        const vpt = ExtCanvas.viewportTransform;
        vpt[4] += e.clientX - ExtCanvas.lastPosX;
        vpt[5] += e.clientY - ExtCanvas.lastPosY;
        ExtCanvas.lastPosX = e.clientX;
        ExtCanvas.lastPosY = e.clientY;
        ExtCanvas.requestRenderAll();
      }
    });

    this.canvas.on('mouse:up', function (ExtCanvas) {
      if (!ExtCanvas.viewportTransform) return;
      ExtCanvas.setViewportTransform(ExtCanvas.viewportTransform);
      ExtCanvas.isDragging = false;
      ExtCanvas.selection = true;
      ExtCanvas.getObjects().forEach((obj) => {
        if (obj.id !== 'workspace' && obj.hasControls) {
          obj.selectable = true;
        }
      });
      ExtCanvas.requestRenderAll();
      This.canvas.defaultCursor = 'default';
    });

    this.canvas.on('mouse:wheel', function (opt) {
      console.log(opt);
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = this.canvas.getCenter();
      this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  _setDring() {
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'grab';
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
    });
    this.canvas.renderAll();
    this.canvas.requestRenderAll();
  }
}

export default EditorWorkspace;
