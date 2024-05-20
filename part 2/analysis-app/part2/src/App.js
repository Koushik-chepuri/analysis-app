import './App.css';
import React, { useState } from 'react';
import { Input, useInput } from './Input/input';


const RadioInput = (props) => {

    const { items, direction = 'column', onChange, value, className = ''} = props;
    
    return (
        <div className={`radio-input ${className}`} style={{ flexDirection: direction }}>
            {items.map((item, index) => {
                return (
                    <label key={index}>
                        <input
                            type='radio'
                            value={item.value}
                            checked={item.value === value}
                            onChange={(event) => onChange(event.target.value)}
                        />
                        {item.label}
                    </label>
                );
            })}
        </div>
    );
}
    
function App() {

    let P = useInput('');
    let W = useInput('');
    let L = useInput(0);
    let A = useInput(0);
    let B = useInput(0);
    let FEM_left;
    let FEM_right;
    let R_left;
    let R_right;

    const all_load_options = [{value: 'concload',label: 'Concentrated Load'}, {value: 'distload', label: 'Distributed Load' }];
    const [load_option, setLoadOption] = useState('concload');
 
    const all_supp_options = [{value: 'two-supp', label: '2 Supports'}, {value: 'multi-supp',label: 'Continuous beam with 5 supports'}];
    const [supp_option, setSuppOption] = useState('two-supp');
    
    const trunc_matrix = function (matrix, remove) {
        remove.forEach(function (i) {
          matrix = matrix.map(function (row) {
            return row.slice(0, i).concat(row.slice(i + 1));
          });
        });
      
        matrix = matrix.filter(function (row, i) {
          return remove.indexOf(i) === -1;
        });
        return matrix;
      }
    
      // removes a specified column  
      const remove_col = function (matrix, remove) {
      
        for (let i = remove.length - 1; i >= 0; i--) {
          if (i === 0) {
          
            matrix.splice(remove[i], 1);
          }
          else matrix.splice(remove[i], 1)
        }
        return matrix;
      }

      // inverse a 2x2 matrix
      const inv = function (matrix) {
        const divide = function (matrix, div) {
          return matrix.map(row => row.map(col => col / div));
        }
        const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        const adj = [[matrix[1][1], -matrix[0][1]], [-matrix[1][0], matrix[0][0]]];
        return divide(adj, det);
      }
    
      //matrix multiplication for nXn and nX1
      const multiply_matrix = function (A, B) {
        const result = [];
        for (let i = 0; i < A.length; i++) {
          let sum = 0;
          for (let j = 0; j < B.length; j++) {
            sum += A[i][j] * B[j];
          }
          result.push(sum);
        }
        return result;
      }
    
      //Inserts an element at any position in an array
      const insert_at = function (arr, i, val) {
        return [...arr.slice(0, i), val, ...arr.slice(i)];
      }

      const Calculate = function () {

        let p = P.value;
        let w = W.value;
        let l = L.value;
        let a = A.value;
        let b = B.value;

          
        const k = [[12 / l ** 3, 6 / l ** 2, -12 / l ** 3, 6 / l ** 2],
        [6 / l ** 2, 4 / l, 6 / l ** 2, 2 / l],
        [-12 / l ** 3, -6 / l ** 2, 12 / l ** 3, -6 / l ** 2],
        [6 / l ** 2, 2 / l, -6 / l ** 2, 4 / l]];
 
      
        if (load_option == 'concload' && supp_option == 'two-supp') {
    
          if (l == 0 || l < 0) alert('Enter a positive value!'); 
    
          if (a == 0 || a == l || a < 0 || a > l) alert('Enter a valid number!')
            
          if (a !== l / 2 && a !== l) {
            FEM_left = (p * a * (l - a) ** 2) / (l ** 2);
            FEM_right = -(p * (l - a) * a ** 2) / (l ** 2);
            
            R_left = (p * (l - a)) / l;
            R_right = (p * (a)) / l;
          }
            
          if (a === l / 2) {
            FEM_left = (p * l) / 8;
            FEM_right = -(p * l) / 8;
          
            R_left = p / 2;
            R_right = p / 2;
          }
          const AML_matrix_p = [R_left, FEM_left, R_right, FEM_right];
          
          //AML matrix is copied as it will get mutated in the upcomming steps
          const AML_matrix_p_copied = AML_matrix_p.map(value => value);
          const AFC_matrix_p = remove_col(AML_matrix_p, [0, 2]);
           
          const AFC_final_matrix_p = AFC_matrix_p.map(ele => -ele);
          
          const k_s = trunc_matrix(k, [0])
          
          const k_stiff = trunc_matrix(k_s, [1]);
          
          const k_stiff_inv = inv(k_stiff);
          
          const delta = multiply_matrix(k_stiff_inv, AFC_final_matrix_p);
          
          let delta_final = insert_at(delta, 1, 0);
          delta_final = insert_at(delta_final, 0, 0);
          
          let member_forces = multiply_matrix(k, delta_final);
          
          for (let i = 0; i < member_forces.length; i++) {
            member_forces[i] += AML_matrix_p_copied[i];
          }

          const reactions = remove_col(member_forces , [1,3])  

          const bending_moment_max = reactions[0] * a;

          const shear_force_max = Math.max(reactions);
          
        }
        

        if (load_option == 'distload' && supp_option === 'two-supp')
        {
          if (l === 0 || l < 0) alert('Enter a positive value!');

          else if (b < a) alert("'b' cannot be lesser than 'a'!")
    
          else if (a < 0 || a > l || b < 0 || b > l) alert('Load should be within the span!')
          
          else if (a === l) alert('Starting point of load cannot be on the span end!')
            
          else if (l - a - b === 0) alert('No load acting!')
          
          else {
          
            let Lw = (l - a - b);
            let s1 = (l ** 2 + a ** 2) * (l + a) - (a ** 2 + b ** 2) * (a - b) - l * b * (l + b) - a ** 3;
            let s2 = 12 * a * b * (a + Lw) + Lw * (6 * (a ** 2) + 4 * l * Lw - 3 * (Lw ** 2));
      
            R_right = (Lw * s1 * w) / (2 * l ** 3);
            R_left = w * Lw - R_right;
        
            FEM_right = -(Lw * s2 * w) / (12 * l ** 2);
            FEM_left = FEM_right + R_right * l - a * Lw * w - (Lw ** 2 * w) / 2;
          
            const AML_matrix_w = [R_left, FEM_left, R_right, FEM_right];
          
            //AML matrix is copied as it will get mutated in the upcomming steps
            const AML_matrix_w_copied = AML_matrix_w.map(value => value);
          
            const AFC_matrix_w = remove_col(AML_matrix_w, [0, 2]);
         
            const AFC_final_matrix_w = AFC_matrix_w.map(ele => -ele);
        
            const k_s = trunc_matrix(k, [0])
        
            const k_stiff = trunc_matrix(k_s, [1]);
    
            const k_stiff_inv = inv(k_stiff);
        
            const delta = multiply_matrix(k_stiff_inv, AFC_final_matrix_w);
    
            let delta_final = insert_at(delta, 1, 0);
            delta_final = insert_at(delta_final, 0, 0);
        
            let member_forces = multiply_matrix(k, delta_final);
        
            for (let i = 0; i < member_forces.length; i++) {
              member_forces[i] += AML_matrix_w_copied[i];
            }
            
            const reactions = remove_col(member_forces, [1, 3])  
            
            const bending_moment_max = reactions[0] * (a + Lw) - (w * (a + Lw/2)**2)/2;

            const shear_force_max = Math.max(reactions);
  
            console.log(shear_force_max);
            
          }
        
        }
    
        
        if (load_option == 'concload' && supp_option === 'multi-supp')
        {
          if (l == 0 || l < 0) alert('Enter a positive value!');

          if (a == 0 || a == l || a < 0 || a > l) alert('Enter a valid number!');
    
          const spans = 4;
          const coords = [0, 1 * l, 2 * l, 3 * l, 4 * l];
          
          let AML_matrix_p = Array(4).fill(Array(4).fill(0));
          let AML_matrix_p_copied = Array(4).fill(Array(4).fill(0));
          let AFC_matrix_p = Array(4).fill(Array(4).fill(0));
          let AFC_final_matrix_p = Array(4).fill(Array(4).fill(0));
          let k_s = Array(4).fill(Array(4).fill(0));
          let k_stiff = Array(4).fill(Array(4).fill(0));
          let k_stiff_inv = Array(4).fill(Array(4).fill(0));
          let delta = Array(4).fill(Array(4).fill(0));
          let delta_final = Array(4).fill(Array(4).fill(0));
          let product = Array(4).fill(Array(4).fill(0));
          let member_forces = Array(4).fill(Array(4).fill(0));
          let reactions = Array(4).fill(Array(4).fill(0));
          let bending_moment_max = Array(4).fill(0);
          let shear_force_max = Array(4).fill(0);
    
          for (let i = 1; i < spans + 1; i++) {
              if (a > coords[i - 1] && a < coords[i]) {
                  if (a !== l / 2 && a !== l) {
                      FEM_left = -(p * a * (l - a) ** 2) / (l ** 2);
                      FEM_right = (p * (l - a) * a ** 2) / (l ** 2);
                      
                      R_left = (p * (l - a)) / l;
                      R_right = (p * (a)) / l;
                  }
                      
                  if (a === l / 2) {
                      FEM_left = -(p * l) / 8;
                      FEM_right = -(p * l) / 8;
                      
                      R_left = p / 2;
                      R_right = p / 2;
                  }
                
                AML_matrix_p[i - 1] = [R_left, FEM_left, R_right, FEM_right];
    
                //AML matrix is copied as it will get mutated in the upcoming steps
                AML_matrix_p_copied[i-1] = AML_matrix_p[i-1].map(value => value);
      
                AFC_matrix_p[i-1] = remove_col(AML_matrix_p[i-1], [0, 2]);
                
                AFC_final_matrix_p[i-1] = AFC_matrix_p[i-1].map(ele => -ele);
               
                k_s[i-1] = trunc_matrix(k, [0])
               
                k_stiff[i-1] = trunc_matrix(k_s[i-1], [1]);
               
                k_stiff_inv[i-1] = inv(k_stiff[i-1]);   
               
                delta[i-1] = multiply_matrix(k_stiff_inv[i-1], AFC_final_matrix_p[i-1]);
                
                delta_final[i - 1] = insert_at(delta[i - 1], 1, 0);
                
                delta_final[i-1] = insert_at(delta_final[i-1], 0, 0);
                  
                product[i-1] = multiply_matrix(k, delta_final[i-1]);
    
                member_forces[i - 1] = [product[0][0] + AML_matrix_p_copied[0][0], product[0][1] + AML_matrix_p_copied[0][1],
                  product[0][2] + AML_matrix_p_copied[0][2], product[0][3] + AML_matrix_p_copied[0][3]];
                
                reactions[i - 1] = remove_col(member_forces[i - 1], [1, 3]);
                
                bending_moment_max[i - 1] = reactions[i - 1][0] * a;
                  
                shear_force_max[i - 1] = Math.max(reactions[i - 1]);
                  
              }

          }
          
  
        }
    
        if (load_option == 'distload' && supp_option === 'multi-supp') {
    
          if (l === 0 || l < 0) alert('Enter a positive value!');

          else if (b < a) alert("Cannot be lesser than 'a'!")
    
          else if (a < 0 || b < 0 ) alert('Load should be within the span!')

          else if (a + b === l) alert('No load acting!')

          else {

            const spans = 4;
            // In this case, the entered length value is for the overall span
            const l_eff = l / spans;
            const coords = [0, 1 * l_eff, 2 * l_eff, 3 * l_eff, 4 * l_eff];
            
            let AML_matrix_w = Array(4).fill(Array(4).fill(0));
            let AML_matrix_w_copied = Array(4).fill(Array(4).fill(0));
            let AFC_matrix_w = Array(4).fill(Array(4).fill(0));
            let AFC_final_matrix_w = Array(4).fill(Array(4).fill(0));
            let k_s = Array(4).fill(Array(4).fill(0));
            let k_stiff = Array(4).fill(Array(4).fill(0));
            let k_stiff_inv = Array(4).fill(Array(4).fill(0));
            let delta = Array(4).fill(Array(4).fill(0));
            let delta_final = Array(4).fill(Array(4).fill(0));
            let product = Array(4).fill(Array(4).fill(0));
            let member_forces = Array(4).fill(Array(4).fill(0));
            let reactions = Array(4).fill(Array(4).fill(0));
            let bending_moment_max = Array(4).fill(0);
            let shear_force_max = Array(4).fill(0);
      
            for (let i = 1; i < spans + 1; i++) {
      
              let Lw = (l_eff - a - b);
              let s1 = (l_eff ** 2 + a ** 2) * (l_eff + a) - (a ** 2 + b ** 2) * (a - b) - l_eff * b * (l_eff + b) - a ** 3;
              let s2 = 12 * a * b * (a + Lw) + Lw * (6 * (a ** 2) + 4 * l_eff * Lw - 3 * (Lw ** 2));
              
              R_right = (Lw * s1 * w) / (2 * l_eff ** 3);
              R_left = w * Lw - R_right;
      
              FEM_right = -(Lw * s2 * w) / (12 * l_eff ** 2);
             
              FEM_left = FEM_right + R_right * l_eff - a * Lw * w - (Lw ** 2 * w) / 2;
       
              if (a > coords[i - 1] && b < coords[i])
              {
                AML_matrix_w[i - 1] = [R_left, FEM_left, R_right, FEM_right];
      
                //AML matrix is copied as it will get mutated in the upcomming steps
                AML_matrix_w_copied[i-1] = AML_matrix_w[i-1].map(value => value);
                
                AFC_matrix_w[i - 1] = remove_col(AML_matrix_w[i - 1], [0, 2]);
      
                AFC_final_matrix_w[i-1] = AFC_matrix_w[i-1].map(ele => -ele);
      
                k_s[i - 1] = trunc_matrix(k, [0])
      
                k_stiff[i-1] = trunc_matrix(k_s[i-1], [1]);
      
                k_stiff_inv[i-1] = inv(k_stiff[i-1]);
      
                delta[i-1] = multiply_matrix(k_stiff_inv[i-1], AFC_final_matrix_w[i-1]);
      
                delta_final[i - 1] = insert_at(delta[i - 1], 1, 0);
                
                delta_final[i-1] = insert_at(delta_final[i-1], 0, 0);
      
                product[i-1] = multiply_matrix(k, delta_final[i-1]);
      
                member_forces[i - 1] = [product[0][0] + AML_matrix_w_copied[0][0], product[0][1] + AML_matrix_w_copied[0][1],
                  product[0][2] + AML_matrix_w_copied[0][2],  product[0][3] + AML_matrix_w_copied[0][3]];

                reactions[i-1] = remove_col(member_forces[i-1], [1, 3])  
            
                bending_moment_max[i-1] = reactions[i-1][0] * (a + Lw) - (w * (a + Lw/2)**2)/2;
      
                shear_force_max[i-1] = Math.max(reactions[i-1]);
      
              }

            }

    
          }
          
        }
    
    
      }
    
    return (
        <div className='main-tab'>
            <h2 align='center'>Calculation of BMD and SFD</h2>
            <div className='all-tabs'>
                <div className='sub-set'>
                    <fieldset>
                        <legend>Loading Option</legend>
                        <RadioInput items={all_load_options} value={load_option} onChange={setLoadOption} />
                       
                    </fieldset>

                    <fieldset>
                        <legend>Load</legend>
                        {load_option === 'concload' ? <Input label='P' {...P} unit='kN' /> : <Input label='W' {...W} unit='kN/m' />}
                    </fieldset>
                </div>

                <div className='sub-set'>
                    <fieldset>
                        <legend>Dimensions</legend>
                        <Input label='L' {...L} unit='m' />
                        <Input label='a' {...A} unit='m' />
                        <Input label='b' {...B} unit='m' />
                    </fieldset>
                </div>

            </div>

            <fieldset>
                <legend>Beam Supports</legend>
                <RadioInput className='beam-supp' items={all_supp_options} value={supp_option} onChange={setSuppOption} direction='row' />
            </fieldset>

            <div className='draw-area'></div>

            <fieldset>
                <legend>Results</legend>

                <label className='draw-area-label'>BMD (Bending Moment Diagram)</label>
                <div className='draw-area'> </div>

                <label className='draw-area-label'>SFD (Bending Moment Diagram)</label>
                <div className='draw-area'></div>
            </fieldset>

            <div className='btns'>
                <ul className='btns-ul'>
                    <li><button onClick={Calculate}>Calculate</button></li>
                    <li><button>Close</button></li>
                </ul>
            </div>
        </div>

    );


}

export default App;

