import type { Metadata } from "next";
import BeginningClient from "./BeginningClient";

export const metadata: Metadata = {
  title: "The Beginning | The Order of the Gilt Frame",
};

export default function BeginningPage() {
  return <BeginningClient />;
}
