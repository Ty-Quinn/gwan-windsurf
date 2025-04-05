
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function PerspectiveToggle() {
  const [is3DEnabled, setIs3DEnabled] = useState(true)
  
  useEffect(() => {
    // Add or remove the 3D-disabled class to the root element
    const rootElement = document.documentElement
    if (!is3DEnabled) {
      rootElement.classList.add('disable-3d')
    } else {
      rootElement.classList.remove('disable-3d')
    }
  }, [is3DEnabled])
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIs3DEnabled(!is3DEnabled)}
      className="fixed bottom-4 right-4 z-50 bg-amber-900/80 text-amber-100 border-amber-700"
    >
      {is3DEnabled ? "2D View" : "3D View"}
    </Button>
  )
}
