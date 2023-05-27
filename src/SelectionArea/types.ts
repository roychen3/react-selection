import { ReactNode } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export type SelectionBoxPosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export interface SelectionAreaProps {
  children: ReactNode;
  disabled?: boolean;
  onChange?: (selectedElements: Element[]) => void;
  onStart?: (selectedElements: Element[], event: MouseEvent) => void;
  onEnd?: (selectedElements: Element[], event: MouseEvent) => void;
  onClick?: (selectedElements: Element[], event: MouseEvent) => void;
  onItemClick?: (selectedElement: Element, event: MouseEvent) => void;
  getElement?: (() => Element[]) | string;
}
