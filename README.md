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
    <SelectionArea>
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
