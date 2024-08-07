import "./styles.css"

import React, { useRef, useEffect, useState } from 'react';

export default function SlideIn(props) {
  const ref = useRef(null);
  let [style, setStyle] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting){
            console.log("1")
            if (props.direction && props.direction == "left"){
              setStyle("animate-slide-in-left")
            }else{
              setStyle("animate-slide-in-right")
            }
        }else{
            setStyle("")
            console.log("2")
        }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref.current]);

  return (
    <div ref={ref} className= {style}>
      {props.children}
    </div>
  );
}

