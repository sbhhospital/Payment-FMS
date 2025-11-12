"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

interface Request {
  id: string
  status: string
  uniqueNo: string
  fmsName: string
  payTo: string
  amount: number
  remarks: string
  attachment?: string
}

export function RequestFormPage() {
  const [fmsName, setFmsName] = useState("")
  const [payTo, setPayTo] = useState("")
  const [amount, setAmount] = useState("")
  const [remarks, setRemarks] = useState("")
  const [fileName, setFileName] = useState("")
  const [uniqueNo, setUniqueNo] = useState("")
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      status: "Pending",
      uniqueNo: "REQ-001",
      fmsName: "Finance Division",
      payTo: "Vendor A",
      amount: 50000,
      remarks: "Office supplies",
      attachment: "invoice.pdf",
    },
    {
      id: "2",
      status: "Approved",
      uniqueNo: "REQ-002",
      fmsName: "HR Department",
      payTo: "Salary Provider",
      amount: 150000,
      remarks: "Monthly salary",
      attachment: "salary.pdf",
    },
  ])

  const generateUniqueNo = () => {
    return `REQ-${String(requests.length + 1).padStart(3, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fmsName || !payTo || !amount || !uniqueNo) {
      alert("Please fill in all required fields")
      return
    }

    const newRequest: Request = {
      id: String(requests.length + 1),
      status: "Pending",
      uniqueNo: uniqueNo,
      fmsName,
      payTo,
      amount: Number.parseFloat(amount),
      remarks,
      attachment: fileName || undefined,
    }

    setRequests([newRequest, ...requests])
    setFmsName("")
    setPayTo("")
    setAmount("")
    setRemarks("")
    setFileName("")
    setUniqueNo("")
  }

  const handleDelete = (id: string) => {
    setRequests(requests.filter((req) => req.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Request Form</h1>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Submit New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Unique No *</label>
                <Input
                  value={uniqueNo}
                  onChange={(e) => setUniqueNo(e.target.value)}
                  placeholder="Enter unique number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">FMS Name *</label>
                <Input value={fmsName} onChange={(e) => setFmsName(e.target.value)} placeholder="Enter FMS Name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pay To *</label>
                <Input value={payTo} onChange={(e) => setPayTo(e.target.value)} placeholder="Enter recipient name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount to Be Paid *</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Attachment</label>
                <Input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter additional remarks"
                rows={3}
              />
            </div>

            <Button type="submit" className="gap-2">
              <Plus size={20} />
              Submit Request
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Submitted Requests</h2>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Attachment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
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
                    <td className="px-6 py-4 text-sm">{req.attachment || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
