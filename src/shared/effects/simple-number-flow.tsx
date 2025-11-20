"use client"

import NumberFlow from "@number-flow/react"

export function SimpleNumberFlow({ value }: { value: number }) {
  return (
    <NumberFlow value={value} />
  )
}