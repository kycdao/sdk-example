import Head from "next/head"
import { useCallback } from "react"
import styles from "../styles/Home.module.css"

export default function Home() {
	const onOpenSDK = useCallback(async () => {
		const { KycDaoClient } = await import("@kycdao/widget")

		new KycDaoClient({
			parent: "#modalroot",
			config: {
				demoMode: false,
				enabledBlockchainNetworks: [
					"PolygonMumbai",
					/*"EthereumGoerli",
					"CeloAlfajores",
					"SolanaDevnet",*/
				],
				enabledVerificationTypes: ["KYC"],
				evmProvider: window.ethereum,
				baseUrl: "https://staging.kycdao.xyz",
				sentryConfiguration: {
					dsn: "https://23dafecec027439b9413cd50eb22567d@o1184096.ingest.sentry.io/4504559638413313",
				},
			},
		}).open()
	}, [])

	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<button
					style={{
						boxShadow: "1px 2px 9px #F4AAB9",
						cursor: "pointer",
						backgroundColor: "white",
						color: "black",
						fontSize: "2em",
						padding: "0.4em",
						borderRadius: "0.1em",
					}}
					onClick={onOpenSDK}>
					Start verification
				</button>
				<div style={{ height: "100vh", width: "100vw" }}>
					<div id="modalroot" />
				</div>
			</main>
		</>
	)
}
