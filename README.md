# React Selection

Mock Desktop OS mouse selection

## Getting Started

```bash
npm run start
```

## Installation

node v16.15.0

```bash
npm install
```

## Usage

```javascript
import SelectionArea from './SelectionArea';

function Component() {
  return (
    <SelectionArea
      children     // ReactNode
      disabled     // boolean | undefined
      onChange     // (selectedElements: Element[]) => void | undefined
      onStart      // (selectedElements: Element[], event: React.MouseEvent) => void | undefined
      onEnd        // (selectedElements: Element[], event: MouseEvent) => void | undefined
      onClick      // (selectedElements: Element[], event: React.MouseEvent) => void | undefined
      onItemClick  // (selectedElement: Element, event: React.MouseEvent) => void | undefined
      getElement   // (() => Element[]) | string | undefined
    >
      {list.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
        >
          {item.id}
        </div>
      ))}
    </SelectionArea>;
  );
}
```

## License

[LICENSE](LICENSE)
