"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ApprovalRequest {
  id: string
  status: string
  uniqueNo: string
  fmsName: string
  payTo: string
  amount: number
  remarks: string
}

export function PaymentApprovalPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<"approve" | "reject">("approve")
  const [approvalRemarks, setApprovalRemarks] = useState("")

  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([
    {
      id: "1",
      status: "Pending",
      uniqueNo: "REQ-001",
      fmsName: "Finance Division",
      payTo: "Vendor A",
      amount: 50000,
      remarks: "Office supplies",
    },
    {
      id: "2",
      status: "Pending",
      uniqueNo: "REQ-002",
      fmsName: "HR Department",
      payTo: "Salary Provider",
      amount: 150000,
      remarks: "Monthly salary",
    },
  ])

  const [historyRequests, setHistoryRequests] = useState<ApprovalRequest[]>([
    {
      id: "3",
      status: "Approved",
      uniqueNo: "REQ-003",
      fmsName: "IT Department",
      payTo: "Software Vendor",
      amount: 75000,
      remarks: "License renewal",
    },
  ])

  const handleProcess = (request: ApprovalRequest) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const handleSubmitApproval = () => {
    if (!selectedRequest) return

    const updatedRequest: ApprovalRequest = {
      ...selectedRequest,
      status: approvalStatus === "approve" ? "Approved" : "Rejected",
    }

    setPendingRequests(pendingRequests.filter((r) => r.id !== selectedRequest.id))
    setHistoryRequests([updatedRequest, ...historyRequests])

    setShowModal(false)
    setSelectedRequest(null)
    setApprovalRemarks("")
    setApprovalStatus("approve")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Payment Approval</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          History ({historyRequests.length})
        </button>
      </div>

      {activeTab === "pending" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">FMS Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{req.uniqueNo}</td>
                    <td className="px-6 py-4 text-sm">{req.fmsName}</td>
                    <td className="px-6 py-4 text-sm">{req.payTo}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{req.remarks || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button size="sm" onClick={() => handleProcess(req)} className="bg-blue-600 hover:bg-blue-700">
                        Process
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Unique No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">FMS Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pay To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {historyRequests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.status === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{req.uniqueNo}</td>
                    <td className="px-6 py-4 text-sm">{req.fmsName}</td>
                    <td className="px-6 py-4 text-sm">{req.payTo}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{req.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Process Payment Approval - {selectedRequest.uniqueNo}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <Select value={approvalStatus} onValueChange={(value: any) => setApprovalStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Approved Amount</label>
                  <Input type="number" value={selectedRequest.amount} readOnly className="bg-muted" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Remarks</label>
                  <Textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Enter approval remarks"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmitApproval} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Submit
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedRequest(null)
                      setApprovalRemarks("")
                      setApprovalStatus("approve")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
