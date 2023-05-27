import React, { useState, useEffect, useRef, useCallback } from 'react';
import { union } from 'lodash';

import {
  createSelectionBoxStyle,
  isElementCollision,
  calculateSelectionBoxPosition,
  isIOS,
  objectToString,
  isEqualElements,
} from './utils';

import type { SelectionAreaProps, MousePosition } from './types';

const defaultColor = 0x1677ff;
const defaultMouseDownPosition = { x: 0, y: 0 };
const defaultGetElement = '[data-id]';
const defaultMultipleKeys = {
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
};

const SelectionArea = ({
  children,
  disabled,
  color = defaultColor,
  onChange,
  onStart,
  onEnd,
  onClick,
  onItemClick,
  getElement = defaultGetElement,
}: SelectionAreaProps) => {
  const mouseDownPositionRef = useRef<MousePosition>(defaultMouseDownPosition);
  const ignoreItemClickRef = useRef(false);
  const mouseDownMultipleKeysRef = useRef(defaultMultipleKeys);
  const currentActiveElementRef = useRef<Element[]>([]);
  const shiftSelectedElementsRef = useRef<Element[]>([]);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const [selectionBoxOpen, setSelectionBoxOpen] = useState(false);
  const selectionAreaRef = useRef<HTMLDivElement>(null);
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);

  const getItemElements = useCallback(() => {
    if (!selectionAreaRef.current) return [];
    if (typeof getElement === 'function') {
      return getElement();
    }
    if (typeof getElement === 'string') {
      const result = selectionAreaRef.current.querySelectorAll(getElement);
      return Array.from(result);
    }
    return [];
  }, [getElement]);
  const updateSelectedElements = useCallback(
    (newSelectedElements: Element[]) => {
      if (!isEqualElements(newSelectedElements, selectedElements)) {
        setSelectedElements(newSelectedElements);
        onChange?.(newSelectedElements);
      }
    },
    [selectedElements, onChange]
  );

  useEffect(() => {
    const drawSelectionBox = (mouseCurrentPosition: MousePosition) => {
      if (!selectionBoxRef.current || !selectionAreaRef.current) return;

      const newSelectionBoxPosition = calculateSelectionBoxPosition(
        mouseDownPositionRef.current,
        mouseCurrentPosition,
        selectionAreaRef.current
      );
      const style = createSelectionBoxStyle(color, newSelectionBoxPosition);
      const cssText = objectToString(style);
      selectionBoxRef.current.style.cssText = cssText;
    };
    const getSelectedElements = (): Element[] => {
      if (!selectionBoxRef.current) return [];

      const selectionBox = selectionBoxRef.current;
      const itemElements = getItemElements();
      const resultElements = itemElements.filter((targetElement) => {
        return isElementCollision(selectionBox, targetElement);
      });
      return resultElements;
    };
    const onSelectionAreaMouseUp = (event: MouseEvent) => {
      if (selectionBoxOpen) {
        event.preventDefault();
        setSelectionBoxOpen(false);
        onEnd?.(selectedElements, event);
        mouseDownPositionRef.current = defaultMouseDownPosition;
        mouseDownMultipleKeysRef.current = defaultMultipleKeys;
      }
    };
    const formatSelectionBoxSelectedElements = (
      addSelectedElements: Element[]
    ): Element[] => {
      const multipleMode = isIOS()
        ? mouseDownMultipleKeysRef.current.metaKey
        : mouseDownMultipleKeysRef.current.ctrlKey;
      if (multipleMode) {
        return union(selectedElements, addSelectedElements);
      } else {
        return addSelectedElements;
      }
    };
    const debounceMouseMove = (
      mouseCurrentPosition: MousePosition,
      debounceDistance = 5
    ): boolean => {
      const xDiff = Math.abs(
        mouseDownPositionRef.current.x - mouseCurrentPosition.x
      );
      const yDiff = Math.abs(
        mouseDownPositionRef.current.y - mouseCurrentPosition.y
      );
      return xDiff > debounceDistance || yDiff > debounceDistance;
    };
    const onSelectionAreaMouseMove = (event: MouseEvent) => {
      if (selectionBoxOpen) {
        const mouseCurrentPosition = {
          x: event.clientX,
          y: event.clientY,
        };
        const canMove =
          ignoreItemClickRef.current || debounceMouseMove(mouseCurrentPosition);
        if (canMove) {
          event.preventDefault();
          drawSelectionBox(mouseCurrentPosition);
          const addSelectedElements = getSelectedElements();
          const newSelectedElements =
            formatSelectionBoxSelectedElements(addSelectedElements);
          updateSelectedElements(newSelectedElements);
          ignoreItemClickRef.current = true;
        }
      }
    };

    if (!disabled) {
      document.addEventListener('mousemove', onSelectionAreaMouseMove);
      document.addEventListener('mouseup', onSelectionAreaMouseUp);
    }

    return () => {
      if (!disabled) {
        document.removeEventListener('mousemove', onSelectionAreaMouseMove);
        document.removeEventListener('mouseup', onSelectionAreaMouseUp);
      }
    };
  }, [
    color,
    getItemElements,
    selectionBoxOpen,
    selectedElements,
    onEnd,
    updateSelectedElements,
  ]);

  const onSelectionAreaMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setSelectionBoxOpen(true);
    onStart?.(selectedElements, event.nativeEvent);
    mouseDownPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    mouseDownMultipleKeysRef.current = {
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
    };
    ignoreItemClickRef.current = false;
  };
  const getSelectedElementByPointer = (
    position: MousePosition
  ): Element | undefined => {
    const itemElements = getItemElements();
    const selectedElement = itemElements.find((targetElement) => {
      const targetElementRect = targetElement.getBoundingClientRect();
      const insideTargetElement =
        position.x > targetElementRect.left &&
        position.x < targetElementRect.right &&
        position.y > targetElementRect.top &&
        position.y < targetElementRect.bottom;
      if (insideTargetElement) {
        return true;
      }
      return false;
    });
    return selectedElement;
  };
  const formatShiftItemClick = (addSelectedElement: Element): Element[] => {
    if (currentActiveElementRef.current.length === 0) {
      currentActiveElementRef.current = [addSelectedElement];
    }
    const activeElement = currentActiveElementRef.current[0];
    const itemElements = getItemElements();
    let focusMode = false;
    const newShiftSelectedElements = itemElements.filter((itemElement) => {
      const triggerSameElement =
        addSelectedElement === activeElement &&
        addSelectedElement === itemElement;
      if (triggerSameElement) {
        return true;
      }
      const inRangeStartOrEnd =
        addSelectedElement === itemElement || activeElement === itemElement;
      if (inRangeStartOrEnd) {
        focusMode = !focusMode;
        return true;
      }
      return focusMode;
    });
    const oldShiftSelectedElements = shiftSelectedElementsRef.current;
    const newSelectedElements = selectedElements.filter((selectedElement) => {
      const inNewShiftList = newShiftSelectedElements.includes(selectedElement);
      const inOldShiftList = oldShiftSelectedElements.includes(selectedElement);
      return !(inNewShiftList || inOldShiftList);
    });
    shiftSelectedElementsRef.current = newShiftSelectedElements;
    const resultElements = [
      ...newSelectedElements,
      ...newShiftSelectedElements,
    ];
    return resultElements;
  };
  const formatCtrlItemClick = (addSelectedElement: Element): Element[] => {
    const selected = selectedElements.includes(addSelectedElement);
    const newSelectedElements = selected
      ? selectedElements.filter((element) => addSelectedElement !== element)
      : [...selectedElements, addSelectedElement];
    return newSelectedElements;
  };
  const formatItemClickSelectedElements = (
    addSelectedElements: Element,
    event: React.MouseEvent
  ): Element[] => {
    const shiftMode = event.shiftKey;
    const multipleMode = isIOS() ? event.metaKey : event.ctrlKey;
    if (shiftMode) {
      return formatShiftItemClick(addSelectedElements);
    } else if (multipleMode) {
      shiftSelectedElementsRef.current = [];
      return formatCtrlItemClick(addSelectedElements);
    } else {
      shiftSelectedElementsRef.current = [];
      return [addSelectedElements];
    }
  };
  const onSelectionAreaClick = (event: React.MouseEvent) => {
    let newSelectedElements: Element[] = selectedElements;
    if (!ignoreItemClickRef.current) {
      const mouseCurrentPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      const addSelectedElement =
        getSelectedElementByPointer(mouseCurrentPosition);
      if (addSelectedElement) {
        newSelectedElements = formatItemClickSelectedElements(
          addSelectedElement,
          event
        );
        updateSelectedElements(newSelectedElements);
        onItemClick?.(addSelectedElement, event.nativeEvent);
        if (!event.shiftKey) {
          currentActiveElementRef.current = [addSelectedElement];
        }
      } else if (!(event.ctrlKey || event.metaKey || event.shiftKey)) {
        newSelectedElements = [];
        updateSelectedElements(newSelectedElements);
      }
    }
    onClick?.(newSelectedElements, event.nativeEvent);
    ignoreItemClickRef.current = false;
  };

  return (
    <>
      <div
        ref={selectionAreaRef}
        onMouseDown={disabled ? undefined : onSelectionAreaMouseDown}
        onClick={disabled ? undefined : onSelectionAreaClick}
      >
        {children}
      </div>
      {selectionBoxOpen ? (
        <div aria-haspopup ref={selectionBoxRef}></div>
      ) : null}
    </>
  );
};

export default SelectionArea;