import React, { useState } from 'react'
import './input.css';

function Input(props) {
    const {
        label,
        value,
        onChangeHandler,
        unit,
        initialValue,
        disabled,
        type
    } = props
    return (
        <label className="input">
            <div className="label">{label + ' : '}</div>
            <input
                defaultValue={initialValue}
                value={value}
                onChange={onChangeHandler}
                type={type || "number"}
                disabled={disabled}
            />
            {unit && <div className="units">{unit}</div>}
        </label>
    )
}

const useInput = (initialValue) => {
    const [value, setValue] = useState(initialValue)
    const onChangeHandler = (event) => setValue(event.target.value)

    return {
        value,
        onChangeHandler,
        setValue
    }
}

export { Input, useInput }
