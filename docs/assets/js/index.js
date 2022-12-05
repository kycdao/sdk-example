/// <reference path="../../../types.d.ts" />

/*
    TODO:
    - nicer "callback handling" for post-redirect back from NEAR wallet
    - add handling delayed verification result (eg. KYB approval/rejection can take many days)
    - either remove types (to have a clean JS only version) or sync/use types from the SDK package
    - add minting step
*/

const disableFormInputs = ({ form, disable = true, ignoreIds = [] }) => {
  if (form instanceof HTMLFormElement) {
    for (const elem of form.elements) {
      if (!ignoreIds.includes(elem.id)) {
        disable ? (elem.disabled = true) : elem.removeAttribute("disabled");
      }
    }
  }
};

const getKycDaoApiStatus = async () => {
  const status = await window.kycDao.getServerStatus();

  const elem = document.getElementById("api-status");
  elem.innerHTML = `Connection to <b>${status.serverBaseUrl}</b> is <b>${
    status.isOk ? "OK" : "not OK"
  }</b> - Status message: ${status.apiStatus}`;
};

const residencyOptionsSetup = () => {
  const taxResidencyPicker = document.getElementById("tax-residency");

  for (const country of kycDaoSdk.COUNTRIES) {
    const option = document.createElement("option");
    option.text = country.name;
    option.value = country.iso_cca2;
    taxResidencyPicker.add(option);
  }
};

const networkOptionsSetup = () => {
  const networkPicker = document.getElementById("nft-check-network");

  for (const network of kycDaoStatus.availableBlockchainNetworks) {
    const option = document.createElement("option");
    option.text = network;
    option.value = network;
    networkPicker.add(option);
  }
};

const kycNftCheckSetup = () => {
  const form = document.getElementById("nft-check-form");
  const status = document.getElementById("kycnft-status");
  const button = document.getElementById("kycnft-check");

  status.innerHTML = "Unknown";

  button.addEventListener("click", async () => {
    const netwrok = form["nft-check-network"]?.value;
    const address = form["nft-check-address"]?.value;

    if (netwrok && address) {
      const options = {
        networkAndAddress: {
          blockchainNetwork: netwrok,
          address: address,
        },
      };

      try {
        const hasValidKycNft = await kycDao.hasValidNft("KYC", options);
        const networkVerifications = await kycDao.checkVerifiedNetworks(
          "KYC",
          options
        );
        console.log(networkVerifications);
        if (hasValidKycNft) {
          status.innerHTML = "Wallet has a valid kycNFT";
        } else {
          status.innerHTML = "Wallet does not have a valid kycNFT";
        }
      } catch (e) {
        status.innerHTML =
          typeof e === "string" ? e : e?.message || "Unknown error";
      }
    } else {
      status.innerHTML = "Please select a network and set an address.";
    }
  });
};

const walletChanged = new Event("walletChanged");
const loginStatusChanged = new Event("loginStatusChanged");
const userDataChanged = new Event("userDataChanged");

const updateWalletConnectionElements = () => {
  const evmStatus = document.getElementById("evm-status");
  const nearStatus = document.getElementById("near-status");
  const solanaStatus = document.getElementById("solana-status");
  const walletStatus = document.getElementById("wallet-status");
  const evmButton = document.getElementById("evm-login");
  const nearButton = document.getElementById("near-login");
  const solanaButton = document.getElementById("solana-login");
  const logoutButton = document.getElementById("wallet-logout");

  const evmProviderConfigured = kycDaoStatus.evmProviderConfigured;
  evmStatus.innerHTML = evmProviderConfigured
    ? "EVM provider is configured"
    : "EVM provider not configured";
  if (!evmProviderConfigured) {
    evmButton.disabled = true;
    evmButton.title = "EVM provider not configured";
  }

  const nearNetwork = kycDaoStatus.nearNetworkConnected;
  nearStatus.innerHTML = nearNetwork
    ? `Configured for ${nearNetwork}`
    : "NEAR SDK is not configured";
  if (!nearNetwork) {
    nearButton.disabled = true;
    nearButton.title = "NEAR SDK is not configured";
  }

  const solanaNetwork = kycDaoStatus.solanaNetworkConnected;
  solanaStatus.innerHTML = solanaNetwork
    ? `Configured for ${solanaNetwork}`
    : "Solana support is not enabled";
  if (!solanaNetwork) {
    solanaButton.disabled = true;
    solanaButton.title = "Solana support is not enabled";
  }

  if (!kycDao.walletConnected) {
    walletStatus.innerHTML = "Not connected";
    logoutButton.disabled = true;
    logoutButton.title = "Wallet not connected";

    if (nearNetwork) {
      nearButton.removeAttribute("disabled");
      nearButton.title = "";
    }
  } else {
    walletStatus.innerHTML = `${kycDao.connectedWallet.blockchain} - ${kycDao.connectedWallet.blockchainNetwork} - ${kycDao.connectedWallet.address}`;

    switch (kycDao.connectedWallet.blockchain) {
      case "Near":
        nearButton.disabled = true;
        nearButton.title = "NEAR wallet already connected";

        logoutButton.removeAttribute("disabled");
        logoutButton.title = "";
        break;
      case "Ethereum":
        logoutButton.disabled = true;
        logoutButton.title = "Not available for EVM wallets";
        break;
      case "Solana":
        logoutButton.removeAttribute("disabled");
        logoutButton.title = "";
        break;
    }
  }
};

const walletConnectionSetup = () => {
  const walletStatus = document.getElementById("wallet-status");
  const evmButton = document.getElementById("evm-login");
  const nearButton = document.getElementById("near-login");
  const solanaButton = document.getElementById("solana-login");
  const logoutButton = document.getElementById("wallet-logout");

  evmButton.addEventListener("click", async () => {
    try {
      await kycDao.connectWallet("Ethereum");
      document.dispatchEvent(walletChanged);
      document.dispatchEvent(loginStatusChanged);
    } catch (e) {
      walletStatus.innerHTML = e;
    }
  });

  nearButton.addEventListener("click", async () => {
    try {
      await kycDao.connectWallet("Near");
      document.dispatchEvent(walletChanged);
      document.dispatchEvent(loginStatusChanged);
    } catch (e) {
      walletStatus.innerHTML = e;
    }
  });

  solanaButton.addEventListener("click", async () => {
    try {
      await kycDao.connectWallet("Solana");
      document.dispatchEvent(walletChanged);
      document.dispatchEvent(loginStatusChanged);
    } catch (e) {
      walletStatus.innerHTML = e;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await kycDao.disconnectWallet();
      document.dispatchEvent(walletChanged);
      document.dispatchEvent(loginStatusChanged);
    } catch (e) {
      walletStatus.innerHTML = e;
    }
  });

  updateWalletConnectionElements();
};

const updateKycDaoLoginElements = () => {
  const status = document.getElementById("kycdao-status");
  const button = document.getElementById("kycdao-login");

  if (!kycDao.loggedIn) {
    status.innerHTML = "Not logged in";
  } else {
    const connectedWallet = `${kycDao.connectedWallet.blockchain} - ${kycDao.connectedWallet.address}`;
    status.innerHTML = `User logged in with wallet: ${connectedWallet}`;
  }

  if (!kycDao.walletConnected) {
    button.disabled = true;
    button.title = "No wallet connected";
  } else {
    button.removeAttribute("disabled");
    button.title = "";
  }
};

const kycDaoLoginSetup = () => {
  const status = document.getElementById("kycdao-status");
  const button = document.getElementById("kycdao-login");

  button.addEventListener("click", async () => {
    try {
      await kycDao.registerOrLogin();
      document.dispatchEvent(loginStatusChanged);
      const connectedWallet = `${kycDao.connectedWallet.blockchain} - ${kycDao.connectedWallet.address}`;
      status.innerHTML = `User logged in with wallet: ${connectedWallet}`;
    } catch (e) {
      status.innerHTML = e;
    }
  });

  updateKycDaoLoginElements();
};

const checkEmailConfrimed = async () => {
  const activeEmail = document.getElementById("active-email");
  const emailStatus = document.getElementById("email-status");
  const emailResendStatus = document.getElementById("email-resend-status");

  try {
    const emailData = await kycDao.checkEmailConfirmed();

    activeEmail.innerHTML = emailData.address || "None";
    emailResendStatus.innerHTML = "";

    if (emailData.isConfirmed) {
      emailStatus.innerHTML = "Email address is confirmed";
    } else {
      emailStatus.innerHTML = "Email address is not confirmed yet";
    }
  } catch (e) {
    activeEmail.innerHTML = e;
    emailStatus.innerHTML = e;
  }
};

const updateEmailVerificationElements = async () => {
  const activeEmail = document.getElementById("active-email");
  const emailStatus = document.getElementById("email-status");
  const checkEmailButton = document.getElementById("check-email");
  const resendEmailButton = document.getElementById("resend-email");
  const emailResendStatus = document.getElementById("email-resend-status");

  const form = document.getElementById("email-verification-form");
  const submitUpdateEmail = document.getElementById("submit-update-email");
  const updateEmailStatus = document.getElementById("update-email-status");

  emailResendStatus.innerHTML = "";

  if (!kycDao.loggedIn) {
    disableFormInputs({ form });
    activeEmail.innerHTML = "User login required";
    emailStatus.innerHTML = "User login required";
    updateEmailStatus.innerHTML = "User login required";
    checkEmailButton.title = "User login required";
    resendEmailButton.title = "User login required";
    submitUpdateEmail.title = "User login required";
  } else {
    disableFormInputs({ form, disable: false });
    updateEmailStatus.innerHTML = "";
    checkEmailButton.title = "";
    resendEmailButton.title = "";
    submitUpdateEmail.title = "";
    await checkEmailConfrimed();
  }
};

const emailVerificationSetup = () => {
  const checkEmailButton = document.getElementById("check-email");
  const resendEmailButton = document.getElementById("resend-email");
  const emailResendStatus = document.getElementById("email-resend-status");

  const form = document.getElementById("email-verification-form");
  const submitUpdateEmail = document.getElementById("submit-update-email");
  const updateEmailStatus = document.getElementById("update-email-status");

  checkEmailButton.addEventListener("click", async () => checkEmailConfrimed());

  resendEmailButton.addEventListener("click", async () => {
    try {
      await kycDao.resendEmailConfirmationCode();
      emailResendStatus.innerHTML = "Email successfully sent";
    } catch (e) {
      emailResendStatus.innerHTML = e;
    }
  });

  submitUpdateEmail.addEventListener("click", async () => {
    try {
      const email = form["update-email"]?.value;
      if (email.trim()) {
        await kycDao.updateEmail(email);
        document.dispatchEvent(userDataChanged);
        updateEmailStatus.innerHTML = "Successful";
      } else {
        updateEmailStatus.innerHTML = "Please enter an email address";
      }
    } catch (e) {
      updateEmailStatus.innerHTML = e;
    }
  });

  updateEmailVerificationElements();
};

const updateConnectedKycNftCheckElements = () => {
  const status = document.getElementById("connected-kycnft-status");
  const button = document.getElementById("connected-kycnft-check");

  status.innerHTML = "Unknown";

  if (!kycDao.walletConnected) {
    button.disabled = true;
    button.title = "No wallet connected";
  } else {
    button.removeAttribute("disabled");
    button.title = "";
  }
};

const connectedKycNftCheckSetup = () => {
  const status = document.getElementById("connected-kycnft-status");
  const button = document.getElementById("connected-kycnft-check");

  button.addEventListener("click", async () => {
    try {
      const hasValidKycNft = await kycDao.hasValidNft("KYC");
      if (hasValidKycNft) {
        status.innerHTML = "Connected wallet has a valid kycNFT";
      } else {
        status.innerHTML = "Connected wallet does not have a valid kycNFT";
      }
    } catch (e) {
      status.innerHTML =
        typeof e === "string" ? e : e?.message || "Unknown error";
    }
  });

  updateConnectedKycNftCheckElements();
};

const updateVerificationElements = () => {
  const form = document.getElementById("verification-form");
  const status = document.getElementById("verification-status");

  if (!kycDao.loggedIn) {
    disableFormInputs({ form, ignoreIds: ["verification-status-check"] });
  } else {
    disableFormInputs({
      form,
      disable: false,
      ignoreIds: ["verification-status-check"],
    });
  }

  status.innerHTML = "Not started";
};

const pollVerificationStatus = async ({
  verificationType,
  interval = 1000,
  maxAttempts = 10,
}) => {
  if (!verificationType) {
    throw new Error(
      "pollVerificationStatus error: verificationType must be specified"
    );
  }

  let attempts = 0;

  const executePoll = async (resolve, reject) => {
    const result = await kycDao.checkVerificationStatus();
    attempts++;

    if (result[verificationType] === true) {
      return resolve(true);
    } else if (attempts === maxAttempts) {
      return resolve(false);
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};

let verificationTypeForCheck;

const verificationSetup = () => {
  const submitButton = document.getElementById("submit-verification-data");
  const checkButton = document.getElementById("verification-status-check");
  const status = document.getElementById("verification-status");
  const spinner = document.getElementById("verification-spinner");
  const form = document.getElementById("verification-form");

  checkButton.disabled = true;

  const checkVerificationStatus = async (verificationType) => {
    disableFormInputs({ form });
    status.innerHTML = "Verification pending confirmation, please wait";
    submitButton.innerHTML = "Start verification";
    spinner.classList.remove("hidden");

    verificationTypeForCheck = verificationType;

    const interval = 1000;
    const maxAttempts = 10;
    const gotVerified = await pollVerificationStatus({
      verificationType: verificationTypeForCheck,
      interval,
      maxAttempts,
    });

    if (gotVerified) {
      status.innerHTML = `User verification confirmed for type "${verificationTypeForCheck}"`;
    } else {
      status.innerHTML = `Could not confirm verification in ${
        (interval * maxAttempts) / 1000
      } seconds, please try again`;
      checkButton.removeAttribute("disabled");
    }
    spinner.classList.add("hidden");
    disableFormInputs({ form, disable: false });
  };

  submitButton.addEventListener("click", async () => {
    verificationTypeForCheck = undefined;
    checkButton.disabled = true;
    status.innerHTML = "Verification started";

    const verificationData = {
      email: form["email"]?.value,
      isEmailConfirmed: form["email-verified"]?.checked,
      taxResidency: form["tax-residency"]?.value,
      isLegalEntity: form["legal-entity"]?.checked,
      verificationType: form["verification-type"]?.value,
      termsAccepted: form["terms-accepted"]?.checked,
    };

    try {
      const options = {
        personaOptions: {
          onCancel: () => {
            disableFormInputs({ form, ignoreIds: [submitButton.id] });
            status.innerHTML = "Persona verification flow interrupted";
            submitButton.innerHTML = "Continue verification";
          },
          onComplete: async () =>
            await checkVerificationStatus(verificationData.verificationType),
          onError: (error) => {
            status.innerHTML = `Persona verification error: ${error}`;
            submitButton.innerHTML = "Start verification";
          },
        },
      };
      await kycDao.startVerification(verificationData, options);
      document.dispatchEvent(userDataChanged);
    } catch (e) {
      status.innerHTML =
        typeof e === "string" ? e : e?.message || "Unknown error";
    }
  });

  checkButton.addEventListener("click", async () => {
    if (verificationTypeForCheck) {
      await checkVerificationStatus(verificationTypeForCheck);
    }
  });

  updateVerificationElements();
};

const updateMintingElements = async () => {
  const form = document.getElementById("minting-form");
  const placeholder = document.getElementById("nft-image-placeholder");
  const imageSpan = document.getElementById("nft-images");

  const getHtml = (imageId, url, index) => {
    return `      
      <input type="radio" name="nft-image" id="nft-image-${index}" value="${imageId}" />
      <label for="nft-image-${index}">
        <img src="${url}" />
      </label>
    `;
  };

  if (!kycDao.loggedIn) {
    disableFormInputs({ form });
    imageSpan.classList.add("hidden");
    placeholder.classList.remove("hidden");
  } else {
    const imageOptions = await kycDao.getNftImageOptions();
    imageSpan.classList.add("hidden");
    imageSpan.innerHTML = "";
    Object.entries(imageOptions).forEach(([imageId, url], index) => {
      imageSpan.insertAdjacentHTML(
        "beforeend",
        getHtml(imageId, url, index + 1)
      );
    });
    placeholder.classList.add("hidden");
    imageSpan.classList.remove("hidden");

    let ignoreIds = [];

    if (kycDao.subscribed) {
      ignoreIds.push('sub-years');
      form['sub-years'].placeholder = 'User already subscribed';
    } else {
      form['sub-years'].placeholder = 'e.g. 1, 2, 3';      
    }

    // TODO if verified
    if (true) {
      disableFormInputs({
        form,
        disable: false,
        ignoreIds,
      });
    }
  }
};

const mintingOptionsSetup = () => {
  const regenerateButton = document.getElementById("regenerate-nft-image");
  const mintButton = document.getElementById("start-minting");
  const status = document.getElementById("minting-status");
  const spinner = document.getElementById("minting-spinner");
  const form = document.getElementById("minting-form");

  regenerateButton.addEventListener("click", async () => {
    await kycDao.regenerateNftImageOptions();
    await updateMintingElements();
  });

  mintButton.addEventListener("click", async () => {
    const subYears = form["sub-years"]?.value;
    if (!kycDao.subscribed && (isNaN(subYears) || subYears < 1)) {
      status.innerHTML = "Please enter a number greater than 0 for subscription years";
      return;
    }

    mintButton.disabled = true;
    spinner.classList.remove("hidden");
    status.innerHTML = "Minting started";

    let imageId = form["nft-image"]?.value;

    if (imageId) {
      const mintingData = {
        disclaimerAccepted: form["disclaimer-accepted"]?.checked,
        imageId,
        subscriptionYears: kycDao.subscribed ? undefined : subYears,
      };

      try {
        await kycDao.startMinting(mintingData);
        status.innerHTML = "Minting successful";
      } catch (e) {
        status.innerHTML = e;
      }
    } else {
      status.innerHTML = "Please select an NFT image";
    }

    spinner.classList.add("hidden");
    mintButton.removeAttribute("disabled");
  });

  updateMintingElements();
};

const updateElementsOnWalletChange = () => {
  updateWalletConnectionElements();
  updateKycDaoLoginElements();
  updateConnectedKycNftCheckElements();
};

const updateElementsOnLoginStatusChange = () => {
  updateEmailVerificationElements();
  updateVerificationElements();
  updateMintingElements();
};

const updateElementsOnUserDataChange = () => {
  updateEmailVerificationElements();
};

const main = () => {
  (async () => {
    // add tax residency picker country options
    residencyOptionsSetup();

    const kycDaoConfig = {
      baseUrl: "https://staging.kycdao.xyz",
      enabledBlockchainNetworks: [
        "NearTestnet",
        "PolygonMumbai",
        "EthereumGoerli",
        "SolanaDevnet",
      ],
      enabledVerificationTypes: ["KYC"],
      demoMode: true,
      evmProvider: window.ethereum,
    };

    const sdkStatus = document.getElementById("sdk-status");
    const sdkInitError = document.getElementById("init-error");
    const sdkInitSpinner = document.getElementById("init-spinner");
    const sdkRedirEvent = document.getElementById("redirect-event");
    try {
      const kycDaoInitResult = await kycDaoSdk.init(kycDaoConfig);
      window.kycDao = kycDaoInitResult.kycDao;
      window.kycDaoRedirectEvent = kycDaoInitResult.redirectEvent;
      window.kycDaoStatus = kycDaoInitResult.sdkStatus;
      sdkStatus.innerHTML = "Initialized";
      sdkRedirEvent.innerHTML = kycDaoRedirectEvent
        ? kycDaoRedirectEvent.toString()
        : "None";
    } catch (e) {
      sdkStatus.innerHTML = "Failed to initialize";
      sdkInitError.innerHTML = e.toString();
      sdkInitSpinner.classList.remove("hidden");
      console.error(`kycDAO SDK initialization error: ${e}`);
    }
    sdkInitSpinner.classList.add("hidden");

    networkOptionsSetup();

    // Check initialized API status
    await getKycDaoApiStatus();
    document
      .getElementById("check-api-status")
      .addEventListener("click", getKycDaoApiStatus);

    // Check if a wallet has a valid kycDAO NFT (on-chain)
    kycNftCheckSetup();

    // web3 login
    walletConnectionSetup();

    // Check if the connected wallet has a valid kycDAO NFT (on-chain)
    connectedKycNftCheckSetup();

    // kycDAO login
    kycDaoLoginSetup();

    // email verification
    emailVerificationSetup();

    // Identity verification
    verificationSetup();

    // mint kycNFT
    mintingOptionsSetup();
  })();
};

document.addEventListener("walletChanged", updateElementsOnWalletChange);
document.addEventListener(
  "loginStatusChanged",
  updateElementsOnLoginStatusChange
);
document.addEventListener("userDataChanged", updateElementsOnUserDataChange);
document.addEventListener("DOMContentLoaded", main);
