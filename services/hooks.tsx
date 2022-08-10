import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { Imgix, Size } from '@/model/hooksModel';

export const useToggle = (initialState: boolean = false): [boolean, any] => {
  // Initialize the state
  const [state, setState] = useState<boolean>(initialState);
  // Define and memorize toggler function in case we pass down the comopnent,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback((): void => setState((state) => !state), []);
  return [state, toggle];
};

// export function useMemoCompare(next, compare) {
//   // Ref for storing previous value
//   const previousRef = useRef();
//   const previous = previousRef.current;
//   // Pass previous and next value to compare function
//   // to determine whether to consider them equal.
//   const isEqual = compare(previous, next);
//   // If not equal update previousRef to next value.
//   // We only update if not equal so that this hook continues to return
//   // the same old value if compare keeps returning true.
//   useEffect(() => {
//     if (!isEqual) {
//       previousRef.current = next;
//     }
//   });
//   // Finally, if equal then return the previous value
//   return isEqual ? previous : next;
// }

// export function useImgix(data:Imgix): Imgix {

//   const [imgixUrl, setImgixUrl] = useState([]);
//   useEffect(() => {
//  const {url, param} = data;
//  let pixelRatioBox = document.querySelector(".pixel-ratio");

// const updatePixelRatio = () => {
//   let pr = window.devicePixelRatio;

//   return
// }
//   }, [data]);

//   return imgixUrl;
// }// Empty array ensures that effect is only run on mount
