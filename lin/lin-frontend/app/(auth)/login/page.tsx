"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { loginStep1Schema, loginOtpSchema, type LoginStep1Form, type LoginOtpForm } from "@/lib/login-schemas"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpResendTimer, setOtpResendTimer] = useState(13)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const router = useRouter()

  const step1Form = useForm<LoginStep1Form>({
    resolver: zodResolver(loginStep1Schema),
    defaultValues: {
      phoneNumber: "",
      dateOfBirth: ""
    }
  })

  const otpForm = useForm<LoginOtpForm>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: {
      otp: ""
    }
  })

  useEffect(() => {
    if (step === 2 && otpResendTimer > 0) {
      const timer = setInterval(() => {
        setOtpResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, otpResendTimer])

  const handleStep1Submit = async (data: LoginStep1Form) => {
    setPhoneNumber(data.phoneNumber)
    // TODO: API call to send OTP
    console.log("Sending OTP to:", data.phoneNumber)
    setStep(2)
    setOtpResendTimer(13)
  }

  const handleOtpSubmit = async (data: LoginOtpForm) => {
    setOtpError("")
    setIsVerifying(true)

    try {
      // TODO: API call to verify OTP
      console.log("Verifying OTP:", data.otp)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate OTP verification
      if (data.otp === "123456") {
        setStep(3)
        // Redirect after showing success
        setTimeout(() => {
          // window.location.href = "/profile"
          router.push("/dashboard")
        }, 2000)
      } else {
        setOtpError("Wrong OTP!!")
      }
    } catch (error) {
      setOtpError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = () => {
    if (otpResendTimer > 0) return // Prevent resend if timer is still running
    
    setOtpResendTimer(13)
    setOtpError("")
    setOtpValue("")
    otpForm.setValue("otp", "")
    // TODO: API call to resend OTP
    console.log("Resending OTP to:", phoneNumber)
  }

  const handleBackToStep1 = () => {
    setStep(1)
    setOtpError("")
    setOtpValue("")
    otpForm.reset()
  }

  const handleOtpChange = (value: string) => {
    setOtpValue(value)
    otpForm.setValue("otp", value)
    setOtpError("") // Clear error when user types
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Panel - Branding */}
        <div className="flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-12">
              <Link href="/">
                <Image src="/lin-logo.png" alt="Loan In Need" width={120} height={40} />
              </Link>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Because Life Can't Wait —<br />
              We're Here to Help
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-12">
              From emergencies to everyday needs, get quick financial support with a process that truly cares about you.
            </p>

            {/* Coin Illustration */}
            <div className="flex justify-start">
              <Image 
                src="/login-money.png" 
                alt="Coins illustration" 
                width={200} 
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="bg-white flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md mx-auto w-full">
            {/* Step 1: Phone & DOB */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome <span className="text-red-600">Back</span>
                  </h2>
                  <p className="text-gray-600 text-sm">Login to your account</p>
                </div>

                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter registered mobile number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +91
                      </span>
                      <Input
                        {...step1Form.register("phoneNumber")}
                        type="tel"
                        placeholder=""
                        className="rounded-l-none h-12"
                        maxLength={10}
                      />
                    </div>
                    {step1Form.formState.errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your date of birth
                    </label>
                    <Input
                      {...step1Form.register("dateOfBirth")}
                      type="date"
                      placeholder="DD/MM/YYYY"
                      className="h-12"
                    />
                    {step1Form.formState.errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="consent"
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-red-600 hover:underline">privacy policies</a>{" "}
                      and{" "}
                      <a href="#" className="text-red-600 hover:underline">T&C</a>.
                      You also authorize us to{" "}
                      <a href="#" className="text-red-600 hover:underline">retrieve</a>{" "}
                      & communicate with you via phone, e-mails, WhatsApp, etc.
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
                  >
                    Get OTP
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Didn't have an account?{" "}
                      <Link href="/signup" className="text-red-600 hover:underline font-medium">
                        Create now
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <button
                  onClick={handleBackToStep1}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </button>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    <span className="text-red-600">Verify</span> mobile number
                  </h2>
                  <p className="text-gray-600 text-sm mb-1">
                    OTP sent on XXXXXXX{phoneNumber.slice(-4)}
                  </p>
                  <div className="text-sm">
                    {otpResendTimer > 0 ? (
                      <p className="text-gray-600">
                        Resend OTP in {otpResendTimer}sec
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter OTP
                    </label>
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={handleOtpChange}
                      className="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {otpError && (
                      <p className="text-red-500 text-sm mt-2">{otpError}</p>
                    )}
                    {otpForm.formState.errors.otp && (
                      <p className="text-red-500 text-sm mt-2">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    <span className="text-red-600">Verification</span> successful
                  </h2>
                  <p className="text-gray-600 text-sm">You are redirecting to dashboard</p>
                </div>

                <div className="flex justify-center py-8">
                  <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
