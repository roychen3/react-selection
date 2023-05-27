import type {
  MousePosition,
  SelectionBoxColor,
  SelectionBoxPosition,
} from '../types';

export function toHexColor(color: number | string | [number, number, number]) {
  if (typeof color === 'number') {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
  if (Array.isArray(color)) {
    return (
      '#' +
      color[0].toString(16) +
      color[1].toString(16) +
      color[2].toString(16)
    );
  }
  return color;
}
export function toRGB(
  color: number | string | [number, number, number]
): [number, number, number] {
  if (typeof color === 'string') {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }
  if (typeof color === 'number') {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    return [r, g, b];
  }
  return color;
}
export function createSelectionBoxStyle(
  color: SelectionBoxColor,
  position: SelectionBoxPosition
) {
  const [colorR, colorG, colorB] = toRGB(color);
  const style = {
    position: 'fixed',
    left: `${position.left}px`,
    top: `${position.top}px`,
    width: `${position.width}px`,
    height: `${position.height}px`,
    border: `2px solid ${toHexColor(color)}`,
    background: `rgba(${colorR}, ${colorG}, ${colorB}, 0.3)`,
    'box-sizing': 'border-box',
  };
  return style;
}
export function objectToString(obj: { [key: string]: string }) {
  const resultList = Object.entries(obj).map(([key, value]) => {
    return `${key}: ${value}`;
  });
  return resultList.join('; ');
}
export function isElementCollision(
  coverElement: Element,
  targetElement: Element
) {
  const coverRect = coverElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  return (
    targetRect.top < coverRect.bottom &&
    targetRect.bottom > coverRect.top &&
    targetRect.left < coverRect.right &&
    targetRect.right > coverRect.left
  );
}
export function calculateSelectionBoxPosition(
  mouseDownPosition: MousePosition,
  mouseCurrentPosition: MousePosition,
  selectionAreaElement: HTMLDivElement
) {
  const selectionAreaRect =
    selectionAreaElement.getBoundingClientRect();
  const diffX = mouseCurrentPosition.x - mouseDownPosition.x;
  const diffY = mouseCurrentPosition.y - mouseDownPosition.y;
  const newWidth = Math.abs(diffX);
  const newHeight = Math.abs(diffY);
  const maxWidth = selectionAreaRect.right - mouseDownPosition.x;
  const maxHeight = selectionAreaRect.bottom - mouseDownPosition.y;
  const isAtRightInStartPosition = diffX > 0;
  const isAtBottomInStartPosition = diffY > 0;
  const fixLeftLength = 2;
  const newLeft = isAtRightInStartPosition
    ? mouseDownPosition.x
    : mouseDownPosition.x - newWidth + fixLeftLength;
  const newTop = isAtBottomInStartPosition
    ? mouseDownPosition.y
    : mouseDownPosition.y - newHeight;
  const isOverLeftBoundary = selectionAreaRect.left > newLeft;
  const isOverTopBoundary = selectionAreaRect.top > newTop;
  const isOverRightBoundary =
    isAtRightInStartPosition &&
    mouseDownPosition.x + newWidth > selectionAreaRect.right;
  const isOverBottomBoundary =
    isAtBottomInStartPosition &&
    mouseDownPosition.y + newHeight > selectionAreaRect.bottom;
  const overLeftBoundaryWidth =
    mouseDownPosition.x - selectionAreaRect.left;
  const overTopBoundaryHeight =
    mouseDownPosition.y - selectionAreaRect.top;
  const checkOverLeftBoundaryWidth = isOverLeftBoundary
    ? overLeftBoundaryWidth
    : newWidth;
  const checkOverTopBoundaryHeight = isOverTopBoundary
    ? overTopBoundaryHeight
    : newHeight;

  const selectionBoxNodePosition = {
    left: isOverLeftBoundary ? selectionAreaRect.left : newLeft,
    top: isOverTopBoundary ? selectionAreaRect.top : newTop,
    width: isOverRightBoundary ? maxWidth : checkOverLeftBoundaryWidth,
    height: isOverBottomBoundary ? maxHeight : checkOverTopBoundaryHeight,
  };
  return selectionBoxNodePosition;
}
export function isIOS() {
  return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
}
export function isEqualElements(
  valueElements: Element[],
  otherElements: Element[]
): boolean {
  if (valueElements.length !== otherElements.length) return false;

  let result = true;
  for (let index = 0; index < valueElements.length; index++) {
    if (otherElements[index] !== valueElements[index]) {
      result = false;
      break;
    }
  }
  return result;
}
