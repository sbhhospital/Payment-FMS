"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentRecord {
  id: string
  status: string
  uniqueNo: string
  fmsName: string
  payTo: string
  approvedAmount: number
  remarks: string
  paymentType?: string
}

export function MakePaymentPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [paymentType, setPaymentType] = useState("cash")
  const [proofFile, setProofFile] = useState("")

  const [pendingPayments, setPendingPayments] = useState<PaymentRecord[]>([
    {
      id: "1",
      status: "Approved",
      uniqueNo: "REQ-001",
      fmsName: "Finance Division",
      payTo: "Vendor A",
      approvedAmount: 50000,
      remarks: "Office supplies",
    },
    {
      id: "2",
      status: "Approved",
      uniqueNo: "REQ-002",
      fmsName: "HR Department",
      payTo: "Salary Provider",
      approvedAmount: 150000,
      remarks: "Monthly salary",
    },
  ])

  const [historyPayments, setHistoryPayments] = useState<PaymentRecord[]>([
    {
      id: "3",
      status: "Paid",
      uniqueNo: "REQ-003",
      fmsName: "IT Department",
      payTo: "Software Vendor",
      approvedAmount: 75000,
      remarks: "License renewal",
      paymentType: "Bank",
    },
  ])

  const handleProcess = (payment: PaymentRecord) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const handleSubmitPayment = () => {
    if (!selectedPayment) return

    const updatedPayment: PaymentRecord = {
      ...selectedPayment,
      status: "Paid",
      paymentType,
    }

    setPendingPayments(pendingPayments.filter((p) => p.id !== selectedPayment.id))
    setHistoryPayments([updatedPayment, ...historyPayments])

    setShowModal(false)
    setSelectedPayment(null)
    setPaymentType("cash")
    setProofFile("")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Make Payment</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          History ({historyPayments.length})
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{payment.uniqueNo}</td>
                    <td className="px-6 py-4 text-sm">{payment.fmsName}</td>
                    <td className="px-6 py-4 text-sm">{payment.payTo}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{payment.approvedAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{payment.remarks || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        onClick={() => handleProcess(payment)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Approved Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {historyPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{payment.uniqueNo}</td>
                    <td className="px-6 py-4 text-sm">{payment.fmsName}</td>
                    <td className="px-6 py-4 text-sm">{payment.payTo}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₹{payment.approvedAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{payment.paymentType || "-"}</td>
                    <td className="px-6 py-4 text-sm">{payment.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Process Payment - {selectedPayment.uniqueNo}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Payment Type</label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Upload Proof</label>
                  <Input type="file" onChange={(e) => setProofFile(e.target.files?.[0]?.name || "")} />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmitPayment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Confirm Payment
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedPayment(null)
                      setPaymentType("cash")
                      setProofFile("")
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
