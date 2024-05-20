import React, { useRef, useEffect, useState } from 'react'

// Reinforcement graphics
//step 1 - dia of a bar = 12 mm = 0.5 inch
//step 2 - area of 1 bar = 0.785 X 12 X 12 = 113.04 mm^2
// 0.785 x 0.5 x 0.5 = 0.19625 inch^2 area of 1 bar
//step 3 - number of bar req = As(taken through input)/area of 1 bar
//step 4 - Show the number of bars in graphics
export default function Canvas(props) {

    const DIA = 0.5;
    const container = useRef();
    const { as, width, height } = props;
    const bar_no = as / 0.19625 || 0;
    const [circledia, setDiameter] = useState(0);

    const display_bars = () => {
        let bars = []
        for (let i = 0; i < bar_no; i++) {
            bars.push(
                <div className="circle" style={{ width: circledia }}></div>
            )
        }
        return bars
    }

    useEffect(() => {
        const ele = container.current;
        const parent = ele.parentElement;
        const parent_asp_ratio = parent.clientWidth / parent.clientHeight;
        const asp_ratio = width / height;

        parent.style.width = `${parent.clientWidth}px`;
        parent.style.height = `${parent.clientHeight}px`;

        if (!asp_ratio) return
        let diameter;
        if (parent_asp_ratio > asp_ratio) {
            ele.style.height = `${parent.clientHeight}px`;
            ele.style.width = `${parent.clientHeight * asp_ratio}px`;
            diameter = (DIA * parent.clientHeight) / height;
        }
        
        else {
            ele.style.width = `${parent.clientWidth}px`;
            ele.style.height = `${parent.clientWidth / asp_ratio}px`;
            diameter = (DIA * parent.clientWidth) / width;
        }

        setDiameter(diameter)
    }, [width, height]);
    
    return (
        <div className="full-height flex align-center justify-center">
            <div className="container" ref={container}>
                <div className="overflow-container">
                    <div className="circle-container">{display_bars()}</div>
                </div>
            </div>
        </div>
    )
}
