import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SelectionArea from '../index';
import { useRef } from 'react';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};
type Position = {
  clientX: number;
  clientY: number;
};
type MoveDistance = {
  x: number;
  y: number;
};
const ITEM_TEST_ID = 'select__item';
const defaultSelectionBoxRect: Rect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
const setRect = (element: HTMLElement, rect: Rect) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: jest.fn(() => rect),
    writable: true,
  });
};
const defineAllItemElementRect = (itemTestId: string) => {
  const itemElements = screen.getAllByTestId(itemTestId);
  itemElements.forEach((itemElement, index) => {
    const margin = 10;
    const size = 100;
    if (index === 0) {
      setRect(itemElement, {
        x: margin,
        y: margin,
        width: size,
        height: size,
        top: margin,
        right: margin + size,
        bottom: margin + size,
        left: margin,
      });
    } else {
      const prevRect = itemElements[index - 1].getBoundingClientRect();
      setRect(itemElement, {
        x: margin,
        y: prevRect.bottom + margin,
        width: size,
        height: size,
        top: prevRect.bottom + margin,
        right: margin + size,
        bottom: prevRect.bottom + margin + size,
        left: margin,
      });
    }
  });
};
const initRect = () => {
  defineAllItemElementRect(ITEM_TEST_ID);
  const selectionAreaElement = screen.getByTestId('selection-area');
  setRect(selectionAreaElement, {
    x: 0,
    y: 0,
    width: 110,
    height: 1110,
    top: 0,
    right: 110,
    bottom: 1110,
    left: 0,
  });
};
const getSelectedIds = (elements: HTMLElement[]) => {
  return elements.map((element) => element.getAttribute('data-id')).join(', ');
};
const getMoveInfo = (
  startPosition: Position,
  move: MoveDistance
): [Rect, Position] => {
  const newSelectionBoxRect: Rect = {
    x: startPosition.clientX,
    y: startPosition.clientY,
    width: move.x,
    height: move.y,
    top: startPosition.clientY,
    right: startPosition.clientX + move.x,
    bottom: startPosition.clientY + move.y,
    left: startPosition.clientX,
  };
  const newMousePosition: Position = {
    clientX: startPosition.clientX + move.x,
    clientY: startPosition.clientY + move.y,
  };
  return [newSelectionBoxRect, newMousePosition];
};

describe('Component: SelectionArea', () => {
  test('using selection box select item', async () => {
    const onChange = jest.fn();
    render(
      <SelectionArea onChange={onChange}>
        {[...Array(10).keys()].map((key) => (
          <div key={key} data-id={key} data-testid={ITEM_TEST_ID}>
            {key}
          </div>
        ))}
      </SelectionArea>
    );
    initRect();
    const selectionAreaElement = screen.getByTestId('selection-area');

    // select
    {
      const startPosition = {
        clientX: 0,
        clientY: 0,
      };
      fireEvent.mouseDown(selectionAreaElement, startPosition);
      const selectionBoxElement = screen.getByTestId('selection-box');
      setRect(selectionBoxElement, defaultSelectionBoxRect);

      const [selectionBoxMoveRect_1, movePosition_1] = getMoveInfo(
        startPosition,
        { x: 11, y: 11 }
      );
      setRect(selectionBoxElement, selectionBoxMoveRect_1);
      fireEvent.mouseMove(selectionAreaElement, movePosition_1);
      expect(getSelectedIds(onChange.mock.calls[0][0])).toBe('0');

      const [selectionBoxMoveRect_2, movePosition_2] = getMoveInfo(
        startPosition,
        { x: 11, y: 121 }
      );
      setRect(selectionBoxElement, selectionBoxMoveRect_2);
      fireEvent.mouseMove(selectionAreaElement, movePosition_2);
      expect(getSelectedIds(onChange.mock.calls[1][0])).toBe('0, 1');

      setRect(selectionBoxElement, defaultSelectionBoxRect);
      fireEvent.mouseUp(selectionAreaElement, movePosition_2);
      expect(onChange).toHaveBeenCalledTimes(2);
    }

    // multiple select
    {
      const multipleStartPosition = {
        clientX: 0,
        clientY: 340,
      };
      fireEvent.mouseDown(selectionAreaElement, {
        clientX: multipleStartPosition.clientX,
        clientY: multipleStartPosition.clientY,
        ctrlKey: true,
        metaKey: true,
      });
      const multipleSelectionBoxElement = screen.getByTestId('selection-box');
      setRect(multipleSelectionBoxElement, defaultSelectionBoxRect);

      const [multipleSelectionBoxMoveRect_1, multipleMovePosition_1] =
        getMoveInfo(multipleStartPosition, { x: 11, y: 11 });
      setRect(multipleSelectionBoxElement, multipleSelectionBoxMoveRect_1);
      fireEvent.mouseMove(selectionAreaElement, {
        ...multipleMovePosition_1,
        ctrlKey: true,
        metaKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[2][0])).toBe('0, 1, 3');

      const [multipleSelectionBoxMoveRect_2, multipleMovePosition_2] =
        getMoveInfo(multipleStartPosition, { x: 11, y: 151 });
      setRect(multipleSelectionBoxElement, multipleSelectionBoxMoveRect_2);
      fireEvent.mouseMove(selectionAreaElement, {
        ...multipleMovePosition_2,
        ctrlKey: true,
        metaKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[3][0])).toBe('0, 1, 3, 4');

      setRect(multipleSelectionBoxElement, defaultSelectionBoxRect);
      fireEvent.mouseUp(selectionAreaElement, multipleMovePosition_2);
      expect(onChange).toHaveBeenCalledTimes(4);
    }

    // multiple select nothing
    {
      const nothingMultipleStartPosition = {
        clientX: 0,
        clientY: 0,
      };
      fireEvent.mouseDown(selectionAreaElement, {
        clientX: nothingMultipleStartPosition.clientX,
        clientY: nothingMultipleStartPosition.clientY,
        ctrlKey: true,
        metaKey: true,
      });
      const nothingMultipleSelectionBoxElement =
        screen.getByTestId('selection-box');
      setRect(nothingMultipleSelectionBoxElement, defaultSelectionBoxRect);

      const [
        nothingMultipleSelectionBoxMoveRect_1,
        nothingMultipleMovePosition_1,
      ] = getMoveInfo(nothingMultipleStartPosition, { x: 9, y: 100 });
      setRect(
        nothingMultipleSelectionBoxElement,
        nothingMultipleSelectionBoxMoveRect_1
      );
      fireEvent.mouseMove(selectionAreaElement, {
        ...nothingMultipleMovePosition_1,
        ctrlKey: true,
        metaKey: true,
      });
      expect(onChange).toHaveBeenCalledTimes(4);

      setRect(nothingMultipleSelectionBoxElement, defaultSelectionBoxRect);
      fireEvent.mouseUp(selectionAreaElement, nothingMultipleMovePosition_1);
      expect(onChange).toHaveBeenCalledTimes(4);
    }

    // re select
    {
      const reStartPosition = {
        clientX: 0,
        clientY: 560,
      };
      fireEvent.mouseDown(selectionAreaElement, reStartPosition);
      const reSelectionBoxElement = screen.getByTestId('selection-box');
      setRect(reSelectionBoxElement, defaultSelectionBoxRect);

      const [reSelectionBoxMoveRect_1, reMovePosition_1] = getMoveInfo(
        reStartPosition,
        { x: 11, y: 230 }
      );
      setRect(reSelectionBoxElement, reSelectionBoxMoveRect_1);
      fireEvent.mouseMove(selectionAreaElement, reMovePosition_1);
      expect(getSelectedIds(onChange.mock.calls[4][0])).toBe('5, 6, 7');

      setRect(reSelectionBoxElement, defaultSelectionBoxRect);
      fireEvent.mouseUp(selectionAreaElement, reMovePosition_1);
      expect(onChange).toHaveBeenCalledTimes(5);
    }

    // select nothing
    {
      const nothingStartPosition = {
        clientX: 0,
        clientY: 0,
      };
      fireEvent.mouseDown(selectionAreaElement, nothingStartPosition);
      const nothingSelectionBoxElement = screen.getByTestId('selection-box');
      setRect(nothingSelectionBoxElement, defaultSelectionBoxRect);

      const [nothingSelectionBoxMoveRect_1, nothingMovePosition_1] =
        getMoveInfo(nothingStartPosition, { x: 9, y: 100 });
      setRect(nothingSelectionBoxElement, nothingSelectionBoxMoveRect_1);
      fireEvent.mouseMove(selectionAreaElement, nothingMovePosition_1);
      expect(getSelectedIds(onChange.mock.calls[5][0])).toBe('');

      setRect(nothingSelectionBoxElement, defaultSelectionBoxRect);
      fireEvent.mouseUp(selectionAreaElement, nothingMovePosition_1);
      expect(onChange).toHaveBeenCalledTimes(6);
    }
  });

  test('using click select item', async () => {
    const onItemClick = jest.fn();
    const onChange = jest.fn();
    render(
      <SelectionArea onItemClick={onItemClick} onChange={onChange}>
        {[...Array(10).keys()].map((key) => (
          <div key={key} data-id={key} data-testid={ITEM_TEST_ID}>
            {key}
          </div>
        ))}
      </SelectionArea>
    );
    initRect();
    const selectionAreaElement = screen.getByTestId('selection-area');

    // single click item
    {
      fireEvent.click(selectionAreaElement, { clientX: 11, clientY: 11 });
      expect(getSelectedIds(onChange.mock.calls[0][0])).toBe('0');
      expect(onItemClick.mock.calls[0][0].getAttribute('data-id')).toBe('0');

      fireEvent.click(selectionAreaElement, { clientX: 11, clientY: 121 });
      expect(getSelectedIds(onChange.mock.calls[1][0])).toBe('1');
      expect(onItemClick.mock.calls[1][0].getAttribute('data-id')).toBe('1');
    }

    // multiple single click
    {
      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 231,
        ctrlKey: true,
        metaKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[2][0])).toBe('1, 2');
      expect(onItemClick.mock.calls[2][0].getAttribute('data-id')).toBe('2');

      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 671,
        ctrlKey: true,
        metaKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[3][0])).toBe('1, 2, 6');
      expect(onItemClick.mock.calls[3][0].getAttribute('data-id')).toBe('6');
    }

    // multiple single click selected item
    {
      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 671,
        ctrlKey: true,
        metaKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[4][0])).toBe('1, 2');
      expect(onItemClick.mock.calls[4][0].getAttribute('data-id')).toBe('6');
    }

    // multiple continuously click
    {
      // click shift hook item
      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 671,
        shiftKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[5][0])).toBe('1, 2, 6');
      expect(onItemClick.mock.calls[5][0].getAttribute('data-id')).toBe('6');

      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 1090,
        shiftKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[6][0])).toBe(
        '1, 2, 6, 7, 8, 9'
      );
      expect(onItemClick.mock.calls[6][0].getAttribute('data-id')).toBe('9');

      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 11,
        shiftKey: true,
      });
      expect(getSelectedIds(onChange.mock.calls[7][0])).toBe(
        '0, 1, 2, 3, 4, 5, 6'
      );
      expect(onItemClick.mock.calls[7][0].getAttribute('data-id')).toBe('0');
    }

    // re select
    {
      fireEvent.click(selectionAreaElement, {
        clientX: 11,
        clientY: 451,
      });
      expect(getSelectedIds(onChange.mock.calls[8][0])).toBe('4');
      expect(onItemClick.mock.calls[8][0].getAttribute('data-id')).toBe('4');
    }

    // click nothing
    {
      fireEvent.click(selectionAreaElement, {
        clientX: 9,
        clientY: 9,
      });
      expect(getSelectedIds(onChange.mock.calls[9][0])).toBe('');
    }

    expect(onChange).toHaveBeenCalledTimes(10);
    expect(onItemClick).toHaveBeenCalledTimes(9);
  });

  test('using shift click in first time', async () => {
    const itemTestId = 'select__item';
    const onItemClick = jest.fn();
    const onChange = jest.fn();
    render(
      <SelectionArea onItemClick={onItemClick} onChange={onChange}>
        {[...Array(10).keys()].map((key) => (
          <div key={key} data-id={key} data-testid={itemTestId}>
            {key}
          </div>
        ))}
      </SelectionArea>
    );
    initRect();
    const selectionAreaElement = screen.getByTestId('selection-area');

    fireEvent.click(selectionAreaElement, {
      clientX: 11,
      clientY: 671,
      shiftKey: true,
    });
    expect(getSelectedIds(onChange.mock.calls[0][0])).toBe('6');
    expect(onItemClick.mock.calls[0][0].getAttribute('data-id')).toBe('6');

    fireEvent.click(selectionAreaElement, {
      clientX: 11,
      clientY: 1090,
      shiftKey: true,
    });
    expect(getSelectedIds(onChange.mock.calls[1][0])).toBe('6, 7, 8, 9');
    expect(onItemClick.mock.calls[1][0].getAttribute('data-id')).toBe('9');

    fireEvent.click(selectionAreaElement, {
      clientX: 11,
      clientY: 11,
      shiftKey: true,
    });
    expect(getSelectedIds(onChange.mock.calls[2][0])).toBe(
      '0, 1, 2, 3, 4, 5, 6'
    );
    expect(onItemClick.mock.calls[2][0].getAttribute('data-id')).toBe('0');
  });

  test('other selection id', async () => {
    const otherId = 'data-other-id';
    const onItemClick = jest.fn();
    const onChange = jest.fn();
    const TestComponent = () => {
      const divRef = useRef<HTMLDivElement>(null);
      const getElement = () => {
        if (divRef.current) {
          return [...divRef.current.querySelectorAll(`[${otherId}]`)];
        }
        return [];
      };

      return (
        <div ref={divRef}>
          <SelectionArea
            onItemClick={onItemClick}
            onChange={onChange}
            getElement={getElement}
          >
            {[...Array(10).keys()].map((key) => (
              <div key={key} data-other-id={key} data-testid={ITEM_TEST_ID}>
                {key}
              </div>
            ))}
          </SelectionArea>
        </div>
      );
    };
    render(<TestComponent />);
    initRect();
    const selectionAreaElement = screen.getByTestId('selection-area');

    fireEvent.click(selectionAreaElement, {
      clientX: 11,
      clientY: 671,
      shiftKey: true,
    });
    expect(
      onChange.mock.calls[0][0]
        .map((element: Element) => element.getAttribute(otherId))
        .join(', ')
    ).toBe('6');
    expect(onItemClick.mock.calls[0][0].getAttribute(otherId)).toBe('6');

    fireEvent.click(selectionAreaElement, {
      clientX: 11,
      clientY: 1090,
      shiftKey: true,
    });
    expect(
      onChange.mock.calls[1][0]
        .map((element: Element) => element.getAttribute(otherId))
        .join(', ')
    ).toBe('6, 7, 8, 9');
    expect(onItemClick.mock.calls[1][0].getAttribute(otherId)).toBe('9');
  });

  test('using selection box select item but mouse up in outside component', async () => {
    const itemTestId = 'select__item';
    const onChange = jest.fn();
    const onClick = jest.fn();

    render(
      <div data-testid="outside">
        <SelectionArea onClick={onClick} onChange={onChange}>
          {[...Array(10).keys()].map((key) => (
            <div key={key} data-id={key} data-testid={itemTestId}>
              {key}
            </div>
          ))}
        </SelectionArea>
      </div>
    );
    initRect();
    const selectionAreaElement = screen.getByTestId('selection-area');

    const startPosition = {
      clientX: 0,
      clientY: 0,
    };
    fireEvent.mouseDown(selectionAreaElement, startPosition);
    const selectionBoxElement = screen.getByTestId('selection-box');
    setRect(selectionBoxElement, defaultSelectionBoxRect);

    const [selectionBoxMoveRect, movePosition] = getMoveInfo(startPosition, {
      x: 200,
      y: 2000,
    });
    setRect(selectionBoxElement, selectionBoxMoveRect);
    fireEvent.mouseMove(selectionAreaElement, movePosition);
    expect(getSelectedIds(onChange.mock.calls[0][0])).toBe(
      '0, 1, 2, 3, 4, 5, 6, 7, 8, 9'
    );

    await userEvent.click(screen.getByTestId('outside'));
  });
});
