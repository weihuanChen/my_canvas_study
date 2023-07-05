import { fabric } from 'fabric';
import CanvasRuler from './ruler';

function initRuler(canvas, options) {
    const ruler = new CanvasRuler({
        canvas,
        ...options,
    });

    // 辅助线移动到画板外删除
    let workspace = null;

    /**
     * 获取workspace
     */
    const getWorkspace = () => {
        workspace = canvas.getObjects().find((item) => item.id === 'workspace');
    };

    /**
     * 判断target是否在object矩形外
     * @param object
     * @param target
     * @returns
     */
    const isRectOut = (object, target) => {
        const { top, height, left, width } = object;

        if (top === undefined || height === undefined || left === undefined || width === undefined) {
            return false;
        }

        const targetRect = target.getBoundingRect(true, true);
        const {
            top: targetTop,
            height: targetHeight,
            left: targetLeft,
            width: targetWidth,
        } = targetRect;

        if (
            target.isHorizontal() &&
            (top > targetTop + 1 || top + height < targetTop + targetHeight - 1)
        ) {
            return true;
        } else if (
            !target.isHorizontal() &&
            (left > targetLeft + 1 || left + width < targetLeft + targetWidth - 1)
        ) {
            return true;
        }

        return false;
    };

    canvas.on('guideline:moving', (e) => {
        if (!workspace) {
            getWorkspace();
            return;
        }
        const { target } = e;
        if (isRectOut(workspace, target)) {
            target.moveCursor = 'not-allowed';
        }
    });

    canvas.on('guideline:mouseup', (e) => {
        if (!workspace) {
            getWorkspace();
            return;
        }
        const { target } = e;
        if (isRectOut(workspace, target)) {
            canvas.remove(target);
            canvas.setCursor(canvas.defaultCursor ?? '');
        }
    });
    return ruler;
}

export default initRuler;
