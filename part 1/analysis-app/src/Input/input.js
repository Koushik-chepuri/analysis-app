import React, { useState } from 'react'

function Input(props) {

    const {label, value, onChange, unit, initialValue, disabled, type} = props
        
    return (
        <label className="input">
            <div className="label">{label + ' : '}</div>
            <input defaultValue={initialValue} value={value} onChange={onChange} type={type || "number"} disabled={disabled} />
            {unit && <div className="units">{unit}</div>}
        </label>
    )
}

const useInput = (initialValue) => {
    const [value, setValue] = useState(initialValue)
    const onChange = (event) => setValue(event.target.value)

    return { value, onChange, setValue }
}

export { Input, useInput }
