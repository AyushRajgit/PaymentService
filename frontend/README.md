# Payment Service frontend

Razorpay-inspired React dashboard connected to the Spring Boot payment APIs.

## Run locally

1. Start the backend on `http://localhost:8080`.
2. From this folder, run `npm install` and then `npm run dev`.

Vite proxies the controller paths (such as `/amazonPay/auth/login`) directly to `http://localhost:8080`, so there is no `/api` prefix. If the backend uses a different address, set `BACKEND_URL` in this folder's `.env`, for example `BACKEND_URL=http://localhost:8081`.

For deployment, serve `/amazonPay` through a same-origin reverse proxy to the backend. Alternatively, set `VITE_API_BASE_URL` to the backend URL and configure backend CORS to allow the frontend origin and the `PATCH` method. The current backend CORS configuration does not allow `PATCH`.

## API integration

The frontend sends the login JWT as `Authorization: Bearer <token>` for authenticated requests. It stores the token in `sessionStorage` and clears it on sign-out or when the backend returns `401`.

| Frontend action | Backend route |
| --- | --- |
| Register / sign in / sign out | `POST /amazonPay/auth/register`, `/login`, `/logout` |
| Load or create customer profile | `GET /amazonPay/Customer/getCustomer/{id}`, `POST /amazonPay/Customer/register` |
| List or add bank accounts | `GET /amazonPay/Customer/getAccountDetails/{id}`, `POST /amazonPay/Customer/addAccount` |
| Change account passkey | `PATCH /amazonPay/Customer/changePassKey?accountNumber=…&newPassKey=…` |
| Load paged statement | `GET /amazonPay/Customer/statement?pageNo=…&pageSize=…` |
| Transfer payment | `POST /amazonPay/transferPayment` |

The customer and account `GET` routes currently ignore their `{id}` path segment and use the authenticated email. The passkey form accepts the string account number required by the passkey endpoint.
