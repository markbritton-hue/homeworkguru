"use client"

import { useState } from "react"

interface CalculatorProps {
  onClose: () => void
  onPaste?: (value: string) => void
}

type BtnType = "number" | "operator" | "action" | "equals" | "sci"

export function Calculator({ onClose, onPaste }: CalculatorProps) {
  const [display, setDisplay] = useState("0")
  const [prevValue, setPrevValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [isScientific, setIsScientific] = useState(false)

  const setResult = (val: number) => {
    setDisplay(String(parseFloat(val.toPrecision(10))))
    setWaitingForOperand(true)
  }

  const inputDigit = (digit: string) => {
    if (waitingForOperand) { setDisplay(digit); setWaitingForOperand(false) }
    else setDisplay(display === "0" ? digit : display.length < 12 ? display + digit : display)
  }

  const inputDecimal = () => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return }
    if (!display.includes(".")) setDisplay(display + ".")
  }

  const clear = () => { setDisplay("0"); setPrevValue(null); setOperator(null); setWaitingForOperand(false) }
  const toggleSign = () => setDisplay(String(parseFloat(display) * -1))
  const percentage = () => setDisplay(String(parseFloat(display) / 100))

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":  return a + b
      case "−":  return a - b
      case "×":  return a * b
      case "÷":  return b !== 0 ? a / b : 0
      case "yˣ": return Math.pow(a, b)
      default:   return b
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
    setResult(result)
    setPrevValue(null); setOperator(null)
  }

  // Scientific functions (trig in degrees)
  const toRad = (deg: number) => deg * Math.PI / 180
  const applyFn = (fn: (x: number) => number) => { setResult(fn(parseFloat(display))) }

  const sciActions: Array<{ label: string; action: () => void }> = [
    { label: "sin",  action: () => applyFn(x => Math.sin(toRad(x))) },
    { label: "cos",  action: () => applyFn(x => Math.cos(toRad(x))) },
    { label: "tan",  action: () => applyFn(x => Math.tan(toRad(x))) },
    { label: "yˣ",  action: () => handleOperator("yˣ") },
    { label: "√x",  action: () => applyFn(Math.sqrt) },
    { label: "x²",  action: () => applyFn(x => x * x) },
    { label: "log", action: () => applyFn(Math.log10) },
    { label: "ln",  action: () => applyFn(Math.log) },
    { label: "π",   action: () => { setDisplay(String(Math.PI)); setWaitingForOperand(false) } },
    { label: "e",   action: () => { setDisplay(String(Math.E)); setWaitingForOperand(false) } },
    { label: "1/x", action: () => applyFn(x => 1 / x) },
    { label: "abs", action: () => applyFn(Math.abs) },
  ]

  const btnH = isScientific ? "46px" : "58px"
  const fontSize = isScientific ? "text-sm" : "text-lg"

  const styleMap: Record<BtnType, React.CSSProperties> = {
    number:   { background: "rgba(30,41,59,0.95)", color: "#fff" },
    operator: { background: "rgba(96,165,250,0.18)", color: "var(--accent)", border: "1px solid rgba(96,165,250,0.3)" },
    action:   { background: "rgba(255,255,255,0.1)", color: "#ccc" },
    equals:   { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 12px rgba(96,165,250,0.4)" },
    sci:      { background: "rgba(167,139,250,0.15)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.25)" },
  }

  const Btn = ({ label, onClick, type = "number", wide = false }: {
    label: string; onClick: () => void; type?: BtnType; wide?: boolean
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center ${wide ? "justify-start pl-5" : "justify-center"} rounded-xl font-semibold transition-all hover:opacity-75 active:scale-95 ${fontSize} ${wide ? "col-span-2" : ""}`}
      style={{ height: btnH, ...styleMap[wide ? "number" : type] }}
    >
      {label}
    </button>
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-3xl overflow-hidden shadow-2xl"
      style={{ width: "280px", background: "rgba(10,18,35,0.97)", border: "1px solid rgba(96,165,250,0.25)", backdropFilter: "blur(20px)" }}>

      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(96,165,250,0.15)" }}>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Calculator</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Scientific toggle */}
          <button
            onClick={() => setIsScientific(v => !v)}
            className="px-2 py-0.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: isScientific ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.08)",
              color: isScientific ? "#c4b5fd" : "var(--muted)",
              border: isScientific ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isScientific ? "Basic" : "Sci"}
          </button>
          {/* Paste button */}
          {onPaste && (
            <button
              onClick={() => onPaste(display)}
              className="px-2 py-0.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(96,165,250,0.2)", color: "var(--accent)", border: "1px solid rgba(96,165,250,0.35)" }}
              title="Paste answer into chat"
            >
              → Chat
            </button>
          )}
          <button onClick={onClose} className="transition-opacity hover:opacity-60 ml-1" style={{ color: "var(--muted)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="px-4 py-3 text-right">
        {operator && prevValue !== null && (
          <p className="text-xs mb-0.5" style={{ color: "var(--muted)" }}>{prevValue} {operator}</p>
        )}
        <p className="font-light overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontSize: display.length > 9 ? "22px" : "32px", color: "#fff", lineHeight: 1.1 }}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
        {/* Scientific rows */}
        {isScientific && sciActions.map(({ label, action }) => (
          <Btn key={label} label={label} onClick={action} type="sci" />
        ))}

        {/* Standard rows */}
        <Btn label="AC"  onClick={clear}                        type="action" />
        <Btn label="+/−" onClick={toggleSign}                   type="action" />
        <Btn label="%"   onClick={percentage}                   type="action" />
        <Btn label="÷"   onClick={() => handleOperator("÷")}   type="operator" />

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
