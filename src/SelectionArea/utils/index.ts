import type { MousePosition, SelectionBoxPosition } from '../types';

export function createSelectionBoxStyle(position: SelectionBoxPosition) {
  const style = {
    position: 'fixed',
    left: `${position.left}px`,
    top: `${position.top}px`,
    width: `${position.width}px`,
    height: `${position.height}px`,
    border: `2px solid #1677ff`,
    'background-color': `rgba(22, 119, 255, 0.3)`,
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
  const selectionAreaRect = selectionAreaElement.getBoundingClientRect();
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
  const overLeftBoundaryWidth = mouseDownPosition.x - selectionAreaRect.left;
  const overTopBoundaryHeight = mouseDownPosition.y - selectionAreaRect.top;
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
