import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  History,
  Settings,
  Menu,
  X,
  CircleDollarSign,
  Bell,
  UserRound,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Search,
  Download,
  Clock3,
  ShieldCheck,
  User,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Copy,
  LogOut,
  LogIn,
  Mail,
  Key,
  Phone,
} from "lucide-react";
import Logo from "./assets/tmrx-global-3.png"
import { useUser } from "./contexts/userProvider"
import { backendUrl } from "./constants/backendUrl";
import Swal from "sweetalert2"
import { BsPerson } from "react-icons/bs";
const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Buy / Sell", icon: ArrowLeftRight },
  { label: "Wallet", icon: Wallet },
  { label: "Transactions", icon: History },
  { label: "Settings", icon: Settings },
];

const coinRates = {
  USDT: 1330 + 100,
  BTC: 168450000,
  ETH: 6250000,
};

const marketCoins = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "₦168,450,000",
    change: "+2.45%",
    positive: true,
    color: "bg-orange-100 text-orange-600",
    icon: "₿",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: "₦6,250,000",
    change: "+1.82%",
    positive: true,
    color: "bg-indigo-100 text-indigo-600",
    icon: "Ξ",
  },
  {
    name: "Tether",
    symbol: "USDT",
    price: "₦1,520",
    change: "-0.35%",
    positive: false,
    color: "bg-emerald-100 text-emerald-700",
    icon: "₮",
  },
];

const sampleTransactions = [
  {
    id: "CT-DEMO-001",
    type: "Deposit",
    description: "Wallet funding",
    amount: 25000,
    status: "Completed",
    date: "Example transaction",
  },
  {
    id: "CT-DEMO-002",
    type: "Buy",
    description: "USDT purchase",
    amount: -10000,
    status: "Completed",
    date: "Example transaction",
  },
  {
    id: "CT-DEMO-003",
    type: "Withdraw",
    description: "Bank withdrawal",
    amount: -5000,
    status: "Pending",
    date: "Example transaction",
  },
];

const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function App() {
  // Contexts
  const { user, userData, register, login } = useUser();

  // Authentication dialog state
  const [registerData, setRegisterData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [authEmail, setAuthEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const switchAuth = (next) => {
    setAuth(next);
    setAuthError("");
    setAuthSuccess("");
  };

  const closeAuth = () => {
    setAuth("");
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(false);
  };

  const requestAuth = async (path, payload) => {
    const response = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status === false) {
      throw new Error(data.message || data.error || "Request failed. Please try again.");
    }
    return data;
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      if (auth === "Login") {
        const data = await login({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        });
        if (!data || data.status === false) {
          throw new Error(data?.message || "Unable to log in. Please check your details.");
        }
        closeAuth();
        await Swal.fire({
          title: "Welcome back",
          text: data.message || "Login successful.",
          icon: "success",
        });
      } else if (auth === "Register") {
        const data = await register({
          ...registerData,
          fullname: registerData.fullname.trim(),
          email: registerData.email.trim().toLowerCase(),
          phone: registerData.phone.trim(),
        });
        if (!data || data.status === false) {
          throw new Error(data?.message || "Unable to create your account.");
        }
        setAuthEmail(registerData.email.trim().toLowerCase());
        setResetCode("");
        setAuthSuccess(data.message || "If registration was accepted, check your email for the verification code.");
        setAuth("Verify Email");
      } else if (auth === "Forgot Password") {
        const email = authEmail.trim().toLowerCase();
        await requestAuth("/auth/forgot-password", { email });
        setAuthEmail(email);
        setAuthSuccess("If an account exists for this email, a verification code has been sent.");
        setAuth("Verify Reset Code");
      } else if (auth === "Verify Email") {
        const data = await requestAuth("/auth/verify-email", {
          email: authEmail.trim().toLowerCase(),
          code: resetCode.trim(),
        });
        setAuthSuccess(data.message || "Email verified successfully. You can now log in.");
        setResetCode("");
        setAuth("Login");
      } else if (auth === "Verify Reset Code") {
        const data = await requestAuth("/auth/verify-reset-code", {
          email: authEmail.trim().toLowerCase(),
          code: resetCode.trim(),
        });
        if (!data.resetToken) throw new Error("The server did not return a reset token.");
        setResetToken(data.resetToken);
        setAuth("Reset Password");
      } else if (auth === "Reset Password") {
        if (newPassword.length < 8) throw new Error("Your new password must contain at least 8 characters.");
        if (newPassword !== confirmPassword) throw new Error("The passwords do not match.");
        const data = await requestAuth("/auth/reset-password", {
          email: authEmail.trim().toLowerCase(),
          resetToken,
          password: newPassword,
        });
        setAuthSuccess(data.message || "Password reset successfully. You can now log in.");
        setLoginData((current) => ({ ...current, email: authEmail, password: "" }));
        setNewPassword("");
        setConfirmPassword("");
        setResetCode("");
        setResetToken("");
        setAuth("Login");
      }
    } catch (error) {
      setAuthError(error.message || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendCode = async () => {
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);
    try {
      const path = auth === "Verify Email" ? "/auth/resend-verification-code" : "/auth/forgot-password";
      await requestAuth(path, { email: authEmail.trim().toLowerCase() });
      setAuthSuccess("If the email is eligible, a new code has been sent.");
    } catch (error) {
      setAuthError(error.message || "Unable to resend the code.");
    } finally {
      setAuthLoading(false);
    }
  };

  // States
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [tradeType, setTradeType] = useState("buy");
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [tradeAmount, setTradeAmount] = useState(0);
  const [walletAction, setWalletAction] = useState("");
  const [actionAmount, setActionAmount] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("All");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [auth, setAuth] = useState("");
  const [notifications, setNotifications] = useState({
    transactions: true,
    security: true,
    market: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
  });



  const coinAmount = Number(tradeAmount) || 0;
  const estimatedAmount = coinRates[selectedCoin] * coinAmount;

  const pageClass = "mx-auto max-w-[1400px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9";

  const goTo = (page) => {
    setActivePage(page);
    setMenuOpen(false);
    setActionMessage("");
  };

  const openWalletAction = (action) => {
    setWalletAction(action);
    setActionAmount("");
    setActionMessage("");
  };

  const closeWalletAction = () => {
    setWalletAction("");
    setActionAmount("");
    setActionMessage("");
  };

  const handleWalletAction = (event) => {
    event.preventDefault();

    if (!Number(actionAmount) || Number(actionAmount) <= 0) {
      setActionMessage("Enter a valid amount greater than zero.");
      return;
    }

    setActionMessage(
      "Preview only. No funds have moved. Payment and withdrawal processing will be connected later."
    );
  };

  const renderBalanceCard = (compact = false) => (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#153c2a] to-[#245b3b] text-white ${compact ? "p-6" : "p-6 sm:p-8"
        }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[#c6dace]">
          <Wallet size={19} />
          Available NGN balance
          {user !== null && <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="rounded-lg p-1 hover:bg-white/10"
            aria-label={balanceVisible ? "Hide balance" : "Show balance"}
          >
            {balanceVisible ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>}
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
          NGN Wallet
        </span>
      </div>

      {user !== null &&
        <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          {balanceVisible ? `₦${userData.wallet.toLocaleString()}` : "••••••"}
        </h2>
      }
      {user == null &&
        <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-4xl">Login to view balance</h2>
      }

      <p className="mt-2 text-xs text-[#c6dace]">
        Demo balance — not connected to a real account
      </p>

      {user !== null && <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={() => openWalletAction("Add Funds")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a4f2b7] px-5 py-3 text-sm font-bold text-[#102b20] transition hover:bg-[#c0f8cd]"
        >
          <Plus size={17} />
          Add funds
        </button>

        <button
          onClick={() => openWalletAction("Withdraw")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowUpRight size={17} />
          Withdraw
        </button>
      </div>}
    </div>
  );

  const renderMarketCards = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {marketCoins.map((coin) => (
        <div
          key={coin.symbol}
          className="rounded-2xl border border-[#e7ece8] bg-white p-5 transition hover:border-[#b6d9bf]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold ${coin.color}`}
              >
                {coin.icon}
              </div>

              <div>
                <h3 className="text-sm font-bold">{coin.name}</h3>
                <p className="mt-1 text-xs text-[#829087]">
                  {coin.symbol}
                </p>
              </div>
            </div>

            {coin.positive ? (
              <TrendingUp size={19} className="text-emerald-600" />
            ) : (
              <TrendingDown size={19} className="text-red-500" />
            )}
          </div>

          <p className="mt-6 text-xl font-bold tracking-tight">
            {coin.price}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-[#829087]">
              Example 24h change
            </span>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${coin.positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
                }`}
            >
              {coin.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTradeForm = () => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="rounded-2xl border border-[#e7ece8] bg-white p-5 sm:p-7 xl:col-span-2">
        <div className="grid grid-cols-2 rounded-xl bg-[#f3f6f3] p-1">
          {["buy", "sell"].map((type) => (
            <button
              key={type}
              onClick={() => setTradeType(type)}
              className={`rounded-lg py-3 text-sm font-semibold capitalize transition ${tradeType === type
                ? "bg-[#153c2a] text-white shadow-sm"
                : "text-[#829087] hover:text-[#17251e]"
                }`}
            >
              {type === "buy" ? "Buy Crypto" : "Sell Crypto"}
            </button>
          ))}
        </div>

        <div className="mt-7">
          <label
            htmlFor="coin"
            className="mb-2 block text-sm font-semibold"
          >
            Select cryptocurrency
          </label>

          <select
            id="coin"
            value={selectedCoin}
            onChange={(event) => setSelectedCoin(event.target.value)}
            className="w-full rounded-xl border border-[#dfe7e1] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#34834e]"
          >
            <option value="USDT">USDT — Tether</option>
            <option value="BTC">BTC — Bitcoin</option>
            <option value="ETH">ETH — Ethereum</option>
          </select>
        </div>

        <div className="mt-5">
          <label
            htmlFor="trade-amount"
            className="mb-2 block text-sm font-semibold"
          >
            Trade amount
          </label>

          <div className="flex items-center rounded-xl border border-[#dfe7e1] focus-within:border-[#34834e]">
            {/* <span className="pl-4 text-sm font-semibold text-[#64786a]">
              NGN
            </span> */}
            <input
              id="trade-amount"
              type="number"
              min="1"
              step="any"
              value={tradeAmount}
              onChange={(event) => setTradeAmount(event.target.value)}
              placeholder="Enter amount"
              className="w-full min-w-0 rounded-xl bg-transparent px-3 py-3.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#f5f9f5] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#64786a]">
              Estimated {tradeType === "buy" ? "naira amount to send" : "naira amount to receive"}
            </span>
            <span className="text-right text-base font-bold">
              {coinAmount > 0
                ? `${estimatedAmount.toLocaleString("en-US", {
                  maximumSignificantDigits: 8,
                })} NGN`
                : `0 NGN`}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#64786a]">
              Estimated {tradeType === "buy" ? "crypto to receive" : "crypto to send"}
            </span>
            <span className="text-right text-base font-bold">
              {coinAmount > 0
                ? `${coinAmount.toLocaleString("en-US", {
                  maximumSignificantDigits: 8,
                })} ${selectedCoin}`
                : `0 ${selectedCoin}`}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#e1ebe2] pt-3 text-xs text-[#829087]">
            <span>Crypto rate</span>
            <span>
              ₦{coinRates[selectedCoin].toLocaleString("en-NG")} /{" "}
              {selectedCoin}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (user == null) {
              Swal.fire({
                title: "",
                text: "Login to place an order",
                icon: "info"
              })
            } else {
              goTo("Order Preview")
            }

          }}
          disabled={!Number.isFinite(coinAmount) || coinAmount <= 0}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#153c2a] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#245b3b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftRight size={18} />
          Review {tradeType === "buy" ? "Buy" : "Sell"} Order
        </button>
      </div>

      <div className="h-fit rounded-2xl border border-[#e7ece8] bg-white p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8ef] text-[#34834e]">
          <Info size={22} />
        </div>

        <h3 className="mt-5 text-base font-bold">Before you trade</h3>

        <div className="mt-4 space-y-4 text-sm leading-6 text-[#64786a]">
          <p>
            <strong className="text-[#23372b]">Exchange rate</strong>
            <br />
            Sample rates are displayed for interface testing only.
          </p>

          <p>
            <strong className="text-[#23372b]">Payment and settlement</strong>
            <br />
            Real trades will require verified payment and appropriate crypto settlement.
          </p>

          <p>
            <strong className="text-[#23372b]">Order status</strong>
            <br />
            Pending, processing, completed, and failed states will be connected to the backend.
          </p>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          <RefreshCw size={16} className="mt-0.5 shrink-0" />
          Demo mode: no real transaction will be executed.
        </div>
      </div>
    </div>
  );

  const filteredTransactions = sampleTransactions.filter((transaction) => {
    const matchesFilter =
      transactionFilter === "All" ||
      transaction.type === transactionFilter;

    const search = transactionSearch.toLowerCase();
    const matchesSearch =
      transaction.id.toLowerCase().includes(search) ||
      transaction.description.toLowerCase().includes(search) ||
      transaction.type.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const renderDashboard = () => (
    <section className={pageClass}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#378a56]">
            YOUR CRYPTO SPACE
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#7c8980]">
            Manage your cryptocurrency in one place.
          </p>
        </div>

        <span className="rounded-full border border-[#dcece0] bg-[#f1faf3] px-3 py-2 text-xs font-medium text-[#35744a]">
          Preview mode
        </span>
      </div>

      <div className="relative mb-7 flex min-h-[220px] items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#153c2a] to-[#245b3b] p-6 text-white sm:p-9">
        <div className="relative z-10 max-w-xl">
          <p className="text-[10px] font-bold tracking-[2px] text-[#a4f2b7]">
            WELCOME TO TMRX GLOBAL
          </p>

          <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
            Your crypto journey starts here.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-6 text-[#c6dace]">
            Explore digital assets and manage your trading workspace.
          </p>

          <button
            onClick={() => goTo("Buy / Sell")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#a4f2b7] px-5 py-3 text-sm font-bold text-[#102b20] hover:bg-[#c0f8cd]"
          >
            Explore trading
            <ChevronRight size={17} />
          </button>
        </div>

        <CircleDollarSign
          size={100}
          strokeWidth={1}
          className="hidden shrink-0 text-[#a4f2b7]/70 sm:block"
        />
      </div>

      {renderBalanceCard()}

      <div className="mt-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Market overview</h2>
            <p className="mt-1 text-xs text-[#829087]">
              Example cryptocurrency prices in naira
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            Sample data
          </span>
        </div>
        {renderMarketCards()}
      </div>

      <div className="mt-9">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Quick navigation</h2>
          <span className="text-xs text-[#89958d]">Explore your workspace</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {navigation.slice(1).map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => goTo(label)}
              className="group flex items-center gap-4 rounded-2xl border border-[#e7ece8] bg-white p-5 text-left transition hover:border-[#9ad9aa] hover:shadow-lg hover:shadow-[#153c2a]/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf8ef] text-[#34834e]">
                <Icon size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs text-[#829087]">
                  Explore {label.toLowerCase()}
                </p>
              </div>
              <ChevronRight size={18} className="text-[#a1ada4]" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#e7ece8] bg-white p-4">
        <Info size={19} className="mt-0.5 shrink-0 text-[#34834e]" />
        <div>
          <p className="text-sm font-semibold">Demo environment</p>
          <p className="mt-1 text-xs leading-5 text-[#829087]">
            Prices, balances, and transactions are examples. Live market data,
            authentication, payments, and real transactions are not connected.
          </p>
        </div>
      </div>
    </section>
  );

  const renderWallet = () => (
    <section className={pageClass}>
      <div className="mb-7">
        <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#378a56]">
          YOUR MONEY
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">My Wallet</h1>
        <p className="mt-2 text-sm text-[#829087]">
          Manage your naira balance and explore supported assets.
        </p>
      </div>

      {renderBalanceCard()}


      <div className="mt-9">
        <div className="mb-5">
          <h2 className="text-lg font-bold">Supported assets</h2>
          <p className="mt-1 text-xs text-[#829087]">
            Illustrative prices in Nigerian naira
          </p>
        </div>
        {renderMarketCards()}
      </div>

      <div className="mt-9 rounded-2xl border border-[#e7ece8] bg-white p-6">
        <div className="flex items-center gap-3">
          <History size={22} className="text-[#34834e]" />
          <div>
            <h2 className="text-lg font-bold">Recent activity</h2>
            <p className="mt-1 text-xs text-[#829087]">
              Your wallet activity
            </p>
          </div>
        </div>

        {user !== null &&
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf8ef] text-[#34834e]">
              <Clock3 size={23} />
            </div>
            <h3 className="mt-4 text-sm font-bold">No real activity yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#829087]">
              Real deposits, withdrawals, and trades will appear here after the
              wallet backend is connected.
            </p>
            <button
              onClick={() => goTo("Transactions")}
              className="mt-5 text-sm font-semibold text-[#34834e] hover:underline"
            >
              View transaction history
            </button>
          </div>
        }
        {
          user == null &&
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf8ef] text-[#34834e]">
              <Info size={23} />
            </div>
            <h3 className="mt-4 text-sm font-bold">Access restricted</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#829087]">
              Login to view recent activities
            </p>
            <button
              onClick={() => setAuth("Login")}
              className="mt-5 text-sm font-semibold text-[#34834e] hover:underline"
            >
              Login
            </button>
          </div>
        }
      </div>
    </section>
  );

  const renderTransactions = () => (
    <section className={pageClass}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#378a56]">
            ACCOUNT RECORDS
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Transactions</h1>
          <p className="mt-2 text-sm text-[#829087]">
            Review deposits, withdrawals, and trades.
          </p>
        </div>

        <button
          onClick={() =>
            setActionMessage(
              "Export will be available when real transaction records are connected."
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          <Download size={17} />
          Export
        </button>
      </div>

      {actionMessage && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          {actionMessage}
        </div>
      )}

      <div className="rounded-2xl border border-[#e7ece8] bg-white p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#dfe7e1] px-4">
            <Search size={18} className="text-[#829087]" />
            <input
              value={transactionSearch}
              onChange={(event) => setTransactionSearch(event.target.value)}
              placeholder="Search reference or transaction"
              className="w-full py-3.5 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-[#829087]" />
            <select
              value={transactionFilter}
              onChange={(event) => setTransactionFilter(event.target.value)}
              className="w-full rounded-xl border border-[#dfe7e1] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#34834e]"
            >
              <option>All</option>
              <option>Deposit</option>
              <option>Withdraw</option>
              <option>Buy</option>
              <option>Sell</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <Info size={17} className="mt-0.5 shrink-0" />
          These are fictional examples for testing the interface, not actual account records.
        </div>

        <div className="mt-6 space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#edf0ed] p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf8ef] text-[#34834e]">
                  {transaction.type === "Deposit" ? (
                    <ArrowDownLeft size={21} />
                  ) : transaction.type === "Withdraw" ? (
                    <ArrowUpRight size={21} />
                  ) : (
                    <ArrowLeftRight size={21} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {transaction.description}
                  </p>
                  <p className="mt-1 text-xs text-[#829087]">
                    {transaction.date} · {transaction.id}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${transaction.amount > 0
                    ? "text-emerald-700"
                    : "text-[#23372b]"
                    }`}
                >
                  {transaction.amount > 0 ? "+" : "−"}
                  {formatNaira(Math.abs(transaction.amount)).slice(1)}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${transaction.status === "Completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                    }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center">
              <History size={28} className="mx-auto text-[#a1ada4]" />
              <p className="mt-3 text-sm font-semibold">No matching transactions</p>
              <p className="mt-1 text-xs text-[#829087]">
                Try another search term or filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className={pageClass}>
      <div className="mb-7">
        <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#378a56]">
          ACCOUNT PREFERENCES
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[#829087]">
          Manage your profile and interface preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="h-fit rounded-2xl border border-[#e7ece8] bg-white p-3">
          {[
            { label: "Profile", icon: User },
            { label: "Notifications", icon: Bell },
            { label: "Security", icon: ShieldCheck },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setSettingsTab(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition ${settingsTab === label
                ? "bg-[#edf8ef] text-[#245b3b]"
                : "text-[#64786a] hover:bg-gray-50"
                }`}
            >
              <Icon size={19} />
              {label}
              {settingsTab === label && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#e7ece8] bg-white p-5 sm:p-7 lg:col-span-3">
          {settingsTab === "Profile" && (
            <>
              <h2 className="text-lg font-bold">Profile information</h2>
              <p className="mt-1 text-sm text-[#829087]">
                Update the information displayed on your account.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setActionMessage(
                    "Profile preview saved locally for this session only. No account was updated on a server."
                  );
                }}
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full name
                  </label>
                  <input
                    value={userData.fullname}
                    // onChange={(event) =>
                    //   setProfile({ ...userData, fullname: event.target.value })
                    // }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#dfe7e1] px-4 py-3.5 text-sm outline-none focus:border-[#34834e]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    // onChange={(event) =>
                    //   setProfile({ ...userData, email: event.target.value })
                    // }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#dfe7e1] px-4 py-3.5 text-sm outline-none focus:border-[#34834e]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    // onChange={(event) =>
                    //   setProfile({ ...profile, phone: event.target.value })
                    // }
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-[#dfe7e1] px-4 py-3.5 text-sm outline-none focus:border-[#34834e]"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#153c2a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245b3b]"
                >
                  Save profile preview
                </button>
              </form>
            </>
          )}

          {settingsTab === "Notifications" && (
            <>
              <h2 className="text-lg font-bold">Notification preferences</h2>
              <p className="mt-1 text-sm text-[#829087]">
                Choose which updates you would like to receive.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    key: "transactions",
                    title: "Transaction updates",
                    description: "Deposit, withdrawal, and trade status updates.",
                  },
                  {
                    key: "security",
                    title: "Security alerts",
                    description: "Important account security notifications.",
                  },
                  {
                    key: "market",
                    title: "Market updates",
                    description: "Optional market and price notifications.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#edf0ed] p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#829087]">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(event) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#34834e]"
                    />
                  </label>
                ))}
              </div>

              <p className="mt-5 text-xs text-[#829087]">
                These preferences are currently stored only in the page state.
              </p>
            </>
          )}

          {settingsTab === "Security" && (
            <>
              <h2 className="text-lg font-bold">Security settings</h2>
              <p className="mt-1 text-sm text-[#829087]">
                Security controls will be connected to your account backend.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#edf0ed] p-4">
                <ShieldCheck size={22} className="shrink-0 text-[#34834e]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Two-factor authentication
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#829087]">
                    This visual setting does not activate real two-factor authentication.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactor}
                  onChange={(event) =>
                    setSecuritySettings({
                      ...securitySettings,
                      twoFactor: event.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 accent-[#34834e]"
                  aria-label="Toggle two-factor authentication preview"
                />
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                Never treat a frontend toggle as account protection. Authentication and security checks must be enforced by the backend.
              </div>
            </>
          )}

          {actionMessage && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm leading-5 text-emerald-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              {actionMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderOrderPreview = () => (
    <section className={pageClass}>
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => goTo("Buy / Sell")}
          className="mb-6 text-sm font-semibold text-[#34834e] hover:underline"
        >
          ← Back to Buy / Sell
        </button>

        <div className="rounded-2xl border border-[#e7ece8] bg-white p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf8ef] text-[#34834e]">
            <ArrowLeftRight size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Review your order</h1>
          <p className="mt-2 text-sm text-[#829087]">
            Check the details of your proposed trade.
          </p>

          <div className="mt-7 rounded-xl bg-[#f5f9f5] p-5">
            <p className="text-sm text-[#64786a]">
              {tradeType === "buy" ? "You are buying" : "You are selling"}
            </p>
            <p className="mt-2 text-2xl font-bold">{selectedCoin}</p>
            <p className="mt-1 text-sm text-[#64786a]">
              Coin amount:{" "}
              {coinAmount.toLocaleString("en-US", {
                maximumSignificantDigits: 8,
              })}{" "}
              {selectedCoin}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#829087]">Order type</span>
              <span className="font-semibold capitalize">{tradeType}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#829087]">Estimated Naira amount</span>
              <span className="font-semibold">{formatNaira(estimatedAmount)}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#829087]">Illustrative rate</span>
              <span className="font-semibold">
                ₦{coinRates[selectedCoin].toLocaleString("en-NG")} / {selectedCoin}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            <Info size={17} className="mt-0.5 shrink-0" />
            This is a demonstration preview. No order has been submitted, and no payment or cryptocurrency transfer has occurred.
          </div>

          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#153c2a] px-5 py-3.5 text-sm font-bold text-white opacity-60"
          >
            Confirm trade — backend required
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#17251e]">
      {menuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#102b20] px-5 py-7 text-white transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="mb-10 flex items-center gap-3 px-2">
          <CircleDollarSign size={28} className="text-[#a4f2b7]" />
          {/* <span className="text-xl font-bold tracking-tight">
            Coin<span className="text-[#a4f2b7]">Trade</span>
          </span> */}
          <img src={Logo} alt="" className="w-[90px]" />
          <button
            onClick={() => setMenuOpen(false)}
            className="ml-auto rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 px-3 text-[10px] font-bold tracking-[2px] text-[#93a99c]">
          MENU
        </p>

        <nav className="space-y-2">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => goTo(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activePage === label
                ? "bg-[#a4f2b7] font-semibold text-[#102b20]"
                : "text-[#c0d0c5] hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {activePage === label && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#315a43] text-sm font-bold text-[#c9f8d3]">
            CT
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">My Account</p>
            <p className="mt-1 text-xs text-[#a6b8ad]">Demo account</p>
          </div>
          <LogOut size={17} className="ml-auto text-[#a6b8ad]" />
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[250px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e7ece8] bg-white px-4 sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-[#e6ece7] p-2.5 hover:bg-gray-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#829087]">Pages</span>
              <span className="text-[#c1c9c3]">/</span>
              <span className="font-semibold">{activePage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user == null &&
              <>
                <button
                  onClick={() => setAuth("Login")}
                  className="relative rounded-xl border border-[#e6ece7] p-2.5 hover:bg-gray-50"
                  aria-label="Login"
                >
                  {/* <LogIn size={19} /> */}
                  Login
                </button>
              </>
            }
            {user !== null &&
              <>
                <button
                  onClick={() => goTo("Transactions")}
                  className="relative rounded-xl border border-[#e6ece7] p-2.5 hover:bg-gray-50"
                  aria-label="View transaction updates"
                >
                  <Bell size={19} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#42b96a]" />
                </button>
                <button
                  onClick={() => {
                    setSettingsTab("Profile");
                    goTo("Settings");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#e6ece7] px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <UserRound size={18} />
                  <span className="hidden sm:inline">Account</span>
                </button>
              </>
            }
          </div>
        </header>

        {activePage === "Dashboard" && renderDashboard()}
        {activePage === "Buy / Sell" && (
          <section className={pageClass}>
            <div className="mb-7">
              <p className="mb-2 text-[10px] font-bold tracking-[2px] text-[#378a56]">
                TRADE CENTER
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">Buy & Sell Crypto</h1>
              <p className="mt-2 text-sm text-[#829087]">
                Choose an asset and calculate your estimated trade.
              </p>
            </div>
            {renderTradeForm()}
          </section>
        )}
        {activePage === "Wallet" && renderWallet()}
        {activePage === "Transactions" && renderTransactions()}
        {activePage === "Settings" && renderSettings()}
        {activePage === "Order Preview" && renderOrderPreview()}

        <footer className="px-4 pb-8 text-center text-xs text-[#98a39b]">
          TMRX Global · Demo interface · Not connected to real funds
        </footer>
      </main>
      {/* Authentication dialogs */}
      {auth !== "" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-2xl border border-[#e7ece8] bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf8ef] text-[#34834e]">
                  {auth.includes("Password") ? <Key size={21} /> : auth.includes("Verify") ? <ShieldCheck size={21} /> : auth === "Register" ? <UserRound size={21} /> : <LogIn size={21} />}
                </div>
                <h2 className="text-xl font-bold text-[#17251e]">
                  {auth === "Login" ? "Welcome back" : auth === "Register" ? "Create your account" : auth === "Forgot Password" ? "Forgot password?" : auth === "Verify Email" ? "Verify your email" : auth === "Verify Reset Code" ? "Verify reset code" : "Create a new password"}
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#829087]">
                  {auth === "Login" ? "Sign in to continue to TMRX Global." : auth === "Register" ? "Enter your details to get started." : auth === "Forgot Password" ? "We'll email you a code if an account matches." : auth === "Verify Email" ? `Enter the code sent to ${authEmail}.` : auth === "Verify Reset Code" ? `Enter the password-reset code sent to ${authEmail}.` : "Choose a strong password you have not used before."}
                </p>
              </div>
              <button type="button" onClick={closeAuth} className="rounded-lg p-2 text-[#64786a] hover:bg-gray-100" aria-label="Close dialog"><X size={20} /></button>
            </div>

            {authError && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{authError}</span></div>}
            {authSuccess && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span>{authSuccess}</span></div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {auth === "Login" && <>
                <div><label htmlFor="login-email" className="mb-2 block text-sm font-semibold">Email address</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Mail size={18} className="shrink-0 text-[#64786a]" /><input id="login-email" type="email" autoComplete="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="you@example.com" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div><label htmlFor="login-password" className="mb-2 block text-sm font-semibold">Password</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Key size={18} className="shrink-0 text-[#64786a]" /><input id="login-password" type="password" autoComplete="current-password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter your password" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div className="flex justify-end"><button type="button" onClick={() => { setAuthEmail(loginData.email); switchAuth("Forgot Password"); }} className="text-sm font-semibold text-[#34834e] hover:underline">Forgot password?</button></div>
                <button type="submit" disabled={authLoading} className="w-full rounded-xl bg-[#153c2a] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#245b3b] disabled:cursor-not-allowed disabled:opacity-60">{authLoading ? "Please wait…" : "Login"}</button>
                <p className="text-center text-sm text-[#64786a]">New to TMRX Global? <button type="button" onClick={() => switchAuth("Register")} className="font-bold text-[#34834e] hover:underline">Create an account</button></p>
              </>}

              {auth === "Register" && <>
                <div><label htmlFor="register-fullname" className="mb-2 block text-sm font-semibold">Full name</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><UserRound size={18} className="shrink-0 text-[#64786a]" /><input id="register-fullname" autoComplete="name" value={registerData.fullname} onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })} placeholder="Your full name" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div><label htmlFor="register-email" className="mb-2 block text-sm font-semibold">Email address</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Mail size={18} className="shrink-0 text-[#64786a]" /><input id="register-email" type="email" autoComplete="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="you@example.com" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div><label htmlFor="register-phone" className="mb-2 block text-sm font-semibold">Phone number</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Phone size={18} className="shrink-0 text-[#64786a]" /><input id="register-phone" type="tel" autoComplete="tel" value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} placeholder="Phone number" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div><label htmlFor="register-password" className="mb-2 block text-sm font-semibold">Password</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Key size={18} className="shrink-0 text-[#64786a]" /><input id="register-password" type="password" autoComplete="new-password" minLength={8} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="At least 8 characters" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <button type="submit" disabled={authLoading} className="w-full rounded-xl bg-[#153c2a] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#245b3b] disabled:cursor-not-allowed disabled:opacity-60">{authLoading ? "Creating account…" : "Create account"}</button>
                <p className="text-center text-sm text-[#64786a]">Already registered? <button type="button" onClick={() => switchAuth("Login")} className="font-bold text-[#34834e] hover:underline">Log in</button></p>
              </>}

              {auth === "Forgot Password" && <>
                <div><label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold">Email address</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Mail size={18} className="shrink-0 text-[#64786a]" /><input id="forgot-email" type="email" autoComplete="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <button type="submit" disabled={authLoading} className="w-full rounded-xl bg-[#153c2a] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#245b3b] disabled:opacity-60">{authLoading ? "Sending code…" : "Send verification code"}</button>
                <button type="button" onClick={() => switchAuth("Login")} className="w-full py-2 text-sm font-semibold text-[#34834e] hover:underline">Back to login</button>
              </>}

              {(auth === "Verify Email" || auth === "Verify Reset Code") && <>
                <div><label htmlFor="verification-code" className="mb-2 block text-sm font-semibold">Verification code</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><ShieldCheck size={18} className="shrink-0 text-[#64786a]" /><input id="verification-code" inputMode="numeric" autoComplete="one-time-code" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Enter code from email" className="w-full px-3 py-3.5 text-sm tracking-[0.2em] outline-none" required /></div></div>
                <button type="submit" disabled={authLoading} className="w-full rounded-xl bg-[#153c2a] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#245b3b] disabled:opacity-60">{authLoading ? "Verifying…" : auth === "Verify Email" ? "Verify email" : "Verify code"}</button>
                <button type="button" disabled={authLoading} onClick={handleResendCode} className="w-full py-2 text-sm font-semibold text-[#34834e] hover:underline disabled:opacity-60">Resend code</button>
                <button type="button" onClick={() => switchAuth(auth === "Verify Email" ? "Register" : "Forgot Password")} className="w-full text-sm text-[#829087] hover:underline">Use a different email</button>
              </>}

              {auth === "Reset Password" && <>
                <div><label htmlFor="new-password" className="mb-2 block text-sm font-semibold">New password</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Key size={18} className="shrink-0 text-[#64786a]" /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold">Confirm new password</label><div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]"><Key size={18} className="shrink-0 text-[#64786a]" /><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" className="w-full px-3 py-3.5 text-sm outline-none" required /></div></div>
                <button type="submit" disabled={authLoading} className="w-full rounded-xl bg-[#153c2a] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#245b3b] disabled:opacity-60">{authLoading ? "Resetting password…" : "Reset password"}</button>
              </>}
            </form>
          </div>
        </div>
      )}
      {/* Add funds / Withdraw dialog */}
      {walletAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{walletAction}</h2>
                <p className="mt-1 text-sm text-[#829087]">
                  NGN wallet · Demo mode
                </p>
              </div>
              <button
                onClick={closeWalletAction}
                className="rounded-lg p-2 text-[#64786a] hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalletAction} className="mt-6">
              <label
                htmlFor="wallet-action-amount"
                className="mb-2 block text-sm font-semibold"
              >
                Amount in naira
              </label>
              <div className="flex items-center rounded-xl border border-[#dfe7e1] px-4 focus-within:border-[#34834e]">
                <span className="text-sm font-semibold text-[#64786a]">₦</span>
                <input
                  id="wallet-action-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={actionAmount}
                  onChange={(event) => {
                    setActionAmount(event.target.value);
                    setActionMessage("");
                  }}
                  placeholder="0.00"
                  className="w-full px-3 py-3.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <Info size={17} className="mt-0.5 shrink-0" />
                This form is a UI preview only. No payment, bank transfer, or withdrawal will be initiated.
              </div>

              {actionMessage && (
                <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm leading-5 text-blue-800">
                  {actionMessage}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeWalletAction}
                  className="flex-1 rounded-xl border border-[#dfe7e1] px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#153c2a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245b3b]"
                >
                  Preview request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
