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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Select Target Row</h3>
        <p className="mb-4">Select which row to place your Hearts card or apply Clear Weather effect:</p>
        
        <div className="space-y-2 mb-6">
          <Button 
            onClick={() => handleRowSelect("clubs")}
            variant="secondary"
            className="w-full justify-between"
          >
            <span>Close Range</span>
            <span className="text-xs text-yellow-400">(+2)</span>
          </Button>
          <Button 
            onClick={() => handleRowSelect("spades")}
            variant="secondary"
            className="w-full justify-between"
          >
            <span>Mid Range</span>
            <span className="text-xs text-yellow-400">(+3)</span>
          </Button>
          <Button 
            onClick={() => handleRowSelect("diamonds")}
            variant="secondary"
            className="w-full justify-between"
          >
            <span>Long Range</span>
            <span className="text-xs text-yellow-400">(+5)</span>
          </Button>
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
