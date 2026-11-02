# TMRX Global --- Development Todo List

> **Goal:** Build TMRX Global into a reliable cryptocurrency platform
> with live market data, user accounts, wallets, simulated trading, and
> transaction history.
>
> **Stack:** React · Node.js · Express · MongoDB · Bybit API · Tailwind
> CSS\
> **Currency focus:** Nigerian naira (₦)

## Current development focus

The immediate priority is to stabilize the live market system. The Bybit
WebSocket connection is working, but frequent market updates have been
slowing down the trade form.

-   [ ] Fix the trade form slowdown when market prices update.
-   [ ] Separate live market state from trade-form state.
-   [ ] Prevent unnecessary React re-renders.
-   [ ] Complete reliable backend-to-frontend market broadcasting with
    Socket.IO.

------------------------------------------------------------------------

## Phase 1 --- Complete the live market system

-   [ ] Optimize market updates to prevent unnecessary React re-renders.
-   [ ] Fix the trade form slowing down when market prices update.
-   [ ] Implement subscriptions for all supported coins.
-   [ ] Implement efficient WebSocket connection management.
-   [ ] Add automatic reconnection when the connection drops.
-   [ ] Broadcast backend market updates to React using Socket.IO.
-   [ ] Install and configure `socket.io` and `socket.io-client`.
-   [ ] Ensure market prices update without refreshing the page.
-   [ ] Implement alphabetical sorting of available coins.
-   [ ] Implement coin search functionality.
-   [ ] Add market price change percentages.
-   [ ] Display 24-hour high, low, and trading volume.

## Phase 2 --- Currency conversion and market accuracy

-   [ ] Complete automatic USD-to-NGN conversion.
-   [ ] Ensure all displayed prices use Nigerian naira (₦).
-   [ ] Implement a consistent exchange-rate source.
-   [ ] Handle exchange-rate updates.
-   [ ] Ensure converted prices update correctly when market prices
    change.
-   [ ] Handle unavailable or invalid market prices.
-   [ ] Use sufficient precision internally for calculations.
-   [ ] Format displayed NGN values consistently.

## Phase 3 --- Authentication and user accounts

-   [ ] Complete user registration and login.
-   [ ] Implement secure password hashing.
-   [ ] Implement JWT authentication.
-   [ ] Add protected frontend routes.
-   [ ] Implement logout.
-   [ ] Implement persistent login sessions.
-   [ ] Add user profile management.
-   [ ] Add password change functionality.
-   [ ] Implement password recovery.
-   [ ] Add proper form validation and error handling.

## Phase 4 --- Wallet system

-   [ ] Create the wallet MongoDB model.
-   [ ] Implement wallet creation for new users.
-   [ ] Support multiple cryptocurrency balances.
-   [ ] Implement an NGN wallet balance.
-   [ ] Build wallet balance retrieval endpoints.
-   [ ] Implement wallet transaction history.
-   [ ] Add deposit functionality.
-   [ ] Add withdrawal functionality.
-   [ ] Implement transaction reference generation.
-   [ ] Prevent duplicate transactions.
-   [ ] Implement secure, server-side balance updates.
-   [ ] Add transaction status tracking.

## Phase 5 --- Buy and sell functionality

-   [ ] Complete the buy coin interface.
-   [ ] Complete the sell coin interface.
-   [ ] Fetch current coin prices before executing trades.
-   [ ] Calculate NGN equivalent amounts.
-   [ ] Implement minimum and maximum trade limits.
-   [ ] Implement transaction fees, if applicable.
-   [ ] Validate available wallet balances.
-   [ ] Create backend buy transaction endpoint.
-   [ ] Create backend sell transaction endpoint.
-   [ ] Implement atomic wallet balance updates.
-   [ ] Save every trade in MongoDB.
-   [ ] Generate unique trade references.
-   [ ] Display trade confirmation.
-   [ ] Handle failed and pending trades.
-   [ ] Prevent duplicate trade submissions.

## Phase 6 --- Transaction management

-   [ ] Build the transaction history page.
-   [ ] Display buy transactions.
-   [ ] Display sell transactions.
-   [ ] Display deposits and withdrawals.
-   [ ] Add transaction status indicators.
-   [ ] Implement transaction filtering.
-   [ ] Implement date filtering.
-   [ ] Add transaction details pages.
-   [ ] Implement pagination.
-   [ ] Add downloadable transaction receipts.

## Phase 7 --- Dashboard and user experience

-   [ ] Display actual wallet balances.
-   [ ] Display total portfolio value in NGN.
-   [ ] Display supported coins.
-   [ ] Add market overview cards.
-   [ ] Add coin price charts.
-   [ ] Add recent transactions.
-   [ ] Add portfolio statistics.
-   [ ] Implement the balance visibility toggle.
-   [ ] Add loading skeletons.
-   [ ] Add empty states.
-   [ ] Improve mobile responsiveness.
-   [ ] Add notifications and alerts.
-   [ ] Improve error messages and form feedback.

## Phase 8 --- Security, testing, and deployment

-   [ ] Validate all backend request bodies.
-   [ ] Implement API rate limiting.
-   [ ] Configure secure CORS.
-   [ ] Secure environment variables.
-   [ ] Implement proper authorization checks.
-   [ ] Test wallet balance consistency.
-   [ ] Test simultaneous trade requests.
-   [ ] Test WebSocket reconnection.
-   [ ] Test invalid trade amounts.
-   [ ] Test failed API requests.
-   [ ] Test authentication and protected routes.
-   [ ] Add backend logging.
-   [ ] Deploy the backend.
-   [ ] Deploy the frontend.
-   [ ] Configure production environment variables.
-   [ ] Configure production MongoDB.
-   [ ] Test the deployed application.

------------------------------------------------------------------------

## Recommended development order

1.  [ ] Fix live market performance.
2.  [ ] Complete market subscriptions.
3.  [ ] Finish NGN conversion.
4.  [ ] Complete authentication.
5.  [ ] Build the wallet backend.
6.  [ ] Implement buy/sell functionality.
7.  [ ] Build transaction history.
8.  [ ] Improve the dashboard.
9.  [ ] Complete security and testing.
10. [ ] Deploy the application.

## Important development note

Keep trading in a simulated environment during development. Do not
enable real-money deposits, withdrawals, or trading until the wallet
ledger, transaction validation, authorization, and security controls
have been thoroughly implemented and tested.

## Progress tracking

Update this file as work is completed. Check off each task only after it
has been implemented and tested.
