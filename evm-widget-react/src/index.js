import React from "react"
import ReactDOM from "react-dom/client"
import { KycDaoWidget } from "@kycdao/widget"

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
	<React.StrictMode>
		<div className="App">
			<KycDaoWidget
				config={{
					enabledBlockchainNetworks: ["PolygonMumbai"],
					enabledVerificationTypes: ["KYC"],
					baseUrl: "https://staging.kycdao.xyz",
					demoMode: true,
					evmProvider: window.ethereum,
					sentryConfiguration: {
						dsn: "https://23dafecec027439b9413cd50eb22567d@o1184096.ingest.sentry.io/4504559638413313",
					},
				}}
			/>
		</div>
	</React.StrictMode>
)
