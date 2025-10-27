"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { verifyPhoneOtp, requestPhoneOtp } from '@/lib/api/auth'

export default function VerifyPage() {
  const search = useSearchParams()
  const router = useRouter()
  const phoneParam = search.get('phone') || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Determine phone number from query param first, otherwise fall back
    // to sessionStorage (set by the previous page). Then, if we haven't
    // already requested an OTP for this phone, request one now.
    let phone = phoneParam
    if (!phone) {
      try {
        const last = sessionStorage.getItem('lastRequestedPhone') || ''
        if (last) {
          phone = last
          // update URL to include phone for clarity (without reload)
          router.replace(`/auth/verify?phone=${encodeURIComponent(last)}`)
        }
      } catch (e) {
        // ignore sessionStorage errors
      }
    }

    if (!phone) return

    const otpRequestedKey = `otpRequestedFor:${phone}`
    try {
      const already = sessionStorage.getItem(otpRequestedKey)
      if (!already) {
        // request OTP from backend and mark it requested so we don't double-send
        ;(async () => {
          try {
            setLoading(true)
            const full = `+91${phone}`
            await requestPhoneOtp(full)
            try { sessionStorage.setItem(otpRequestedKey, '1') } catch (e) {}
            setError('OTP sent — please check your phone')
          } catch (err: any) {
            setError(err?.message || 'Failed to send OTP')
          } finally {
            setLoading(false)
          }
        })()
      }
    } catch (e) {
      // ignore sessionStorage errors
    }
  }, [phoneParam, router])

  async function handleVerify() {
    setError(null)
    try {
      setLoading(true)
      const phone = `+91${phoneParam}`
      const res = await verifyPhoneOtp(phone, otp)
      if (res && res.token) {
        try { localStorage.setItem('authToken', res.token) } catch (e) {}
      }
      // After successful verify, redirect to signup and set step=2
      router.push(`/auth/signup?step=2&phone=${encodeURIComponent(phoneParam)}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    try {
      setLoading(true)
      const phone = `+91${phoneParam}`
      await requestPhoneOtp(phone)
      // keep user on the same page; show a small message
      setError('OTP resent — please check your phone')
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
      <p className="text-sm text-gray-600 mb-4">Enter the OTP sent to +91 {phoneParam}</p>

      <div className="mb-4">
        <InputOTP value={otp} onChange={setOtp} maxLength={6} className="justify-center">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex space-x-3">
        <Button onClick={handleVerify} disabled={loading} className="flex-1 bg-red-600">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
        <Button onClick={handleResend} disabled={loading} variant="secondary">
          Resend
        </Button>
      </div>
    </div>
  )
}
