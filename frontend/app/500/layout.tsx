import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Server Error | Ottawa 3D Printing - Maple Leaf 3D",
  description: "We're experiencing technical difficulties. Our Ottawa 3D printing services remain available - please try again later or contact us for assistance.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mapleleaf3d.ca/500",
  }
};

export default function ServerErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
