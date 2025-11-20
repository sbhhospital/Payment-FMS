"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Image } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface TallyEntry {
  id: string
  status: string
  paymentNo: string
  uniqueNo: string
  payTo: string
  approvedAmount: number
  paymentType: string
  attachment: string
  proofImage: string
  remarks: string
  rowNumber: number
  paymentDate: string
}

export function TallyEntryPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pendingEntries, setPendingEntries] = useState<TallyEntry[]>([])
  const [historyEntries, setHistoryEntries] = useState<TallyEntry[]>([])

  const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec'

  // Format date to MM/DD/YYYY HH:MM:SS for Google Sheets
  const formatDateForSheets = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  }

  // Fetch data from Google Sheets
  const fetchTallyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${APP_SCRIPT_URL}?action=fetchSheet&sheetName=FMS`)
      const result = await response.json()
      
      if (result.success && result.data) {
        processSheetData(result.data)
      } else {
        setError('Failed to fetch data from server')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Error fetching tally data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Process the sheet data according to requirements
  const processSheetData = (sheetData: any[][]) => {
    const pending: TallyEntry[] = []
    const history: TallyEntry[] = []

    // Start from row 7 (index 6) as per requirement
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i]
      
      // Skip if row doesn't have enough columns
      if (row.length < 24) continue

      const status = row[18] || '' // Column S (index 18) - Status
      const paymentNo = row[1] || '' // Column B (index 1) - Payment No
      const uniqueNo = row[3] || '' // Column D (index 3) - Unique No
      const payTo = row[5] || '' // Column F (index 5) - Pay to
      const approvedAmount = parseFloat(row[13]) || 0 // Column N (index 13) - Approved Amount
      const paymentType = row[19] || '' // Column T (index 19) - Payment Type
      const attachment = row[8] || '' // Column I (index 8) - Attachment
      const proofImage = row[20] || '' // Column U (index 20) - Proof image
      const remarks = row[14] || '' // Column O (index 14) - Remarks
      const paymentDate = row[17] || '' // Column R (index 17) - Payment Date
      const tallyProcessedDate = row[22] || '' // Column W (index 22) - Tally Processed Date

      // Skip if essential data is missing
      if (!uniqueNo && !payTo) continue

      const tallyEntry: TallyEntry = {
        id: `row-${i + 1}`,
        status: status,
        paymentNo: paymentNo,
        uniqueNo: uniqueNo,
        payTo: payTo,
        approvedAmount: approvedAmount,
        paymentType: paymentType,
        attachment: attachment,
        proofImage: proofImage,
        remarks: remarks,
        rowNumber: i + 1, // Store row number for updates
        paymentDate: paymentDate
      }

      // Categorize based on whether tally processing is done (Column W has date)
      if (status === "Paid" && paymentDate && !tallyProcessedDate) {
        pending.push(tallyEntry)
      } else if (tallyProcessedDate) {
        history.push(tallyEntry)
      }
    }

    setPendingEntries(pending)
    setHistoryEntries(history)
  }

  useEffect(() => {
    fetchTallyData()
  }, [])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingEntries.map((e) => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectEntry = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
  }

  const handleSubmitEntries = async () => {
    try {
      setIsSubmitting(true)
      const entriesToMove = pendingEntries.filter((e) => selectedIds.includes(e.id))
      
      // Get current date and time
      const now = new Date()
      const dateTimeString = formatDateForSheets(now)

      console.log("Processing tally entries with date:", dateTimeString)

      // Update Google Sheets for selected entries - store dates in Column W and X
      for (const entry of entriesToMove) {
        const updateParams = new URLSearchParams({
          action: "updateTallyEntry",
          sheetName: "FMS",
          rowNumber: entry.rowNumber.toString(),
          actualValue: dateTimeString, // Column W (index 22) - Actual Tally Date
          callback: "?",
        })

        const updateUrl = `${APP_SCRIPT_URL}?${updateParams.toString()}`
        console.log("Update URL:", updateUrl)

        const response = await fetch(updateUrl, {
          method: "GET",
        })

        const text = await response.text()
        console.log("Raw update response:", text)

        // Handle JSONP response
        let result
        try {
          const jsonpData = text.replace(/^\?\(|\)$/g, "")
          result = JSON.parse(jsonpData)
          console.log("Parsed update response:", result)
        } catch (e) {
          console.error("Failed to parse response:", e)
          result = { success: false, error: "Failed to parse response" }
        }

        if (!result.success) {
          throw new Error(`Failed to update row ${entry.rowNumber}: ${result.error}`)
        }
      }

      // Update local state
      const updatedEntries = entriesToMove.map((e) => ({ 
        ...e, 
        status: "Tally Processed" 
      }))

      setPendingEntries(pendingEntries.filter((e) => !selectedIds.includes(e.id)))
      setHistoryEntries([...updatedEntries, ...historyEntries])
      setSelectedIds([])

      alert(`Successfully processed ${entriesToMove.length} entries in tally!`)
    } catch (error) {
      console.error('Error submitting entries:', error)
      alert(`Error processing entries: ${error}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Tally Entry</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">Loading tally data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Tally Entry</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-red-600">{error}</div>
          <Button onClick={fetchTallyData} className="ml-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Tally Entry</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({pendingEntries.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Tally Processed ({historyEntries.length})
        </button>
      </div> 

      {activeTab === "pending" && (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <Checkbox
                        checked={selectedIds.length === pendingEntries.length && pendingEntries.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Attachment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Proof Image</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEntries.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-8 text-center text-muted-foreground">
                        No paid entries ready for tally processing found.
                        <br />
                        <small className="text-xs">
                          Only entries with "Paid" status and payment date are shown here.
                        </small>
                      </td>
                    </tr>
                  ) : (
                    pendingEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={selectedIds.includes(entry.id)}
                            onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{entry.paymentNo || "-"}</td>
                        <td className="px-6 py-4 text-sm font-medium">{entry.uniqueNo}</td>
                        <td className="px-6 py-4 text-sm">{entry.payTo}</td>
                        <td className="px-6 py-4 text-sm font-semibold">₹{entry.approvedAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{entry.paymentType || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {entry.attachment ? (
                            <a 
                              href={entry.attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              <Image size={20} />
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {entry.proofImage ? (
                            <a 
                              href={entry.proofImage} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              <Image size={20} />
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">{entry.remarks || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedIds.length > 0 && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
              <Button 
                onClick={handleSubmitEntries} 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Mark as Tally Processed (${selectedIds.length} selected)`
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Attachment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Proof Image</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {historyEntries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">
                      No tally processed entries found.
                    </td>
                  </tr>
                ) : (
                  historyEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          Processed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{entry.paymentNo || "-"}</td>
                      <td className="px-6 py-4 text-sm font-medium">{entry.uniqueNo}</td>
                      <td className="px-6 py-4 text-sm">{entry.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{entry.approvedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{entry.paymentType || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.attachment ? (
                          <a 
                            href={entry.attachment} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Image size={20} />
                          </a>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.proofImage ? (
                          <a 
                            href={entry.proofImage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Image size={20} />
                          </a>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">{entry.remarks || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}