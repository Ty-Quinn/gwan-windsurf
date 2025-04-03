"use client"

import { Button } from "@/components/ui/button"

interface TargetRowModalProps {
  handleRowSelect: (row: string) => void
  onCancel: () => void
}

export default function TargetRowModal({
  handleRowSelect,
  onCancel,
}: TargetRowModalProps) {
  // Define row information for consistency
  const rows = [
    { key: "diamonds", name: "Long Range", bonus: "+5" },
    { key: "spades", name: "Mid Range", bonus: "+3" },
    { key: "clubs", name: "Close Range", bonus: "+2" }
  ]
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Select Target Row</h3>
        <p className="mb-4">Select which row to place your Hearts card, Joker card, or apply Clear Weather effect:</p>
        
        <div className="space-y-2 mb-6">
          {rows.map((row) => (
            <Button 
              key={row.key}
              onClick={() => handleRowSelect(row.key)}
              variant="secondary"
              className="w-full justify-between"
            >
              <span>{row.name}</span>
              <span className="text-xs text-yellow-400">({row.bonus})</span>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
