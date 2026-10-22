import { useEffect, useMemo, useRef, useState } from 'react'
import { api, API_BASE_URL } from './api'
import './App.css'

const TOKEN_KEY = 'payment-service.jwt'
const STATEMENT_PAGE_SIZE = 10

const navigation = [
  { key: 'overview', label: 'Overview', icon: 'overview' },
  { key: 'transfer', label: 'Transfer payment', icon: 'transfer' },
  { key: 'accounts', label: 'Bank accounts', icon: 'accounts' },
  { key: 'statements', label: 'Statements', icon: 'statement' },
  { key: 'profile', label: 'My profile', icon: 'profile' },
]

function Icon({ name, size = 18 }) {
  const shared = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const drawings = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    transfer: <><path d="M4 8h15l-3.5-3.5M20 16H5l3.5 3.5" /></>,
    accounts: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M7.5 15h3" /><path d="M7 5V3.5h10V5" /></>,
    statement: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6M9 16h6" /></>,
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.3 4.3" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    download: <><path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 17v3h15v-3" /></>,
    shield: <><path d="m12 3 7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m7 10 5 5 5-5" />,
    arrowUp: <><path d="M7 17 17 7M7 7h10v10" /></>,
    arrowDown: <><path d="M7 7 17 17M17 7v10H7" /></>,
    calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    logout: <><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 16l4-4-4-4M18 12H9" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 9M4 15l2.5 2a7 7 0 0 0 12-2" /></>,
    alert: <><path d="M12 3 2.9 19a1.5 1.5 0 0 0 1.3 2.2h15.6a1.5 1.5 0 0 0 1.3-2.2L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg {...shared}>{drawings[name] || drawings.overview}</svg>
}

function Brand() {
  return <div className="brand-lockup"><span className="brand-symbol"><i /><i /></span><span>razorpay</span></div>
}

function getSavedToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const encoded = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(encoded))
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY)
      return null
    }
  } catch {
    sessionStorage.removeItem(TOKEN_KEY)
    return null
  }
  return token
}

function emailFromToken(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(encoded)).sub || ''
  } catch {
    return ''
  }
}

function formatRupees(value) {
  const number = Number(value || 0)
  return `₹ ${number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(value) {
  if (!value) return '—'
  const date = Array.isArray(value)
    ? new Date(value[0], (value[1] || 1) - 1, value[2] || 1, value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function maskAccount(number) {
  const value = String(number || '')
  return value.length > 4 ? `•••• ${value.slice(-4)}` : value
}

function AuthScreen({ onLogin, initialError = '' }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(initialError)
  const [notice, setNotice] = useState('')
  const isRegister = mode === 'register'

  useEffect(() => {
    if (initialError) setError(initialError)
  }, [initialError])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (isRegister) {
        await api.register(email.trim(), password)
        setMode('login')
        setPassword('')
        setNotice('Your login is ready. Sign in to continue.')
      } else {
        const result = await api.login(email.trim(), password)
        if (!result?.token) throw new Error('The backend did not return a login token.')
        onLogin(result.token)
      }
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-showcase">
        <div className="auth-showcase-top"><Brand /><span className="demo-label">PAYMENT SERVICE</span></div>
        <div className="showcase-copy">
          <span className="showcase-kicker"><i /> PAYMENTS, MADE SIMPLE</span>
          <h1>Move your business<br />forward with every<br /><span>payment.</span></h1>
          <p>One clear view for your transfers, accounts and payment activity.</p>
        </div>
        <div className="showcase-card" aria-hidden="true">
          <div className="showcase-card-top"><span><i className="showcase-live-dot" /> PAYMENT OVERVIEW</span><span>•••</span></div>
          <div className="showcase-card-total">₹ 2,48,650 <small>+12.8%</small></div>
          <div className="showcase-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="showcase-card-bottom"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          <div className="showcase-payment"><span className="showcase-payment-icon"><Icon name="arrowDown" size={15} /></span><span><strong>Payment received</strong><small>Today, 10:42 AM</small></span><b>+ ₹ 12,500</b></div>
        </div>
        <div className="showcase-foot"><span><Icon name="shield" size={15} /> A simpler way to manage money</span><span>Trusted by businesses across India</span></div>
      </section>

      <main className="auth-main">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-form-wrap">
          <div className="auth-welcome"><span className="auth-spark">✦</span><h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2><p>{isRegister ? 'Get started with your payment dashboard.' : 'Sign in to manage your payments and accounts.'}</p></div>
          <div className="auth-tabs" role="tablist" aria-label="Login or register">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'auth-tab auth-tab-active' : 'auth-tab'} onClick={() => { setMode('login'); setError(''); setNotice('') }}>Sign in</button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'auth-tab auth-tab-active' : 'auth-tab'} onClick={() => { setMode('register'); setError(''); setNotice('') }}>Create account</button>
          </div>
          {error && <div className="form-alert form-alert-error"><Icon name="alert" size={16} />{error}</div>}
          {notice && <div className="form-alert form-alert-success"><Icon name="check" size={16} />{notice}</div>}
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="auth-email">Email address</label>
            <input id="auth-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <div className="password-label"><label htmlFor="auth-password">Password</label>{!isRegister && <span>Protected with encryption</span>}</div>
            <input id="auth-password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {isRegister && <p className="field-help">Use a strong password you don’t use elsewhere.</p>}
            <button className="primary-button auth-submit" disabled={busy}>{busy ? <span className="button-spinner" /> : null}{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in securely'}<Icon name="chevron" size={16} /></button>
          </form>
          {!isRegister && <>
            <div className="auth-divider"><span>or</span></div>
            <button
              type="button"
              className="google-login-button"
              onClick={() => window.location.assign(`${API_BASE_URL}/amazonPay/auth/oauth2/authorization/google`)}
            >
              <span className="google-mark" aria-hidden="true">G</span>
              Continue with Google
            </button>
          </>}
          <div className="auth-secure-note"><Icon name="shield" size={16} /><span>Your session is protected by your backend’s JWT authentication.</span></div>
          <p className="auth-api-note">Using backend routes <code>{API_BASE_URL || '/amazonPay/*'}</code></p>
        </div>
        <div className="auth-legal">© 2026 Razorpay-inspired payment service <span>·</span> Secure access</div>
      </main>
    </div>
  )
}

function ProfileSetup({ email, onCreated, notify }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onCreated({ firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim() })
      notify('Customer profile created')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="setup-wrap">
      <div className="setup-card">
        <div className="setup-icon"><Icon name="profile" size={23} /></div>
        <span className="overline">ONE-TIME SETUP</span>
        <h2>Set up your customer profile</h2>
        <p>This profile is linked to <strong>{email}</strong> and is needed before you can add accounts or make transfers.</p>
        {error && <div className="form-alert form-alert-error"><Icon name="alert" size={16} />{error}</div>}
        <form className="stacked-form" onSubmit={submit}>
          <div className="two-fields">
            <div><label htmlFor="first-name">First name</label><input id="first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} minLength={5} maxLength={20} required placeholder="At least 5 characters" /></div>
            <div><label htmlFor="last-name">Last name</label><input id="last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} minLength={5} maxLength={20} required placeholder="At least 5 characters" /></div>
          </div>
          <div><label htmlFor="phone-number">Phone number</label><input id="phone-number" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} maxLength={15} required placeholder="Your contact number" /></div>
          <button className="primary-button" disabled={busy}>{busy ? <span className="button-spinner" /> : null}{busy ? 'Saving profile…' : 'Create my profile'}<Icon name="chevron" size={16} /></button>
        </form>
      </div>
    </section>
  )
}

function StatusBadge({ status }) {
  const normalized = String(status || 'PENDING').toLowerCase()
  return <span className={`status-badge status-${normalized}`}><i />{String(status || 'PENDING').replaceAll('_', ' ')}</span>
}

function StatementTable({ rows, compact = false }) {
  if (!rows.length) return <div className="empty-state"><span className="empty-icon"><Icon name="statement" size={20} /></span><strong>No transactions yet</strong><p>Your transfers will appear here after your first payment.</p></div>
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>TRANSACTION</th><th>DATE & TIME</th><th>FROM / TO</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
        <tbody>{rows.map((row, index) => (
          <tr key={row.transactionId || `${row.dateAndTime}-${index}`}>
            <td><span className="transaction-id">{row.transactionId || `Transaction ${index + 1}`}</span><small className="transaction-banks">{row.sendersBankName || 'Sender'} → {row.receiversBankName || 'Receiver'}</small></td>
            <td className="muted-cell">{formatDate(row.dateAndTime)}</td>
            <td><span className="counterparty">{row.senderName || '—'} <small>to</small> {row.receiverName || '—'}</span></td>
            <td className="table-amount">{formatRupees(row.amount)}</td>
            <td><StatusBadge status={row.status} /></td>
          </tr>
        ))}</tbody>
      </table>
      {compact && <div className="table-compact-foot">Showing the latest {rows.length} transactions</div>}
    </div>
  )
}

function AccountCard({ account, index }) {
  const bankName = account.bankName || 'Bank account'
  return (
    <article className="account-card">
      <div className="account-card-top"><span className={`bank-monogram bank-monogram-${index % 3}`}>{bankName.slice(0, 1).toUpperCase()}</span><span className="account-connected"><i /> Active</span></div>
      <div className="account-bank-name">{bankName}</div>
      <div className="account-number">{maskAccount(account.bankAccountNumber)}</div>
      <div className="account-balance-line"><span>Available balance</span><strong>{formatRupees(account.balance)}</strong></div>
    </article>
  )
}

function OverviewPage({ profile, accounts, statements, goTo }) {
  const balance = accounts.reduce((total, account) => total + Number(account.balance || 0), 0)
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())
  return (
    <>
      <section className="dashboard-welcome">
        <div><span className="date-stamp"><Icon name="calendar" size={14} />{today}</span><h1>Welcome back, {profile?.firstName || 'there'} <span>✦</span></h1><p>Here’s a clear view of your accounts and recent activity.</p></div>
        <button className="primary-button welcome-action" onClick={() => goTo('transfer')}><Icon name="plus" size={17} /> Make a transfer</button>
      </section>
      <section className="stats-grid">
        <article className="stat-card stat-card-blue"><span className="stat-label">Total account balance</span><span className="stat-icon"><Icon name="accounts" /></span><strong>{formatRupees(balance)}</strong><small>Across {accounts.length} bank {accounts.length === 1 ? 'account' : 'accounts'}</small></article>
        <article className="stat-card"><span className="stat-label">Bank accounts</span><span className="stat-icon stat-icon-purple"><Icon name="accounts" /></span><strong>{accounts.length}</strong><small>Linked to your customer profile</small></article>
        <article className="stat-card"><span className="stat-label">Recent transactions</span><span className="stat-icon stat-icon-green"><Icon name="transfer" /></span><strong>{statements.length}</strong><small>In this statement page</small></article>
        <article className="stat-card"><span className="stat-label">Customer profile</span><span className="stat-icon stat-icon-amber"><Icon name="profile" /></span><strong className="profile-stat">{profile?.firstName || 'Ready'} {profile?.lastName || ''}</strong><small>{profile?.phoneNumber || 'Profile connected'}</small></article>
      </section>
      <section className="overview-columns">
        <div className="panel account-panel">
          <div className="panel-title-row"><div><span className="overline">YOUR MONEY</span><h2>Bank accounts</h2><p>Balances returned by your account API</p></div><button className="plain-action" onClick={() => goTo('accounts')}>Manage accounts <Icon name="chevron" size={15} /></button></div>
          {accounts.length ? <div className="account-card-grid">{accounts.slice(0, 2).map((account, index) => <AccountCard key={`${account.bankAccountNumber}-${index}`} account={account} index={index} />)}</div> : <div className="inline-empty"><div className="empty-icon"><Icon name="accounts" size={19} /></div><div><strong>No bank account linked yet</strong><p>Add an account to start receiving and sending payments.</p></div><button className="outline-action" onClick={() => goTo('accounts')}>Add account</button></div>}
        </div>
        <div className="panel balance-panel">
          <div className="panel-title-row"><div><span className="overline">QUICK ACTIONS</span><h2>Move money</h2><p>Use your own linked account as the sender.</p></div><span className="quick-action-mark"><Icon name="transfer" /></span></div>
          <button className="quick-action-row" onClick={() => goTo('transfer')}><span className="quick-action-icon"><Icon name="arrowUp" size={17} /></span><span><strong>Transfer payment</strong><small>Send money to another account</small></span><Icon name="chevron" size={16} /></button>
          <button className="quick-action-row" onClick={() => goTo('statements')}><span className="quick-action-icon quick-action-icon-lilac"><Icon name="statement" size={17} /></span><span><strong>View statement</strong><small>Review your recent transactions</small></span><Icon name="chevron" size={16} /></button>
          <div className="settlement-note"><Icon name="shield" size={15} /><span>Transfers require your account passkey.</span></div>
        </div>
      </section>
      <section className="panel statement-panel">
        <div className="panel-title-row"><div><span className="overline">LATEST ACTIVITY</span><h2>Recent transactions</h2><p>Transactions involving your customer profile</p></div><button className="plain-action" onClick={() => goTo('statements')}>Full statement <Icon name="chevron" size={15} /></button></div>
        <StatementTable rows={statements.slice(0, 5)} compact />
      </section>
    </>
  )
}

function TransferPage({ accounts, onTransfer }) {
  const [sender, setSender] = useState(accounts[0]?.bankAccountNumber || '')
  const [recipient, setRecipient] = useState('')
  const [passKey, setPassKey] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!sender && accounts[0]?.bankAccountNumber) setSender(accounts[0].bankAccountNumber)
  }, [accounts, sender])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const response = await onTransfer({
        sendersBankAccountNumber: sender,
        recipientsBankAccountNumber: recipient.trim(),
        passKey: Number(passKey),
        amount: Number(amount),
      })
      setResult(response)
      setPassKey('')
      setAmount('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-intro"><span className="overline">PAYMENTS</span><h1>Transfer payment</h1><p>Send money from one of your linked accounts to another account.</p></div>
      <div className="transfer-layout">
        <form className="panel form-panel" onSubmit={submit}>
          {error && <div className="form-alert form-alert-error"><Icon name="alert" size={16} />{error}</div>}
          {result && <div className="form-alert form-alert-success"><Icon name="check" size={16} /><span>{result.Message || result.message || 'Payment successful'}{result.currentBalance != null && <strong> · New balance {formatRupees(result.currentBalance)}</strong>}</span></div>}
          <div className="form-panel-heading"><span className="form-section-icon"><Icon name="arrowUp" size={17} /></span><div><h2>Payment details</h2><p>All fields are sent to the transfer API.</p></div></div>
          {accounts.length === 0 ? <div className="form-alert form-alert-info"><Icon name="alert" size={16} />Add a bank account first. New demo accounts start with ₹10,000.</div> : <>
            <div className="form-field"><label htmlFor="sender-account">Send from</label><select id="sender-account" value={sender} onChange={(event) => setSender(event.target.value)} required><option value="" disabled>Select one of your accounts</option>{accounts.map((account, index) => <option key={`${account.bankAccountNumber}-${index}`} value={account.bankAccountNumber}>{account.bankName} · {maskAccount(account.bankAccountNumber)} · {formatRupees(account.balance)}</option>)}</select></div>
            <div className="form-field"><label htmlFor="recipient-account">Recipient account number</label><input id="recipient-account" value={recipient} onChange={(event) => setRecipient(event.target.value)} maxLength={8} required placeholder="Enter recipient account number" /><small>Up to 8 characters, as required by your backend.</small></div>
            <div className="two-fields">
              <div className="form-field"><label htmlFor="transfer-amount">Amount (INR)</label><div className="money-input"><span>₹</span><input id="transfer-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" /></div></div>
              <div className="form-field"><label htmlFor="transfer-passkey">Account passkey</label><input id="transfer-passkey" type="password" inputMode="numeric" value={passKey} onChange={(event) => setPassKey(event.target.value)} required placeholder="Enter passkey" /></div>
            </div>
            <div className="transfer-hint"><Icon name="shield" size={16} /><span>Your JWT identifies you to the API. The sender account is checked against your signed-in email.</span></div>
            <button className="primary-button full-button" disabled={busy}>{busy ? <span className="button-spinner" /> : <Icon name="transfer" size={17} />}{busy ? 'Processing transfer…' : 'Transfer securely'}</button>
          </>}
        </form>
        <aside className="panel transfer-info">
          <span className="info-illustration"><Icon name="shield" size={25} /></span><h2>Before you transfer</h2>
          <ul><li><span>1</span><p>Choose one of your linked accounts as the sender.</p></li><li><span>2</span><p>Enter the recipient account number exactly.</p></li><li><span>3</span><p>Confirm the amount and enter your passkey.</p></li></ul>
          <div className="transfer-info-note"><strong>Insufficient balance?</strong><p>Your account balance is updated by the backend. Make sure it can cover the transfer amount.</p></div>
        </aside>
      </div>
    </section>
  )
}

function AccountsPage({ accounts, onAddAccount, onChangePassKey }) {
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [passKey, setPassKey] = useState('')
  const [passkeyAccountNumber, setPasskeyAccountNumber] = useState('')
  const [newPassKey, setNewPassKey] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showBalanceDialog, setShowBalanceDialog] = useState(false)

  async function addAccount(event) {
    event.preventDefault()
    setBusy('add')
    setError('')
    setNotice('')
    try {
      await onAddAccount({ bankName: bankName.trim(), bankAccountNumber: accountNumber.trim(), passKey: Number(passKey) })
      setNotice('Bank account created with a ₹10,000 demo starting balance.')
      setBankName('')
      setAccountNumber('')
      setPassKey('')
      setShowBalanceDialog(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  async function changePasskey(event) {
    event.preventDefault()
    setBusy('passkey')
    setError('')
    setNotice('')
    try {
      const message = await onChangePassKey(passkeyAccountNumber.trim(), Number(newPassKey))
      setNotice(typeof message === 'string' ? message : 'Passkey updated.')
      setPasskeyAccountNumber('')
      setNewPassKey('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="page-section">
      <div className="section-intro"><span className="overline">YOUR MONEY</span><h1>Bank accounts</h1><p>Accounts linked to your authenticated customer profile.</p></div>
      {error && <div className="form-alert form-alert-error page-alert"><Icon name="alert" size={16} />{error}</div>}
      {notice && <div className="form-alert form-alert-success page-alert"><Icon name="check" size={16} />{notice}</div>}
      {showBalanceDialog && <div className="demo-balance-backdrop">
        <section className="demo-balance-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-balance-title">
          <button className="demo-balance-close" type="button" aria-label="Close dialog" onClick={() => setShowBalanceDialog(false)}><Icon name="close" size={17} /></button>
          <span className="demo-balance-icon"><Icon name="check" size={22} /></span>
          <span className="overline">ACCOUNT CREATED</span>
          <h2 id="demo-balance-title">Your account is ready</h2>
          <p className="demo-balance-message">We added an <strong>initial demo balance</strong> because this app is <strong>not connected to a real bank API</strong>.</p>
          <strong className="demo-balance-amount">₹10,000.00</strong>
          <p className="demo-balance-disclaimer">This is demo money only. No real funds were deposited.</p>
          <button className="primary-button demo-balance-action" type="button" onClick={() => setShowBalanceDialog(false)}>View account balance</button>
        </section>
      </div>}
      <div className="account-card-grid account-list-grid">{accounts.map((account, index) => <AccountCard key={`${account.bankAccountNumber}-${index}`} account={account} index={index} />)}</div>
      <div className="account-forms-grid">
        <form className="panel form-panel" onSubmit={addAccount}>
          <div className="form-panel-heading"><span className="form-section-icon"><Icon name="plus" size={18} /></span><div><h2>Add a bank account</h2><p>Each new account receives a ₹10,000 demo starting balance.</p></div></div>
          <div className="form-field"><label htmlFor="bank-name">Bank name</label><input id="bank-name" value={bankName} onChange={(event) => setBankName(event.target.value)} required placeholder="e.g. HDFC Bank" /></div>
          <div className="form-field"><label htmlFor="new-account-number">Account number</label><input id="new-account-number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} maxLength={8} required placeholder="Up to 8 characters" /></div>
          <div className="form-field"><label htmlFor="new-account-passkey">Create passkey</label><input id="new-account-passkey" type="password" inputMode="numeric" value={passKey} onChange={(event) => setPassKey(event.target.value)} required placeholder="Enter a numeric passkey" /></div>
          <button className="primary-button full-button" disabled={busy !== ''}>{busy === 'add' ? <span className="button-spinner" /> : <Icon name="plus" size={17} />}{busy === 'add' ? 'Adding account…' : 'Add account'}</button>
        </form>
        <form className="panel form-panel" onSubmit={changePasskey}>
          <div className="form-panel-heading"><span className="form-section-icon form-section-icon-purple"><Icon name="shield" size={18} /></span><div><h2>Change account passkey</h2><p>Update the passkey used to authorize transfers.</p></div></div>
          <div className="form-alert form-alert-info passkey-contract-note"><Icon name="alert" size={16} /><span>Enter the 8-digit account number linked to your signed-in customer.</span></div>
          <div className="form-field"><label htmlFor="passkey-account-number">Account number</label><input id="passkey-account-number" type="text" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} value={passkeyAccountNumber} onChange={(event) => setPasskeyAccountNumber(event.target.value)} required placeholder="Enter 8-digit account number" /></div>
          <div className="form-field"><label htmlFor="replacement-passkey">New passkey</label><input id="replacement-passkey" type="password" inputMode="numeric" value={newPassKey} onChange={(event) => setNewPassKey(event.target.value)} required placeholder="Enter a new numeric passkey" /></div>
          <button className="outline-action full-button" disabled={busy !== ''}>{busy === 'passkey' ? <span className="button-spinner button-spinner-blue" /> : <Icon name="shield" size={17} />}{busy === 'passkey' ? 'Updating…' : 'Update passkey'}</button>
        </form>
      </div>
    </section>
  )
}

function StatementsPage({ rows, page, onPageChange, onRefresh, loading }) {
  const canGoNext = rows.length === STATEMENT_PAGE_SIZE
  return (
    <section className="page-section">
      <div className="section-intro section-intro-row"><div><span className="overline">ACCOUNT ACTIVITY</span><h1>Statements</h1><p>Transactions sent or received by your customer profile.</p></div><button className="outline-action" onClick={onRefresh} disabled={loading}><Icon name="refresh" size={16} /> Refresh</button></div>
      <div className="panel statement-page-panel"><StatementTable rows={rows} /><div className="statement-pagination"><span>Page {page + 1} · {rows.length} transaction{rows.length === 1 ? '' : 's'}</span><div><button onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0 || loading}>Previous</button><button onClick={() => onPageChange(page + 1)} disabled={!canGoNext || loading}>Next</button></div></div></div>
    </section>
  )
}

function ProfilePage({ profile, email }) {
  const fields = [
    ['First name', profile?.firstName],
    ['Last name', profile?.lastName],
    ['Phone number', profile?.phoneNumber],
    ['Login email', email],
  ]
  return (
    <section className="page-section">
      <div className="section-intro"><span className="overline">ACCOUNT SETTINGS</span><h1>My profile</h1><p>This information comes from your customer profile API.</p></div>
      <div className="panel profile-panel"><div className="profile-banner"><div className="profile-avatar">{`${profile?.firstName?.[0] || 'U'}${profile?.lastName?.[0] || ''}`.toUpperCase()}</div><div><span className="profile-connected"><i /> Connected to your login</span><h2>{profile?.firstName} {profile?.lastName}</h2><p>{email}</p></div></div><div className="profile-fields">{fields.map(([label, value]) => <div className="profile-field" key={label}><span>{label}</span><strong>{value || '—'}</strong></div>)}</div><div className="profile-info"><Icon name="shield" size={17} /><span>Your identity is taken from the validated JWT. The frontend does not send a customer ID to choose whose profile to load.</span></div></div>
    </section>
  )
}

function App() {
  const [token, setToken] = useState(getSavedToken)
  const [email, setEmail] = useState(() => getSavedToken() ? emailFromToken(getSavedToken()) : '')
  const [page, setPage] = useState('overview')
  const [profileStatus, setProfileStatus] = useState(() => getSavedToken() ? 'loading' : 'signed-out')
  const [profile, setProfile] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [statements, setStatements] = useState([])
  const [statementPage, setStatementPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [toast, setToast] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [oauthCompleting, setOAuthCompleting] = useState(() => window.location.pathname === '/oauth2/callback')
  const [oauthError, setOAuthError] = useState('')
  const oauthResultProcessed = useRef(false)

  const title = useMemo(() => navigation.find((item) => item.key === page)?.label || 'Overview', [page])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  function acceptLogin(nextToken) {
    sessionStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setEmail(emailFromToken(nextToken))
    setProfileStatus('loading')
    setPage('overview')
  }

  function clearSession(message = '') {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setEmail('')
    setProfile(null)
    setAccounts([])
    setStatements([])
    setProfileStatus('signed-out')
    setPage('overview')
    if (message) notify(message)
  }

  useEffect(() => {
    if (window.location.pathname !== '/oauth2/callback') return undefined
    if (oauthResultProcessed.current) return undefined
    oauthResultProcessed.current = true

    const fragmentParams = new URLSearchParams(window.location.hash.slice(1))
    const queryParams = new URLSearchParams(window.location.search)
    const nextToken = fragmentParams.get('token')
    const failed = fragmentParams.has('error') || queryParams.has('error')
    window.history.replaceState({}, document.title, '/')

    if (failed) {
      setOAuthError('Google sign-in could not be completed. Please try again.')
      setOAuthCompleting(false)
      return undefined
    }

    if (!nextToken) {
      setOAuthError('Google sign-in did not return a login token. Please try again.')
      setOAuthCompleting(false)
      return undefined
    }

    acceptLogin(nextToken)
    setOAuthCompleting(false)
    return undefined
  }, [])

  useEffect(() => {
    if (!token) return undefined
    let active = true

    async function load() {
      setLoading(true)
      setDataError('')
      try {
        let customer
        try {
          customer = await api.getCustomer(token)
        } catch (error) {
          if (error.status === 404) {
            if (active) {
              setProfile(null)
              setAccounts([])
              setStatements([])
              setProfileStatus('missing-profile')
            }
            return
          }
          throw error
        }

        if (!active) return
        setProfile(customer)
        setProfileStatus('ready')

        const [accountResult, statementResult] = await Promise.allSettled([
          api.getAccounts(token),
          api.getStatement(token, statementPage, STATEMENT_PAGE_SIZE),
        ])
        if (!active) return

        const sessionExpired = [accountResult, statementResult].some(
          (result) => result.status === 'rejected' && result.reason.status === 401,
        )
        if (sessionExpired) {
          clearSession('Your session expired. Please sign in again.')
          return
        }

        const errors = []
        if (accountResult.status === 'fulfilled') setAccounts(Array.isArray(accountResult.value) ? accountResult.value : [])
        else errors.push(`Accounts: ${accountResult.reason.message}`)
        if (statementResult.status === 'fulfilled') setStatements(Array.isArray(statementResult.value) ? statementResult.value : [])
        else errors.push(`Statement: ${statementResult.reason.message}`)
        if (errors.length) setDataError(errors.join(' · '))
      } catch (error) {
        if (!active) return
        if (error.status === 401) {
          clearSession('Your session expired. Please sign in again.')
          return
        }
        setProfileStatus('error')
        setDataError(error.message || 'Could not load your account data.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [token, statementPage, reloadKey])

  async function signOut() {
    const activeToken = token
    try {
      if (activeToken) await api.logout(activeToken)
    } catch {
      // The JWT is removed locally even if the stateless logout request cannot reach the server.
    }
    clearSession('You have signed out.')
  }

  function refreshData() {
    setStatementPage(0)
    setReloadKey((value) => value + 1)
  }

  async function createProfile(customer) {
    const created = await api.registerCustomer(token, customer)
    setProfile(created)
    setProfileStatus('ready')
    refreshData()
  }

  async function addAccount(account) {
    const response = await api.addAccount(token, account)
    try {
      const updatedAccounts = await api.getAccounts(token)
      if (Array.isArray(updatedAccounts)) setAccounts(updatedAccounts)
    } catch (error) {
      setDataError(`Account created, but the balance could not be refreshed: ${error.message}`)
    }
    return response
  }

  async function changePassKey(accountNumber, newPassKey) {
    const response = await api.changePassKey(token, accountNumber, newPassKey)
    return response
  }

  async function submitTransfer(payment) {
    const response = await api.transfer(token, payment)
    setStatementPage(0)
    setReloadKey((value) => value + 1)
    return response
  }

  if (oauthCompleting) {
    return <div className="oauth-callback-loading"><span className="large-spinner" /><strong>Completing Google sign-in…</strong></div>
  }

  if (!token) return <AuthScreen onLogin={acceptLogin} initialError={oauthError} />

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`app-sidebar${mobileMenuOpen ? ' app-sidebar-open' : ''}`}>
        <Brand />
        <div className="business-select"><span className="business-avatar">A</span><span><strong>Acme Retail</strong><small>Business account</small></span><Icon name="down" size={15} /></div>
        <nav className="app-navigation" aria-label="Main navigation"><span className="nav-caption">PAYMENTS</span>{navigation.map((item) => <button key={item.key} className={`app-nav-item${page === item.key ? ' app-nav-active' : ''}`} onClick={() => { setPage(item.key); setMobileMenuOpen(false) }}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.key === 'statements' && <small>{statements.length || ''}</small>}</button>)}</nav>
        <div className="sidebar-fill" />
        <div className="api-connection"><i /><span><strong>Backend routes</strong><small>{API_BASE_URL || '/amazonPay/*'}</small></span></div>
        <div className="sidebar-user"><span className="user-initials">{(email[0] || 'U').toUpperCase()}</span><span><strong>{email || 'Signed in'}</strong><small>Authenticated session</small></span><button aria-label="Sign out" title="Sign out" onClick={signOut}><Icon name="logout" size={17} /></button></div>
      </aside>

      <div className="app-main">
        <header className="app-topbar"><button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><Icon name="menu" /></button><div className="topbar-crumb"><span>Acme Retail</span><Icon name="chevron" size={14} /><strong>{title}</strong></div><div className="topbar-right"><span className="secure-indicator"><Icon name="shield" size={15} /> Secure session</span><button className="topbar-refresh" onClick={refreshData} disabled={loading} aria-label="Refresh backend data" title="Refresh"><Icon name="refresh" size={17} /></button><span className="topbar-avatar">{(email[0] || 'U').toUpperCase()}</span></div></header>

        <main className="app-content">
          {dataError && <div className="page-alert form-alert form-alert-error"><Icon name="alert" size={16} /><span>{dataError}</span><button onClick={() => setDataError('')} aria-label="Dismiss error"><Icon name="close" size={15} /></button></div>}
          {loading && profileStatus === 'loading' && <div className="loading-panel"><span className="large-spinner" /><strong>Connecting to your payment account…</strong><small>Loading your profile and account data from the backend.</small></div>}
          {profileStatus === 'missing-profile' && <ProfileSetup email={email} onCreated={createProfile} notify={notify} />}
          {profileStatus === 'error' && <div className="loading-panel error-panel"><span className="error-symbol"><Icon name="alert" size={22} /></span><strong>Could not load your payment account</strong><small>{dataError || 'Check the backend connection and try again.'}</small><button className="outline-action" onClick={refreshData}><Icon name="refresh" size={15} /> Try again</button></div>}
          {profileStatus === 'ready' && page === 'overview' && <OverviewPage profile={profile} accounts={accounts} statements={statements} goTo={setPage} />}
          {profileStatus === 'ready' && page === 'transfer' && <TransferPage accounts={accounts} onTransfer={submitTransfer} />}
          {profileStatus === 'ready' && page === 'accounts' && <AccountsPage accounts={accounts} onAddAccount={addAccount} onChangePassKey={changePassKey} />}
          {profileStatus === 'ready' && page === 'statements' && <StatementsPage rows={statements} page={statementPage} onPageChange={setStatementPage} onRefresh={refreshData} loading={loading} />}
          {profileStatus === 'ready' && page === 'profile' && <ProfilePage profile={profile} email={email} />}
          <footer className="app-footer"><span>© 2026 Razorpay-inspired payment service</span><span>Data is loaded from your authenticated backend APIs</span></footer>
        </main>
      </div>
      {toast && <div className="toast"><span><Icon name="check" size={15} /></span>{toast}</div>}
    </div>
  )
}

export default App
