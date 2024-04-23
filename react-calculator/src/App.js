import { useReducer, useState } from 'react';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';
import "./styles.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faClock } from '@fortawesome/free-solid-svg-icons';

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate',
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state, 
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      if (payload.digit === "." && state.currentOperand == null) {
        return {
          ...state,
          currentOperand: "0."
        }
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`
      }
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    case ACTIONS.CLEAR:
      if (state.history) {
        return {
          history: [...state.history]
        }
      }
      return {}
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null}
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    case ACTIONS.EVALUATE:
      if (state.operation == null || state.previousOperand == null ||
        state.currentOperand == null) {
        return state
      }
      
      const expression = `${formatOperand(state.previousOperand)} ${state.operation} ${formatOperand(state.currentOperand)}`;
      const result = evaluate(state);

      const newHistory = `${expression} = ${result}`;

      if (state.history) {
        return {
          history: [...state.history, newHistory],
        }
      }
      
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: result,
        history: [newHistory],
      }
  }

}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current;
      break
    case "-":
      computation = prev - current;
      break
    case "×":
      computation = prev * current;
      break
    case "÷":
      computation = prev / current;
      break
    case "%":
      computation = prev % current;
      break
  }

  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation, history }, dispatch] = useReducer(reducer, {})
  const [logModal, setLogModal] = useState(false);

  const toggleLogModal = () => {
    setLogModal(!logModal);
  }

  return (
    <div className="calculator-grid">
      <div className="result">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className='red' onClick={() => dispatch({ type: ACTIONS.CLEAR})}>C</button>
      <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}><FontAwesomeIcon icon={faDeleteLeft}/></button>
      <OperationButton operation="%" dispatch={dispatch}/>
      <OperationButton operation="÷" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="×" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <OperationButton operation="-" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch}/>
      <button onClick={() => {toggleLogModal()}}><FontAwesomeIcon icon={faClock} /></button>
      <DigitButton digit="0" dispatch={dispatch}/>
      <DigitButton digit="." dispatch={dispatch}/>
      <button onClick={() => dispatch({ type: ACTIONS.EVALUATE })} className='btn-green'>=</button>
      {logModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {
              history && history.length > 0 ? (
                <>
                  <h2>Calculation Record</h2>
                  {history.map((a, i) => (
                    <p ket={i} style={{ borderBottom: '1px solid black', padding: '10px' }}>{a}</p>      
                    
                  ))
                  }
                  <button onClick={toggleLogModal}>Close Modal</button>
                </>
              ) : (
                  <>
                  <h3>No Calculation Record Yet</h3>
                  <button onClick={toggleLogModal}>Close Modal</button>
                  </>
              )
            }
            
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
