"use client"

import { useState } from "react"

interface CalculatorProps {
  onClose: () => void
}

type ButtonType = "number" | "operator" | "action" | "equals" | "wide"

export function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0")
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display.length < 12 ? display + digit : display)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return }
    if (!display.includes(".")) setDisplay(display + ".")
  }

  const clear = () => { setDisplay("0"); setPrevValue(null); setOperator(null); setWaitingForOperand(false) }

  const backspace = () => {
    if (waitingForOperand) return
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0")
  }

  const toggleSign = () => setDisplay(String(parseFloat(display) * -1))
  const percentage = () => setDisplay(String(parseFloat(display) / 100))

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b
      case "−": return a - b
      case "×": return a * b
      case "÷": return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handleOperator = (nextOp: string) => {
    const value = parseFloat(display)
    if (prevValue !== null && operator && !waitingForOperand) {
      const result = compute(prevValue, value, operator)
      setDisplay(String(parseFloat(result.toPrecision(10))))
      setPrevValue(result)
    } else {
      setPrevValue(value)
    }
    setOperator(nextOp)
    setWaitingForOperand(true)
  }

  const equals = () => {
    if (prevValue === null || !operator) return
    const result = compute(prevValue, parseFloat(display), operator)
    setDisplay(String(parseFloat(result.toPrecision(10))))
    setPrevValue(null); setOperator(null); setWaitingForOperand(true)
  }

  const btnStyle: Record<ButtonType, React.CSSProperties> = {
    number:   { background: "rgba(30,41,59,0.95)", color: "#fff" },
    operator: { background: "rgba(96,165,250,0.18)", color: "var(--accent)", border: "1px solid rgba(96,165,250,0.3)" },
    action:   { background: "rgba(255,255,255,0.1)", color: "#ccc" },
    equals:   { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 12px rgba(96,165,250,0.4)" },
    wide:     { background: "rgba(30,41,59,0.95)", color: "#fff" },
  }

  const Btn = ({ label, onClick, type = "number", wide = false }: {
    label: string; onClick: () => void; type?: ButtonType; wide?: boolean
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center ${wide ? "justify-start pl-6" : "justify-center"} rounded-2xl text-lg font-semibold transition-all hover:opacity-75 active:scale-95 ${wide ? "col-span-2" : ""}`}
      style={{ height: "58px", ...btnStyle[wide ? "wide" : type] }}
    >
      {label}
    </button>
  )

  const isActive = (op: string) => operator === op && waitingForOperand

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-3xl overflow-hidden shadow-2xl"
      style={{ width: "280px", background: "rgba(10,18,35,0.97)", border: "1px solid rgba(96,165,250,0.25)", backdropFilter: "blur(20px)" }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(96,165,250,0.15)" }}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Calculator</span>
        </div>
        <button onClick={onClose} className="transition-opacity hover:opacity-60" style={{ color: "var(--muted)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Display */}
      <div className="px-5 py-4 text-right">
        {operator && prevValue !== null && (
          <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>
            {prevValue} {operator}
          </p>
        )}
        <p className="font-light overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontSize: display.length > 9 ? "24px" : "36px", color: "#fff", lineHeight: 1.1 }}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2 px-3 pb-4">
        <Btn label="AC" onClick={clear} type="action" />
        <Btn label="+/−" onClick={toggleSign} type="action" />
        <Btn label="%" onClick={percentage} type="action" />
        <Btn label="÷" onClick={() => handleOperator("÷")} type="operator" />

        <Btn label="7" onClick={() => inputDigit("7")} />
        <Btn label="8" onClick={() => inputDigit("8")} />
        <Btn label="9" onClick={() => inputDigit("9")} />
        <Btn label="×" onClick={() => handleOperator("×")} type="operator" />

        <Btn label="4" onClick={() => inputDigit("4")} />
        <Btn label="5" onClick={() => inputDigit("5")} />
        <Btn label="6" onClick={() => inputDigit("6")} />
        <Btn label="−" onClick={() => handleOperator("−")} type="operator" />

        <Btn label="1" onClick={() => inputDigit("1")} />
        <Btn label="2" onClick={() => inputDigit("2")} />
        <Btn label="3" onClick={() => inputDigit("3")} />
        <Btn label="+" onClick={() => handleOperator("+")} type="operator" />

        <Btn label="0" onClick={() => inputDigit("0")} wide />
        <Btn label="." onClick={inputDecimal} />
        <Btn label="=" onClick={equals} type="equals" />
      </div>
    </div>
  )
}
