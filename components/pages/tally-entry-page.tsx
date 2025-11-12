"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface TallyEntry {
  id: string
  status: string
  uniqueNo: string
  payTo: string
  approvedAmount: number
  paymentType: string
  remarks: string
}

export function TallyEntryPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [pendingEntries, setPendingEntries] = useState<TallyEntry[]>([
    {
      id: "1",
      status: "Paid",
      uniqueNo: "REQ-001",
      payTo: "Vendor A",
      approvedAmount: 50000,
      paymentType: "Bank",
      remarks: "Office supplies",
    },
    {
      id: "2",
      status: "Paid",
      uniqueNo: "REQ-002",
      payTo: "Salary Provider",
      approvedAmount: 150000,
      paymentType: "Bank",
      remarks: "Monthly salary",
    },
    {
      id: "3",
      status: "Paid",
      uniqueNo: "REQ-003",
      payTo: "Software Vendor",
      approvedAmount: 75000,
      paymentType: "UPI",
      remarks: "License renewal",
    },
  ])

  const [historyEntries, setHistoryEntries] = useState<TallyEntry[]>([
    {
      id: "4",
      status: "Processed",
      uniqueNo: "REQ-004",
      payTo: "Utility Provider",
      approvedAmount: 25000,
      paymentType: "Cash",
      remarks: "Electricity bills",
    },
  ])

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

  const handleSubmitEntries = () => {
    const entriesToMove = pendingEntries.filter((e) => selectedIds.includes(e.id))
    const updatedEntries = entriesToMove.map((e) => ({ ...e, status: "Processed" }))

    setPendingEntries(pendingEntries.filter((e) => !selectedIds.includes(e.id)))
    setHistoryEntries([...updatedEntries, ...historyEntries])
    setSelectedIds([])
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
          History ({historyEntries.length})
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Payment Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedIds.includes(entry.id)}
                          onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{entry.uniqueNo}</td>
                      <td className="px-6 py-4 text-sm">{entry.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{entry.approvedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{entry.paymentType}</td>
                      <td className="px-6 py-4 text-sm">{entry.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedIds.length > 0 && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
              <Button onClick={handleSubmitEntries} className="bg-blue-600 hover:bg-blue-700">
                Submit ({selectedIds.length} selected)
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {historyEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.uniqueNo}</td>
                    <td className="px-6 py-4 text-sm">{entry.payTo}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{entry.approvedAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{entry.paymentType}</td>
                    <td className="px-6 py-4 text-sm">{entry.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
