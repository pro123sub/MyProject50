import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface UseCaseHeroProps {
  loanType: string;
  loanDesc: React.ReactNode;
  heroImg?: string;
}

const UseCaseHero: React.FC<UseCaseHeroProps> = ({
  loanType,
  loanDesc,
  heroImg,
}) => {
  return (
    <section className="font-sans items-center justify-between gap-16 flex flex-col md:flex-row w-full md:mt-12 mt-24 max-w-7xl mx-auto py-4 p-4 md:p-12 lg:p-20">
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-medium">
                {loanType} Loan
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="space-y-2">
          <h2 className="lg:text-5xl text-3xl font-bold leading-snug">
            Instant Short Term personal loans for{" "}
            <span className="text-primary">{loanType}</span>
          </h2>
        </div>
        <p className="text-lg text-gray-600 leading-tight">{loanDesc}</p>
        <p className="font-semibold">Loan Range: ₹INR 5,000 to INR 1,00,000</p>
        <Link href="/apply-now">
          <Button size="lg" className="text-base my-3">
            Apply now
          </Button>
        </Link>
      </div>
      <Image
        src={heroImg || "/Graphic-min.png"}
        alt="Hero Image"
        width={300}
        height={300}
        className="ml-8 w-8/12 h-full object-cover md:block md:w-1/2"
      />
    </section>
  );
};

export default UseCaseHero;
