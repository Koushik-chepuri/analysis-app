import './App.css';
import React, { useState } from 'react';
import Canvas from './canvas';
import { Input, useInput } from './Input/input';

function App() {
    const fc = useInput(0);
    const b = useInput(0);
    const d = useInput(0);
    const fy = useInput(0);
    const Es = useInput(0);
    const As = useInput(0);

    const message = useInput('');
    const dispRatio = useInput('');
    const dispMn = useInput('');
    const [isVisible, setIsVisible] = useState(false);
    const [showSteps, setShowSteps] = useState(false);
    const [stepsData, setStepsData] = useState([]);

    const Calculate = function () {
        const steps = [];

        // Step 1
        const p = (As.value * 100/ (b.value * d.value));
        steps.push(`Reinforcement Percentage = p = As/(b X d) X 100 = (${As.value} X 100) / (${b.value} X ${d.value}) = ${p} %`);
        dispRatio.setValue(p);
        // Step 2
        const p_min = Math.max((3 * Math.sqrt(fc.value)) / fy.value, 200 / fy.value)*100;
        // Step 2
        steps.push(`Minimum reinforcement % = maximum of (3 * sqrt(fc)/fy and 200/fy) X 100 = maximum of (${3 * Math.sqrt(fc.value)} / ${fy.value}, ${200 / fy.value}) X 100 = ${p_min} %`);

        if (p > p_min) {

            message.setValue(`OK`);

            // Step 3
            steps[2] = `Since, percentage of reinforcement provided is greater than the required minimum, we can proceed calculating b1 values.`;
            let b1;
            if (fc.value <= 4000) {
                b1 = 0.85;
                // Step 4
                steps[3] = `Since f'c is less than 4000 psi, b1 = ${b1}.`;
            } else if (4000 <= fc.value  && fc.value <= 8000) {
                b1 = 0.85 - (0.05 * (fc.value - 4000)) / 1000;
                // Step 4
                steps[3] = `Since f'c is is in between than 4000 psi and 8000 psi, b1 = ${b1}.`;
            } else if (fc.value > 8000) {
                b1 = 0.65;
                // Step 4
                steps[3] = `Since f'c is more than 8000 psi, b1 = ${b1}.`;
            }

            const p_b = (b1 * 0.85 * fc.value * 87000 * 100) / (fy.value * (87000 + fy.value));
            
            // Step 5
            steps[4] = `Balanced reinforcement percentage is calculated as p_b = (b1 X 0.85 X fc X 100/ fy) X (87000 / (87000 + fy) = ${p_b}.`;

            if (p > 0.75 * p_b) {
                // Step 6
                steps[5] = `Since p is more than 0.75 times p_b, calculations can be continued.`;
                const a = (As.value * fy.value) / (0.85 * fc.value * b.value);
                // Step 7:
                steps[6] = `'a' value can be calculated as a = As * fy / (0.85 * fc * b) = ${(As.value * fy.value) / (0.85 * fc.value * b.value)}.`;
                const Mn = As.value * fy.value * (d.value - a / 2);
                dispMn.setValue(Math.abs(Mn));
                // Step 8:
                steps[7] = `Mn is calculated as Mn = As * fy * (d - a / 2) = ${Math.abs(As.value * fy.value * (d.value - a / 2))} in-kips.`;
            } else {
                message.setValue(
                    `The section is inadequate: Enlarge section or reduce reinforcement area`
                );
                // Step 6:
                steps[5] = `Since p is less than p_b, the section is inadequate.`;
            }
        } else {
            message.setValue(`The section is unsatisfactory: Increase As`);
            // Step 3:
            steps[2] = `Since, percentage of reinforcement provided is less than the required minimum, the section is unsatisfactory.`;
        }

        if ( As.value && b.value && d.value && fc.value && fy.value && Es.value) {
            setShowSteps(true); 
            setStepsData(steps);
        }
        else
        {
            setShowSteps(false);
        }
    };

    const show_hide = function () {
        setIsVisible(!isVisible);
    };

    return (        
        <div>
            <div className="App">
                <div className="main-tab">
                    <h2 align="center">Analysis of singly reinforced beams</h2>
                    <div className="flex">
                        <div className="full-width">

                            <fieldset className="section-tab tabs">
                                <legend>Section</legend>
                                <Input label="Width (b)" unit="in" {...b} />
                                <Input label="Eff. depth (d)"unit="in" {...d} />
                            </fieldset>

                            <fieldset className="material-tab tabs">
                                <legend>Material</legend>
                                <fieldset className="concrete-tab sub-tabs">
                                    <legend>Concrete</legend>
                                    <Input label={`f'c`} unit="psi" {...fc} />
                                </fieldset>
                                <fieldset className="Rf-tab sub-tabs">
                                    <legend>Reinforcement</legend>
                                    <Input label="fy" unit="psi" {...fy} />
                                    <Input label="Es" unit="psi" {...Es} />
                                </fieldset>
                            </fieldset>

                        </div>
                        <div className="full-width flex-column">
                            <div className="draw-area full-height">
                                <Canvas as={As.value} width={b.value} height={d.value}/>
                            </div>
                            <div className="steel-area">
                                <Input label="As" unit="in^2" {...As} />
                            </div>
                        </div>
                    </div>

                    <fieldset className="results-tab tabs">
                        <legend>Results</legend>
                        <Input label="Message" {...message}  disabled type="text" />
                        <Input label="Reinforcement ratio (p)" {...dispRatio} unit="%" disabled />
                        <Input label="Nominal moment strength (Mn)" {...dispMn} unit="in-kips" disabled />
                    </fieldset>

                    <div className="btns-list">
                        <button onClick={Calculate}>Calculate</button>
                        <button onClick={show_hide}>Calc. Sheet</button>
                        <button>Close</button>
                    </div>
                </div>
            </div>

            {isVisible && (
                <div className="main-tab sec-tab flex-column">
                    <h2 align="center">Calculation Sheet</h2>
                    <div className="calc-inner-container">
                        {showSteps &&
                            stepsData.map((step, i) => ( 
                                <div>
                                    <h4>{`Step ${i + 1} :`}</h4>
                                    <div key={i}>{step}</div>
                                </div>
                            ))}
                    </div>
                    <div className="flex full-width close-btn-calc">
                        <button onClick={show_hide}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
