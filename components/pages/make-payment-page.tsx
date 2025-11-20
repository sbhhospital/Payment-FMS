"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Image } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentRecord {
  id: string
  paymentNo: string
  status: string
  uniqueNo: string
  fmsName: string
  payTo: string
  approvedAmount: number
  attachment?: string
  remarks: string
  paymentType?: string
  proofUrl?: string
  rowNumber: number
}

export function MakePaymentPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending")
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [paymentType, setPaymentType] = useState("cash")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pendingPayments, setPendingPayments] = useState<PaymentRecord[]>([])
  const [historyPayments, setHistoryPayments] = useState<PaymentRecord[]>([])

  const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec'
  const DRIVE_FOLDER_ID = "1X6E9tEmxq537Z-npNWW7sFIaJ09nOwAR18bjyGPCGQJV4G2bB0pXoM9bJPM_b3phwj2cK3t1"

  // Format date to MM/DD/YYYY HH:MM:SS
  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  }

  // Upload file to Google Drive
  const uploadFileToGoogleDrive = async (file: File): Promise<string | null> => {
    try {
      console.log("📤 Uploading file:", file.name)
      
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Send as JSON using POST
      const response = await fetch(APP_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: 'uploadFile',
          base64Data: base64Data,
          fileName: file.name,
          mimeType: file.type,
          folderId: DRIVE_FOLDER_ID
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log("✅ File uploaded successfully:", result.fileUrl)
        return result.fileUrl
      } else {
        console.error("❌ File upload failed:", result.error)
        return null
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error)
      return null
    }
  }

  // Fetch data from Google Sheets
  const fetchPaymentData = async () => {
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
      console.error('Error fetching payment data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Process the sheet data according to requirements
  const processSheetData = (sheetData: any[][]) => {
    const pending: PaymentRecord[] = []
    const history: PaymentRecord[] = []

    // Start from row 7 (index 6) as per requirement
    for (let i = 6; i < sheetData.length; i++) {
      const row = sheetData[i]
      
      // Skip if row doesn't have enough columns
      if (row.length < 15) continue

      const statusColM = row[12] || '' // Column M (index 12) - Approval Status
      const statusColS = row[18] || '' // Column S (index 18) - Payment Status
      const paymentNo = row[1] || '' // Column B (index 1) - Payment No
      const uniqueNo = row[3] || '' // Column D (index 3)
      const fmsName = row[4] || '' // Column E (index 4)
      const payTo = row[5] || '' // Column F (index 5)
      const attachment = row[8] || ''
      const approvedAmount = parseFloat(row[13]) || 0 // Column N (index 13)
      const remarks = row[14] || '' // Column O (index 14)
      const paymentType = row[19] || '' // Column T (index 19)
      const proofUrl = row[20] || '' // Column U (index 20)

      // Skip if approval status is "Rejected" or empty
      if (!statusColM || statusColM === "Rejected") continue

      // Skip if essential data is missing
      if (!uniqueNo && !fmsName && !payTo) continue

      const paymentRecord: PaymentRecord = {
        id: `row-${i + 1}`,
        paymentNo: paymentNo,
        status: statusColS || statusColM, // Use Payment Status (S) if available, else Approval Status (M)
        uniqueNo: uniqueNo,
        fmsName: fmsName,
        payTo: payTo,
        approvedAmount: approvedAmount,
        attachment: attachment,
        remarks: remarks,
        paymentType: paymentType,
        proofUrl: proofUrl,
        rowNumber: i + 1 // Store row number for updates
      }

      // Categorize based on payment status (Column S)
      if (statusColM === "Approved" && statusColS !== "Paid") {
        pending.push(paymentRecord)
      } else if (statusColS === "Paid") {
        history.push(paymentRecord)
      }
    }

    setPendingPayments(pending)
    setHistoryPayments(history)
  }

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const handleProcess = (payment: PaymentRecord) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const handleSubmitPayment = async () => {
    if (!selectedPayment) return

    setIsSubmitting(true)

    try {
      let proofUrl = ""
      
      // Upload proof file if selected
      if (proofFile) {
        const uploadedUrl = await uploadFileToGoogleDrive(proofFile)
        if (uploadedUrl) {
          proofUrl = uploadedUrl
          console.log("✅ Proof uploaded:", proofUrl)
        } else {
          alert("File upload failed. Continuing without proof attachment.")
        }
      }

      // Get current date and time
      const now = new Date()
      const actualDate = formatDate(now)
      const plannedDate = formatDate(now)

      console.log("Updating payment with data:", {
        rowNumber: selectedPayment.rowNumber,
        actualDate,
        paymentStatus: "Paid",
        paymentType,
        proofUrl,
        plannedDate
      })

      // Update the payment columns in Google Sheets
      const updateParams = new URLSearchParams({
        action: "updatePayment",
        sheetName: "FMS",
        rowNumber: selectedPayment.rowNumber.toString(),
        actualDate: actualDate,           // Column R (index 17)
        paymentStatus: "Paid",            // Column S (index 18)
        paymentType: paymentType,         // Column T (index 19)
        proofUrl: proofUrl,               // Column U (index 20)
        plannedDate: plannedDate          // Column V (index 21)
      })

      const updateUrl = `${APP_SCRIPT_URL}?${updateParams.toString()}`
      console.log("Update URL:", updateUrl)

      const response = await fetch(updateUrl)
      const result = await response.json()

      console.log("Update response:", result)

      if (result.success) {
        // Update local state
        const updatedPayment: PaymentRecord = {
          ...selectedPayment,
          status: "Paid",
          paymentType,
          proofUrl: proofUrl || undefined,
        }

        setPendingPayments(pendingPayments.filter((p) => p.id !== selectedPayment.id))
        setHistoryPayments([updatedPayment, ...historyPayments])

        setShowModal(false)
        setSelectedPayment(null)
        setPaymentType("cash")
        setProofFile(null)

        alert("Payment processed successfully!")
      } else {
        setError('Failed to update payment status: ' + result.error)
        alert('Failed to update payment status: ' + result.error)
      }
    } catch (err) {
      setError('Error updating payment status')
      console.error('Error updating payment:', err)
      alert('Error updating payment: ' + err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      console.log("📁 Proof file selected:", file.name, "Size:", file.size, "bytes")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Make Payment</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">Loading payment data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Make Payment</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-red-600">{error}</div>
          <Button onClick={fetchPaymentData} className="ml-4">
            Retry
          </Button>
        </div>
      </div>
    )
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
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Payment No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Unique No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      FMS Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Pay To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Approved Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      attachment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.paymentNo || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.uniqueNo}
                      </td>
                      <td className="px-6 py-4 text-sm">{payment.fmsName}</td>
                      <td className="px-6 py-4 text-sm">{payment.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ₹{payment.approvedAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.attachment ? (
                          <a
                            href={payment.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Image />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.remarks || "-"}
                      </td>
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
          )}
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="overflow-hidden">
          {historyPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No payment history found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Payment No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Unique No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      FMS Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Pay To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Approved Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Attachment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Proof
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.paymentNo || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.uniqueNo}
                      </td>
                      <td className="px-6 py-4 text-sm">{payment.fmsName}</td>
                      <td className="px-6 py-4 text-sm">{payment.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ₹{payment.approvedAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.paymentType || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.attachment ? (
                          <a
                            href={payment.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Image />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.proofUrl ? (
                          <a
                            href={payment.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <Image />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Process Payment - {selectedPayment.uniqueNo}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Type
                  </label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload Proof
                  </label>
                  <Input type="file" onChange={handleFileChange} />
                  {proofFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {proofFile.name} (
                      {Math.round(proofFile.size / 1024)} KB)
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                      setPaymentType("cash");
                      setProofFile(null);
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
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
  );
}