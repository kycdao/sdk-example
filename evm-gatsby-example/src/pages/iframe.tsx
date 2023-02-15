import React, { useEffect, useRef } from "react"
import { KycDaoClientInterface } from "@kycdao/widget/dist/KycDaoClientCommon"

const IframePage: React.FC = () => {
	const iframeClient = useRef<KycDaoClientInterface>()

	useEffect(() => {
		import("@kycdao/widget").then((module) => {
			iframeClient.current = new module.KycDaoIframeClient({
				parent: "#modalroot",
				iframeOptions: {
					url: "https://sdk.kycdao.xyz/iframe.html",
					messageTargetOrigin: window.origin,
				},
				config: {
					demoMode: true,
					enabledBlockchainNetworks: ["PolygonMumbai"],
					enabledVerificationTypes: ["KYC"],
					evmProvider: "ethereum",
					baseUrl: "https://staging.kycdao.xyz",
					sentryConfiguration: {
						dsn: "https://23dafecec027439b9413cd50eb22567d@o1184096.ingest.sentry.io/4504559638413313",
					},
				},
			})
		})
	}, [])

	return (
		<div>
			<h1>Iframe integration</h1>

			<button onClick={() => iframeClient.current?.open()}>Open modal</button>

			<div id="modalroot" />
		</div>
	)
}

export default IframePage

export const Head = () => <title>Iframe example</title>
