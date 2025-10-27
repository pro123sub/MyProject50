"use client"

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { phoneNumberSchema, otpVerificationSchema, type PhoneVerificationForm } from "@/lib/signup-schemas"

interface Step1Props {
  onSubmit: (data: PhoneVerificationForm) => void
  otpSent: boolean
  resendTimer: number
  onResend: () => void
  formData: PhoneVerificationForm
  setFormData: (data: PhoneVerificationForm) => void
}

export function Step1PhoneVerification({ 
  onSubmit, 
  otpSent, 
  resendTimer, 
  onResend, 
  formData, 
  setFormData 
}: Step1Props) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PhoneVerificationForm>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: formData
  })

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const phoneNumber = watch("phoneNumber")

  const handleFormSubmit = (data: PhoneVerificationForm) => {
    // Depending on whether OTP is sent, call backend to request or verify
    setServerError(null)
    setFormData(data)
    if (!otpSent) {
      // Request OTP from backend
      requestOtp(data.phoneNumber)
    } else {
      // Verify OTP
      verifyOtp(data.phoneNumber, data.otp || "")
    }
  }

  const handleOtpChange = (value: string) => {
    setValue("otp", value)
    setFormData({ ...formData, otp: value })
  }

  const handleResendClick = () => {
    if (resendTimer > 0) return // Prevent click if timer is running
    // Call backend to resend OTP then start timer via parent
    if (phoneNumber) {
      requestOtp(phoneNumber)
    } else {
      onResend()
    }
  }

  // --- Backend integration ---
  const { requestPhoneOtp, verifyPhoneOtp } = require('@/lib/api/auth') as typeof import('@/lib/api/auth')
  const router = useRouter()

  async function requestOtp(phoneNumberValue: string) {
    // Optimistic UX: redirect immediately to the verify page and let that page
    // request the OTP from the backend on mount. Store lastRequestedPhone so
    // the verify page can recover the phone value.
    setServerError(null)
    try {
      setLoading(true)
      try { sessionStorage.setItem('lastRequestedPhone', phoneNumberValue) } catch (e) {}
  router.push(`/verify?phone=${encodeURIComponent(phoneNumberValue)}`)
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(phoneNumberValue: string, otpValue: string) {
    try {
      setLoading(true)
      const phone = `+91${phoneNumberValue}`
      const res = await verifyPhoneOtp(phone, otpValue)
      // store token locally for subsequent steps
      if (res && res.token) {
        try { localStorage.setItem('authToken', res.token) } catch (e) { /* ignore */ }
      }
      // let parent advance to next step
      onSubmit({ phoneNumber: phoneNumberValue, otp: otpValue })
    } catch (err: any) {
      setServerError(err?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter your mobile number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
              +91
            </span>
            <Input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Enter your mobile number"
              className="rounded-l-none h-12 text-base"
              maxLength={10}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-2">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent"
            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-red-600 hover:underline font-medium">privacy policies</a>{" "}
            and{" "}
            <a href="#" className="text-red-600 hover:underline font-medium">T&C</a>.
            You also authorize us to{" "}
            <a href="#" className="text-red-600 hover:underline font-medium">retrieve your credit report</a>{" "}
            & communicate with you via phone, e-mails, WhatsApp, etc.
          </label>
        </div>

        {serverError && <p className="text-red-500 text-sm mt-2">{serverError}</p>}

        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-medium">
          {loading ? 'Requesting...' : 'Get OTP'}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-red-600 hover:underline text-sm font-medium">
            Already have an account? Login
          </a>
        </div>
      </div>
    </form>
  )
}
