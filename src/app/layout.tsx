import "@/styles/globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "Kitsune",
	description: "Collaborative AI GitHub Desktop",
	icons: [{ rel: "icon", url: "/logo-light.svg" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
				<body>
					<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
						<TRPCReactProvider>{children}</TRPCReactProvider>
						<Toaster />
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
