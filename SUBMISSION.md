# ATLAS — vibe/vibe submission kit

## Suggested category

Vibecoded/product MVP with an RWA-focused simulation and live testnet data reads. If submitting under RWA, demonstrate the labelled simulation; do not describe indexed tokens as verified real-world assets. Category acceptance and rewards are determined by the platform's review.

## Project description

ATLAS is an RWA-focused intelligence prototype for Robinhood Chain Testnet. Users can explore indexed tokens, connect an EVM wallet to inspect testnet holdings, and view portfolio metrics when indexer prices are available. A separate, wallet-free simulation demonstrates how hypothetical price shocks change a fictional RWA portfolio's value and allocation. The agent prototype saves a concentration rule locally and checks it manually against demo holdings or the latest loaded wallet snapshot.

## 90-second demo walkthrough

1. Open the hosted application. Show the TESTNET MVP label and indexer status.
2. Select **Try the simulation**. Explain that the three baskets are fictional and not deployed tokens.
3. Show the default property shock: -20% changes $10,000 to $9,400, a $600 loss.
4. Select **Entire sample portfolio**, then **+20%**: total becomes $12,000. Show the holdings weights.
5. Open **Agents** (use the menu on mobile). Save an Atlas Guard rule at 40% and choose **Check saved rule** with the demo source. The 50% D-BOND holding reaches the threshold.
6. Change the threshold to 60%, save again, and check: it is below threshold. Reload and show that the rule persists in this browser.
7. Return to Terminal and show the actual testnet registry. Optionally connect your wallet, view Portfolio, open the wallet menu and choose Disconnect. An empty or unpriced wallet is a valid result; never present demo holdings as wallet balances.

## Before submitting

- Push these changes to the repository and deploy the latest commit on Vercel.
- Confirm the public HTTPS URL loads in a signed-out browser and on mobile.
- Record the walkthrough above and include the public demo URL and source repository.
- Read the builder-specific rules in Discord channel 1541735497527853148.
- Complete the platform's launch flow yourself, including agreement acceptance and any wallet approvals. This repository update does not launch a token or submit a project.
- Share the launched project in channel 1544666579898339328. Launch questions go to 1544666860744744990.
- Use only your actual deployment and launch links. No launch address is supplied by this kit.

## Submission fields to complete after deployment

- Name: ATLAS
- Source: https://github.com/solexade/atlas-rwa
- Demo URL: copy your verified Vercel production URL
- Demo video: add the recording URL
- Launch page / contract: add only if created through the required platform flow

## Current limits

Live holdings and registry rely on the public Blockscout indexer; network errors are surfaced with a retry control. The registry currently shows the first page returned by the indexer, not an exhaustive catalogue. Indexer exchange rates can be missing. Atlas Score is a deterministic heuristic; its data-confidence component reflects indexed availability, not independent verification, and holder count is only a liquidity proxy. The map only displays verified coordinates when supplied; the current live normalizer does not provide them. The fictional simulation does not model fees, yields, redemptions or slippage. Rules are stored in one browser and run only when requested, against loaded data; there is no background service, AI model, trading, token deployment or token gating. Testnet assets have no monetary value.

## Suggested progress post

Building ATLAS for the vibe/vibe testnet: an RWA-focused dashboard with live testnet wallet reads and a clearly labelled, wallet-free simulation. Change a hypothetical price, inspect the portfolio impact, and test a saved concentration rule. Built for Robinhood Chain Testnet. Demo: [insert verified public URL]. Feedback welcome.
