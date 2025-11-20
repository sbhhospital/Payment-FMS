"use client"

import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
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

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec"
const DRIVE_FOLDER_ID = "1X6E9tEmxq537Z-npNWW7sFIaJ09nOwAR18bjyGPCGQJV4G2bB0pXoM9bJPM_b3phwj2cK3t1"

export default function RequestFormPage() {
  const [fmsName, setFmsName] = useState("")
  const [payTo, setPayTo] = useState("")
  const [amount, setAmount] = useState("")
  const [remarks, setRemarks] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uniqueNo, setUniqueNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requests, setRequests] = useState<Request[]>([])

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  }

  const uploadFileToGoogleDrive = async (file: File): Promise<string | null> => {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Send as JSON
      const response = await fetch(WEB_APP_URL, {
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
  
  const submitToGoogleSheet = async (rowData: any[]): Promise<boolean> => {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          action: "writeData",
          sheetName: "FMS",
          rowData: rowData,
        }),
      })
      return true
    } catch (error) {
      console.error("❌ Error submitting to Google Sheet:", error)
      return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    if (!fmsName || !payTo || !amount || !uniqueNo) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      let fileUrl = ""
      
      // Upload file first if one is selected
      if (selectedFile) {
        console.log("📤 Uploading file:", selectedFile.name)
        const uploadedUrl = await uploadFileToGoogleDrive(selectedFile)
        if (uploadedUrl) {
          fileUrl = uploadedUrl
          console.log("✅ File URL:", fileUrl)
        } else {
          alert("File upload failed. Continuing without attachment.")
        }
      }

      const timestamp = formatDate(new Date())
      const plannedDate = formatDate(new Date())
      const rowData = [
        timestamp,                   // A - Timestamp
        "",                          // B - AP Payment Number (removed)
        "Pending",                        // C - Status (Always "Pending")
        uniqueNo,                    // D - Unique No
        fmsName,                     // E - FMS Name
        payTo,                       // F - Pay To
        Number.parseFloat(amount),   // G - Amount
        remarks,                     // H - Remarks
        fileUrl,                     // I - Attachment URL
        plannedDate                  // J - Planned Date
      ]

      const success = await submitToGoogleSheet(rowData)

      if (success) {
        const newRequest: Request = {
          id: String(requests.length + 1),
          status: "Pending",
          uniqueNo,
          fmsName,
          payTo,
          amount: Number.parseFloat(amount),
          remarks,
          attachment: fileUrl || undefined,
        }

        setRequests([newRequest, ...requests])

        setFmsName("")
        setPayTo("")
        setAmount("")
        setRemarks("")
        setSelectedFile(null)
        setUniqueNo("")

        toast.success("Request submitted successfully!")
      } else {
        alert("Failed to write data. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Submission failed: " + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    setRequests(requests.filter(req => req.id !== id))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      console.log("📁 File selected:", file.name, "Size:", file.size, "bytes")
    }
  }

  return (
    <div className="space-y-8 p-8">
    <ToastContainer autoClose={3000} />
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Request Form</h1>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Unique No *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={uniqueNo}
                    onChange={(e) => setUniqueNo(e.target.value)}
                    placeholder="Enter unique number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  FMS Name *
                </label>
                <Input
                  value={fmsName}
                  onChange={(e) => setFmsName(e.target.value)}
                  placeholder="Enter FMS Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pay To *</label>
                <Input
                  value={payTo}
                  onChange={(e) => setPayTo(e.target.value)}
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
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
                <label className="block text-sm font-medium mb-2">
                  Attachment
                </label>
                <Input type="file" onChange={handleFileChange} />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
              <Plus size={20} />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </Card>
      </div>

      {/* <div>
        <h2 className="text-xl font-bold mb-4">Submitted Requests</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-muted-foreground"
                    >
                      No requests submitted yet
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            req.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {req.uniqueNo}
                      </td>
                      <td className="px-6 py-4 text-sm">{req.fmsName}</td>
                      <td className="px-6 py-4 text-sm">{req.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ₹{req.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{req.remarks || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {req.attachment ? (
                          <a 
                            href={req.attachment} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-destructive hover:text-destructive/80 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div> */}
    </div>
  )
}