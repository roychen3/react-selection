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
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '80',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
  '100',
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
                <span className="block__text">{item.id}</span>
              </div>
            ))}
          </div>
        </SelectionArea>
      </div>
    </div>
  );
}
