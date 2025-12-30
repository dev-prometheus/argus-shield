# Argus Shield

**Real-time protection against cryptocurrency wallet drainer attacks.**

Argus Shield is an open-source browser extension that intercepts and analyzes signature requests before they reach your wallet, detecting known attack patterns used by drainers like Inferno, Pink, and Angel.

## Features

- **Permit2 Detection** - Blocks PermitBatchTransferFrom and PermitTransferFrom signatures
- **EIP-2612 Protection** - Detects native token permit attacks
- **Approval Analysis** - Warns on suspicious token approvals
- **Blind Sign Block** - Prevents dangerous eth_sign requests
- **Whitelist System** - Pre-configured trusted DeFi protocols
- **Activity Logging** - Track all intercepted requests

## Installation

1. Download the latest release from [Releases](https://github.com/dev-prometheus/argus-shield/releases)
2. Unzip to a folder
3. Open `chrome://extensions` in Chrome/Brave/Edge
4. Enable **Developer mode**
5. Click **Load unpacked** → Select the unzipped folder
6. Verify the Argus icon appears in your toolbar

## Supported Browsers

- Chrome
- Brave
- Edge
- Any Chromium-based browser

## How It Works

Argus hooks into your browser's Web3 provider and analyzes every signature and transaction request in real-time. When a potential threat is detected, you'll see a warning modal with details about the risk before anything reaches your wallet.

## Privacy

Argus Shield operates 100% locally. No data is collected, stored, or transmitted. See our [Privacy Policy](privacy.html) for details.

## Beta Notice

This is a beta release for testing. While Argus provides additional protection, always verify transactions carefully. Report issues on GitHub.

## License

MIT License - Free to use, modify, and distribute.

---

**Built for the Web3 community.**
