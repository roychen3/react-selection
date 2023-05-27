import { useState } from 'react';
import SelectionArea from './SelectionArea';
import './styles.css';

const idList = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
];

export default function App() {
  const [list, setList] = useState(() => {
    return idList.map((id) => {
      return {
        id,
        focus: false,
      };
    });
  });

  return (
    <div className="App">
      <div className="selection-container">
        <SelectionArea
          onChange={(selectedElements) => {
            console.log('onChange');
            const newSelectedId = selectedElements.map((selectedElement) =>
              selectedElement.getAttribute('data-id')
            );
            console.log('-- newSelectedId', newSelectedId);
            setList((prevList) => {
              return prevList.map((prevItem) => {
                return {
                  ...prevItem,
                  focus: newSelectedId.includes(prevItem.id),
                };
              });
            });
          }}
          // onClick={(selectedElements) => {
          //   console.log("onClick");
          //   const newSelectedId = selectedElements.map((selectedElement) =>
          //     selectedElement.getAttribute('data-id')
          //   );
          //   console.log("-- newSelectedId", newSelectedId);
          // }}
          // onItemClick={(selectedElement) => {
          //   console.log('onItemClick');
          //   const newSelectedId = selectedElement.getAttribute('data-id');
          //   console.log('-- newSelectedId', newSelectedId);
          // }}
          // onStart={(selectedElements) => {
          //   console.log("onStart");
          //   const newSelectedId = selectedElements.map((selectedElement) =>
          //     selectedElement.getAttribute('data-id')
          //   );
          //   console.log("-- newSelectedId", newSelectedId);
          // }}
          // onEnd={(selectedElements) => {
          //   console.log('onEnd');
          //   const newSelectedId = selectedElements.map((selectedElement) =>
          //     selectedElement.getAttribute('data-id')
          //   );
          //   console.log('-- newSelectedId', newSelectedId);
          // }}
        >
          <div className="inner-container">
            {list.map((item) => (
              <div
                key={item.id}
                className={`block${item.focus ? ' block--selected' : ''}`}
                data-id={item.id}
              >
                {item.id}
              </div>
            ))}
          </div>
        </SelectionArea>
      </div>
    </div>
  );
}
